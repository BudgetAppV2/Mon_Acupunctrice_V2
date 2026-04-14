#!/usr/bin/env node
/**
 * Export Wix Blog — MW-A1a inventaire complet
 * =============================================
 *
 * Recupere les 11 articles de blog Wix via l'API Blog v3,
 * sauvegarde le Ricos JSON brut, les metadonnees, et telecharge
 * les images (cover + inline) pour chaque article.
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/export-wix-blog.mjs
 *   node scripts/export-wix-blog.mjs --dry-run
 *
 * Prereqs : WIX_API_KEY (ou CMS_PUBLICATION_KEY) + WIX_SITE_ID dans .env.local
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env.local');
const ARTEFACTS = resolve(ROOT, 'project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts');

const DRY_RUN = process.argv.includes('--dry-run');
const WIX_BASE = 'https://www.wixapis.com/blog/v3';

// ─────────────────────────────────────────────────────────────
// Env loading — pattern from scripts/seo-geo/list-blog-posts.mjs
// ─────────────────────────────────────────────────────────────

function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(ENV_PATH);

// Support both key names — routes use WIX_API_KEY, scripts use CMS_PUBLICATION_KEY
const API_KEY = env.WIX_API_KEY || env.CMS_PUBLICATION_KEY;
const SITE_ID = env.WIX_SITE_ID;
const ACCOUNT_ID = env.WIX_MEMBER_ID;

const missing = [];
if (!API_KEY) missing.push('WIX_API_KEY or CMS_PUBLICATION_KEY');
if (!SITE_ID) missing.push('WIX_SITE_ID');
if (missing.length > 0) {
  console.error(`Missing env vars in .env.local: ${missing.join(', ')}`);
  process.exit(1);
}

const WIX_HEADERS = {
  'Authorization': API_KEY,
  'wix-site-id': SITE_ID,
  ...(ACCOUNT_ID ? { 'wix-account-id': ACCOUNT_ID } : {}),
  'Content-Type': 'application/json',
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function wixFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...WIX_HEADERS, ...(options.headers || {}) },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`Wix API ${response.status}: ${JSON.stringify(data, null, 2).slice(0, 500)}`);
  }
  return data;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function slugify(text) {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract image URLs from Ricos JSON nodes (recursive).
 * Ricos IMAGE nodes store URLs in various places depending on version.
 */
function extractImageUrls(nodes) {
  const urls = [];
  if (!Array.isArray(nodes)) return urls;

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;

    // IMAGE node — Ricos v3 stores src as { id: "hash~mv2.ext" }
    if (node.type === 'IMAGE' && node.imageData?.image?.src) {
      const src = node.imageData.image.src;
      // src can be a string URL or an object { id: "hash" }
      if (typeof src === 'string') {
        urls.push(src);
      } else if (src && typeof src === 'object' && src.id) {
        // Build URL from Wix media ID
        urls.push(`https://static.wixstatic.com/media/${src.id}`);
      }
    }

    // Recurse into children
    if (Array.isArray(node.nodes)) {
      urls.push(...extractImageUrls(node.nodes));
    }
  }
  return urls;
}

/**
 * Clean Wix image URL to get original resolution.
 * Wix URLs: .../media/hash.jpg/v1/fill/w_740,h_493.../image.jpg
 * Original: .../media/hash.jpg
 */
function cleanWixImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  // Ensure https
  if (url.startsWith('//')) url = 'https:' + url;
  if (!url.startsWith('http')) url = 'https://static.wixstatic.com/media/' + url;
  const v1Idx = url.indexOf('/v1/');
  return v1Idx > 0 ? url.slice(0, v1Idx) : url;
}

