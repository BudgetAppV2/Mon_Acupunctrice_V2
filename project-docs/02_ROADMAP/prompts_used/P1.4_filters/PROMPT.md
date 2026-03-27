# P1.4 — Filtres enrichis (10 presets CSS + lien theme)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P0.2, les filtres sont unifies dans `FILTERS_V2` (10 presets CSS) et
`FilterPanel` les affiche deja correctement. Ce prompt s'assure que :
1. Le lien theme → filtre fonctionne dans l'UI (quand le theme change, le filtre s'applique)
2. Le FilterPanel affiche un indicateur "defaut du theme" sur le filtre associe
3. L'experience est fluide et retrocompatible

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS.

## Fichiers a lire AVANT de commencer
- `lib/data/designKnowledge.ts` → 339 lignes. `FILTERS_V2` (ligne 263-274) : 10 presets CSS. `FilterPreset` interface (ligne 257-261).
- `lib/data/videoThemes.ts` → 173 lignes. Chaque `VideoTheme` a `filterId: string` (ex: 'warm', 'normal', 'high_contrast'). `getThemeFilter(theme)` retourne le `FilterPreset`.
- `lib/utils/filters.ts` → 3 lignes. Re-exporte `FILTERS_V2 as FILTERS`.
- `components/features/editor/panels/FilterPanel.tsx` → 51 lignes. Affiche les filtres en scroll horizontal avec miniature 44x60px. Importe `FILTERS` depuis `filters.ts`.
- `lib/store/useEditorStore.ts` → 242 lignes. `setActiveTheme(id)` (ligne ~201) applique deja `filter: themeFilter.id` quand le theme change. `setFilter(name)` (ligne 170) set le filtre manuellement.
- `components/features/editor/VideoPreview.tsx` → 181 lignes. Applique le filtre CSS au `<video>` (ligne 149-150).

---

## Livrable 1 — Indicateur "defaut du theme" dans FilterPanel

**Fichier :** `components/features/editor/panels/FilterPanel.tsx`

Le FilterPanel fonctionne deja avec les 10 filtres V2 (grace au re-export P0.2).
Ajouter un indicateur visuel sur le filtre qui correspond au theme actif.

```typescript
'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';
import { getTheme, getThemeFilter } from '@/lib/data/videoThemes';

export default function FilterPanel() {
  const { filter, setFilter, thumbnailUrl, activeThemeId } = useEditorStore();
  const themeFilterId = getThemeFilter(getTheme(activeThemeId)).id;

  return (
    <div className="px-3 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex flex-col items-center gap-1 shrink-0 transition ${
              filter === f.id ? 'opacity-100' : 'opacity-70 hover:opacity-90'
            }`}
          >
            <div className={`w-11 h-[60px] rounded-lg overflow-hidden relative ${
              filter === f.id ? 'ring-2 ring-sage' : ''
            }`}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={f.label}
                  className="w-full h-full object-cover"
                  style={f.css !== 'none' ? { filter: f.css } : undefined}
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(to bottom, #4a90d9, #f5a623)',
                    ...(f.css !== 'none' ? { filter: f.css } : {}),
                  }}
                />
              )}
              {/* Point indicateur si c'est le filtre du theme */}
              {f.id === themeFilterId && f.id !== 'normal' && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sage" />
              )}
            </div>
            <span className={`text-[9px] font-medium w-11 text-center truncate ${
              filter === f.id ? 'text-sage' : 'text-gray-400'
            }`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Livrable 2 — Verifier le flow theme → filtre

Le flow existe deja depuis P0.1 :
1. `setActiveTheme(id)` appelle `getThemeFilter(theme)` et set `filter: themeFilter.id`
2. `VideoPreview` lit `filter` du store et applique le CSS
3. `exportWebCodecs` recoit `filterCss` et applique via `ctx.filter`

Verifier que ce flow fonctionne correctement avec les 10 filtres V2.
Si le theme a `filterId: 'warm'`, le store doit avoir `filter: 'warm'` et
`FILTERS_V2.find(f => f.id === 'warm')` doit retourner le bon preset.

**Test :** Verifier que tous les `filterId` dans les 8 themes de `videoThemes.ts`
correspondent a un ID existant dans `FILTERS_V2`. Lister :
- sage_zen → warm ✓
- minimal_chic → normal ✓
- terre_warm → warm ✓
- bold_energy → high_contrast ✓
- ocean_doux → soft ✓
- pantone_2026 → normal ✓
- raw_authentic → normal ✓
- dark_clinic → dramatic ✓

Si un ID ne matche pas, corriger dans `videoThemes.ts`.

---

## Contraintes
- NE PAS modifier le store Zustand (le lien theme→filtre existe deja)
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les Cloud Functions
- NE PAS ajouter de nouveaux filtres (les 10 de FILTERS_V2 suffisent)
- Le filtre reste modifiable manuellement apres application du theme
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] FilterPanel affiche un point sage sur le filtre du theme actif
- [ ] Les 10 filtres V2 s'affichent correctement avec miniature
- [ ] Le changement de theme applique le bon filtre
- [ ] Le filtre reste modifiable manuellement apres le theme
- [ ] Tous les `filterId` dans videoThemes.ts existent dans FILTERS_V2
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/designKnowledge.ts`
- `lib/data/videoThemes.ts`
- `lib/utils/filters.ts`
- `components/features/editor/panels/FilterPanel.tsx`
- `lib/store/useEditorStore.ts`
- `components/features/editor/VideoPreview.tsx`
