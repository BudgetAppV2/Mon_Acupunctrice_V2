export type AnimationType =
  | 'none'
  | 'fade'
  | 'pop'
  | 'slide-up'
  | 'typewriter'
  | 'karaoke'
  | 'bounce'
  | 'neon-pulse';

export interface AnimationConfig {
  type: AnimationType;
  wordDelay: number;   // ms between word animations
  duration: number;    // ms for each word animation
  easing: string;
}

export interface StylePreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  bgColor?: string;
  bgPadding?: number;
  bgBorderRadius?: number;
  outlineWidth?: number;
  outlineColor?: string;
  shadowBlur?: number;
  shadowColor?: string;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase';
  animation: AnimationConfig;
  position: { x: number; y: number };
}

export interface WordToken {
  text: string;
  startMs: number;
  endMs: number;
}

export interface SubtitleBlock {
  id: string;
  text: string;
  words: WordToken[];
  startMs: number;
  endMs: number;
  overrides?: Partial<StylePreset>;
}

// --- Multi-track types ---

export type TrackType = 'video' | 'subtitle' | 'audio';

export interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  duration: number;
  trimStart: number;
  trimEnd: number;
  timelineStart: number;
  filterId: string;
  thumbnailUrl: string | null;
  sourceVideoUrl: string | null;
}

export interface AudioClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  name: string;
  duration: number;
  startMs: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  audioUrl: string | null;
}

export interface SubtitleTrackData {
  blocks: SubtitleBlock[];
  globalPreset: StylePreset;
}

export interface Track {
  id: string;
  type: TrackType;
  label: string;
  muted: boolean;
  clips?: VideoClip[];
  subtitles?: SubtitleTrackData;
  audioClips?: AudioClip[];
}

// --- Text Overlays ---

export interface TextOverlay {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  style: StylePreset;
}

// --- Render types ---

export interface RenderWord {
  text: string;
  /** 0..1 progress of word's own animation */
  progress: number;
  /** true when this word is the "active" one (karaoke highlight) */
  active: boolean;
  index: number;
}
