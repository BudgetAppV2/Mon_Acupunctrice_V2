# FIX — Playback saccadé sur Safari iOS

## Problème
Le playback vidéo est saccadé sur Safari iOS dans le Hub V2.
Le Lab (subtitle-lab) avec le MÊME code WebGL est fluide.

## Cause identifiée
Le Hub V2 utilise un "video pool" multi-track complexe (347 lignes)
qui crée beaucoup d'overhead :
- Multiples vidéos dans un pool Map
- requestVideoFrameCallback par clip
- RAF loop séparé pour les overlays
- Tick de playback séparé avec wall clock
- Gestion play/pause par clip avec drift correction

Le Lab utilise un pattern simple (224 lignes) :
- Un seul `<video>` element caché
- Un seul RAF loop qui fait tout
- Pas de video pool

## Solution
Réécrire le SubtitleCanvas du Hub V2 en s'inspirant du Lab.
Pour l'instant on n'a besoin que d'un seul clip vidéo à la fois
(pas de multi-track compositing).

## RÉFÉRENCE : Le Lab qui fonctionne
Lire `subtitle-lab/components/SubtitleCanvas.tsx` — c'est le code
qui est fluide sur Safari iOS. L'adapter pour le Hub V2.

## Adaptations nécessaires par rapport au Lab
1. Import paths : `@/lib/editor-v2/...` au lieu de `../lib/...`
2. Store : `useEditorV2Store` au lieu de `useSubtitleStore`
3. Hit-test drag : utiliser `useSubtitleDrag()` sans params
   (le hook fait le hit-testing automatiquement)
4. Fade audio : garder le calcul de fade-in/fade-out sur l'audio
   pendant le playback (le Lab ne l'a pas)
5. Wall clock playhead : avancer le currentTime linéairement
   pendant le play (le Lab utilise gMs du vid.currentTime)
6. WebGL renderer : utiliser `webglRenderer.ts` du Hub V2
   (identique à celui du Lab)
7. Garder le throttle de setCurrentTime à ~15fps pendant le play
   (utiliser timeRef.current pour le calcul, pas store.currentTime)

## Pattern du RAF loop (inspiré du Lab, adapté pour Hub V2)
```typescript
const loop = (wallMs: number) => {
  const vid = videoRef.current;
  const t = timeRef.current;
  
  // 1. Si playing, avancer le temps linéairement
  if (playingRef.current && prevWallRef.current !== null) {
    const n = t + (wallMs - prevWallRef.current);
    if (n >= durationRef.current) { setCurrentTime(0); setIsPlaying(false); }
    else {
      timeRef.current = n;
      // Throttle store updates
      if (wallMs - lastStoreUpdateRef.current > 66) {
        setCurrentTime(n);
        lastStoreUpdateRef.current = wallMs;
      }
    }
    prevWallRef.current = wallMs;
  } else if (playingRef.current) {
    prevWallRef.current = wallMs;
  } else {
    prevWallRef.current = null;
  }
  
  // 2. Seek vidéo au bon moment si nécessaire
  const ar = findActiveClip(tracks, t);
  if (ar && vid && vid.readyState >= 2) {
    if (!playingRef.current) {
      vid.currentTime = ar.localTimeMs / 1000;
    }
  }
  
  // 3. Dessiner la vidéo avec WebGL + filtres
  if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
    const uniforms = cssFilterToUniforms(activeCss, intensity);
    renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
  }
  
  // 4. Dessiner les overlays sur le canvas 2D
  overlayCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  renderFrame({ ..., skipBackground: true });
  
  // 5. Audio fade
  applyAudioFade(t, audioRef, audioClip, audioVolume, duration);
  
  rafRef.current = requestAnimationFrame(loop);
};
```

## IMPORTANT
- UN SEUL RAF loop — pas de rVFC séparé, pas de RAF overlay séparé
- UN SEUL `<video>` element — pas de video pool
- Le Lab utilise ce pattern et c'est FLUIDE sur Safari iOS
- Retirer les logs de debug (PLAY, PERF, RVFC)

## Fichier
- `components/features/editor-v2/SubtitleCanvas.tsx` — réécriture

## Definition of Done
- [ ] Playback fluide sur Safari iOS (pas de saccades)
- [ ] Filtres WebGL fonctionnent
- [ ] Scrub fluide
- [ ] Playhead avance linéairement
- [ ] Audio fade-in/fade-out pendant le play
- [ ] Drag sous-titres/overlays fonctionne
- [ ] Pas de logs de debug
- [ ] npm run build passe
