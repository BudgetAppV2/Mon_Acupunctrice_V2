# MW-D3 — Import des 6 FAQ + 5 ressources existantes → Firestore

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

Le repo contient deja du contenu redige et valide : 6 FAQ dans `scripts/seo-geo/source/` et 5 ressources piliers dans `scripts/seo-geo/source-resources/`. MW-B2 a defini les schemas Firestore (`faqs`, `ressources`). Ce milestone ecrit un script `.mjs` qui lit ces fichiers source, extrait les champs via le pattern `### CHAMP: xxx` (deja utilise par `publish-all-resources.mjs` pour Wix), et pousse le tout dans Firestore via Admin SDK. Pas de conversion Ricos — on stocke le markdown brut.

Apres ce milestone : 6 documents dans `faqs` et 5 documents dans `ressources`, tous avec `status: 'published'`, prets a etre affiches par les pages MW-D4/D5.

---

## Stack

Node.js (script `.mjs` standalone), Firebase Admin SDK (`firebase-admin/firestore`). Pas de TypeScript, pas de nouvelle dependance npm. Pattern coherent avec `scripts/export-wix-blog.mjs` et `scripts/seo-geo/publish-all-resources.mjs`.

---

## Fichiers a lire AVANT de commencer

Dans cet ordre exact. Ne commence a coder qu'apres avoir lu les 10.

1. **`scripts/seo-geo/publish-all-resources.mjs`** (lignes 38-101) → **pattern de reference critique**. Contient :
   - `extractField(md, fieldName)` — la fonction qui parse `### CHAMP: xxx` → copier tel quel
   - `loadEnv()` — chargement de `.env.local`
   - Constantes `RICH_TEXT_FIELDS`, `PLAIN_TEXT_FIELDS`, `DATE_FIELDS` — la liste exacte des champs de chaque ressource
   - **Gotcha** : ce script convertit en Ricos pour Wix. Nous, on garde le markdown brut — donc pas de conversion, juste `extractField()` puis stockage direct.

2. **`scripts/seo-geo/publish-all-faq.mjs`** (structure) → deuxieme reference. Montre la liste des 6 FAQ dans `FAQ_FILES` et le pattern de boucle.

3. **`scripts/seo-geo/source/01-acupuncture-anxiete.md`** → exemple de FAQ source. **Gotcha critique** : les champs d'une FAQ sont `question`, `slug`, `category`, `metaTitle`, `metaDescription`, `shortAnswer`, `detailedAnswer`, `keyPoints`, `scientificSource`, `publishedDate`, `updatedDate`, `featuredBlogSlug`, `relatedFaqSlugs`, `resourcePillarSlug`. La FAQ Firestore type `FAQ` (MW-B2) a des champs differents — il faut mapper : `detailedAnswer` → `reponse`, `question` → `question`, etc.

4. **`scripts/seo-geo/source-resources/01-acupuncture-fertilite-montreal.md`** (premieres 50 lignes) → exemple de ressource source. Champs : `title`, `slug`, `category`, `metaTitle`, `metaDescription`, `heroImageAlt`, `shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `faqJson`, `testimonial`, `publishedDate`, `updatedDate`, `authorName`, `relatedGuides`.

5. **`lib/types/faq.ts`** (MW-B2) → schema cible `FAQ`. Champs obligatoires : `id`, `question`, `reponse` (markdown), `category` (FaqCategory), `order`, `status`, `ctaVariant`, `relatedServices[]`, `relatedArticles[]`, `relatedFaqs[]`, timestamps. **Gotcha** : `FaqCategory` est `'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'seance'` — PAS `'sante-mentale'`. Le fichier source 01 dit `category: sante-mentale` mais le schema ne le supporte pas. Le mapping hardcode doit utiliser `'seance'` pour ce fichier (c'est une question transversale, pas un pilier).

6. **`lib/types/ressource.ts`** (MW-B2) → schema cible `Ressource`. 8 champs rich text + `faqEntries: FaqEntry[]` + `citations: Citation[]` + relations. **Gotcha** : le champ source `faqJson` n'est PAS du JSON mais du markdown structure en `**Q: ...** R: ...`. Le script doit le parser en array `{ question, answer }`.

7. **`docs/migration-wix/DECISIONS_Q1-Q16.md`** → Q10 : file 04 va dans `ressources` avec `pilier: 'transversal'`. Section "Alertes contenu" : temoignages fictifs a remplacer par placeholder.

