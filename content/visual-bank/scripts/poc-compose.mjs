// poc-compose.mjs v3
// POC v3: Line art transparent + placement intelligent dans les zones vides du background.

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
};

// === HELPERS ===

async function loadFont(url) {
  const css = await fetch(url).then((r) => r.text());
  const fontUrlMatch = css.match(/url\((https:[^)]+)\)/);
  if (!fontUrlMatch) throw new Error('Font URL not found in CSS');
  const fontResponse = await fetch(fontUrlMatch[1]);
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

/**
 * Analyse le background pour trouver la zone la plus vide/claire/uniforme,
 * en excluant la rangee du bas (reservee au texte).
 *
 * Retourne {row, col, x, y} en pourcentages (centre de la zone trouvee).
 */
async function findBestPlacementZone(bgPath) {
  const img = sharp(bgPath);
  const metadata = await img.metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  // Resize down for faster analysis (250px wide)
  const analysisWidth = 250;
  const analysisHeight = Math.round(height * (analysisWidth / width));
  
  const greyData = await img
    .clone()
    .resize(analysisWidth, analysisHeight)
    .greyscale()
    .raw()
    .toBuffer();
  
  // Divide into 3x3 grid
  const cellW = Math.floor(analysisWidth / 3);
  const cellH = Math.floor(analysisHeight / 3);
  
  const zones = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const startX = col * cellW;
      const startY = row * cellH;
      const endX = startX + cellW;
      const endY = startY + cellH;
      
      let sum = 0;
      let count = 0;
      const pixels = [];
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const luminance = greyData[y * analysisWidth + x];
          sum += luminance;
          pixels.push(luminance);
          count++;
        }
      }
      const mean = sum / count;
      
      // Standard deviation
      let variance = 0;
      for (const p of pixels) {
        variance += (p - mean) ** 2;
      }
      variance /= count;
      const stdDev = Math.sqrt(variance);
      
      // Score: high luminance + low stdDev = empty/uniform area
      // We want bright (luminance > 200) AND uniform (stdDev < 20)
      const luminanceScore = Math.min(mean / 255, 1); // 0-1
      const uniformityScore = Math.max(0, 1 - stdDev / 50); // 0-1, penalty if stdDev > 50
      const baseScore = luminanceScore * 0.6 + uniformityScore * 0.4;
      
      // Bias toward CENTER (col=1) and RIGHT (col=2) positions.
      // The text block lives in bottom-LEFT, so we avoid left column to prevent crowding.
      let centerBias = 0;
      if (col === 1) {
        centerBias = 0.30; // strong bonus for centered (preferred)
      } else if (col === 2) {
        centerBias = 0.10; // moderate bonus for right (balances text on left)
      } else {
        centerBias = -0.20; // strong penalty for left (overlaps text zone)
      }
      
      // Slight bonus for middle row over top row (more grounded look)
      let verticalBias = 0;
      if (row === 1) {
        verticalBias = 0.10; // bonus for middle row
      } else if (row === 0) {
        verticalBias = 0; // neutral for top row
      }
      
      const score = baseScore + centerBias + verticalBias;
      
      zones.push({ row, col, mean, stdDev, baseScore, centerBias, verticalBias, score });
    }
  }
  
  // Filter: exclude bottom row (row=2) - reserved for text
  // and prefer top row + middle row
  const candidates = zones.filter((z) => z.row < 2);
  candidates.sort((a, b) => b.score - a.score);
  
  const best = candidates[0];
  
  // Convert grid position to percentages (center of zone)
  const xPercent = (best.col + 0.5) * 33.33;
  const yPercent = (best.row + 0.5) * 33.33;
  
  return {
    row: best.row,
    col: best.col,
    xPercent,
    yPercent,
    score: best.score,
    debug: zones,
  };
}

