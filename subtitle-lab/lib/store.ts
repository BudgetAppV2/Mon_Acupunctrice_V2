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
  globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } },
  blocks: TEST_BLOCKS,
  selectedBlockId: null,
  currentTime: 0,
  isPlaying: false,
  duration: TOTAL_DURATION_MS,

  // Preserve current position when switching presets
  setGlobalPreset: (preset) =>
    set((state) => ({
      globalPreset: { ...preset, position: state.globalPreset.position },
    })),

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