8. **`lib/firebase-admin.ts`** → pattern Admin SDK. Le script `.mjs` ne peut pas l'importer (TypeScript) — il s'auto-initialise avec `FIREBASE_SERVICE_ACCOUNT` depuis `.env.local` (meme pattern que `migrate-wix-blog.mjs`).

9. **`scripts/migrate-wix-blog.mjs`** (MW-B4) → reference pour le pattern Firebase Admin en `.mjs` : `initializeApp`, `cert`, `getFirestore`, `FieldValue`, `Timestamp`.

10. **`project-docs/02_ROADMAP/migration-wix/MW-D3_import-faq-existantes/MILESTONE.md`** → plan detaille, DoD, contraintes.

---

## Livrable 1 — Script d'import (`scripts/import-seo-geo-content.mjs`)

**Objectif** : script one-shot qui lit les 6 FAQ et les 5 ressources source, les transforme en documents Firestore, et les ecrit dans les collections `faqs` et `ressources`.

**Fichier a creer** : `scripts/import-seo-geo-content.mjs`

### Partie A — Import des 6 FAQ

**Mapping champs source → Firestore** :

| Champ source (fichier .md) | Champ Firestore (`FAQ`) | Transformation |
|---|---|---|
| `question` | `question` | Direct |
| `detailedAnswer` | `reponse` | Direct (markdown brut) |
| `slug` | document ID + `id` | Utiliser comme `.doc(slug).set(...)` |
| — | `category` | **Hardcode** (voir table ci-dessous) |
| — | `order` | Index (1-6) dans l'ordre de traitement |
| — | `status` | `'published'` |
| — | `ctaVariant` | `'reserver'` (defaut) |
| — | `relatedServices` | `[]` (MW-D6) |
| — | `relatedArticles` | `[]` (MW-D6) |
| — | `relatedFaqs` | `[]` (MW-D6) |
| `publishedDate` | `publishedAt` | `Timestamp.fromDate(new Date(value))` |
| — | `createdAt` | `FieldValue.serverTimestamp()` |
| — | `updatedAt` | `FieldValue.serverTimestamp()` |

**Mapping categories FAQ (hardcode, pas de detection automatique)** :

```javascript
const FAQ_CATEGORY_MAP = {
  '01-acupuncture-anxiete.md': 'seance',
  '02-combien-seances-fiv.md': 'fertilite',
  '03-acupuncture-securitaire-fiv.md': 'fertilite',
  '04-tomber-enceinte-naturellement.md': 'fertilite',
  '05-nausees-grossesse.md': 'grossesse',
  '06-bebe-siege-moxibustion.md': 'grossesse',
};
```

**Pourquoi hardcode** : les fichiers source ont des categories heterogenes (01 dit `sante-mentale`, les autres sont vides). Le type `FaqCategory` n'accepte que 5 valeurs precises. Le mapping est dans le MILESTONE.md et valide par Benoit.

### Partie B — Import des 5 ressources

**Mapping champs source → Firestore** :

| Champ source | Champ Firestore (`Ressource`) | Transformation |
|---|---|---|
| `title` | `title` | Direct |
| `slug` | document ID + `slug` | `.doc(slug).set(...)` |
| `category` | `pilier` | Direct (deja correct dans les fichiers : fertilite, grossesse, etc.) |
| — | `type` | `'guide'` (toutes les 5 sont des guides) |
| — | `status` | `'published'` |
| `metaTitle` | `metaTitle` | Direct |
| `metaDescription` | `metaDescription` | Direct |
| `heroImageAlt` | `heroImageAlt` | Direct |
| — | `heroImageUrl` | `undefined` (photos pas encore uploadees — MW-A1b) |
| `shortAnswer` | `shortAnswer` | Direct (markdown) |
| `introSection` | `introSection` | Direct (markdown) |
| `scienceSection` | `scienceSection` | Direct (markdown) |
| `mechanismSection` | `mechanismSection` | Direct (markdown) |
| `judithApproach` | `judithApproach` | Direct (markdown) |
| `whatToExpect` | `whatToExpect` | Direct (markdown) |
| `protocolSection` | `protocolSection` | Direct (markdown) |
| `testimonial` | `testimonial` | **Verifier les temoignages fictifs** (voir contrainte) |
| `faqJson` | `faqEntries` | **Parser** le markdown Q/R en array `[{ question, answer }]` |
| — | `citations` | `[]` (les citations sont dans le markdown inline, pas extraites separement) |
| `relatedGuides` | `relatedResources` | Parser comme array de slugs |
| — | `relatedServices`, `relatedFaqs`, `relatedArticles` | `[]` (MW-D6) |
| `authorName` | `authorName` | Direct |
| `publishedDate` | `publishedAt` | `Timestamp.fromDate(new Date(value))` |
| — | `createdAt` | `FieldValue.serverTimestamp()` |
| — | `updatedAt` | `FieldValue.serverTimestamp()` |

