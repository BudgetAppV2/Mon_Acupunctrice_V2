/**
 * Adaptateur SubtitleSegment → SubtitleSegmentPro.
 * Enrichit les segments V1 avec les params Pro du store (position, animation, overrides).
 * Aucune migration Firestore — les données Pro ne sont pas persistées.
 */

import type { SubtitleSegment, SubtitleSegmentPro, SubtitlePosition, SubtitleDisplayType } from '@/lib/types';

type ProAnimation = 'fade' | 'slide-left' | 'slide-up' | 'pop' | 'none';

export function toProSegments(
  segments: SubtitleSegment[],
  position: SubtitlePosition,
  animation: ProAnimation,
  displayType: SubtitleDisplayType = 'narration',
  overrides: Record<string, { position?: SubtitlePosition; fontSize?: number }> = {},
): SubtitleSegmentPro[] {
  return segments.map(seg => {
    const ov = overrides[seg.id] ?? {};
    return {
      ...seg,
      displayType,
      position: ov.position ?? position,
      animation,
      fontSize: ov.fontSize,
      highlightedWords: [],
    };
  });
}
