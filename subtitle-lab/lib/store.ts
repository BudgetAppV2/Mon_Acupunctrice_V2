import { create } from 'zustand';
import type { StylePreset, SubtitleBlock } from './types';
import { DEFAULT_PRESET } from './presets';
import { TEST_BLOCKS, TOTAL_DURATION_MS } from './testData';

interface SubtitleStore {
  globalPreset: StylePreset;
  blocks: SubtitleBlock[];
  selectedBlockId: string | null;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  // Filter & LUT
  filterId: string;
  activeLutId: string | null;
  lutIntensity: number;
  // Video
  videoFile: File | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;

  setGlobalPreset: (preset: StylePreset) => void;
  applyGlobalToAll: () => void;
  updateGlobalField: <K extends keyof StylePreset>(key: K, value: StylePreset[K]) => void;
  updateBlock: (id: string, overrides: Partial<StylePreset>) => void;
  resetBlockOverrides: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setCurrentTime: (ms: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setFilter: (id: string) => void;
  setLut: (id: string | null) => void;
  setLutIntensity: (v: number) => void;
  setVideo: (file: File) => void;
  clearVideo: () => void;
  setThumbnail: (url: string) => void;
  setDuration: (ms: number) => void;
}

export const useSubtitleStore = create<SubtitleStore>((set, get) => ({
  globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } },
  blocks: TEST_BLOCKS,
  selectedBlockId: null,
  currentTime: 0,
  isPlaying: false,
  duration: TOTAL_DURATION_MS,
  filterId: 'normal',
  activeLutId: null,
  lutIntensity: 0.7,
  videoFile: null,
  videoUrl: null,
  thumbnailUrl: null,

  setGlobalPreset: (preset) =>
    set((state) => ({ globalPreset: { ...preset, position: state.globalPreset.position } })),

  updateGlobalField: (key, value) =>
    set((state) => ({ globalPreset: { ...state.globalPreset, [key]: value } })),
  applyGlobalToAll: () =>
    set((state) => ({ blocks: state.blocks.map((b) => ({ ...b, overrides: undefined })) })),
  updateBlock: (id, overrides) =>
    set((state) => ({ blocks: state.blocks.map((b) => b.id === id ? { ...b, overrides: { ...(b.overrides ?? {}), ...overrides } } : b) })),
  resetBlockOverrides: (id) =>
    set((state) => ({ blocks: state.blocks.map((b) => b.id === id ? { ...b, overrides: undefined } : b) })),
  selectBlock: (id) => set({ selectedBlockId: id }),
  setCurrentTime: (ms) => set({ currentTime: Math.max(0, Math.min(ms, get().duration)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setFilter: (id) => set({ filterId: id }),
  setLut: (id) => set({ activeLutId: id }),
  setLutIntensity: (v) => set({ lutIntensity: v }),
  setVideo: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ videoFile: file, videoUrl: URL.createObjectURL(file) });
  },
  clearVideo: () => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ videoFile: null, videoUrl: null, thumbnailUrl: null });
  },
  setThumbnail: (url) => set({ thumbnailUrl: url }),
  setDuration: (ms) => set({ duration: ms }),
}));
