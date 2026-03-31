# FIX-6 — Viewport, filtres, text overlay draggable

## Contexte
Testing iPhone. 4 bugs : viewport zoom, filtres ne s'appliquent pas,
pas de slider d'intensite, text overlay pas draggable.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/app/layout.tsx` → pas de meta viewport !
- `subtitle-lab/components/FilterPanel.tsx` → handleFilterSelect, slider intensite
- `subtitle-lab/components/SubtitleCanvas.tsx` → ctx.filter, filterIdRef, RAF loop
- `subtitle-lab/lib/store.ts` → setFilter, setClipFilter, filterId
- `subtitle-lab/lib/useSubtitleDrag.ts` → drag position des sous-titres
- `subtitle-lab/components/TextPanel.tsx` → text overlays
- `subtitle-lab/lib/types.ts` → TextOverlay, StylePreset

---

## Fix 1 — Meta viewport manquant (zoom iPhone)

**Probleme :** L'app ne s'ajuste pas a la fenetre de l'iPhone, l'utilisateur
est zoome dedans. Il n'y a aucune meta viewport dans layout.tsx.

**Fichier :** `subtitle-lab/app/layout.tsx`

Ajouter la meta viewport dans le `<head>` :
```tsx
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
```

`maximum-scale=1, user-scalable=no` empeche le pinch-to-zoom accidentel.
`viewport-fit=cover` gere le notch et la Dynamic Island de l'iPhone.

---

## Fix 2 — Les filtres ne s'appliquent pas

**Probleme :** Quand on selectionne un filtre, il ne s'applique pas sur
la video. Le ring vert apparait (selection visuelle OK) mais l'image
ne change pas.

**Cause :** Dans SubtitleCanvas RAF loop (ligne ~141), le filtre est lu
depuis `ar.clip.filterId` — le filterId du VideoClip. Mais `handleFilterSelect`
dans FilterPanel fait `setFilter(id)` qui met a jour le `filterId` GLOBAL
du store. Le `clip.filterId` reste 'normal' parce que `setClipFilter` n'est
appele que si `selectedItemId` est set (un clip selectionne dans le sheet Tracks).

Quand l'utilisateur est dans le sheet Filtres sans avoir selectionne un clip
dans Tracks, aucun clip n'est selectionne → `setClipFilter` n'est pas appele
→ le clip garde `filterId: 'normal'` → le filtre ne s'applique pas.

**Fix :** Dans FilterPanel, toujours appliquer le filtre au clip ACTIF
(le clip visible dans le preview), pas seulement au clip selectionne :

**Fichier :** `subtitle-lab/components/FilterPanel.tsx`

```typescript
const handleFilterSelect = (id: string) => {
  // Toujours appliquer au clip actif (celui visible dans le preview)
  const activeClip = getActiveVideoClip(tracks, currentTime);
  if (activeClip) {
    setClipFilter(activeClip.id, id);
  }
  // Aussi mettre a jour le filtre global (fallback)
  setFilter(id);
};
```

**Aussi** dans SubtitleCanvas RAF loop, utiliser le filterId GLOBAL comme
fallback si le clip n'a pas de filtre specifique :
```typescript
// Ligne ~141 — AVANT :
const cFid = ar.clip.filterId ?? filterIdRef.current;
// APRES (traiter 'normal' comme "pas de filtre specifique") :
const cFid = (ar.clip.filterId && ar.clip.filterId !== 'normal')
  ? ar.clip.filterId : filterIdRef.current;
```

---

## Fix 3 — Slider d'intensite pas visible

**Probleme :** Le slider d'intensite ne s'affiche pas ou est difficile
a voir. Il est conditionnel a `activeFilterId !== 'normal'`.

**Cause possible :** `activeFilterId` est calcule depuis `activeClip?.filterId`
qui vaut toujours 'normal' (bug #2). Apres le fix #2, le slider devrait
apparaitre. Verifier que c'est bien le cas.

Si le slider est bien la mais pas reactif, verifier que `filterIntensity`
dans le store est bien pris en compte dans le RAF loop :
```typescript
// Dans le RAF loop :
if (ff?.css !== 'none' && filterIntensityRef.current > 0) {
  ctx.filter = ff!.css;
}
```
Quand `filterIntensity` est 0, le filtre n'est pas applique.
Quand `filterIntensity` est entre 0 et 1, le filtre est applique a 100%
(pas d'interpolation pour V1 — le slider sert a on/off avec un seuil).

---

## Fix 4 — Text overlay draggable sur le canvas

**Probleme :** Les sous-titres sont draggables sur le canvas (via
useSubtitleDrag), mais les text overlays ne le sont pas. L'utilisateur
devrait pouvoir dragger un text overlay pour le repositionner.

**Fix :** Quand un text overlay est selectionne (selectedOverlayId),
le drag sur le canvas doit deplacer la position de CE text overlay
au lieu de la position globale des sous-titres.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Modifier la logique de drag pour supporter les text overlays :

```typescript
// AVANT :
const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(globalPreset.position);

// APRES :
// Si un text overlay est selectionne, dragger l'overlay
// Sinon, dragger les sous-titres
const { selectedOverlayId, textOverlays } = useSubtitleStore();
const selectedOverlay = textOverlays.find(o => o.id === selectedOverlayId);
const dragPosition = selectedOverlay ? selectedOverlay.style.position : globalPreset.position;
const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(dragPosition);
```

**Fichier :** `subtitle-lab/lib/useSubtitleDrag.ts`

Modifier onMove pour mettre a jour la bonne cible (overlay ou sous-titres) :

```typescript
// Ajouter un parametre optionnel pour cibler un overlay
export function useSubtitleDrag(
  position: StylePreset['position'],
  overlayId?: string | null, // si set, dragger l'overlay au lieu des sous-titres
) {
  // ... existant ...
  const onMove = useCallback((e, canvas) => {
    if (!isDragging || !dragStartRef.current || !posStartRef.current) return;
    const cur = getRelPos(e, canvas);
    const newPos = {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + (cur.x - dragStartRef.current.x))),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + (cur.y - dragStartRef.current.y))),
    };
    if (overlayId) {
      // Dragger le text overlay
      const overlay = useSubtitleStore.getState().textOverlays.find(o => o.id === overlayId);
      if (overlay) {
        useSubtitleStore.getState().updateTextOverlay(overlayId, {
          style: { ...overlay.style, position: newPos },
        });
      }
    } else {
      // Dragger les sous-titres (comportement existant)
      useSubtitleStore.getState().updateGlobalField('position', newPos);
    }
  }, [isDragging, overlayId]);
```

Dans SubtitleCanvas, passer le selectedOverlayId :
```typescript
const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(
  dragPosition,
  selectedOverlayId, // null = dragger sous-titres, string = dragger overlay
);
```

---

## Contraintes
- NE PAS modifier le renderer.ts
- NE PAS modifier les presets ou animations
- Le drag des sous-titres continue de fonctionner quand aucun overlay n'est selectionne
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] La page s'ajuste a la fenetre iPhone (pas de zoom)
- [ ] Selectionner un filtre change visuellement la video dans le preview
- [ ] Le slider d'intensite apparait quand un filtre est selectionne
- [ ] Les text overlays sont draggables sur le canvas quand selectionnes
- [ ] Les sous-titres restent draggables quand aucun overlay n'est selectionne
- [ ] `npm run build` passe
