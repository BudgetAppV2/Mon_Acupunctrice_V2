/**
 * Playback helpers — extract video/audio element management
 * from SubtitleCanvas to stay under the 150-line component limit.
 */

import type { Track, VideoClip } from './types';
import { getVideoTracks, getClipAtTime, getAudioTrack } from './store';

export const CANVAS_W = 540;
export const CANVAS_H = 960;

/** Find the active clip across all video tracks at a given time (first track wins) */
export function findActiveClip(
  tracks: Track[],
  timeMs: number,
): { clip: VideoClip; localTimeMs: number } | null {
  for (const t of getVideoTracks(tracks)) {
    if (!t.clips?.length) continue;
    const r = getClipAtTime(t.clips, timeMs);
    if (r) return r;
  }
  return null;
}

/** Find the active video clip object (no localTime) */
export function findActiveVideoClip(tracks: Track[], timeMs: number): VideoClip | null {
  const r = findActiveClip(tracks, timeMs);
  return r?.clip ?? null;
}

/** Find the active clip on each video track (for multi-track compositing) */
export function findActiveClipsAllTracks(
  tracks: Track[],
  timeMs: number,
): { clip: VideoClip; localTimeMs: number; trackIndex: number }[] {
  const results: { clip: VideoClip; localTimeMs: number; trackIndex: number }[] = [];
  const videoTracks = getVideoTracks(tracks);
  for (let i = 0; i < videoTracks.length; i++) {
    const t = videoTracks[i];
    if (!t.clips?.length) continue;
    const r = getClipAtTime(t.clips, timeMs);
    if (r) results.push({ ...r, trackIndex: i });
  }
  return results;
}

/** Create a hidden <video> element for playback */
export function createVideoElement(): HTMLVideoElement {
  const v = document.createElement('video');
  v.playsInline = true;
  v.muted = true;
  v.preload = 'auto';
  return v;
}

/** Get the first audio clip's blobUrl from tracks */
export function getFirstAudioUrl(tracks: Track[]): string | null {
  const at = getAudioTrack(tracks);
  return at?.audioClips?.[0]?.blobUrl ?? null;
}

/** Compute crop params for cover-fit drawing */
export function coverCrop(
  vw: number, vh: number, cw: number, ch: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const vAspect = vw / vh;
  const cAspect = cw / ch;
  let sx = 0, sy = 0, sw = vw, sh = vh;
  if (vAspect > cAspect) {
    sw = vh * cAspect;
    sx = Math.round((vw - sw) / 2);
  } else {
    sh = vw / cAspect;
    sy = Math.round((vh - sh) / 2);
  }
  return { sx, sy, sw, sh };
}
