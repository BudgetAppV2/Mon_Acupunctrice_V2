#!/usr/bin/env node
/**
 * retire.mjs — Archive/retire une ressource
 * 
 * Usage : node content/scripts/retire.mjs <collection> <slug> [--delete]
 * 
 * Par défaut, met le statut à "draft" (retire du site public).
 * Avec --delete, supprime le document de Firestore.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[k] = v;
  }
  return env;
}

const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');
const collection = args[0];
const slug = args[1];

if (!collection || !slug) {
  console.log('Usage: node content/scripts/retire.mjs <collection> <slug> [--delete]');
  console.log('  collection: ressources | faqs | publicBlog');
  console.log('  --delete: supprime le document (au lieu de le mettre en draft)');
  process.exit(1);
}

const env = loadEnv(resolve(ROOT, '.env.local'));
initializeApp({ credential: cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();

const docRef = db.collection(collection).doc(slug);
const doc = await docRef.get();

if (!doc.exists) {
  console.error(`❌ Document ${collection}/${slug} non trouvé`);
  process.exit(1);
}

if (shouldDelete) {
  await docRef.delete();
  console.log(`🗑️  ${collection}/${slug} SUPPRIMÉ de Firestore`);
} else {
  await docRef.update({ status: 'draft', updatedAt: new Date() });
  console.log(`📦 ${collection}/${slug} archivé (status → draft)`);
}

console.log('💡 Le site se rafraîchira via ISR dans ~1h. Pour un refresh immédiat, redéployez.');
process.exit(0);