async function lineArtToTransparentPng(filepath, threshold = 235) {
  const original = sharp(filepath);
  const metadata = await original.metadata();
  
  const greyBuffer = await original.clone().greyscale().raw().toBuffer();
  
  const inkR = 0x2C, inkG = 0x2A, inkB = 0x26;
  const rgbaBuffer = Buffer.alloc(greyBuffer.length * 4);
  for (let i = 0; i < greyBuffer.length; i++) {
    const luminance = greyBuffer[i];
    let alpha = 0;
    if (luminance < threshold) {
      alpha = Math.round(((threshold - luminance) / threshold) * 255);
    }
    rgbaBuffer[i * 4] = inkR;
    rgbaBuffer[i * 4 + 1] = inkG;
    rgbaBuffer[i * 4 + 2] = inkB;
    rgbaBuffer[i * 4 + 3] = alpha;
  }
  
  return await sharp(rgbaBuffer, {
    raw: { width: metadata.width, height: metadata.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function fileToDataUrl(buf, mime = 'image/png') {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function jpgToDataUrl(filepath) {
  const buf = await readFile(filepath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

// === COMPOSITION ===

function buildTemplate({ bgDataUrl, laDataUrl, surtitre, titre, width, height, placementX, placementY }) {
  // placementX/Y sont des pourcentages (centre du line art)
  const laWidthPercent = 70; // line art fait 70% de la largeur (gros)
  const laHeightPercent = 80; // 80% de la hauteur (gros)
  
  // Convertir centre en top/left (pour positionner via translate)
  const laLeft = `${placementX}%`;
  const laTop = `${placementY}%`;
  
  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundImage: `url(${bgDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Inter',
      },
      children: [
        // Voile leger
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(245,240,232,0.32) 100%)',
              display: 'flex',
            },
          },
        },
        // Line art positionne intelligemment
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: laLeft,
              top: laTop,
              width: `${laWidthPercent}%`,
              height: `${laHeightPercent}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: laDataUrl,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.92,
                  },
                },
              },
            ],
          },
        },
        // Bloc titre en bas a gauche
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '6%',
              bottom: '8%',
              maxWidth: '78%',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 32,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#6F8566',
                    display: 'flex',
                  },
                  children: surtitre,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 108,
                    fontFamily: 'Cormorant',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: '#2C2A26',
                    lineHeight: 1.05,
                    letterSpacing: '-0.01em',
                    display: 'flex',
                  },
                  children: titre,
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
              right: '4%',
              bottom: '4%',
              fontSize: 26,
              fontFamily: 'Inter',
              fontWeight: 500,
              color: '#5C5852',
              display: 'flex',
            },
            children: 'acupuncturejudith.ca',
          },
        },
      ],
    },
  };
}

// === MAIN ===

async function main() {
  console.log('=== POC Satori v3 (placement intelligent + dimensions accrues) ===\n');
  
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('[1/7] Pige des assets...');
  const bgPath = await pickRandomFile(BG_DIR);
  const pilierDir = path.join(LA_DIR, TEST_CONFIG.pilier);
  const laPath = await pickRandomFile(pilierDir);
  console.log(`  Background: ${path.basename(bgPath)}`);
  console.log(`  Line art:   ${TEST_CONFIG.pilier}/${path.basename(laPath)}`);
  
  console.log('\n[2/7] Analyse zones vides du background...');
  const placement = await findBestPlacementZone(bgPath);
  console.log(`  Best zone: row=${placement.row}, col=${placement.col} (score=${placement.score.toFixed(2)})`);
  console.log(`  Centre line art: ${placement.xPercent.toFixed(0)}% x ${placement.yPercent.toFixed(0)}%`);
  console.log('  Grille (luminance/uniformite):');
  for (let row = 0; row < 3; row++) {
    const cells = placement.debug.filter((z) => z.row === row);
    const cellsStr = cells.map((c) => `[${c.row},${c.col}: L=${c.mean.toFixed(0)} std=${c.stdDev.toFixed(0)} base=${c.baseScore.toFixed(2)} bias=${(c.centerBias + c.verticalBias).toFixed(2)} score=${c.score.toFixed(2)}]`).join(' ');
    console.log(`    ${cellsStr}`);
  }
  
  console.log('\n[3/7] Telechargement des fonts...');
  const cormorantBuf = await loadFont(
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&display=swap'
  );
  const interBuf = await loadFont(
    'https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap'
  );
  console.log(`  Fonts loaded`);
  
  console.log('\n[4/7] Traitement du line art...');
  const laTransparentPng = await lineArtToTransparentPng(laPath, 235);
  console.log(`  PNG transparent: ${(laTransparentPng.length / 1024).toFixed(0)} KB`);
  
  console.log('\n[5/7] Encoding...');
  const bgDataUrl = await jpgToDataUrl(bgPath);
  const laDataUrl = await fileToDataUrl(laTransparentPng, 'image/png');
  
  console.log('\n[6/7] Composition Satori...');
  const width = 1920;
  const height = 1080;
  
  const tree = buildTemplate({
    bgDataUrl,
    laDataUrl,
    surtitre: TEST_CONFIG.surtitre,
    titre: TEST_CONFIG.titre,
    width,
    height,
    placementX: placement.xPercent,
    placementY: placement.yPercent,
  });
  
  const svg = await satori(tree, {
    width, height,
    fonts: [
      { name: 'Cormorant', data: cormorantBuf, weight: 500, style: 'italic' },
      { name: 'Inter', data: interBuf, weight: 500, style: 'normal' },
    ],
  });
  
  console.log('\n[7/7] Rendering PNG...');
  const resvg = new Resvg(svg, {
    background: '#F5F0E8',
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render().asPng();
  
  const timestamp = Date.now();
  const outPath = path.join(OUTPUT_DIR, `cover-v3-${timestamp}.png`);
  await writeFile(outPath, pngData);
  console.log(`  PNG: ${path.basename(outPath)} (${(pngData.length / 1024).toFixed(0)} KB)`);
  
  console.log(`\n=== Done! ===`);
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
