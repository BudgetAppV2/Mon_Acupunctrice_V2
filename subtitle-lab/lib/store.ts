import { create } from 'zustand';
import type { StylePreset, SubtitleBlock } from './types';
import { DEFAULT_PRESET } from './presets';
import { TEST_BLOCKS, TOTAL_DURATION_MS } from './testData';

interface SubtitleStore {
  globalPreset: StylePreset;
  blocks: SubtitleBlock[];
  selectedBlockId: string | null;
  currentTime: number; // ms
  isPlaying: boolean;
  duration: number; // ms

  setGlobalPreset: (preset: StylePreset) => void;
  applyGlobalToAll: () => void;
  updateGlobalField: <K extends keyof StylePreset>(key: K, value: StylePreset[K]) => void;
  updateBlock: (id: string, overrides: Partial<StylePreset>) => void;
  resetBlockOverrides: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setCurrentTime: (ms: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useSubtitleStore = create<SubtitleStore>((set, get) => ({
  globalPreset: DEFAULT_PRESET,
  blocks: TEST_BLOCKS,
  selectedBlockId: null,
  currentTime: 0,
  isPlaying: false,
  duration: TOTAL_DURATION_MS,

  setGlobalPreset: (preset) => set({ globalPreset: preset }),

  updateGlobalField: (key, value) =>
    set((state) => ({
      globalPreset: { ...state.globalPreset, [key]: value },
    })),

  applyGlobalToAll: () =>
    set((state) => ({
      blocks: state.blocks.map((b) => ({ ...b, overrides: undefined })),
    })),

  updateBlock: (id, overrides) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, overrides: { ...(b.overrides ?? {}), ...overrides } } : b,
      ),
    })),

  resetBlockOverrides: (id) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, overrides: undefined } : b,
      ),
    })),

  selectBlock: (id) => set({ selectedBlockId: id }),

  setCurrentTime: (ms) => set({ currentTime: Math.max(0, Math.min(ms, get().duration)) }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
