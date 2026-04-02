# FIX — Revenir au pattern video DOM + canvas transparent

## Problème
Claude Code a réécrit SubtitleCanvas avec un "multi-track video pool"
qui utilise un canvas unique avec drawImage. Ça cause :
1. Les filtres CSS ne marchent plus (ctx.filter ne fonctionne pas sur Safari)
2. L'image s'étire en largeur (coverCrop bug avec la caméra frontale iPhone)
3. Le scrubbing fluide est perdu (drawImage au lieu de vidéo native)

## Solution : Revenir au pattern qui fonctionnait
Le pattern correct (qu'on avait validé) :
- Un `<video>` natif VISIBLE dans le DOM avec `object-cover`
- Un `<canvas>` transparent par-dessus pour les sous-titres/overlays
- Le filtre CSS sur le `<video>` directement (pas ctx.filter)
- Le scrub fait `videoRef.current.currentTime = X` (natif = fluide)

## Référence : commit da5a317
C'est le commit "fundamental scrubber rewrite" qui avait le bon pattern.
Voir aussi le FIX_SCRUBBER_PROMPT.md pour l'architecture détaillée.

## Ce qu'il faut faire
Réécrire SubtitleCanvas.tsx pour revenir au pattern video DOM :

### Structure JSX :
```tsx
<div style={{ aspectRatio: '9/16' }}>
  {/* Video native — le navigateur gère le décodage */}
  {hasVideo && (
    <video ref={videoRef} src={videoUrl} playsInline muted preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: cssFilter }} />
  )}
  {/* Canvas transparent — seulement sous-titres et overlays */}
  <canvas ref={canvasRef} width={540} height={960}
    className="absolute inset-0 w-full h-full"
    style={{ background: 'transparent' }} />
</div>
```

### Filtres CSS (PAS ctx.filter) :
```tsx
const cssFilter = (af?.css && af.css !== 'none' && fIntensity > 0)
  ? interpolateFilter(af.css, fIntensity)
  : undefined;
// Appliquer sur le <video> style={{ filter: cssFilter }}
```

### RAF loop — SEULEMENT les overlays :
```tsx
ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
renderFrame({ ..., skipBackground: true }); // toujours skip
```

### Playhead — wall clock linéaire :
```tsx
// Avancer avec le wall clock, pas timeupdate
const n = store.currentTime + (wallMs - prevWall);
store.setCurrentTime(n);
// Seeker la vidéo pour suivre
vid.currentTime = localTimeMs / 1000;
```

### Scrub — seek natif :
```tsx
vid.currentTime = r.localTimeMs / 1000;
// Le navigateur affiche la frame instantanément
```

## IMPORTANT : Ne PAS utiliser le video pool
Le multi-track video pool est de la sur-ingénierie pour notre cas
(un seul clip vidéo à la fois). Un seul `<video>` element suffit.

## Fichiers
- `components/features/editor-v2/SubtitleCanvas.tsx` — réécriture
- Ne PAS modifier les autres fichiers

## Definition of Done
- [ ] Le `<video>` est visible dans le DOM (pas caché)
- [ ] Les filtres CSS s'appliquent sur la vidéo (pas ctx.filter)
- [ ] Le scrubbing est fluide (seek natif)
- [ ] Le playhead avance linéairement (wall clock)
- [ ] Les sous-titres/overlays se dessinent sur le canvas transparent
- [ ] Les fades audio s'appliquent pendant le play
- [ ] La vidéo enregistrée avec la caméra s'affiche sans étirement
- [ ] npm run build passe
