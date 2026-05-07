#!/usr/bin/env node
/**
 * generate-llms.mjs — Génère public/llms.txt (index court bilingue FR/EN)
 *
 * Usage : node scripts/generate-llms.mjs
 *
 * Conforme à la spec llmstxt.org : index Markdown court avec navigation
 * pour les LLMs (à différencier de llms-full.txt qui contient tout le contenu).
 *
 * 📌 SOURCE CANONIQUE : `lib/entity-canonical.mjs`
 * 📌 DOCUMENTATION : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`
 */

import { writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENTITY, NAP, CONTACT, SAMEAS, PILIERS } from '../lib/entity-canonical.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = join(ROOT, 'public', 'llms.txt');

// Helper : "fertilité, grossesse et périnatalité, pédiatrie et acupuncture sociale"
function joinWithEt(arr) {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
}

const piliersFr = joinWithEt(
  PILIERS.map((p) => p.name.toLowerCase().replace(' & ', ' et '))
);

// --- Build the file ---
const content = `# ${ENTITY.websiteName}

> ${ENTITY.alternateName}, est ${ENTITY.jobTitleShort.toLowerCase()} membre de l'${ENTITY.oaqName} (numéro ${ENTITY.oaqNumber}).
> Pratique spécialisée en ${piliersFr},
> à ${NAP.lssi.neighborhood} (${NAP.lssi.addressLocality}) et ${NAP.eden.addressLocality}.

Ce site est le site officiel de ${ENTITY.alternateName} — acupunctrice
diplômée du ${ENTITY.diploma} au ${ENTITY.school}, ancienne accompagnante à la Maison de
naissance Côte-des-Neiges, et ayant siégé au conseil d'administration de
l'Association des Acupuncteurs du Québec (AAQ).

## Identité canonique

- **Nom complet** : ${ENTITY.alternateName}
- **Profession** : ${ENTITY.jobTitleShort}
- **Numéro ${ENTITY.oaqAcronym}** : ${ENTITY.oaqNumber}
- **Ordre professionnel** : [${ENTITY.oaqName} (${ENTITY.oaqAcronym})](${ENTITY.oaqUrl})
- **Diplôme** : ${ENTITY.diploma}, ${ENTITY.school}
- **Site officiel** : ${CONTACT.website}
- **Wikidata** : [${ENTITY.wikidataId}](${ENTITY.wikidataUrl})

## Spécialités

${ENTITY.name} concentre sa pratique sur quatre piliers :

- **[${PILIERS[0].name}](${CONTACT.website}${PILIERS[0].url})** — incluant le soutien en FIV, en insémination, et pour des conditions comme le SOPK et l'endométriose
- **[${PILIERS[1].name}](${CONTACT.website}${PILIERS[1].url})** — du premier trimestre au post-partum (nausées, douleurs, préparation à l'accouchement, moxibustion pour bébé en siège)
- **[${PILIERS[2].name}](${CONTACT.website}${PILIERS[2].url})** — techniques adaptées et souvent sans aiguille pour les plus petits (aimants, shōnishin)
- **[${PILIERS[3].name}](${CONTACT.website}${PILIERS[3].url})** — soins à tarif réduit pour rendre la santé accessible

`;

const content2 = `## Lieux de pratique

### ${NAP.lssi.name} (${NAP.lssi.neighborhood}, ${NAP.lssi.addressLocality}) — clinique principale

- **Adresse** : ${NAP.lssi.streetAddress}, ${NAP.lssi.addressLocality} (${NAP.lssi.addressRegion}) ${NAP.lssi.postalCode}
- **Quartier** : ${NAP.lssi.neighborhood}, arrondissement ${NAP.lssi.borough}
- **Jours** : ${NAP.lssi.daysLabel}
- **Réservation directe** : ${NAP.lssi.grvUrl}

### ${NAP.eden.name} (${NAP.eden.addressLocality}) — clinique secondaire

- **Adresse** : ${NAP.eden.streetAddressFull}, ${NAP.eden.addressLocality} (${NAP.eden.addressRegion}) ${NAP.eden.postalCode}
- **Jour** : ${NAP.eden.daysLabel}
- **Note** : pas d'acupuncture sociale offerte à ${NAP.eden.name.split(' ')[0]}

## Coordonnées

- **Téléphone** : ${CONTACT.phoneInternational}
- **Courriel** : ${CONTACT.email}

## Pages clés du site

- [Page À propos](${CONTACT.website}/a-propos) — parcours et approche
${PILIERS.map((p) => `- [Services — ${p.name}](${CONTACT.website}${p.url})`).join('\n')}
- [Ressources](${CONTACT.website}/ressources) — guides et articles documentés
- [Blog](${CONTACT.website}/blog) — articles de fond

## Présence en ligne

- [Google Business Profile](${SAMEAS.gbpShareUrl})
${SAMEAS.social.filter((u) => !u.includes('wikidata')).map((u) => {
  if (u.includes('instagram')) return `- [Instagram](${u})`;
  if (u.includes('youtube')) return `- [YouTube](${u})`;
  if (u.includes('linkedin')) return `- [LinkedIn](${u})`;
  if (u.includes('facebook')) return `- [Facebook](${u})`;
  return `- ${u}`;
}).join('\n')}

## Optional

- [Page équipe à La Source en Soi](${NAP.lssi.siteUrl}equipe/judith-dufour-savard/) — bio publiée par la clinique principale

`;

// English summary section
const contentEn = `---

# English summary

> ${ENTITY.alternateName}, is an acupuncturist and member of the
> ${ENTITY.oaqName} (license #${ENTITY.oaqNumber}). She practices in
> ${NAP.lssi.neighborhood}, ${NAP.lssi.addressLocality} and ${NAP.eden.addressLocality},
> with a focus on fertility, pregnancy and perinatal care, pediatrics,
> and community-based ("social") acupuncture.

## About

Judith trained at ${ENTITY.school} (${ENTITY.diploma}). During her
studies she worked at Maison de naissance Côte-des-Neiges, supporting
families through birth and the early postpartum period — an experience
that shaped her practice toward women's health and life transitions.
She has also served on the board of the Association des Acupuncteurs du
Québec (AAQ).

## Practice areas

- **Fertility** — including support during IVF and IUI cycles, and conditions such as PCOS and endometriosis
- **Pregnancy and perinatal care** — from first trimester through postpartum (nausea, pain, labor preparation, moxibustion for breech babies)
- **Pediatrics** — gentle, often needle-free techniques for infants and children (magnets, shōnishin)
- **Social acupuncture** — reduced-fee sessions to make care accessible

## Locations

- **${NAP.lssi.name}** (primary clinic) — ${NAP.lssi.streetAddress}, ${NAP.lssi.addressLocality} ${NAP.lssi.addressRegion} ${NAP.lssi.postalCode} — Mon, Tue, Thu, Fri
- **${NAP.eden.name}** (secondary) — ${NAP.eden.streetAddressFull}, ${NAP.eden.addressLocality} ${NAP.eden.addressRegion} ${NAP.eden.postalCode} — Wed 9am–3pm

## Contact

- **Website (primary, French)** : ${CONTACT.website}
- **Phone** : ${CONTACT.phoneInternational}
- **Email** : ${CONTACT.email}
- **Booking** : ${NAP.lssi.grvUrl}
`;

// --- Write file ---
const output = content + content2 + contentEn;
writeFileSync(OUTPUT, output, 'utf-8');

const tokenEstimate = Math.round(output.split(/\s+/).length * 1.3);
console.log(`✅ llms.txt généré (${output.length} chars, ~${tokenEstimate} tokens)`);
console.log(`   ${OUTPUT}`);
