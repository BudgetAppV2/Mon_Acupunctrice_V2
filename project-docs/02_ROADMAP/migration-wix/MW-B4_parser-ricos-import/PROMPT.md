# MW-B4 — Parser Ricos JSON → Markdown + script migration blog Wix → Firestore

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

MW-A1a a exporte les 11 articles de blog Wix en Ricos JSON brut (dans `artefacts/blog-ricos/`) et telecharge 40 images (11 covers + 29 inline dans `artefacts/images/blog/`). MW-B2 a defini le schema `PublicBlogPost` dans Firestore. Ce milestone fait le pont : ecrire un parser Ricos → markdown, un script de migration qui pousse le tout dans Firestore avec images re-uploadees vers Firebase Storage. Script en `.mjs`, coherent avec `scripts/export-wix-blog.mjs` et `scripts/seo-geo/*.mjs`.

Apres ce milestone : les 11 articles sont dans `publicBlog` Firestore avec `status: 'published'`, le markdown est lisible, et les images pointent vers Firebase Storage.

---

## Stack

Node.js (script `.mjs` standalone), Firebase Admin SDK (`firebase-admin/firestore` + `firebase-admin/storage`), pas de TypeScript. Le parser est un module `.mjs` reutilisable.

---

## Fichiers a lire AVANT de commencer

Dans cet ordre exact. Ne commence a coder qu'apres avoir lu les 10.

1. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES.md`** → **3 gotchas critiques** decouverts pendant l'export qui impactent directement le parser :
   - IMAGE `src` est un objet `{ id: "hash~mv2.ext" }` pas un string → URL = `https://static.wixstatic.com/media/${src.id}`
   - Les covers ne sont PAS dans le Ricos JSON — elles sont dans `post.media.wixMedia.image`
   - Double nom env var : `WIX_API_KEY` / `CMS_PUBLICATION_KEY`

2. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/blog-ricos/acupuncture-nausees-grossesse.json`** → article le plus complet (191 noeuds, 4 images). **Inspecte le JSON** pour comprendre la structure reelle. Types de noeuds presents dans les 11 articles : `HEADING`, `PARAGRAPH`, `TEXT`, `IMAGE`, `BULLETED_LIST`, `LIST_ITEM`, `BLOCKQUOTE`, `BUTTON`, `CAPTION`. Decorations TEXT : `BOLD`, `ITALIC`, `UNDERLINE`, `LINK`, `COLOR`.

3. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/blog-ricos/acupuncture-coliques-nourrisson.json`** → article plus simple (pas de liste, pas de blockquote) pour tester le parser sur un cas minimal.

4. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/blog-metadata.json`** → metadata des 11 articles (id, title, slug, firstPublishedDate, excerpt, coverImageUrl, categoryIds, author). C'est la source des champs du document `PublicBlogPost` qui ne viennent pas du Ricos JSON.

5. **`lib/types/public-blog.ts`** (MW-B2) → schema cible. Champs a remplir : `id`, `title`, `slug`, `content` (markdown), `excerpt`, `coverImage` (URL Firebase Storage), `author`, `category`, `tags`, `status`, `wixPostId`, `publishedAt`, `createdAt`, `updatedAt`. Les `related*` sont vides au lancement (MW-D6).

6. **`lib/firebase-admin.ts`** → pattern Admin SDK existant. **Gotcha critique** : le script `.mjs` ne peut PAS importer ce fichier TypeScript directement. Il doit initialiser Firebase Admin lui-meme avec le JSON de `FIREBASE_SERVICE_ACCOUNT` depuis `.env.local`. Pattern : `import { initializeApp, cert } from 'firebase-admin/app'` + `import { getFirestore } from 'firebase-admin/firestore'` + `import { getStorage } from 'firebase-admin/storage'`.

7. **`scripts/export-wix-blog.mjs`** (MW-A1a) → pattern de reference pour le script `.mjs` : loadEnv, assertCredentials, structure du script, gestion d'erreurs, rapports.

8. **`scripts/seo-geo/publish-all-resources.mjs`** → deuxieme reference `.mjs` pour le style de code.

9. **`lib/utils/ricosConverter.ts`** (premieres 30 lignes) → montre la structure `RicosNode` telle qu'elle est utilisee DANS le repo pour la conversion text → Ricos (direction inverse). Utile pour comprendre le vocabulaire mais les structures reelles des JSON exportes sont la source de verite.

10. **`project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/MILESTONE.md`** → plan detaille, DoD, contraintes.

---

## Livrable 1 — Parser Ricos → Markdown (`scripts/ricos-to-markdown.mjs`)

**Objectif** : module `.mjs` reutilisable qui convertit un document Ricos JSON en markdown propre.

**Fichier a creer** : `scripts/ricos-to-markdown.mjs`

**API exportee** :

```javascript
/**
 * Convertit un Ricos richContent en markdown.
 * @param {object} richContent — l'objet { nodes: [...] } du Ricos JSON
 * @returns {string} — markdown propre
 */
