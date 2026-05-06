// poc-compose-story.mjs
// POC story Instagram 1080x1920 — mode 'ressource' (CTA "Lire la suite")

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../..');
const BANK_DIR = path.join(REPO_ROOT, 'content/visual-bank');
const BG_DIR = path.join(BANK_DIR, 'backgrounds');
const LA_DIR = path.join(BANK_DIR, 'lineart');
const OUTPUT_DIR = path.join(BANK_DIR, '_poc-output');

const TEST_CONFIG = {
  pilier: process.argv[2] || 'grossesse',
  titre: process.argv[3] || 'Acupuncture pendant la grossesse',
  surtitre: 'Ressource',
  ctaMode: 'ressource',
  ctaLabel: 'Lire la suite',
};

const PALETTE = {
  beigeBg: '#F5F0E8',
  textDark: '#2C2A26',
  textMedium: '#5C5852',
  accentTaupeDark: '#6F8566',
  accentWarm: '#B8694A',
  accentTaupe: '#8A9A7B',
};

async function loadFont(url) {
  const css = await fetch(url).then((r) => r.text());
  const fontUrlMatch = css.match(/url\(([^)]+)\)/);
  if (!fontUrlMatch) throw new Error('Font URL not found in CSS');
  const fontUrl = fontUrlMatch[1].replace(/^https:/, 'https:');
  const fontResponse = await fetch(fontUrl);
  return Buffer.from(await fontResponse.arrayBuffer());
}

async function pickRandomFile(dir, exts = ['.jpg', '.jpeg', '.png']) {
  const files = await readdir(dir);
  const candidates = files.filter((f) =>
    exts.some((ext) => f.toLowerCase().endsWith(ext)) && !f.startsWith('.')
  );
  if (candidates.length === 0) throw new Error(`Aucun fichier dans ${dir}`);
  return path.join(dir, candidates[Math.floor(Math.random() * candidates.length)]);
}

async function findBestPlacementZone(bgPath) {
  const img = sharp(bgPath);
  const metadata = await img.metadata();
  const analysisWidth = 200;
  const analysisHeight = Math.round(metadata.height * (analysisWidth / metadata.width));

  const greyData = await img.clone().resize(analysisWidth, analysisHeight).greyscale().raw().toBuffer();

  const cols = 3, rows = 4;
  const cellW = Math.floor(analysisWidth / cols);
  const cellH = Math.floor(analysisHeight / rows);

  const zones = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const startX = col * cellW, startY = row * cellH;
      const endX = startX + cellW, endY = startY + cellH;

      let sum = 0, count = 0;
      const pixels = [];
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const lum = greyData[y * analysisWidth + x];
          sum += lum;
          pixels.push(lum);
          count++;
        }
      }
      const mean = sum / count;
      let variance = 0;
      for (const p of pixels) variance += (p - mean) ** 2;
      variance /= count;
      const stdDev = Math.sqrt(variance);

      const luminanceScore = Math.min(mean / 255, 1);
      const uniformityScore = Math.max(0, 1 - stdDev / 50);
      const baseScore = luminanceScore * 0.6 + uniformityScore * 0.4;

      let centerBias = 0;
      if (col === 1) centerBias = 0.30;
      else if (col === 2) centerBias = 0.05;
      else centerBias = -0.10;

      let verticalBias = 0;
      if (row === 1) verticalBias = 0.20;
      else if (row === 2) verticalBias = 0.05;

      const score = baseScore + centerBias + verticalBias;
      zones.push({ row, col, mean, stdDev, baseScore, centerBias, verticalBias, score });
    }
  }

  const candidates = zones.filter((z) => z.row === 1 || z.row === 2);
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  const xPercent = (best.col + 0.5) * (100 / cols);
  // Offset constant +7% pour pousser le line art plus bas dans la story
  // (libere de l'espace pour titre 140px qui peut prendre 30% de hauteur)
  const yPercent = (best.row + 0.5) * (100 / rows) + 7;

  return { row: best.row, col: best.col, xPercent, yPercent, score: best.score, debug: zones };
}

