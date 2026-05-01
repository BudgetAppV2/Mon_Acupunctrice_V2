#!/usr/bin/env node
/**
 * Import SEO/GEO content → Firestore — MW-D3
 * =============================================
 *
 * Lit les 6 FAQ (scripts/seo-geo/source/) et les 5 ressources
 * (scripts/seo-geo/source-resources/), extrait les champs via le pattern
 * ### CHAMP: xxx, et ecrit dans les collections Firestore faqs + ressources.
 *
 * Usage :
 *   cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
 *   node scripts/import-seo-geo-content.mjs --dry-run
 *   node scripts/import-seo-geo-content.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env.local');
const FAQ_DIR = resolve(__dirname, 'seo-geo/source');
const RESOURCE_DIR = resolve(__dirname, 'seo-geo/source-resources');
const REPORT_DIR = resolve(ROOT, 'project-docs/02_ROADMAP/migration-wix/MW-D3_import-faq-existantes/artefacts');

const DRY_RUN = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────────────────────
// Hardcoded mappings (MILESTONE.md + DECISIONS Q10)
// ─────────────────────────────────────────────────────────────

const FAQ_CATEGORY_MAP = {
  '01-acupuncture-anxiete.md': 'seance',
  '02-combien-seances-fiv.md': 'fertilite',
  '03-acupuncture-securitaire-fiv.md': 'fertilite',
  '04-tomber-enceinte-naturellement.md': 'fertilite',
  '05-nausees-grossesse.md': 'grossesse',
  '06-bebe-siege-moxibustion.md': 'grossesse',
};

const RESOURCE_PILIER_MAP = {
  '01-acupuncture-fertilite-montreal.md': 'fertilite',
  '02-acupuncture-grossesse-montreal.md': 'grossesse',
  '03-acupuncture-pediatrique-enfants-bebes.md': 'pediatrie',
  '04-acupuncture-sante-mentale-anxiete.md': 'transversal',
  '05-acupuncture-sociale-montreal.md': 'acupuncture-sociale',
};

// Fictitious testimonial detection markers
const FICTITIOUS_MARKERS = ['Sarah, 36 ans', 'fictif'];

// ─────────────────────────────────────────────────────────────
// Helpers (extractField copied from publish-all-resources.mjs)
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
  const nextSectionMatch = afterMarker.match(/\n### CHAMP:|\n---|\n## NOTES/);
  const endIdx = nextSectionMatch ? nextSectionMatch.index : afterMarker.length;
  return afterMarker.slice(0, endIdx).trim();
}

function parseFaqEntries(faqMarkdown) {
  if (!faqMarkdown) return [];
  const entries = [];
  const blocks = faqMarkdown.split(/\*\*Q\d+\s*:\s*/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const match = block.match(/^([\s\S]+?)\*\*\s*\n\s*R\s*:\s*([\s\S]+?)$/);
    if (match) {
      entries.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }
  }
  return entries;
}

