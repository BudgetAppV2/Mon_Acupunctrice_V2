import { create } from 'zustand';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { getTheme, getThemeFilter } from '@/lib/data/videoThemes';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle, VideoClip } from '@/lib/types';

let _videoEl: HTMLVideoElement | null = null;
let _editorTouched = false;

export function registerVideoElement(el: HTMLVideoElement | null) { _videoEl = el; }

function markEditorTouched() {
  if (_editorTouched) return;
  const id = useEditorStore.getState().itemId;
  if (!id) return;
  _editorTouched = true;
  updateDoc(doc(getFirebaseFirestore(), 'contentItems', id), { editorTouchedAt: serverTimestamp() }).catch(() => {});
}

// --- Multi-clip helpers ---

function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => { const u = { ...c, timelineStart: t }; t += c.trimEnd - c.trimStart; return u; });
}

function syncLegacyFields(clips: VideoClip[]) {
  const first = clips[0];
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    trimStart: first?.trimStart ?? 0,
    trimEnd: first?.trimEnd ?? 0,
    // duration = durée SOURCE du premier clip (pour la timeline/zoom)
    // PAS la durée trimmée — sinon le zoom recalcule et le bloc remplit toute la largeur
    duration: first?.duration ?? 0,
  };
}

interface EditorState {
  // Multi-clip
  clips: VideoClip[];
  activeClipId: string | null;
  // Legacy fields (synced via syncLegacyFields for retrocompat)
  videoFile: File | null;
  videoUrl: string | null;
  duration: number;
  trimStart: number;
  trimEnd: number;
  activeThemeId: string;
  // Editor state
  currentTime: number;
  isPlaying: boolean;
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
  audioDucking: boolean;
  thumbnailUrl: string | null;
  videoOrientation: 'portrait' | 'landscape';
  editorSplitRatio: number;
  selectedSubtitleId: string | null;
  coverFrameOffset: number;
  coverDataUrl: string | null;
  coverCustomUrl: string | null;
  captions: { instagram: string; facebook: string; youtube: string } | null;
  // Actions
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
  setOverlays: (overlays: TextOverlayItem[]) => void;
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
  setAudioDucking: (on: boolean) => void;
  setThumbnail: (url: string) => void;
  setVideoOrientation: (o: 'portrait' | 'landscape') => void;
  setEditorSplitRatio: (ratio: number) => void;
  selectSubtitle: (id: string | null) => void;
  updateSubtitleTiming: (id: string, changes: { startTime?: number; endTime?: number }) => void;
  setCoverFrame: (offset: number, dataUrl: string) => void;
  setCoverCustom: (url: string) => void;
  clearCover: () => void;
  setActiveTheme: (id: string) => void;
  setCaptions: (c: { instagram: string; facebook: string; youtube: string }) => void;
  updateCaption: (platform: 'instagram' | 'facebook' | 'youtube', text: string) => void;
  // Multi-clip actions
  addClip: (file: File, blobUrl: string) => void;
  removeClip: (id: string) => void;
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void;
  setActiveClip: (id: string | null) => void;
  initClipDuration: (clipId: string, duration: number) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  clips: [], activeClipId: null, activeThemeId: 'sage_zen',
  videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
  isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
  filter: 'normal', overlays: [], selectedOverlayId: null,
  subtitles: [], subtitleStyle: 'classic' as SubtitleStyle,
  audioUrl: null, audioName: null, audioVolume: 0.3, voiceVolume: 1,
  audioFadeIn: 0, audioFadeOut: 0, audioDucking: false, thumbnailUrl: null, videoOrientation: 'portrait', editorSplitRatio: 0.50, selectedSubtitleId: null, coverFrameOffset: 0, coverDataUrl: null, coverCustomUrl: null, captions: null,

