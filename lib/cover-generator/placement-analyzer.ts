import sharp from 'sharp';
import type { PlacementResult } from './types';

interface ZoneScore {
  row: number;
  col: number;
  mean: number;
  stdDev: number;
  baseScore: number;
  centerBias: number;
  verticalBias: number;
  score: number;
}

/**
 * Analyse le background pour trouver la zone la plus vide/claire/uniforme.
 * Port direct du POC validé (findBestPlacementZone).
 *
 * Cover (3x3 grid): exclude bottom row (text zone)
 * Story (3x4 grid): only rows 1-2, offset +7% vertical
 */
export async function analyzePlacementCover(bgPath: string): Promise<PlacementResult> {
  const zones = await analyzeGrid(bgPath, 3, 3);

  // Bias: centre +0.30, droite +0.10, gauche -0.20, milieu row +0.10
  for (const z of zones) {
    if (z.col === 1) z.centerBias = 0.30;
    else if (z.col === 2) z.centerBias = 0.10;
    else z.centerBias = -0.20;

    if (z.row === 1) z.verticalBias = 0.10;
    else z.verticalBias = 0;

    z.score = z.baseScore + z.centerBias + z.verticalBias;
  }

  // Exclude bottom row (row=2) — reserved for text
  const candidates = zones.filter((z) => z.row < 2);
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    row: best.row,
    col: best.col,
    xPercent: (best.col + 0.5) * 33.33,
    yPercent: (best.row + 0.5) * 33.33,
    score: best.score,
  };
}

export async function analyzePlacementStory(bgPath: string): Promise<PlacementResult> {
  const zones = await analyzeGrid(bgPath, 3, 4);

  // Bias: centre +0.30, droite +0.05, gauche -0.10, row1 +0.20, row2 +0.05
  for (const z of zones) {
    if (z.col === 1) z.centerBias = 0.30;
    else if (z.col === 2) z.centerBias = 0.05;
    else z.centerBias = -0.10;

    if (z.row === 1) z.verticalBias = 0.20;
    else if (z.row === 2) z.verticalBias = 0.05;
    else z.verticalBias = 0;

    z.score = z.baseScore + z.centerBias + z.verticalBias;
  }

  // Only rows 1 and 2 (middle zones)
  const candidates = zones.filter((z) => z.row === 1 || z.row === 2);
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  const xPercent = (best.col + 0.5) * (100 / 3);
  // Offset +7% pour libérer espace titre 140px
  const yPercent = (best.row + 0.5) * (100 / 4) + 7;

  return {
    row: best.row,
    col: best.col,
    xPercent,
    yPercent,
    score: best.score,
  };
}

async function analyzeGrid(bgPath: string, cols: number, rows: number): Promise<ZoneScore[]> {
  const img = sharp(bgPath);
  const metadata = await img.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read dimensions for ${bgPath}`);
  }

  const analysisWidth = 250;
  const analysisHeight = Math.round(metadata.height * (analysisWidth / metadata.width));

  const greyData = await img
    .clone()
    .resize(analysisWidth, analysisHeight)
    .greyscale()
    .raw()
    .toBuffer();

  const cellW = Math.floor(analysisWidth / cols);
  const cellH = Math.floor(analysisHeight / rows);

  const zones: ZoneScore[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const startX = col * cellW;
      const startY = row * cellH;
      const endX = startX + cellW;
      const endY = startY + cellH;

      let sum = 0;
      let count = 0;
      const pixels: number[] = [];
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const luminance = greyData[y * analysisWidth + x];
          sum += luminance;
          pixels.push(luminance);
          count++;
        }
      }
      const mean = sum / count;

      let variance = 0;
      for (const p of pixels) {
        variance += (p - mean) ** 2;
      }
      variance /= count;
      const stdDev = Math.sqrt(variance);

      const luminanceScore = Math.min(mean / 255, 1);
      const uniformityScore = Math.max(0, 1 - stdDev / 50);
      const baseScore = luminanceScore * 0.6 + uniformityScore * 0.4;

      zones.push({
        row,
        col,
        mean,
        stdDev,
        baseScore,
        centerBias: 0,
        verticalBias: 0,
        score: baseScore,
      });
    }
  }

  return zones;
}
