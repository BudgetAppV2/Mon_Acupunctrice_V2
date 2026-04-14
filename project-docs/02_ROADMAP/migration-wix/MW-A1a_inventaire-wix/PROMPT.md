# MW-A1a — Inventaire Wix complet + export contenu editorial

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

On lance la migration Wix → Vercel. Avant de coder quoi que ce soit (parser Ricos, import Firestore, pages), on a besoin d'un inventaire exhaustif du contenu du site Wix actuel (`acupuncturejudith.ca`) : les 11 articles de blog en Ricos JSON brut, les 8 pages statiques en markdown, les 6 FAQ, toutes les images des articles, et la matrice de redirections 301. Tout vit dans `artefacts/` — aucune modification du code de l'app.

Ce milestone debloque MW-B4 (parser Ricos → markdown), MW-D1 (import blog dans Firestore), et MW-G2 (redirections 301 au lancement).

---

## Stack

Node.js (scripts locaux via `npx tsx`), API Wix Blog v3 (credentials dans `.env.local`), fetch natif. Pas de nouvelle dependance npm.

---

## Fichiers a lire AVANT de commencer

Dans cet ordre exact. Ne commence a executer qu'apres avoir lu les 6.

1. **`app/api/blog/list/route.ts`** → pattern d'auth Wix existant. **Points cles** :
   - Env vars : `WIX_API_KEY` (header `Authorization`), `WIX_SITE_ID` (header `wix-site-id`)
   - Base URL : `https://www.wixapis.com/blog/v3`
   - Endpoint listing : `GET /blog/v3/posts?paging.limit=50&sort.fieldName=firstPublishedDate&sort.order=DESC`
   - L'API retourne `{ posts: [{ id, title, firstPublishedDate, url, media }] }`
   - Les images sont sur `static.wixstatic.com/media`

2. **`app/api/blog/carousel/route.ts`** → pattern alternatif via `POST /blog/v3/posts/query` avec body JSON. Montre que l'API supporte aussi les queries structurees.

3. **`app/api/blog/publish/route.ts`** → montre l'existence de `WIX_MEMBER_ID` en env var et le format Ricos JSON (`richContent` field). L'interface `RicosNode` dans `lib/utils/ricosConverter.ts` montre la structure des noeuds.

4. **`docs/migration-wix/02-recherche/scouting/scout-wix-actuel.md`** → inventaire prealable du site Wix avec les 8 pages statiques, les 11 articles, les 6 FAQ, les URLs exactes. **Gotcha critique** : les slugs Wix sont du type `/post/acupuncture-et-nausees-de-grossesse` — les slugs Next.js seront `/blog/acupuncture-nausees-grossesse`. La matrice de redirections doit mapper les deux.