async function lineArtToTransparentPng(filepath, threshold = 235) {
  const original = sharp(filepath);
  const metadata = await original.metadata();
  const greyBuffer = await original.clone().greyscale().raw().toBuffer();

  const inkR = 0x2C, inkG = 0x2A, inkB = 0x26;
  const rgbaBuffer = Buffer.alloc(greyBuffer.length * 4);
  for (let i = 0; i < greyBuffer.length; i++) {
    const lum = greyBuffer[i];
    let alpha = 0;
    if (lum < threshold) alpha = Math.round(((threshold - lum) / threshold) * 255);
    rgbaBuffer[i * 4] = inkR;
    rgbaBuffer[i * 4 + 1] = inkG;
    rgbaBuffer[i * 4 + 2] = inkB;
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  return await sharp(rgbaBuffer, {
    raw: { width: metadata.width, height: metadata.height, channels: 4 },
  }).png().toBuffer();
}

async function fileToDataUrl(buf, mime = 'image/png') {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function jpgToDataUrl(filepath) {
  const buf = await readFile(filepath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

function buildStoryTemplate({ bgDataUrl, laDataUrl, surtitre, titre, width, height, placementX, placementY, ctaMode, ctaLabel }) {
  const ctaColor = ctaMode === 'reservation' ? PALETTE.accentWarm : PALETTE.accentTaupeDark;
  const laWidthPercent = 130;
  const laHeightPercent = 80;

  return {
    type: 'div',
    props: {
      style: {
        width, height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundImage: `url(${bgDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Inter',
      },
      children: [
        // Voile
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(180deg, rgba(245,240,232,0.65) 0%, rgba(245,240,232,0.10) 28%, rgba(245,240,232,0.05) 55%, rgba(245,240,232,0.30) 70%, rgba(245,240,232,0.75) 100%)',
              display: 'flex',
            },
          },
        },
        // Bloc TITRE
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '8%', top: '8%', width: '84%',
              display: 'flex', flexDirection: 'column', gap: 18,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 44, fontFamily: 'Inter', fontWeight: 600,
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: PALETTE.accentTaupeDark, display: 'flex',
                  },
                  children: surtitre,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 140, fontFamily: 'Cormorant', fontWeight: 500, fontStyle: 'italic',
                    color: PALETTE.textDark, lineHeight: 1.05, letterSpacing: '-0.01em', display: 'flex',
                  },
                  children: titre,
                },
              },
            ],
          },
        },
        // LINE ART
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: `${placementX}%`, top: `${placementY}%`,
              width: `${laWidthPercent}%`, height: `${laHeightPercent}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: laDataUrl,
                  style: { width: '100%', height: '100%', objectFit: 'contain', opacity: 1.0 },
                },
              },
            ],
          },
        },
        // BOUTON CTA (centre y=75% pour matcher linkSticker invisible)
        // Construction par couches: base color + gradient overlay + ombre prononcee
        // Le gradient va du ctaColor (haut) vers une version plus sombre (bas) pour donner du relief
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '15%', top: '70%', width: '70%', height: '8%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // Gradient principal du bouton (haut clair -> bas plus sombre)
              backgroundImage: ctaMode === 'reservation'
                ? 'linear-gradient(180deg, #C47A58 0%, #B8694A 50%, #A05B3D 100%)'
                : 'linear-gradient(180deg, #7E9374 0%, #6F8566 50%, #5C7156 100%)',
              borderRadius: 999,
              // Ombre prononcee multi-couches pour effet flottant
              boxShadow: '0 12px 32px rgba(44,42,38,0.32), 0 4px 12px rgba(44,42,38,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 50, fontFamily: 'Inter', fontWeight: 600,
                    color: '#FFFFFF', letterSpacing: '0.02em',
                    display: 'flex', alignItems: 'center', gap: 16,
                    // Petit text-shadow pour profondeur sur le bouton
                    textShadow: '0 2px 4px rgba(0,0,0,0.20)',
                  },
                  children: `${ctaLabel}  →`,
                },
              },
            ],
          },
        },
        // Indication "tape pour ouvrir"
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '0%', top: '80%', width: '100%',
              display: 'flex', justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 28, fontFamily: 'Inter', fontWeight: 500,
                    color: PALETTE.textMedium, letterSpacing: '0.08em', display: 'flex',
                  },
                  children: 'Tape pour ouvrir',
                },
              },
            ],
          },
        },
        // Branding
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '0%', top: '90%', width: '100%',
              display: 'flex', justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 36, fontFamily: 'Inter', fontWeight: 600,
                    color: PALETTE.textDark, display: 'flex',
                  },
                  children: 'acupuncturejudith.ca',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function main() {
  console.log('=== POC Story Satori 1080x1920 (mode ressource) ===\n');

  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('[1/7] Pige des assets...');
  const bgPath = await pickRandomFile(BG_DIR);
  const pilierDir = path.join(LA_DIR, TEST_CONFIG.pilier);
  const laPath = await pickRandomFile(pilierDir);
  console.log(`  Background: ${path.basename(bgPath)}`);
  console.log(`  Line art:   ${TEST_CONFIG.pilier}/${path.basename(laPath)}`);

  console.log('\n[2/7] Analyse zones vides (3x4 grid vertical)...');
  const placement = await findBestPlacementZone(bgPath);
  console.log(`  Best zone: row=${placement.row}, col=${placement.col} (score=${placement.score.toFixed(2)})`);
  console.log(`  Centre LA: ${placement.xPercent.toFixed(0)}% x ${placement.yPercent.toFixed(0)}%`);

  console.log('\n[3/7] Telechargement fonts...');
  const cormorantBuf = await loadFont('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&display=swap');
  const interBuf500 = await loadFont('https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap');
  const interBuf600 = await loadFont('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');

  console.log('\n[4/7] Traitement line art...');
  const laTransparentPng = await lineArtToTransparentPng(laPath, 220);

  console.log('\n[5/7] Encoding...');
  const bgDataUrl = await jpgToDataUrl(bgPath);
  const laDataUrl = await fileToDataUrl(laTransparentPng, 'image/png');

  console.log('\n[6/7] Composition Satori (1080x1920)...');
  const width = 1080, height = 1920;
  const tree = buildStoryTemplate({
    bgDataUrl, laDataUrl,
    surtitre: TEST_CONFIG.surtitre, titre: TEST_CONFIG.titre,
    width, height,
    placementX: placement.xPercent, placementY: placement.yPercent,
    ctaMode: TEST_CONFIG.ctaMode, ctaLabel: TEST_CONFIG.ctaLabel,
  });

  const svg = await satori(tree, {
    width, height,
    fonts: [
      { name: 'Cormorant', data: cormorantBuf, weight: 500, style: 'italic' },
      { name: 'Inter', data: interBuf500, weight: 500, style: 'normal' },
      { name: 'Inter', data: interBuf600, weight: 600, style: 'normal' },
    ],
  });

  console.log('\n[7/7] Rendering PNG...');
  const resvg = new Resvg(svg, {
    background: PALETTE.beigeBg,
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render().asPng();

  const timestamp = Date.now();
  const outPath = path.join(OUTPUT_DIR, `story-${TEST_CONFIG.pilier}-${timestamp}.png`);
  await writeFile(outPath, pngData);
  console.log(`  PNG: ${path.basename(outPath)} (${(pngData.length / 1024).toFixed(0)} KB)`);

  console.log('\n=== Done! ===');
  return outPath;
}

main()
  .then((outPath) => {
    import('node:child_process').then(({ exec }) => {
      exec(`open "${outPath}"`, () => {});
    });
  })
  .catch((err) => {
    console.error('\nERREUR:', err);
    process.exit(1);
  });
