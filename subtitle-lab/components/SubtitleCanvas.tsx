'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSubtitleStore, getVideoTrack } from '../lib/store';
import { renderFrame } from '../lib/renderer';
import { FILTERS } from '../lib/filters';
import { CANVAS_W, CANVAS_H, findActiveClip,
  createVideoElement, getFirstAudioUrl } from '../lib/playback';
import { useSubtitleDrag } from '../lib/useSubtitleDrag';
import { initWebGL, renderVideoFrame, destroyWebGL, cssFilterToUniforms, IDENTITY_UNIFORMS } from '../lib/webglRenderer';

export default function SubtitleCanvas() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const activeClipIdRef = useRef<string | null>(null);
  const glInitRef = useRef(false);

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks, filterIntensity: fIntensity,
    textOverlays, selectedOverlayId } = useSubtitleStore();
  const selOverlay = textOverlays.find(o => o.id === selectedOverlayId);
  const dragPos = selOverlay ? selOverlay.style.position : globalPreset.position;
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(dragPos, selectedOverlayId);

  // Refs for RAF loop
  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const durationRef = useRef(duration);
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const tracksRef = useRef(tracks);
  const filterIdRef = useRef(filterId);
  const filterIntensityRef = useRef(fIntensity);
  const textOverlaysRef = useRef(textOverlays);

  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { filterIdRef.current = filterId; }, [filterId]);
  useEffect(() => { filterIntensityRef.current = fIntensity; }, [fIntensity]);
  useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);

  // Init WebGL on mount
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (glCanvas && !glInitRef.current) {
      glInitRef.current = initWebGL(glCanvas);
    }
    return () => { destroyWebGL(); glInitRef.current = false; };
  }, []);

  // Two video elements for double-buffered playback
  useEffect(() => {
    videoRef.current = createVideoElement();
    preloadRef.current = createVideoElement();
    return () => {
      [videoRef, preloadRef].forEach(r => { r.current?.pause(); r.current?.removeAttribute('src'); r.current?.load(); });
      videoRef.current = null; preloadRef.current = null;
    };
  }, []);

  // Audio element
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) { if (!audioRef.current) audioRef.current = new Audio(); audioRef.current.src = url; audioRef.current.loop = true; }
    else if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src'); audioRef.current = null; }
  }, [tracks]);

  // Sync volumes
  useEffect(() => { if (videoRef.current) videoRef.current.volume = voiceVolume; if (preloadRef.current) preloadRef.current.volume = voiceVolume; }, [voiceVolume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);

  // Load video source + init clip duration
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoUrl) return;
    vid.src = videoUrl;
    const firstClipId = getVideoTrack(tracksRef.current)?.clips?.[0]?.id ?? null;
    activeClipIdRef.current = firstClipId;
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useSubtitleStore.getState();
        store.setDuration(dMs);
        if (firstClipId) store.initClipDuration(firstClipId, dMs);
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
        };
      }
    };
    vid.addEventListener('loadedmetadata', onMeta);
    return () => vid.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  // Play/pause
  useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause(); } }, [isPlaying]);
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);
  useEffect(() => { const v = videoRef.current; if (!v) return; if (isPlaying) { v.muted = false; v.volume = voiceVolume; v.play().catch(() => {}); } else { v.pause(); } }, [isPlaying, voiceVolume]);

  // Scrub video to correct clip
  useEffect(() => {
    const vid = videoRef.current; if (!vid || isPlaying) return;
    const r = findActiveClip(tracksRef.current, currentTime);
    if (r) {
      if (r.clip.id !== activeClipIdRef.current && r.clip.blobUrl) { vid.src = r.clip.blobUrl; activeClipIdRef.current = r.clip.id; }
      vid.currentTime = r.localTimeMs / 1000;
    } else {
      const allClips = tracksRef.current.filter(t => t.type === 'video').flatMap(t => t.clips ?? []);
      if (allClips.length > 0 && duration > 0) {
        const first = allClips[0];
        if (first.blobUrl && first.duration > 0) {
          if (activeClipIdRef.current !== first.id) { vid.src = first.blobUrl; activeClipIdRef.current = first.id; }
          vid.currentTime = Math.min((currentTime / duration) * (first.duration / 1000), first.duration / 1000);
        }
      }
    }
  }, [currentTime, isPlaying, duration]);

  // RAF loop — WebGL for video+filters, 2D overlay for subtitles
  useEffect(() => {
    let prevWall: number | null = null;
    const loop = (wallMs: number) => {
      const vid = videoRef.current;
      const ar = findActiveClip(tracksRef.current, timeRef.current);

      // Clip switch detection
      if (vid && ar && ar.clip.id !== activeClipIdRef.current) {
        activeClipIdRef.current = ar.clip.id;
        if (ar.clip.blobUrl) {
          vid.src = ar.clip.blobUrl; vid.currentTime = ar.localTimeMs / 1000;
          if (ar.clip.duration === 0) {
            const clipId = ar.clip.id;
            const onM = () => { if (vid.duration && isFinite(vid.duration)) { useSubtitleStore.getState().initClipDuration(clipId, vid.duration * 1000); } vid.removeEventListener('loadedmetadata', onM); };
            vid.addEventListener('loadedmetadata', onM);
          }
          if (playingRef.current) vid.play().catch(() => {});
        }
      }

      // Playback time advancement
      if (playingRef.current) {
        if (vid && vid.readyState >= 2 && ar) {
          const gMs = ar.clip.timelineStart + (vid.currentTime * 1000 - ar.clip.trimStart);
          if (gMs >= 0 && Math.abs(gMs - timeRef.current) > 50) useSubtitleStore.getState().setCurrentTime(gMs);
        } else if (prevWall !== null) {
          const n = timeRef.current + (wallMs - prevWall);
          if (n >= durationRef.current) { useSubtitleStore.getState().setCurrentTime(0); useSubtitleStore.getState().setIsPlaying(false); }
          else useSubtitleStore.getState().setCurrentTime(n);
        }
        prevWall = wallMs;
      } else { prevWall = null; }

      // --- RENDER ---
      const hasAnyClips = tracksRef.current.some(t => t.type === 'video' && t.clips && t.clips.length > 0);

      // 1. WebGL canvas — video + filters
      if (glInitRef.current && vid && vid.readyState >= 2 && vid.videoWidth > 0 && (ar || hasAnyClips)) {
        // Resolve filter uniforms
        const cFid = (ar?.clip.filterId && ar.clip.filterId !== 'normal') ? ar.clip.filterId : filterIdRef.current;
        const af = FILTERS.find(f => f.id === cFid);
        const uniforms = af ? cssFilterToUniforms(af.css, filterIntensityRef.current) : IDENTITY_UNIFORMS;
        renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
      } else if (glInitRef.current) {
        // No video ready — clear WebGL to black/transparent
        const glCanvas = glCanvasRef.current;
        if (glCanvas) {
          const gl = glCanvas.getContext('webgl');
          if (gl) { gl.clearColor(0, 0, 0, hasAnyClips ? 1 : 0); gl.clear(gl.COLOR_BUFFER_BIT); }
        }
      }

      // 2. 2D overlay canvas — subtitles + text overlays
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          renderFrame({
            canvas: overlay, blocks: blocksRef.current, globalPreset: presetRef.current,
            currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
            skipBackground: hasAnyClips || !!ar, textOverlays: textOverlaysRef.current,
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onMove(e, c); };

  return (
    <div className="relative w-full h-auto max-h-full" style={{ aspectRatio: '9/16' }}>
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
