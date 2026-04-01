# FIX — Timeline Drag Repositionnement

## Problème
Les blocs dans la timeline ne restent pas à la position où on les dépose.
Le drag vers la gauche ne fonctionne jamais (clampé à 0) et le drag
vers la droite est inconsistant.

## Cause racine identifiée
Le callback `onDrag` dans TracksPanel utilise une closure stale :
```tsx
onDrag={deltaMs => moveVideoClip(c.id, deltaMs)}
```
`moveVideoClip` fait `c.timelineStart + deltaMs`, mais `c.timelineStart`
dans le store peut être 0, et le delta peut être négatif = clampé à 0.

Le vrai problème est que le système actuel mélange :
- Des deltas relatifs (dans TrackBlock)
- Des positions absolues (dans le store)
- Des closures React (dans TracksPanel callbacks)
- Des refs React (dans TrackBlock)

## Solution : Pattern Remotion + Medium article

Réf: https://www.remotion.dev/docs/building-a-timeline
Réf: https://medium.com/@aswathyraj/how-i-built-drag-and-drop-in-react-without-libraries-using-pointer-events

Le pattern correct pour un drag dans une timeline :

1. **onPointerDown**: capturer le pointerId, la position X du pointeur,
   et le `startMs` ACTUEL du bloc au moment du down. Stocker dans des refs.
   Appeler setPointerCapture.

2. **onPointerMove**: calculer la NOUVELLE position absolue du bloc
   en convertissant le déplacement pixels en ms. Mettre à jour le store
   DIRECTEMENT à chaque move (pas seulement au up). Le bloc suit le
   doigt en temps réel via le re-render React (pas via translateX).

3. **onPointerUp**: releasePointerCapture. Rien d'autre — le store
   est déjà à jour.

## Implémentation détaillée

### TrackBlock.tsx — réécrire le drag

```tsx
// Le drag met à jour le store directement pendant le move
// Pas de translateX, pas de dragPx state, pas de RAF delay

const onBlockDown = (e: React.PointerEvent) => {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  start.current = {
    x: e.clientX,
    origStart: startMs,  // position actuelle du bloc en ms
    time: Date.now()
  };
  mode.current = 'idle';
};

const onBlockMove = (e: React.PointerEvent) => {
  if (mode.current === 'trim') return;
  const dx = e.clientX - start.current.x;
  // Seuil de 5px pour distinguer tap vs drag
  if (mode.current === 'idle' && Math.abs(dx) > 5) mode.current = 'drag';
  if (mode.current === 'drag' && onDrag) {
    e.stopPropagation();
    // Calculer la nouvelle position ABSOLUE en ms
    const ppm = getPxPerMs(e.currentTarget as HTMLElement);
    const deltaMs = dx / ppm;
    const newStartMs = Math.max(0, start.current.origStart + deltaMs);
    // Mettre à jour le store IMMÉDIATEMENT
    onDrag(newStartMs);
  }
};

const onBlockUp = (e: React.PointerEvent) => {
  if (mode.current === 'idle' && Date.now() - start.current.time < 300) {
    e.stopPropagation();
    selectItem(trackId, id);
  }
  mode.current = 'idle';
  // Pas de setDragPx(0) — il n'y a plus de dragPx
};
```

### TracksPanel.tsx — callback simplifié

```tsx
// onDrag reçoit la nouvelle position ABSOLUE en ms du bloc
// Pour un clip vidéo: newStartMs = timelineStart + trimStart
// Donc: newTimelineStart = newStartMs - trimStart
<TrackBlock
  onDrag={newStartMs => moveVideoClip(c.id, newStartMs - c.trimStart)}
/>
```

### store moveVideoClip — accepte la position absolue (pas un delta)

```tsx
moveVideoClip: (clipId, newTimelineStart) => set((s) => {
  const tracks = s.tracks.map(t => {
    if (t.type !== 'video' || !t.clips) return t;
    return { ...t, clips: t.clips.map(c =>
      c.id === clipId
        ? { ...c, timelineStart: Math.max(0, newTimelineStart) }
        : c
    )};
  });
  return { tracks, ...syncFlatFromTracks(tracks) };
}),
```

## Pourquoi ça fonctionne

- **Pas de closure stale** : `start.current.origStart` est capturé au
  pointerDown et ne change pas pendant le drag
- **Pas de delta cumulatif** : chaque move recalcule depuis origStart
- **Le store est à jour pendant le drag** : pas de bounce back possible
  car le bloc est TOUJOURS à la position du store
- **Pas de translateX** : le bloc se repositionne via le `left%` CSS
  qui vient du re-render React
- **Le clamp à 0 est correct** : origStart=2000, deltaMs=-500 →
  newStartMs=1500 (pas 0!)

## Fichiers à modifier
- `components/features/editor-v2/TrackBlock.tsx`
- `components/features/editor-v2/TracksPanel.tsx`
- `lib/store/useEditorV2Store.ts`

## Definition of Done
- [ ] Dragger un clip vidéo vers la droite → le clip reste en position
- [ ] Dragger un clip vidéo vers la gauche → le clip reste en position
- [ ] Dragger un bloc sous-titre → le bloc reste en position
- [ ] Dragger un text overlay → l'overlay reste en position
- [ ] Le trim continue de fonctionner
- [ ] Tap court = sélection (pas de drag)
- [ ] Pas de bounce back
- [ ] Retirer les console.log de debug
- [ ] npm run build passe