async function downloadImage(url, destPath) {
  try {
    const cleanUrl = cleanWixImageUrl(url);
    if (!cleanUrl) return false;
    const res = await fetch(cleanUrl);
    if (!res.ok) {
      console.error(`   Warning: image download failed (${res.status}): ${cleanUrl}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) {
      console.error(`   Warning: image suspiciously small (${buffer.length} bytes): ${cleanUrl}`);
    }
    writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`   Warning: image download error: ${err.message}`);
    return false;
  }
}

function getExtension(url) {
  try {
    const clean = cleanWixImageUrl(url);
    if (!clean) return '.jpg';
    const ext = extname(new URL(clean).pathname).toLowerCase();
    return ext || '.jpg';
  } catch {
    return '.jpg';
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log(' MW-A1a — Export blog Wix');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log(' MODE: --dry-run (pas de telechargement images)');
  console.log('');

  // Step 1: List all posts
  console.log('Fetching post list...');
  const params = new URLSearchParams();
  params.append('paging.limit', '100');
  params.append('fieldsets', 'URL');
  params.append('fieldsets', 'CONTENT_TEXT');
  params.append('fieldsets', 'SEO');
  params.append('sort', 'PUBLISHED_DATE_DESC');

  const listResult = await wixFetch(`${WIX_BASE}/posts?${params}`);
  const postSummaries = listResult.posts || [];
  console.log(`Found ${postSummaries.length} articles`);
  console.log('');

  // Step 2: Fetch full content for each post
  const metadata = [];
  const imageStats = [];
  const warnings = [];

  for (let i = 0; i < postSummaries.length; i++) {
    const summary = postSummaries[i];
    const postId = summary._id || summary.id;
    const title = summary.title || '(sans titre)';
    const slug = summary.slug || slugify(title);

    console.log(`[${i + 1}/${postSummaries.length}] ${title}`);
    console.log(`  slug: ${slug}  id: ${postId}`);

    // Fetch full post with Ricos JSON
    let fullPost;
    try {
      // GET individual post with RICH_CONTENT fieldset
      // Remove Content-Type header for GET to avoid 400 "Failed to parse JSON"
      const getHeaders = { ...WIX_HEADERS };
      delete getHeaders['Content-Type'];
      const res = await fetch(
        `${WIX_BASE}/posts/${postId}?fieldsets=RICH_CONTENT`,
        { headers: getHeaders }
      );
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
      if (!res.ok) throw new Error(`Wix API ${res.status}: ${JSON.stringify(data, null, 2).slice(0, 300)}`);
      fullPost = data;
    } catch (err) {
      console.error(`  ERROR fetching post: ${err.message.slice(0, 200)}`);
      warnings.push(`Failed to fetch post ${postId} (${title}): ${err.message.slice(0, 100)}`);
      continue;
    }

    const post = fullPost.post || fullPost;

    // Save Ricos JSON
    const ricosDir = resolve(ARTEFACTS, 'blog-ricos');
    ensureDir(ricosDir);
    writeFileSync(
      resolve(ricosDir, `${slug}.json`),
      JSON.stringify(post, null, 2),
      'utf-8'
    );
    console.log(`  Ricos JSON saved`);

    // Extract metadata
    const coverUrl = post.media?.wixMedia?.image?.url
      || post.coverMedia?.image?.url
      || post.media?.wixMedia?.image
      || null;
    const wixUrl = post.url?.path
      ? `https://www.acupuncturejudith.ca${post.url.path}`
      : null;
    const firstPublished = post.firstPublishedDate || summary.firstPublishedDate || null;

    metadata.push({
      id: postId,
      title,
      slug,
      firstPublishedDate: firstPublished,
      excerpt: post.excerpt || summary.excerpt || '',
      coverImageUrl: coverUrl ? cleanWixImageUrl(coverUrl) : null,
      categoryIds: post.categoryIds || summary.categoryIds || [],
      tagIds: post.tagIds || summary.tagIds || [],
      wixUrl,
      author: 'Judith Dufour-Savard',
    });

    // Extract inline images from Ricos content
    const richContent = post.richContent || post.content;
    const inlineNodes = richContent?.nodes || [];
    const inlineImageUrls = extractImageUrls(inlineNodes);
    console.log(`  ${inlineImageUrls.length} inline images found`);

    // Download images
    let coverDownloaded = false;
    let inlineDownloaded = 0;

    if (!DRY_RUN) {
      const imgDir = resolve(ARTEFACTS, 'images', 'blog', slug);
      ensureDir(imgDir);

      // Cover image
      if (coverUrl) {
        const ext = getExtension(coverUrl);
        coverDownloaded = await downloadImage(coverUrl, resolve(imgDir, `cover${ext}`));
        if (coverDownloaded) console.log(`  Cover downloaded`);
      }

      // Inline images
      for (let j = 0; j < inlineImageUrls.length; j++) {
        const imgUrl = inlineImageUrls[j];
        const ext = getExtension(imgUrl);
        const ok = await downloadImage(imgUrl, resolve(imgDir, `inline-${j + 1}${ext}`));
        if (ok) inlineDownloaded++;
      }
      if (inlineImageUrls.length > 0) {
        console.log(`  ${inlineDownloaded}/${inlineImageUrls.length} inline images downloaded`);
      }
    }

    imageStats.push({
      slug,
      title,
      cover: coverDownloaded ? 1 : 0,
      inline: inlineDownloaded,
      inlineTotal: inlineImageUrls.length,
      total: (coverDownloaded ? 1 : 0) + inlineDownloaded,
    });

    console.log('');

    // Small delay to be nice to the API
    await new Promise((r) => setTimeout(r, 300));
  }

  // Step 3: Save metadata
  writeFileSync(
    resolve(ARTEFACTS, 'blog-metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
  console.log(`Metadata saved: ${metadata.length} articles`);

  // Step 4: Generate reports
  const totalImages = imageStats.reduce((s, a) => s + a.total, 0);
  const totalInline = imageStats.reduce((s, a) => s + a.inline, 0);

  // Blog export report
  const report = [
    '# Rapport d\'export blog Wix — MW-A1a',
    '',
    `**Date** : ${new Date().toISOString().slice(0, 10)}`,
    `**Articles exportes** : ${metadata.length}`,
    `**Images telechargees** : ${totalImages} (${imageStats.filter(s => s.cover).length} covers + ${totalInline} inline)`,
    `**Mode** : ${DRY_RUN ? 'dry-run (pas de telechargement)' : 'complet'}`,
    '',
    '## Par article',
    '',
    '| # | Article | Slug | Date | Cover | Inline | Total |',
    '|---|---------|------|------|-------|--------|-------|',
    ...imageStats.map((s, i) =>
      `| ${i + 1} | ${s.title.slice(0, 40)} | ${s.slug} | ${metadata[i]?.firstPublishedDate?.slice(0, 10) || '?'} | ${s.cover} | ${s.inline}/${s.inlineTotal} | ${s.total} |`
    ),
    '',
  ];

  if (warnings.length > 0) {
    report.push('## Warnings', '', ...warnings.map(w => `- ${w}`), '');
  }

  writeFileSync(resolve(ARTEFACTS, 'blog-export-report.md'), report.join('\n'), 'utf-8');

  // Images index
  const imgIndex = [
    '# Index des images Wix telechargees',
    '',
    '## Statistiques',
    `- Total articles : ${metadata.length}`,
    `- Total images : ${totalImages} (covers + inline)`,
    '',
    '## Par article',
    '',
    '| Article | Cover | Inline | Total |',
    '|---------|-------|--------|-------|',
    ...imageStats.map(s => `| ${s.slug} | ${s.cover} | ${s.inline}/${s.inlineTotal} | ${s.total} |`),
    '',
  ];
  ensureDir(resolve(ARTEFACTS, 'images'));
  writeFileSync(resolve(ARTEFACTS, 'images', 'index.md'), imgIndex.join('\n'), 'utf-8');

  console.log('');
  console.log('='.repeat(60));
  console.log(` Done: ${metadata.length} articles, ${totalImages} images`);
  console.log(` Reports: artefacts/blog-export-report.md, artefacts/images/index.md`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
