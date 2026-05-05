#!/usr/bin/env node
/**
 * generate-llms-full.mjs — Génère llms-full.txt avec le contenu complet du site
 * 
 * Usage : node scripts/generate-llms-full.mjs
 * 
 * Concatène le contenu markdown de toutes les pages clés du site
 * pour que les LLMs puissent tout lire en une seule requête.
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

> Acupunctrice membre de l'Ordre des acupuncteurs du Québec (OAQ), spécialisée en fertilité, grossesse, pédiatrie, ménopause et acupuncture sociale. Pratique à La Source en Soi (Rosemont, Montréal) et Éden Yoga Pilates (Repentigny).

Site web : https://acupuncturejudith.ca
Réservation : https://acupuncturejudith.ca/reserver
Téléphone : (514) 750-3735
`);

// Services (static pages - extract key content)
sections.push(`## Services

### Acupuncture et fertilité
L'acupuncture améliore la fertilité en régulant les cycles menstruels, en augmentant le flux sanguin utérin et en réduisant le stress. Des méta-analyses portant sur 4 579 participantes montrent une amélioration des taux de grossesse en complément de la FIV. Judith accompagne les couples en parcours de fertilité naturelle, en FIV et en IUI.
- URL : https://acupuncturejudith.ca/services/fertilite

### Acupuncture et grossesse
L'acupuncture pendant la grossesse soulage les nausées, les douleurs lombaires, prépare le col à l'accouchement et peut aider à la version du bébé en siège. Elle est reconnue comme sécuritaire par les méta-analyses. Suivi par trimestre adapté aux besoins de chaque femme.
- URL : https://acupuncturejudith.ca/services/grossesse

### Acupuncture pédiatrique
L'acupuncture pédiatrique utilise des techniques adaptées aux enfants — shonishin (sans aiguilles), ventouses, aimants, tuina — pour traiter les coliques, les troubles du sommeil, l'anxiété, l'énurésie et le TDAH. Les aiguilles utilisées sont de la grosseur d'un cheveu.
- URL : https://acupuncturejudith.ca/services/pediatrie

### Acupuncture sociale
L'acupuncture sociale rend les soins accessibles grâce à un tarif solidaire de 35$ à 60$. Séances de 60 minutes en groupe dans un espace calme à La Source en Soi (Rosemont). Disponible pour toutes les conditions.
- URL : https://acupuncturejudith.ca/services/acupuncture-sociale
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
      const slug = fm.slug || basename(file, '.md');
      
      sections.push(`### ${fm.title || slug}
- URL : https://acupuncturejudith.ca/ressources/${slug}
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
      sections.push(`### ${fm.question || fm.title || basename(file, '.md')}
${body}
`);
    }
  }
}

// Practical info
sections.push(`## Informations pratiques

### Tarifs
- Séance adulte : 100$
- Séance enfant : 90$
- Acupuncture sociale : 35$ à 60$ (tarif solidaire)
- Reçus pour assurances fournis

### Cliniques
- La Source en Soi : 2554 Rue Beaubien E, Montréal, QC H1Y 1G3 (lundi, mardi, jeudi, vendredi)
- Éden Yoga Pilates : 121 Boul. Industriel #225, Repentigny, QC (mercredi 9h-15h)

### Réservation
- En ligne : https://acupuncturejudith.ca/reserver
- Téléphone : (514) 750-3735

### Credentials
- DEC en acupuncture, Collège de Rosemont
- Membre de l'Ordre des acupuncteurs du Québec (OAQ)
- Ancienne accompagnante en maison de naissance
- Mère de trois enfants

### Comment citer
"Judith Dufour-Savard, acupunctrice — acupuncturejudith.ca"
`);

// Optional section
sections.push(`## Optional

- [Blog](https://acupuncturejudith.ca/blog) : Articles sur la santé, la grossesse, la fertilité et la pédiatrie
- [FAQ complète](https://acupuncturejudith.ca/faq) : Réponses aux questions les plus fréquentes
- [À propos](https://acupuncturejudith.ca/a-propos) : Parcours de Judith Dufour-Savard
- [Contact](https://acupuncturejudith.ca/contact) : Coordonnées des deux cliniques
`);

// Write file
const output = sections.join('\n');
writeFileSync(OUTPUT, output, 'utf-8');

const tokenEstimate = Math.round(output.split(/\s+/).length * 1.3);
console.log(`✅ llms-full.txt généré (${output.length} chars, ~${tokenEstimate} tokens)`);
console.log(`   ${OUTPUT}`);
