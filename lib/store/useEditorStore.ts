import { create } from 'zustand';

// Référence vers l'élément vidéo, hors du store pour éviter les re-renders
let _videoEl: HTMLVideoElement | null = null;

export function registerVideoElement(el: HTMLVideoElement | null) {
  _videoEl = el;
}

interface EditorState {
  videoFile: File | null;
  videoUrl: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  trimStart: number;
  trimEnd: number;
  itemId: string | null;

  setVideoFile: (file: File) => void;
  setDuration: (d: number) => void;
  setCurrentTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (t: number) => void;
  setTrim: (start: number, end: number) => void;
  setItemId: (id: string) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  videoFile: null,
  videoUrl: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  trimStart: 0,
  trimEnd: 0,
  itemId: null,

  setVideoFile: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      videoFile: file,
      videoUrl: URL.createObjectURL(file),
      trimStart: 0,
      trimEnd: 0,
      currentTime: 0,
      isPlaying: false,
    });
  },

  setDuration: (d) => {
    const { trimEnd } = get();
    set({ duration: d, trimEnd: trimEnd === 0 ? d : trimEnd });
  },

  setCurrentTime: (t) => set({ currentTime: t }),

  play: () => {
    const { trimEnd, currentTime, trimStart } = get();
    // Revenir au début du trim si on est à la fin
    if (currentTime >= trimEnd && trimEnd > 0) {
      if (_videoEl) _videoEl.currentTime = trimStart;
      set({ currentTime: trimStart });
    }
    set({ isPlaying: true });
    _videoEl?.play();
  },

  pause: () => {
    set({ isPlaying: false });
    _videoEl?.pause();
  },

  togglePlayPause: () => {
    if (get().isPlaying) get().pause();
    else get().play();
  },

  seekTo: (t) => {
    const clamped = Math.max(0, Math.min(t, get().duration));
    set({ currentTime: clamped });
    if (_videoEl) _videoEl.currentTime = clamped;
  },

  setTrim: (start, end) => set({ trimStart: start, trimEnd: end }),
  setItemId: (id) => set({ itemId: id }),

  reset: () => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    _videoEl = null;
    set({
      videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
      isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
    });
  },
}));