**Mapping pilier ressources** :

```javascript
const RESOURCE_PILIER_MAP = {
  '01-acupuncture-fertilite-montreal.md': 'fertilite',
  '02-acupuncture-grossesse-montreal.md': 'grossesse',
  '03-acupuncture-pediatrique-enfants-bebes.md': 'pediatrie',
  '04-acupuncture-sante-mentale-anxiete.md': 'transversal',
  '05-acupuncture-sociale-montreal.md': 'acupuncture-sociale',
};
```

### Parser `faqJson` → `faqEntries`

Le champ `faqJson` dans les fichiers source n'est PAS du JSON. C'est du markdown structure :

```
**Q1 : L'acupuncture peut-elle vraiment m'aider à tomber enceinte ?**
R : Les etudes recentes...

**Q2 : Combien de seances...?**
R : Idealement...
```

**Algorithme de parsing** :

```javascript
function parseFaqEntries(faqMarkdown) {
  if (!faqMarkdown) return [];
  const entries = [];
  // Split par les markers **Q\d+ :
  const blocks = faqMarkdown.split(/\*\*Q\d+\s*:\s*/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    // Separer question (avant **) et reponse (apres R :)
    const match = block.match(/^(.+?)\*\*\s*\n\s*R\s*:\s*([\s\S]+?)$/);
    if (match) {
      entries.push({
        question: match[1].trim().replace(/\?$/, '?'),
        answer: match[2].trim(),
      });
    }
  }
  return entries;
}
```

### Temoignages fictifs

Le MILESTONE.md et DECISIONS demandent de detecter les temoignages fictifs et de les remplacer. Chercher dans le champ `testimonial` les marqueurs suivants :
- Le caractere `⚠️`
- Le mot "fictif" (case insensitive)
- Des noms comme "Sarah, 36 ans" qui semblent inventes

Si detecte, remplacer le contenu du champ `testimonial` par :
```
[Temoignage a fournir par Judith — le contenu original etait marque comme fictif]
```

Et ajouter un warning dans le rapport + NOTES.md.

### Mode `--dry-run`

```javascript
const DRY_RUN = process.argv.includes('--dry-run');
```

En dry-run :
- Lit et parse tous les fichiers (valide le parsing)
- Affiche les documents qui seraient crees (slug, question/title, category, nombre de champs)
- N'ecrit PAS dans Firestore
- Signale les temoignages fictifs detectes

### Idempotence

Utiliser `.doc(slug).set(data)` pour les FAQ et les ressources. Relancer ne cree pas de doublons.

---

## Livrable 2 — Rapport d'import

**Fichier genere par le script** : `project-docs/02_ROADMAP/migration-wix/MW-D3_import-faq-existantes/artefacts/import-report.md`

```markdown
# Rapport d'import FAQ + Ressources → Firestore

**Date** : {date}
**Mode** : {dry-run | complet}

## FAQ (6)
| # | Slug | Question | Categorie | Status |
|---|------|----------|-----------|--------|

## Ressources (5)
| # | Slug | Titre | Pilier | Sections | FaqEntries | Status |
|---|------|-------|--------|----------|------------|--------|

## Temoignages fictifs detectes
- {fichier} : {description}

## Warnings
- {messages}
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/`, `components/`, `lib/`, `public/`, `tailwind.config.ts`, `next.config.mjs`, `package.json`
- **Ne pas modifier** les fichiers source (`scripts/seo-geo/source/*.md`, `scripts/seo-geo/source-resources/*.md`) — lecture seule
- **Ne pas** supprimer les fichiers source apres import
- **Ne pas** convertir le markdown en Ricos ou en HTML — stocker le markdown brut dans Firestore
- **Ne pas** installer de nouvelle dependance npm
- **Ne pas** deviner les categories — utiliser les mappings hardcodes
- **Ne PAS importer les temoignages fictifs tels quels** — les remplacer par un placeholder
- Script en `.mjs` (pas `.ts`) — coherent avec les scripts existants
- Idempotent : `.doc(slug).set()`, pas `.add()`
- **Pas d'emojis** dans les commentaires ou l'output du script

---

## Definition of Done

