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

// Re-export des types editeur pour backward compat
export type { TextOverlayItem, SubtitleSegment, SubtitleStyle, TextStylePreset, TextAnimation } from './editor';
export type { JamendoTrack, SubtitleWord } from './editor';
