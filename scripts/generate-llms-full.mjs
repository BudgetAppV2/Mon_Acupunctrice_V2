#!/usr/bin/env node
/**
 * generate-llms-full.mjs — Génère llms-full.txt avec le contenu complet du site
 *
 * Usage : node scripts/generate-llms-full.mjs
 *
 * Concatène le contenu markdown de toutes les pages clés du site
 * pour que les LLMs puissent tout lire en une seule requête.
 *
 * 📌 SOURCE CANONIQUE D'IDENTITÉ : `lib/entity-canonical.mjs`
 * 📌 DOCUMENTATION PRIMAIRE : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`
 *
 * Toute valeur identitaire (nom, OAQ, NAP, contact, spécialités) est importée
 * depuis le module canonique. Les descriptions narratives des services restent
 * hardcodées ici — ce sont des textes rédactionnels marketing, pas de l'identité.
 *
 * Le filtrage `status: published` pour les ressources et FAQ est dynamique :
 * une ressource pending ne sera PAS exposée aux LLMs. Cela respecte la
 * règle critique de cohérence AEO documentée dans CLAUDE.md.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENTITY, NAP, CONTACT, PILIERS, PRICING } from '../lib/entity-canonical.mjs';

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

// Helper : joindre une liste avec des virgules + "et" avant le dernier élément
// (typographie française standard : "A, B, C et D" plutôt que "A, B, C, D")
function joinWithEt(arr) {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
}

const piliersInProse = joinWithEt(
  PILIERS.map((p) => p.name.toLowerCase().replace(' & ', ' et '))
);

// Header — toutes les valeurs viennent du module canonique
sections.push(`# ${ENTITY.websiteName}

> ${ENTITY.alternateName}, est ${ENTITY.jobTitleShort.toLowerCase()} membre de l'${ENTITY.oaqName} (numéro ${ENTITY.oaqNumber}). Pratique spécialisée en ${piliersInProse}, à ${NAP.lssi.neighborhood} (${NAP.lssi.addressLocality}) et ${NAP.eden.addressLocality}.

Site web : ${CONTACT.website}
Réservation : ${CONTACT.reservationUrl}
Téléphone : ${CONTACT.phoneInternational}
Courriel : ${CONTACT.email}
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

// Practical info — toutes les valeurs viennent du module canonique
sections.push(`## Informations pratiques

### Tarifs
- Séance adulte : ${PRICING.adultSession} $
- Séance enfant : ${PRICING.childSession} $
- Acupuncture sociale : ${PRICING.socialMin} $ à ${PRICING.socialMax} $ (tarif solidaire, ${NAP.lssi.name} uniquement)
- Reçus pour assurances fournis sur demande

### Cliniques
- **${NAP.lssi.name}** : ${NAP.lssi.streetAddress}, ${NAP.lssi.addressLocality} ${NAP.lssi.addressRegion} ${NAP.lssi.postalCode} (${NAP.lssi.neighborhood}) — ${NAP.lssi.daysLabel}
- **${NAP.eden.name}** : ${NAP.eden.streetAddressFull}, ${NAP.eden.addressLocality} ${NAP.eden.addressRegion} ${NAP.eden.postalCode} — ${NAP.eden.daysLabel}

### Réservation
- En ligne (réservation directe vers le profil de Judith) : ${NAP.lssi.grvUrl}
- Téléphone : ${CONTACT.phoneInternational}
- Courriel : ${CONTACT.email}

### Credentials
- Numéro d'inscription à l'${ENTITY.oaqName} (${ENTITY.oaqAcronym}) : ${ENTITY.oaqNumber}
- ${ENTITY.diplomaLong}, ${ENTITY.school}
- Membre de l'${ENTITY.oaqName} (${ENTITY.oaqAcronym})
- Ancienne accompagnante à la Maison de naissance Côte-des-Neiges
- A siégé au conseil d'administration de l'Association des Acupuncteurs du Québec (AAQ)

### Comment citer
"${ENTITY.alternateName}, ${ENTITY.jobTitleShort.toLowerCase()} membre de l'${ENTITY.oaqAcronym} (numéro ${ENTITY.oaqNumber}) — ${CONTACT.websiteNoWww.replace('https://', '')}"
`);

// Optional section
sections.push(`## Optional

- [Blog](${CONTACT.website}/blog) : Articles sur la santé, la grossesse, la fertilité et la pédiatrie
- [FAQ complète](${CONTACT.website}/faq) : Réponses aux questions les plus fréquentes
- [À propos](${CONTACT.website}/a-propos) : Parcours de ${ENTITY.name}
- [Contact](${CONTACT.website}/contact) : Coordonnées des deux cliniques
`);

// Write file
const output = sections.join('\n');
writeFileSync(OUTPUT, output, 'utf-8');

const tokenEstimate = Math.round(output.split(/\s+/).length * 1.3);
console.log(`✅ llms-full.txt généré (${output.length} chars, ~${tokenEstimate} tokens)`);
console.log(`   ${OUTPUT}`);