Chaque item doit etre verifiable en < 30 secondes.

- [ ] `scripts/import-seo-geo-content.mjs` s'execute sans erreur en mode `--dry-run`
- [ ] En `--dry-run`, affiche 6 FAQ + 5 ressources avec slug, categorie/pilier, nombre de champs
- [ ] En mode reel : 6 documents dans `faqs` Firestore avec `status: 'published'`
- [ ] En mode reel : 5 documents dans `ressources` Firestore avec `status: 'published'`
- [ ] Chaque FAQ a : `question` non vide, `reponse` non vide (markdown), `category` valide (`FaqCategory`), `order` (1-6)
- [ ] Chaque ressource a les 8 sections riches non vides : `shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `testimonial`
- [ ] Chaque ressource a `faqEntries` en array d'objets (pas un string) avec au moins 3 entrees
- [ ] Chaque ressource a `pilier` valide (`RessourcePilier`)
- [ ] La ressource `04-acupuncture-sante-mentale-anxiete` a `pilier: 'transversal'` (Q10)
- [ ] La FAQ `01-acupuncture-anxiete` a `category: 'seance'` (pas `'sante-mentale'`)
- [ ] Les temoignages fictifs sont remplaces par un placeholder dans les documents Firestore (verifiable dans la console Firebase sur la ressource fertilite)
- [ ] Le rapport `artefacts/import-report.md` documente les temoignages fictifs detectes
- [ ] `NOTES.md` cree avec : date, resume, flag explicite sur les temoignages fictifs
- [ ] `git diff` ne montre **aucune modification** dans `app/`, `lib/`, `scripts/seo-geo/source/`, `scripts/seo-geo/source-resources/`
- [ ] **Idempotence** : relancer le script ne cree pas de doublons

---

## Notes d'execution (conseils)

- **Ordre recommande** : lire les fichiers source + scripts de reference → ecrire le script → `--dry-run` → verifier l'output → mode reel → rapport → NOTES.md
- **`extractField()` est la cle** : copier cette fonction depuis `publish-all-resources.mjs` (lignes 92-101) — elle est deja testee et fiable.
- **Tester le parser faqJson isolement** : le format `**QN : question** R : reponse` est specifique. Tester sur `01-acupuncture-fertilite-montreal.md` qui a le faqJson le plus long (7+ questions).
- **Firebase Admin init** : meme pattern que `migrate-wix-blog.mjs` (charger `FIREBASE_SERVICE_ACCOUNT` depuis `.env.local`, `initializeApp({ credential: cert(...) })`). Le storageBucket n'est pas necessaire ici (pas d'upload d'images).
- **Les FAQ source n'ont pas toutes les memes champs** : le fichier 01 a `category: sante-mentale`, les autres n'ont pas de champ category. Le mapping hardcode gere cette heterogeneite.
- **`relatedGuides`** dans les ressources est un champ texte avec des slugs separes par des virgules ou des retours a la ligne. Le parser doit les splitre en array de strings.

---

## Commit final attendu

Un seul commit a la fin, sur la branche `feature/site-public-migration` :

```
feat(migration): MW-D3 import 6 FAQ + 5 ressources → Firestore
```

Message detaille :

```
- Script import-seo-geo-content.mjs : 6 FAQ + 5 ressources → Firestore
- FAQ : categories hardcodees (seance, fertilite, grossesse)
- Ressources : 8 sections riches + faqEntries parsed + pilier mappe
- Temoignages fictifs detectes et remplaces par placeholder
- Mode --dry-run pour validation
- Idempotent : .doc(slug).set(), pas de doublons
- Zero modification des fichiers source
- Ref: MW-D3, MW-B2 (schemas), DECISIONS Q10
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de decider.

---

## References

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-D3_import-faq-existantes/MILESTONE.md`
- Schemas cibles : `lib/types/faq.ts`, `lib/types/ressource.ts`
- Scripts de reference : `scripts/seo-geo/publish-all-resources.mjs`, `scripts/seo-geo/publish-all-faq.mjs`
- Pattern Admin SDK : `scripts/migrate-wix-blog.mjs` (MW-B4)
- Sources FAQ : `scripts/seo-geo/source/*.md`
- Sources ressources : `scripts/seo-geo/source-resources/*.md`
- Decisions : `docs/migration-wix/DECISIONS_Q1-Q16.md` (Q10, alertes temoignages)
- Invariants : `docs/migration-wix/CLAUDE.md`
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution sur branche `feature/site-public-migration` apres review Benoit/Desktop.*
