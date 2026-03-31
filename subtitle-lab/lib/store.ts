import { create } from 'zustand';
import type { StylePreset, SubtitleBlock, Track, VideoClip, AudioClip, TextOverlay } from './types';
import { DEFAULT_PRESET, PRESETS } from './presets';

// --- Multi-track helpers ---

function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => { const u = { ...c, timelineStart: t }; t += c.trimEnd - c.trimStart; return u; });
}

export function getVideoTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'video'); }
export function getVideoTracks(tracks: Track[]): Track[] { return tracks.filter(t => t.type === 'video'); }
export function getSubtitleTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'subtitle'); }
export function getAudioTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'audio'); }

// A3: Find the clip playing at a given global time (multi-cam: first track wins)
export function getClipAtTime(
  clips: VideoClip[],
  globalTimeMs: number,
): { clip: VideoClip; localTimeMs: number } | null {
  for (const c of clips) {
    // Clip occupies timelineStart to timelineStart+duration on the timeline
    // Active zone is trimStart to trimEnd within that range
    const absStart = c.timelineStart + c.trimStart;
    const absEnd = c.timelineStart + c.trimEnd;
    if (globalTimeMs >= absStart && globalTimeMs < absEnd) {
      return { clip: c, localTimeMs: c.trimStart + (globalTimeMs - absStart) };
    }
  }
  return null;
}

export function getActiveVideoClip(tracks: Track[], currentTimeMs: number): VideoClip | null {
  for (const t of getVideoTracks(tracks)) {
    if (!t.clips?.length) continue;
    const result = getClipAtTime(t.clips, currentTimeMs);
    if (result) return result.clip;
  }
  return null;
}

function totalClipsDuration(tracks: Track[]): number {
  const vt = getVideoTrack(tracks);
  if (!vt?.clips?.length) return 0;
  // Use SOURCE duration (not trimmed) so scrubber shows full extent
  return vt.clips.reduce((acc, c) => acc + c.duration, 0);
}

function syncFlatFromTracks(tracks: Track[]) {
  const vt = getVideoTrack(tracks);
  const first = vt?.clips?.[0];
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    thumbnailUrl: first?.thumbnailUrl ?? null,
  };
}

// --- Default tracks ---

const DEFAULT_TRACKS: Track[] = [
  { id: 'v1', type: 'video', label: 'Video 1', muted: false, clips: [] },
  { id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false, subtitles: { blocks: [], globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } } } },
  { id: 'a1', type: 'audio', label: 'Audio', muted: false, audioClips: [] },
];

// --- Store interface ---

