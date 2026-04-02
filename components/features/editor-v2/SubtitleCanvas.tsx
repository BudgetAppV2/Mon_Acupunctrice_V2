'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorV2Store, getVideoTrack, getVideoTracks } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClipsAllTracks, getFirstAudioUrl } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';
import { initWebGL, renderVideoFrame, destroyWebGL, cssFilterToUniforms, IDENTITY_UNIFORMS } from '@/lib/editor-v2/webglRenderer';

function useVideoPool() {
  const poolRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const getOrCreate = useCallback((clipId: string, blobUrl: string): HTMLVideoElement => {
    const pool = poolRef.current;
    let vid = pool.get(clipId);
    if (vid && vid.src === blobUrl) return vid;
    vid = document.createElement('video');
    vid.playsInline = true; vid.muted = true; vid.preload = 'auto';
    vid.src = blobUrl;
    pool.set(clipId, vid);
    return vid;
  }, []);
  const cleanup = useCallback(() => {
    for (const vid of poolRef.current.values()) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
    poolRef.current.clear();
  }, []);
  return { getOrCreate, poolRef, cleanup };
}

export default function SubtitleCanvas() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const glInitRef = useRef(false);
  const { getOrCreate, poolRef, cleanup: cleanupPool } = useVideoPool();

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks, filterIntensity: fIntensity,
    textOverlays } = useEditorV2Store();
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag();

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

  // Init WebGL + cleanup
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (glCanvas && !glInitRef.current) glInitRef.current = initWebGL(glCanvas);
    return () => { destroyWebGL(); glInitRef.current = false; };
  }, []);

  useEffect(() => cleanupPool, [cleanupPool]);

  // Draw WebGL video layer only (called by rVFC or on scrub seeked)
  const drawVideo = useCallback(() => {
    if (!glInitRef.current) return;
    const t = timeRef.current;
    const allTracks = tracksRef.current;
    const hasClips = allTracks.some(tr => tr.type === 'video' && tr.clips && tr.clips.length > 0);

    if (hasClips) {
      const activeClips = findActiveClipsAllTracks(allTracks, t);
      if (activeClips.length === 0) {
        const gl = glCanvasRef.current?.getContext('webgl');
        if (gl) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      } else {
        for (let i = activeClips.length - 1; i >= 0; i--) {
          const { clip } = activeClips[i];
          if (!clip.blobUrl) continue;
          const vid = getOrCreate(clip.id, clip.blobUrl);
          if (vid.readyState < 2 || vid.videoWidth === 0) continue;
          const cFid = (clip.filterId && clip.filterId !== 'normal') ? clip.filterId : filterIdRef.current;
          const af = FILTERS.find(f => f.id === cFid);
          const uniforms = af ? cssFilterToUniforms(af.css, fIntensityRef.current) : IDENTITY_UNIFORMS;
          renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
        }
      }
    } else {
      const gl = glCanvasRef.current?.getContext('webgl');
      if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    }
  }, [getOrCreate]);

  // Draw 2D overlay only (called at 60fps by RAF for fluid subtitle drag)
  const drawOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    const t = timeRef.current;
    const hasClips = tracksRef.current.some(tr => tr.type === 'video' && tr.clips && tr.clips.length > 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    renderFrame({
      canvas: overlay, blocks: blocksRef.current, globalPreset: presetRef.current,
      currentMs: t, nowMs: performance.now(), canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
      skipBackground: hasClips, textOverlays: textOverlaysRef.current,
    });
  }, []);

  // Combined draw for scrub (both layers at once)
  const drawFrame = useCallback(() => { drawVideo(); drawOverlay(); }, [drawVideo, drawOverlay]);

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

  // Pre-load video elements for all clips
  useEffect(() => {
    for (const t of getVideoTracks(tracks)) {
      for (const c of t.clips ?? []) {
        if (c.blobUrl) {
          const vid = getOrCreate(c.id, c.blobUrl);
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

  // Sync volumes
  useEffect(() => { for (const vid of poolRef.current.values()) vid.volume = voiceVolume; }, [voiceVolume, poolRef]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);

  // Play/pause
  const prevPlayingRef = useRef(false);
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      const t = useEditorV2Store.getState().currentTime;
      const actives = findActiveClipsAllTracks(tracksRef.current, t);
      for (const { clip, localTimeMs } of actives) {
        if (!clip.blobUrl) continue;
        const vid = getOrCreate(clip.id, clip.blobUrl);
        vid.currentTime = localTimeMs / 1000;
        vid.muted = voiceVolume === 0; vid.volume = voiceVolume;
        console.log('[VID_AUDIO]', JSON.stringify({ muted: vid.muted, vidVol: voiceVolume, hasMusic: !!getFirstAudioUrl(tracks) }));
        vid.play().catch(() => {});
      }
    } else if (!isPlaying) {
      for (const vid of poolRef.current.values()) vid.pause();
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying, voiceVolume, poolRef, getOrCreate]);
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // Scrub: seek all relevant clips + redraw
  useEffect(() => {
    if (isPlaying) return;
    const activeClips = findActiveClipsAllTracks(tracksRef.current, currentTime);
    let pending = activeClips.length;
    for (const { clip, localTimeMs } of activeClips) {
      if (!clip.blobUrl) { pending--; continue; }
      const vid = getOrCreate(clip.id, clip.blobUrl);
      vid.currentTime = localTimeMs / 1000;
      const onSeeked = () => { vid.removeEventListener('seeked', onSeeked); pending--; if (pending <= 0) drawFrame(); };
      vid.addEventListener('seeked', onSeeked);
    }
    if (activeClips.length === 0) drawFrame();
  }, [currentTime, isPlaying, drawFrame, getOrCreate]);

  // Sync audio scrub
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);

  // Playback: wall clock + fade audio + multi-track clip management
  useEffect(() => {
    if (!isPlaying) return;
    let prevWall: number | null = null;
    let lastStoreUpdate: number | null = null;
    let id: number;
    const playingClips = new Set<string>();
    const tick = (wallMs: number) => {
      if (prevWall !== null) {
        const store = useEditorV2Store.getState();
        if (!store.isPlaying) return;
        // Use timeRef (always up-to-date) instead of store.currentTime (throttled, can be stale)
        const n = timeRef.current + (wallMs - prevWall);
        if (n >= store.duration) { store.setCurrentTime(0); store.setIsPlaying(false); timeRef.current = 0; return; }
        timeRef.current = n;
        // Throttle store updates to ~15fps to reduce React re-renders on mobile
        if (!lastStoreUpdate || wallMs - lastStoreUpdate > 66) {
          store.setCurrentTime(n);
          lastStoreUpdate = wallMs;
        }
        // Audio fade
        if (audioRef.current) {
          const audioClip = store.tracks.find(t => t.type === 'audio')?.audioClips?.[0];
          if (audioClip) {
            const sec = n / 1000, durSec = store.duration / 1000;
            let mul = 1;
            if (audioClip.fadeIn > 0 && sec < audioClip.fadeIn) mul = sec / audioClip.fadeIn;
            if (audioClip.fadeOut > 0 && sec > durSec - audioClip.fadeOut) mul = Math.min(mul, (durSec - sec) / audioClip.fadeOut);
            audioRef.current.volume = store.audioVolume * Math.max(0, Math.min(1, mul));
          }
        }

        // Multi-track clip management
        const actives = findActiveClipsAllTracks(store.tracks, n);
        const activeIds = new Set(actives.map(a => a.clip.id));
        for (const { clip, localTimeMs } of actives) {
          if (!clip.blobUrl) continue;
          const vid = poolRef.current.get(clip.id);
          if (!vid) continue;
          if (!playingClips.has(clip.id)) {
            // First time playing this clip — seek to start position then play
            vid.currentTime = localTimeMs / 1000;
            vid.muted = voiceVolume === 0;
            vid.volume = voiceVolume;
            vid.play().catch(() => {});
            playingClips.add(clip.id);
          }
          // IMPORTANT: Do NOT seek during play — Safari iOS interrupts the
          // decoder pipeline on every seek causing 300-400ms stutter gaps.
          // Let vid.play() advance naturally. The wall clock and vid.currentTime
          // may drift slightly but this is acceptable for smooth playback.
        }
        for (const clipId of playingClips) {
          if (!activeIds.has(clipId)) { poolRef.current.get(clipId)?.pause(); playingClips.delete(clipId); }
        }
      }
      prevWall = wallMs;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); playingClips.clear(); };
  }, [isPlaying, poolRef, voiceVolume]);

  // rVFC: redraw WebGL video only when decoder has a new frame (no judder)
  const rvfcIdsRef = useRef<Map<string, number>>(new Map());
  useEffect(() => {
    if (!isPlaying) { rvfcIdsRef.current.clear(); return; }
    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    if (!hasRVFC) return; // fallback handled by overlay RAF below

    const registerRVFC = (vid: HTMLVideoElement, clipId: string) => {
      if (rvfcIdsRef.current.has(clipId)) return;
      const cb = () => {
        drawVideo();
        if (useEditorV2Store.getState().isPlaying) {
          const id = (vid as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(cb);
          rvfcIdsRef.current.set(clipId, id);
        } else {
          rvfcIdsRef.current.delete(clipId);
        }
      };
      const id = (vid as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(cb);
      rvfcIdsRef.current.set(clipId, id);
    };

    // Register rVFC for all currently active clips
    const actives = findActiveClipsAllTracks(tracksRef.current, timeRef.current);
    for (const { clip } of actives) {
      if (!clip.blobUrl) continue;
      const vid = poolRef.current.get(clip.id);
      if (vid) registerRVFC(vid, clip.id);
    }

    return () => { rvfcIdsRef.current.clear(); };
  }, [isPlaying, drawVideo, poolRef]);

  // RAF loop: overlays at 60fps + fallback video render when paused or no rVFC
  useEffect(() => {
    let active = true;
    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    const loop = () => {
      if (!active) return;
      // Video: only draw here if paused or browser lacks rVFC
      const playing = useEditorV2Store.getState().isPlaying;
      if (!playing || !hasRVFC) drawVideo();
      // Overlays: always at 60fps
      drawOverlay();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(rafRef.current); };
  }, [drawVideo, drawOverlay]);

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onMove(e, c); };

  return (
    <div className="relative h-full mx-auto" style={{ aspectRatio: '9/16', maxHeight: '100%', maxWidth: '100%' }}>
      {/* WebGL canvas — video + GPU filters */}
      <canvas ref={glCanvasRef} width={CANVAS_W} height={CANVAS_H}
        className="absolute inset-0 w-full h-full" />

      {/* 2D overlay canvas — subtitles + text overlays (transparent) */}
      <canvas ref={overlayCanvasRef} width={CANVAS_W} height={CANVAS_H}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
    </div>
  );
}
