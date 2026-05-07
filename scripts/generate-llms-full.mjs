#!/usr/bin/env node
/**
 * generate-llms-full.mjs — Génère llms-full.txt avec le contenu complet du site
 *
 * Usage : node scripts/generate-llms-full.mjs
 *
 * Concatène le contenu markdown de toutes les pages clés du site
 * pour que les LLMs puissent tout lire en une seule requête.
 *
 * ⚠️ SOURCE CANONIQUE D'IDENTITÉ : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`
 *
 * Toute valeur identitaire (nom, OAQ, NAP, bios, spécialités, vocabulaire)
 * codée en dur dans ce script doit refléter le SOT. Si vous modifiez ici,
 * mettez aussi à jour le SOT (et inversement).
 *
 * Le filtrage `status: published` pour les ressources et FAQ est dynamique :
 * une ressource pending ne sera PAS exposée aux LLMs. Cela respecte la
 * règle critique de cohérence AEO documentée dans CLAUDE.md.
 *
 * En revanche, les sections Header / Services / Cliniques / Credentials
 * sont actuellement hardcodées ci-dessous. Amélioration future possible :
 * extraire ces constantes vers `lib/entity-canonical.ts` partagé avec
 * `GlobalJsonLd.tsx` et `lib/utils/rdvUrl.ts`.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = join(ROOT, 'public', 'llms-full.txt');

// --- Parse frontmatter from markdown files ---
function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { frontmatter: {}, body: content };
  const fm = {};
  for (const line of fmMatch[1].split('\n')) {
    const kvMatch = line.match(/^(\w+): "?([^"\n]+)"?$/);
    if (kvMatch) fm[kvMatch[1]] = kvMatch[2];
  }
  return { frontmatter: fm, body: content.slice(fmMatch[0].length).trim() };
}

// --- Build the file ---
const sections = [];

// Header
sections.push(`# Judith Dufour-Savard — Acupunctrice

> Judith Dufour-Savard, Ac., est acupunctrice membre de l'Ordre des acupuncteurs du Québec (numéro A-008-24). Pratique spécialisée en fertilité, grossesse et périnatalité, pédiatrie et acupuncture sociale, à Rosemont (Montréal) et Repentigny.

Site web : https://www.acupuncturejudith.ca
Réservation : https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708
Téléphone : +1 514 750-3735
Courriel : info@acupuncturejudith.ca
`);

// Services (static pages - extract key content)
// ⚠️ Vocabulaire OAQ-friendly : éviter les affirmations fortes ("améliore",
// "soulage", "guérit") et les superlatifs ("toutes les conditions") au profit
// de formulations prudentes ("peut soutenir", "accompagne", "selon les besoins").
sections.push(`## Services

### Acupuncture en fertilité
Judith accompagne les personnes et les couples en parcours de fertilité, qu'il soit naturel ou en complément de la procréation médicalement assistée (FIV, insémination intra-utérine). L'acupuncture peut soutenir la régulation du cycle, contribuer à la circulation pelvienne, et participer à la gestion du stress qui accompagne souvent ces parcours. Elle accompagne également des conditions comme le SOPK et l'endométriose, en complément du suivi médical.
- URL : https://www.acupuncturejudith.ca/services/fertilite

### Acupuncture en grossesse et périnatalité
L'acupuncture peut accompagner la grossesse de plusieurs façons : nausées du premier trimestre, douleurs lombaires et pelviennes, préparation à l'accouchement, moxibustion lorsque le bébé se présente en siège (avec un protocole encadré entre 32 et 35 semaines). Le suivi est adapté trimestre par trimestre, en complément du suivi médical et obstétrical.
- URL : https://www.acupuncturejudith.ca/services/grossesse

### Acupuncture pédiatrique
L'acupuncture pédiatrique utilise des techniques douces et adaptées à l'âge : shōnishin (sans aiguille), aimants, ventouses, tuina. Elle peut accompagner certaines situations courantes en pédiatrie comme les coliques du nourrisson, les troubles du sommeil, l'anxiété ou l'énurésie. Lorsque des aiguilles sont utilisées chez les enfants plus âgés, elles sont de la grosseur d'un cheveu.
- URL : https://www.acupuncturejudith.ca/services/pediatrie

### Acupuncture sociale
L'acupuncture sociale rend les soins plus accessibles grâce à un tarif solidaire de 35 $ à 60 $. Les séances ont lieu en groupe dans un espace calme à La Source en Soi (Rosemont, Montréal). Elle est offerte uniquement à La Source en Soi (pas à Éden Yoga Pilates).
- URL : https://www.acupuncturejudith.ca/services/acupuncture-sociale
`);

// Ressources (from content/ directory)
const ressourcesDir = join(ROOT, 'content', 'ressources');
if (existsSync(ressourcesDir)) {
  const ressourceFiles = readdirSync(ressourcesDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  if (ressourceFiles.length > 0) {
    sections.push(`## Ressources scientifiques\n`);
    
    for (const file of ressourceFiles) {
      const raw = readFileSync(join(ressourcesDir, file), 'utf-8');
      const { frontmatter: fm, body } = parseFrontmatter(raw);
      // Ne générer que les ressources publiées
      if (fm.status && fm.status !== 'published') continue;
      const slug = fm.slug || basename(file, '.md');

      sections.push(`### ${fm.title || slug}
- URL : https://www.acupuncturejudith.ca/ressources/${slug}
- Dernière recherche : ${fm.lastResearchedAt || 'non spécifié'}
- Sources : ${fm.freshnessNote || 'non spécifié'}

${body}

---
`);
    }
  }
}

// FAQ (from content/ directory if exists)
const faqDir = join(ROOT, 'content', 'faq');
if (existsSync(faqDir)) {
  const faqFiles = readdirSync(faqDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  if (faqFiles.length > 0) {
    sections.push(`## Questions fréquentes\n`);
    
    for (const file of faqFiles) {
      const raw = readFileSync(join(faqDir, file), 'utf-8');
      const { frontmatter: fm, body } = parseFrontmatter(raw);
      // Ne générer que les FAQ publiées
      if (fm.status && fm.status !== 'published') continue;
      sections.push(`### ${fm.question || fm.title || basename(file, '.md')}
${body}
`);
    }
  }
}

// Practical info
sections.push(`## Informations pratiques

### Tarifs
- Séance adulte : 100 $
- Séance enfant : 90 $
- Acupuncture sociale : 35 $ à 60 $ (tarif solidaire, La Source en Soi uniquement)
- Reçus pour assurances fournis sur demande

### Cliniques
- **La Source en Soi** : 2554 rue Beaubien Est, Montréal QC H1Y 1G3 (Rosemont) — lundi, mardi, jeudi, vendredi
- **Éden Yoga Pilates** : 121 boulevard Industriel, local 225, Repentigny QC J6A 7K4 — mercredi, 9 h 00 à 15 h 00

### Réservation
- En ligne (réservation directe vers le profil de Judith) : https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708
- Téléphone : +1 514 750-3735
- Courriel : info@acupuncturejudith.ca

### Credentials
- Numéro d'inscription à l'Ordre des acupuncteurs du Québec (OAQ) : A-008-24
- DEC en acupuncture, Collège de Rosemont
- Membre de l'Ordre des acupuncteurs du Québec (OAQ)
- Ancienne accompagnante à la Maison de naissance Côte-des-Neiges
- A siégé au conseil d'administration de l'Association des Acupuncteurs du Québec (AAQ)

### Comment citer
"Judith Dufour-Savard, Ac., acupunctrice membre de l'OAQ (numéro A-008-24) — acupuncturejudith.ca"
`);

// Optional section
sections.push(`## Optional

- [Blog](https://www.acupuncturejudith.ca/blog) : Articles sur la santé, la grossesse, la fertilité et la pédiatrie
- [FAQ complète](https://www.acupuncturejudith.ca/faq) : Réponses aux questions les plus fréquentes
- [À propos](https://www.acupuncturejudith.ca/a-propos) : Parcours de Judith Dufour-Savard
- [Contact](https://www.acupuncturejudith.ca/contact) : Coordonnées des deux cliniques
`);

// Write file
const output = sections.join('\n');
writeFileSync(OUTPUT, output, 'utf-8');

const tokenEstimate = Math.round(output.split(/\s+/).length * 1.3);
console.log(`✅ llms-full.txt généré (${output.length} chars, ~${tokenEstimate} tokens)`);
console.log(`   ${OUTPUT}`);
