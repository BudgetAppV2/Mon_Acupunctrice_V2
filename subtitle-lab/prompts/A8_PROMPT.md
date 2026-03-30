# A8 — Filtres fixes (CSS filter par clip, retirer LUT du preview)

## Contexte
Subtitle Lab a un bug connu : le WebGL LUT renderer noircit l'image dans le preview temps reel a cause d'une double conversion alpha lors du `drawImage` d'un canvas WebGL vers un canvas 2D. On corrige en utilisant uniquement les CSS filters pour le preview et en retirant `applyLut()` du RAF loop.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/SubtitleCanvas.tsx` → RAF loop. Lignes 130-140 : `applyLut()` appele apres le rendu 2D. Le canvas element recoit `style.filter` (CSS) du filtre actif.
- `subtitle-lab/lib/store.ts` → `filterId` est global. VideoClip a deja un champ `filterId`. `activeLutId`, `lutIntensity`.
- `subtitle-lab/lib/filters.ts` → 18 lignes. 10 CSS filter presets (normal, warm, cool, vintage, etc.).
- `subtitle-lab/lib/luts/presets.ts` → 6 LUT presets avec tint color.
- `subtitle-lab/components/FilterPanel.tsx` → Affiche les CSS filters + LUTs. Les LUT ont un thumbnailUrl tinted.

---

## Livrable 1 — Retirer applyLut() du RAF loop

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Supprimer le bloc qui applique la LUT dans la boucle RAF :
```typescript
// SUPPRIMER CES LIGNES :
if (lutIdRef.current) {
  const lutData = getLutData(lutIdRef.current);
  const ctx = canvas.getContext('2d');
  if (lutData && ctx) {
    applyLut(ctx, lutData, lutIdRef.current, CANVAS_W, CANVAS_H, lutIntensityRef.current);
  }
}
```

Aussi supprimer les imports de `applyLut` et `getLutData` dans ce fichier.

Le filtre CSS continue de s'appliquer via `style.filter` sur le canvas element — c'est le seul mecanisme de filtre pour le preview.

---

## Livrable 2 — Convertir les LUT presets en approximations CSS

**Fichier :** `subtitle-lab/lib/filters.ts`

Ajouter les 6 LUT presets comme approximations CSS filter a la suite des 10 existants :

```typescript
// LUT approximations CSS (pour le preview — le WebGL LUT reste pour l'export)
{ id: 'lut-warm-cinema', label: 'Cinema chaud', css: 'brightness(1.08) saturate(1.15) sepia(0.08)' },
{ id: 'lut-soft-wellness', label: 'Doux bien-etre', css: 'brightness(1.02) saturate(0.8) contrast(0.95)' },
{ id: 'lut-cold-teal', label: 'Teal froid', css: 'brightness(0.98) saturate(0.9) hue-rotate(15deg)' },
{ id: 'lut-vintage-film', label: 'Film vintage', css: 'sepia(0.2) contrast(1.05) brightness(0.95)' },
{ id: 'lut-bright-clean', label: 'Vif propre', css: 'brightness(1.08) saturate(1.2) contrast(1.05)' },
{ id: 'lut-golden-hour', label: 'Heure doree', css: 'brightness(1.1) saturate(1.1) sepia(0.12)' },
```

---

## Livrable 3 — Filtre par clip video

**Fichier :** `subtitle-lab/lib/store.ts`

Le champ `filterId` global reste mais n'est plus utilise directement par le preview.
Ajouter une action :
```typescript
setClipFilter: (clipId: string, filterId: string) => void;
```

Quand on change le filtre dans FilterPanel, si un clip est selectionne, le filtre s'applique au clip (`clip.filterId`). Sinon, au filtre global.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Le CSS filter applique sur le canvas element doit lire le `filterId` du clip actif (pas le global) :
```typescript
// Au lieu de : const activeFilter = FILTERS.find(f => f.id === filterId);
// Faire :
const activeClip = getActiveVideoClip(tracksRef.current, timeRef.current);
const clipFilterId = activeClip?.filterId ?? filterIdRef.current;
const activeFilter = FILTERS.find(f => f.id === clipFilterId);
```

---

## Livrable 4 — Fusionner CSS filters et LUT approximations dans FilterPanel

**Fichier :** `subtitle-lab/components/FilterPanel.tsx`

Retirer la section LUT separee. Afficher tous les filtres (10 CSS + 6 LUT approx) dans une seule grille horizontale. Meme UI que les filtres actuels (thumbnail + label).

Retirer les imports de `LUT_PRESETS` et le slider d'intensite LUT.

---

## Contraintes
- NE PAS supprimer `subtitle-lab/lib/luts/` (le WebGL renderer sera utilise a l'export en Phase B)
- NE PAS modifier le renderer.ts ou les animations de sous-titres
- NE PAS modifier TracksPanel ou TrackBlock
- Le CSS filter est le seul mecanisme de filtre dans le preview
- Chaque clip peut avoir un filtre different visible quand on scrub
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] `applyLut()` retire du RAF loop (plus de noircissement)
- [ ] 16 filtres disponibles (10 CSS + 6 LUT approximations)
- [ ] Chaque VideoClip a son `filterId` visible dans le preview
- [ ] Le filtre change quand on scrub entre des clips avec des filtres differents
- [ ] FilterPanel affiche une seule grille unifiee (plus de section LUT separee)
- [ ] Les fichiers `lib/luts/` sont preserves pour l'export futur
- [ ] `npm run build` passe dans `subtitle-lab/`
