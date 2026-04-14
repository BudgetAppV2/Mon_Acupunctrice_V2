#!/usr/bin/env node
/**
 * Migrate Wix Blog → Firestore + Firebase Storage — MW-B4
 * =========================================================
 *
 * Lit les 11 articles Ricos JSON exportes par MW-A1a, les convertit en
 * markdown via ricos-to-markdown.mjs, uploade les images (cover + inline)
 * vers Firebase Storage sous public/blog/{slug}/, et ecrit les documents
 * PublicBlogPost dans Firestore collection publicBlog.
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/migrate-wix-blog.mjs --dry-run
 *   node scripts/migrate-wix-blog.mjs
 *
 * Prereqs : FIREBASE_SERVICE_ACCOUNT dans .env.local
 *           WIX_API_KEY ou CMS_PUBLICATION_KEY + WIX_SITE_ID (pour categories)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { ricosToMarkdown, extractImageUrlsFromRicos } from './ricos-to-markdown.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env.local');
const ARTEFACTS = resolve(ROOT, 'project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts');
const REPORT_DIR = resolve(ROOT, 'project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/artefacts');

const DRY_RUN = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────────────────────
// Env loading (pattern from export-wix-blog.mjs)
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

// Firebase Admin — self-initialized (QS1: ne pas importer lib/firebase-admin.ts)
const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);
const storageBucket = env.FIREBASE_STORAGE_BUCKET
  || `${serviceAccount.project_id}.firebasestorage.app`;
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket,
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

// Wix API — for category resolution (QS2)
const WIX_API_KEY = env.WIX_API_KEY || env.CMS_PUBLICATION_KEY;
const WIX_SITE_ID = env.WIX_SITE_ID;
const WIX_MEMBER_ID = env.WIX_MEMBER_ID;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return map[ext] || 'application/octet-stream';
}

async function uploadToStorage(localPath, storagePath) {
  const file = bucket.file(storagePath);
  await file.save(readFileSync(localPath), {
    metadata: { contentType: getMimeType(localPath) },
    // Pas de { public: true } — instable avec UBLA. Lecture publique
    // geree par storage.rules match /public/{allPaths=**} (L3)
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;
}

async function fetchWixCategories() {
  if (!WIX_API_KEY || !WIX_SITE_ID) return new Map();
  try {
    const headers = {
      'Authorization': WIX_API_KEY,
      'wix-site-id': WIX_SITE_ID,
      ...(WIX_MEMBER_ID ? { 'wix-account-id': WIX_MEMBER_ID } : {}),
    };
    const res = await fetch('https://www.wixapis.com/blog/v3/categories?paging.limit=100', { headers });
    if (!res.ok) return new Map();
    const data = await res.json();
    const map = new Map();
    for (const cat of data.categories || []) {
      map.set(cat._id || cat.id, cat.label || cat.title || cat.slug || '?');
    }
    return map;
  } catch {
    return new Map();
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log(' MW-B4 — Migration blog Wix → Firestore');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log(' MODE: --dry-run (pas d\'upload ni d\'ecriture Firestore)');
  console.log('');

  // Step 1: Load metadata
  const metadataPath = resolve(ARTEFACTS, 'blog-metadata.json');
  if (!existsSync(metadataPath)) {
    console.error('blog-metadata.json not found. Run MW-A1a first.');
    process.exit(1);
  }
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  console.log(`Loaded metadata for ${metadata.length} articles`);

  // Step 2: Fetch Wix categories for ID → name resolution
  console.log('Fetching Wix categories...');
  const categoryMap = await fetchWixCategories();
  console.log(`  ${categoryMap.size} categories resolved`);
  console.log('');

  // Step 3: Process each article
  const results = [];
  const warnings = [];

  for (let i = 0; i < metadata.length; i++) {
    const meta = metadata[i];
    const slug = meta.slug;
    console.log(`[${i + 1}/${metadata.length}] ${meta.title}`);
    console.log(`  slug: ${slug}`);

    // Read Ricos JSON
    const ricosPath = resolve(ARTEFACTS, 'blog-ricos', `${slug}.json`);
    if (!existsSync(ricosPath)) {
      console.error(`  Ricos JSON not found: ${ricosPath}`);
      warnings.push(`Missing Ricos JSON for ${slug}`);
      continue;
    }

    const ricosData = JSON.parse(readFileSync(ricosPath, 'utf-8'));
    const post = ricosData.post || ricosData;
    const richContent = post.richContent;

    if (!richContent) {
      console.error(`  No richContent in Ricos JSON`);
      warnings.push(`No richContent for ${slug}`);
      continue;
    }

    // Parse Ricos → Markdown
    let markdown = ricosToMarkdown(richContent);
    const mdLineCount = markdown.split('\n').length;
    console.log(`  Markdown: ${mdLineCount} lines`);

    // Extract inline image URLs from Ricos (same order as export-wix-blog.mjs)
    const inlineWixUrls = extractImageUrlsFromRicos(richContent);
    console.log(`  Inline images: ${inlineWixUrls.length}`);

    // Upload images and replace URLs
    let coverStorageUrl = '';
    let imagesUploaded = 0;
    const imagesDir = resolve(ARTEFACTS, 'images', 'blog', slug);

    if (!DRY_RUN && existsSync(imagesDir)) {
      const files = readdirSync(imagesDir);

      // Cover image
      const coverFile = files.find((f) => f.startsWith('cover'));
      if (coverFile) {
        const localPath = resolve(imagesDir, coverFile);
        const storagePath = `public/blog/${slug}/${coverFile}`;
        coverStorageUrl = await uploadToStorage(localPath, storagePath);
        imagesUploaded++;
        console.log(`  Cover uploaded: ${coverFile}`);
      }

      // Inline images — match by position
      for (let j = 0; j < inlineWixUrls.length; j++) {
        const inlineFile = files.find((f) => f.startsWith(`inline-${j + 1}`));
        if (!inlineFile) {
          warnings.push(`${slug}: missing local file for inline-${j + 1}`);
          continue;
        }
        const localPath = resolve(imagesDir, inlineFile);
        const storagePath = `public/blog/${slug}/${inlineFile}`;
        const storageUrl = await uploadToStorage(localPath, storagePath);
        imagesUploaded++;

        // Replace Wix URL in markdown with Storage URL
        const wixUrl = inlineWixUrls[j];
        markdown = markdown.split(wixUrl).join(storageUrl);
      }
      console.log(`  ${imagesUploaded} images uploaded`);
    } else if (DRY_RUN) {
      console.log(`  [dry-run] Would upload cover + ${inlineWixUrls.length} inline images`);
    }

    // Detect Claire Thomas co-author
    const isCoAuthor = markdown.includes('Claire Thomas');
    const author = isCoAuthor
      ? 'Judith Dufour-Savard et Claire Thomas'
      : 'Judith Dufour-Savard';

    // Resolve category
    const categoryIds = meta.categoryIds || [];
    const categoryName = categoryIds.length > 0
      ? (categoryMap.get(categoryIds[0]) || categoryIds[0])
      : '';

    // Build PublicBlogPost document
    const doc = {
      title: meta.title,
      slug,
      content: markdown,
      excerpt: meta.excerpt || '',
      coverImage: coverStorageUrl || meta.coverImageUrl || '',
      author,
      category: categoryName,
      tags: [],
      status: 'published',
      relatedServices: [],
      relatedFaqs: [],
      relatedArticles: [],
      wixPostId: meta.id,
      publishedAt: meta.firstPublishedDate
        ? Timestamp.fromDate(new Date(meta.firstPublishedDate))
        : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!DRY_RUN) {
      // Idempotent: .doc(slug).set() overwrites, no duplicates
      await db.collection('publicBlog').doc(slug).set(doc);
      console.log(`  Written to Firestore: publicBlog/${slug}`);
    } else {
      console.log(`  [dry-run] Would write publicBlog/${slug}`);
      console.log(`    title: ${doc.title.slice(0, 50)}`);
      console.log(`    author: ${doc.author}`);
      console.log(`    category: ${doc.category}`);
      console.log(`    markdown: ${mdLineCount} lines`);
      console.log(`    images: cover + ${inlineWixUrls.length} inline`);
    }

    results.push({
      slug,
      title: meta.title,
      mdLines: mdLineCount,
      images: imagesUploaded || (1 + inlineWixUrls.length),
      author,
      category: categoryName,
      status: 'OK',
    });

    console.log('');
  }

  // Step 4: Generate report
  ensureDir(REPORT_DIR);
  const reportLines = [
    '# Rapport de migration blog Wix → Firestore',
    '',
    `**Date** : ${new Date().toISOString().slice(0, 10)}`,
    `**Articles migres** : ${results.length}`,
    `**Images uploadees** : ${results.reduce((s, r) => s + r.images, 0)}`,
    `**Mode** : ${DRY_RUN ? 'dry-run' : 'complet'}`,
    '',
    '## Par article',
    '',
    '| # | Titre | Slug | Markdown (lignes) | Images | Auteur | Status |',
    '|---|-------|------|-------------------|--------|--------|--------|',
    ...results.map((r, i) =>
      `| ${i + 1} | ${r.title.slice(0, 45)} | ${r.slug} | ${r.mdLines} | ${r.images} | ${r.author.includes('Claire') ? 'Co-ecrit' : 'Judith'} | ${r.status} |`
    ),
    '',
  ];

  if (warnings.length > 0) {
    reportLines.push('## Warnings', '', ...warnings.map((w) => `- ${w}`), '');
  }

  writeFileSync(resolve(REPORT_DIR, 'migration-report.md'), reportLines.join('\n'), 'utf-8');

  console.log('='.repeat(60));
  console.log(` Done: ${results.length} articles, ${results.reduce((s, r) => s + r.images, 0)} images`);
  console.log(` Report: ${resolve(REPORT_DIR, 'migration-report.md')}`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
