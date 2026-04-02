# FEAT — Porter les filtres WebGL du Lab vers le Hub V2

## Contexte
Les filtres WebGL ont été validés sur Safari iOS dans le Lab
(subtitle-lab/). Ils fonctionnent parfaitement. Il faut maintenant
les porter dans le Hub V2 (éditeur principal).

## Source : le code qui fonctionne dans le Lab
- `subtitle-lab/lib/webglRenderer.ts` — module WebGL complet
  (shaders, init, render, cssFilterToUniforms, destroy)
- `subtitle-lab/components/SubtitleCanvas.tsx` — dual canvas pattern
  (WebGL pour la vidéo + Canvas 2D pour les overlays)

## Destination : le Hub V2
- `lib/editor-v2/webglRenderer.ts` — copier le module du Lab
- `components/features/editor-v2/SubtitleCanvas.tsx` — adapter pour
  utiliser le WebGL renderer au lieu de ctx.filter ou CSS filter

## Ce qu'il faut faire

### 1. Copier le module WebGL
Copier `subtitle-lab/lib/webglRenderer.ts` vers `lib/editor-v2/webglRenderer.ts`.
Aucune modification nécessaire — le module est autonome.

### 2. Adapter SubtitleCanvas.tsx du Hub V2
Le SubtitleCanvas du Hub V2 utilise actuellement un canvas 2D unique
avec `ctx.filter` (qui ne fonctionne pas sur Safari) ou un video pool
avec drawImage.

Le réécrire avec le pattern dual canvas du Lab :
- Canvas WebGL (glCanvasRef) — vidéo + filtres GPU
- Canvas 2D (overlayCanvasRef) — sous-titres/text overlays, transparent

### 3. Conserver les features du Hub V2
Le Hub V2 a des features que le Lab n'a pas. Les conserver :
- Hit-testing pour drag sous-titres vs text overlays (useSubtitleDrag)
- Fade-in/fade-out audio pendant le playback
- Playhead wall clock linéaire
- Multi-track support (video pool si nécessaire)
- CoverCrop via UV coordinates dans le shader

### 4. Conversion des filtres
Les filtres CSS dans `lib/editor-v2/filters.ts` sont déjà définis.
Utiliser `cssFilterToUniforms()` du webglRenderer pour les convertir
en uniforms WebGL. L'interpolation d'intensité est gérée par cette
fonction.

## Pattern du RAF loop dans le Hub V2 (après port)
```
const loop = () => {
  // 1. Render vidéo avec filtres via WebGL
  if (vid && vid.readyState >= 2) {
    const uniforms = cssFilterToUniforms(activeFilter.css, filterIntensity);
    renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
  }
  // 2. Clear overlay canvas + dessiner sous-titres
  overlayCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  renderFrame({ canvas: overlayCanvas, ..., skipBackground: true });
};
```

## Fichiers à créer/modifier
- `lib/editor-v2/webglRenderer.ts` — COPIER du Lab
- `components/features/editor-v2/SubtitleCanvas.tsx` — RÉÉCRIRE avec WebGL

## IMPORTANT
- NE PAS utiliser ctx.filter (pas supporté sur Safari)
- NE PAS utiliser style.filter sur un element (cause le doublage)
- Utiliser UNIQUEMENT le shader WebGL pour les filtres
- Le canvas overlay doit être transparent (clearRect à chaque frame)
- Les events de drag (mouse/touch) sur le canvas overlay

## Definition of Done
- [ ] Les filtres s'appliquent via WebGL shader sur Safari iOS
- [ ] Le slider d'intensité fonctionne
- [ ] Les sous-titres/text overlays se dessinent correctement
- [ ] Le drag des sous-titres et overlays fonctionne
- [ ] Le scrubbing fonctionne
- [ ] Le playhead avance linéairement
- [ ] Les fades audio s'appliquent
- [ ] Le coverCrop fonctionne (vidéo paysage → portrait)
- [ ] npm run build passe
