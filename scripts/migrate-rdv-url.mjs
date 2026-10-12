#!/usr/bin/env node
/**
 * migrate-rdv-url.mjs — Remplace un ancien lien GoRendezVous par un nouveau
 * dans les documents Firestore (publicBlog, contentItems).
 *
 * Usage : node scripts/migrate-rdv-url.mjs [--apply]
 *           [--from-slug=lasourceensoi] [--from-company=104074] [--from-eids=175708]
 *           [--to=https://www.gorendezvous.com/...] [--skip=docId1,docId2]
 *
 * Dry-run par défaut : affiche le diff sans rien écrire. --apply pour écrire.
 * Idempotent : la nouvelle URL ne correspond pas au motif de l'ancienne.
 *
 * Pourquoi un motif large : les articles migrés de Wix contiennent plusieurs
 * variantes (avec/sans eids, préfixe /fr/). Les paramètres utm_* qui suivent
 * l'URL sont conservés tels quels (le nouveau lien a déjà un `?`).
 * updatedAt n'est PAS modifié : un changement de lien n'est pas une mise à
 * jour éditoriale (sitemap lastModified).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

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
const arg = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? def;
const apply = args.includes('--apply');
const fromSlug = arg('from-slug', 'lasourceensoi');
const fromCompany = arg('from-company', '104074');
const fromEids = arg('from-eids', '175708');
const to = arg('to', 'https://www.gorendezvous.com/bhavanalaclinique?companyId=106503&eids=196572');
// Documents à exclure (ex. article réécrit à la main plus tard).
const skip = new Set(arg('skip', '').split(',').filter(Boolean));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OLD_URL = new RegExp(
  `https?://(?:www\\.)?gorendezvous\\.com/(?:fr/)?${esc(fromSlug)}` +
  `(?:\\?companyId=${esc(fromCompany)}(?:&eids=${esc(fromEids)})?)?(?![\\w/-])`,
  'g',
);

// Champs ciblés par collection — on ne parcourt pas tout le document pour ne
// jamais toucher aux métadonnées (URLs Storage, ids, etc.).
const TARGETS = {
  publicBlog: ['content', 'ctaUrl'],
  contentItems: ['captions', 'captionDraft', 'ctaUrl'],
};

// Retourne [{ path, before, after }] pour chaque string modifiée sous `value`.
function collect(value, path) {
  if (typeof value === 'string') {
    const after = value.replace(OLD_URL, to);
    return after === value ? [] : [{ path, before: value, after }];
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([k, v]) => collect(v, `${path}.${k}`));
  }
  return [];
}

function excerpts(before, after) {
  const out = [];
  for (const m of before.matchAll(OLD_URL)) {
    out.push(`      - …${before.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).replace(/\n/g, ' ')}…`);
  }
  const first = after.indexOf(to);
  out.push(`      + …${after.slice(Math.max(0, first - 40), first + to.length + 30).replace(/\n/g, ' ')}…`);
  return out.join('\n');
}

const env = loadEnv(resolve(ROOT, '.env.local'));
initializeApp({ credential: cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();

console.log(`${apply ? 'APPLY' : 'DRY-RUN'} — ${OLD_URL.source}\n  → ${to}${skip.size ? `\n  skip: ${[...skip].join(', ')}` : ''}\n`);
let docsChanged = 0;
let fieldsChanged = 0;

for (const [collection, fields] of Object.entries(TARGETS)) {
  const snap = await db.collection(collection).get();
  for (const doc of snap.docs) {
    if (skip.has(doc.id)) continue;
    const data = doc.data();
    const changes = fields.flatMap((f) => collect(data[f], f));
    if (!changes.length) continue;
    docsChanged++;
    fieldsChanged += changes.length;
    console.log(`${collection}/${doc.id} (${data.status ?? data.distributionStatus ?? '?'})`);
    for (const c of changes) console.log(`    ${c.path}\n${excerpts(c.before, c.after)}`);
    if (apply) {
      await doc.ref.update(Object.fromEntries(changes.map((c) => [c.path, c.after])));
    }
  }
}

console.log(`\n${docsChanged} document(s), ${fieldsChanged} champ(s) ${apply ? 'mis à jour' : 'à mettre à jour (relancer avec --apply)'}.`);
process.exit(0);