function isFictitiousTestimonial(testimonialText, fullFileContent) {
  if (!testimonialText) return false;
  // Check the testimonial field itself for "Sarah, 36 ans"
  const testimonialLower = testimonialText.toLowerCase();
  if (testimonialLower.includes('sarah, 36 ans')) return true;
  // Check the NOTES section at the end of the file for explicit "fictif" flag
  const notesSection = fullFileContent.split(/\n## NOTES/i)[1] || '';
  if (notesSection.toLowerCase().includes('fictif') && notesSection.toLowerCase().includes('temoignage')) return true;
  if (notesSection.toLowerCase().includes('fictif') && notesSection.toLowerCase().includes('témoignage')) return true;
  return false;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Firebase Admin init (same pattern as migrate-wix-blog.mjs)
// ─────────────────────────────────────────────────────────────

const env = loadEnv(ENV_PATH);
const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT in .env.local');
  process.exit(1);
}
const serviceAccount = JSON.parse(serviceAccountJson);
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log(' MW-D3 — Import FAQ + Ressources → Firestore');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log(' MODE: --dry-run');
  console.log('');

  const faqResults = [];
  const resourceResults = [];
  const fictitiousFlags = [];
  const warnings = [];

  // ── Part A: Import 6 FAQ ──────────────────────────────────

  console.log('--- FAQ (6) ---');
  console.log('');

  const faqFiles = Object.keys(FAQ_CATEGORY_MAP);
  for (let i = 0; i < faqFiles.length; i++) {
    const filename = faqFiles[i];
    const filePath = resolve(FAQ_DIR, filename);
    if (!existsSync(filePath)) {
      warnings.push(`FAQ file not found: ${filename}`);
      console.error(`  MISSING: ${filename}`);
      continue;
    }

    const md = readFileSync(filePath, 'utf-8');
    const slug = extractField(md, 'slug');
    // question: try CHAMP field first, fall back to H1 title (after "— ")
    let question = extractField(md, 'question');
    if (!question) {
      const h1Match = md.match(/^#\s+FAQ\s+#\d+\s*—\s*(.+)$/m);
      if (h1Match) question = h1Match[1].trim();
    }
    const reponse = extractField(md, 'detailedAnswer');
    const publishedDate = extractField(md, 'publishedDate');
    const category = FAQ_CATEGORY_MAP[filename];

    if (!slug || !question || !reponse) {
      warnings.push(`${filename}: missing slug/question/detailedAnswer`);
      console.error(`  INCOMPLETE: ${filename}`);
      continue;
    }

    console.log(`[FAQ ${i + 1}/6] ${slug}`);
    console.log(`  question: ${question.slice(0, 60)}...`);
    console.log(`  category: ${category}`);
    console.log(`  reponse: ${reponse.split('\n').length} lines`);

    const doc = {
      question,
      reponse,
      category,
      order: i + 1,
      status: 'published',
      ctaVariant: 'reserver',
      relatedServices: [],
      relatedArticles: [],
      relatedFaqs: [],
      publishedAt: publishedDate
        ? Timestamp.fromDate(new Date(publishedDate))
        : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!DRY_RUN) {
      await db.collection('faqs').doc(slug).set(doc);
      console.log(`  Written to Firestore: faqs/${slug}`);
    } else {
      console.log(`  [dry-run] Would write faqs/${slug}`);
    }

    faqResults.push({ slug, question: question.slice(0, 50), category, status: 'published' });
    console.log('');
  }

  // ── Part B: Import 5 Ressources ───────────────────────────

  console.log('--- Ressources (5) ---');
  console.log('');

  const resourceFiles = Object.keys(RESOURCE_PILIER_MAP);
  for (let i = 0; i < resourceFiles.length; i++) {
    const filename = resourceFiles[i];
    const filePath = resolve(RESOURCE_DIR, filename);
    if (!existsSync(filePath)) {
      warnings.push(`Resource file not found: ${filename}`);
      console.error(`  MISSING: ${filename}`);
      continue;
    }

    const md = readFileSync(filePath, 'utf-8');
    const slug = extractField(md, 'slug');
    const title = extractField(md, 'title');
    const pilier = RESOURCE_PILIER_MAP[filename];

    if (!slug || !title) {
      warnings.push(`${filename}: missing slug/title`);
      continue;
    }

    // Extract all sections
    const shortAnswer = extractField(md, 'shortAnswer') || '';
    const introSection = extractField(md, 'introSection') || '';
    const scienceSection = extractField(md, 'scienceSection') || '';
    const mechanismSection = extractField(md, 'mechanismSection') || '';
    const judithApproach = extractField(md, 'judithApproach') || '';
    const whatToExpect = extractField(md, 'whatToExpect') || '';
    const protocolSection = extractField(md, 'protocolSection') || '';
    const testimonialRaw = extractField(md, 'testimonial') || '';
    const faqJsonRaw = extractField(md, 'faqJson (pour Schema FAQPage)') || extractField(md, 'faqJson') || '';
    const metaTitle = extractField(md, 'metaTitle') || '';
    const metaDescription = extractField(md, 'metaDescription') || '';
    const heroImageAlt = extractField(md, 'heroImageAlt') || '';
    const authorName = extractField(md, 'authorName') || 'Judith Dufour-Savard';
    const publishedDate = extractField(md, 'publishedDate');

    // Parse faqEntries
    const faqEntries = parseFaqEntries(faqJsonRaw);

    // Detect fictitious testimonials
    const isFictitious = isFictitiousTestimonial(testimonialRaw, md);
    const testimonial = isFictitious ? '' : testimonialRaw;
    const status = isFictitious ? 'draft' : 'published';

    console.log(`[RES ${i + 1}/5] ${slug}`);
    console.log(`  title: ${title.slice(0, 50)}`);
    console.log(`  pilier: ${pilier}`);
    console.log(`  sections: ${[shortAnswer, introSection, scienceSection, mechanismSection, judithApproach, whatToExpect, protocolSection].filter(Boolean).length}/7 non-empty`);
    console.log(`  faqEntries: ${faqEntries.length}`);
    console.log(`  testimonial: ${isFictitious ? 'FICTIF DETECTE → status: draft' : 'OK'}`);

    if (isFictitious) {
      const marker = FICTITIOUS_MARKERS.find((m) =>
        (testimonialRaw + ' ' + md).toLowerCase().includes(m.toLowerCase())
      );
      fictitiousFlags.push({
        filename,
        slug,
        marker: marker || '(detected)',
        summary: testimonialRaw.slice(0, 100),
      });
    }

    const doc = {
      title,
      slug,
      type: 'guide',
      pilier,
      status,
      metaTitle,
      metaDescription,
      heroImageAlt,
      shortAnswer,
      introSection,
      scienceSection,
      mechanismSection,
      judithApproach,
      whatToExpect,
      protocolSection,
      testimonial,
      faqEntries,
      citations: [],
      relatedServices: [],
      relatedFaqs: [],
      relatedArticles: [],
      relatedResources: [],
      authorName,
      publishedAt: publishedDate
        ? Timestamp.fromDate(new Date(publishedDate))
        : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!DRY_RUN) {
      await db.collection('ressources').doc(slug).set(doc);
      console.log(`  Written to Firestore: ressources/${slug}`);
    } else {
      console.log(`  [dry-run] Would write ressources/${slug}`);
    }

    resourceResults.push({
      slug,
      title: title.slice(0, 45),
      pilier,
      sections: [shortAnswer, introSection, scienceSection, mechanismSection, judithApproach, whatToExpect, protocolSection].filter(Boolean).length,
      faqEntries: faqEntries.length,
      status,
    });
    console.log('');
  }

  // ── Report ────────────────────────────────────────────────

  ensureDir(REPORT_DIR);
  const reportLines = [
    '# Rapport d\'import FAQ + Ressources → Firestore',
    '',
    `**Date** : ${new Date().toISOString().slice(0, 10)}`,
    `**Mode** : ${DRY_RUN ? 'dry-run' : 'complet'}`,
    '',
    '## FAQ (6)',
    '',
    '| # | Slug | Question | Categorie | Status |',
    '|---|------|----------|-----------|--------|',
    ...faqResults.map((r, i) =>
      `| ${i + 1} | ${r.slug} | ${r.question} | ${r.category} | ${r.status} |`
    ),
    '',
    '## Ressources (5)',
    '',
    '| # | Slug | Titre | Pilier | Sections | FaqEntries | Status |',
    '|---|------|-------|--------|----------|------------|--------|',
    ...resourceResults.map((r, i) =>
      `| ${i + 1} | ${r.slug} | ${r.title} | ${r.pilier} | ${r.sections}/7 | ${r.faqEntries} | ${r.status} |`
    ),
    '',
  ];

  if (fictitiousFlags.length > 0) {
    reportLines.push(
      '## Temoignages fictifs detectes → `status: \'draft\'`',
      '',
      'Pour chacune des ressources listees ici : `testimonial: \'\'` + `status: \'draft\'`. **Action Judith** : fournir un vrai temoignage anonymise avec consentement OU confirmer la suppression definitive du bloc temoignage. Puis Benoit flip `status → \'published\'` manuellement.',
      '',
      ...fictitiousFlags.map((f) =>
        `- **${f.filename}** (slug: ${f.slug}) : marqueur "${f.marker}" detecte. Contenu original archive dans le source file.`
      ),
      '',
    );
  }

  if (warnings.length > 0) {
    reportLines.push('## Warnings', '', ...warnings.map((w) => `- ${w}`), '');
  }

  writeFileSync(resolve(REPORT_DIR, 'import-report.md'), reportLines.join('\n'), 'utf-8');

  console.log('='.repeat(60));
  console.log(` Done: ${faqResults.length} FAQ + ${resourceResults.length} ressources`);
  if (fictitiousFlags.length > 0) {
    console.log(` Fictitious testimonials: ${fictitiousFlags.length} resource(s) set to draft`);
  }
  console.log(` Report: ${resolve(REPORT_DIR, 'import-report.md')}`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
