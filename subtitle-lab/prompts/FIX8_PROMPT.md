# FIX-8 — Timeline drag, trim, scrubber : refonte interactions

## Contexte
La timeline du sheet Tracks a des problemes fondamentaux d'interaction :
les blocs ne sont pas draggables en continu, le trim gauche colle au bord,
le scrubber ne suit pas la video, les clips video ne sont pas repositionnables.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/TrackBlock.tsx` → blocs timeline, trim, drag
- `subtitle-lab/components/TracksPanel.tsx` → pistes, playhead, toolbar
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber
- `subtitle-lab/lib/store.ts` → updateClipTrim, recalcTimelineStarts, duration

---

## Fix 1 — Drag continu pour TOUS les blocs (pas seulement au pointerUp)

**Probleme :** Le drag des blocs calcule le delta seulement au pointerUp.
Le bloc ne suit PAS le doigt pendant le drag — l'utilisateur ne voit pas
ou le bloc va atterrir. Aussi, seuls les blocs sous-titres et text overlays
ont un `onDrag` — les clips video n'en ont pas.

**Fix :** `subtitle-lab/components/TrackBlock.tsx`

Refondre les interactions pour un drag continu avec feedback visuel :

```typescript
// 3 modes d'interaction :
// 1. Tap court (< 300ms, < 5px mouvement) → selection
// 2. Drag horizontal → repositionner le bloc (TOUS les types)
// 3. Trim handles → modifier trimStart/trimEnd

// Le drag doit etre continu — le bloc suit le doigt :
const [dragOffset, setDragOffset] = useState(0); // px offset pendant le drag

onPointerDown: memoriser la position initiale, demarrer le timer long press
onPointerMove: si mouvement > 5px, annuler le long press, entrer en mode drag
  - Calculer deltaMs depuis le mouvement
  - Mettre a jour dragOffset (visuellement le bloc se deplace)
  - NE PAS encore modifier le store (trop de re-renders)
onPointerUp: si en mode drag, appliquer le delta final au store
  - Si pas en mode drag et < 300ms → tap = selection
```

Le style du bloc pendant le drag utilise `transform: translateX(${dragOffset}px)`
pour un mouvement fluide sans re-layout :
```tsx
style={{
  left: `${left}%`, width: `${width}%`,
  transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
  transition: dragOffset ? 'none' : 'transform 150ms',
  zIndex: dragOffset ? 10 : undefined,
}}
```

**IMPORTANT :** Ajouter `setPointerCapture(e.pointerId)` sur pointerDown
pour que le drag continue meme si le doigt sort du bloc.

---

## Fix 2 — Clips video repositionnables

**Probleme :** Les clips video n'ont pas de callback `onDrag` dans TracksPanel.
Seuls les sous-titres et text overlays sont draggables.

**Fix :** `subtitle-lab/components/TracksPanel.tsx`

Ajouter `onDrag` pour les clips video. Quand on drag un clip video,
ca reordonne les clips (meme comportement que le long press reorder
de A7, mais plus naturel car c'est un drag direct).

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter une action `moveVideoClip` :
```typescript
moveVideoClip: (clipId: string, deltaMs: number) => void;
```
Cette action change l'ordre des clips en fonction de la nouvelle position.
Si le clip est deplace apres le clip suivant, ils sont swappe.

---

## Fix 3 — Trim gauche ne colle plus au bord

**Probleme :** Quand on trim le debut d'un clip video (trimStart augmente),
`recalcTimelineStarts` recalcule les positions sequentiellement en partant
de 0. Le clip se repositionne toujours a gauche.

**Explication :** Pour un seul clip, augmenter trimStart devrait montrer
que le debut est coupe mais le clip reste a la meme position. La zone
trimmee (en gris) devrait apparaitre a gauche du clip actif.

**Fix :** Le positionnement des blocs dans TracksPanel doit utiliser
la POSITION ABSOLUE du clip, pas la position sequentielle.

Pour un seul clip : le bloc doit etre positionne par rapport a sa
duree SOURCE (pas la duree trimmee). Le trim gauche reduit la zone
active mais le bloc reste a la meme position sur la timeline.

```typescript
// TracksPanel — positionnement des clips video :
// Le bloc occupe toute la duree SOURCE du clip
// La zone active (trimStart → trimEnd) est en couleur
// Les zones trimmees (0 → trimStart, trimEnd → duration) sont en gris

// Position du bloc = basee sur le clip source, pas recalcTimelineStarts
const clipSourceLeft = (c.timelineStart / refDuration) * 100; // debut sequentiel
const clipSourceWidth = (c.duration / refDuration) * 100; // duree SOURCE
const activeLeft = ((c.timelineStart + (c.trimStart)) / refDuration) * 100;
const activeWidth = ((c.trimEnd - c.trimStart) / refDuration) * 100;
```

La zone grise (source complete) est deja affichee. Le TrackBlock devrait
montrer la zone ACTIVE (coloree) et les zones TRIMMEES (grises faibles)
de chaque cote. Quand on trim a gauche, la zone grise a gauche grandit
et la zone active retrecie — le tout reste en position fixe.

---

## Fix 4 — Scrubber attache a la video

**Probleme :** Le scrubber ne scrub pas la video. Il met a jour
`currentTime` dans le store mais la video ne seek pas.

**Cause :** Le useEffect qui seek la video (ligne ~100 de SubtitleCanvas)
a la condition `if (!vid || isPlaying) return;` — correct. Mais aussi
`if (!r) return;` quand `findActiveClip` ne trouve pas de clip
(si currentTime est en dehors du clip par exemple).

**Fix :** Verifier que le scrub fonctionne en chainant :
1. MiniScrubber met a jour `setCurrentTime(ratio * duration)`
2. SubtitleCanvas useEffect[currentTime] detecte le changement
3. `findActiveClip(tracks, currentTime)` trouve le clip
4. Le video element seek a la bonne position

Si `duration` est correct (fix precedent) et `findActiveClip` retourne
le bon clip, le seek devrait fonctionner. Si ca ne marche pas,
le probleme est que `findActiveClip` ne trouve pas le clip —
verifier les valeurs de `timelineStart`, `trimStart`, `trimEnd`.

Ajouter un fallback : si findActiveClip retourne null mais qu'il y a
des clips, seek le premier clip au temps proportionnel :
```typescript
if (!r && allClips.length > 0) {
  const first = allClips[0];
  vid.src = first.blobUrl!;
  vid.currentTime = (currentTime / duration) * first.duration / 1000;
}
```

---

## Contraintes
- Le drag doit etre CONTINU (le bloc suit le doigt)
- `setPointerCapture` sur TOUS les drags
- NE PAS modifier le renderer.ts
- NE PAS modifier le CameraOverlay
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Tous les blocs (video, sous-titres, text, audio) sont draggables en continu
- [ ] Le bloc suit le doigt pendant le drag (translateX visuel)
- [ ] Le trim gauche d'un clip video montre la zone trimmee en gris a gauche
- [ ] Le clip video ne saute PAS a gauche quand on trim le debut
- [ ] Le scrubber seek la video en temps reel
- [ ] Le playhead du sheet Tracks est synchronise avec le scrubber
- [ ] `npm run build` passe
