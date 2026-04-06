/**
 * GSAP animation presets for the image editor.
 * 3 categories: text (SplitType overlay), general (entrance), continuous (loop).
 */

export type AnimCategory = 'text' | 'general' | 'continuous';

export interface TextAnimPreset {
  id: string;
  name: string;
  category: 'text';
  split: 'chars' | 'words';
  from: Record<string, unknown>;
  stagger: number;
  duration: number;
  ease: string;
}

export interface GeneralAnimPreset {
  id: string;
  name: string;
  category: 'general';
  /** Delta for left/top (added to current); absolute for opacity/scale/angle */
  from: Record<string, number>;
  duration: number;
  ease: string;
}

export interface ContinuousAnimPreset {
  id: string;
  name: string;
  category: 'continuous';
  /** Target values — delta for left/top, multiplier for scale, absolute for opacity/angle */
  to: Record<string, number>;
  duration: number;
  ease: string;
  yoyo: boolean;
}

export type AnimPreset = TextAnimPreset | GeneralAnimPreset | ContinuousAnimPreset;

// --- Text presets (require SplitType HTML overlay) ---
export const TEXT_PRESETS: TextAnimPreset[] = [
  { id: 'machine_a_ecrire', name: 'Machine a ecrire', category: 'text', split: 'chars', from: { opacity: 0 }, stagger: 0.05, duration: 0.05, ease: 'none' },
  { id: 'ascension', name: 'Ascension', category: 'text', split: 'words', from: { y: 30, opacity: 0 }, stagger: 0.15, duration: 0.5, ease: 'power2.out' },
  { id: 'fusion', name: 'Fusion', category: 'text', split: 'chars', from: { x: 40, opacity: 0 }, stagger: 0.03, duration: 0.6, ease: 'power3.out' },
  { id: 'explosion', name: 'Explosion', category: 'text', split: 'chars', from: { scale: 0, opacity: 0 }, stagger: 0.03, duration: 0.5, ease: 'back.out(2)' },
  { id: 'rebond', name: 'Rebond', category: 'text', split: 'chars', from: { y: -50, opacity: 0 }, stagger: 0.05, duration: 0.8, ease: 'bounce.out' },
];

// --- General presets (entrance animations on Fabric objects) ---
export const GENERAL_PRESETS: GeneralAnimPreset[] = [
  { id: 'fondu', name: 'Fondu', category: 'general', from: { opacity: 0 }, duration: 1, ease: 'power2.out' },
  { id: 'balayage', name: 'Balayage', category: 'general', from: { leftDelta: -150 }, duration: 0.8, ease: 'power2.out' },
  { id: 'pop', name: 'Pop', category: 'general', from: { scaleX: 0, scaleY: 0 }, duration: 0.6, ease: 'back.out(2)' },
  { id: 'zoom', name: 'Zoom', category: 'general', from: { scaleX: 0.3, scaleY: 0.3, opacity: 0 }, duration: 0.8, ease: 'power2.out' },
  { id: 'chute', name: 'Chute', category: 'general', from: { topDelta: -300 }, duration: 0.7, ease: 'bounce.out' },
  { id: 'roulade', name: 'Roulade', category: 'general', from: { angle: -180, opacity: 0 }, duration: 0.8, ease: 'power2.out' },
  { id: 'derive', name: 'Derive', category: 'general', from: { leftDelta: -80, opacity: 0 }, duration: 2.5, ease: 'power1.inOut' },
];

// --- Continuous presets (infinite loop animations) ---
export const CONTINUOUS_PRESETS: ContinuousAnimPreset[] = [
  { id: 'rotation', name: 'Rotation', category: 'continuous', to: { angleDelta: 360 }, duration: 3, ease: 'none', yoyo: false },
  { id: 'impulsion', name: 'Impulsion', category: 'continuous', to: { scaleMultiplier: 1.08 }, duration: 0.8, ease: 'power1.inOut', yoyo: true },
  { id: 'scintillement', name: 'Scintillement', category: 'continuous', to: { opacity: 0.3 }, duration: 0.6, ease: 'power1.inOut', yoyo: true },
  { id: 'tremblement', name: 'Tremblement', category: 'continuous', to: { leftDelta: 4, topDelta: 3 }, duration: 0.05, ease: 'none', yoyo: true },
];

export const ALL_PRESETS: AnimPreset[] = [...TEXT_PRESETS, ...GENERAL_PRESETS, ...CONTINUOUS_PRESETS];

export function findPreset(id: string): AnimPreset | undefined {
  return ALL_PRESETS.find((p) => p.id === id);
}
