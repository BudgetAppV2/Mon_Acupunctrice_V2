#!/usr/bin/env node
/**
 * Test Ricos Converter — FAQ Anxiété
 * ===================================
 *
 * Objectif : valider que l'API Wix permet de convertir du Markdown
 * en document Ricos et d'updater une entrée FAQ existante.
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/seo-geo/test-convert-anxiete.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────
// 1. Charge les variables d'environnement depuis .env.local
// ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const ENV_PATH = resolve(ROOT, '.env.local');

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
  console.error('   Requis : CMS_PUBLICATION_KEY, WIX_SITE_ID, WIX_MEMBER_ID');
  process.exit(1);
}

console.log('✅ Credentials chargés');
console.log(`   Site ID    : ${SITE_ID}`);
console.log(`   Account ID : ${ACCOUNT_ID}`);
console.log(`   API Key    : ${API_KEY.slice(0, 20)}... (${API_KEY.length} chars)`);
console.log('');

// ─────────────────────────────────────────────────────────────
// 2. Lit le fichier Markdown source et extrait detailedAnswer
// ─────────────────────────────────────────────────────────────
// Copie locale (évite les problèmes de permissions macOS ~/Documents)
const MD_PATH = resolve(__dirname, 'source/01-acupuncture-anxiete.md');
const TARGET_SLUG = 'acupuncture-anxiete-efficace';
const COLLECTION_ID = 'FAQ';

console.log(`📖 Lecture : ${MD_PATH}`);
const mdContent = readFileSync(MD_PATH, 'utf-8');

function extractField(md, fieldName) {
  const marker = `### CHAMP: ${fieldName}`;
  const startIdx = md.indexOf(marker);
  if (startIdx === -1) return null;
  const afterMarker = md.slice(startIdx + marker.length);
  const nextSectionMatch = afterMarker.match(/\n### CHAMP:|\n---/);
  const endIdx = nextSectionMatch ? nextSectionMatch.index : afterMarker.length;
  return afterMarker.slice(0, endIdx).trim();
}

const detailedAnswerMd = extractField(mdContent, 'detailedAnswer');
if (!detailedAnswerMd) {
  console.error('❌ Impossible de trouver le champ detailedAnswer dans le .md');
  process.exit(1);
}

console.log(`✅ detailedAnswer extrait (${detailedAnswerMd.length} chars)`);
console.log(`   Premier 100 chars : ${detailedAnswerMd.slice(0, 100)}...`);
console.log('');

// ─────────────────────────────────────────────────────────────
// 3. Helpers Wix REST API
// ─────────────────────────────────────────────────────────────
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
      `Wix API ${response.status} ${response.statusText}: ${JSON.stringify(data, null, 2)}`
    );
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// 4. Trouve l'entrée FAQ par son slug
// ─────────────────────────────────────────────────────────────
console.log(`🔍 Recherche de l'entrée FAQ avec slug="${TARGET_SLUG}"...`);

const queryResult = await wixFetch('https://www.wixapis.com/wix-data/v2/items/query', {
  method: 'POST',
  body: JSON.stringify({
    dataCollectionId: COLLECTION_ID,
    query: {
      filter: { slug: TARGET_SLUG },
      paging: { limit: 5 },
    },
  }),
});

const items = queryResult.dataItems || [];
if (items.length === 0) {
  console.error(`❌ Aucune entrée trouvée avec slug="${TARGET_SLUG}"`);
  process.exit(1);
}
if (items.length > 1) {
  console.warn(`⚠️  ${items.length} entrées trouvées, on prend la première`);
}

const faqItem = items[0];
const itemId = faqItem._id || faqItem.data?._id;
console.log(`✅ Entrée trouvée — _id: ${itemId}`);
console.log(`   Title : ${faqItem.data?.title || faqItem.title}`);
console.log('');

// ─────────────────────────────────────────────────────────────
// 5. Convertit le Markdown en document Ricos
// ─────────────────────────────────────────────────────────────
console.log(`🔄 Conversion Markdown → Ricos...`);

const convertResult = await wixFetch('https://www.wixapis.com/ricos/v1/ricos-document/convert/to-ricos', {
  method: 'POST',
  body: JSON.stringify({
    markdown: detailedAnswerMd,
    options: {
      // Les listes à puces/numérotées sont activées par défaut dans Ricos
      // (pas dans la liste des plugins optionnels). On active juste les extras.
      plugins: ['HEADING', 'LINK', 'DIVIDER'],
    },
  }),
});

const ricosDocument = convertResult.document;
if (!ricosDocument) {
  console.error('❌ Pas de document Ricos retourné par l\'API');
  console.error(JSON.stringify(convertResult, null, 2));
  process.exit(1);
}

const nodeCount = ricosDocument.nodes?.length || 0;
console.log(`✅ Document Ricos généré — ${nodeCount} nodes`);
const nodeTypes = (ricosDocument.nodes || []).map(n => n.type).slice(0, 15);
console.log(`   Types de nodes : ${nodeTypes.join(', ')}${nodeCount > 15 ? '...' : ''}`);
console.log('');

// ─────────────────────────────────────────────────────────────
// 6. Patch l'entrée FAQ avec le nouveau detailedAnswer (Ricos)
// ─────────────────────────────────────────────────────────────
console.log(`💾 Mise à jour de l'entrée FAQ avec le nouveau detailedAnswer...`);

await wixFetch(
  `https://www.wixapis.com/wix-data/v2/items/${itemId}`,
  {
    method: 'PATCH',
    body: JSON.stringify({
      dataCollectionId: COLLECTION_ID,
      patch: {
        dataItemId: itemId,
        fieldModifications: [
          {
            fieldPath: 'detailedAnswer',
            action: 'SET_FIELD',
            setFieldOptions: {
              value: ricosDocument,
            },
          },
        ],
      },
    }),
  }
);

console.log(`✅ Entrée mise à jour avec succès !`);
console.log('');
console.log('━'.repeat(60));
console.log('🎉 TEST RÉUSSI');
console.log('━'.repeat(60));
console.log('');
console.log('Vérifie le résultat live ici :');
console.log('  https://www.acupuncturejudith.ca/faq/acupuncture-anxiete-efficace');
console.log('');
