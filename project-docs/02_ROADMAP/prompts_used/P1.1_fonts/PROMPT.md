# P1.1 — Fonts (15) + selecteur categorise

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P0, le catalogue de fonts est unifie dans `designKnowledge.ts` (15 fonts, 5 categories)
et `fontLoader.ts` re-exporte depuis cette source. Le `FontSelector` actuel utilise deja
ce catalogue mais affiche un `<select>` natif peu ergonomique. Ce prompt ameliore le
selecteur de fonts dans TextPanel pour une experience visuelle avec preview des fonts.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS.

## Fichiers a lire AVANT de commencer
- `lib/data/designKnowledge.ts` → 339 lignes. `FONTS` (15 fonts, ligne 68-93), `FONT_CATEGORIES` (5 categories, ligne 95-101), `FONT_PAIRINGS` (ligne 104-111).
- `lib/utils/fontLoader.ts` → 35 lignes. `FONT_CATEGORIES` (Record par categorie), `CATEGORY_LABELS`, `loadFont(family)` (charge Google Font dynamiquement).
- `components/features/editor/text/FontSelector.tsx` → 32 lignes. `<select>` natif organise par `<optgroup>`. Importe depuis `fontLoader.ts`.
- `components/features/editor/panels/TextEditView.tsx` → 65 lignes. Utilise `FontSelector` ligne 43. Passe `value` et `onChange`.
- `components/features/editor/panels/TextPanel.tsx` → 75 lignes. Vue liste + narration. Cree les overlays avec `fontFamily: 'Inter'` (ligne 23).

---

## Livrable 1 — Refaire FontSelector avec preview visuelle

**Fichier :** `components/features/editor/text/FontSelector.tsx`

Remplacer le `<select>` natif par un selecteur visuel avec :
- Tabs horizontaux pour les 5 categories (Impact, Elegant, Moderne, Cursif, Fun)
- Grille de boutons pour chaque font avec le nom affiche dans la font elle-meme
- Charger la font au survol/tap (appel `loadFont(family)` pour le preview)
- La font selectionnee a un ring sage

```typescript
'use client';

import { useState, useEffect } from 'react';
import { loadFont, FONT_CATEGORIES, CATEGORY_LABELS } from '@/lib/utils/fontLoader';

interface Props {
  value: string;
  onChange: (family: string) => void;
}

const CATS = Object.keys(FONT_CATEGORIES);

export default function FontSelector({ value, onChange }: Props) {
  const [activeCat, setActiveCat] = useState(() => {
    // Trouver la categorie de la font actuelle
    for (const [cat, fonts] of Object.entries(FONT_CATEGORIES)) {
      if (fonts.includes(value)) return cat;
    }
    return CATS[0];
  });

  const fonts = FONT_CATEGORIES[activeCat] ?? [];

  // Precharger les fonts de la categorie active
  useEffect(() => { fonts.forEach(f => loadFont(f)); }, [activeCat]);

  const handleSelect = (family: string) => {
    loadFont(family);
    onChange(family);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">Police</label>
      {/* Tabs categories */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
              activeCat === cat ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>
      {/* Grille fonts */}
      <div className="grid grid-cols-2 gap-1">
        {fonts.map(f => (
          <button
            key={f}
            onClick={() => handleSelect(f)}
            className={`px-2 py-1.5 rounded text-sm text-left truncate transition ${
              value === f ? 'bg-sage/20 ring-1 ring-sage text-white' : 'bg-gray-800 text-gray-300'
            }`}
            style={{ fontFamily: `"${f}", sans-serif` }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Livrable 2 — Font par defaut basee sur le theme actif

**Fichier :** `components/features/editor/panels/TextPanel.tsx`

Quand un overlay est cree (ligne 23 et `addOverlay` dans le store), la font par defaut
devrait etre celle du theme actif (`fontTitle`).

**Fichier :** `lib/store/useEditorStore.ts`

Modifier `addOverlay` (ligne ~171) pour utiliser la font du theme actif :

```typescript
addOverlay: (text) => {
  const id = crypto.randomUUID();
  const { duration, activeThemeId } = get();
  // Utiliser la font du theme actif
  const theme = getTheme(activeThemeId);
  set({
    overlays: [...get().overlays, {
      id, text: text || 'Texte', fontFamily: theme.fontTitle, fontSize: 32,
      fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0, endTime: duration || 10,
      style: 'classic' as const, animation: 'none' as const,
    }],
    selectedOverlayId: id,
  });
  markEditorTouched();
},
```

Importer `getTheme` est deja fait (P0.1).

Faire la meme chose dans `handleNarration` de TextPanel (ligne 23) : lire `activeThemeId` du store et utiliser `getTheme(activeThemeId).fontTitle`.

---

## Contraintes
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les filtres ou le store (sauf addOverlay)
- NE PAS ajouter de nouvelles fonts au catalogue (les 15 de designKnowledge suffisent)
- NE PAS modifier les Cloud Functions
- Precharger les fonts par categorie (pas toutes d'un coup)
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] FontSelector affiche 5 tabs de categories avec preview visuelle des fonts
- [ ] Chaque font est affichee dans sa propre police
- [ ] Les fonts sont chargees dynamiquement au changement de categorie
- [ ] La font selectionnee a un indicateur visuel (ring sage)
- [ ] `addOverlay` utilise la font du theme actif comme defaut
- [ ] Narration utilise la font du theme actif comme defaut
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/designKnowledge.ts`
- `lib/utils/fontLoader.ts`
- `components/features/editor/text/FontSelector.tsx`
- `components/features/editor/panels/TextEditView.tsx`
- `components/features/editor/panels/TextPanel.tsx`
- `lib/store/useEditorStore.ts`
- `lib/data/videoThemes.ts`
