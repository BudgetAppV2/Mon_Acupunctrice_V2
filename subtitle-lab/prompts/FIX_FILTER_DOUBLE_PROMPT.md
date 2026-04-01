# FIX — Filtre CSS doublage d'image

## Problème
Quand on applique un filtre CSS (ex: "Chaud") sur la vidéo dans l'éditeur V2,
l'image se dédouble. On perd les détails fins et les images semblent s'empiler.
À intensité 0%, l'image est normale. À 100%, le doublage est visible.

## Architecture actuelle
SubtitleCanvas.tsx utilise deux éléments superposés :
1. `<video>` natif visible dans le DOM avec `style={{ filter: cssFilter }}`
2. `<canvas>` transparent par-dessus pour les sous-titres/overlays

Le filtre CSS est appliqué soit sur la `<video>` soit sur le container `<div>`.
Les deux approches causent le doublage.

## Ce qui fonctionnait dans le Lab
Dans le Lab (subtitle-lab), on avait un seul `<canvas>` qui dessinait tout
(vidéo + sous-titres). Le filtre CSS s'appliquait sur le `<canvas>` et
il n'y avait PAS de doublage car il n'y avait qu'un seul élément.

## Fichiers
- `components/features/editor-v2/SubtitleCanvas.tsx` — le composant à fixer
- `lib/editor-v2/filters.ts` — les définitions de filtres + interpolateFilter

## Contrainte
On veut garder le `<video>` natif dans le DOM pour le scrubbing fluide
(c'est le changement fondamental qu'on vient de faire). On ne veut PAS
revenir à un canvas unique avec drawImage.

## Pistes d'investigation
- Est-ce que le canvas transparent crée un problème de compositing avec
  le filtre CSS sur la vidéo ?
- Est-ce que le canvas a un fond qui n'est pas vraiment transparent ?
- Est-ce un problème de z-index ou de stacking context CSS ?
- Comment le Hub V1 (VideoPreview.tsx) gère les filtres avec un canvas
  par-dessus la vidéo ? (ref: components/features/editor/VideoPreview.tsx)
- Peut-être que le canvas doit avoir `pointer-events: none` et les events
  de drag doivent être sur le container au lieu du canvas ?

## Definition of Done
- [ ] Appliquer un filtre → l'image est filtrée SANS doublage
- [ ] L'intensité du slider fonctionne (0% = normal, 100% = full effect)
- [ ] Le scrubbing reste fluide (vidéo native dans le DOM)
- [ ] Les sous-titres/overlays s'affichent correctement par-dessus
- [ ] npm run build passe