  setVideoFile: (file) => {
    get().clips.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
    const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl: URL.createObjectURL(file), duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0 };
    const clips = [clip];
    set({ clips, activeClipId: clip.id, ...syncLegacyFields(clips), currentTime: 0, isPlaying: false });
  },
  loadVideo: (file, url) => {
    get().clips.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
    const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl: url, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0 };
    const clips = [clip];
    set({ clips, activeClipId: clip.id, ...syncLegacyFields(clips), currentTime: 0, isPlaying: false });
  },
  setDuration: (d) => {
    const { clips } = get();
    if (clips.length === 0) return;
    const updated = recalcTimelineStarts(clips.map((c, i) => i === 0 ? { ...c, duration: d, trimEnd: c.trimEnd === 0 ? d : c.trimEnd } : c));
    set({ clips: updated, ...syncLegacyFields(updated) });
  },
  setCurrentTime: (t) => set({ currentTime: t }),
  play: () => {
    const { trimEnd, currentTime: ct, trimStart: ts } = get();
    if (ct >= trimEnd && trimEnd > 0) { if (_videoEl) _videoEl.currentTime = ts; set({ currentTime: ts }); }
    set({ isPlaying: true }); _videoEl?.play();
  },
  pause: () => { set({ isPlaying: false }); _videoEl?.pause(); },
  togglePlayPause: () => { if (get().isPlaying) get().pause(); else get().play(); },
  seekTo: (t) => {
    // Clamp au max de la duree effective OU la duree source du premier clip (pendant le chargement, duration peut etre 0)
    const { duration, clips } = get();
    const maxTime = Math.max(duration, clips[0]?.duration ?? 0);
    const c = Math.max(0, maxTime > 0 ? Math.min(t, maxTime) : t);
    set({ currentTime: c });
    if (_videoEl) _videoEl.currentTime = c;
  },
  setTrim: (start, end) => {
    const { clips } = get();
    if (clips.length === 0) { set({ trimStart: start, trimEnd: end }); markEditorTouched(); return; }
    const updated = recalcTimelineStarts(clips.map((c, i) => i === 0 ? { ...c, trimStart: start, trimEnd: end } : c));
    set({ clips: updated, ...syncLegacyFields(updated) }); markEditorTouched();
  },
  setItemId: (id) => set({ itemId: id }),
  setFilter: (name) => { set({ filter: name }); markEditorTouched(); },
  setOverlays: (overlays) => set({ overlays }),
  addOverlay: (text) => {
    const id = crypto.randomUUID(); const { duration, activeThemeId } = get();
    const theme = getTheme(activeThemeId);
    set({ overlays: [...get().overlays, { id, text: text || 'Texte', fontFamily: theme.fontTitle, fontSize: 32, fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0, endTime: duration || 10, style: 'classic' as const, animation: 'none' as const, effect: theme.defaultTextEffect }], selectedOverlayId: id });
    markEditorTouched();
  },
  updateOverlay: (id, changes) => { set({ overlays: get().overlays.map(o => o.id === id ? { ...o, ...changes } : o) }); markEditorTouched(); },
  removeOverlay: (id) => { const s = get(); set({ overlays: s.overlays.filter(o => o.id !== id), selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId }); },
  duplicateOverlay: (id) => {
    const src = get().overlays.find(o => o.id === id); if (!src) return;
    const gap = 0.3, dur = src.endTime - src.startTime, newStart = Math.min(src.endTime + gap, get().duration), newEnd = Math.min(newStart + dur, get().duration), newId = `txt_${Date.now()}`;
    set({ overlays: [...get().overlays, { ...src, id: newId, text: '', startTime: newStart, endTime: newEnd }], selectedOverlayId: newId }); markEditorTouched();
  },
  selectOverlay: (id) => set({ selectedOverlayId: id }),
  setSubtitles: (subs) => { set({ subtitles: subs }); markEditorTouched(); },
  setSubtitleStyle: (s) => { set({ subtitleStyle: s }); markEditorTouched(); },
  updateSubtitle: (id, text) => set({ subtitles: get().subtitles.map(s => s.id === id ? { ...s, text } : s) }),
  setAudioTrack: (url, name) => { set({ audioUrl: url, audioName: name }); markEditorTouched(); },
  removeAudio: () => set({ audioUrl: null, audioName: null, audioFadeIn: 0, audioFadeOut: 0, audioDucking: false }),
  setAudioVolume: (v) => set({ audioVolume: v }),
  setVoiceVolume: (v) => set({ voiceVolume: v }),
  setAudioFade: (fadeIn, fadeOut) => set({ audioFadeIn: fadeIn, audioFadeOut: fadeOut }),
  setAudioDucking: (on) => set({ audioDucking: on }),
  setThumbnail: (url) => set({ thumbnailUrl: url }),
  setVideoOrientation: (o) => set({ videoOrientation: o }),
  setEditorSplitRatio: (ratio) => set({ editorSplitRatio: Math.max(0.25, Math.min(0.80, ratio)) }),
  selectSubtitle: (id) => set({ selectedSubtitleId: id }),
  updateSubtitleTiming: (id, changes) => set({ subtitles: get().subtitles.map(s => s.id === id ? { ...s, ...changes } : s) }),
  setCoverFrame: (offset, dataUrl) => set({ coverFrameOffset: offset, coverDataUrl: dataUrl, coverCustomUrl: null }),
  setCoverCustom: (url) => set({ coverCustomUrl: url, coverDataUrl: null }),
  clearCover: () => set({ coverFrameOffset: 0, coverDataUrl: null, coverCustomUrl: null }),
  setActiveTheme: (id) => { const theme = getTheme(id); const themeFilter = getThemeFilter(theme); set({ activeThemeId: id, filter: themeFilter.id, subtitleStyle: theme.subtitleStyle as SubtitleStyle }); },
  setCaptions: (c) => set({ captions: c }),
  updateCaption: (platform, text) => { const c = get().captions; if (c) set({ captions: { ...c, [platform]: text } }); },
  // --- Multi-clip actions ---
  addClip: (file, blobUrl) => {
    const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0 };
    const clips = recalcTimelineStarts([...get().clips, clip]);
    set({ clips, activeClipId: clip.id, ...syncLegacyFields(clips) }); markEditorTouched();
  },
  initClipDuration: (clipId, duration) => {
    const clips = recalcTimelineStarts(get().clips.map(c => c.id === clipId ? { ...c, duration, trimEnd: c.trimEnd === 0 ? duration : c.trimEnd } : c));
    set({ clips, ...syncLegacyFields(clips) });
  },
  removeClip: (id) => {
    const { clips, activeClipId } = get();
    const removed = clips.find(c => c.id === id);
    if (removed?.blobUrl) URL.revokeObjectURL(removed.blobUrl);
    const filtered = recalcTimelineStarts(clips.filter(c => c.id !== id));
    const newActive = activeClipId === id ? (filtered[0]?.id ?? null) : activeClipId;
    set({ clips: filtered, activeClipId: newActive, ...syncLegacyFields(filtered) });
    // TODO M3: gerer les overlays/sous-titres orphelins positionnes sur le clip supprime
  },
  updateClipTrim: (id, trimStart, trimEnd) => {
    const clips = recalcTimelineStarts(get().clips.map(c => c.id === id ? { ...c, trimStart, trimEnd } : c));
    set({ clips, ...syncLegacyFields(clips) }); markEditorTouched();
  },
  setActiveClip: (id) => set({ activeClipId: id }),
  reset: () => {
    get().clips.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
    _videoEl = null; _editorTouched = false;
    set({
      clips: [], activeClipId: null, activeThemeId: 'sage_zen',
      videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
      isPlaying: false, trimStart: 0, trimEnd: 0, itemId: null,
      filter: 'normal', overlays: [], selectedOverlayId: null,
      subtitles: [], subtitleStyle: 'classic' as SubtitleStyle,
      audioUrl: null, audioName: null, audioVolume: 0.3, voiceVolume: 1,
      audioFadeIn: 0, audioFadeOut: 0, audioDucking: false, thumbnailUrl: null, videoOrientation: 'portrait', selectedSubtitleId: null, coverFrameOffset: 0, coverDataUrl: null, coverCustomUrl: null, captions: null,
    });
  },
}));
