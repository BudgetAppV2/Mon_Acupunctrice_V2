import { create } from 'zustand';
import type { StylePreset, SubtitleBlock, Track, VideoClip, AudioClip, TextOverlay } from '@/lib/editor-v2/types';
import { DEFAULT_PRESET, PRESETS } from '@/lib/editor-v2/presets';
import {
  recalcTimelineStarts, getVideoTrack, getVideoTracks,
  getSubtitleTrack, getAudioTrack, getClipAtTime, getActiveVideoClip,
  totalClipsDuration, syncFlatFromTracks,
} from '@/lib/editor-v2/store';

// Re-export helpers so components can import them from the store module
export { getVideoTrack, getVideoTracks, getSubtitleTrack, getAudioTrack, getClipAtTime, getActiveVideoClip } from '@/lib/editor-v2/store';

const DEFAULT_TRACKS: Track[] = [
  { id: 'v1', type: 'video', label: 'Video 1', muted: false, volume: 1, clips: [] },
  { id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false, volume: 1, subtitles: { blocks: [], globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } } } },
  { id: 'a1', type: 'audio', label: 'Audio', muted: false, volume: 1, audioClips: [] },
];

const INITIAL_STATE = {
  tracks: DEFAULT_TRACKS,
  globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } },
  blocks: [] as SubtitleBlock[],
  selectedBlockId: null as string | null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  filterId: 'normal',
  filterIntensity: 1.0,
  activeLutId: null as string | null,
  lutIntensity: 0.7,
  videoFile: null as File | null,
  videoUrl: null as string | null,
  thumbnailUrl: null as string | null,
  selectedTrackId: null as string | null,
  selectedItemId: null as string | null,
  textOverlays: [] as TextOverlay[],
  selectedOverlayId: null as string | null,
  coverFrameMs: 0,
  coverDataUrl: null as string | null,
  voiceVolume: 0.3,
  audioVolume: 0.3,
  audioDucking: false,
  // V2 additions
  itemId: null as string | null,
};

