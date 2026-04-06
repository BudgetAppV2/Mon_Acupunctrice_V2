import bundle from '../../subtitle-lab/fabric-presets/canva-preset-svgs-bundle.json';
import googleFabricPresets from '../../subtitle-lab/fabric-presets/canva-fabric-presets-google-fonts-only.json';
import mappingData from '../../subtitle-lab/fabric-presets/canva-svg-page-mapping.json';
import pixelGeometry from './canvaPixelLineGeometry.json';
import { GOOGLE_FONTS, type FontCategory } from '@/lib/image-editor/fontList';

type TextAlign = 'left' | 'center' | 'right';
type OriginX = 'left' | 'center' | 'right';

interface MappingPreset {
  pageNumber: number;
  presetName: string;
  fonts: string[];
}

interface SourceFontMeta {
  name: string;
}

interface SourceCanvaMeta {
  role?: string;
  textTransform?: string;
  canvaStyle?: string;
}

interface SourceFabricTextObject {
  type: 'textbox';
  originX?: string;
  originY?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  angle?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
  charSpacing?: number;
  lineHeight?: number;
  underline?: boolean;
  linethrough?: boolean;
  _canvaMeta?: SourceCanvaMeta;
}

interface SourceFabricPreset {
  objects: SourceFabricTextObject[];
  _presetMeta?: {
    canvasSize?: {
      width: number;
      height: number;
    };
    fonts?: SourceFontMeta[];
  };
}

interface PixelLineBand {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  baselineY: number;
  count: number;
}

interface PixelGeometryPreset {
  bundleKey: string;
  targetLineCount: number;
  points: number;
  sourceWidth?: number;
  sourceHeight?: number;
  lines: PixelLineBand[];
}

interface SourceLine {
  objectIndex: number;
  lineIndex: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  fill: string;
  textAlign: TextAlign;
  charSpacing: number;
  lineHeight: number;
  angle: number;
  role?: string;
  sourceFontFamily: string;
  textTransform?: 'uppercase';
  underline?: boolean;
  linethrough?: boolean;
  estimatedWidth: number;
  estimatedHeight: number;
  glyphCount: number;
}

interface BuiltPresetData {
  elements: ParsedTextElement[];
  sourceWidth: number;
  sourceHeight: number;
}

export interface ParsedTextElement {
  type: 'textbox';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  fill: string;
  left: number;
  top: number;
  width: number;
  height?: number;
  textAlign: TextAlign;
  charSpacing: number;
  lineHeight: number;
  angle: number;
  originX: OriginX;
  originY: 'top';
  editable: true;
  selectable: true;
  role?: string;
  sourceFontFamily?: string;
  textTransform?: 'uppercase';
  underline?: boolean;
  linethrough?: boolean;
}

export interface SvgPreset {
  id: string;
  name: string;
  pageNumber: number;
  thumbnail: string;
  fonts: string[];
  sourceWidth: number;
  sourceHeight: number;
  renderMode: 'editable' | 'vector';
  sourceSvgUrl: string;
  fabricData: ParsedTextElement[];
}

const BUNDLE = bundle as Record<string, string>;
const SOURCE_FABRIC_PRESETS = googleFabricPresets as SourceFabricPreset[];
const PIXEL_GEOMETRY = pixelGeometry as Record<string, PixelGeometryPreset>;
const MAPPING_PRESETS = mappingData.presets as MappingPreset[];
const BUNDLE_KEYS = Object.keys(BUNDLE);

const FONT_CATEGORY_OVERRIDES: Record<string, FontCategory> = {
  cinzel: 'serif',
};
const FONT_CATEGORY_BY_NAME = new Map(
  GOOGLE_FONTS.map((font) => [normalizeFontName(font.name), font.category] as const),
);

