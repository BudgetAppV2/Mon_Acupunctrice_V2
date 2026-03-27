# P1.5 — Systeme de Themes UI (ThemeSelector)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Le store a `activeThemeId` et `setActiveTheme(id)` depuis P0.1. Les 8 themes sont
definis dans `videoThemes.ts`. Ce prompt cree le widget ThemeSelector qui permet a
Judith de choisir un theme en 1 tap — le theme applique font + filtre + style sous-titres.

**Prerequis :** P1.1-P1.4 sont completes (fonts, sous-titres pro, effets texte, filtres).

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS.

## Fichiers a lire AVANT de commencer
- `lib/data/videoThemes.ts` → 173 lignes. `VIDEO_THEMES` (8 themes), `VideoTheme` interface (lignes 14-36) avec fontTitle, fontSubtitle, subtitleStyle, paletteId, filterId, defaultAnimation, defaultTextEffect.
- `lib/data/designKnowledge.ts` → 339 lignes. `PALETTES` (7 palettes, ligne 126-183). Chaque palette a text, accent, background, stroke.
- `lib/store/useEditorStore.ts` → ~244 lignes. `activeThemeId` (ligne 50), `setActiveTheme(id)` (ligne ~201) — set activeThemeId + filter.
- `components/features/editor/EditorToolbar.tsx` → 39 lignes. TABS array (ligne 3-10) : trim, filtres, texte, subs, audio, cover.
- `components/features/editor/EditorLayout.tsx` → 159 lignes. Tab switching (ligne 139-147). `activeTab` state.
- `components/features/editor/panels/FilterPanel.tsx` → ~52 lignes. Panel filtres existant.

---

## Livrable 1 — Composant ThemeSelector

**Nouveau fichier :** `components/features/editor/panels/ThemePanel.tsx`

Scroll horizontal de cartes miniatures representant chaque theme. Chaque carte montre :
- Nom du theme
- Mini palette (3 cercles de couleur : text, accent, stroke)
- Nom de la font titre (affiche dans la font elle-meme)
- Indicateur si le theme est actif (ring sage)

```typescript
'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { VIDEO_THEMES, getThemePalette } from '@/lib/data/videoThemes';
import { loadFont } from '@/lib/utils/fontLoader';

export default function ThemePanel() {
  const { activeThemeId, setActiveTheme, setSubtitleStyle } = useEditorStore();

  const handleSelect = (themeId: string) => {
    const theme = VIDEO_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    // Charger les fonts du theme
    loadFont(theme.fontTitle);
    loadFont(theme.fontSubtitle);
    // Appliquer le theme (setActiveTheme gere deja le filtre)
    setActiveTheme(themeId);
    // Appliquer le style de sous-titres du theme
    setSubtitleStyle(theme.subtitleStyle);
  };

  return (
    <div className="px-3 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {VIDEO_THEMES.map(theme => {
          const palette = getThemePalette(theme);
          const isActive = activeThemeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 p-2 rounded-lg transition ${
                isActive ? 'bg-sage/20 ring-1 ring-sage' : 'bg-gray-800'
              }`}
              style={{ width: 80 }}
            >
              {/* Mini palette */}
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.accent }} />
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.text }} />
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.stroke }} />
              </div>
              {/* Nom de la font en preview */}
              <span
                className="text-[10px] text-gray-300 truncate w-full text-center"
                style={{ fontFamily: `"${theme.fontTitle}", sans-serif` }}
              >
                {theme.fontTitle.split(' ')[0]}
              </span>
              {/* Nom du theme */}
              <span className={`text-[9px] font-medium truncate w-full text-center ${
                isActive ? 'text-sage' : 'text-gray-500'
              }`}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Livrable 2 — Ajouter l'onglet "Style" dans l'editeur

**Fichier :** `components/features/editor/EditorToolbar.tsx`

Ajouter un onglet "Style" en premiere position (avant Trim) :

```typescript
const TABS: { id: string; label: string }[] = [
  { id: 'style', label: 'Style' },
  { id: 'trim', label: 'Trim' },
  { id: 'filtres', label: 'Filtres' },
  { id: 'texte', label: 'Texte' },
  { id: 'subs', label: 'Sous-titres' },
  { id: 'audio', label: 'Audio' },
  { id: 'cover', label: 'Cover' },
];
```

**Fichier :** `components/features/editor/EditorLayout.tsx`

Ajouter le rendu du ThemePanel dans le switch de tabs :

```typescript
import ThemePanel from './panels/ThemePanel';
// ...
{activeTab === 'style' && <ThemePanel />}
{activeTab === 'trim' && <TrimPanel />}
// ...
```

Changer le tab par defaut de `'trim'` a `'style'` (ligne 37) :
```typescript
const [activeTab, setActiveTab] = useState('style');
```

---

## Livrable 3 — setActiveTheme applique TOUS les reglages du theme

**Fichier :** `lib/store/useEditorStore.ts`

Le `setActiveTheme` actuel (P0.1) ne set que `activeThemeId` et `filter`. Etendre pour
appliquer aussi le style de sous-titres :

```typescript
setActiveTheme: (id) => {
  const theme = getTheme(id);
  const themeFilter = getThemeFilter(theme);
  set({
    activeThemeId: id,
    filter: themeFilter.id,
    subtitleStyle: theme.subtitleStyle as SubtitleStyle,
  });
},
```

**Note :** La font et l'effet texte ne sont PAS appliques globalement aux overlays existants.
Seuls les NOUVEAUX overlays utiliseront la font/effet du theme (via `addOverlay`).
Le filtre et le style de sous-titres s'appliquent globalement car ils sont uniques.

---

## Livrable 4 — Precharger les fonts du theme actif

**Fichier :** `components/features/editor/panels/ThemePanel.tsx`

Precharger les fonts de TOUS les themes au montage du panel pour que les noms
s'affichent dans leur propre font. Utiliser un `useEffect` :

```typescript
import { useEffect } from 'react';
// ...
useEffect(() => {
  VIDEO_THEMES.forEach(t => {
    loadFont(t.fontTitle);
    loadFont(t.fontSubtitle);
  });
}, []);
```

---

## Contraintes
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les Cloud Functions
- NE PAS creer plus de 8 themes (les 8 de videoThemes.ts suffisent)
- Le theme ne modifie PAS les overlays texte existants (seulement les nouveaux)
- Le filtre et les sous-titres changent globalement quand le theme change
- Les options individuelles (font, filtre, effet) restent modifiables apres le theme
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] ThemePanel affiche les 8 themes en scroll horizontal avec palette + font preview
- [ ] Tap sur un theme applique filtre + subtitleStyle
- [ ] L'onglet "Style" est en premiere position dans la toolbar
- [ ] Le theme actif a un indicateur visuel (ring sage)
- [ ] Les fonts des themes sont prechargees au montage du panel
- [ ] Le filtre et les sous-titres restent modifiables manuellement apres
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/videoThemes.ts`
- `lib/data/designKnowledge.ts`
- `lib/store/useEditorStore.ts`
- `lib/utils/fontLoader.ts`
- `components/features/editor/EditorToolbar.tsx`
- `components/features/editor/EditorLayout.tsx`
- `components/features/editor/panels/FilterPanel.tsx`
