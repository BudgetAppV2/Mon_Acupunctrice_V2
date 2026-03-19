import type { SubtitleWord, SubtitleSegment } from '@/lib/types';

/** Groupe les mots Whisper en segments de 3-4 mots (style TikTok) */
export function groupWords(words: SubtitleWord[], perGroup = 4): SubtitleSegment[] {
  const segs: SubtitleSegment[] = [];
  for (let i = 0; i < words.length; i += perGroup) {
    const g = words.slice(i, i + perGroup);
    segs.push({
      id: `seg_${segs.length}`,
      text: g.map(w => w.word).join(' '),
      startTime: g[0].start,
      endTime: g[g.length - 1].end,
      words: g,
    });
  }
  return segs;
}