export function ricosToMarkdown(richContent) { ... }
```

**Noeuds a supporter** (decouverts dans les 11 articles exportes) :

| Type Ricos | Rendu Markdown | Notes |
|---|---|---|
| `HEADING` | `#`, `##`, `###` ... | `headingData.level` (1-6) |
| `PARAGRAPH` | Texte + saut de ligne | Contient des noeuds `TEXT` enfants |
| `TEXT` | Texte brut | Decorations en sous-structure |
| `BULLETED_LIST` | `- item` | Contient des `LIST_ITEM` enfants |
| `LIST_ITEM` | Texte de l'item | Contient un `PARAGRAPH` enfant |
| `BLOCKQUOTE` | `> texte` | Contient un `PARAGRAPH` enfant |
| `IMAGE` | `![alt](url)` | `imageData.image.src.id` → URL reconstruite |
| `BUTTON` | `[texte](url)` | CTA "Je prends rendez-vous" → lien markdown |
| `CAPTION` | Texte en italique sous image | Contient des noeuds `TEXT` |

**Decorations TEXT** :

| Type | Rendu | Exemple |
|---|---|---|
| `BOLD` | `**texte**` | `decorations: [{ type: 'BOLD' }]` |
| `ITALIC` | `*texte*` | `decorations: [{ type: 'ITALIC' }]` |
| `UNDERLINE` | `texte` (ignorer en markdown) | Pas d'equivalent markdown standard |
| `LINK` | `[texte](url)` | `decorations: [{ type: 'LINK', linkData: { link: { url } } }]` |
| `COLOR` | Ignorer | Couleur CSS, pas convertible en markdown |

**Structure du Ricos JSON** (decouverte MW-A1a) :

```
richContent.nodes[] :
  type: 'HEADING'
    headingData: { level: 1-6 }
    nodes: [] (pas de children — le texte n'est PAS dans nodes pour les headings)
    // GOTCHA: certains headings ont des TEXT children, d'autres non
    // Si nodes est vide, c'est un heading vide (separateur visuel Wix)

  type: 'PARAGRAPH'
    paragraphData: { ... }
    nodes: [ { type: 'TEXT', textData: { text, decorations } } ]

  type: 'TEXT'
    textData: { text: "...", decorations: [{ type: 'BOLD' }, { type: 'LINK', linkData: { link: { url, target } } }] }

  type: 'IMAGE'
    imageData: {
      image: { src: { id: "hash~mv2.ext" }, width, height },  // src est un OBJET pas un string
      altText: "...",
      caption: "..."
    }

  type: 'BULLETED_LIST'
    nodes: [ { type: 'LIST_ITEM', nodes: [ { type: 'PARAGRAPH', nodes: [TEXT...] } ] } ]

  type: 'BLOCKQUOTE'
    nodes: [ { type: 'PARAGRAPH', nodes: [TEXT...] } ]

  type: 'BUTTON'
    buttonData: { text: "...", link: { url: "...", target: "BLANK" } }

  type: 'CAPTION'
    nodes: [ { type: 'TEXT', textData: { text, decorations } } ]
```

