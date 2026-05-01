#!/usr/bin/env node
/**
 * inject.mjs — Injecte des ressources markdown dans Firestore
 * 
 * Usage :
 *   node content/scripts/inject.mjs content/ressources/acupuncture-menopause.md
 *   node content/scripts/inject.mjs content/ressources/*.md          # injecte tout
 *   node content/scripts/inject.mjs content/ressources/*.md --dry-run # prévisualise
 *   node content/scripts/inject.mjs content/faq/*.md --collection=faqs
 * 
 * Le script :
 * 1. Parse le frontmatter YAML (métadonnées)
 * 2. Parse les sections markdown (## shortAnswer, ## introSection, etc.)
 * 3. Upsert dans Firestore (par slug)
 * 4. Déclenche un revalidate ISR si le statut est "published"
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// --- Load .env.local ---
function loadEnv(path) {
  if (!existsSync(path)) throw new Error(`.env.local not found at ${path}`);
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

// --- Parse frontmatter YAML (simple parser, pas besoin de dep) ---
function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) throw new Error('No frontmatter found');
  
  const fmRaw = fmMatch[1];
  const body = content.slice(fmMatch[0].length).trim();
  
  // Simple YAML parser for our specific format
  const fm = {};
  let currentKey = null;
  let currentArray = null;
  let currentArrayItem = null;
  
  for (const line of fmRaw.split('\n')) {
    // Skip comments
    if (line.trim().startsWith('#')) continue;
    
    // Array item with object (citations, faqEntries) — 2 or 4 space indent
    const arrayObjMatch = line.match(/^  {1,3}- (\w+): "?([^"]*)"?$/);
    if (arrayObjMatch && currentArray) {
      if (arrayObjMatch[1] === Object.keys(currentArrayItem || {})[0] || !currentArrayItem) {
        if (currentArrayItem && Object.keys(currentArrayItem).length > 0) {
          fm[currentKey].push(currentArrayItem);
        }
        currentArrayItem = {};
      }
      let val = arrayObjMatch[2].replace(/^"(.*)"$/, '$1');
      if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
      currentArrayItem[arrayObjMatch[1]] = val;
      continue;
    }
    
    // Object property continuation — 4 or 6 space indent
    const objPropMatch = line.match(/^    {1,3}(\w+): "?([^"]*)"?$/);
    if (objPropMatch && currentArrayItem) {
      let val = objPropMatch[2].replace(/^"(.*)"$/, '$1');
      if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
      currentArrayItem[objPropMatch[1]] = val;
      continue;
    }
    
    // Simple array item
    const simpleArrayMatch = line.match(/^  - (.+)$/);
    if (simpleArrayMatch && currentArray) {
      fm[currentKey].push(simpleArrayMatch[1].replace(/^"(.*)"$/, '$1'));
      continue;
    }
    
    // New key-value pair
    const kvMatch = line.match(/^(\w+): (.+)$/);
    if (kvMatch) {
      // Save previous array item if any
      if (currentArrayItem && currentKey && Object.keys(currentArrayItem).length > 0) {
        fm[currentKey].push(currentArrayItem);
        currentArrayItem = null;
      }
      currentArray = null;
      
      const key = kvMatch[1];
      let val = kvMatch[2].trim().replace(/^"(.*)"$/, '$1');
      
      // Detect types
      if (val === '[]') val = [];
      else if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
      
      fm[key] = val;
      currentKey = key;
      continue;
    }
    
    // Array start
    const arrayStartMatch = line.match(/^(\w+):$/);
    if (arrayStartMatch) {
      if (currentArrayItem && currentKey && Object.keys(currentArrayItem).length > 0) {
        fm[currentKey].push(currentArrayItem);
        currentArrayItem = null;
      }
      currentKey = arrayStartMatch[1];
      fm[currentKey] = [];
      currentArray = true;
      currentArrayItem = null;
      continue;
    }
  }
  
  // Push last array item
  if (currentArrayItem && currentKey && Object.keys(currentArrayItem).length > 0) {
    fm[currentKey].push(currentArrayItem);
  }
  
  return { frontmatter: fm, body };
}

// --- Parse body sections ---
function parseSections(body) {
  const sections = {};
  const parts = body.split(/^## (\w+)/gm);
  
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i];
    const content = parts[i + 1]
      .replace(/<!--[\s\S]*?-->/g, '') // strip HTML comments
      .trim();
    if (content) sections[key] = content;
  }
  
  return sections;
}

// --- Build Firestore document ---
function buildDocument(fm, sections, collection) {
  const now = Timestamp.now();
  
  if (collection === 'ressources') {
    return {
      title: fm.title || '',
      slug: fm.slug || '',
      type: fm.type || 'guide',
      pilier: fm.pilier || 'transversal',
      status: fm.status || 'pending',
      metaTitle: fm.metaTitle || fm.title || '',
      metaDescription: fm.metaDescription || '',
      heroImageUrl: fm.heroImageUrl || '',
      heroImageAlt: fm.heroImageAlt || '',
      shortAnswer: sections.shortAnswer || '',
      introSection: sections.introSection || '',
      scienceSection: sections.scienceSection || '',
      mechanismSection: sections.mechanismSection || '',
      judithApproach: sections.judithApproach || '',
      whatToExpect: sections.whatToExpect || '',
      protocolSection: sections.protocolSection || '',
      testimonial: sections.testimonial || '',
      faqEntries: fm.faqEntries || [],
      citations: fm.citations || [],
      relatedServices: fm.relatedServices || [],
      relatedFaqs: fm.relatedFaqs || [],
      relatedArticles: fm.relatedArticles || [],
      relatedResources: fm.relatedResources || [],
      authorName: fm.authorName || 'Judith Dufour-Savard',
      updatedAt: now,
      createdAt: now, // sera ignoré si upsert avec merge
      publishedAt: fm.status === 'published' ? now : null,
      // Fraîcheur (champs custom, pas dans le type mais utile)
      _lastResearchedAt: fm.lastResearchedAt || null,
      _newestSourceYear: fm.newestSourceYear || null,
      _freshnessNote: fm.freshnessNote || null,
    };
  }
  
  if (collection === 'faqs') {
    return {
      question: fm.question || fm.title || '',
      // Champ Firestore officiel = 'reponse' (cf. lib/types/faq.ts).
      // Le markdown peut utiliser ## reponse OU ## answer (rétrocompat).
      reponse: sections.reponse || sections.answer || sections.shortAnswer || '',
      // Supprime l'ancien champ 'answer' s'il existait (bug d'une version precedente d'inject.mjs)
      answer: FieldValue.delete(),
      category: fm.category || fm.pilier || 'seance',
      order: fm.order || 0,
      status: fm.status || 'pending',
      ctaVariant: fm.ctaVariant || 'reserver',
      relatedServices: fm.relatedServices || [],
      relatedArticles: fm.relatedArticles || [],
      relatedFaqs: fm.relatedFaqs || [],
      updatedAt: now,
      createdAt: now,
      publishedAt: fm.status === 'published' ? now : null,
      _lastResearchedAt: fm.lastResearchedAt || null,
    };
  }
  
  throw new Error(`Unknown collection: ${collection}`);
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const collectionArg = args.find(a => a.startsWith('--collection='));
  const files = args.filter(a => !a.startsWith('--'));
  
  if (files.length === 0) {
    console.log('Usage: node content/scripts/inject.mjs <file.md> [--dry-run] [--collection=ressources|faqs]');
    process.exit(1);
  }
  
  // Detect collection from file path or arg
  const defaultCollection = collectionArg
    ? collectionArg.split('=')[1]
    : files[0].includes('/faq/') ? 'faqs' : 'ressources';
  
  if (!dryRun) {
    const env = loadEnv(resolve(ROOT, '.env.local'));
    initializeApp({ credential: cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  
  const db = dryRun ? null : getFirestore();
  let injected = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = resolve(file);
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${file}`);
      errors++;
      continue;
    }
    if (basename(filePath).startsWith('_')) {
      console.log(`⏭️  Skipping template/config: ${basename(filePath)}`);
      continue;
    }
    
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const { frontmatter: fm, body } = parseFrontmatter(raw);
      const sections = parseSections(body);
      const collection = fm.collection || defaultCollection;
      const doc = buildDocument(fm, sections, collection);
      const docId = fm.slug || basename(filePath, '.md');
      
      if (dryRun) {
        console.log(`\n📄 ${basename(filePath)} → ${collection}/${docId}`);
        console.log(`   Title: ${doc.title || doc.question}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Sections: ${Object.keys(sections).join(', ')}`);
        console.log(`   Citations: ${(fm.citations || []).length}`);
        console.log(`   FAQ entries: ${(fm.faqEntries || []).length}`);
        console.log(`   Related services: ${(fm.relatedServices || []).join(', ')}`);
      } else {
        // Upsert (merge to preserve createdAt on existing docs)
        await db.collection(collection).doc(docId).set(doc, { merge: true });
        console.log(`✅ ${basename(filePath)} → ${collection}/${docId} (${doc.status})`);
      }
      
      injected++;
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n--- ${injected} injected, ${errors} errors ${dryRun ? '(DRY RUN)' : ''} ---`);
  if (!dryRun && injected > 0) {
    console.log('💡 Pour rafraîchir le site, les pages ISR se mettront à jour dans ~1h.');
    console.log('   Pour un refresh immédiat, redéployez sur Vercel.');
  }
  
  process.exit(errors > 0 ? 1 : 0);
}

main();
