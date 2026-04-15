#!/usr/bin/env node
/**
 * Optimize Assets v4 — MW-A1b
 * =============================
 *
 * Optimise les photos Eric Bates (AVIF+WebP), les SVG decoratifs (svgo),
 * et la texture papier japonais (AVIF/WebP/JPEG) pour le site public.
 *
 * Usage :
 *   node scripts/optimize-assets.mjs --dry-run
 *   node scripts/optimize-assets.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const HOME = process.env.HOME;
const ASSETS_ROOT = resolve(HOME, 'Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets');

const DRY_RUN = process.argv.includes('--dry-run');

// Output directories
const PHOTO_OUT = resolve(ROOT, 'public/site/judith');
const SVG_OUT = resolve(ROOT, 'public/site/svg');
const TEXTURE_OUT = resolve(ROOT, 'public/site/textures');

// ─────────────────────────────────────────────────────────────
// Photos config
// ─────────────────────────────────────────────────────────────

const PHOTO_FILES = [
  '@EricBatesImages-1.jpeg',
  '@EricBatesImages-3.jpeg',
  '@EricBatesImages-4.jpeg',
  '@EricBatesImages-6.jpeg',
  '@EricBatesImages-7.jpeg',
  '@EricBatesImages-8.jpeg',
  '@EricBatesImages-9.jpeg',
  '@EricBatesImages-12.jpeg',
];

const PHOTO_SOURCE_DIR = resolve(ASSETS_ROOT, 'photos_Judith/Croped');

// ─────────────────────────────────────────────────────────────
// SVG config — exact paths verified by Desktop
// ─────────────────────────────────────────────────────────────

const SVG_FILES = [
  {
    source: 'svg/01-grossesse/pregnant-woman-makes-yoga-meditation-one-line-drawing/yoga3.svg',
    slug: 'yoga3.svg',
  },
  {
    source: 'svg/04-botanique/illustration-with-medicinal-plants/plant.svg',
    slug: 'plant.svg',
  },
  {
    source: 'svg/02-fertilite/female-reproductive-system-with-flowers/4319418.svg',
    slug: 'reproductive-flowers.svg',
  },
  {
    source: 'svg/05-mains-soins/magic-hands-with-lotus-flower-line-art/e4cad311-eb35-4d76-8041-6e5695fe673e.svg',
    slug: 'hands-lotus.svg',
  },
];

// ─────────────────────────────────────────────────────────────
// Texture config
// ─────────────────────────────────────────────────────────────

const TEXTURE_SOURCE = resolve(ASSETS_ROOT, 'textures/natural-japanese-recycled-paper-texture.jpg');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function checkTarget(label, bytes, targetKB) {
  if (bytes > targetKB * 1024) {
    console.log(`  WARNING: ${label} is ${formatKB(bytes)} (target < ${targetKB} KB)`);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log(' MW-A1b — Optimize Assets v4');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log(' MODE: --dry-run');
  console.log('');

  const report = [];
  let totalSaved = 0;
  const warnings = [];

  // ── Photos ────────────────────────────────────────────────

  console.log('--- Photos (8) ---');
  console.log('');
  ensureDir(PHOTO_OUT);

  const manifest = [];

  for (let i = 0; i < PHOTO_FILES.length; i++) {
    const filename = PHOTO_FILES[i];
    const sourcePath = resolve(PHOTO_SOURCE_DIR, filename);
    const slug = `judith-portrait-${String(i + 1).padStart(2, '0')}`;
    const avifPath = resolve(PHOTO_OUT, `${slug}.avif`);
    const webpPath = resolve(PHOTO_OUT, `${slug}.webp`);

    if (!existsSync(sourcePath)) {
      console.log(`  MISSING: ${filename}`);
      warnings.push(`Photo not found: ${filename}`);
      continue;
    }

    const sourceSize = statSync(sourcePath).size;
    console.log(`[${i + 1}/8] ${filename} (${formatKB(sourceSize)})`);

    if (!DRY_RUN) {
      const resized = sharp(sourcePath).resize({
        width: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const avifBuf = await resized.clone().avif({ quality: 60 }).toBuffer();
      const webpBuf = await resized.clone().webp({ quality: 80 }).toBuffer();

      writeFileSync(avifPath, avifBuf);
      writeFileSync(webpPath, webpBuf);

      // Get dimensions after resize
      const meta = await sharp(avifBuf).metadata();

      console.log(`  AVIF: ${formatKB(avifBuf.length)}  WebP: ${formatKB(webpBuf.length)}`);
      checkTarget(`${slug}.avif`, avifBuf.length, 80) || warnings.push(`${slug}.avif exceeds 80 KB`);
      checkTarget(`${slug}.webp`, webpBuf.length, 180) || warnings.push(`${slug}.webp exceeds 180 KB`);

      totalSaved += sourceSize - avifBuf.length;

      manifest.push({
        slug,
        filenameAvif: `${slug}.avif`,
        filenameWebp: `${slug}.webp`,
        width: meta.width,
        height: meta.height,
        alt: 'TODO — a rediger avec Judith en MW-A3',
      });

      report.push({
        file: filename,
        before: sourceSize,
        afterAvif: avifBuf.length,
        afterWebp: webpBuf.length,
      });
    } else {
      console.log(`  [dry-run] Would emit ${slug}.avif + ${slug}.webp`);
      manifest.push({
        slug,
        filenameAvif: `${slug}.avif`,
        filenameWebp: `${slug}.webp`,
        width: null,
        height: null,
        alt: 'TODO — a rediger avec Judith en MW-A3',
      });
    }
  }

  // Write manifest
  if (!DRY_RUN) {
    writeFileSync(
      resolve(PHOTO_OUT, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    console.log(`\n  Manifest: ${manifest.length} entries written`);
  }

  console.log('');

  // ── SVG ───────────────────────────────────────────────────

  console.log('--- SVG (4) ---');
  console.log('');
  ensureDir(SVG_OUT);

  for (const svg of SVG_FILES) {
    const sourcePath = resolve(ASSETS_ROOT, svg.source);
    const destPath = resolve(SVG_OUT, svg.slug);

    if (!existsSync(sourcePath)) {
      console.log(`  MISSING: ${svg.source}`);
      warnings.push(`SVG not found: ${svg.source}`);
      continue;
    }

    const sourceSize = statSync(sourcePath).size;
    console.log(`${svg.slug} (${formatKB(sourceSize)})`);

    if (!DRY_RUN) {
      // Run svgo
      try {
        execSync(`npx svgo --multipass -i "${sourcePath}" -o "${destPath}"`, {
          stdio: 'pipe',
        });
      } catch (err) {
        console.log(`  svgo error: ${err.message.slice(0, 100)}`);
        // Fallback: copy as-is
        writeFileSync(destPath, readFileSync(sourcePath));
      }

      const optimizedSize = statSync(destPath).size;
      console.log(`  Optimized: ${formatKB(optimizedSize)} (saved ${formatKB(sourceSize - optimizedSize)})`);
      totalSaved += sourceSize - optimizedSize;

      // Fallback for plant.svg if still > 500 KB
      if (svg.slug === 'plant.svg' && optimizedSize > 500 * 1024) {
        console.log(`  plant.svg still > 500 KB, rasterizing to WebP fallback...`);
        const svgBuf = readFileSync(destPath);
        const webpBuf = await sharp(svgBuf).resize(800).webp({ quality: 80 }).toBuffer();
        writeFileSync(resolve(SVG_OUT, 'plant.webp'), webpBuf);
        console.log(`  plant.webp: ${formatKB(webpBuf.length)}`);
        warnings.push(`plant.svg > 500 KB post-svgo (${formatKB(optimizedSize)}), WebP fallback created`);
      }

      report.push({ file: svg.slug, before: sourceSize, after: optimizedSize });
    } else {
      console.log(`  [dry-run] Would optimize → ${svg.slug}`);
    }
  }

  console.log('');

  // ── Texture ───────────────────────────────────────────────

  console.log('--- Texture (1 → 3 formats) ---');
  console.log('');
  ensureDir(TEXTURE_OUT);

  if (!existsSync(TEXTURE_SOURCE)) {
    console.log(`  MISSING: ${TEXTURE_SOURCE}`);
    warnings.push('Texture source not found');
  } else {
    const sourceSize = statSync(TEXTURE_SOURCE).size;
    console.log(`natural-japanese-recycled-paper-texture.jpg (${formatKB(sourceSize)})`);

    if (!DRY_RUN) {
      const resized = sharp(TEXTURE_SOURCE).resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const [avifBuf, webpBuf, jpegBuf] = await Promise.all([
        resized.clone().avif({ quality: 55, effort: 6 }).toBuffer(),
        resized.clone().webp({ quality: 72 }).toBuffer(),
        resized.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer(),
      ]);

      writeFileSync(resolve(TEXTURE_OUT, 'paper-japan.avif'), avifBuf);
      writeFileSync(resolve(TEXTURE_OUT, 'paper-japan.webp'), webpBuf);
      writeFileSync(resolve(TEXTURE_OUT, 'paper-japan.jpg'), jpegBuf);

      console.log(`  AVIF: ${formatKB(avifBuf.length)}  WebP: ${formatKB(webpBuf.length)}  JPEG: ${formatKB(jpegBuf.length)}`);

      checkTarget('paper-japan.avif', avifBuf.length, 30) || warnings.push('paper-japan.avif exceeds 30 KB');
      checkTarget('paper-japan.webp', webpBuf.length, 50) || warnings.push('paper-japan.webp exceeds 50 KB');
      checkTarget('paper-japan.jpg', jpegBuf.length, 120) || warnings.push('paper-japan.jpg exceeds 120 KB');

      totalSaved += sourceSize - avifBuf.length;

      report.push({
        file: 'paper-japan',
        before: sourceSize,
        afterAvif: avifBuf.length,
        afterWebp: webpBuf.length,
        afterJpeg: jpegBuf.length,
      });
    } else {
      console.log('  [dry-run] Would emit paper-japan.avif + .webp + .jpg');
    }
  }

  // ── Summary ───────────────────────────────────────────────

  console.log('');
  console.log('='.repeat(60));
  console.log(` Done`);
  console.log(`   Photos: ${manifest.length} x 2 formats = ${manifest.length * 2} files`);
  console.log(`   SVG: ${SVG_FILES.length} files`);
  console.log(`   Texture: 3 formats`);
  if (!DRY_RUN) {
    console.log(`   Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
  }
  if (warnings.length > 0) {
    console.log(`   Warnings: ${warnings.length}`);
    for (const w of warnings) console.log(`     - ${w}`);
  }
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
