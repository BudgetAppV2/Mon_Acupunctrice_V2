// Types liés à l'éditeur vidéo — séparés des types métier pour clarté

export type TextStylePreset = 'classic' | 'neon' | 'gold' | 'shadow' | 'bubbly' | 'minimal' | 'dark_pill';

export type TextAnimation = 'none' | 'fade' | 'fade_in' | 'slide_up' | 'slide_left' | 'bounce' | 'zoom' | 'scale_pop' | 'typewriter';

export interface TextOverlayItem {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  style: TextStylePreset;
  animation: TextAnimation;
  effect?: 'none' | 'outline' | 'double_outline' | 'glow' | 'pill';
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words: SubtitleWord[];
}

export type SubtitleStyle = 'classic' | 'tiktok' | 'karaoke' | 'bold_outline' | 'pill' | 'karaoke_pro';

// --- Subtitle Engine Pro ---

export type SubtitleFamily = 'narratif' | 'boldHighlight' | 'minimalWellness';
export type SubtitleDisplayType = 'narration' | 'highlight' | 'citation' | 'karaoke';
export type SubtitlePosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface HighlightedWord {
  wordIndex: number;
  color: string;
}

export interface SubtitleSegmentPro extends SubtitleSegment {
  displayType: SubtitleDisplayType;
  position: SubtitlePosition;
  /** Position libre en coordonnées relatives (0-1). Prend la priorité sur `position`. */
  positionX?: number;
  positionY?: number;
  highlightedWords?: HighlightedWord[];
  fontFamily?: string;
  fontSize?: number; // ratio de la largeur (ex: 0.045)
  animation?: 'fade' | 'slide-left' | 'slide-up' | 'pop' | 'none';
}

// --- Video Clips (multi-clip M1) ---

export interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  timelineStart: number;
  sourceVideoUrl?: string;
}

// --- Audio / Jamendo ---

export interface JamendoTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  audio: string;
  image: string;
}
