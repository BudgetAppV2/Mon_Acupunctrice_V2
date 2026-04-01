# FIX — Playhead reset quand il rencontre le clip

## Problème
Quand on scrub ou joue et que le playhead arrive sur un clip vidéo
dans la timeline, le playhead saute au début (currentTime → 0).

## Cause probable
Dans le RAF loop de SubtitleCanvas, quand un clip devient actif :
```
gMs = ar.clip.timelineStart + (vid.currentTime * 1000 - ar.clip.trimStart)
```
Si `vid.currentTime` est 0 (vidéo pas encore seekée au bon moment),
`gMs` = `timelineStart - trimStart` qui peut être négatif ou 0.
Le store est alors mis à jour avec cette valeur incorrecte.

Aussi, `timelineStart` peut maintenant être négatif (fix du drag).
Le calcul de `gMs` doit être robuste face aux `timelineStart` négatifs.

## Contexte
- `timelineStart` peut être négatif (clip trimmé puis dragé vers la gauche)
- `getClipAtTime` utilise `absStart = timelineStart + trimStart` et
  `absEnd = timelineStart + trimEnd` pour trouver le clip actif
- Le RAF loop calcule `gMs` et met à jour `currentTime` si > 50ms de diff
- Quand la vidéo n'est pas encore seekée, `vid.currentTime = 0`

## Fichiers
- `components/features/editor-v2/SubtitleCanvas.tsx` — RAF loop, scrub useEffect
- `lib/editor-v2/store.ts` — getClipAtTime, findActiveClip

## Fix attendu
- Le playhead doit avancer de manière continue
- Pas de saut à 0 quand le clip est rencontré
- Le scrub doit fonctionner dans toutes les directions
- Le play doit traverser les zones sans clip (noir) et continuer dans le clip

## Definition of Done
- [ ] Scrubber fonctionne sans sauts
- [ ] Play ne reset pas à 0 en rencontrant un clip
- [ ] npm run build passe
