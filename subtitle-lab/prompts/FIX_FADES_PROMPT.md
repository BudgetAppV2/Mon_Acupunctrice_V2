# FIX — Fade handles + application des fades pendant la lecture

## Problème 1 : Les fade handles ne répondent pas au drag
Les handles amber sont visibles sur le waveform mais le drag ne
produit aucun effet. Le `onPointerMove` ne se déclenche pas.

### Cause probable
Le container parent du TracksPanel a un `onPointerMove` pour le
playhead drag qui intercepte les événements avant les handles.
Le canvas du waveform pourrait aussi bloquer les pointer events.

### Fix
Réécrire les fade handles avec un pattern de drag robuste :
- `onPointerDown` sur le handle → `setPointerCapture`
- `onPointerMove` et `onPointerUp` sur le même handle (pas le container)
- `e.stopPropagation()` partout
- S'assurer que le canvas waveform a `pointer-events-none`
- S'assurer que le texte du nom a `pointer-events-none` (déjà le cas)
- Tester que le drag fonctionne en vérifiant que `setAudioFade` est appelé

## Problème 2 : Les fades ne sont pas appliqués pendant la lecture
Le SubtitleCanvas joue l'audio à volume fixe (`audioVolume`).
Les fade-in et fade-out ne sont jamais appliqués.

### Fix
Dans le RAF loop de playback (ou dans un useEffect séparé), ajuster
le volume de l'audio en fonction de la position dans le clip :

```typescript
// Dans le RAF loop ou un useEffect qui poll currentTime
const audioClip = tracks.find(t => t.type === 'audio')?.audioClips?.[0];
if (audioRef.current && audioClip && isPlaying) {
  const clipTime = currentTime / 1000; // en secondes
  const clipDur = audioClip.duration / 1000;
  const fadeIn = audioClip.fadeIn;
  const fadeOut = audioClip.fadeOut;
  
  let fadeMultiplier = 1;
  if (fadeIn > 0 && clipTime < fadeIn) {
    fadeMultiplier = clipTime / fadeIn; // 0 → 1
  }
  if (fadeOut > 0 && clipTime > clipDur - fadeOut) {
    fadeMultiplier = Math.min(fadeMultiplier, (clipDur - clipTime) / fadeOut); // 1 → 0
  }
  audioRef.current.volume = audioVolume * Math.max(0, fadeMultiplier);
}
```

## Fichiers à modifier
- `components/features/editor-v2/AudioWaveform.tsx` — fix drag handles
- `components/features/editor-v2/SubtitleCanvas.tsx` — apply fades during playback

## Definition of Done
- [ ] Drag le handle gauche → le fade-in change (gradient visible + slider sync)
- [ ] Drag le handle droit → le fade-out change
- [ ] Pendant le play, le volume augmente graduellement au début (fade-in)
- [ ] Pendant le play, le volume diminue graduellement à la fin (fade-out)
- [ ] npm run build passe
