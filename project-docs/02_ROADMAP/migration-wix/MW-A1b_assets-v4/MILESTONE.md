# Milestone MW-A1b : Rapatriement + optimisation assets v4

**Type** : Prep + Content
**Vague** : 0 / 1 (peut démarrer en parallèle, implémentation légère)
**Priorité** : Critical
**Temps estimé Claude Code** : 3-5h
**Dépendances** : MW-B3 (pour tester les wrappers SVG avec `BotanicalDeco`)
**Status** : 🔴 Not started

**Note de découpage** : ce milestone était initialement inclus dans `MW-A1`. Il a été extrait pour séparer l'inventaire Wix (prep analytique pure) de la phase d'optimisation et rapatriement des assets v4 (implémentation qui touche `public/` et `components/`). Voir `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES_PREPA.md` pour le détail des assets et la justification du découpage.

---

## Objectif

Rapatrier dans le repo les assets visuels de la maquette v4 (photos Eric Bates, SVG décoratifs Freepik, textures papier) **après optimisation** (compression/WebP, svgo, downsize) pour qu'ils soient consommables par MW-C1 (homepage portée), MW-C2 (à propos), MW-C3 (pages services) et MW-D5 (pages ressources).

---

## Contexte minimal

Les assets source vivent actuellement dans `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/` et ne sont **pas utilisables tels quels** :

| Catégorie | Quantité | État |
|---|---|---|
| Photos Judith Eric Bates (`photos_Judith/Croped/`) | 8 JPG | 909 KB à 2.3 MB chacun, ~12 MB total — trop lourds pour prod |
| SVG décoratifs (`svg/`) | 25 fichiers en 7 thèmes | 96 KB à 864 KB — majoritairement trop gros pour inlining JSX |
| Textures papier (`textures/`) | 2 JPG | 22 MB et 31 MB — **print resolution, inutilisable sans downsize** |

L'inventaire détaillé et le plan d'optimisation sont dans `../MW-A1a_inventaire-wix/NOTES_PREPA.md`.

---

## Livrables

- [ ] **Optimisation des 8 photos Judith** : compression JPG qualité 82 ou conversion WebP, cible < 300 KB par image, renommage avec slugs SEO (`judith-portrait-01.jpg`, `judith-consultation-cabinet.jpg`, etc.)
- [ ] **Sélection + optimisation des SVG décoratifs** : passage `svgo --multipass` sur les 25, tri à 6-8 à garder (exclusion des catégories off-brand `03-zen-decoratif` et `07-esoterique`), renommage avec slugs (`pregnant-woman-yoga.svg`, `reproductive-flowers.svg`, `hands-lotus.svg`, etc.)
- [ ] **Downsize des textures papier** : `sharp` ou `sips` pour redimensionner à 1200×1200 max + convertir en WebP qualité 75, cible < 200 KB chacune
- [ ] **Copie dans `public/site/`** : structure claire (`public/site/judith/`, `public/site/svg/`, `public/site/textures/`)
- [ ] **Wrappers React pour les SVG sélectionnés** : un composant par SVG dans `components/public/decorations/`, ex. `PregnantWomanSvg.tsx`, `LotusHandsSvg.tsx` — chaque wrapper inline le contenu SVG optimisé dans un Server Component React qui accepte `className` et `aria-label` en props. Ces wrappers sont consommés par `<BotanicalDeco>` (créé en MW-B3) en children.
- [ ] **Manifest SEO photos** : fichier `public/site/judith/manifest.json` qui liste chaque photo avec son slug, sa dimension, et son `alt` texte SEO (rédigés avec Benoit/Judith en review, à défaut : placeholders explicites marqués `TODO`)

---

## Approche technique

**Optimisation photos** : script Node utilisant `sharp` (à ajouter en devDependency si pas déjà là — vérifier `package.json` avant). Pipeline : read → resize max 1600px largeur → compress JPG q82 ou WebP q80 → write dans `public/site/judith/`. Script à sauvegarder dans `scripts/optimize-assets.mjs` pour réutilisation future.

**Optimisation SVG** : `svgo` en local (devDep ou npx). Passage `svgo --multipass` puis mesure de taille post-opt. Ceux qui restent > 100 KB sont abandonnés ou servis en `<img src>` externe (fallback hors scope ici).

**Wrappers React SVG** : pour chaque SVG sélectionné, copier le contenu post-svgo dans un fichier `.tsx` avec les transformations JSX standard (`class` → `className`, `stroke-width` → `strokeWidth`, etc.). Option plus automatique : `@svgr/cli` (`npx @svgr/cli --typescript --no-jsx-runtime svg-file.svg`). Ma reco : manuellement pour 6-8 fichiers, c'est plus rapide.

