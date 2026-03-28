# Milestone EP-9 — CRITIQUE : Brancher le rendering pro dans le preview temps réel

**Date :** 28 mars 2026
**Priorité :** BLOQUANT — sans ce milestone, rien de EP-0 à EP-8 n'est visible
**Temps estimé :** 8-12h
**Dépendances :** EP-0 à EP-8 (tous faits)

---

## Le problème

Le nouveau système de rendering (scene graph, subtitle engine pro, LUTs, templates,
overlays, effets) est implémenté mais **n'est pas branché dans le preview temps réel**.

L'éditeur a DEUX systèmes de preview en parallèle qui ne communiquent pas :

### Système 1 — DOM/React (ACTIF pendant la lecture)
- `TextOverlayLayer` : composant React qui positionne des `<div>` par-dessus la vidéo
- `SubtitlePreview` : composant React qui affiche les sous-titres en HTML/CSS
- Filtres via `style={{ filter: css }}` sur le `<video>`
- PAS d'accès au scene graph, PAS de LUTs, PAS de templates

### Système 2 — Canvas (ACTIF seulement en pause)
- `useCanvasPreview` : dessine une frame Canvas quand la vidéo est en pause
- Utilise `renderScene`, `buildExportScene`, `applyLut` — tout le nouveau code
- Se déclenche via `useEditorStore.subscribe` quand `isPlaying` passe à false

### Résultat
- Les styles de sous-titres "one tap" changent le CSS des overlays DOM mais pas le rendering Canvas
- Les templates sont sélectionnables mais leur preview n'apparaît pas pendant la lecture
- Les LUTs ne s'appliquent que quand la vidéo est en pause
- Les animations ne se voient pas car le canvas preview est une frame statique
- Les effets film (grain, vignette) ne s'appliquent pas en temps réel

---

## La solution

Remplacer le système DOM (TextOverlayLayer + SubtitlePreview) par un **Canvas overlay
temps réel** qui utilise `renderScene` à chaque frame via `requestAnimationFrame`.

### Architecture cible

```
┌─────────────────────────────────────────┐
│ VideoPreview.tsx                         │
│ ┌─────────────────────────────────────┐ │
│ │ <video> (source brute, pas de CSS   │ │
│ │  filter — le filtre passe par le    │ │
│ │  canvas)                            │ │
│ ├─────────────────────────────────────┤ │
│ │ <canvas> overlay (position absolute,│ │
│ │  même taille que la vidéo)          │ │
│ │  → requestAnimationFrame loop       │ │
│ │  → dessine la vidéo + filter CSS    │ │
│ │  → applyLut si actif               │ │
│ │  → renderScene (overlays, sous-     │ │
│ │    titres pro, effets, template)    │ │
│ │  → visible en permanence, pas juste │ │
│ │    en pause                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Approche technique

1. Ajouter un `<canvas>` par-dessus le `<video>` dans VideoPreview.tsx
2. Créer un hook `useRealtimeCanvas(videoEl, canvasEl)` qui :
   - Lance un `requestAnimationFrame` loop quand la vidéo joue
   - À chaque frame :
     a. `ctx.drawImage(videoEl, ...)` — copie la frame vidéo
     b. Applique le filtre CSS via `ctx.filter`
     c. Applique la LUT si active (`applyLut`)
     d. Appelle `renderScene(ctx, scene, currentTime, w, h)` pour les overlays/sous-titres/effets
   - Quand en pause : même logique mais sans la boucle (une seule frame)
3. Masquer le `<video>` visuellement (il reste dans le DOM pour la lecture audio et le timing)
4. Retirer TextOverlayLayer et SubtitlePreview du preview (gardés seulement en mode `interactive` pour l'édition drag-and-drop)

### Construire le SceneGraph en temps réel

Le `buildExportScene` actuel construit un SceneGraph à partir des overlays.
Pour le preview temps réel, il faut que le SceneGraph se reconstruise quand le store change :

```typescript
// Dans useRealtimeCanvas
const sceneRef = useRef<SceneGraph | null>(null);

useEffect(() => {
  const unsub = useEditorStore.subscribe(() => {
    const s = useEditorStore.getState();
    sceneRef.current = buildExportScene({
      duration: s.trimEnd - s.trimStart,
      overlays: s.overlays,
      subtitles: s.subtitles,
      templateId: s.activeTemplateId ?? undefined,
      templateConfig: s.activeTemplateId ? { ... } : undefined,
    });
  });
  return unsub;
}, []);
```

### Sous-titres pro en temps réel

Le `renderSubtitlesPro` doit être appelé dans la boucle de rendering :

```typescript
// Dans la boucle requestAnimationFrame
const s = useEditorStore.getState();
if (s.subtitles.length > 0) {
  renderSubtitlesPro(ctx, s.subtitles as SubtitleSegmentPro[], s.subtitleFamily, time, w, h, {
    accentColor: theme.accent,
    fontTitle: theme.fontTitle,
    fontBody: theme.fontBody,
  });
}
```

### Performance

- Le canvas overlay dessine à 30fps max (throttle si nécessaire)
- Sur mobile, réduire la résolution du canvas (0.5x ou 0.75x du conteneur)
- Ne pas reconstruire le SceneGraph à chaque frame — seulement quand le store change
- Le `ctx.drawImage(video, ...)` est rapide (GPU accelerated)

---

## Deliverables

- [ ] Hook `useRealtimeCanvas(videoEl, canvasEl)` avec boucle rAF
- [ ] `<canvas>` overlay dans VideoPreview.tsx
- [ ] Le canvas dessine : vidéo + filtre + LUT + scene graph (overlays + sous-titres + effets)
- [ ] Les sous-titres pro (3 familles) sont visibles pendant la lecture
- [ ] Les templates sont visibles pendant la lecture
- [ ] Les LUTs s'appliquent en temps réel
- [ ] Les effets film (grain, vignette) sont visibles pendant la lecture
- [ ] Les styles "one tap" changent le rendering canvas (pas juste le CSS DOM)
- [ ] Le fix Whisper (apostrophes) est appliqué aux sous-titres affichés
- [ ] Performance acceptable sur iPhone 12 (pas de lag visible)
- [ ] TextOverlayLayer et SubtitlePreview gardés uniquement en mode `interactive`

## Fichiers

```
📄 NEW:
- lib/hooks/useRealtimeCanvas.ts (boucle rAF + rendering)

✏️ MODIFY:
- components/features/editor/VideoPreview.tsx (ajouter canvas, conditionner DOM overlays)
- lib/hooks/useCanvasPreview.ts (fusionner avec useRealtimeCanvas ou supprimer)

🔄 REFACTOR:
- Le rendering preview passe de DOM+CSS → Canvas+SceneGraph
```

## Definition of Done
- [ ] Ouvrir l'éditeur avec une vidéo
- [ ] Sélectionner un template → le template apparaît sur la vidéo PENDANT la lecture
- [ ] Changer la famille de sous-titres → le style change en temps réel
- [ ] Activer une LUT → le color grading s'applique immédiatement
- [ ] Les animations de texte sont fluides pendant la lecture
- [ ] L'export produit le même résultat que le preview
- [ ] Fonctionne sur Safari iOS (iPhone 12)
