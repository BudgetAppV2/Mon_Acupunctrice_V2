#!/usr/bin/env node
/**
 * Publish All FAQ — Convertit les 6 detailedAnswer Markdown → Ricos
 * ===================================================================
 *
 * Boucle sur les 6 fichiers .md dans source/, et pour chacun :
 *  1. Extrait le slug et le detailedAnswer
 *  2. Trouve l'entrée Wix par slug
 *  3. Convertit le Markdown en Ricos via l'API Wix
 *  4. PATCH l'entrée pour mettre à jour detailedAnswer
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/seo-geo/publish-all-faq.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const ENV_PATH = resolve(ROOT, '.env.local');

// ─────────────────────────────────────────────────────────────
// Liste des FAQ à traiter (ordre d'exécution)
// ─────────────────────────────────────────────────────────────
const FAQ_FILES = [
  '01-acupuncture-anxiete.md',
  '02-combien-seances-fiv.md',
  '03-acupuncture-securitaire-fiv.md',
  '04-tomber-enceinte-naturellement.md',
  '05-nausees-grossesse.md',
  '06-bebe-siege-moxibustion.md',
];

const COLLECTION_ID = 'FAQ';

// ─────────────────────────────────────────────────────────────
// Helpers : env loader + extract field + Wix fetch
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

function extractField(md, fieldName) {
  const marker = `### CHAMP: ${fieldName}`;
  const startIdx = md.indexOf(marker);
  if (startIdx === -1) return null;
  const afterMarker = md.slice(startIdx + marker.length);
  const nextSectionMatch = afterMarker.match(/\n### CHAMP:|\n---/);
  const endIdx = nextSectionMatch ? nextSectionMatch.index : afterMarker.length;
  return afterMarker.slice(0, endIdx).trim();
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
// Fonction principale : process une seule FAQ
// ─────────────────────────────────────────────────────────────
async function processFaq(fileName, index, total) {
  const prefix = `[${index + 1}/${total}]`;
  console.log(`${prefix} 📄 ${fileName}`);

  // 1. Lit le fichier .md
  const mdPath = resolve(__dirname, 'source', fileName);
  const mdContent = readFileSync(mdPath, 'utf-8');

  // 2. Extrait slug et detailedAnswer (obligatoires)
  const slug = extractField(mdContent, 'slug');
  const detailedAnswerMd = extractField(mdContent, 'detailedAnswer');

  if (!slug || !detailedAnswerMd) {
    console.error(`${prefix} ❌ slug ou detailedAnswer manquant`);
    return { ok: false, file: fileName, error: 'missing-field' };
  }

  // 2b. Extrait les champs de liens internes (optionnels)
  const featuredBlogSlug = extractField(mdContent, 'featuredBlogSlug') || '';
  const relatedFaqSlugs = extractField(mdContent, 'relatedFaqSlugs') || '';
  const resourcePillarSlug = extractField(mdContent, 'resourcePillarSlug') || '';

  console.log(`${prefix}    slug: ${slug}`);
  console.log(`${prefix}    detailedAnswer: ${detailedAnswerMd.length} chars`);
  if (featuredBlogSlug) console.log(`${prefix}    featuredBlog: ${featuredBlogSlug}`);
  if (relatedFaqSlugs) console.log(`${prefix}    relatedFaqs: ${relatedFaqSlugs}`);
  if (resourcePillarSlug) console.log(`${prefix}    resourcePillar: ${resourcePillarSlug}`);

  // 3. Query Wix pour trouver l'entrée
  const queryResult = await wixFetch('https://www.wixapis.com/wix-data/v2/items/query', {
    method: 'POST',
    body: JSON.stringify({
      dataCollectionId: COLLECTION_ID,
      query: { filter: { slug }, paging: { limit: 5 } },
    }),
  });

  const items = queryResult.dataItems || [];
  if (items.length === 0) {
    console.error(`${prefix} ❌ Aucune entrée trouvée avec slug=${slug}`);
    return { ok: false, file: fileName, error: 'not-found' };
  }

  const faqItem = items[0];
  const itemId = faqItem._id || faqItem.data?._id;
  console.log(`${prefix}    _id: ${itemId}`);

  // 4. Convert Markdown → Ricos
  const convertResult = await wixFetch('https://www.wixapis.com/ricos/v1/ricos-document/convert/to-ricos', {
    method: 'POST',
    body: JSON.stringify({
      markdown: detailedAnswerMd,
      options: { plugins: ['HEADING', 'LINK', 'DIVIDER'] },
    }),
  });

  const ricosDocument = convertResult.document;
  if (!ricosDocument) {
    console.error(`${prefix} ❌ Pas de document Ricos retourné`);
    return { ok: false, file: fileName, error: 'no-ricos' };
  }

  const nodeCount = ricosDocument.nodes?.length || 0;
  console.log(`${prefix}    Ricos: ${nodeCount} nodes`);

  // 5. PATCH l'entrée avec detailedAnswer + liens internes
  const fieldModifications = [
    {
      fieldPath: 'detailedAnswer',
      action: 'SET_FIELD',
      setFieldOptions: { value: ricosDocument },
    },
    {
      fieldPath: 'featuredBlogSlug',
      action: 'SET_FIELD',
      setFieldOptions: { value: featuredBlogSlug },
    },
    {
      fieldPath: 'relatedFaqSlugs',
      action: 'SET_FIELD',
      setFieldOptions: { value: relatedFaqSlugs },
    },
    {
      fieldPath: 'resourcePillarSlug',
      action: 'SET_FIELD',
      setFieldOptions: { value: resourcePillarSlug },
    },
  ];

  await wixFetch(
    `https://www.wixapis.com/wix-data/v2/items/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        dataCollectionId: COLLECTION_ID,
        patch: {
          dataItemId: itemId,
          fieldModifications,
        },
      }),
    }
  );

  console.log(`${prefix} ✅ Mise à jour réussie`);
  console.log('');
  return { ok: true, file: fileName, slug, itemId, nodeCount };
}

// ─────────────────────────────────────────────────────────────
// Main : boucle sur toutes les FAQ
// ─────────────────────────────────────────────────────────────
console.log('━'.repeat(60));
console.log('🚀 Publication de toutes les FAQ');
console.log('━'.repeat(60));
console.log('');

const results = [];

for (let i = 0; i < FAQ_FILES.length; i++) {
  try {
    const result = await processFaq(FAQ_FILES[i], i, FAQ_FILES.length);
    results.push(result);
  } catch (err) {
    console.error(`[${i + 1}/${FAQ_FILES.length}] 💥 ${FAQ_FILES[i]}`);
    console.error(`    ${err.message.split('\n')[0]}`);
    console.error('');
    results.push({ ok: false, file: FAQ_FILES[i], error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────
// Résumé final
// ─────────────────────────────────────────────────────────────
console.log('━'.repeat(60));
console.log('📊 RÉSUMÉ');
console.log('━'.repeat(60));

const successes = results.filter(r => r.ok);
const failures = results.filter(r => !r.ok);

console.log(`✅ Réussites : ${successes.length}/${results.length}`);
console.log(`❌ Échecs    : ${failures.length}/${results.length}`);
console.log('');

if (successes.length > 0) {
  console.log('URLs à vérifier :');
  for (const s of successes) {
    console.log(`  https://www.acupuncturejudith.ca/faq/${s.slug}`);
  }
  console.log('');
}

if (failures.length > 0) {
  console.log('Échecs :');
  for (const f of failures) {
    console.log(`  ${f.file} → ${f.error}`);
  }
  process.exit(1);
}

console.log('🎉 Toutes les FAQ ont été mises à jour avec succès !');