**Textures** : `sharp` avec `.resize(1200, 1200, { fit: 'cover' }).webp({ quality: 75 })`. Archive le JPG original en dehors du repo si souhaité (pas dans git, trop lourd).

---

## Fichiers impactés

```
📄 NEW (assets rapatriés dans le repo) :
- public/site/judith/judith-portrait-01.jpg (et similaires)
- public/site/judith/manifest.json
- public/site/svg/pregnant-woman-yoga.svg (et 5-7 autres)
- public/site/textures/paper-japan.webp
- public/site/textures/paper-design.webp (optionnel)
- components/public/decorations/PregnantWomanSvg.tsx
- components/public/decorations/LotusHandsSvg.tsx
- components/public/decorations/(4 autres wrappers SVG)

📄 NEW (scripts d'optimisation, réutilisables) :
- scripts/optimize-assets.mjs
- MW-A1b_assets-v4/NOTES.md

✏️ MODIFY (potentiellement) :
- package.json (ajout devDependency sharp et/ou svgo si absents)
```

---

## Definition of Done

- [ ] Les 8 photos Judith sont dans `public/site/judith/` avec slugs SEO
- [ ] Chaque photo pèse < 300 KB (mesurable avec `du -h public/site/judith/*`)
- [ ] `public/site/judith/manifest.json` existe avec un objet par photo (slug, width, height, alt)
- [ ] 6 à 8 SVG sélectionnés sont dans `public/site/svg/`
- [ ] Chaque SVG pèse < 50 KB post-svgo (idéal) ou < 100 KB (acceptable)
- [ ] 6 à 8 wrappers React dans `components/public/decorations/` exportent chacun un composant Server fonctionnel
- [ ] 1 ou 2 textures webp dans `public/site/textures/`, < 200 KB chacune
- [ ] `scripts/optimize-assets.mjs` est réutilisable (commande documentée dans `NOTES.md` pour ajouter de nouveaux assets plus tard)
- [ ] `npm run build` passe sans erreur
- [ ] Test d'intégration : un wrapper SVG (ex. `<PregnantWomanSvg />`) est importé dans un fichier de test temporaire et rendu via `<BotanicalDeco>` dans la homepage vitrine — validation visuelle que l'intégration fonctionne
- [ ] `git diff` ne montre aucune modification dans `app/(app)/`, `app/(auth)/`, les types Firestore ou les rules
- [ ] `NOTES.md` créé avec journal, liste des SVG gardés/rejetés, alt texts SEO rédigés ou marqués TODO

---

## Contraintes

- **Ne pas modifier** le code du Hub admin (`app/(app)/`, `app/(auth)/`)
- **Ne pas installer** de dépendance runtime — `sharp` et `svgo` sont des devDependencies uniquement
- **Ne pas committer** les fichiers source bruts (les JPG 22 MB, les SVG 860 KB) — seuls les fichiers optimisés entrent dans le repo
- **Ne pas supprimer** les fichiers source dans `~/Documents/Judith_SEO_GEO/` — c'est l'original, on le préserve
- **Ne pas inventer** d'alt texts SEO pour les photos sans validation — si l'info n'est pas disponible, marquer `alt: "TODO — à rédiger avec Judith"` dans le manifest
- **Droits photos Eric Bates vérifiés** : contrat professionnel payé, appartiennent à Judith. OK pour commit et déploiement. Voir `docs/migration-wix/DECISIONS_Q1-Q16.md`.

---

## Références

- `../MW-A1a_inventaire-wix/NOTES_PREPA.md` — inventaire détaillé et plan d'optimisation
- Plan stratégique §4.6.4 (assets à migrer)
- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- `app/(public)/_components/BotanicalDeco.tsx` — composant qui consomme les wrappers SVG (créé en MW-B3)
- `sharp` doc : https://sharp.pixelplumbing.com/
- `svgo` doc : https://github.com/svg/svgo

---

## Notes de planification

- La décision de sélection SVG (quels 6-8 garder) doit être validée avec Benoit en review du PROMPT.md avant l'exécution. Ma pré-sélection est dans `../MW-A1a_inventaire-wix/NOTES_PREPA.md` section "Décisions à confirmer".
- Les wrappers React SVG peuvent sembler redondants (pourquoi pas juste servir les `.svg` en `<img src>` ?). La raison est que `BotanicalDeco` a été conçu en MW-B3 pour prendre du SVG inline en children, ce qui permet le styling via CSS (`currentColor`, `mix-blend-mode`, opacity), les animations, et évite une requête HTTP supplémentaire. C'est le pattern standard pour les SVG décoratifs de design system.
- Ce milestone peut **tourner en parallèle de MW-C1** si besoin — MW-C1 n'a pas besoin des vrais assets pour compiler (placeholders/fallbacks tiennent la route), mais la vraie homepage v4 devient visuelle que quand MW-A1b est fait.
