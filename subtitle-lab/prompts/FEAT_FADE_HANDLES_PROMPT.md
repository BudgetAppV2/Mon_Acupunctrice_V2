# FEAT — Fade-in / Fade-out handles sur le waveform audio

## Objectif
Ajouter des handles draggables sur le waveform audio dans la timeline
qui permettent d'ajuster visuellement les fade-in et fade-out.

## Comportement attendu

### Visuellement
Le waveform audio affiche deux zones de fade semi-transparentes :
- **Fade-in** (côté gauche) : un gradient qui va de transparent à opaque
- **Fade-out** (côté droit) : un gradient qui va de opaque à transparent
- Chaque zone a un **handle draggable** (petite barre verticale) à son bord

```
     fade-in handle          fade-out handle
         │                        │
         ▼                        ▼
    ░░░░░│████████████████████████│░░░░░
    ░░░░░│████ WAVEFORM ██████████│░░░░░
    ░░░░░│████████████████████████│░░░░░
    ◄───► ◄──────────────────────► ◄───►
    fade   audio sans fade          fade
    in                              out
```

### Interaction
1. Drag le handle gauche vers la droite → augmente le fade-in (en secondes)
2. Drag le handle droit vers la gauche → augmente le fade-out (en secondes)
3. Les valeurs sont mises à jour en temps réel dans le store via `setAudioFade`
4. Le fade minimum est 0s, le maximum est la moitié de la durée du clip

### Visuel des zones de fade
- La zone de fade-in a un gradient linéaire de `rgba(0,0,0,0.6)` à `transparent`
  (assombrit le début du waveform)
- La zone de fade-out a un gradient de `transparent` à `rgba(0,0,0,0.6)`
- Le handle est une barre verticale de 3px, couleur `amber-400`, avec un curseur
  `col-resize`

## Fichiers impliqués

### `components/features/editor-v2/AudioWaveform.tsx`
- Ajouter les zones de fade (gradients CSS ou canvas)
- Ajouter les handles draggables (fade-in handle gauche, fade-out handle droit)
- Les handles utilisent `onPointerDown/Move/Up` + `setPointerCapture`
- Le drag convertit la position X en secondes basé sur la durée du clip
- Le drag appelle `onFadeChange(fadeIn, fadeOut)` en temps réel

### `components/features/editor-v2/TracksPanel.tsx`
- Passer les props `fadeIn`, `fadeOut`, `duration`, et `onFadeChange` au AudioWaveform
- Le `onFadeChange` appelle `setAudioFade(clipId, fadeIn, fadeOut)` du store

## Nouvelles props du AudioWaveform
```tsx
interface Props {
  blobUrl: string;
  width: number;
  height: number;
  // Nouveaux props pour les fade handles
  fadeIn?: number;       // durée fade-in en secondes
  fadeOut?: number;      // durée fade-out en secondes
  duration?: number;     // durée totale du clip en secondes
  onFadeChange?: (fadeIn: number, fadeOut: number) => void;
}
```

## Pattern de drag (même pattern que TrackBlock)
```tsx
const onHandleDown = (side: 'in' | 'out', e: React.PointerEvent) => {
  e.stopPropagation();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  dragRef.current = { side, startX: e.clientX, origFadeIn: fadeIn, origFadeOut: fadeOut };
};

const onHandleMove = (e: React.PointerEvent) => {
  if (!dragRef.current) return;
  const dx = e.clientX - dragRef.current.startX;
  const pxPerSec = width / (duration || 1);
  const deltaSec = dx / pxPerSec;
  if (dragRef.current.side === 'in') {
    onFadeChange(Math.max(0, Math.min(duration/2, dragRef.current.origFadeIn + deltaSec)), fadeOut);
  } else {
    onFadeChange(fadeIn, Math.max(0, Math.min(duration/2, dragRef.current.origFadeOut - deltaSec)));
  }
};
```

## Definition of Done
- [ ] Zones de fade visibles sur le waveform (gradients sombres)
- [ ] Handle gauche draggable pour fade-in
- [ ] Handle droit draggable pour fade-out
- [ ] Les valeurs se mettent à jour en temps réel
- [ ] Le drag est fluide (pointerCapture)
- [ ] Les sliders dans l'AudioSheet restent synchronisés
- [ ] npm run build passe
