'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorV2Store, getVideoTrack, getVideoTracks } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS, interpolateFilter } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClipsAllTracks, getFirstAudioUrl, coverCrop } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';

/**
 * Multi-track video pool: one <video> element per unique clip blobUrl.
 * Managed imperatively via refs (not React state) for performance.
 */
function useVideoPool() {
  const poolRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  const getOrCreate = useCallback((clipId: string, blobUrl: string): HTMLVideoElement => {
    const pool = poolRef.current;
    let vid = pool.get(clipId);
    if (vid && vid.src === blobUrl) return vid;
    // Create new element
    vid = document.createElement('video');
    vid.playsInline = true; vid.muted = true; vid.preload = 'auto';
    vid.src = blobUrl;
    pool.set(clipId, vid);
    return vid;
  }, []);

  const cleanup = useCallback(() => {
    for (const vid of poolRef.current.values()) {
      vid.pause(); vid.removeAttribute('src'); vid.load();
    }
    poolRef.current.clear();
  }, []);

  return { getOrCreate, poolRef, cleanup };
}

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const { getOrCreate, poolRef, cleanup: cleanupPool } = useVideoPool();

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks, filterIntensity: fIntensity,
    textOverlays, selectedOverlayId } = useEditorV2Store();
  const selOverlay = textOverlays.find(o => o.id === selectedOverlayId);
  const dragPos = selOverlay ? selOverlay.style.position : globalPreset.position;
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(dragPos, selectedOverlayId);

  const hasVideo = !!videoUrl;

  // Refs for RAF loop
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const textOverlaysRef = useRef(textOverlays);
  const timeRef = useRef(currentTime);
  const tracksRef = useRef(tracks);
  const filterIdRef = useRef(filterId);
  const fIntensityRef = useRef(fIntensity);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { filterIdRef.current = filterId; }, [filterId]);
  useEffect(() => { fIntensityRef.current = fIntensity; }, [fIntensity]);

  // Cleanup pool on unmount
  useEffect(() => cleanupPool, [cleanupPool]);

  // Draw one frame: composites all active tracks (highest priority first)
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = timeRef.current;
    const allTracks = tracksRef.current;
    const hasClips = allTracks.some(tr => tr.type === 'video' && tr.clips && tr.clips.length > 0);

    if (!hasClips) {
      // No clips — gradient drawn by renderFrame below
      renderFrame({
        canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
        currentMs: t, nowMs: performance.now(), canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
        skipBackground: false, textOverlays: textOverlaysRef.current,
      });
      return;
    }

    // Find active clips across all tracks
    const activeClips = findActiveClipsAllTracks(allTracks, t);

    if (activeClips.length === 0) {
      // Between clips — black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else {
      // Draw from lowest track to highest (painter's algorithm — highest covers lowest)
      for (let i = activeClips.length - 1; i >= 0; i--) {
        const { clip } = activeClips[i];
        if (!clip.blobUrl) continue;
        const vid = getOrCreate(clip.id, clip.blobUrl);
        if (vid.readyState < 2 || vid.videoWidth === 0) continue;

        // Resolve per-clip filter
        const cFid = (clip.filterId && clip.filterId !== 'normal') ? clip.filterId : filterIdRef.current;
        const af = FILTERS.find(f => f.id === cFid);
        const intensity = fIntensityRef.current;
        const filterCss = (af?.css && af.css !== 'none' && intensity > 0)
          ? (intensity >= 1 ? af.css : interpolateFilter(af.css, intensity))
          : 'none';

        if (filterCss !== 'none') ctx.filter = filterCss;
        const c = coverCrop(vid.videoWidth, vid.videoHeight, CANVAS_W, CANVAS_H);
        ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);
        ctx.filter = 'none';
      }
    }

    renderFrame({
      canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
      currentMs: t, nowMs: performance.now(), canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
      skipBackground: true, textOverlays: textOverlaysRef.current,
    });
  }, [getOrCreate]);

  // Init first clip metadata + thumbnail
  useEffect(() => {
    if (!videoUrl) return;
    const firstClipId = getVideoTrack(useEditorV2Store.getState().tracks)?.clips?.[0]?.id ?? null;
    if (!firstClipId) return;
    const vid = getOrCreate(firstClipId, videoUrl);
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useEditorV2Store.getState();
        store.setDuration(dMs);
        store.initClipDuration(firstClipId, dMs);
        vid.currentTime = Math.min(2, vid.duration);
        vid.onseeked = () => {
          try {
            const c = document.createElement('canvas'); c.width = 90; c.height = 160;
            c.getContext('2d')!.drawImage(vid, 0, 0, 90, 160);
            const u = c.toDataURL('image/jpeg', 0.7);
            if (u.length > 100) store.setThumbnail(u);
          } catch {}
          vid.currentTime = 0.01;
          vid.onseeked = null;
          drawFrame();
        };
      }
    };
    vid.addEventListener('loadedmetadata', onMeta);
    return () => vid.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl, drawFrame, getOrCreate]);

  // Pre-load video elements for all clips with blobUrls
  useEffect(() => {
    const videoTracks = getVideoTracks(tracks);
    for (const t of videoTracks) {
      for (const c of t.clips ?? []) {
        if (c.blobUrl) {
          const vid = getOrCreate(c.id, c.blobUrl);
          // Init duration if needed
          if (c.duration === 0 && vid.readyState >= 1 && vid.duration && isFinite(vid.duration)) {
            useEditorV2Store.getState().initClipDuration(c.id, vid.duration * 1000);
          }
        }
      }
    }
  }, [tracks, getOrCreate]);

  // Audio element
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) { if (!audioRef.current) audioRef.current = new Audio(); audioRef.current.src = url; audioRef.current.loop = true; }
    else if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src'); audioRef.current = null; }
  }, [tracks]);

  // Sync volumes on all pool videos
  useEffect(() => {
    for (const vid of poolRef.current.values()) vid.volume = voiceVolume;
  }, [voiceVolume, poolRef]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);

  // Play/pause: seek each active clip to correct position then play natively
  const prevPlayingRef = useRef(false);
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      // Starting playback — seek all active clips to their correct position then play
      const t = useEditorV2Store.getState().currentTime;
      const actives = findActiveClipsAllTracks(tracksRef.current, t);
      for (const { clip, localTimeMs } of actives) {
        if (!clip.blobUrl) continue;
        const vid = getOrCreate(clip.id, clip.blobUrl);
        vid.currentTime = localTimeMs / 1000;
        vid.muted = false; vid.volume = voiceVolume;
        vid.play().catch(() => {});
      }
    } else if (!isPlaying) {
      for (const vid of poolRef.current.values()) vid.pause();
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying, voiceVolume, poolRef, getOrCreate]);
  useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause(); } }, [isPlaying]);

  // Scrub: seek all relevant clips + redraw
  useEffect(() => {
    if (isPlaying) return;
    const allTracks = tracksRef.current;
    const activeClips = findActiveClipsAllTracks(allTracks, currentTime);
    let pendingSeeked = activeClips.length;

    for (const { clip, localTimeMs } of activeClips) {
      if (!clip.blobUrl) { pendingSeeked--; continue; }
      const vid = getOrCreate(clip.id, clip.blobUrl);
      vid.currentTime = localTimeMs / 1000;
      const onSeeked = () => {
        vid.removeEventListener('seeked', onSeeked);
        pendingSeeked--;
        if (pendingSeeked <= 0) drawFrame();
      };
      vid.addEventListener('seeked', onSeeked);
    }
    if (activeClips.length === 0) drawFrame();
  }, [currentTime, isPlaying, drawFrame, getOrCreate]);

  // Sync audio scrub
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);

  // Playback: wall clock advances currentTime, videos play natively
  // Only correct drift > 0.3s (heavy seeks kill framerate)
  useEffect(() => {
    if (!isPlaying) return;
    let prevWall: number | null = null;
    let id: number;
    const playingClips = new Set<string>(); // track which clips are currently playing
    const tick = (wallMs: number) => {
      if (prevWall !== null) {
        const store = useEditorV2Store.getState();
        if (!store.isPlaying) return;
        const n = store.currentTime + (wallMs - prevWall);
        if (n >= store.duration) { store.setCurrentTime(0); store.setIsPlaying(false); return; }
        store.setCurrentTime(n);
        // Apply fade-in/fade-out to audio volume
        if (audioRef.current) {
          const audioClip = store.tracks.find(t => t.type === 'audio')?.audioClips?.[0];
          if (audioClip && audioClip.duration > 0) {
            const clipTimeSec = n / 1000;
            const clipDurSec = audioClip.duration / 1000;
            let fadeMul = 1;
            if (audioClip.fadeIn > 0 && clipTimeSec < audioClip.fadeIn) {
              fadeMul = clipTimeSec / audioClip.fadeIn;
            }
            if (audioClip.fadeOut > 0 && clipTimeSec > clipDurSec - audioClip.fadeOut) {
              fadeMul = Math.min(fadeMul, (clipDurSec - clipTimeSec) / audioClip.fadeOut);
            }
            audioRef.current.volume = store.audioVolume * Math.max(0, Math.min(1, fadeMul));
          }
        }
        // Ensure active clips are playing, pause inactive ones
        const actives = findActiveClipsAllTracks(store.tracks, n);
        const activeIds = new Set(actives.map(a => a.clip.id));
        // Start clips that just became active
        for (const { clip, localTimeMs } of actives) {
          if (!clip.blobUrl) continue;
          const vid = poolRef.current.get(clip.id);
          if (!vid) continue;
          if (!playingClips.has(clip.id)) {
            vid.currentTime = localTimeMs / 1000;
            vid.muted = false; vid.volume = voiceVolume;
            vid.play().catch(() => {});
            playingClips.add(clip.id);
          } else {
            // Already playing — only correct big drift
            const expected = localTimeMs / 1000;
            if (Math.abs(vid.currentTime - expected) > 0.3) vid.currentTime = expected;
          }
        }
        // Pause clips that are no longer active
        for (const clipId of playingClips) {
          if (!activeIds.has(clipId)) {
            poolRef.current.get(clipId)?.pause();
            playingClips.delete(clipId);
          }
        }
      }
      prevWall = wallMs;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); playingClips.clear(); };
  }, [isPlaying, poolRef, voiceVolume]);

  // Render loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      drawFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(rafRef.current); };
  }, [drawFrame]);

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onMove(e, c); };

  return (
    <div className="relative w-full h-auto max-h-full" style={{ aspectRatio: '9/16' }}>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
    </div>
  );
}
