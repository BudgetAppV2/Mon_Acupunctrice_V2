# Milestone 05 — Éditeur : Filtres, Textes & Polices

## Objectif
Enrichir l'éditeur vidéo en ajoutant l'application de filtres de couleur de style Instagram et la superposition de textes graphiques avec des polices custom et des animations.

## User stories couvertes
- **US-08** : Appliquer un filtre vidéo en 1 tap.
- **US-09** : Ajouter du texte graphique avec des polices et animations professionnelles.

## Dépendances
- **Milestone 04** : Fondation de l'éditeur (store, preview, timeline, export).

## Livrables précis

- **Composants :**
    - `/components/features/editor/panels/FilterPanel.tsx` : Panneau affichant une grille de filtres cliquables.
    - `/components/features/editor/panels/TextPanel.tsx` : Panneau pour gérer les superpositions de texte.
    - `/components/features/editor/text/TextOverlay.tsx` : Affiche un élément texte sur la preview vidéo en utilisant Konva.js.
    - `/components/features/editor/text/FontSelector.tsx` : UI pour sélectionner une police Google Fonts.
    - `/components/features/editor/text/StyleSelector.tsx` : UI pour choisir un style de texte prédéfini.
    - `/components/features/editor/text/AnimationSelector.tsx` : UI pour choisir une animation d'entrée.

- **State & Types :**
    - `/lib/store/useEditorStore.ts` : Étendre le store pour inclure `filter: string`, `overlays: TextOverlay[]`.
    - `/lib/types/index.ts` : Ajouter les types `TextOverlay`, `FontStyle`, `FontAnimation`.

- **Logique & Utils :**
    - `/lib/utils/fontLoader.ts` : Utilitaire pour charger dynamiquement les Google Fonts via l'API FontFace.
    - `/lib/utils/ffmpegCommands.ts` : Mettre à jour pour inclure les filtres vidéo et le burn-in de texte dans la commande FFmpeg.

- **Assets :**
    - `/public/fonts/` : (Optionnel) Si des polices sont auto-hébergées.

## Spécifications techniques détaillées

- **Filtres Vidéo (F2.4) :**
    - **Implémentation UI** : Le `FilterPanel` affiche une grille scrollable horizontalement. Chaque item est une miniature de la vidéo avec le filtre appliqué.
    - **Application live** : Le filtre sélectionné est stocké dans `useEditorStore`. La `VideoPreview` applique ce filtre via une classe CSS sur l'élément `<video>` (`<video className={filter.class}>`).
    - **Exemple CSS** : `.filter-vintage { filter: sepia(0.5) contrast(1.1) brightness(0.9); }`.
    - **Export** : Le nom du filtre est passé au hook `useVideoExport`. `ffmpegCommands.ts` le traduit en argument `-vf` pour FFmpeg (ex: `eq=saturation=0.9,vignette`).

- **Texte Overlay Graphique (F2.5) :**
    - **Rendu** : Les textes seront rendus dans un canvas transparent par-dessus la vidéo en utilisant **Konva.js**. Cela permet des manipulations riches (drag, resize) et de meilleures performances que des `div` HTML.
    - **`TextOverlay.tsx`** : Ce composant utilisera les primitives de Konva (`<Layer>`, `<Text>`) pour afficher le texte. Il gèrera le drag-and-drop pour la position.
    - **Timing** : Chaque `TextOverlay` dans le store aura `startTime` et `endTime`. Le composant ne sera visible que si `currentTime` est dans cet intervalle. Une représentation visuelle sera ajoutée sur une nouvelle "Text Track" dans la `Timeline`.

- **Polices (Fonts) :**
    - Une sélection de ~30 polices Google Fonts sera disponible, organisée par catégorie (Bold, Élégant, etc.).
    - Le `fontLoader.ts` utilisera l'API `FontFace` pour charger dynamiquement une police uniquement lorsqu'elle est sélectionnée par l'utilisateur, afin de ne pas ralentir le chargement initial. `const font = new FontFace('MyFont', 'url(myfont.woff2)'); await font.load(); document.fonts.add(font);`.

- **Styles & Animations :**
    - Des styles prédéfinis (Classic, Neon, etc.) seront de simples combinaisons de propriétés Konva (`fill`, `stroke`, `shadowColor`...).
    - Les animations d'entrée (Fade, Slide Up...) seront implémentées avec le système de "tweening" de Konva.

- **Export avec Texte :**
    - Le rendu de texte via FFmpeg est complexe. La stratégie sera :
        1.  Obtenir la position (`x`, `y`), la taille, la couleur, la police, et le timing de chaque overlay depuis le store.
        2.  Construire une commande `ffmpeg` avec le filtre `drawtext` pour chaque overlay.
        3.  **Exemple `drawtext`** : `-vf "drawtext=fontfile=/path/to/font.ttf:text='Hello':x=100:y=100:fontsize=24:fontcolor=white:enable='between(t,5,10)'"`.
        4.  Les polices devront être disponibles pour FFmpeg. Elles seront téléchargées depuis Google Fonts et passées à FFmpeg dans son système de fichiers virtuel (MEMFS).

