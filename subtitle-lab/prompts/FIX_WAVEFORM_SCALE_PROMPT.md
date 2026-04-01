# FIX — Waveform audio doit correspondre à la durée de la timeline vidéo

## Problème
Le waveform audio montre TOUTE la durée de l'audio (ex: 161 secondes)
compressée dans la largeur de la piste qui correspond à la durée vidéo
(ex: 15 secondes). Les fade handles semblent bouger de 3 secondes
visuellement mais affectent 45 secondes de l'audio.

## Cause
Le clip audio dans TracksPanel occupe `left:0 right:0` (100% de la
largeur de la piste) peu importe sa durée. Le waveform dessine les
161 secondes dans cet espace. Les fade handles calculent en secondes
basé sur `duration` de l'audio (161s) mais l'espace visuel est celui
de la timeline vidéo (15s).

## Fix
Le clip audio doit être positionné et dimensionné comme les clips
vidéo — en fonction de `refDuration` (la durée de référence de la
timeline). Si l'audio dure plus que la timeline, il déborde à droite
(mais on ne montre que la portion visible). Le waveform ne doit
montrer que la portion de l'audio qui correspond à la durée visible.

### TracksPanel — positionnement du clip audio
```tsx
// Avant (occupe 100% de la piste)
<div className="absolute top-1 bottom-1 left-0 right-0 ...">

// Après (positionné comme les clips vidéo)
const audioLeft = refDuration > 0 ? (a.startMs / refDuration) * 100 : 0;
const audioWidth = refDuration > 0 ? Math.min(100, (a.duration / refDuration) * 100) : 100;
<div className="absolute top-1 bottom-1" style={{ left: `${audioLeft}%`, width: `${audioWidth}%` }}>
```

### AudioWaveform — ne montrer que la portion visible
Le waveform reçoit déjà `width` et `duration` en props.
- `width` = largeur en pixels du container (300px hardcodé actuellement)
- `duration` = durée du clip audio en secondes

Problème: `width` est hardcodé à 300px. Il devrait être dynamique
basé sur la largeur réelle du container audio.

Fix: utiliser un `ResizeObserver` ou `ref.clientWidth` pour obtenir
la largeur réelle, et ne decoder/dessiner que la portion de l'audio
correspondant à la durée visible de la timeline.

### Fade handles — borner au visible
Les fade handles sont déjà bornés par `duration / 2`. Mais
`duration` doit être la durée VISIBLE (= min(audioDuration, timelineDuration)),
pas la durée totale de l'audio.

## Fichiers à modifier
- `components/features/editor-v2/TracksPanel.tsx` — positionnement du clip audio
- `components/features/editor-v2/AudioWaveform.tsx` — largeur dynamique + portion visible

## Definition of Done
- [ ] Le clip audio est positionné correctement dans la timeline
- [ ] Le waveform ne montre que la portion correspondant à la timeline
- [ ] Les fade handles correspondent visuellement aux secondes réelles
- [ ] Les fade-in/fade-out s'appliquent correctement pendant la lecture
- [ ] Retirer les console.log de debug (TICK_AUDIO, FADE_DATA, FADE_HANDLE)
- [ ] npm run build passe
