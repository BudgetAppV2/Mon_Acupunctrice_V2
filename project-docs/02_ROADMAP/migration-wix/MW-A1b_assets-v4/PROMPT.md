# MW-A1b — Optimisation + rapatriement assets v4 (photos, SVG, textures)

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

La maquette `homepage-v4.html` utilise 3 categories d'assets visuels qui vivent actuellement dans `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/` et ne sont pas utilisables tels quels (photos 1-2 MB, SVG jusqu'a 860 KB, textures 22-31 MB). Ce milestone cree un script d'optimisation qui produit les fichiers prets pour le web dans `public/site/`, refactore `PaperTexture.tsx` pour supporter la vraie texture papier japonais, et ajoute un preload dans le layout public.

Apres ce milestone : `public/site/judith/` contient 8 photos en AVIF + WebP, `public/site/svg/` contient 4 SVG optimises, `public/site/textures/` contient 1 texture en 3 formats. `PaperTexture` a un prop `variant` qui bascule entre noise synthetique et texture reelle. Le layout preload la texture AVIF.

---

## Stack

Node.js (script `.mjs` standalone), `sharp` (deja dans package.json : `^0.34.5`), `svgo` (via `npx svgo`). React 19 + Next.js 15 (confirmes dans package.json).

---

## Fichiers a lire AVANT de commencer

1. **`app/(public)/_components/PaperTexture.tsx`** → composant a refactorer. Actuellement : overlay SVG noise inline avec `opacity` et `mix-blend-mode: multiply`. A ajouter : prop `variant?: 'synthetic' | 'real'` avec default `'synthetic'`. En mode `'real'`, le background devient `image-set()` avec les 3 formats de la texture reelle.

2. **`app/(public)/_components/BotanicalDeco.tsx`** → accepte `children: React.ReactNode`. MW-C1 passera `<img src="/site/svg/yoga3.svg" alt="" aria-hidden="true" className="w-full h-full" />` en children. **Pas de wrappers React SVG a creer** — le MILESTONE.md qui en parlait est obsolete.

3. **`app/(public)/layout.tsx`** → pour injecter `ReactDOM.preload()` avant le return. Attention : l'import `ReactDOM` n'est pas encore present — l'ajouter.

4. **`scripts/migrate-wix-blog.mjs`** et **`scripts/import-seo-geo-content.mjs`** → pattern `.mjs` standalone avec `--dry-run` et reporting console.

5. **`project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES_PREPA.md`** → inventaire detaille des assets (tailles, categories SVG, textures). **Note : le scope SVG et textures est reduit par rapport a ce fichier — voir ci-dessous.**

6. **`docs/migration-wix/CLAUDE.md`** → invariants migration.

---

## Livrable 1 — Script `scripts/optimize-assets.mjs`

**Objectif** : script one-shot qui lit les assets source, les optimise via `sharp` et `svgo`, et les ecrit dans `public/site/`.

**Fichier a creer** : `scripts/optimize-assets.mjs`

### Photos (8 fichiers)

**Source** : `$HOME/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/photos_Judith/Croped/`

**Pipeline par photo** :
1. `sharp(source).resize({ width: 1600, fit: 'inside', withoutEnlargement: true })`
2. Emettre 2 fichiers :
   - `.avif({ quality: 60 })` → `public/site/judith/judith-portrait-{NN}.avif`
   - `.webp({ quality: 80 })` → `public/site/judith/judith-portrait-{NN}.webp`
3. Cibles : AVIF < 80 KB, WebP < 180 KB — logger warning si depasse

**Mapping filenames** :

```javascript
const PHOTO_FILES = [
  '@EricBatesImages-1.jpeg',
  '@EricBatesImages-3.jpeg',
  '@EricBatesImages-4.jpeg',
  '@EricBatesImages-6.jpeg',
  '@EricBatesImages-7.jpeg',
  '@EricBatesImages-8.jpeg',
  '@EricBatesImages-9.jpeg',
  '@EricBatesImages-12.jpeg',
];
```

Slug generique : `judith-portrait-01` a `judith-portrait-08` (les vrais slugs semantiques seront rediges avec Judith en MW-A3).

**Manifest** : generer `public/site/judith/manifest.json` :

```json
[
  {
    "slug": "judith-portrait-01",
    "filenameAvif": "judith-portrait-01.avif",
    "filenameWebp": "judith-portrait-01.webp",
    "width": 1600,
    "height": null,
    "alt": "TODO — a rediger avec Judith en MW-A3"
  }
]
```

Le `height` est rempli dynamiquement par `sharp.metadata()` apres le resize.

### SVG (4 fichiers)

**Source** : `$HOME/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/svg/`

