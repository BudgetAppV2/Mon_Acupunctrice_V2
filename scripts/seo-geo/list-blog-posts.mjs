#!/usr/bin/env node
/**
 * List Blog Posts — Inventaire du blog Wix existant
 * ===================================================
 *
 * Récupère la liste complète des articles de blog publiés sur
 * acupuncturejudith.ca via l'API Wix Blog v3.
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/seo-geo/list-blog-posts.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const ENV_PATH = resolve(ROOT, '.env.local');
const OUTPUT_PATH = resolve(__dirname, 'blog-inventory.json');

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
const API_KEY = env.CMS_PUBLICATION_KEY;
const SITE_ID = env.WIX_SITE_ID;
const ACCOUNT_ID = env.WIX_MEMBER_ID;

if (!API_KEY || !SITE_ID || !ACCOUNT_ID) {
  console.error('❌ Credentials manquants dans .env.local');
  process.exit(1);
}

const WIX_HEADERS = {
  'Authorization': API_KEY,
  'wix-site-id': SITE_ID,
  'wix-account-id': ACCOUNT_ID,
  'Content-Type': 'application/json',
};

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
    throw new Error(
      `Wix API ${response.status}: ${JSON.stringify(data, null, 2)}`
    );
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// Fetch catégories et tags pour avoir les noms lisibles
// ─────────────────────────────────────────────────────────────
console.log('🏷️  Récupération des catégories et tags...');

const categoriesResult = await wixFetch(
  'https://www.wixapis.com/blog/v3/categories?paging.limit=100',
  { method: 'GET' }
).catch((err) => {
  console.warn(`   ⚠️  Catégories: ${err.message.split('\n')[0]}`);
  return { categories: [] };
});

const tagsResult = await wixFetch(
  'https://www.wixapis.com/blog/v3/tags?paging.limit=100',
  { method: 'GET' }
).catch((err) => {
  console.warn(`   ⚠️  Tags: ${err.message.split('\n')[0]}`);
  return { tags: [] };
});

// Map ID → label pour lookup rapide
const categoryMap = new Map();
for (const cat of categoriesResult.categories || []) {
  categoryMap.set(cat._id || cat.id, cat.label || cat.title || cat.slug || '?');
}
const tagMap = new Map();
for (const tag of tagsResult.tags || []) {
  tagMap.set(tag._id || tag.id, tag.label || tag.slug || '?');
}

console.log(`   ${categoryMap.size} catégories, ${tagMap.size} tags`);
console.log('');

// ─────────────────────────────────────────────────────────────
// Fetch la liste des articles de blog publiés
// ─────────────────────────────────────────────────────────────
console.log('📚 Récupération des articles de blog...');
console.log('');

// On demande fieldsets URL + CONTENT_TEXT + SEO pour avoir le max d'info
const params = new URLSearchParams();
params.append('paging.limit', '100');
params.append('fieldsets', 'URL');
params.append('fieldsets', 'CONTENT_TEXT');
params.append('fieldsets', 'SEO');
params.append('sort', 'PUBLISHED_DATE_DESC');

const url = `https://www.wixapis.com/blog/v3/posts?${params.toString()}`;
const result = await wixFetch(url, { method: 'GET' });

const posts = result.posts || [];
const total = result.metaData?.total || posts.length;

console.log(`✅ ${posts.length} articles récupérés (${total} au total)`);
console.log('');

// ─────────────────────────────────────────────────────────────
// Affiche un résumé lisible
// ─────────────────────────────────────────────────────────────
console.log('━'.repeat(70));
console.log('📋 INVENTAIRE DU BLOG');
console.log('━'.repeat(70));
console.log('');

const inventory = posts.map((post, i) => {
  const date = post.firstPublishedDate ? post.firstPublishedDate.slice(0, 10) : '?';
  const readTime = post.minutesToRead || '?';
  const excerpt = (post.excerpt || '').slice(0, 100);
  const slug = post.slug || '?';
  const title = post.title || '(sans titre)';
  const url = post.url?.path ? `https://www.acupuncturejudith.ca${post.url.path}` : '?';
  const contentPreview = (post.contentText || '').slice(0, 150).replace(/\s+/g, ' ');

  // Résolution des IDs vers noms lisibles
  const categoryNames = (post.categoryIds || []).map((id) => categoryMap.get(id) || `(id:${id.slice(0,8)})`);
  const tagNames = (post.tagIds || []).map((id) => tagMap.get(id) || `(id:${id.slice(0,8)})`);

  console.log(`[${String(i + 1).padStart(2, '0')}] ${title}`);
  console.log(`     📅 ${date}  ⏱️  ${readTime} min  🔗 ${slug}`);
  console.log(`     ${url}`);
  if (categoryNames.length > 0) console.log(`     🗂️  Catégories: ${categoryNames.join(', ')}`);
  if (tagNames.length > 0) console.log(`     🏷️  Tags: ${tagNames.join(', ')}`);
  if (excerpt) console.log(`     💬 ${excerpt}${excerpt.length >= 100 ? '...' : ''}`);
  console.log('');

  return {
    index: i + 1,
    id: post._id || post.id,
    title,
    slug,
    url,
    firstPublishedDate: post.firstPublishedDate,
    lastPublishedDate: post.lastPublishedDate,
    minutesToRead: post.minutesToRead,
    excerpt: post.excerpt,
    contentPreview,
    categoryIds: post.categoryIds || [],
    categoryNames,
    tagIds: post.tagIds || [],
    tagNames,
    hashtags: post.hashtags || [],
    featured: post.featured,
    pinned: post.pinned,
    language: post.language,
  };
});

// Sauvegarde le JSON complet pour usage ultérieur
writeFileSync(OUTPUT_PATH, JSON.stringify({
  fetchedAt: new Date().toISOString(),
  totalPosts: inventory.length,
  categories: Array.from(categoryMap.entries()).map(([id, label]) => ({ id, label })),
  tags: Array.from(tagMap.entries()).map(([id, label]) => ({ id, label })),
  posts: inventory,
}, null, 2), 'utf-8');

console.log('━'.repeat(70));
console.log(`💾 Inventaire sauvegardé : ${OUTPUT_PATH}`);
console.log('━'.repeat(70));
console.log('');

// ─────────────────────────────────────────────────────────────
// Résumé par catégorie (distribution stratégique)
// ─────────────────────────────────────────────────────────────
console.log('📊 DISTRIBUTION PAR CATÉGORIE');
console.log('─'.repeat(70));

const categoryCounts = new Map();
for (const post of inventory) {
  if (post.categoryNames.length === 0) {
    categoryCounts.set('(sans catégorie)', (categoryCounts.get('(sans catégorie)') || 0) + 1);
  } else {
    for (const cat of post.categoryNames) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }
  }
}

const sorted = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sorted) {
  const bar = '█'.repeat(count * 2);
  console.log(`  ${cat.padEnd(30)} ${bar} ${count}`);
}
console.log('');

// Catégories Wix disponibles (utiles pour savoir ce qui existe)
if (categoryMap.size > 0) {
  console.log('🗂️  CATÉGORIES WIX DISPONIBLES:');
  for (const [id, label] of categoryMap) {
    console.log(`  • ${label}  (id: ${id.slice(0, 8)}...)`);
  }
  console.log('');
}

if (tagMap.size > 0) {
  console.log('🏷️  TAGS WIX DISPONIBLES:');
  for (const [id, label] of tagMap) {
    console.log(`  • ${label}  (id: ${id.slice(0, 8)}...)`);
  }
  console.log('');
}
