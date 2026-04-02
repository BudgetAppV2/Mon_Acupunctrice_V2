# FIX — Saccades au playback sur Safari iOS via requestVideoFrameCallback

## Problème
Le playback vidéo saccade sur Safari iOS. Le RAF loop fait `texImage2D`
60 fois par seconde mais la vidéo ne produit que 24-30 frames/seconde.
On dessine la même frame 2-3 fois puis saute à la suivante → judder.
Ref: https://loke.dev/blog/request-video-frame-callback-video-canvas-sync

## Solution : requestVideoFrameCallback (rVFC)
Au lieu de redessiner la vidéo à chaque `requestAnimationFrame`, utiliser
`video.requestVideoFrameCallback()` qui ne se déclenche que quand le
décodeur vidéo a une NOUVELLE frame prête. Supporté sur Safari iOS.

## Implémentation

### Pattern actuel (saccadé) :
```typescript
// RAF loop qui tourne à 60fps — trop souvent
const loop = () => {
  drawFrame(); // appelle texImage2D même si pas de nouvelle frame
  requestAnimationFrame(loop);
};
```

### Pattern corrigé :
```typescript
// rVFC — ne se déclenche que quand une nouvelle frame vidéo est prête
function onVideoFrame(now: number, metadata: VideoFrameCallbackMetadata) {
  // Upload la nouvelle frame dans la texture WebGL
  renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
  // Continuer
  vid.requestVideoFrameCallback(onVideoFrame);
}
vid.requestVideoFrameCallback(onVideoFrame);

// RAF loop SÉPARÉ pour les overlays (sous-titres, texte)
// qui doivent se mettre à jour à 60fps pour le drag fluide
const overlayLoop = () => {
  overlayCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  renderFrame({ ..., skipBackground: true });
  requestAnimationFrame(overlayLoop);
};
```

### Séparation des responsabilités :
1. **rVFC** → dessine la vidéo filtrée sur le canvas WebGL
   (seulement quand une nouvelle frame est disponible)
2. **RAF** → dessine les overlays sur le canvas 2D transparent
   (à 60fps pour un drag fluide des sous-titres)

### Fallback pour navigateurs sans rVFC :
```typescript
if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  vid.requestVideoFrameCallback(onVideoFrame);
} else {
  // Fallback RAF pour Firefox
  const fallback = () => { renderVideoFrame(...); requestAnimationFrame(fallback); };
  requestAnimationFrame(fallback);
}
```

### Multi-track : chaque vidéo dans le pool a son propre rVFC
```typescript
for (const { clip } of activeClips) {
  const vid = pool.get(clip.id);
  if (vid && !vid.__rvfcActive) {
    vid.__rvfcActive = true;
    const cb = (now, meta) => {
      // Marquer cette vidéo comme ayant une nouvelle frame
      vid.__hasNewFrame = true;
      vid.requestVideoFrameCallback(cb);
    };
    vid.requestVideoFrameCallback(cb);
  }
}
// Dans le RAF loop des overlays, redessiner le WebGL canvas
// seulement si au moins une vidéo a une nouvelle frame
```

## Fichier à modifier
- `components/features/editor-v2/SubtitleCanvas.tsx`

## Attention
- Le rVFC ne se déclenche que quand la vidéo JOUE (pas en pause)
- Pour le scrub (pause + seek), garder le pattern `seeked` event actuel
- Le wall clock playhead continue d'avancer via son propre RAF
- Retirer le log PERF après le fix

## Definition of Done
- [ ] Le playback vidéo est fluide sur Safari iOS (pas de judder)
- [ ] Le scrub reste fluide
- [ ] Les overlays (sous-titres, texte) se mettent à jour à 60fps
- [ ] Le playhead avance linéairement
- [ ] Les fades audio s'appliquent
- [ ] Retirer les console.log PERF
- [ ] npm run build passe