const MANUAL_PAGE_MATCHES: Record<number, string> = {
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

function normalizeFontName(name: string): string {
  return name.toLowerCase().replace(/['"]/g, '').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildFontSignature(fonts: string[]): string {
  return fonts.map(normalizeFontName).sort().join('|');
}

function getPixelSourceSize(pageNumber: number): { width: number; height: number } {
  const pixelPreset = PIXEL_GEOMETRY[String(pageNumber)];
  return {
    width: pixelPreset?.sourceWidth ?? 810,
    height: pixelPreset?.sourceHeight ?? 1440,
  };
}

function normalizeTextAlign(value: string | undefined): TextAlign {
  if (value === 'center' || value === 'right') return value;
  return 'left';
}

function normalizeOriginX(value: string | undefined): OriginX {
  if (value === 'center' || value === 'right') return value;
  return 'left';
}

function alignToOriginX(value: TextAlign): OriginX {
  if (value === 'center') return 'center';
  if (value === 'right') return 'right';
  return 'left';
}

function normalizeTextTransform(value: string | undefined): 'uppercase' | undefined {
  return value?.toLowerCase() === 'uppercase' ? 'uppercase' : undefined;
}

function parseNumeric(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function countVisibleGlyphs(text: string): number {
  const glyphs = text.replace(/\s/g, '');
  return glyphs.length > 0 ? glyphs.length : Math.max(text.length, 1);
}

function estimateTextWidth(text: string, fontSize: number, charSpacing: number): number {
  const glyphs = countVisibleGlyphs(text);
  const base = Math.max(text.length, 1) * fontSize * 0.58;
  const tracking = Math.max(glyphs - 1, 0) * ((charSpacing / 1000) * fontSize);
  return Math.max(base + tracking, glyphs * fontSize * 0.42);
}

function getFontCategory(fontName: string): FontCategory | null {
  const normalized = normalizeFontName(fontName);
  return FONT_CATEGORY_OVERRIDES[normalized] ?? FONT_CATEGORY_BY_NAME.get(normalized) ?? null;
}

function pairScore(sourceFont: string, officialFont: string): number {
  const sourceName = normalizeFontName(sourceFont);
  const officialName = normalizeFontName(officialFont);

  if (sourceName === officialName) return 100;

  const sourceCategory = getFontCategory(sourceFont);
  const officialCategory = getFontCategory(officialFont);
  if (sourceCategory && officialCategory && sourceCategory === officialCategory) return 40;

  const serifLike = new Set<FontCategory>(['serif', 'display']);
  const sansLike = new Set<FontCategory>(['sans-serif', 'monospace']);
  if (sourceCategory && officialCategory) {
    if (serifLike.has(sourceCategory) && serifLike.has(officialCategory)) return 20;
    if (sansLike.has(sourceCategory) && sansLike.has(officialCategory)) return 20;
  }

  return 0;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permutations(rest).map((perm) => [item, ...perm]);
  });
}

function buildFontMap(sourceFonts: string[], officialFonts: string[]): Map<string, string> {
  const source = sourceFonts.length > 0 ? sourceFonts : officialFonts;
  const official = officialFonts.length > 0 ? officialFonts : sourceFonts;

  if (official.length === 0) {
    return new Map(source.map((font) => [normalizeFontName(font), font] as const));
  }

  if (official.length === 1) {
    return new Map(source.map((font) => [normalizeFontName(font), official[0]] as const));
  }

  if (source.length === official.length) {
    let bestPermutation = official;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const permutation of permutations(official)) {
      const score = source.reduce((sum, font, index) => sum + pairScore(font, permutation[index]), 0);
      if (score > bestScore) {
        bestScore = score;
        bestPermutation = permutation;
      }
    }

    return new Map(source.map((font, index) => [normalizeFontName(font), bestPermutation[index]] as const));
  }

  return new Map(
    source.map((font) => {
      const best = official
        .map((candidate, index) => ({ candidate, index, score: pairScore(font, candidate) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)[0];
      return [normalizeFontName(font), best?.candidate ?? official[0]] as const;
    }),
  );
}

export function extractFontsFromSvg(svg: string): string[] {
  const fonts = svg.match(/data-fonts="([^"]+)"/)?.[1];
  return fonts ? fonts.split(',').map((font) => font.trim()) : [];
}

function getSourceFontNames(sourcePreset: SourceFabricPreset, bundleKey: string): string[] {
  const metaFonts = sourcePreset._presetMeta?.fonts?.map((font) => font.name).filter(Boolean);
  return metaFonts && metaFonts.length > 0 ? metaFonts : extractFontsFromSvg(BUNDLE[bundleKey]);
}

function getBundlePresetIndex(bundleKey: string): number {
  const svg = BUNDLE[bundleKey];
  const index = Number.parseInt(svg.match(/data-preset-index="(\d+)"/)?.[1] ?? '', 10);
  if (!Number.isFinite(index)) {
    throw new Error(`Missing bundle preset index for ${bundleKey}`);
  }
  return index;
}

function getSourceFabricPreset(bundleKey: string): SourceFabricPreset {
  const preset = SOURCE_FABRIC_PRESETS[getBundlePresetIndex(bundleKey)];
  if (!preset) {
    throw new Error(`Missing source Fabric preset for ${bundleKey}`);
  }
  return preset;
}

function extractSourceLines(sourcePreset: SourceFabricPreset): SourceLine[] {
  return sourcePreset.objects.flatMap((object, objectIndex) => {
    if (object.type !== 'textbox') return [];

    const rawText = (object.text ?? '').replace(/\r/g, '').replace(/\u00a0/g, ' ');
    const rawLines = rawText.split('\n').filter((line) => line.trim().length > 0);
    if (rawLines.length === 0) return [];

    const fontSize = parseNumeric(object.fontSize, 24);
    const fontWeight = Math.round(parseNumeric(object.fontWeight, 400));
    const fontStyle = object.fontStyle === 'italic' ? 'italic' : 'normal';
    const charSpacing = parseNumeric(object.charSpacing, 0);
    const lineHeight = Math.max(parseNumeric(object.lineHeight, 1.16), 0.8);
    const angle = parseNumeric(object.angle, 0);
    const textAlign = normalizeTextAlign(object.textAlign);
    const sourceFontFamily = object.fontFamily ?? 'Inter';
    const textTransform = normalizeTextTransform(object._canvaMeta?.textTransform);
    const estimatedHeight = Math.max(
      fontSize * 1.18,
      parseNumeric(object.height, 0) / Math.max(rawLines.length, 1),
      fontSize * Math.max(lineHeight, 1) * 0.9,
    );

    return rawLines.map((line, lineIndex) => {
      const measuredText = textTransform === 'uppercase' ? line.toUpperCase() : line;
      return {
        objectIndex,
        lineIndex,
        text: line,
        fontFamily: sourceFontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        fill: object.fill ?? '#222222',
        textAlign,
        charSpacing,
        lineHeight,
        angle,
        role: object._canvaMeta?.role,
        sourceFontFamily,
        textTransform,
        underline: Boolean(object.underline),
        linethrough: Boolean(object.linethrough),
        estimatedWidth: Math.max(estimateTextWidth(measuredText, fontSize, charSpacing), fontSize * 1.5),
        estimatedHeight,
        glyphCount: countVisibleGlyphs(measuredText),
      };
    });
  });
}

function applyOfficialFontsToLines(
  lines: SourceLine[],
  sourceFonts: string[],
  officialFonts: string[],
): SourceLine[] {
  const fontMap = buildFontMap(sourceFonts, officialFonts);
  return lines.map((line) => ({
    ...line,
    fontFamily: fontMap.get(normalizeFontName(line.sourceFontFamily)) ?? officialFonts[0] ?? line.fontFamily,
  }));
}

function buildRawTextElements(
  sourcePreset: SourceFabricPreset,
  bundleKey: string,
  officialFonts: string[],
): BuiltPresetData {
  const fontMap = buildFontMap(getSourceFontNames(sourcePreset, bundleKey), officialFonts);

  const elements = sourcePreset.objects.flatMap((object) => {
    if (object.type !== 'textbox') return [];

    const fontSize = parseNumeric(object.fontSize, 24);
    const charSpacing = parseNumeric(object.charSpacing, 0);
    return [{
      type: 'textbox' as const,
      text: (object.text ?? '').replace(/\r/g, ''),
      fontFamily: fontMap.get(normalizeFontName(object.fontFamily ?? 'Inter')) ?? officialFonts[0] ?? object.fontFamily ?? 'Inter',
      fontSize,
      fontWeight: Math.round(parseNumeric(object.fontWeight, 400)),
      fontStyle: (object.fontStyle === 'italic' ? 'italic' : 'normal') as 'normal' | 'italic',
      fill: object.fill ?? '#222222',
      left: parseNumeric(object.left, 0),
      top: parseNumeric(object.top, 0),
      width: Math.max(parseNumeric(object.width, 0), estimateTextWidth(object.text ?? '', fontSize, charSpacing), fontSize * 1.5),
      height: Math.max(parseNumeric(object.height, 0), fontSize * 1.2),
      textAlign: normalizeTextAlign(object.textAlign),
      charSpacing,
      lineHeight: Math.max(parseNumeric(object.lineHeight, 1.16), 0.8),
      angle: parseNumeric(object.angle, 0),
      originX: normalizeOriginX(object.originX),
      originY: 'top' as const,
      editable: true as const,
      selectable: true as const,
      role: object._canvaMeta?.role,
      sourceFontFamily: object.fontFamily ?? 'Inter',
      textTransform: normalizeTextTransform(object._canvaMeta?.textTransform),
      underline: Boolean(object.underline),
      linethrough: Boolean(object.linethrough),
    }];
  });

  return {
    elements,
    sourceWidth: sourcePreset._presetMeta?.canvasSize?.width ?? 758,
    sourceHeight: sourcePreset._presetMeta?.canvasSize?.height ?? 389,
  };
}

function bandWidth(band: PixelLineBand): number {
  return Math.max(band.maxX - band.minX, 1);
}

function bandHeight(band: PixelLineBand): number {
  return Math.max(band.maxY - band.minY, 0);
}

function lineBandScore(line: SourceLine, band: PixelLineBand): number {
  const widthPenalty = Math.abs(line.estimatedWidth - bandWidth(band)) / Math.max(line.estimatedWidth, bandWidth(band), 1);
  const heightPenalty = Math.abs(line.estimatedHeight - Math.max(bandHeight(band), line.fontSize * 0.2)) / Math.max(line.estimatedHeight, 1);

  let score = Math.abs(line.glyphCount - band.count) * 120;
  score += widthPenalty * 40;
  score += heightPenalty * 8;

  if (line.angle !== 0 && bandHeight(band) < line.fontSize * 0.25) score += 16;
  if (line.angle === 0 && bandHeight(band) > line.fontSize * 0.6) score += 8;

  return score;
}

function incrementalOrderPenalty(
  lines: SourceLine[],
  currentAssignment: number[],
  lineIndex: number,
  bandIndex: number,
): number {
  let penalty = 0;

  for (let index = 0; index < currentAssignment.length; index += 1) {
    const assignedBand = currentAssignment[index];
    if (assignedBand < 0) continue;
    if (lines[index].objectIndex !== lines[lineIndex].objectIndex) continue;

    if (lines[index].lineIndex < lines[lineIndex].lineIndex && assignedBand > bandIndex) {
      penalty += 500;
    }
    if (lines[index].lineIndex > lines[lineIndex].lineIndex && assignedBand < bandIndex) {
      penalty += 500;
    }
  }

  return penalty;
}

function findBestBandAssignment(lines: SourceLine[], bands: PixelLineBand[]): number[] {
  const scores = lines.map((line) => bands.map((band) => lineBandScore(line, band)));
  const lineOrder = lines
    .map((_, index) => index)
    .sort((a, b) => Math.min(...scores[a]) - Math.min(...scores[b]));

  const currentAssignment = Array(lines.length).fill(-1);
  const usedBands = Array(bands.length).fill(false);
  let bestScore = Number.POSITIVE_INFINITY;
  let bestAssignment = currentAssignment.map((_, index) => index);

  function walk(position: number, runningScore: number): void {
    if (runningScore >= bestScore) return;

    if (position === lineOrder.length) {
      bestScore = runningScore;
      bestAssignment = [...currentAssignment];
      return;
    }

    const lineIndex = lineOrder[position];
    const candidates = bands
      .map((_, bandIndex) => bandIndex)
      .filter((bandIndex) => !usedBands[bandIndex])
      .sort((a, b) => scores[lineIndex][a] - scores[lineIndex][b]);

    for (const bandIndex of candidates) {
      const nextScore = runningScore
        + scores[lineIndex][bandIndex]
        + incrementalOrderPenalty(lines, currentAssignment, lineIndex, bandIndex);

      if (nextScore >= bestScore) continue;

      usedBands[bandIndex] = true;
      currentAssignment[lineIndex] = bandIndex;
      walk(position + 1, nextScore);
      currentAssignment[lineIndex] = -1;
      usedBands[bandIndex] = false;
    }
  }

  walk(0, 0);
  return bestAssignment;
}

function buildPlacedLineElement(line: SourceLine, band: PixelLineBand): ParsedTextElement {
  const width = Math.max(line.estimatedWidth * 1.06, bandWidth(band) + line.fontSize * 0.35, line.fontSize * 1.5);
  const height = Math.max(line.estimatedHeight, bandHeight(band) + line.fontSize * 0.35);
  const textAlign = line.textAlign;
  const originX = alignToOriginX(textAlign);
  const left = textAlign === 'center'
    ? (band.minX + band.maxX) / 2
    : textAlign === 'right'
      ? band.maxX
      : band.minX;

  return {
    type: 'textbox',
    text: line.text,
    fontFamily: line.fontFamily,
    fontSize: line.fontSize,
    fontWeight: line.fontWeight,
    fontStyle: line.fontStyle,
    fill: line.fill,
    left,
    top: band.baselineY - line.fontSize * 0.85,
    width,
    height,
    textAlign,
    charSpacing: line.charSpacing,
    lineHeight: line.lineHeight,
    angle: line.angle,
    originX,
    originY: 'top',
    editable: true,
    selectable: true,
    role: line.role,
    sourceFontFamily: line.sourceFontFamily,
    textTransform: line.textTransform,
    underline: line.underline,
    linethrough: line.linethrough,
  };
}

function getElementBounds(element: ParsedTextElement): { left: number; top: number; right: number; bottom: number } {
  const width = Math.max(element.width, 1);
  const height = Math.max(element.height ?? element.fontSize * 1.2, 1);
  const left = element.originX === 'center'
    ? element.left - width / 2
    : element.originX === 'right'
      ? element.left - width
      : element.left;

  return {
    left,
    top: element.top,
    right: left + width,
    bottom: element.top + height,
  };
}

function normalizePlacedElements(elements: ParsedTextElement[]): BuiltPresetData {
  if (elements.length === 0) {
    return { elements: [], sourceWidth: 1, sourceHeight: 1 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const element of elements) {
    const bounds = getElementBounds(element);
    minX = Math.min(minX, bounds.left);
    minY = Math.min(minY, bounds.top);
    maxX = Math.max(maxX, bounds.right);
    maxY = Math.max(maxY, bounds.bottom);
  }

  return {
    elements: elements.map((element) => ({
      ...element,
      left: element.left - minX,
      top: element.top - minY,
    })),
    sourceWidth: Math.max(maxX - minX, 1),
    sourceHeight: Math.max(maxY - minY, 1),
  };
}

function buildPixelMatchedPreset(
  sourcePreset: SourceFabricPreset,
  bundleKey: string,
  preset: MappingPreset,
): BuiltPresetData | null {
  const pixelPreset = PIXEL_GEOMETRY[String(preset.pageNumber)];
  if (!pixelPreset || pixelPreset.lines.length === 0) return null;

  const lines = applyOfficialFontsToLines(
    extractSourceLines(sourcePreset),
    getSourceFontNames(sourcePreset, bundleKey),
    preset.fonts,
  );

  if (lines.length !== pixelPreset.lines.length) return null;

  const assignment = findBestBandAssignment(lines, pixelPreset.lines);
  const placed = lines.map((line, index) => buildPlacedLineElement(line, pixelPreset.lines[assignment[index]]));
  return normalizePlacedElements(placed);
}

const BUNDLE_KEYS_BY_SIGNATURE = BUNDLE_KEYS.reduce<Record<string, string[]>>((acc, key) => {
  const signature = buildFontSignature(extractFontsFromSvg(BUNDLE[key]));
  acc[signature] ??= [];
  acc[signature].push(key);
  return acc;
}, {});

function findExactBundleKey(preset: MappingPreset): string | null {
  if (MANUAL_PAGE_MATCHES[preset.pageNumber]) return null;
  const signature = buildFontSignature(preset.fonts);
  const matches = BUNDLE_KEYS_BY_SIGNATURE[signature] ?? [];
  return matches.length === 1 ? matches[0] : null;
}

const ALL_CANVA_TEXT_PRESETS: SvgPreset[] = MAPPING_PRESETS.map((preset) => {
  const sourceSvgUrl = `/images/text-presets-svg/preset-${preset.pageNumber}.svg`;
  const exactBundleKey = findExactBundleKey(preset);
  const pixelSize = getPixelSourceSize(preset.pageNumber);

  if (!exactBundleKey) {
    return {
      id: `canva-${preset.pageNumber}`,
      name: preset.presetName,
      pageNumber: preset.pageNumber,
      thumbnail: `/images/text-presets/preset-${preset.pageNumber}.png`,
      fonts: preset.fonts,
      sourceWidth: pixelSize.width,
      sourceHeight: pixelSize.height,
      renderMode: 'vector',
      sourceSvgUrl,
      fabricData: [],
    };
  }

  const bundleKey = exactBundleKey;
  const sourcePreset = getSourceFabricPreset(bundleKey);
  const builtPreset = buildPixelMatchedPreset(sourcePreset, bundleKey, preset)
    ?? buildRawTextElements(sourcePreset, bundleKey, preset.fonts);

  return {
    id: `canva-${preset.pageNumber}`,
    name: preset.presetName,
    pageNumber: preset.pageNumber,
    thumbnail: `/images/text-presets/preset-${preset.pageNumber}.png`,
    fonts: preset.fonts,
    sourceWidth: builtPreset.sourceWidth,
    sourceHeight: builtPreset.sourceHeight,
    renderMode: 'editable',
    sourceSvgUrl,
    fabricData: builtPreset.elements,
  };
});

export const CANVA_TEXT_PRESETS = ALL_CANVA_TEXT_PRESETS.filter((preset) => preset.renderMode === 'editable');
export const SVG_PRESETS = CANVA_TEXT_PRESETS;
