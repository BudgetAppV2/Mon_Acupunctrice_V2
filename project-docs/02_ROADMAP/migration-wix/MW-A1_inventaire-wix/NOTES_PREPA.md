# MW-A1 — Notes de préparation (brain dump Desktop)

*Fichier de prépa écrit pendant la session du 14 avril 2026, pendant l'exécution de MW-B3. À consulter quand on draftera le PROMPT.md de MW-A1 pour ne rien oublier sur la partie "assets v4".*

---

## TL;DR

Le `MILESTONE.md` actuel sous-estime massivement le scope "rapatriement assets v4". Ce qu'il dit :

> Les photos Eric Bates Images depuis `~/.../photos_Judith/Croped/` vers `public/site/judith/`, SVG Freepik vers `public/site/decorations/`, textures papier vers `public/site/textures/`

Ce qu'il manque :
1. **Optimisation obligatoire avant copie** (compression, svgo, WebP)
2. **Vraie quantité de SVG** : 25 fichiers en 7 thèmes, pas ~5
3. **Phase de sélection/tri** : on ne veut pas les 25 SVG, trancher quoi garder
4. **Création des wrappers React** pour que `BotanicalDeco` puisse consommer les SVG en children JSX
5. **Downsize critique des textures** : 31 MB + 22 MB = inutilisables telles quelles

MW-A1 devrait probablement être **découpé en MW-A1a (inventaire Wix) + MW-A1b (rapatriement + optimisation assets v4)**, avec MW-A1b qui est le plus lourd (3-4h à lui seul).

---

## Inventaire exact des assets v4 (14 avril 2026)

Chemin source : `/Users/benoitarchambault/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/`

### Photos Judith Eric Bates (`photos_Judith/Croped/`)

8 fichiers JPG haute résolution :

| Fichier | Taille |
|---|---|
| `@EricBatesImages-1.jpeg` | 909 KB |
| `@EricBatesImages-3.jpeg` | 1.2 MB |
| `@EricBatesImages-4.jpeg` | 1.6 MB |
| `@EricBatesImages-6.jpeg` | 970 KB |
| `@EricBatesImages-7.jpeg` | 1.4 MB |
| `@EricBatesImages-8.jpeg` | 1.2 MB |
| `@EricBatesImages-9.jpeg` | 2.3 MB |
| `@EricBatesImages-12.jpeg` | 1.8 MB |
| **Total** | **~12 MB** |

**État** : droits à Judith (contrat pro payé), utilisables librement. Mais **trop lourds pour prod** sans compression.

**Action MW-A1** :
- Renommer avec slugs SEO (ex. `judith-portrait-01.jpg`, `judith-consultation-cabinet.jpg`)
- Compresser à ~300-500 KB par image en JPG qualité 82, ou **convertir en WebP** (~150 KB)
- Copier dans `public/site/judith/`
- Générer un fichier `public/site/judith/manifest.json` avec alt texts SEO pour chaque photo (à rédiger avec Benoit ou Judith)

**Outil reco** : `sharp` (npm, rapide, scriptable) ou `sips` (macOS native, zéro install)

---

### SVG décoratifs (`svg/`)

**25 fichiers** organisés en 7 catégories thématiques — le MILESTONE.md disait "~5", c'est faux.

| Catégorie | Dossier | Nombre | Exemples |
|---|---|---|---|
| 01 — Grossesse | `01-grossesse/` | 6 | Femme enceinte yoga, illustration mère, pattern botanique |
| 02 — Fertilité | `02-fertilite/` | 5 | Système reproductif avec fleurs, cup menstruelle |
| 03 — Zen décoratif | `03-zen-decoratif/` | 3 | Bouddha avec fleur, bonsai, zen stones |
| 04 — Botanique | `04-botanique/` | 3 | Plantes médicinales, herbes sauvages |
| 05 — Mains soins | `05-mains-soins/` | 2 | Mains avec lotus, mains avec fleurs |
| 06 — Icons symbols | `06-icons-symbols/` | 2 | Yin-yang, symboles zen lotus |
| 07 — Ésotérique | `07-esoterique/` | 4 | Femme boho, lune/étoiles, arc-en-ciel boho |
| **Total** | | **25** | |