**Algorithme du parser** :

```
ricosToMarkdown(richContent):
  lines = []
  for each node in richContent.nodes:
    line = parseNode(node)
    if line !== null:
      lines.push(line)
  return lines.join('\n\n')  // double saut entre les blocs

parseNode(node):
  switch node.type:
    HEADING:
      text = parseChildren(node.nodes)
      if !text: return null  // heading vide = skip
      return '#'.repeat(node.headingData.level) + ' ' + text

    PARAGRAPH:
      text = parseChildren(node.nodes)
      return text || ''  // paragraphe vide = ligne vide

    BULLETED_LIST:
      items = node.nodes
        .filter(n => n.type === 'LIST_ITEM')
        .map(item => '- ' + parseChildren(item.nodes?.[0]?.nodes || []))
      return items.join('\n')

    BLOCKQUOTE:
      inner = parseChildren(node.nodes?.[0]?.nodes || [])
      return '> ' + inner

    IMAGE:
      src = node.imageData?.image?.src
      url = typeof src === 'string' ? src : `https://static.wixstatic.com/media/${src.id}`
      alt = node.imageData?.altText || ''
      return `![${alt}](${url})`

    BUTTON:
      text = node.buttonData?.text || 'Lien'
      url = node.buttonData?.link?.url || ''
      return `[${text}](${url})`

    CAPTION:
      text = parseChildren(node.nodes)
      return text ? `*${text}*` : null  // italique pour les captions

    default:
      // Type non reconnu — log warning, skip
      return null

parseChildren(nodes):
  if !nodes or nodes.length === 0: return ''
  parts = nodes.filter(n => n.type === 'TEXT').map(parseTextNode)
  return parts.join('')

parseTextNode(node):
  text = node.textData?.text || ''
  decorations = node.textData?.decorations || []
  // Appliquer les decorations en ordre
  for each deco in decorations:
    if deco.type === 'BOLD': text = `**${text}**`
    if deco.type === 'ITALIC': text = `*${text}*`
    if deco.type === 'LINK': text = `[${text}](${deco.linkData.link.url})`
    // UNDERLINE, COLOR: ignorer
  return text