5. **`docs/migration-wix/CLAUDE.md`** → invariants. Section "Contenu existant a reutiliser" : les 6 FAQ + 5 ressources dans `scripts/seo-geo/` sont **hors scope de MW-A1a** (c'est MW-D3 qui les importe). MW-A1a se concentre sur le contenu Wix.

6. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/MILESTONE.md`** → livrables, DoD, contraintes. Le scope exclut explicitement les assets v4 (photos Eric Bates, SVG, textures) — c'est MW-A1b.

---

## Livrable 1 — Script d'export blog Wix (`scripts/export-wix-blog.ts`)

**Objectif** : script one-shot qui recupere les 11 articles via l'API Wix Blog v3, sauvegarde le Ricos JSON brut, extrait les metadonnees, et telecharge les images.

**Fichier a creer** : `scripts/export-wix-blog.ts` (execute via `npx tsx scripts/export-wix-blog.ts`)

**Algorithme** :

```
1. Charger les env vars depuis .env.local (WIX_API_KEY, WIX_SITE_ID)
2. GET /blog/v3/posts?paging.limit=50 pour lister tous les articles
3. Pour chaque article :
   a. GET /blog/v3/posts/{postId}?fieldsets=GENERATED_RICH_CONTENT
      pour obtenir le Ricos JSON complet (le listing ne retourne pas le contenu)
   b. Sauvegarder le JSON complet dans artefacts/blog-ricos/{slug}.json
   c. Extraire les metadonnees dans artefacts/blog-metadata.json :
      - id, title, slug, firstPublishedDate, excerpt, coverImageUrl, categories, url
      - author : "Judith Dufour-Savard et Claire Thomas" si co-ecrit, sinon "Judith Dufour-Savard"
   d. Scanner le Ricos JSON pour les noeuds IMAGE — telecharger chaque image
      depuis static.wixstatic.com en resolution originale (sans les transforms Wix
      ?w=XXX&h=YYY) dans artefacts/images/blog/{slug}/
   e. Telecharger la cover image dans artefacts/images/blog/{slug}/cover.jpg
4. Ecrire un rapport artefacts/blog-export-report.md avec :
   - Nombre d'articles exportes
   - Nombre d'images telechargees par article
   - Eventuelles erreurs ou warnings
```

**Chargement des env vars** — pattern a reproduire depuis `publish-all-resources.mjs` :

```typescript
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env.local');
  const content = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return env;
}
```

**Headers Wix** :

```typescript
function wixHeaders(env: Record<string, string>): Record<string, string> {
  return {
    'Authorization': env.WIX_API_KEY,
    'wix-site-id': env.WIX_SITE_ID,
    'Content-Type': 'application/json',
  };
}
```

**Extraction des images Ricos** — parcourir recursivement les noeuds du Ricos JSON et chercher les noeuds de type `IMAGE` qui contiennent une URL `static.wixstatic.com` :

```typescript
function extractImageUrls(nodes: unknown[]): string[] {
  const urls: string[] = [];
  for (const node of nodes) {
    // Chercher imageData.image.src ou imageData.src
    // Le format exact sera visible dans les JSON exportes — adapter si necessaire
    if (typeof node === 'object' && node !== null) {
      const n = node as Record<string, unknown>;
      if (n.type === 'IMAGE' && n.imageData) {
        // Extraire l'URL de l'image
      }
      if (Array.isArray(n.nodes)) {
        urls.push(...extractImageUrls(n.nodes));
      }
    }
  }
  return urls;
}
```

**Telecharger une image** — retirer les parametres de transformation Wix pour obtenir l'original :

```typescript
function cleanWixImageUrl(url: string): string {
  // Les URLs Wix ressemblent a :
  // https://static.wixstatic.com/media/hash.jpg/v1/fill/w_740,h_493.../image.jpg
  // L'original est : https://static.wixstatic.com/media/hash.jpg
  // Retirer tout apres le premier /v1/ si present
  const v1Idx = url.indexOf('/v1/');
  return v1Idx > 0 ? url.slice(0, v1Idx) : url;
}
```

**Points cles** :
- Le script charge `.env.local` lui-meme (pas via `process.env`) car c'est un script standalone, pas une route Next.js
- Le fieldset `GENERATED_RICH_CONTENT` est necessaire pour obtenir le Ricos JSON — le listing de base ne le retourne pas
- Les images Wix sont publiques et telechargeable via simple `fetch` — pas d'auth necessaire
- Le script doit etre **idempotent** : re-executer ne cree pas de doublons, ecrase les fichiers existants
- Le script ne modifie RIEN dans `app/`, `lib/`, `components/` — tout va dans `artefacts/`
- Le format exact des noeuds Ricos (IMAGE, VIDEO, etc.) sera decouvert en lisant les premiers JSON exportes. Adapter le parseur si le format differe de l'hypothese.

**Mode `--dry-run`** : optionnel mais utile — affiche les articles trouves sans telecharger les images.

---

## Livrable 2 — Export des 8 pages statiques Wix

**Objectif** : exporter le contenu textuel des 8 pages statiques du site Wix en markdown lisible.

**Approche** : les pages Wix sont rendues 100% cote client (Wix Thunderbolt). Le HTML initial ne contient pas le contenu textuel. Deux strategies possibles :

**Strategie A (recommandee)** : inspecter le JSON initial injecte par Wix dans le HTML. Wix Thunderbolt injecte un payload JSON dans un `<script>` tag qui contient tout le contenu de la page. Fetcher le HTML de chaque page, parser le JSON payload, extraire les textes.

**Strategie B (fallback)** : ecrire le contenu manuellement. Les 8 pages sont connues (scouting), le contenu est relativement court. Si la strategie A est trop fragile (format JSON opaque ou obfusque), documenter le contenu manuellement dans les fichiers markdown.

**Fichiers a produire** dans `artefacts/pages-statiques/` :
- `accueil.md`
- `a-propos.md`
- `services.md`
- `bienfaits.md` (contenu FAQ a redistribuer — noter dans la matrice de redirections)
- `acupuncture-sociale.md`
- `contactez-moi.md`
- `blog.md` (juste la structure de la page liste, pas le contenu des articles)
- `politique-confidentialite.md`

**Pour chaque page** :
- URL Wix source
- Structure des headings (H1, H2, H3)
- Contenu textuel complet en markdown
- Liste des images utilisees (URLs `static.wixstatic.com`)
- Notes sur les composants Wix utilises (formulaire contact, booking widget, etc.)

**Si la strategie A echoue** : noter dans NOTES.md que le contenu devra etre extrait manuellement ou via le navigateur, et produire les fichiers markdown avec ce qui est disponible. Ne pas bloquer le milestone sur cette difficulte.

---

## Livrable 3 — Export des 6 FAQ Wix

**Objectif** : exporter les 6 FAQ dynamiques du site Wix.

**Contexte important** : ces 6 FAQ ont ete **publiees via le Hub V2** (scripts dans `scripts/seo-geo/`). Elles existent DEJA dans le repo sous `scripts/seo-geo/source/`. Ce livrable verifie que le contenu sur Wix correspond bien aux fichiers source et documente les differences eventuelles.

**Fichier a produire** : `artefacts/faq-wix/faq-verification.md`

Contenu :
- Table de correspondance entre les 6 fichiers `scripts/seo-geo/source/*.md` et les FAQ visibles sur le site Wix
- Pour chaque FAQ : titre, categorie, verification que le contenu Wix correspond au fichier source
- Differences detectees (ajouts, modifications, versions differentes)
- Conclusion : "Les 6 FAQ Wix correspondent aux fichiers source — MW-D3 peut importer directement depuis `scripts/seo-geo/source/`" (ou documenter les ecarts si detectes)

**Si l'API Wix FAQ n'est pas accessible** : documenter dans NOTES.md et verifier via inspection du DOM sur 2-3 FAQ echantillonnees.

---

## Livrable 4 — Matrice de redirections 301

**Objectif** : mapper chaque URL indexable du site Wix vers sa future URL Next.js.

**Fichier a creer** : `artefacts/redirections-301.md`

**Structure** :

```markdown
# Matrice de redirections 301 — acupuncturejudith.ca

## Pages statiques

| URL Wix | URL Next.js | Type | Notes |
|---------|-------------|------|-------|
| `/` | `/` | identique | Homepage |
| `/a-propos` | `/a-propos` | identique | |
| `/services` | `/services` | identique | |
| `/bienfaits` | `/faq` | 301 | Contenu redistribue dans les FAQ par pilier (plan §4.1) |
| `/acupuncture-sociale` | `/services/acupuncture-sociale` | 301 | Devient page service pilier |
| `/contactez-moi` | `/contact` | 301 | Slug simplifie |
| `/blog` | `/blog` | identique | |
| `/politique-de-confidentialite-et-cookies` | `/politique-de-confidentialite` | 301 | Slug simplifie |

## Articles de blog

| URL Wix | URL Next.js | Type | Notes |
|---------|-------------|------|-------|
| `/post/{slug-wix}` | `/blog/{slug-next}` | 301 | Prefixe /post/ → /blog/ |
(11 lignes — une par article, slug genere a partir du titre)

## Pages sans equivalent

| URL Wix | Action | Notes |
|---------|--------|-------|
| `/book-online` | 410 Gone ou 301 → `/reserver` | Go Rendez-Vous remplace Wix Bookings |
| `/plans-pricing` | 301 → `/tarifs` | Page prix obsolete |

## Backlink critique

| Source | URL actuelle | URL future | Action |
|--------|-------------|------------|--------|
| `lasourceensoi.com/equipe/judith-dufour-savard/` | `acupuncturejudith.ca` (racine) | `acupuncturejudith.ca` (racine) | Aucune — meme URL, juste le serveur change |
```

**Points cles** :
- Generer les slugs Next.js a partir des titres d'articles (lowercase, hyphen-separated, sans accents, prefixe `/blog/`)
- Le backlink depuis La Source en Soi pointe vers la racine du domaine — il sera preserve automatiquement lors du switch DNS (meme URL, serveur different)
- La page `/bienfaits` est un cas special : son contenu FAQ sera redistribue dans les pages `/faq/*` (decision plan §4.1). La redirection pointe vers `/faq` comme page d'atterrissage.
- Les pages `/book-online` et `/plans-pricing` ne sont pas dans le sitemap officiel mais peuvent etre indexees par Google — les inclure dans la matrice par precaution.

---

## Livrable 5 — Inventaire images + telechargement

Ce livrable est integre dans le script L1. Le script telecharge les images des articles dans `artefacts/images/blog/{slug}/`. En plus, produire un fichier d'index :

**Fichier a creer** : `artefacts/images/index.md`

```markdown
# Index des images Wix telechargees

## Statistiques
- Total articles : 11
- Total images : XX (covers + inline)
- Taille totale : XX MB

## Par article
| Article | Cover | Inline | Total |
|---------|-------|--------|-------|
| acupuncture-nausees-grossesse | 1 | X | X+1 |
| ... | ... | ... | ... |
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/`, `components/`, `lib/`, `public/`, `tailwind.config.ts`, `next.config.ts`, `package.json`
- **Ne pas** pousser de contenu dans Firestore — c'est MW-D1/D3
- **Ne pas** parser le Ricos JSON en markdown — c'est MW-B4
- **Ne pas** reecrire ou ameliorer les articles — export fidele uniquement
- **Ne pas** toucher aux assets v4 (photos Eric Bates, SVG, textures) — c'est MW-A1b
- **Ne pas** toucher aux 6 FAQ + 5 ressources dans `scripts/seo-geo/` — c'est MW-D3
- **Ne pas** installer de nouvelle dependance npm — utiliser `fetch` natif Node.js et `fs`
- **Ne pas** modifier le site Wix en production
- **Ne pas** commiter les images binaires dans git (ajouter `artefacts/images/` au `.gitignore` ou ne commiter que l'index markdown)
- **Pas de `console.log`** dans le script final (utiliser `process.stdout.write` ou un logger minimal)

---

## Definition of Done

Chaque item doit etre verifiable en < 30 secondes.

- [ ] Le script `scripts/export-wix-blog.ts` s'execute sans erreur via `npx tsx scripts/export-wix-blog.ts`
- [ ] 11 fichiers JSON dans `artefacts/blog-ricos/` — chacun contient le Ricos JSON avec des noeuds `PARAGRAPH`, `HEADING`, `IMAGE`, etc.
- [ ] `artefacts/blog-metadata.json` contient les 11 articles avec id, title, slug, date, coverImageUrl
- [ ] `artefacts/blog-export-report.md` resume l'export (nombre d'articles, d'images, erreurs)
- [ ] Les images cover des 11 articles sont telechargees dans `artefacts/images/blog/`
- [ ] Au moins 3 images inline (non-cover) sont telechargees et s'ouvrent correctement
- [ ] 8 fichiers markdown dans `artefacts/pages-statiques/` — chacun contient du texte lisible (pas du HTML brut)
- [ ] `artefacts/faq-wix/faq-verification.md` existe et documente la correspondance FAQ Wix ↔ fichiers source
- [ ] `artefacts/redirections-301.md` couvre toutes les URLs du scouting (8 pages + 11 articles + 2-3 pages secondaires)
- [ ] `artefacts/images/index.md` documente le nombre d'images par article
- [ ] `git diff` ne montre **aucune modification** dans `app/`, `components/`, `lib/`, `public/`
- [ ] `NOTES.md` cree avec : date, resume, articles les plus interessants, difficultes rencontrees (surtout export pages statiques)

---

## Notes d'execution (conseils)

- **Ordre recommande** : L1 (script blog — le plus long) → L4 (matrice redirections — faisable pendant que les images telechargent) → L2 (pages statiques — potentiellement manuel) → L3 (FAQ verification — rapide) → L5 (index images — genere par le script)
- **Tester d'abord avec 1 article** : lancer le script sur un seul article pour valider le format Ricos JSON avant de boucler sur les 11. Le format exact des noeuds IMAGE peut varier.
- **Si l'API retourne une erreur 401/403** : verifier que `.env.local` contient bien `WIX_API_KEY` et `WIX_SITE_ID`. Le format de `WIX_API_KEY` est probablement une cle API brute (pas un Bearer token — le code existant ne met pas de prefixe "Bearer").
- **Images Wix** : les URLs sur `static.wixstatic.com` contiennent souvent des parametres de transformation (`/v1/fill/w_740,h_493...`). Pour telecharger l'original, retirer tout ce qui suit `/v1/` dans l'URL. Si ca ne marche pas, garder l'URL complote — l'image sera quand meme utilisable meme si pas en resolution maximale.
- **Pages statiques** : si le contenu JSON de Wix Thunderbolt est trop opaque, ne pas perdre plus de 30 min dessus. Passer en mode "extraction manuelle" : ouvrir la page dans le navigateur, copier-coller le contenu visible, structurer en markdown. C'est 8 pages courtes — 10 min de travail manuel max.
- **Les images binaires** ne doivent PAS etre commitees dans git (trop lourd). Soit les ajouter a `.gitignore`, soit les garder hors du commit et ne commiter que les fichiers markdown/JSON.
- **Le script ne tourne PAS dans Next.js** — c'est un script standalone execute via `npx tsx`. Il ne faut PAS creer de route API pour ca.

---

## Commit final attendu

Un seul commit a la fin, sur la branche `feature/site-public-migration` :

```
feat(migration): MW-A1a inventaire Wix complet (11 articles, 8 pages, 6 FAQ, redirections)
```

Message detaille :

```
- Script export-wix-blog.ts : 11 articles Ricos JSON + metadata + images
- 8 pages statiques Wix exportees en markdown
- 6 FAQ Wix verifiees contre les fichiers source seo-geo/
- Matrice de redirections 301 (pages + articles + backlink La Source en Soi)
- Index des images telechargees par article
- Zero modification du code de l'app
- Ref: MW-A1a, docs/migration-wix/CLAUDE.md
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de decider.

**Fichiers a commiter** : tout dans `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/` SAUF le dossier `images/` (binaires trop lourds). Commiter aussi le script `scripts/export-wix-blog.ts` et le `NOTES.md`.

---

## Références

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/MILESTONE.md`
- Notes de prepa : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES_PREPA.md`
- Scouting Wix : `docs/migration-wix/02-recherche/scouting/scout-wix-actuel.md`
- Invariants : `docs/migration-wix/CLAUDE.md`
- API Wix existante : `app/api/blog/list/route.ts`, `app/api/blog/carousel/route.ts`
- Plan strategique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` §1.1, §4.1
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution sur branche `feature/site-public-migration` apres review Benoit/Desktop.*