## Contraintes
- L'ajout de nombreuses polices et de textes complexes peut impacter la performance. Optimiser le re-rendu des composants.
- La traduction des styles Konva en filtres `drawtext` de FFmpeg doit être aussi fidèle que possible.
- Limiter le nombre de polices à une sélection curée pour ne pas submerger l'utilisateur.

## Definition of Done
- [ ] Le panneau de filtres permet d'appliquer un filtre visuel sur la preview vidéo.
- [ ] Le filtre sélectionné est correctement "brûlé" dans la vidéo lors de l'export.
- [ ] Il est possible d'ajouter un nouvel overlay de texte.
- [ ] Le texte peut être déplacé et redimensionné directement sur la preview.
- [ ] Le panneau de texte permet de changer la police, le style, et l'animation.
- [ ] Les polices Google Fonts sont chargées à la demande.
- [ ] La timeline affiche des blocs représentant la durée de chaque overlay de texte.
- [ ] Les textes sont correctement incrustés dans la vidéo finale après l'export.

## Prompt one shot pour Claude Code

```
# Milestone 05 — Éditeur : Filtres & Texte Overlay

## Contexte
L'éditeur vidéo de "Mon Acupunctrice Hub V2" a sa fondation (import, trim, export). Ce milestone vise à ajouter les features créatives essentielles : les filtres de couleur et les superpositions de texte graphique.

## Stack
- Next.js 15, TypeScript, Tailwind, Zustand, FFmpeg.wasm, Konva.js, react-konva.

## Objectif
Intégrer un système de filtres vidéo (live preview + export) et un système complet de texte overlay utilisant Konva.js pour le rendu live et FFmpeg pour l'export.

## Livrables à créer

1.  **`lib/store/useEditorStore.ts`** :
    - Ajouter `filter: string | null` à l'état.
    - Ajouter `overlays: TextOverlay[]` à l'état.
    - Le type `TextOverlay` doit inclure `id`, `text`, `fontFamily`, `fontSize`, `fill`, `x`, `y`, `startTime`, `endTime`, `animation`.

2.  **`components/features/editor/panels/FilterPanel.tsx`** :
    - Affiche une liste de 9+ filtres avec une preview.
    - Au clic, met à jour la propriété `filter` dans `useEditorStore`.

3.  **`components/features/editor/VideoPreview.tsx`** :
    - Le `div` contenant la vidéo doit maintenant inclure un `<Stage>` de Konva pour les overlays.
    - Applique une classe CSS (ex: `filter-vintage`) au tag `<video>` en fonction du `filter` du store.

4.  **`components/features/editor/panels/TextPanel.tsx`** :
    - Affiche la liste des overlays de texte existants.
    - Permet d'en ajouter un nouveau (qui apparaît au centre de la preview).
    - Affiche les contrôles pour l'overlay sélectionné : `FontSelector`, `StyleSelector`, `AnimationSelector`.

5.  **`components/features/editor/text/TextOverlay.tsx`** :
    - Composant `react-konva` qui rend un `<Text>` de Konva.
    - Gère le `draggable` et le `onTransform` (redimensionnement).
    - N'est visible que si `currentTime` du store est entre son `startTime` et `endTime`.

6.  **`lib/utils/fontLoader.ts`** :
    - Fonction `async function loadFont(fontFamily: string)` qui utilise l'API `FontFace` pour charger une police depuis Google Fonts et l'ajouter à `document.fonts`.

7.  **`lib/hooks/useVideoExport.ts`** :
    - Mettre à jour la logique d'export.
    - Récupérer `filter` et `overlays` du store.
    - Traduire le nom du filtre en argument `-vf` pour FFmpeg.
    - Pour chaque overlay, construire une chaîne de filtre `drawtext` complexe pour FFmpeg, en s'assurant que les polices sont chargées dans le MEMFS de FFmpeg.

8.  **`Timeline.tsx`** :
    - Ajouter une nouvelle `Track` pour les textes. Elle itérera sur `store.overlays` et affichera des blocs représentant leur durée et leur position temporelle.

## Contraintes
- Utiliser **Konva.js** pour le rendu des textes sur la preview. C'est non-négociable pour la performance des interactions.
- L'export des textes avec FFmpeg est la partie la plus complexe. La stratégie est de charger les fichiers de police (`.ttf`) dans le FS virtuel de FFmpeg, puis de construire une longue chaîne de filtres `drawtext` pour incruster chaque texte.

## Definition of Done
- L'application d'un filtre dans l'UI modifie l'apparence de la vidéo en temps réel.
- L'ajout de texte crée un objet draggable et redimensionnable sur la vidéo.
- Les propriétés du texte (police, couleur, etc.) sont modifiables depuis un panneau.
- La timeline reflète la durée de vie des overlays de texte.
- La vidéo exportée contient à la fois le filtre de couleur et les textes incrustés aux bons moments.
```