interface SubtitleStore {
  // Tracks (source of truth)
  tracks: Track[];
  // Flat fields (synced for retrocompat)
  globalPreset: StylePreset;
  blocks: SubtitleBlock[];
  selectedBlockId: string | null;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  filterId: string;
  activeLutId: string | null;
  lutIntensity: number;
  videoFile: File | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  // Selection partagee
  selectedTrackId: string | null;
  selectedItemId: string | null;
  // A4: Audio mix
  voiceVolume: number;
  audioVolume: number;
  audioDucking: boolean;
  // Existing actions
  setGlobalPreset: (preset: StylePreset) => void;
  applyGlobalToAll: () => void;
  updateGlobalField: <K extends keyof StylePreset>(key: K, value: StylePreset[K]) => void;
  updateBlock: (id: string, overrides: Partial<StylePreset>) => void;
  resetBlockOverrides: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setCurrentTime: (ms: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setFilter: (id: string) => void;
  filterIntensity: number;
  setFilterIntensity: (v: number) => void;
  setLut: (id: string | null) => void;
  setLutIntensity: (v: number) => void;
  setVideo: (file: File) => void;
  clearVideo: () => void;
  setThumbnail: (url: string) => void;
  setDuration: (ms: number) => void;
  setSubtitleBlocks: (blocks: SubtitleBlock[]) => void;
  moveSubtitleBlock: (id: string, deltaMs: number) => void;
  moveTextOverlay: (id: string, deltaMs: number) => void;
  moveVideoClip: (clipId: string, newTimelineStart: number) => void;
  // Multi-track actions
  addVideoClip: (file: File) => void;
  removeVideoClip: (id: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  setClipFilter: (clipId: string, filterId: string) => void;
  // A4: Audio actions
  addAudioClip: (file: File, name: string) => void;
  removeAudioClip: (id: string) => void;
  setVoiceVolume: (v: number) => void;
  setAudioVolume: (v: number) => void;
  setAudioDucking: (on: boolean) => void;
  setAudioFade: (clipId: string, fadeIn: number, fadeOut: number) => void;
  initClipDuration: (clipId: string, durationMs: number) => void;
  // A7: Clip interactions
  splitClip: (clipId: string, globalSplitTimeMs: number) => void;
  reorderClips: (fromIndex: number, toIndex: number) => void;
  deleteClip: (clipId: string) => void;
  // Text overlays
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  addTextOverlay: () => void;
  updateTextOverlay: (id: string, changes: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  duplicateTextOverlay: (id: string) => void;
  // Cover
  coverFrameMs: number;
  coverDataUrl: string | null;
  setCoverFrame: (ms: number, dataUrl: string) => void;
  // Selection
  selectItem: (trackId: string | null, itemId: string | null) => void;
  clearSelection: () => void;
}

export const useSubtitleStore = create<SubtitleStore>((set, get) => ({
  tracks: DEFAULT_TRACKS,
  globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } },
  blocks: [],
  selectedBlockId: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  filterId: 'normal',
  filterIntensity: 1.0,
  activeLutId: null,
  lutIntensity: 0.7,
  videoFile: null,
  videoUrl: null,
  thumbnailUrl: null,
  selectedTrackId: null,
  selectedItemId: null,
  textOverlays: [],
  selectedOverlayId: null,
  coverFrameMs: 0,
  coverDataUrl: null,
  voiceVolume: 1.0,
  audioVolume: 0.3,
  audioDucking: false,

  // --- Existing actions (flat + sync to tracks) ---
  setGlobalPreset: (preset) => set((s) => {
    const gp = { ...preset, position: s.globalPreset.position };
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, globalPreset: gp } } : t);
    return { globalPreset: gp, tracks };
  }),
  updateGlobalField: (key, value) => set((s) => {
    const gp = { ...s.globalPreset, [key]: value };
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, globalPreset: gp } } : t);
    return { globalPreset: gp, tracks };
  }),
  applyGlobalToAll: () => set((s) => {
    const newBlocks = s.blocks.map(b => ({ ...b, overrides: undefined }));
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks: newBlocks } } : t);
    return { blocks: newBlocks, tracks };
  }),
  updateBlock: (id, overrides) => set((s) => {
    const newBlocks = s.blocks.map(b => b.id === id ? { ...b, overrides: { ...(b.overrides ?? {}), ...overrides } } : b);
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks: newBlocks } } : t);
    return { blocks: newBlocks, tracks };
  }),
  resetBlockOverrides: (id) => set((s) => {
    const newBlocks = s.blocks.map(b => b.id === id ? { ...b, overrides: undefined } : b);
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks: newBlocks } } : t);
    return { blocks: newBlocks, tracks };
  }),
  selectBlock: (id) => set({ selectedBlockId: id, selectedItemId: id, selectedTrackId: id ? 'sub' : null }),
  setCurrentTime: (ms) => set({ currentTime: Math.max(0, Math.min(ms, get().duration)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setFilter: (id) => set({ filterId: id }),
  setFilterIntensity: (v) => set({ filterIntensity: v }),
  setLut: (id) => set({ activeLutId: id }),
  setLutIntensity: (v) => set({ lutIntensity: v }),
  setThumbnail: (url) => set({ thumbnailUrl: url }),
  setDuration: (ms) => set({ duration: ms }),
  setSubtitleBlocks: (blocks) => set((s) => {
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks } } : t);
    return { blocks, tracks };
  }),

  moveSubtitleBlock: (id, deltaMs) => set((s) => {
    const newBlocks = s.blocks.map(b => {
      if (b.id !== id) return b;
      const dur = b.endMs - b.startMs;
      const ns = Math.max(0, b.startMs + deltaMs);
      return { ...b, startMs: ns, endMs: ns + dur, words: b.words.map(w => ({ ...w, startMs: w.startMs + deltaMs, endMs: w.endMs + deltaMs })) };
    });
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks: newBlocks } } : t);
    return { blocks: newBlocks, tracks };
  }),
  moveTextOverlay: (id, deltaMs) => set((s) => ({
    textOverlays: s.textOverlays.map(o => {
      if (o.id !== id) return o;
      const dur = o.endMs - o.startMs;
      const ns = Math.max(0, o.startMs + deltaMs);
      return { ...o, startMs: ns, endMs: ns + dur };
    }),
  })),

  moveVideoClip: (clipId, newTimelineStart) => set((s) => {
    // Move clip to absolute position (no delta, no bounce)
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const clips = t.clips.map(c => {
        if (c.id !== clipId) return c;
        return { ...c, timelineStart: Math.max(0, newTimelineStart) };
      });
      return { ...t, clips };
    });
    return { tracks, ...syncFlatFromTracks(tracks) };
  }),

  // setVideo -> addVideoClip with flat sync
  setVideo: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    const blobUrl = URL.createObjectURL(file);
    const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0, filterId: 'normal', thumbnailUrl: null };
    set((s) => {
      const tracks = s.tracks.map(t => t.id === 'v1' ? { ...t, clips: [...(t.clips ?? []), clip] } : t);
      return { tracks, videoFile: file, videoUrl: blobUrl };
    });
  },
  clearVideo: () => {
    const s = get();
    s.tracks.forEach(t => t.clips?.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); }));
    set((st) => ({
      tracks: st.tracks.map(t => t.type === 'video' ? { ...t, clips: [] } : t),
      videoFile: null, videoUrl: null, thumbnailUrl: null,
    }));
  },

  // --- Multi-track actions ---
  addVideoClip: (file) => {
    const blobUrl = URL.createObjectURL(file);
    const clipId = crypto.randomUUID();
    const clip: VideoClip = { id: clipId, file, blobUrl, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0, filterId: 'normal', thumbnailUrl: null };
    set((s) => {
      const vt = getVideoTrack(s.tracks);
      let tracks: Track[];
      if (vt && (vt.clips?.length ?? 0) > 0) {
        const v2: Track = { id: `v${Date.now()}`, type: 'video', label: `Video ${getVideoTracks(s.tracks).length + 1}`, muted: false, clips: [clip] };
        tracks = [...s.tracks, v2];
      } else {
        tracks = s.tracks.map(t => t.id === 'v1' ? { ...t, clips: [...(t.clips ?? []), clip] } : t);
      }
      return { tracks, ...syncFlatFromTracks(tracks), duration: Math.max(s.duration, totalClipsDuration(tracks)) };
    });
    // Extract duration immediately to break the duration=0 deadlock
    const vid = document.createElement('video');
    vid.preload = 'metadata'; vid.src = blobUrl;
    vid.addEventListener('loadedmetadata', () => {
      if (vid.duration && isFinite(vid.duration)) get().initClipDuration(clipId, vid.duration * 1000);
      vid.removeAttribute('src'); vid.load();
    });
  },
  removeVideoClip: (id) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const clip = t.clips.find(c => c.id === id);
      if (clip?.blobUrl) URL.revokeObjectURL(clip.blobUrl);
      const clips = recalcTimelineStarts(t.clips.filter(c => c.id !== id));
      return { ...t, clips };
    });
    return { tracks, ...syncFlatFromTracks(tracks), duration: totalClipsDuration(tracks) };
  }),
  updateClipTrim: (clipId, trimStart, trimEnd) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      // Do NOT recalcTimelineStarts — the clip stays in position, only the active zone changes
      const clips = t.clips.map(c => c.id === clipId ? { ...c, trimStart, trimEnd } : c);
      return { ...t, clips };
    });
    return { tracks, duration: totalClipsDuration(tracks) };
  }),
  setClipFilter: (clipId, filterId) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      return { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, filterId } : c) };
    }),
  })),

  // --- A4: Audio actions ---
  addAudioClip: (file, name) => {
    const blobUrl = URL.createObjectURL(file);
    const clip: AudioClip = { id: crypto.randomUUID(), file, blobUrl, name, duration: 0, startMs: 0, volume: 1, fadeIn: 0, fadeOut: 0 };
    set((s) => ({
      tracks: s.tracks.map(t => t.id === 'a1' ? { ...t, audioClips: [clip] } : t),
    }));
  },
  removeAudioClip: (id) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.type !== 'audio' || !t.audioClips) return t;
      const clip = t.audioClips.find(c => c.id === id);
      if (clip?.blobUrl) URL.revokeObjectURL(clip.blobUrl);
      return { ...t, audioClips: t.audioClips.filter(c => c.id !== id) };
    }),
  })),
  setVoiceVolume: (v) => set({ voiceVolume: v }),
  setAudioVolume: (v) => set({ audioVolume: v }),
  setAudioDucking: (on) => set({ audioDucking: on }),
  setAudioFade: (clipId, fadeIn, fadeOut) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.type !== 'audio' || !t.audioClips) return t;
      return { ...t, audioClips: t.audioClips.map(c => c.id === clipId ? { ...c, fadeIn, fadeOut } : c) };
    }),
  })),

  // FIX-1: Initialize clip duration after video loads metadata
  initClipDuration: (clipId, durationMs) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      // Only update duration and trimEnd, do NOT recalcTimelineStarts (preserves position)
      const clips = t.clips.map(c => c.id === clipId && c.duration === 0 ? { ...c, duration: durationMs, trimEnd: durationMs } : c);
      return { ...t, clips };
    });
    return { tracks, ...syncFlatFromTracks(tracks), duration: totalClipsDuration(tracks) };
  }),

  // --- A7: Clip interactions ---
  splitClip: (clipId, globalSplitTimeMs) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const idx = t.clips.findIndex(c => c.id === clipId);
      if (idx === -1) return t;
      const clip = t.clips[idx];
      const localSplit = clip.trimStart + (globalSplitTimeMs - clip.timelineStart);
      // Must be between trimStart and trimEnd (not at edges)
      if (localSplit <= clip.trimStart + 100 || localSplit >= clip.trimEnd - 100) return t;
      const clipA: VideoClip = { ...clip, trimEnd: localSplit };
      const clipB: VideoClip = { ...clip, id: crypto.randomUUID(), trimStart: localSplit };
      const newClips = [...t.clips];
      newClips.splice(idx, 1, clipA, clipB);
      return { ...t, clips: recalcTimelineStarts(newClips) };
    });
    return { tracks, duration: totalClipsDuration(tracks) };
  }),

  reorderClips: (fromIndex, toIndex) => set((s) => {
    const vt = getVideoTrack(s.tracks);
    if (!vt?.clips || fromIndex === toIndex) return s;
    const clips = [...vt.clips];
    const [moved] = clips.splice(fromIndex, 1);
    clips.splice(toIndex, 0, moved);
    const tracks = s.tracks.map(t => t.id === vt.id ? { ...t, clips: recalcTimelineStarts(clips) } : t);
    return { tracks, ...syncFlatFromTracks(tracks) };
  }),

  deleteClip: (clipId) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const clip = t.clips.find(c => c.id === clipId);
      if (!clip) return t;
      if (clip.blobUrl) URL.revokeObjectURL(clip.blobUrl);
      const remaining = recalcTimelineStarts(t.clips.filter(c => c.id !== clipId));
      return { ...t, clips: remaining };
    });
    const flat = syncFlatFromTracks(tracks);
    return {
      tracks,
      ...flat,
      videoFile: flat.videoFile,
      videoUrl: flat.videoUrl,
      duration: totalClipsDuration(tracks),
      selectedItemId: s.selectedItemId === clipId ? null : s.selectedItemId,
      selectedTrackId: s.selectedItemId === clipId ? null : s.selectedTrackId,
    };
  }),

  // --- Text overlays ---
  addTextOverlay: () => set((s) => {
    const preset = PRESETS.find(p => p.id === 'capcut-bold') ?? PRESETS[0];
    const o: TextOverlay = { id: crypto.randomUUID(), text: 'Texte', startMs: s.currentTime, endMs: Math.min(s.currentTime + 3000, s.duration || 10000), style: { ...preset, position: { x: 0.5, y: 0.5 } } };
    return { textOverlays: [...s.textOverlays, o], selectedOverlayId: o.id };
  }),
  updateTextOverlay: (id, changes) => set((s) => ({ textOverlays: s.textOverlays.map(o => o.id === id ? { ...o, ...changes } : o) })),
  removeTextOverlay: (id) => set((s) => ({ textOverlays: s.textOverlays.filter(o => o.id !== id), selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId })),
  selectOverlay: (id) => set({ selectedOverlayId: id }),
  duplicateTextOverlay: (id) => set((s) => {
    const src = s.textOverlays.find(o => o.id === id); if (!src) return s;
    const dup: TextOverlay = { ...src, id: crypto.randomUUID(), startMs: src.endMs + 100, endMs: src.endMs + 3100 };
    return { textOverlays: [...s.textOverlays, dup], selectedOverlayId: dup.id };
  }),
  // --- Cover ---
  setCoverFrame: (ms, dataUrl) => set({ coverFrameMs: ms, coverDataUrl: dataUrl }),

  // --- Selection partagee ---
  selectItem: (trackId, itemId) => set({ selectedTrackId: trackId, selectedItemId: itemId, selectedBlockId: itemId }),
  clearSelection: () => set({ selectedTrackId: null, selectedItemId: null, selectedBlockId: null }),
}));
