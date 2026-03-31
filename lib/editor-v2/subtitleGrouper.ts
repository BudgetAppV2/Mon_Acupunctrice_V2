interface SubtitleWord { word: string; start: number; end: number }
interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words: SubtitleWord[];
}

/** Group words into segments of 3-4 words (TikTok style) */
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