interface EditorV2Store {
  // V2 additions
  itemId: string | null;
  setItemId: (id: string) => void;
  reset: () => void;
  loadFromFirestore: (data: Record<string, unknown>) => void;
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
  selectedTrackId: string | null;
  selectedItemId: string | null;
  voiceVolume: number;
  audioVolume: number;
  audioDucking: boolean;
  // Actions
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
  moveSubtitleBlock: (id: string, newStartMs: number) => void;
  trimSubtitleBlock: (id: string, newStartMs: number, newEndMs: number) => void;
  moveTextOverlay: (id: string, newStartMs: number) => void;
  moveVideoClip: (clipId: string, newTimelineStart: number) => void;
  addVideoClip: (file: File) => void;
  removeVideoClip: (id: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  setClipFilter: (clipId: string, filterId: string) => void;
  addAudioClip: (file: File, name: string) => void;
  removeAudioClip: (id: string) => void;
  setVoiceVolume: (v: number) => void;
  setAudioVolume: (v: number) => void;
  setAudioDucking: (on: boolean) => void;
  setAudioFade: (clipId: string, fadeIn: number, fadeOut: number) => void;
  initClipDuration: (clipId: string, durationMs: number) => void;
  splitClip: (clipId: string, globalSplitTimeMs: number) => void;
  reorderClips: (fromIndex: number, toIndex: number) => void;
  deleteClip: (clipId: string) => void;
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  addTextOverlay: () => void;
  updateTextOverlay: (id: string, changes: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  duplicateTextOverlay: (id: string) => void;
  coverFrameMs: number;
  coverDataUrl: string | null;
  setCoverFrame: (ms: number, dataUrl: string) => void;
  selectItem: (trackId: string | null, itemId: string | null) => void;
  clearSelection: () => void;
  setClipSourceUrl: (clipId: string, url: string) => void;
  setAudioClipUrl: (clipId: string, url: string) => void;
}

export const useEditorV2Store = create<EditorV2Store>((set, get) => ({
  ...INITIAL_STATE,

  // --- V2 additions ---
  setItemId: (id) => set({ itemId: id }),

  reset: () => {
    const s = get();
    s.tracks.forEach(t => {
      t.clips?.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
      t.audioClips?.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
    });
    set({
      ...INITIAL_STATE,
      tracks: [
        { id: 'v1', type: 'video', label: 'Video 1', muted: false, volume: 1, clips: [] },
        { id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false, volume: 1, subtitles: { blocks: [], globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } } } },
        { id: 'a1', type: 'audio', label: 'Audio', muted: false, volume: 1, audioClips: [] },
      ],
    });
  },

  loadFromFirestore: (data) => {
    const ed = data as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (ed.globalPreset) patch.globalPreset = ed.globalPreset;
    if (Array.isArray(ed.blocks)) patch.blocks = ed.blocks;
    if (Array.isArray(ed.textOverlays)) patch.textOverlays = ed.textOverlays;
    if (typeof ed.filterId === 'string') patch.filterId = ed.filterId;
    if (typeof ed.filterIntensity === 'number') patch.filterIntensity = ed.filterIntensity;
    if (typeof ed.voiceVolume === 'number') patch.voiceVolume = ed.voiceVolume;
    if (typeof ed.audioVolume === 'number') patch.audioVolume = ed.audioVolume;
    if (typeof ed.audioDucking === 'boolean') patch.audioDucking = ed.audioDucking;
    if (typeof ed.coverFrameMs === 'number') patch.coverFrameMs = ed.coverFrameMs;
    if (typeof ed.coverDataUrl === 'string') patch.coverDataUrl = ed.coverDataUrl;
    // Restore tracks with clips stripped of file/blobUrl
    if (Array.isArray(ed.tracks)) {
      const tracks = (ed.tracks as Track[]).map(t => {
        const base = { ...t, volume: t.volume ?? 1 };
        if (base.type === 'video' && base.clips) {
          return { ...base, clips: base.clips.map(c => ({ ...c, file: null, blobUrl: null })) };
        }
        if (base.type === 'audio' && base.audioClips) {
          return { ...base, audioClips: base.audioClips.map(a => ({ ...a, file: null, blobUrl: null })) };
        }
        return base;
      });
      patch.tracks = tracks;
      // Sync flat fields from restored tracks
      const vt = tracks.find((t: Track) => t.type === 'video');
      const first = vt?.clips?.[0];
      if (first) {
        patch.duration = tracks
          .filter((t: Track) => t.type === 'video')
          .flatMap((t: Track) => t.clips ?? [])
          .reduce((acc: number, c: VideoClip) => acc + c.duration, 0);
      }
      // Sync blocks from subtitle track
      const st = tracks.find((t: Track) => t.type === 'subtitle');
      if (st?.subtitles?.blocks && !ed.blocks) {
        patch.blocks = st.subtitles.blocks;
      }
    }
    set(patch as Partial<EditorV2Store>);
  },

  // --- Original Lab store actions ---
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

  moveSubtitleBlock: (id, newStartMs) => set((s) => {
    const newBlocks = s.blocks.map(b => {
      if (b.id !== id) return b;
      const dur = b.endMs - b.startMs;
      const ns = Math.max(0, newStartMs);
      const delta = ns - b.startMs;
      return { ...b, startMs: ns, endMs: ns + dur, words: b.words.map(w => ({ ...w, startMs: w.startMs + delta, endMs: w.endMs + delta })) };
    });
    const tracks = s.tracks.map(t => t.type === 'subtitle' && t.subtitles ? { ...t, subtitles: { ...t.subtitles, blocks: newBlocks } } : t);
    return { blocks: newBlocks, tracks };
  }),
  trimSubtitleBlock: (id, newStartMs, newEndMs) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'subtitle' || !t.subtitles) return t;
      return { ...t, subtitles: { ...t.subtitles, blocks: t.subtitles.blocks.map(b => {
        if (b.id !== id) return b;
        return { ...b, startMs: newStartMs, endMs: newEndMs };
      })}};
    });
    return { tracks };
  }),

  moveTextOverlay: (id, newStartMs) => set((s) => ({
    textOverlays: s.textOverlays.map(o => {
      if (o.id !== id) return o;
      const dur = o.endMs - o.startMs;
      const ns = Math.max(0, newStartMs);
      return { ...o, startMs: ns, endMs: ns + dur };
    }),
  })),

  moveVideoClip: (clipId, newTimelineStart) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      return { ...t, clips: t.clips.map(c =>
        c.id === clipId ? { ...c, timelineStart: newTimelineStart } : c
      )};
    });
    return { tracks, ...syncFlatFromTracks(tracks) };
  }),

  setVideo: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    const blobUrl = URL.createObjectURL(file);
    const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0, filterId: 'normal', thumbnailUrl: null, sourceVideoUrl: null };
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

  addVideoClip: (file) => {
    const blobUrl = URL.createObjectURL(file);
    const clipId = crypto.randomUUID();
    const clip: VideoClip = { id: clipId, file, blobUrl, duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0, filterId: 'normal', thumbnailUrl: null, sourceVideoUrl: null };
    set((s) => {
      const vt = getVideoTrack(s.tracks);
      let tracks: Track[];
      if (vt && (vt.clips?.length ?? 0) > 0) {
        const v2: Track = { id: `v${Date.now()}`, type: 'video', label: `Video ${getVideoTracks(s.tracks).length + 1}`, muted: false, volume: 1, clips: [clip] };
        tracks = [...s.tracks, v2];
      } else {
        tracks = s.tracks.map(t => t.id === 'v1' ? { ...t, clips: [...(t.clips ?? []), clip] } : t);
      }
      return { tracks, ...syncFlatFromTracks(tracks), duration: Math.max(s.duration, totalClipsDuration(tracks)) };
    });
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

  addAudioClip: (file, name) => {
    const blobUrl = URL.createObjectURL(file);
    const clip: AudioClip = { id: crypto.randomUUID(), file, blobUrl, name, duration: 0, startMs: 0, volume: 1, fadeIn: 0, fadeOut: 0, audioUrl: null };
    set((s) => ({
      tracks: s.tracks.map(t => t.id === 'a1' ? { ...t, audioClips: [clip] } : t),
    }));
    // Decode audio to get duration
    const audio = new Audio();
    audio.src = blobUrl;
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        const dMs = audio.duration * 1000;
        set((s) => ({
          tracks: s.tracks.map(t => {
            if (t.id !== 'a1' || !t.audioClips) return t;
            return { ...t, audioClips: t.audioClips.map(c => c.id === clip.id ? { ...c, duration: dMs } : c) };
          }),
        }));
      }
    });
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

  initClipDuration: (clipId, durationMs) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const clips = t.clips.map(c => c.id === clipId && c.duration === 0 ? { ...c, duration: durationMs, trimEnd: durationMs } : c);
      return { ...t, clips };
    });
    return { tracks, ...syncFlatFromTracks(tracks), duration: totalClipsDuration(tracks) };
  }),

  splitClip: (clipId, globalSplitTimeMs) => set((s) => {
    const tracks = s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      const idx = t.clips.findIndex(c => c.id === clipId);
      if (idx === -1) return t;
      const clip = t.clips[idx];
      const localSplit = clip.trimStart + (globalSplitTimeMs - clip.timelineStart);
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
      tracks, ...flat,
      videoFile: flat.videoFile, videoUrl: flat.videoUrl,
      duration: totalClipsDuration(tracks),
      selectedItemId: s.selectedItemId === clipId ? null : s.selectedItemId,
      selectedTrackId: s.selectedItemId === clipId ? null : s.selectedTrackId,
    };
  }),

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

  setCoverFrame: (ms, dataUrl) => set({ coverFrameMs: ms, coverDataUrl: dataUrl }),
  selectItem: (trackId, itemId) => set({ selectedTrackId: trackId, selectedItemId: itemId, selectedBlockId: itemId }),
  clearSelection: () => set({ selectedTrackId: null, selectedItemId: null, selectedBlockId: null }),

  setClipSourceUrl: (clipId, url) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.type !== 'video' || !t.clips) return t;
      return { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, sourceVideoUrl: url } : c) };
    }),
  })),

  setAudioClipUrl: (clipId, url) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.type !== 'audio' || !t.audioClips) return t;
      return { ...t, audioClips: t.audioClips.map(a => a.id === clipId ? { ...a, audioUrl: url } : a) };
    }),
  })),
}));
