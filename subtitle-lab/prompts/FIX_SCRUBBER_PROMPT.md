# FIX — Scrubber fluide (changement fondamental)

## Problème
Le scrub dans le preview est saccadé avec beaucoup de frames noirs.
Le Hub V1 a un scrubber parfaitement fluide. La cause est architecturale.

## Cause racine

### Hub V1 (fluide) — fichier: `components/features/editor/VideoPreview.tsx`
- L'element `<video>` est DANS le DOM React avec `src={videoUrl}`
- `seekTo(t)` fait directement `_videoEl.currentTime = t`
- Le navigateur affiche la frame NATIVEMENT sur l'element video
- Le canvas (via `useRealtimeCanvas`) dessine les overlays PAR-DESSUS
- Le navigateur gère le décodage des frames — c'est instantané

### V2 actuel (saccadé) — fichier: `components/features/editor-v2/SubtitleCanvas.tsx`
- L'element `<video>` est CACHÉ (créé par `createVideoElement()`, invisible)
- Le scrub fait `vid.currentTime = X` sur la video cachée
- Le RAF loop doit ATTENDRE `vid.readyState >= 2` puis `ctx.drawImage(vid, ...)`
- Délai entre le seek et le moment où drawImage a une frame valide
- Pendant ce délai → frame noire ou freeze

## Solution : Adopter le pattern Hub V1

Réécrire SubtitleCanvas pour utiliser un `<video>` visible dans le DOM
avec un `<canvas>` transparent par-dessus pour les overlays/sous-titres.

### Architecture cible :
```
<div className="relative">
  {/* Video native — le navigateur gère le décodage et l'affichage */}
  <video ref={videoRef} src={videoUrl}
    className="w-full h-full object-cover"
    style={{ filter: cssFilter }}
    playsInline muted />

  {/* Canvas transparent par-dessus — SEULEMENT pour les sous-titres et overlays */}
  <canvas ref={canvasRef}
    className="absolute inset-0 w-full h-full"
    style={{ background: 'transparent' }} />
</div>
```

### Comportement :
1. Le `<video>` affiche la vidéo nativement — le navigateur décode les frames
2. Le CSS `filter` est appliqué directement sur le `<video>` (pas le canvas)
3. Le canvas est transparent et dessine SEULEMENT les sous-titres et text overlays
4. Le scrub fait `videoRef.current.currentTime = X` — frame affichée instantanément
5. Le RAF loop appelle `renderFrame()` sur le canvas transparent pour les overlays
6. Le `renderFrame()` doit être appelé avec `skipBackground: true` TOUJOURS
   (le fond est la vidéo native, pas le canvas)

### Ce qui change :
- Le `<video>` passe de caché à visible, positionné en CSS cover 9:16
- Le canvas passe de "tout dessiner" à "overlays seulement"
- Le RAF loop ne fait plus `ctx.drawImage(vid, ...)` — la vidéo est native
- Le RAF loop fait seulement `ctx.clearRect()` + `renderFrame()` pour les overlays
- Le filtre CSS s'applique sur le `<video>`, pas sur le canvas
- Le coverCrop (9:16) est fait par CSS `object-fit: cover` sur le `<video>`

### Ce qui ne change PAS :
- Le store Zustand (aucun changement)
- Le renderer.ts (il dessine les sous-titres sur le canvas transparent)
- Les autres composants (TracksPanel, FilterPanel, TextPanel, etc.)
- Le drag des sous-titres sur le canvas (useSubtitleDrag)
- L'export pipeline (canvas offscreen séparé)

## Fichiers à lire AVANT de coder
- `components/features/editor/VideoPreview.tsx` — le pattern V1 qui fonctionne
- `components/features/editor-v2/SubtitleCanvas.tsx` — le code actuel à réécrire
- `lib/editor-v2/renderer.ts` — le renderFrame() (ne pas modifier)
- `lib/editor-v2/playback.ts` — coverCrop, findActiveClip, createVideoElement

## Fichiers à modifier
- `components/features/editor-v2/SubtitleCanvas.tsx` — réécriture majeure

## Contraintes
- Le `<video>` doit être en 9:16 (portrait) via CSS object-fit: cover
- Les sous-titres et text overlays doivent être dessinés sur le canvas transparent
- Le canvas transparent doit être dimensionné identiquement au video
- Le RAF loop doit clear le canvas à chaque frame (transparent) puis dessiner les overlays
- Le drag des sous-titres (onMouseDown/onTouchStart sur le canvas) doit continuer à fonctionner
- Le filtre CSS s'applique sur le `<video>` element (pas le canvas)
- L'intensité du filtre utilise `interpolateFilter()` de `lib/editor-v2/filters.ts`
- Play/pause contrôle directement `videoRef.current.play()` / `.pause()`
- Le scrub fait directement `videoRef.current.currentTime = X`
- Quand aucun clip n'est actif (zone noire sur la timeline), la video peut rester figée
  à la dernière frame (pas de frame noire requise)
- Le gradient de démo (quand aucune vidéo n'est importée) doit encore fonctionner
  via le canvas (skipBackground: false quand pas de vidéo)

## Definition of Done
- [ ] Le scrub est fluide — pas de frames noirs pendant le drag du curseur
- [ ] Les sous-titres s'affichent correctement par-dessus la vidéo
- [ ] Les text overlays s'affichent correctement
- [ ] Les filtres CSS s'appliquent visuellement
- [ ] Le play/pause fonctionne
- [ ] Le drag des sous-titres/overlays sur le canvas fonctionne
- [ ] Le gradient de démo s'affiche quand aucune vidéo n'est importée
- [ ] Le coverCrop 9:16 fonctionne (vidéo paysage cadrée en portrait)
- [ ] Mobile 375px fonctionne
- [ ] npm run build passe
