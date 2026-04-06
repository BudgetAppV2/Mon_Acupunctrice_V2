const fs = require('fs/promises');
const path = require('path');
const bundle = require('../subtitle-lab/fabric-presets/canva-preset-svgs-bundle.json');
const mapping = require('../subtitle-lab/fabric-presets/canva-svg-page-mapping.json');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'lib', 'data', 'canvaPixelLineGeometry.json');
const PIXEL_SVG_DIR = path.join(ROOT_DIR, 'subtitle-lab', 'fabric-presets', 'Votre texte de paragraphe');

const MANUAL_PAGE_MATCHES = {
  5: 'preset-29-PlayfairDisplay-Montserrat.svg',
  8: 'preset-03-Lora-GlacialIndifference.svg',
  21: 'preset-15-Montserrat.svg',
  26: 'preset-22-PlayfairDisplay.svg',
  28: 'preset-24-PlayfairDisplay.svg',
  29: 'preset-25-LibreBaskerville.svg',
  30: 'preset-03-Lora-GlacialIndifference.svg',
  31: 'preset-27-GlacialIndifference.svg',
  32: 'preset-28-GlacialIndifference.svg',
  33: 'preset-31-Arimo.svg',
  37: 'preset-33-Lato.svg',
  38: 'preset-32-PlayfairDisplay.svg',
  39: 'preset-34-Lato.svg',
  41: 'preset-40-Montserrat.svg',
  43: 'preset-35-GlassAntiqua-JosefinSans.svg',
  46: 'preset-37-LibreBaskerville.svg',
  47: 'preset-29-PlayfairDisplay-Montserrat.svg',
  48: 'preset-40-Montserrat.svg',
  49: 'preset-18-Raleway-Exo2.svg',
  50: 'preset-29-PlayfairDisplay-Montserrat.svg',
  51: 'preset-15-Montserrat.svg',
  52: 'preset-34-Lato.svg',
  53: 'preset-24-PlayfairDisplay.svg',
  54: 'preset-22-PlayfairDisplay.svg',
  55: 'preset-36-Lora-Montserrat.svg',
  56: 'preset-16-DMSans-GreatVibes.svg',
  57: 'preset-09-GreatVibes-Lora.svg',
  58: 'preset-32-PlayfairDisplay.svg',
  59: 'preset-12-Fredoka-Quicksand.svg',
  60: 'preset-14-AbrilFatface-Montserrat.svg',
};

function normalizeFontName(name) {
  return name.toLowerCase().replace(/['"]/g, '').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildFontSignature(fonts) {
  return fonts.map(normalizeFontName).sort().join('|');
}

function extractFontsFromSvg(svg) {
  const fonts = svg.match(/data-fonts="([^"]+)"/)?.[1];
  return fonts ? fonts.split(',').map((font) => font.trim()) : [];
}

function countBundleLines(svg) {
  let count = 0;
  for (const match of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const tspans = [...match[2].matchAll(/<tspan\b[^>]*>[\s\S]*?<\/tspan>/g)];
    count += tspans.length > 0 ? tspans.length : 1;
  }
  return count;
}

const BUNDLE_KEYS = Object.keys(bundle);
const BUNDLE_KEYS_BY_SIGNATURE = BUNDLE_KEYS.reduce((acc, key) => {
  const signature = buildFontSignature(extractFontsFromSvg(bundle[key]));
  acc[signature] ??= [];
  acc[signature].push(key);
  return acc;
}, {});

function resolveBundleKey(preset) {
  if (MANUAL_PAGE_MATCHES[preset.pageNumber]) return MANUAL_PAGE_MATCHES[preset.pageNumber];

  const signature = buildFontSignature(preset.fonts);
  const matches = BUNDLE_KEYS_BY_SIGNATURE[signature] ?? [];
  if (matches.length === 1) return matches[0];

  throw new Error(`No bundle match for page ${preset.pageNumber} (${preset.presetName})`);
}

function extractTranslatePoints(svg) {
  return [...svg.matchAll(/transform="translate\(([-\d.]+),\s*([-\d.]+)\)"/g)]
    .map((match) => ({ x: Number.parseFloat(match[1]), y: Number.parseFloat(match[2]) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function extractViewBoxSize(svg) {
  const match = svg.match(/viewBox="[-\d.\s]+\s([-\d.]+)\s([-\d.]+)"/);
  return {
    width: match ? Number.parseFloat(match[1]) : 810,
    height: match ? Number.parseFloat(match[2]) : 1440,
  };
}

function buildBands(points, targetCount) {
  if (points.length < targetCount || targetCount <= 0) return [];

  const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
  const gaps = [];
  for (let i = 1; i < sorted.length; i += 1) {
    gaps.push({ index: i, gap: sorted[i].y - sorted[i - 1].y });
  }

  const splitIndexes = new Set(
    gaps
      .sort((a, b) => b.gap - a.gap || a.index - b.index)
      .slice(0, targetCount - 1)
      .map((item) => item.index),
  );

  const bands = [];
  let start = 0;
  for (let i = 1; i <= sorted.length; i += 1) {
    if (i === sorted.length || splitIndexes.has(i)) {
      bands.push(sorted.slice(start, i));
      start = i;
    }
  }

  return bands;
}

function summarizeBand(points) {
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const baselineY = points.reduce((sum, point) => sum + point.y, 0) / points.length;

  return {
    minX,
    maxX,
    minY,
    maxY,
    baselineY,
    count: points.length,
  };
}

async function main() {
  const result = {};

  for (const preset of mapping.presets) {
    const pixelSvg = await fs.readFile(path.join(PIXEL_SVG_DIR, `${preset.pageNumber}.svg`), 'utf8');
    const bundleKey = resolveBundleKey(preset);
    const targetLineCount = countBundleLines(bundle[bundleKey]);
    const points = extractTranslatePoints(pixelSvg);
    const bands = buildBands(points, targetLineCount);
    const viewBox = extractViewBoxSize(pixelSvg);

    result[preset.pageNumber] = {
      bundleKey,
      targetLineCount,
      points: points.length,
      sourceWidth: viewBox.width,
      sourceHeight: viewBox.height,
      lines: bands.map(summarizeBand),
    };
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Wrote ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
