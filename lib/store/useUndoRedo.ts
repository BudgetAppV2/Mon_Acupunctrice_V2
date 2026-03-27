import { create } from 'zustand';
import { useEditorStore } from './useEditorStore';

/** Champs trackes pour undo/redo — snapshot leger */
interface Snapshot {
  overlays: ReturnType<typeof useEditorStore.getState>['overlays'];
  subtitles: ReturnType<typeof useEditorStore.getState>['subtitles'];
  subtitleStyle: string;
  filter: string;
  trimStart: number;
  trimEnd: number;
  activeThemeId: string;
}

function takeSnapshot(): Snapshot {
  const s = useEditorStore.getState();
  return {
    overlays: structuredClone(s.overlays),
    subtitles: structuredClone(s.subtitles),
    subtitleStyle: s.subtitleStyle,
    filter: s.filter,
    trimStart: s.trimStart,
    trimEnd: s.trimEnd,
    activeThemeId: s.activeThemeId,
  };
}

function applySnapshot(snap: Snapshot) {
  const s = useEditorStore.getState();
  s.setOverlays(snap.overlays);
  s.setSubtitles(snap.subtitles);
  s.setSubtitleStyle(snap.subtitleStyle as Parameters<typeof s.setSubtitleStyle>[0]);
  s.setFilter(snap.filter);
  s.setTrim(snap.trimStart, snap.trimEnd);
  if (snap.activeThemeId !== s.activeThemeId) s.setActiveTheme(snap.activeThemeId);
}

const MAX_HISTORY = 50;

interface UndoRedoState {
  past: Snapshot[];
  future: Snapshot[];
  /** Appeler AVANT une action pour sauvegarder l'etat courant */
  pushState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export const useUndoRedo = create<UndoRedoState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
  pushState: () => {
    const snap = takeSnapshot();
    set(s => ({
      past: [...s.past.slice(-MAX_HISTORY + 1), snap],
      future: [],
      canUndo: true,
      canRedo: false,
    }));
  },
  undo: () => {
    const { past } = get();
    if (past.length === 0) return;
    const current = takeSnapshot();
    const prev = past[past.length - 1];
    applySnapshot(prev);
    set(s => ({
      past: s.past.slice(0, -1),
      future: [current, ...s.future],
      canUndo: s.past.length > 1,
      canRedo: true,
    }));
  },
  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    const current = takeSnapshot();
    const next = future[0];
    applySnapshot(next);
    set(s => ({
      past: [...s.past, current],
      future: s.future.slice(1),
      canUndo: true,
      canRedo: s.future.length > 1,
    }));
  },
  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
