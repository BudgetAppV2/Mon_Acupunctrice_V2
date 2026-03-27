# P2.4 — Undo/redo

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
L'editeur Zustand (`useEditorStore`) gere tout l'etat de l'editeur : trim, filtres,
overlays texte, sous-titres, theme, audio. Aucune action n'est reversible — si Judith
supprime un overlay ou change de filtre par erreur, elle doit tout refaire manuellement.
Ce prompt ajoute un systeme undo/redo avant l'arrivee des templates et de l'auto-silence
(Phase 3) qui modifieront le store de facon complexe.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/store/useEditorStore.ts` → 241 lignes. Store Zustand complet. Interface `EditorState` (lignes 40-118) avec tous les champs et actions. `create<EditorState>((set, get) => ({...}))`. Actions qui modifient l'etat : setTrim, setFilter, addOverlay, updateOverlay, removeOverlay, duplicateOverlay, setOverlays, setSubtitles, setSubtitleStyle, updateSubtitle, setActiveTheme, setAudioTrack, removeAudio, setAudioVolume, setVoiceVolume, setAudioFade, setAudioDucking (P2.3).
- `lib/types/editor.ts` → 63 lignes. `TextOverlayItem`, `SubtitleSegment`, `SubtitleStyle`, `VideoClip`.
- `components/features/editor/EditorView.tsx` → le composant principal de l'editeur (header + panels).
- `components/features/editor/VideoPreview.tsx` → 180 lignes. Utilise `useEditorStore` pour le playback. `setCurrentTime` et `seekTo` sont appeles tres frequemment (chaque frame).

---

## Livrable 1 — Middleware temporal Zustand

**Fichier a creer :** `lib/store/undoMiddleware.ts`

Implementer un middleware Zustand custom qui track les changements d'etat
avec un historique limite. On n'utilise PAS `zundo` (dependance externe) mais
un middleware custom simple.

**Principe :**
- Capturer un snapshot des champs "undoable" AVANT chaque action trackee
- Stocker dans un tableau `past[]` (max 30 entrees)
- `undo()` restaure le dernier snapshot et le deplace dans `future[]`
- `redo()` restaure le prochain snapshot depuis `future[]`
- Toute nouvelle action trackee vide `future[]`

**Champs a tracker (snapshot partiel) :**

```typescript
interface UndoableState {
  trimStart: number;
  trimEnd: number;
  filter: string;
  overlays: TextOverlayItem[];
  subtitles: SubtitleSegment[];
  subtitleStyle: SubtitleStyle;
  activeThemeId: string;
  audioUrl: string | null;
  audioName: string | null;
  audioVolume: number;
  voiceVolume: number;
  audioFadeIn: number;
  audioFadeOut: number;
  audioDucking: boolean;
}
```

**Champs a NE PAS tracker :**
- `currentTime`, `isPlaying` : changent a chaque frame (~30x/seconde)
- `selectedOverlayId`, `selectedSubtitleId` : selection UI, pas un changement d'etat
- `videoFile`, `videoUrl`, `duration`, `clips` : charges une fois, pas modifiables
- `thumbnailUrl`, `videoOrientation`, `editorSplitRatio` : meta UI
- `coverFrameOffset`, `coverDataUrl`, `coverCustomUrl` : cover
- `captions` : generes par IA, pas d'undo
- `itemId` : identifiant

```typescript
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';

const MAX_HISTORY = 30;

interface UndoableState {
  trimStart: number;
  trimEnd: number;
  filter: string;
  overlays: TextOverlayItem[];
  subtitles: SubtitleSegment[];
  subtitleStyle: SubtitleStyle;
  activeThemeId: string;
  audioUrl: string | null;
  audioName: string | null;
  audioVolume: number;
  voiceVolume: number;
  audioFadeIn: number;
  audioFadeOut: number;
  audioDucking: boolean;
}

const UNDOABLE_KEYS: (keyof UndoableState)[] = [
  'trimStart', 'trimEnd', 'filter', 'overlays', 'subtitles', 'subtitleStyle',
  'activeThemeId', 'audioUrl', 'audioName', 'audioVolume', 'voiceVolume',
  'audioFadeIn', 'audioFadeOut', 'audioDucking',
];

function extractUndoable(state: Record<string, unknown>): UndoableState {
  const result: Record<string, unknown> = {};
  for (const key of UNDOABLE_KEYS) result[key] = state[key];
  return result as UndoableState;
}

