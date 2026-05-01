#!/usr/bin/env node
/**
 * Publish All Resources — Insert 5 ressources piliers dans Wix CMS
 * ==================================================================
 *
 * Pour chaque fichier .md dans source-resources/ :
 *  1. Extrait tous les champs via ### CHAMP: xxx
 *  2. Convertit les champs Rich Text (Markdown → Ricos via API Wix)
 *  3. INSERT l'entrée dans la collection "Resources"
 *
 * Prérequis :
 *  - Collection "Resources" créée dans Wix avec TOUS les champs
 *    (voir instructions-extension-collection-resources.md)
 *  - Variables dans .env.local : CMS_PUBLICATION_KEY, WIX_SITE_ID, WIX_MEMBER_ID
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/seo-geo/publish-all-resources.mjs
 *
 * Options :
 *   --dry-run    Affiche ce qui serait publié sans rien envoyer
 *   --update     Utilise PATCH au lieu de INSERT (pour mettre à jour des entrées existantes)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const ENV_PATH = resolve(ROOT, '.env.local');
const SOURCE_DIR = resolve(__dirname, 'source-resources');

const DRY_RUN = process.argv.includes('--dry-run');
const UPDATE_MODE = process.argv.includes('--update');

const COLLECTION_ID = 'Resources';

// ─────────────────────────────────────────────────────────────
// Champs de la collection et leurs types
// ─────────────────────────────────────────────────────────────
const RICH_TEXT_FIELDS = [
  'shortAnswer',
  'introSection',
  'scienceSection',
  'mechanismSection',
  'judithApproach',
  'whatToExpect',
  'protocolSection',
  'testimonial',
];

const PLAIN_TEXT_FIELDS = [
  'title',
  'slug',
  'category',
  'metaTitle',
  'metaDescription',
  'heroImageAlt',
  'relatedFaqSlugs',
  'authorName',
];

const DATE_FIELDS = [
  'publishedDate',
  'updatedDate',
];

// ─────────────────────────────────────────────────────────────
// Helpers
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
  // Cherche le prochain marqueur CHAMP: ou --- ou ## NOTES
  const nextSectionMatch = afterMarker.match(/\n### CHAMP:|\n---|\n## NOTES/);
  const endIdx = nextSectionMatch ? nextSectionMatch.index : afterMarker.length;
  return afterMarker.slice(0, endIdx).trim();
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
// Convertir Markdown → Ricos via API Wix
// ─────────────────────────────────────────────────────────────
async function markdownToRicos(markdown) {
  if (!markdown || markdown.trim() === '') return null;

  const result = await wixFetch(
    'https://www.wixapis.com/ricos/v1/ricos-document/convert/to-ricos',
    {
      method: 'POST',
      body: JSON.stringify({
        markdown,
        options: { plugins: ['HEADING', 'LINK', 'DIVIDER'] },
      }),
    }
  );

  return result.document || null;
}

// ─────────────────────────────────────────────────────────────
// Trouver une entrée existante par slug (pour mode --update)
// ─────────────────────────────────────────────────────────────
async function findBySlug(slug) {
  const queryResult = await wixFetch(
    'https://www.wixapis.com/wix-data/v2/items/query',
    {
      method: 'POST',
      body: JSON.stringify({
        dataCollectionId: COLLECTION_ID,
        query: { filter: { slug }, paging: { limit: 5 } },
      }),
    }
  );
  const items = queryResult.dataItems || [];
  return items.length > 0 ? items[0] : null;
}

// ─────────────────────────────────────────────────────────────
// Fonction principale : traiter un fichier ressource
// ─────────────────────────────────────────────────────────────
async function processResource(fileName, index, total) {
  const prefix = `[${index + 1}/${total}]`;
  console.log(`${prefix} 📄 ${fileName}`);

  // 1. Lire le fichier .md
  const mdPath = resolve(SOURCE_DIR, fileName);
  const mdContent = readFileSync(mdPath, 'utf-8');

  // 2. Extraire tous les champs
  const slug = extractField(mdContent, 'slug');
  const title = extractField(mdContent, 'title');

  if (!slug || !title) {
    console.error(`${prefix} ❌ slug ou title manquant`);
    return { ok: false, file: fileName, error: 'missing-required-field' };
  }

  console.log(`${prefix}    slug: ${slug}`);
  console.log(`${prefix}    title: ${title.substring(0, 60)}...`);

  // 3. Construire l'objet data avec les champs plain text
  const data = {};

  for (const field of PLAIN_TEXT_FIELDS) {
    const value = extractField(mdContent, field);
    if (value !== null) {
      data[field] = value;
    }
  }

  // 4. Convertir les dates
  for (const field of DATE_FIELDS) {
    const value = extractField(mdContent, field);
    if (value) {
      data[field] = value; // Wix accepte ISO string pour les dates
    }
  }

  // 5. Convertir les champs Rich Text → Ricos
  let ricosCount = 0;
  for (const field of RICH_TEXT_FIELDS) {
    const markdown = extractField(mdContent, field);
    if (markdown && markdown.trim()) {
      if (DRY_RUN) {
        console.log(`${prefix}    ${field}: ${markdown.length} chars (skip Ricos en dry-run)`);
        data[field] = markdown; // En dry-run, on met juste le texte
      } else {
        try {
          const ricos = await markdownToRicos(markdown);
          if (ricos) {
            data[field] = ricos;
            ricosCount++;
            const nodeCount = ricos.nodes?.length || 0;
            console.log(`${prefix}    ${field}: ${markdown.length} chars → ${nodeCount} Ricos nodes`);
          } else {
            console.warn(`${prefix}    ⚠️ ${field}: conversion Ricos a retourné null`);
          }
        } catch (err) {
          console.error(`${prefix}    ❌ ${field}: erreur Ricos — ${err.message.split('\n')[0]}`);
          // Fallback : on ne met pas le champ plutôt que de planter
        }
      }
    }
  }

  console.log(`${prefix}    Total: ${Object.keys(data).length} champs, ${ricosCount} convertis en Ricos`);

  if (DRY_RUN) {
    console.log(`${prefix} 🔍 DRY RUN — aucune publication`);
    console.log(`${prefix}    Champs: ${Object.keys(data).join(', ')}`);
    console.log('');
    return { ok: true, file: fileName, slug, dryRun: true };
  }

  // 6. Publier dans Wix
  if (UPDATE_MODE) {
    // Mode UPDATE : trouver l'entrée existante et la mettre à jour
    const existing = await findBySlug(slug);
    if (!existing) {
      console.error(`${prefix} ❌ Mode --update mais aucune entrée avec slug=${slug}`);
      return { ok: false, file: fileName, error: 'not-found-for-update' };
    }

    const itemId = existing._id || existing.data?._id;
    console.log(`${prefix}    Entrée existante trouvée: ${itemId}`);

    // Construire les fieldModifications pour PATCH
    const fieldModifications = Object.entries(data).map(([fieldPath, value]) => ({
      fieldPath,
      action: 'SET_FIELD',
      setFieldOptions: { value },
    }));

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

    console.log(`${prefix} ✅ Mise à jour réussie (PATCH)`);
  } else {
    // Mode INSERT : créer une nouvelle entrée
    const insertResult = await wixFetch(
      'https://www.wixapis.com/wix-data/v2/items',
      {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: COLLECTION_ID,
          dataItem: { data },
        }),
      }
    );

    const newId = insertResult.dataItem?._id || insertResult.dataItem?.data?._id || 'unknown';
    console.log(`${prefix} ✅ Insertion réussie (INSERT) — _id: ${newId}`);
  }

  console.log('');
  return { ok: true, file: fileName, slug };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
console.log('━'.repeat(60));
console.log(`🚀 Publication des Ressources piliers${DRY_RUN ? ' (DRY RUN)' : ''}${UPDATE_MODE ? ' (UPDATE)' : ''}`);
console.log(`   Collection: ${COLLECTION_ID}`);
console.log(`   Source: ${SOURCE_DIR}`);
console.log('━'.repeat(60));
console.log('');

// Lister les fichiers .md dans source-resources/
const files = readdirSync(SOURCE_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

if (files.length === 0) {
  console.error('❌ Aucun fichier .md trouvé dans source-resources/');
  process.exit(1);
}

console.log(`📁 ${files.length} fichiers trouvés: ${files.join(', ')}`);
console.log('');

const results = [];

for (let i = 0; i < files.length; i++) {
  try {
    const result = await processResource(files[i], i, files.length);
    results.push(result);
  } catch (err) {
    console.error(`[${i + 1}/${files.length}] 💥 ${files[i]}`);
    console.error(`    ${err.message.split('\n')[0]}`);
    console.error('');
    results.push({ ok: false, file: files[i], error: err.message });
  }

  // Petit délai entre les appels pour ne pas rate-limiter l'API Wix
  if (i < files.length - 1 && !DRY_RUN) {
    await new Promise(r => setTimeout(r, 1000));
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

if (successes.length > 0 && !DRY_RUN) {
  console.log('URLs à vérifier :');
  for (const s of successes) {
    console.log(`  https://www.acupuncturejudith.ca/ressources/${s.slug}`);
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

if (DRY_RUN) {
  console.log('🔍 Dry run terminé. Relancez sans --dry-run pour publier.');
} else {
  console.log('🎉 Toutes les ressources ont été publiées !');
  console.log('');
  console.log('⚠️  Prochaines étapes manuelles :');
  console.log('   1. Ajouter les images hero dans chaque entrée Wix');
  console.log('   2. Vérifier le rendu sur le site live');
  console.log('   3. Soumettre les URLs à Google Search Console');
}
