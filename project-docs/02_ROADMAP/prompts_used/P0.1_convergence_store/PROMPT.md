# P0.1 — Convergence store + types pour les themes video

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Un systeme de themes video (VideoTheme) a ete cree dans `lib/data/videoThemes.ts`
et `lib/data/designKnowledge.ts` mais il n'est PAS encore connecte au store Zustand
ni persiste dans Firestore. Ce prompt ajoute le lien manquant.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Firebase Firestore.

## Fichiers a lire AVANT de commencer
- `lib/store/useEditorStore.ts` → 238 lignes, store Zustand complet. Pas de `activeTheme`.
- `lib/types/editor.ts` → 64 lignes, types V1. `SubtitleStyle` a 3 valeurs seulement.
- `lib/hooks/useEditorPersistence.ts` → 70 lignes, serialise editorData. Pas de `activeThemeId`.
- `lib/data/videoThemes.ts` → 173 lignes, `VIDEO_THEMES[]`, `getTheme()`, `getThemePalette()`, `getThemeFilter()`.
- `lib/data/designKnowledge.ts` → 339 lignes, `SubtitleStyleV2` (6 valeurs), `TextEffectType`, `TextAnimationType`, `FILTERS_V2`.
- `components/features/editor/EditorLayout.tsx` → restauration editorData au chargement.

---

## Livrable 1 — Ajouter activeThemeId au store

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter a l'interface `EditorState` :
```typescript
activeThemeId: string;
```

Ajouter l'action :
```typescript
setActiveTheme: (id: string) => void;
```

Valeur par defaut : `'sage_zen'` (premier theme dans VIDEO_THEMES).

Implementation de `setActiveTheme` :
```typescript
setActiveTheme: (id) => {
  // Quand le theme change, appliquer le filtre du theme
  const theme = getTheme(id);
  const themeFilter = getThemeFilter(theme);
  set({ activeThemeId: id, filter: themeFilter.id });
},
```

Importer `getTheme` et `getThemeFilter` depuis `lib/data/videoThemes.ts`.

Ajouter `activeThemeId: 'sage_zen'` dans la valeur initiale du store.
Ajouter `activeThemeId: 'sage_zen'` dans `reset()`.

---

## Livrable 2 — Etendre SubtitleStyle vers V2

**Fichier :** `lib/types/editor.ts`

Le type `SubtitleStyle` actuel a 3 valeurs :
```typescript
export type SubtitleStyle = 'classic' | 'tiktok' | 'karaoke';
```

Etendre pour inclure les 6 valeurs V2 (alignees avec `designKnowledge.ts`) :
```typescript
export type SubtitleStyle = 'classic' | 'tiktok' | 'karaoke' | 'bold_outline' | 'pill' | 'karaoke_pro';
```

Le store (`subtitleStyle: SubtitleStyle`) et `drawSubtitles.ts` utilisent ce type.
Les 3 nouvelles valeurs ne sont pas encore geres dans `drawSubtitles.ts` — c'est
attendu (elles seront implementees dans P1.2). Pour l'instant, les 3 nouvelles
valeurs fallback sur 'classic' dans drawSubtitles.

---

## Livrable 3 — Persister activeThemeId

**Fichier :** `lib/hooks/useEditorPersistence.ts`

Ajouter `activeThemeId: state.activeThemeId` dans l'objet `editorData` serialise (ligne ~19).

---

## Livrable 4 — Restaurer activeThemeId au chargement

**Fichier :** `components/features/editor/EditorLayout.tsx`

Dans le bloc `if (data.editorData && !cancelled)` (ligne ~84), ajouter :
```typescript
if (ed.activeThemeId) s.setActiveTheme(ed.activeThemeId);
```

Si `ed.activeThemeId` n'existe pas (ancien item), le store garde le defaut `'sage_zen'`.

---

## Contraintes
- NE PAS modifier les composants UI (pas de nouveau panel theme dans ce prompt)
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les filtres (FILTERS vs FILTERS_V2 — c'est P0.2)
- NE PAS modifier fontLoader.ts
- NE PAS modifier les Cloud Functions
- Le theme par defaut est 'sage_zen' (jamais null)
- Retrocompatible : les items sans activeThemeId fonctionnent (defaut sage_zen)
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `activeThemeId: string` existe dans le store avec defaut 'sage_zen'
- [ ] `setActiveTheme(id)` change le theme ET applique le filtre du theme
- [ ] `SubtitleStyle` a 6 valeurs dans editor.ts
- [ ] `activeThemeId` est serialise dans editorData (persistence)
- [ ] `activeThemeId` est restaure au chargement de l'editeur
- [ ] Les items anciens sans theme fonctionnent (defaut sage_zen)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/hooks/useEditorPersistence.ts`
- `lib/data/videoThemes.ts`
- `lib/data/designKnowledge.ts`
- `components/features/editor/EditorLayout.tsx`