function statesEqual(a: UndoableState, b: UndoableState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface UndoRedoApi {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  /** Capturer un snapshot (appeler AVANT de modifier l'etat) */
  pushSnapshot: () => void;
  /** Reset l'historique */
  clearHistory: () => void;
}

let past: UndoableState[] = [];
let future: UndoableState[] = [];

export function createUndoRedoApi(
  getState: () => Record<string, unknown>,
  setState: (partial: Record<string, unknown>) => void,
): UndoRedoApi {
  return {
    pushSnapshot: () => {
      const snapshot = extractUndoable(getState());
      // Ne pas pousser de doublon
      if (past.length > 0 && statesEqual(past[past.length - 1], snapshot)) return;
      past.push(snapshot);
      if (past.length > MAX_HISTORY) past.shift();
      future = []; // Toute nouvelle action vide le redo
    },

    undo: () => {
      if (past.length === 0) return;
      const current = extractUndoable(getState());
      future.push(current);
      const previous = past.pop()!;
      setState(previous);
    },

    redo: () => {
      if (future.length === 0) return;
      const current = extractUndoable(getState());
      past.push(current);
      const next = future.pop()!;
      setState(next);
    },

    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,

    clearHistory: () => { past = []; future = []; },
  };
}
```

---

## Livrable 2 — Integrer le middleware dans useEditorStore

**Fichier :** `lib/store/useEditorStore.ts`

Creer l'API undo/redo et appeler `pushSnapshot()` avant chaque action trackee.

```typescript
import { createUndoRedoApi, type UndoRedoApi } from './undoMiddleware';

// Apres la creation du store
let _undoRedo: UndoRedoApi;

// Ajouter au store les actions undo/redo
interface EditorState {
  // ... champs existants ...
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

**Actions qui doivent appeler `pushSnapshot()` AVANT de modifier l'etat :**
- `setTrim` (ligne 163)
- `setFilter` (ligne 170)
- `addOverlay` (ligne 172)
- `updateOverlay` (ligne 177)
- `removeOverlay` (ligne 178)
- `duplicateOverlay` (ligne 179)
- `setOverlays` (ligne 171)
- `setSubtitles` (ligne 185)
- `setSubtitleStyle` (ligne 186)
- `updateSubtitle` (ligne 187)
- `setActiveTheme` (ligne 201)
- `setAudioTrack` (ligne 188)
- `removeAudio` (ligne 189)
- `setAudioVolume` (ligne 190) — ATTENTION : si trop frequents (slider drag), debouncer
- `setVoiceVolume` (ligne 191)
- `setAudioFade` (ligne 192)
- `setAudioDucking` (P2.3)

**IMPORTANT — Debouncing des sliders :**
Les actions de slider (`setAudioVolume`, `setVoiceVolume`, `setAudioFade`) sont
appelees a chaque mouvement du slider (~60x/s pendant le drag). Ne pas appeler
`pushSnapshot()` a chaque appel — seulement quand le slider est relache.

Approche : ne PAS tracker les actions de slider automatiquement. A la place,
appeler `pushSnapshot()` dans le composant UI au `onMouseDown`/`onTouchStart`
du slider (avant le debut du drag).

Alternative plus simple : tracker `setAudioVolume` etc. mais avec un debounce
dans `pushSnapshot()` qui ignore les snapshots identiques (deja gere par `statesEqual`).

**Implementation dans le store :**

```typescript
export const useEditorStore = create<EditorState>((set, get) => {
  // Creer l'API undo/redo
  const undoRedoApi = createUndoRedoApi(
    () => get() as unknown as Record<string, unknown>,
    (partial) => set(partial as Partial<EditorState>),
  );
  _undoRedo = undoRedoApi;

  // Helper pour wrapper une action avec pushSnapshot
  const tracked = <T extends unknown[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      undoRedoApi.pushSnapshot();
      fn(...args);
    };
  };

  return {
    // ... champs initiaux inchanges ...

    // Actions undo/redo
    undo: () => { undoRedoApi.undo(); set({ canUndo: undoRedoApi.canUndo(), canRedo: undoRedoApi.canRedo() }); },
    redo: () => { undoRedoApi.redo(); set({ canUndo: undoRedoApi.canUndo(), canRedo: undoRedoApi.canRedo() }); },
    canUndo: false,
    canRedo: false,

    // Wrapper les actions trackees
    setTrim: tracked((start, end) => {
      // ... logique existante ...
    }),
    setFilter: tracked((name) => {
      set({ filter: name }); markEditorTouched();
    }),
    addOverlay: tracked((text) => {
      // ... logique existante ...
    }),
    // ... etc pour chaque action trackee ...

    // Actions NON trackees (inchangees)
    setCurrentTime: (t) => set({ currentTime: t }),
    play: () => { /* ... */ },
    pause: () => { /* ... */ },
    seekTo: (t) => { /* ... */ },
    selectOverlay: (id) => set({ selectedOverlayId: id }),
    selectSubtitle: (id) => set({ selectedSubtitleId: id }),
    // ...

    // Mettre a jour canUndo/canRedo apres chaque action trackee
    // Le `tracked` wrapper le fait automatiquement
  };
});
```

**IMPORTANT :** Apres chaque `pushSnapshot` + modification, mettre a jour `canUndo`/`canRedo` :

```typescript
const tracked = <T extends unknown[]>(fn: (...args: T) => void) => {
  return (...args: T) => {
    undoRedoApi.pushSnapshot();
    fn(...args);
    set({ canUndo: undoRedoApi.canUndo(), canRedo: undoRedoApi.canRedo() });
  };
};
```

Ajouter `canUndo: false, canRedo: false` a l'etat initial et au `reset()`.
Dans `reset()`, appeler aussi `undoRedoApi.clearHistory()`.

---

## Livrable 3 — Boutons undo/redo dans le header de l'editeur

**Fichier :** le composant header de l'editeur (a identifier dans EditorView.tsx)

Ajouter deux boutons dans le header de l'editeur :

```tsx
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

const { undo, redo, canUndo, canRedo } = useEditorStore();

<div className="flex items-center gap-1">
  <button
    onClick={undo}
    disabled={!canUndo}
    className={`p-1.5 rounded ${canUndo ? 'text-white' : 'text-gray-600'}`}
  >
    <ArrowUturnLeftIcon className="w-5 h-5" />
  </button>
  <button
    onClick={redo}
    disabled={!canRedo}
    className={`p-1.5 rounded ${canRedo ? 'text-white' : 'text-gray-600'}`}
  >
    <ArrowUturnRightIcon className="w-5 h-5" />
  </button>
</div>
```

Les boutons sont grises quand inactifs (pas de snapshots dans l'historique).

---

## Livrable 4 — Raccourcis clavier (desktop)

**Fichier :** le composant principal de l'editeur (EditorView.tsx ou similaire)

Ajouter un listener `keydown` pour Ctrl+Z (undo) et Ctrl+Shift+Z (redo) :

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        useEditorStore.getState().redo();
      } else {
        useEditorStore.getState().undo();
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

Les raccourcis ne fonctionnent que quand l'editeur est actif (pas dans un input texte).
Ajouter une verification : `if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;`

---

## Contraintes
- NE PAS installer zundo ou une autre dependance externe
- NE PAS tracker `currentTime`, `isPlaying`, `selectedOverlayId`, `selectedSubtitleId`
- NE PAS tracker `seekTo`, `play`, `pause`, `togglePlayPause`, `setCurrentTime`
- NE PAS tracker `setVideoFile`, `loadVideo`, `setDuration`
- NE PAS tracker `setCaptions`, `updateCaption`
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les Cloud Functions ou les routes API
- Limite de 30 etats dans l'historique (pas plus, pour la memoire)
- Les snapshots doivent etre des copies profondes (pas de references partagees)
- Le `pushSnapshot` utilise `JSON.stringify` pour la comparaison — les overlays et subtitles sont serialisables
- Les raccourcis clavier ne doivent pas interferer avec les inputs texte
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `undoMiddleware.ts` cree avec `pushSnapshot`, `undo`, `redo`, `canUndo`, `canRedo`, `clearHistory`
- [ ] Historique limite a 30 snapshots
- [ ] Les snapshots identiques consecutifs ne sont pas empiles
- [ ] `useEditorStore` wrappe les actions trackees avec `pushSnapshot`
- [ ] `setTrim`, `setFilter`, `addOverlay`, `updateOverlay`, `removeOverlay`, `duplicateOverlay` sont trackes
- [ ] `setSubtitles`, `setSubtitleStyle`, `updateSubtitle`, `setActiveTheme` sont trackes
- [ ] `setAudioTrack`, `removeAudio` sont trackes
- [ ] `setCurrentTime`, `seekTo`, `play`, `pause` ne sont PAS trackes
- [ ] Boutons undo/redo dans le header de l'editeur avec ArrowUturnLeftIcon/ArrowUturnRightIcon
- [ ] Boutons grises quand inactifs
- [ ] Ctrl+Z = undo, Ctrl+Shift+Z = redo (desktop)
- [ ] Les raccourcis clavier n'interferent pas avec les inputs texte
- [ ] Le reset() vide l'historique
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `components/features/editor/EditorView.tsx` (ou le composant principal editeur)
- `components/features/editor/VideoPreview.tsx`
- `lib/store/undoMiddleware.ts` (fichier cree dans ce prompt)