**Les 4 SVG a migrer** (source de verite — remplace la pre-selection du NOTES_PREPA). **Chemins exacts verifies Desktop** (a utiliser tels quels dans le script, ne pas grepper) :

| Chemin source (relatif a `assets/`) | Slug destination | Taille brute | Notes |
|---|---|---|---|
| `svg/01-grossesse/pregnant-woman-makes-yoga-meditation-one-line-drawing/yoga3.svg` | `yoga3.svg` | 33 KB | Femme enceinte yoga line-art, utilisee en `.piliers-deco` dans la v4 |
| `svg/04-botanique/illustration-with-medicinal-plants/plant.svg` | `plant.svg` | 860 KB | Plantes medicinales, utilisee 2× en `.cta-deco-botanical` (gauche + miroir droite) dans la v4. Vectoriel pur (0 `<image>` raster inline) |
| `svg/02-fertilite/female-reproductive-system-with-flowers/4319418.svg` | `reproductive-flowers.svg` | 82 KB | Systeme reproductif avec fleurs, bonus couverture pilier fertilite (non utilise dans la v4 mais garde pour MW-C3 pages services) |
| `svg/05-mains-soins/magic-hands-with-lotus-flower-line-art/e4cad311-eb35-4d76-8041-6e5695fe673e.svg` | `hands-lotus.svg` | 94 KB | Mains avec lotus, bonus couverture pilier soins (non utilise dans la v4 mais garde pour MW-C3) |

Hardcoder ces 4 chemins dans un tableau au debut du script, pas de `find` recursif necessaire.

**Pipeline par SVG** :
1. `npx svgo --multipass -i source -o public/site/svg/{slug}`
2. Mesurer la taille post-opt
3. **Fallback pour `plant.svg`** : si > 500 KB post-svgo, le rasteriser en WebP via sharp :
   - `sharp(svgBuffer).resize(800).webp({ quality: 80 })` → `public/site/svg/plant.webp`
   - Logger le fallback dans NOTES.md

**Pas de wrappers React** : MW-C1 utilisera `<img src="/site/svg/yoga3.svg" ... />` en children de `<BotanicalDeco>`. C'est le pattern de la v4, pas besoin de composants JSX.

### Texture (1 fichier → 3 formats)

**Source** : `$HOME/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/textures/natural-japanese-recycled-paper-texture.jpg`

**Pipeline** :
1. `sharp(source).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })`
2. 3 sorties paralleles :
   - `.avif({ quality: 55, effort: 6 })` → `public/site/textures/paper-japan.avif` (cible < 30 KB)
   - `.webp({ quality: 72 })` → `public/site/textures/paper-japan.webp` (cible < 50 KB)
   - `.jpeg({ quality: 80, progressive: true, mozjpeg: true })` → `public/site/textures/paper-japan.jpg` (cible < 120 KB)
3. Logger warning si une cible n'est pas atteinte — ne pas bloquer

**Texture abandonnee** : `design-space-paper-textured-background.jpg` — utilisee 1 seule fois dans la v4, variation marginale sous opacity 0.40 + multiply. Pas migree.

### Mode `--dry-run`

```javascript
const DRY_RUN = process.argv.includes('--dry-run');
```

En dry-run : lire les fichiers source, calculer les tailles, afficher ce qui serait ecrit, ne pas ecrire.

### Reporting console

En fin de script, afficher :
- Taille avant/apres par fichier
- Total MB economise
- Warnings pour les cibles non atteintes

### Path source

```javascript
const HOME = process.env.HOME;
const ASSETS_ROOT = resolve(HOME, 'Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets');
```

---

## Livrable 2 — Refactor `PaperTexture.tsx`

**Fichier a modifier** : `app/(public)/_components/PaperTexture.tsx`

**Modification** : ajouter un prop `variant?: 'synthetic' | 'real'` avec default `'synthetic'`.

- `variant: 'synthetic'` → comportement actuel inchange (SVG noise inline)
- `variant: 'real'` → le `backgroundImage` devient :
  ```
  image-set(
    url("/site/textures/paper-japan.avif") type("image/avif"),
    url("/site/textures/paper-japan.webp") type("image/webp"),
    url("/site/textures/paper-japan.jpg") type("image/jpeg")
  )
  ```
  avec `backgroundSize: 'cover'` et `backgroundRepeat: 'no-repeat'`.

L'opacity et le `mixBlendMode: 'multiply'` restent identiques dans les deux modes.

**Composant modifie** (~45 lignes max) :

```typescript
interface PaperTextureProps {
  children: React.ReactNode;
  className?: string;
  /** Intensite de la texture (0.0 a 1.0). Defaut : 0.40 */
  opacity?: number;
  /** 'synthetic' = SVG noise inline (defaut, leger).
   *  'real' = texture papier japonais photographiee (fichiers dans public/site/textures/). */
  variant?: 'synthetic' | 'real';
}
```

