import { create } from 'zustand';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';

let _videoEl: HTMLVideoElement | null = null;
let _editorTouched = false;

export function registerVideoElement(el: HTMLVideoElement | null) {
  _videoEl = el;
}

// Marque l'item comme "touche" dans l'editeur (une seule fois par session)
function markEditorTouched() {
  if (_editorTouched) return;
  const id = useEditorStore.getState().itemId;
  if (!id) return;
  _editorTouched = true;
  updateDoc(doc(getFirebaseFirestore(), 'contentItems', id), {
    editorTouchedAt: serverTimestamp(),
  }).catch(() => {});
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
  subtitles: SubtitleSegment[];
  subtitleStyle: SubtitleStyle;
  audioUrl: string | null;
  audioName: string | null;
  audioVolume: number;
  voiceVolume: number;
  audioFadeIn: number;
  audioFadeOut: number;
  thumbnailUrl: string | null;
  videoOrientation: 'portrait' | 'landscape';

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
  duplicateOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  setSubtitles: (subs: SubtitleSegment[]) => void;
  setSubtitleStyle: (s: SubtitleStyle) => void;
  updateSubtitle: (id: string, text: string) => void;
  setAudioTrack: (url: string, name: string) => void;
  removeAudio: () => void;
  setAudioVolume: (v: number) => void;
  setVoiceVolume: (v: number) => void;
  setAudioFade: (fadeIn: number, fadeOut: number) => void;
  setThumbnail: (url: string) => void;
  setVideoOrientation: (o: 'portrait' | 'landscape') => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
  isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
  filter: 'normal', overlays: [], selectedOverlayId: null,
  subtitles: [], subtitleStyle: 'classic' as SubtitleStyle,
  audioUrl: null, audioName: null, audioVolume: 0.3, voiceVolume: 1,
  audioFadeIn: 0, audioFadeOut: 0, thumbnailUrl: null, videoOrientation: 'portrait',

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
  setDuration: (d) => { const { trimEnd } = get(); set({ duration: d, trimEnd: trimEnd === 0 ? d : trimEnd }); },
  setCurrentTime: (t) => set({ currentTime: t }),
  play: () => {
    const { trimEnd, currentTime: ct, trimStart: ts } = get();
    if (ct >= trimEnd && trimEnd > 0) { if (_videoEl) _videoEl.currentTime = ts; set({ currentTime: ts }); }
    set({ isPlaying: true }); _videoEl?.play();
  },
  pause: () => { set({ isPlaying: false }); _videoEl?.pause(); },
  togglePlayPause: () => { if (get().isPlaying) get().pause(); else get().play(); },
  seekTo: (t) => { const c = Math.max(0, Math.min(t, get().duration)); set({ currentTime: c }); if (_videoEl) _videoEl.currentTime = c; },
  setTrim: (start, end) => { set({ trimStart: start, trimEnd: end }); markEditorTouched(); },
  setItemId: (id) => set({ itemId: id }),
  setFilter: (name) => { set({ filter: name }); markEditorTouched(); },
  addOverlay: (text) => {
    const id = crypto.randomUUID(); const { duration } = get();
    set({ overlays: [...get().overlays, { id, text: text || 'Texte', fontFamily: 'Inter', fontSize: 32, fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0, endTime: duration || 10, style: 'classic' as const, animation: 'none' as const }], selectedOverlayId: id });
    markEditorTouched();
  },
  updateOverlay: (id, changes) => { set({ overlays: get().overlays.map(o => o.id === id ? { ...o, ...changes } : o) }); markEditorTouched(); },
  removeOverlay: (id) => {
    const s = get();
    set({ overlays: s.overlays.filter(o => o.id !== id), selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId });
  },
  duplicateOverlay: (id) => {
    const src = get().overlays.find(o => o.id === id);
    if (!src) return;
    const gap = 0.3, dur = src.endTime - src.startTime;
    const newStart = Math.min(src.endTime + gap, get().duration);
    const newEnd = Math.min(newStart + dur, get().duration);
    const newId = `txt_${Date.now()}`;
    set({ overlays: [...get().overlays, { ...src, id: newId, text: '', startTime: newStart, endTime: newEnd }], selectedOverlayId: newId });
    markEditorTouched();
  },
  selectOverlay: (id) => set({ selectedOverlayId: id }),
  setSubtitles: (subs) => { set({ subtitles: subs }); markEditorTouched(); },
  setSubtitleStyle: (s) => { set({ subtitleStyle: s }); markEditorTouched(); },
  updateSubtitle: (id, text) => set({ subtitles: get().subtitles.map(s => s.id === id ? { ...s, text } : s) }),
  setAudioTrack: (url, name) => { set({ audioUrl: url, audioName: name }); markEditorTouched(); },
  removeAudio: () => set({ audioUrl: null, audioName: null, audioFadeIn: 0, audioFadeOut: 0 }),
  setAudioVolume: (v) => set({ audioVolume: v }),
  setVoiceVolume: (v) => set({ voiceVolume: v }),
  setAudioFade: (fadeIn, fadeOut) => set({ audioFadeIn: fadeIn, audioFadeOut: fadeOut }),
  setThumbnail: (url) => set({ thumbnailUrl: url }),
  setVideoOrientation: (o) => set({ videoOrientation: o }),
  reset: () => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    _videoEl = null;
    _editorTouched = false;
    set({
      videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
      isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
      filter: 'normal', overlays: [], selectedOverlayId: null,
      subtitles: [], subtitleStyle: 'classic' as SubtitleStyle,
      audioUrl: null, audioName: null, audioVolume: 0.3, voiceVolume: 1,
      audioFadeIn: 0, audioFadeOut: 0, thumbnailUrl: null, videoOrientation: 'portrait',
    });
  },
}));