```

**Points cles** :
- Le parser ne gere PAS le telechargement d'images — il produit des URLs `static.wixstatic.com`. Le script de migration (L2) remplace ces URLs par les URLs Firebase Storage apres upload.
- Les noeuds `HEADING` sans children sont des separateurs visuels Wix — les skipper (retourner `null`).
- Les decorations multiples sur un meme TEXT doivent etre imbriquees : `**[texte](url)**` pour bold + link.
- Le parser est un module `.mjs` pur sans side effects, importable via `import { ricosToMarkdown } from './ricos-to-markdown.mjs'`.

---

## Livrable 2 — Script de migration (`scripts/migrate-wix-blog.mjs`)

**Objectif** : script one-shot qui lit les 11 Ricos JSON exportes en MW-A1a, les convertit en markdown, uploade les images vers Firebase Storage, et ecrit les documents `publicBlog` dans Firestore.

**Fichier a creer** : `scripts/migrate-wix-blog.mjs`

**Algorithme** :

```
1. Charger .env.local (loadEnv pattern de export-wix-blog.mjs)
2. Verifier credentials : FIREBASE_SERVICE_ACCOUNT obligatoire
3. Initialiser Firebase Admin (Firestore + Storage)
4. Lire blog-metadata.json pour les metadonnees
5. Pour chaque article dans blog-metadata.json :
   a. Lire le Ricos JSON depuis artefacts/blog-ricos/{slug}.json
   b. Parser avec ricosToMarkdown() → markdown brut
   c. Identifier les URLs static.wixstatic.com dans le markdown
   d. Pour chaque image dans artefacts/images/blog/{slug}/ :
      - Uploader vers Firebase Storage sous public/blog/{slug}/{filename}
      - Obtenir l'URL publique via getDownloadURL ou construire l'URL publique
      - Remplacer l'URL Wix dans le markdown par l'URL Storage
   e. Uploader la cover image → public/blog/{slug}/cover.{ext}
   f. Construire le document PublicBlogPost :
      - id: slug (utiliser comme document ID)
      - title: depuis metadata
      - slug: depuis metadata
      - content: markdown avec URLs remplacees
      - excerpt: depuis metadata
      - coverImage: URL Firebase Storage de la cover
      - author: depuis metadata (detecter Claire Thomas)
      - category: resoudre categoryIds → noms lisibles (ou garder l'ID)
      - tags: []
      - status: 'published'
      - wixPostId: id original Wix
      - relatedServices, relatedFaqs, relatedArticles: [] (MW-D6)
      - publishedAt: depuis metadata.firstPublishedDate
      - createdAt, updatedAt: now
   g. Ecrire dans Firestore publicBlog/{slug}
6. Generer un rapport de migration
```

**Firebase Admin initialisation** (dans le script, pas d'import TypeScript) :

```javascript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Charger FIREBASE_SERVICE_ACCOUNT depuis .env.local
const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT in .env.local');
  process.exit(1);
}
const serviceAccount = JSON.parse(serviceAccountJson);
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const bucket = getStorage(app).bucket();  // bucket par defaut du projet
```

**Upload image vers Firebase Storage** :

```javascript
async function uploadToStorage(localPath, storagePath) {
  const file = bucket.file(storagePath);
  await file.save(readFileSync(localPath), {
    metadata: { contentType: getMimeType(localPath) },
    public: true,  // rendre accessible sans auth
  });
  // URL publique du bucket
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}
```

**Remplacement des URLs dans le markdown** :

Apres parsing, le markdown contient des `![alt](https://static.wixstatic.com/media/hash~mv2.ext)`. Le script :
1. Liste les fichiers dans `artefacts/images/blog/{slug}/`
2. Mappe chaque image locale a son URL Wix d'origine (via le nom de fichier ou l'ordre)
3. Uploade chaque image et construit un mapping `wixUrl → storageUrl`
4. Remplace dans le markdown via `string.replace()`

**Gotcha mapping images** : le script MW-A1a nomme les images `cover.{ext}`, `inline-1.{ext}`, `inline-2.{ext}`, etc. L'ordre correspond a l'ordre d'apparition dans le Ricos JSON. Pour reconstruire le mapping, parser a nouveau le Ricos JSON pour extraire les URLs dans l'ordre, puis associer chaque `inline-N` a sa position.

