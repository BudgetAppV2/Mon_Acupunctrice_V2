/**
 * Track helper functions extracted from the Lab store.
 * Pure functions — no Zustand store instance here.
 * The actual V2 store lives at lib/store/useEditorV2Store.ts
 */

import type { Track, VideoClip } from './types';

export function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => { const u = { ...c, timelineStart: t }; t += c.trimEnd - c.trimStart; return u; });
}

export function getVideoTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'video'); }
export function getVideoTracks(tracks: Track[]): Track[] { return tracks.filter(t => t.type === 'video'); }
export function getSubtitleTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'subtitle'); }
export function getAudioTrack(tracks: Track[]): Track | undefined { return tracks.find(t => t.type === 'audio'); }

export function getClipAtTime(
  clips: VideoClip[],
  globalTimeMs: number,
): { clip: VideoClip; localTimeMs: number } | null {
  for (const c of clips) {
    const absStart = c.timelineStart + c.trimStart;
    const absEnd = c.timelineStart + c.trimEnd;
    if (globalTimeMs >= absStart && globalTimeMs < absEnd) {
      return { clip: c, localTimeMs: c.trimStart + (globalTimeMs - absStart) };
    }
  }
  return null;
}

export function getActiveVideoClip(tracks: Track[], currentTimeMs: number): VideoClip | null {
  for (const t of getVideoTracks(tracks)) {
    if (!t.clips?.length) continue;
    const result = getClipAtTime(t.clips, currentTimeMs);
    if (result) return result.clip;
  }
  return null;
}

export function totalClipsDuration(tracks: Track[]): number {
  let maxEnd = 0;
  for (const t of getVideoTracks(tracks)) {
    if (!t.clips?.length) continue;
    for (const c of t.clips) {
      const clipEnd = c.timelineStart + c.trimEnd;
      maxEnd = Math.max(maxEnd, clipEnd);
    }
  }
  return maxEnd;
}

export function syncFlatFromTracks(tracks: Track[]) {
  let first: VideoClip | undefined;
  for (const t of getVideoTracks(tracks)) {
    if (t.clips?.length) { first = t.clips[0]; break; }
  }
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    thumbnailUrl: first?.thumbnailUrl ?? null,
  };
}
