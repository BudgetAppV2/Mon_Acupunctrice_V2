# FEAT — Trim handles sur les blocs texte dans la timeline

## Objectif
Les text overlays dans la timeline n'ont pas de trim handles.
On veut pouvoir ajuster le startMs et endMs des text overlays
en draggant des handles sur les bords gauche et droit du bloc,
exactement comme les trim handles des clips vidéo.

## Comportement actuel
- Les text overlays s'affichent dans la timeline comme des blocs
  violets (`bg-purple-400/30`)
- Ils sont draggables (déjà implémenté via `moveTextOverlay`)
- MAIS ils n'ont PAS de trim handles — on ne peut pas changer
  leur durée visuellement

## Comportement attendu
- Quand un text overlay est sélectionné, des handles apparaissent
  sur les bords gauche et droit (comme pour les clips vidéo)
- Drag le handle gauche → change le `startMs`
- Drag le handle droit → change le `endMs`
- Les handles sont visibles seulement quand le bloc est sélectionné
- Durée minimum de 200ms (comme les clips vidéo)

## Implémentation
Le composant `TrackBlock.tsx` supporte DÉJÀ les trim handles via
le prop `onTrimChange`. Il suffit de passer ce prop pour les text
overlays dans `TracksPanel.tsx`.

### TracksPanel.tsx — ajouter onTrimChange aux text overlays
Actuellement les text overlays sont rendus comme:
```tsx
<TrackBlock id={o.id} trackId="text" label={o.text.slice(0, 12)}
  startMs={o.startMs} endMs={o.endMs} duration={refDuration}
  color="bg-purple-400/30" selected={selectedItemId === o.id}
  onDrag={newStartMs => moveTextOverlay(o.id, newStartMs)} />
```

Ajouter `onTrimChange`:
```tsx
<TrackBlock id={o.id} trackId="text" label={o.text.slice(0, 12)}
  startMs={o.startMs} endMs={o.endMs} duration={refDuration}
  color="bg-purple-400/30" selected={selectedItemId === o.id}
  onDrag={newStartMs => moveTextOverlay(o.id, newStartMs)}
  onTrimChange={(newStart, newEnd) => updateTextOverlay(o.id, {
    startMs: newStart, endMs: newEnd
  })} />
```

### Vérifier que updateTextOverlay est importé dans TracksPanel
Le store V2 a déjà `updateTextOverlay(id, changes)` — vérifier
qu'il est destructuré dans le composant.

## Fichiers à modifier
- `components/features/editor-v2/TracksPanel.tsx` — ajouter
  onTrimChange aux text overlay TrackBlocks

## Definition of Done
- [ ] Text overlay sélectionné → handles visibles aux bords
- [ ] Drag handle gauche → startMs change
- [ ] Drag handle droit → endMs change
- [ ] Durée minimum 200ms
- [ ] Le drag du bloc (déplacement) continue de fonctionner
- [ ] npm run build passe
