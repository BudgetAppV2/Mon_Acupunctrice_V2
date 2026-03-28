/**
 * Adaptateur SubtitleSegment → SubtitleSegmentPro.
 * Enrichit les segments V1 avec les params Pro du store (position, animation).
 * Aucune migration Firestore — les données Pro ne sont pas persistées.
 */

import type { SubtitleSegment, SubtitleSegmentPro, SubtitlePosition } from '@/lib/types';

type ProAnimation = 'fade' | 'slide-left' | 'slide-up' | 'pop' | 'none';

export function toProSegments(
  segments: SubtitleSegment[],
  position: SubtitlePosition,
  animation: ProAnimation,
): SubtitleSegmentPro[] {
  return segments.map(seg => ({
    ...seg,
    displayType: 'narration' as const,
    position,
    animation,
  }));
}