**Mode `--dry-run`** : flag qui :
- Parse le markdown (toujours)
- N'uploade PAS les images
- N'ecrit PAS dans Firestore
- Affiche les documents qui seraient crees (titre, slug, longueur markdown, nombre d'images)

**Detection auteur Claire Thomas** : l'article "nausees de grossesse" contient `Article ecrit avec la complicite de Claire Thomas` dans le Ricos JSON. Le script peut chercher ce pattern dans le markdown pour determiner si `author` doit etre "Judith Dufour-Savard et Claire Thomas". Par defaut, `author` = "Judith Dufour-Savard".

---

## Livrable 3 — Rapport de migration

**Fichier genere par le script** : `project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/artefacts/migration-report.md`

```markdown
# Rapport de migration blog Wix → Firestore

**Date** : {date}
**Articles migres** : {count}
**Images uploadees** : {count}
**Mode** : {dry-run | complet}

## Par article
| # | Titre | Slug | Markdown (lignes) | Images | Auteur | Status |
|---|-------|------|-------------------|--------|--------|--------|
| 1 | ... | ... | ... | ... | ... | OK/Warning |

## Warnings
- {messages}
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/`, `components/`, `lib/` (sauf eventuellement `lib/firebase-admin.ts` si besoin d'exporter Storage — voir QS1)
- **Ne pas modifier** `tailwind.config.ts`, `next.config.ts`, `package.json`
- **Ne pas** reecrire ou ameliorer les articles de Claire Thomas — conversion fidele uniquement
- **Ne pas** utiliser la bibliotheque Ricos officielle Wix (lourde, orientee DOM)
- **Ne pas** installer de nouvelle dependance npm — `firebase-admin` v13 inclut deja Storage
- **Ne pas** executer le script automatiquement au build — c'est un one-shot manuel
- **Ne pas** creer de route API pour ca — script standalone `.mjs`
- **Ne pas** modifier les Ricos JSON source dans `artefacts/` — lecture seule
- **Ne pas** toucher a `firestore.rules` ni `firestore.indexes.json` — deja fait en MW-B2
- Le parser doit **gerer gracieusement** les types Ricos non reconnus (log warning, skip le noeud) — pas de crash
- **Pas d'emojis** dans les commentaires ou l'output du script

---

## Definition of Done

Chaque item doit etre verifiable en < 30 secondes.

- [ ] `scripts/ricos-to-markdown.mjs` exporte `ricosToMarkdown()` qui prend un objet `{ nodes: [...] }` et retourne un string markdown
- [ ] Le parser gere : HEADING, PARAGRAPH, TEXT (BOLD, ITALIC, LINK), BULLETED_LIST, IMAGE, BLOCKQUOTE, BUTTON, CAPTION
- [ ] Le parser ne crash PAS sur un type de noeud inconnu — il le skip avec un warning
- [ ] `scripts/migrate-wix-blog.mjs` s'execute sans erreur en mode `--dry-run`
- [ ] En `--dry-run`, le script affiche 11 articles avec titre, slug, longueur markdown, nombre d'images
- [ ] Le markdown genere pour `acupuncture-nausees-grossesse` contient des headings (`##`), du texte, des images (`![alt](url)`), et au moins une liste (`- item`)
- [ ] En mode reel : 11 documents dans `publicBlog` Firestore avec `status: 'published'`
- [ ] Les images sont uploadees dans Firebase Storage sous `public/blog/{slug}/`
- [ ] Les URLs dans le markdown Firestore pointent vers Firebase Storage (pas `static.wixstatic.com`)
- [ ] La cover image de chaque article est dans le champ `coverImage` du document Firestore
- [ ] Le rapport de migration est genere dans `artefacts/migration-report.md`
- [ ] `git diff` ne montre **aucune modification** dans `app/`, `tailwind.config.ts`, `firestore.rules`
- [ ] `NOTES.md` cree avec : date, resume, types Ricos rencontres, qualite du markdown genere, warnings

---

## Notes d'execution (conseils)

- **Ordre recommande** : L1 (parser) → tester sur 1 article → L2 (script migration en dry-run) → tester dry-run complet → L2 mode reel → L3 (rapport) → NOTES.md
- **Tester le parser d'abord isolement** : ecrire un petit test inline qui parse `acupuncture-nausees-grossesse.json` et affiche le markdown dans la console. Verifier visuellement que le resultat est lisible.
- **Les images locales ont des extensions variees** : `.png`, `.jpg`, `.jpeg`. Le script doit gerer les 3.
- **Firebase Storage bucket** : le bucket par defaut est `{projectId}.appspot.com`. `getStorage().bucket()` retourne le bucket par defaut.
- **URLs publiques Storage** : apres `file.save()` avec `public: true`, l'URL est `https://storage.googleapis.com/{bucket}/{path}`. Alternative : `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media`.
- **Mapping images Wix → locales** : le plus fiable est de re-parser le Ricos JSON pour extraire les IDs d'images dans l'ordre, puis matcher chaque `inline-N.{ext}` a sa position dans la liste.
- **`FieldValue.serverTimestamp()`** vs `Timestamp.fromDate(new Date())` : pour `createdAt`/`updatedAt`, utiliser `FieldValue.serverTimestamp()`. Pour `publishedAt`, utiliser `Timestamp.fromDate(new Date(metadata.firstPublishedDate))` pour preserver la date originale.

---

## Commit final attendu

Un seul commit a la fin, sur la branche `feature/site-public-migration` :

```
feat(migration): MW-B4 parser Ricos + script migration blog Wix → Firestore
```

Message detaille :

```
- Parser ricos-to-markdown.mjs : HEADING, PARAGRAPH, TEXT, IMAGE, LIST, BLOCKQUOTE, BUTTON, CAPTION
- Script migrate-wix-blog.mjs : 11 articles → publicBlog Firestore + images Firebase Storage
- Mode --dry-run pour validation sans ecriture
- Rapport de migration genere
- Ref: MW-B4, MW-A1a (source Ricos JSON), MW-B2 (schema PublicBlogPost)
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de decider.

---

## Questions strategiques pour review Desktop

### QS1 — Faut-il modifier `lib/firebase-admin.ts` pour exporter Storage ?

**Contexte** : le fichier actuel exporte uniquement `getAdminFirestore()`. Le script `.mjs` a besoin de Storage en plus. Deux options :

- **(a)** Ne PAS modifier `lib/firebase-admin.ts` — le script `.mjs` initialise Firebase Admin lui-meme (duplique 5 lignes de setup). Avantage : zero modification du code existant. Inconvenient : duplication.
- **(b)** Ajouter `getAdminStorage()` dans `lib/firebase-admin.ts`. Avantage : DRY. Inconvenient : modifie un fichier existant du Hub + le script `.mjs` ne peut pas importer du `.ts` directement.

**Reco par defaut** : option (a) — le script initialise Firebase Admin lui-meme. Le setup est 5 lignes, la duplication est minimale, et ca evite de modifier le code du Hub. Le `lib/firebase-admin.ts` sera enrichi plus tard si d'autres routes API en ont besoin.

### QS2 — Categories : resoudre les IDs Wix en noms lisibles ?

**Contexte** : `blog-metadata.json` contient des `categoryIds` (ex: `d96bd601-040c-40da-99e4-8444972d044a`) mais pas les noms. Le script `list-blog-posts.mjs` fetche les categories via l'API (`/blog/v3/categories`) pour les resoudre. Le champ `category` de `PublicBlogPost` est un `string` libre.

- **(a)** Resoudre via l'API Wix dans le script de migration (comme `list-blog-posts.mjs`) → noms lisibles dans Firestore
- **(b)** Stocker l'ID brut → inutile pour l'affichage
- **(c)** Mapper manuellement les 6 categories connues (Fertilite, Grossesse, Post-partum, Enfant, Acupuncture pour tous, Sante generale) dans un objet hardcode dans le script

**Reco par defaut** : option (a) — fetch des categories via l'API pour etre fidele. C'est 1 appel API supplementaire et le pattern est deja dans `list-blog-posts.mjs`.

---

## References

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/MILESTONE.md`
- MW-A1a NOTES (gotchas) : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES.md`
- Ricos JSON source : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/blog-ricos/`
- Blog metadata : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/blog-metadata.json`
- Images locales : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/images/blog/`
- Schema cible : `lib/types/public-blog.ts`
- Admin SDK pattern : `lib/firebase-admin.ts`
- Script reference : `scripts/export-wix-blog.mjs`, `scripts/seo-geo/list-blog-posts.mjs`
- Invariants : `docs/migration-wix/CLAUDE.md`
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution sur branche `feature/site-public-migration` apres review Benoit/Desktop.*
