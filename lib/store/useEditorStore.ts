import { create } from 'zustand';
import type { TextOverlayItem } from '@/lib/types';

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
  filter: string;
  overlays: TextOverlayItem[];
  selectedOverlayId: string | null;

  setVideoFile: (file: File) => void;
  loadVideo: (file: File, url: string) => void;
  setDuration: (d: number) => void;
  setCurrentTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (t: number) => void;
  setTrim: (start: number, end: number) => void;
  setItemId: (id: string) => void;
  setFilter: (name: string) => void;
  addOverlay: (text?: string) => void;
  updateOverlay: (id: string, changes: Partial<TextOverlayItem>) => void;
  removeOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
  isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
  filter: 'normal', overlays: [], selectedOverlayId: null,

  setVideoFile: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ videoFile: file, videoUrl: URL.createObjectURL(file), trimStart: 0, trimEnd: 0, currentTime: 0, isPlaying: false });
  },

  loadVideo: (file, url) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ videoFile: file, videoUrl: url, trimStart: 0, trimEnd: 0, currentTime: 0, isPlaying: false });
  },

  setDuration: (d) => {
    const { trimEnd } = get();
    set({ duration: d, trimEnd: trimEnd === 0 ? d : trimEnd });
  },

  setCurrentTime: (t) => set({ currentTime: t }),

  play: () => {
    const { trimEnd, currentTime, trimStart } = get();
    if (currentTime >= trimEnd && trimEnd > 0) {
      if (_videoEl) _videoEl.currentTime = trimStart;
      set({ currentTime: trimStart });
    }
    set({ isPlaying: true });
    _videoEl?.play();
  },

  pause: () => { set({ isPlaying: false }); _videoEl?.pause(); },
  togglePlayPause: () => { if (get().isPlaying) get().pause(); else get().play(); },

  seekTo: (t) => {
    const clamped = Math.max(0, Math.min(t, get().duration));
    set({ currentTime: clamped });
    if (_videoEl) _videoEl.currentTime = clamped;
  },

  setTrim: (start, end) => set({ trimStart: start, trimEnd: end }),
  setItemId: (id) => set({ itemId: id }),
  setFilter: (name) => set({ filter: name }),

  addOverlay: (text) => {
    const id = crypto.randomUUID();
    const { duration } = get();
    const o: TextOverlayItem = {
      id, text: text || 'Texte', fontFamily: 'Inter', fontSize: 32,
      fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0,
      endTime: duration || 10, style: 'classic', animation: 'none',
    };
    set({ overlays: [...get().overlays, o], selectedOverlayId: id });
  },

  updateOverlay: (id, changes) => set({
    overlays: get().overlays.map(o => o.id === id ? { ...o, ...changes } : o),
  }),

  removeOverlay: (id) => {
    const s = get();
    set({
      overlays: s.overlays.filter(o => o.id !== id),
      selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId,
    });
  },

  selectOverlay: (id) => set({ selectedOverlayId: id }),

  reset: () => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    _videoEl = null;
    set({
      videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
      isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
      filter: 'normal', overlays: [], selectedOverlayId: null,
    });
  },
}));