**État** : tailles très variables, certains énormes. Exemples mesurés :

| Fichier | Taille | Commentaire |
|---|---|---|
| `04-botanique/.../plant.svg` | **864 KB** | Probablement SVG avec `<image>` rasterized dedans |
| `04-botanique/.../1483a...svg` | **860 KB** | Idem |
| `05-mains-soins/.../e4cad...svg` | 96 KB | Déjà beaucoup pour du line-art |

**Cible post-optimisation** : < 50 KB par SVG pour pouvoir les inliner en JSX. Ceux qui resteront > 100 KB après svgo devront être soit abandonnés soit servis en `<img src>` externe (ce qui casse l'approche `BotanicalDeco` qui attend des children JSX inline).

**Phase de sélection requise** — on ne veut pas les 25. Ma reco après avoir regardé la liste :
- **Garder** (6-8) : les plus emblématiques de chaque pilier, style cohérent ligne-art minimaliste
  - `01-grossesse` : 1 illustration femme enceinte yoga (la plus clean)
  - `02-fertilite` : 1 système reproductif avec fleurs (le plus botanique)
  - `04-botanique` : 1 illustration plantes médicinales (si svgo la ramène < 100 KB)
  - `05-mains-soins` : les 2 — mains avec lotus et mains avec fleurs (très fidèles au ton Judith)
  - `06-icons-symbols` : 1 yin-yang si utilisable
- **Retirer** (17-19) : le reste, notamment les catégories `03-zen-decoratif` et `07-esoterique` qui sont **off-brand** (bouddha, boho, ésotérique — ne matchent pas le positionnement professionnel de Judith acupunctrice, ça risque de faire "new age")

**Action MW-A1** :
1. Optimiser tous les SVG avec `svgo` (config par défaut + `--multipass`)
2. Mesurer les tailles post-opt — éliminer ceux qui restent > 100 KB
3. Avec Benoit + Judith, sélectionner les 6-8 à garder
4. Copier les sélectionnés dans `public/site/svg/` (renommés avec slugs : `pregnant-woman-yoga.svg`, `reproductive-flowers.svg`, `hands-lotus.svg`, etc.)
5. **Créer les wrappers React** : un fichier `.tsx` par SVG qui inline le contenu SVG optimisé dans un composant React (ex. `components/public/decorations/PregnantWomanSvg.tsx`). Ces wrappers sont consommés par `BotanicalDeco` en children.

**Outil reco** : `svgo` (npm), config `svgo --multipass --input file.svg --output optimized.svg`. Pour la conversion SVG → React, soit à la main (copier-coller le contenu + remplacer `class` par `className`, `stroke-width` par `strokeWidth`, etc.), soit via `@svgr/cli`.

---

### Textures papier (`textures/`)

2 fichiers JPG, **complètement inutilisables en l'état** :

| Fichier | Taille |
|---|---|
| `design-space-paper-textured-background.jpg` | **31 MB** |
| `natural-japanese-recycled-paper-texture.jpg` | **22 MB** |

C'est du print resolution (probablement 300 DPI, 3000×4000+ pixels). Pour le web on vise ~800×800 pixels max, < 200 KB.

**Action MW-A1** :
1. Downsize avec `sips` ou `sharp` à 800×800 (ou 1200×1200 si on veut une qualité tile-able)
2. Convertir en WebP qualité 75
3. Cible : < 150 KB chacun
4. Copier dans `public/site/textures/` avec noms courts : `paper-japan.webp`, `paper-design.webp`
5. **Décision à prendre avec Benoit** : est-ce qu'on garde les 2 ou juste 1 ? La v4 utilise probablement juste la "natural-japanese" (cohérent avec le positionnement Judith acupunctrice = japonais/zen). La "design-space" est peut-être juste de la recherche d'alternatives.

**À noter pour MW-B3** : le `PaperTexture` qu'on est en train de coder utilise **SVG noise inline** (data URI), pas les JPG. MW-C1 pourra overrider via une prop `src` pointant vers `/site/textures/paper-japan.webp` si on veut plus de fidélité sur certaines sections.

---

## Scope MW-A1 — proposition de découpage

Le MILESTONE.md actuel mélange **deux choses très différentes** :

1. **Inventaire Wix** (crawl API, export Ricos, extraction contenu) — partie analytique, pas de modif du repo sauf artefacts
2. **Rapatriement assets v4** (optimisation, copie, wrappers React) — partie implémentation qui touche `public/` et `components/`

### Option A — Laisser groupé (MW-A1 en un seul milestone)

**Avantages** :
- Un seul dossier, un seul commit, cohérent avec les autres milestones
- Pas de refactor de la roadmap

**Inconvénients** :
- Scope estimé 3-4h dans le MILESTONE.md, réalité plus proche de 6-8h si on fait tout bien (inventaire Wix = 2-3h, optimisation + sélection + wrappers SVG = 3-5h)
- Difficile à reprendre si on coupe en cours de route
- Risque d'un commit massif difficile à review

### Option B — Découper en MW-A1a / MW-A1b (ma reco)

**MW-A1a — Inventaire Wix** (2-3h, prep pure)
- Crawl API Wix Blog pour les 11 articles → Ricos JSON bruts dans `artefacts/`
- Export des 8 pages statiques Wix en markdown
- Export des 6 FAQ Wix (probablement via scraping DOM si pas d'API)
- Matrice de redirections 301 (document markdown)
- Inventaire des images des articles Wix (URLs + téléchargement dans `artefacts/images/`)
- **Aucune modification du repo en dehors du dossier `MW-A1a_*/artefacts/`**
- Débloque : MW-B4 (parser Ricos), MW-D1 (import blog), MW-G2 (redirections)

**MW-A1b — Rapatriement + optimisation assets v4** (3-5h, implémentation)
- Optimisation des 8 photos Judith (compression/WebP + renommage SEO)
- Optimisation et sélection des SVG décoratifs (svgo + tri 25 → 6-8)
- Downsize des textures papier (JPG → WebP ~150 KB)
- Copie dans `public/site/judith/`, `public/site/svg/`, `public/site/textures/`
- Création des wrappers React pour les SVG sélectionnés (`components/public/decorations/*.tsx`)
- Manifest SEO avec alt texts pour les photos (à remplir avec Benoit/Judith en review)
- Débloque : MW-C1 (homepage avec photos), MW-C2 (à propos), MW-C3 (pages services avec illustrations piliers), MW-D5 (ressources avec hero images)

**Avantages** :
- Deux milestones de ~3h chacun, cohérents avec les autres
- MW-A1a peut démarrer **en parallèle de MW-B3 ou même avant** (zéro dep)
- MW-A1b peut attendre que MW-B3 soit complété (pour que les wrappers SVG aient `BotanicalDeco` disponible à tester)
- Commits séparés, review Desktop plus facile
- Si on veut ship en urgence, MW-A1b peut être reporté post-MVP (les placeholders MW-B3 tiennent le coup)

**Inconvénients** :
- Refactor mineur de la roadmap (1 milestone → 2, mise à jour du README)
- Légèrement plus de bureaucratie (2 dossiers, 2 PROMPT.md, 2 NOTES.md)

### Option C — Laisser MW-A1 tel quel mais l'enrichir

Garder un seul MW-A1 mais ajouter explicitement tous les livrables manquants au MILESTONE.md et au futur PROMPT.md. Estimation réaliste : 6-8h. Plus long mais pas de refactor.

---

## Reco finale (Desktop → Benoit lors du draft MW-A1)

**Option B — découper en MW-A1a et MW-A1b.** Raisons :
1. Scope trop différent pour rester groupé (prep analytique vs implémentation d'assets)
2. MW-A1a débloque beaucoup de milestones downstream (B4, D1, G2), il faut le faire tôt
3. MW-A1b a une dépendance implicite sur MW-B3 (les wrappers SVG doivent être consommables par `BotanicalDeco` qui naît en MW-B3)
4. 2 milestones de 3h ≫ 1 milestone de 6h en termes de confort d'exécution et de review

**À faire quand on arrivera à MW-A1** :
1. Réviser `project-docs/02_ROADMAP/migration-wix/README.md` pour ajouter MW-A1b et mettre à jour le compteur des milestones (29 → 30)
2. Renommer `MW-A1_inventaire-wix/` en `MW-A1a_inventaire-wix/`
3. Créer `MW-A1b_assets-v4/` avec son propre `MILESTONE.md`
4. Drafter le PROMPT.md de MW-A1a en premier (plus simple, plus prioritaire pour débloquer B4/D1)
5. Drafter le PROMPT.md de MW-A1b après avoir validé la sélection SVG avec Benoit

---

## Décisions à confirmer avec Benoit avant le draft

1. **Découpage MW-A1a / MW-A1b ?** (reco : oui, Option B)
2. **Sélection SVG décoratifs** : lesquels garder sur les 25 ? Ma pré-sélection (6-8) :
   - `01-grossesse/.../yoga3.svg` — femme enceinte yoga line-art
   - `02-fertilite/.../4319418.svg` — système reproductif fleurs
   - `04-botanique/.../plant.svg` — plantes médicinales (si svgo l'amène sous 100 KB)
   - `05-mains-soins/.../c3cb9bcc-...svg` — mains avec fleurs
   - `05-mains-soins/.../e4cad311-...svg` — mains avec lotus
   - `06-icons-symbols/.../b0e02367-...svg` — yin-yang (si utilisable, sinon drop)
   - À demander : est-ce qu'un zen-decoratif (bonsai) fait sens ou c'est off-brand ?
3. **Textures** : on garde les 2 ou juste `natural-japanese-recycled-paper-texture.jpg` ?
4. **Format d'optimisation photos** : JPG qualité 82 (compatibilité max) ou WebP (plus léger, compat 98%+ en 2026) ?
5. **Slugs SEO photos** : qui rédige les alt texts ? Benoit en mode rapide ou on demande à Judith lors de l'entretien MW-A3 ?
6. **Conservation des fichiers source bruts** : est-ce qu'on archive les assets v4 originaux quelque part (dans un sous-dossier `_originaux/` non commité, ou en dehors du repo) au cas où on veut re-optimiser différemment plus tard ?

---

## Liens avec MW-B3 (le milestone en cours d'exécution pendant l'écriture de ce fichier)

MW-B3 crée `BotanicalDeco` qui attend un SVG inline en children. Mes notes de prépa prévoient que MW-A1b créera les **wrappers React** qui contiennent ces SVG inline :

```tsx
// components/public/decorations/PregnantWomanYogaSvg.tsx (créé en MW-A1b)
export default function PregnantWomanYogaSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="..." className={className} xmlns="...">
      {/* contenu SVG optimisé, ~30-50 lignes de path */}
    </svg>
  );
}
```

Usage futur en MW-C1 :

```tsx
import BotanicalDeco from '@/app/(public)/_components/BotanicalDeco';
import PregnantWomanYogaSvg from '@/components/public/decorations/PregnantWomanYogaSvg';

<BotanicalDeco position="top-right" opacity={0.15} size={240}>
  <PregnantWomanYogaSvg />
</BotanicalDeco>
```

Les 2 dossiers de composants sont séparés intentionnellement :
- `app/(public)/_components/` : composants **structurels** du layout (header, footer, cards)
- `components/public/decorations/` : **assets visuels** réutilisables (SVG wrappers, potentiellement images optimisées avec metadata)

Cette séparation se matérialise en MW-A1b.

---

## Checklist avant de lancer le draft MW-A1(a/b)

- [ ] Décisions 1-6 ci-dessus tranchées avec Benoit
- [ ] MW-B3 exécuté et validé (pour que l'intégration des wrappers soit testable)
- [ ] `svgo` installé localement ou vérifié qu'il passe en npx
- [ ] Décision sur le refactor de README (MW-A1 → MW-A1a + MW-A1b) prise
- [ ] Si découpage : création du dossier `MW-A1b_assets-v4/` + copie adaptée du MILESTONE.md

---

*Écrit le 14 avril 2026 par Claude Desktop pendant l'exécution de MW-B3. À relire et mettre à jour avant le draft MW-A1.*