Pour le mode `'real'`, le `style` du div overlay devient :

```typescript
const realBg = `image-set(url("/site/textures/paper-japan.avif") type("image/avif"), url("/site/textures/paper-japan.webp") type("image/webp"), url("/site/textures/paper-japan.jpg") type("image/jpeg"))`;

const syntheticBg = 'url("data:image/svg+xml,...")'; // inchange

const overlayStyle = {
  opacity,
  mixBlendMode: 'multiply' as const,
  backgroundImage: variant === 'real' ? realBg : syntheticBg,
  backgroundSize: variant === 'real' ? 'cover' : '400px 400px',
  backgroundRepeat: variant === 'real' ? 'no-repeat' : undefined,
};
```

---

## Livrable 3 — Preload texture dans `app/(public)/layout.tsx`

**Fichier a modifier** : `app/(public)/layout.tsx`

**Ajout** : dans le corps de la fonction `PublicLayout`, **avant le `return`**, ajouter :

```typescript
import ReactDOM from 'react-dom';

// Dans le corps de la fonction :
ReactDOM.preload('/site/textures/paper-japan.avif', {
  as: 'image',
  type: 'image/avif',
  fetchPriority: 'high',
});
```

**Pourquoi** : la texture est utilisee en CSS `background-image` par `PaperTexture`. Sans preload, le navigateur ne decouvre l'image qu'a l'application du CSS → retard LCP de ~400 ms. `ReactDOM.preload` emet un `<link rel="preload">` dans le `<head>` pendant le SSR.

**Gotcha** : `ReactDOM.preload` est une API React 19 (disponible depuis React 19 + Next.js 15). Ne pas utiliser `next/head` ou `<link>` dans le JSX — c'est `ReactDOM.preload()` dans le body de la fonction.

---

## Note pour MW-C1 (documentation forward-looking)

**A consigner dans NOTES.md en fin d'execution**, pour eviter un piege dans le prochain milestone qui consommera ces assets :

**`next.config.mjs` n'a PAS `images.formats` configure** (verifie Desktop). Par defaut, Next.js 15 sert WebP via son pipeline d'optimisation mais **ne genere PAS d'AVIF** automatiquement. Notre script MW-A1b produit des fichiers `.avif` pre-optimises. MW-C1 doit donc choisir sa strategie de consommation des photos :

- **Option A (recommande pour les photos decoratives et les SVG)** : `<img src="/site/judith/judith-portrait-01.webp" alt="..." width="1067" height="1600" loading="lazy" />` — sert notre fichier pre-optimise directement, aucun double-encodage, aucune configuration Next.js requise.
- **Option B (recommande pour le LCP, ex. photo hero homepage)** : balise `<picture>` avec les 3 sources pour negocier le format optimal :
  ```tsx
  <picture>
    <source srcSet="/site/judith/judith-portrait-01.avif" type="image/avif" />
    <source srcSet="/site/judith/judith-portrait-01.webp" type="image/webp" />
    <img src="/site/judith/judith-portrait-01.webp" alt="..." width="1067" height="1600" fetchPriority="high" />
  </picture>
  ```
  AVIF pour les browsers modernes (~93% coverage 2026, gain ~30% vs WebP), WebP fallback, zero re-encodage.
- **Option C (a eviter)** : `<Image src="/site/judith/...webp" />` sans `unoptimized` — Next.js va faire passer notre WebP deja optimise dans son pipeline, re-encodant le fichier (perte de qualite legere + CPU serveur inutile). Si MW-C1 veut absolument utiliser `<Image>`, ajouter `unoptimized` ou configurer `next.config.mjs` avec `images: { formats: ['image/avif', 'image/webp'] }` ET uploader les images sources en un seul format pour laisser Next faire le fan-out. Plus complexe, pas le chemin recommande ici.

**Pour les SVG** : toujours `<img src="/site/svg/yoga3.svg" alt="" aria-hidden="true" />` passe en children de `<BotanicalDeco>`. Jamais `<Image>` sur un SVG — Next.js refuse d'optimiser les SVG par securite (anti-XSS) et les sert tel quels via un fallback unoptimized, autant sauter l'etape.

