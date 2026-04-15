# MW-A1b — Notes d'execution

**Date** : 14 avril 2026
**Execute par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Resume

Script `optimize-assets.mjs` cree et execute. 8 photos optimisees en AVIF + WebP (16 fichiers), 4 SVG optimises via svgo (+ fallback WebP pour plant.svg), 1 texture papier japonais en 3 formats (AVIF/WebP/JPEG). PaperTexture.tsx refactore avec prop `variant: 'synthetic' | 'real'`. Layout public preload la texture AVIF via ReactDOM.preload. Total economise : 32.5 MB.

---

## Tailles avant/apres

### Photos

| Source | Avant | AVIF | WebP | Notes |
|--------|-------|------|------|-------|
| EricBates-1 | 889 KB | 71 KB | 121 KB | OK |
| EricBates-3 | 1186 KB | 55 KB | 115 KB | OK |
| EricBates-4 | 1531 KB | 48 KB | 184 KB | WebP legerement > 180 KB |
| EricBates-6 | 947 KB | 27 KB | 124 KB | OK |
| EricBates-7 | 1383 KB | 68 KB | 97 KB | OK |
| EricBates-8 | 1156 KB | 107 KB | 191 KB | AVIF > 80 KB, WebP > 180 KB |
| EricBates-9 | 2308 KB | 307 KB | 476 KB | Les deux depassent — image tres detaillee |
| EricBates-12 | 1767 KB | 42 KB | 64 KB | OK |

**Photo 07 (EricBates-9)** : significativement plus lourde que les autres (307 KB AVIF, 476 KB WebP). C'est la photo "pierre zen avec aiguilles d'acupuncture" qui sert de card image pour le pilier Fertilite dans la v4 (section `.pilier-card` pour /fertilite). **Warning MW-C1** : ne JAMAIS utiliser portrait-07 comme hero/LCP element — au-dessus de 300 KB AVIF c'est marginal sur 4G et ca eviterait inutilement le budget LCP. Toujours utiliser portrait-07 dans des contextes de card (~400-500px rendu) ou avec lazy loading. Si le besoin d'un hero fertilite emerge plus tard, envisager une nouvelle photo ou re-optimiser portrait-07 avec `quality: 50` et `width: 1200`.

**Photo 06 (EricBates-8)** : depasse legerement les cibles (107 KB AVIF, 191 KB WebP). Acceptable.

### SVG

| SVG | Avant | Apres svgo | Reduction |
|-----|-------|-----------|-----------|
| yoga3.svg | 33 KB | 29 KB | -12% |
| plant.svg | 860 KB | 715 KB | -17% |
| reproductive-flowers.svg | 82 KB | 60 KB | -27% |
| hands-lotus.svg | 94 KB | 67 KB | -29% |

**plant.svg** : reste a 715 KB post-svgo (vectoriel pur, tres complexe). Fallback WebP cree a 113 KB. **`plant.svg` a ete supprime du repo par Desktop apres review** (commit cleanup) — a opacity 0.12 + multiply dans `BotanicalDeco`, la difference vectoriel/raster est invisible et garder les deux fichiers etait 715 KB de bloat git pour rien. MW-C1 utilise `<img src="/site/svg/plant.webp" alt="" aria-hidden="true" />` (raster, 113 KB).

**Si MW-C1 avait besoin du vectoriel** (besoin fictif mais possible à documenter) : relancer `node scripts/optimize-assets.mjs` avec une modification ponctuelle du seuil `> 500 * 1024` dans le script (par exemple `> 1024 * 1024` pour garder tout SVG < 1 MB), ou exporter une version simplifiee via un editeur SVG (Inkscape peut reduire significativement avec "Clean Up Document").

### Texture

| Format | Taille | Cible | Notes |
|--------|--------|-------|-------|
| AVIF | 95 KB | < 30 KB | Depasse — la texture a beaucoup de detail haute frequence |
| WebP | 112 KB | < 50 KB | Depasse |
| JPEG | 127 KB | < 120 KB | Legerement depasse |

Les cibles etaient ambitieuses. A opacity 0.40 + multiply, la qualite visuelle est parfaitement acceptable meme a ces tailles. La texture originale faisait 22 MB — reduction de 99.6%.

---

## Note pour MW-C1 (forward-looking) — strategies de consommation des assets

`next.config.mjs` n'a PAS `images.formats` configure. Par defaut, Next.js 15 sert WebP via son pipeline d'optimisation mais ne genere PAS d'AVIF automatiquement. Nos fichiers `.avif` sont pre-optimises. MW-C1 doit choisir sa strategie :

- **Option A (recommande pour les photos decoratives et les SVG)** : `<img src="/site/judith/judith-portrait-01.webp" alt="..." width="1067" height="1600" loading="lazy" />` — sert notre fichier pre-optimise directement.
- **Option B (recommande pour le LCP, ex. photo hero homepage)** : balise `<picture>` avec les sources AVIF + WebP pour negocier le format optimal.
- **Option C (a eviter)** : `<Image src="/site/judith/...webp" />` sans `unoptimized` — Next.js va re-encoder notre fichier deja optimise.

**Pour les SVG** : `<img src="/site/svg/yoga3.svg" alt="" aria-hidden="true" />` en children de `<BotanicalDeco>`. Jamais `<Image>` sur un SVG.

**Pour la texture** : consommee automatiquement via `<PaperTexture variant="real">` qui emet du CSS `image-set()`.

---

## Livrables crees/modifies

| # | Livrable | Fichier(s) |
|---|----------|------------|
| L1 | Script optimisation | `scripts/optimize-assets.mjs` |
| L1 | Photos AVIF + WebP | `public/site/judith/` (16 fichiers + manifest.json) |
| L1 | SVG optimises | `public/site/svg/` (4 SVG + 1 WebP fallback) |
| L1 | Texture 3 formats | `public/site/textures/` (3 fichiers) |
| L2 | PaperTexture refactor | `app/(public)/_components/PaperTexture.tsx` (+15 lignes) |
| L3 | Preload texture | `app/(public)/layout.tsx` (+5 lignes) |
