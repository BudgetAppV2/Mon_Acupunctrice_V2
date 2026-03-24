import type { Timestamp } from 'firebase/firestore';

// --- Auth ---

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// --- Content ---

export type ContentCategory =
  | 'fertilite'
  | 'grossesse'
  | 'bien_etre'
  | 'mtc'
  | 'autre';

export type WorkflowState =
  | 'idea'
  | 'planned'
  | 'ready_to_shoot'
  | 'shot'
  | 'editing'
  | 'ready';

export type DistributionStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

export interface ContentItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  notes?: string;
  workflowState: WorkflowState;
  videoUrl?: string;
  thumbnailUrl?: string;
  distributionStatus: DistributionStatus;
  scheduledAt?: Timestamp;
  publishedAt?: Timestamp;
  instagramPostId?: string;
  caption?: string;
  coverOption?: 'frame' | 'custom';
  thumbOffset?: number;
  coverImageUrl?: string;
  editorTouchedAt?: Timestamp;
  exportedAt?: Timestamp;
  captionDraft?: string;
  facebookStatus?: 'pending' | 'published' | 'failed';
  facebookPostId?: string;
  youtubeStatus?: 'pending' | 'published' | 'failed' | 'quota_exceeded';
  youtubeVideoId?: string;
  insights?: {
    plays: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saved: number;
    fetchedAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const DEFAULT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'fertilite', label: 'Fertilité' },
  { value: 'grossesse', label: 'Grossesse' },
  { value: 'bien_etre', label: 'Bien-être' },
  { value: 'mtc', label: 'MTC' },
  { value: 'autre', label: 'Autre' },
];

// --- Labels d'affichage ---

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  fertilite: 'Fertilité',
  grossesse: 'Grossesse',
  bien_etre: 'Bien-être',
  mtc: 'MTC',
  autre: 'Autre',
};

export const WORKFLOW_LABELS: Record<WorkflowState, string> = {
  idea: 'Idée',
  planned: 'Planifiée',
  ready_to_shoot: 'À filmer',
  shot: 'Filmée',
  editing: 'Montage',
  ready: 'Prête',
};

// --- Editor: Text Overlay ---

export type TextStylePreset = 'classic' | 'neon' | 'gold' | 'shadow' | 'bubbly' | 'minimal' | 'dark_pill';

export type TextAnimation = 'none' | 'fade' | 'slide_up' | 'slide_left' | 'bounce' | 'zoom';

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
}

// --- Editor: Subtitles ---

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

export type SubtitleStyle = 'classic' | 'tiktok' | 'karaoke';

// --- Progression & Jalons ---

export interface ProgressData {
  currentStreak: number;
  longestStreak: number;
  totalPublished: number;
  milestonesUnlocked: string[];
  lastActiveWeek: string;  // "2026-W15" format ISO
  pendingMilestoneToasts: string[];  // Jalons non encore affiches
}

// --- Editor: Audio / Jamendo ---

export interface JamendoTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  audio: string;
  image: string;
}