**Pour la texture paper-japan** : consommee automatiquement via `<PaperTexture variant="real">` qui emet du CSS `image-set()` — MW-C1 n'a rien a faire de special, juste importer le composant et passer `variant="real"`.

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/(app)/`, `app/(auth)/`, `app/layout.tsx`, `tailwind.config.ts`, `firestore.rules`
- **Ne pas** creer de wrappers React pour les SVG — le MILESTONE.md qui en parlait est **obsolete**
- **Ne pas** migrer `design-space-paper-textured-background.jpg` — abandonnee
- **Ne pas** inventer d'alt texts SEO — marquer `"TODO — a rediger avec Judith en MW-A3"`
- **Ne pas** supprimer les fichiers source dans `~/Documents/...`
- **Ne pas** installer de nouvelle dependance npm — `sharp` (^0.34.5) est deja dans package.json, `svgo` via `npx`
- Script en `.mjs`, idempotent, avec `--dry-run`
- **Pas d'emojis** dans le script ou l'output

---

## Definition of Done

- [ ] `scripts/optimize-assets.mjs` s'execute sans erreur en mode `--dry-run`
- [ ] En mode reel : 8 photos AVIF + 8 photos WebP dans `public/site/judith/` (16 fichiers)
- [ ] Chaque photo AVIF < 80 KB, chaque WebP < 180 KB (ou warning logge)
- [ ] `public/site/judith/manifest.json` existe avec 8 entrees (slug, filenameAvif, filenameWebp, width, height, alt)
- [ ] 4 SVG dans `public/site/svg/` : `yoga3.svg`, `plant.svg` (ou `plant.webp` si fallback), `reproductive-flowers.svg`, `hands-lotus.svg`
- [ ] 3 fichiers texture dans `public/site/textures/` : `paper-japan.avif`, `paper-japan.webp`, `paper-japan.jpg`
- [ ] `PaperTexture.tsx` accepte `variant?: 'synthetic' | 'real'` — `variant="real"` utilise `image-set()` avec les 3 formats
- [ ] `app/(public)/layout.tsx` contient `ReactDOM.preload('/site/textures/paper-japan.avif', ...)` avant le return
- [ ] `npm run build` passe sans erreur
- [ ] `git diff` ne montre **aucune modification** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`
- [ ] `NOTES.md` cree avec : journal, tailles avant/apres, SVG gardes, warnings, note sur plant.svg (fallback ou non)

---

## Notes d'execution (conseils)

- **Ordre recommande** : L1 (script) en `--dry-run` → L1 mode reel → L2 (PaperTexture refactor) → L3 (preload layout) → build → NOTES.md
- **`sharp` est deja installe** (`^0.34.5` dans package.json) — pas de `npm install` necessaire
- **`svgo` via `npx svgo`** — deja disponible (v4.0.1 testee)
- **Trouver les SVG source** : les paths dans les sous-dossiers de `assets/svg/` sont longs et contiennent des sous-dossiers thematiques. Utiliser les chemins exacts fournis dans le tableau L1.
- **`plant.svg` a 860 KB** mais est vectoriel pur (pas de `<image>` raster inline). `svgo --multipass` devrait le reduire significativement. Si ca reste > 500 KB, utiliser le fallback WebP via `sharp`.
- **`image-set()` CSS** : bien supporte depuis 2023 (Safari 17+, Chrome 113+, Firefox 127+). Le JPEG fallback dans le `image-set` couvre les navigateurs plus anciens — pas besoin de `@supports` ou de polyfill.
- **`ReactDOM.preload`** : import via `import ReactDOM from 'react-dom'` (pas `react-dom/client`). L'appel est dans le corps de la fonction Server Component — React 19 gere ca pendant le SSR en emettant un `<link rel="preload">` dans le head.

---

## Commit final attendu

```
feat(migration): MW-A1b assets v4 (photos AVIF/WebP, SVG, texture, PaperTexture refactor)
```

Message detaille :

```
- Script optimize-assets.mjs : 8 photos (AVIF+WebP), 4 SVG (svgo), 1 texture (3 formats)
- Photos dans public/site/judith/ avec manifest.json
- SVG dans public/site/svg/ (yoga3, plant, reproductive-flowers, hands-lotus)
- Texture paper-japan en AVIF/WebP/JPEG dans public/site/textures/
- PaperTexture.tsx : prop variant 'synthetic'|'real' avec image-set() CSS
- Layout public : ReactDOM.preload texture AVIF pour LCP
- Zero modification du Hub admin existant
- Ref: MW-A1b, docs/migration-wix/CLAUDE.md
```

**Pas de merge dans `main`** — Benoit review sur la branche.

---

## References

- MILESTONE.md (scope SVG/wrappers/textures obsolete — les 6 points du prompt utilisateur sont source de verite)
- NOTES_PREPA.md : `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES_PREPA.md`
- Composants : `app/(public)/_components/PaperTexture.tsx`, `BotanicalDeco.tsx`
- Layout : `app/(public)/layout.tsx`
- Scripts reference : `scripts/migrate-wix-blog.mjs`, `scripts/import-seo-geo-content.mjs`
- Invariants : `docs/migration-wix/CLAUDE.md`
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution apres review Desktop.*
