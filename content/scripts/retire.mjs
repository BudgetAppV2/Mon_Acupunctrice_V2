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
const shouldDraft = args.includes('--draft');
const collection = args.filter(a => !a.startsWith('--'))[0];
const slug = args.filter(a => !a.startsWith('--'))[1];

if (!collection || !slug) {
  console.log('Usage: node content/scripts/retire.mjs <collection> <slug> [--draft|--delete]');
  console.log('  collection: ressources | faqs | publicBlog');
  console.log('  par defaut : passe en pending (reapprouvable depuis le Hub)');
  console.log('  --draft : passe en draft (archive, reapparait dans Brouillons)');
  console.log('  --delete : supprime le document');
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
  const newStatus = shouldDraft ? 'draft' : 'pending';
  await docRef.update({ status: newStatus, updatedAt: new Date(), reviewComment: '' });
  console.log(`📦 ${collection}/${slug} ${shouldDraft ? 'archive (draft)' : 'retire (pending)'}`);
}

console.log('💡 Le site se rafraîchira via ISR dans ~1h. Pour un refresh immédiat, redéployez.');
process.exit(0);
