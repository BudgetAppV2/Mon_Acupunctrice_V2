# scripts/seo-geo — Pipeline FAQ Markdown → Wix Ricos

Validation technique de la direction Hub V2 pour la publication automatisée de
contenu SEO/GEO dans les collections Wix CMS de `acupuncturejudith.ca`.

## Contexte

Les 6 FAQ pilotes ont été importées dans Wix via CSV le 8 avril 2026 avec du
HTML dans les champs Texte enrichi (shortAnswer, keyPoints, scientificSource)
— ça marche. Par contre, le champ `detailedAnswer` est de type **Contenu
enrichi** (format Ricos propriétaire Wix), et le HTML n'y fonctionne pas via
CSV. Solution : utiliser l'API Wix officielle `convertToRicosDocument` pour
convertir le Markdown source en document Ricos, puis `PATCH` l'entrée via
l'API Wix Data.

## Scripts

### `test-convert-anxiete.mjs`

Script de test initial (1 seule FAQ). Validé fonctionnel le 8 avril 2026.
Conservé comme référence et pour débogage.

```bash
node scripts/seo-geo/test-convert-anxiete.mjs
```

### `publish-all-faq.mjs`

Script de production qui boucle sur les 6 fichiers .md dans `source/` et met
à jour le `detailedAnswer` de chaque entrée FAQ correspondante dans Wix.

```bash
node scripts/seo-geo/publish-all-faq.mjs
```

## Architecture technique

1. **Authentification** : clé admin `CMS_PUBLICATION_KEY` dans `.env.local`,
   envoyée via headers `Authorization` + `wix-site-id` + `wix-account-id`.
2. **Pas de dépendances npm** : utilise `fetch` natif Node 22+ et les modules
   built-in `fs`, `path`, `url`. Aucun ajout à `package.json`.
3. **APIs Wix utilisées** :
   - `POST /wix-data/v2/items/query` — trouver l'entrée par slug
   - `POST /ricos/v1/ricos-document/convert/to-ricos` — Markdown → Ricos
   - `PATCH /wix-data/v2/items/{id}` — update partiel (seulement le champ visé)
4. **Plugins Ricos activés** : `HEADING`, `LINK`, `DIVIDER`. Les listes
   (`BULLETED_LIST`, `ORDERED_LIST`) et décorations (`BOLD`, `ITALIC`) sont
   activées par défaut par le parser Markdown de Wix.

## Structure

```
scripts/seo-geo/
├── README.md                    (ce fichier)
├── test-convert-anxiete.mjs     (test 1 FAQ)
├── publish-all-faq.mjs          (production 6 FAQ)
└── source/                      (miroir local des .md sources)
    ├── 01-acupuncture-anxiete.md
    ├── 02-combien-seances-fiv.md
    ├── 03-acupuncture-securitaire-fiv.md
    ├── 04-tomber-enceinte-naturellement.md
    ├── 05-nausees-grossesse.md
    └── 06-bebe-siege-moxibustion.md
```

Note : les fichiers `source/` sont des copies simplifiées contenant
uniquement `slug` et `detailedAnswer`. Les originaux complets vivent dans
`~/Documents/Judith_SEO_GEO/02_contenu/faq/`. Les copies locales évitent les
problèmes de permissions macOS sur `~/Documents` quand Node est lancé depuis
un terminal non autorisé.

## Format des fichiers source

Chaque .md contient au minimum :

```markdown
### CHAMP: slug
mon-slug-kebab-case

### CHAMP: detailedAnswer

Contenu Markdown ici.

**Gras** et *italiques* supportés.

- Listes à puces
- Avec du **gras inline**

### CHAMP: end
```

Le parser `extractField()` extrait chaque section entre `### CHAMP: X` et
le marqueur suivant (`### CHAMP:` ou `---`).

## Prochaines étapes (Hub V2)

Ce script est la preuve de concept (POC) validée le 8 avril 2026. Les
prochaines phases du plan Hub V2 consistent à :

1. Généraliser le parser pour gérer tous les champs (pas juste detailedAnswer)
2. Ajouter un mode dry-run avec preview du Ricos JSON
3. Intégrer dans un cron Vercel (`/api/cron/publish-seo-geo` à 9h)
4. Créer un dashboard pour Judith (validation post-publication)
5. Ajouter la collection `Ressources` avec le même pipeline
6. Intégration Google Search Console pour monitoring SEO

Voir : `~/Documents/Judith_SEO_GEO/03_technique/plan-long-terme-hub-v2.md`
