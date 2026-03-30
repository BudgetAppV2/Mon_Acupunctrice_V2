'use client';

import { useEffect, useRef, useState } from 'react';
import { useSubtitleStore } from '../lib/store';
import { renderFrame } from '../lib/renderer';
import { FILTERS } from '../lib/filters';
import { applyLut } from '../lib/luts/lutRenderer';
import { getLutData } from '../lib/luts/presets';

const CANVAS_W = 540;
const CANVAS_H = 960;

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);

  const { blocks, globalPreset, currentTime, isPlaying, duration, setCurrentTime, setIsPlaying,
    filterId, activeLutId, lutIntensity, videoUrl, setDuration, setThumbnail } = useSubtitleStore();

  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const durationRef = useRef(duration);
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const lutIdRef = useRef(activeLutId);
  const lutIntensityRef = useRef(lutIntensity);
  const videoUrlRef = useRef(videoUrl);

  useEffect(() => { timeRef.current = currentTime; }, [currentTime]); useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { durationRef.current = duration; }, [duration]); useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]); useEffect(() => { lutIdRef.current = activeLutId; }, [activeLutId]);
  useEffect(() => { lutIntensityRef.current = lutIntensity; }, [lutIntensity]); useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl) { videoRef.current = null; return; }
    const vid = document.createElement('video');
    vid.src = videoUrl; vid.playsInline = true; vid.muted = true; vid.preload = 'auto';
    vid.onloadedmetadata = () => { if (vid.duration && isFinite(vid.duration)) useSubtitleStore.getState().setDuration(vid.duration * 1000); };
    vid.oncanplay = () => { vid.currentTime = Math.min(2, vid.duration || 2); vid.onseeked = () => {
      try { const c = document.createElement('canvas'); c.width = 48; c.height = 64; c.getContext('2d')!.drawImage(vid, 0, 0, 48, 64); const u = c.toDataURL('image/jpeg', 0.7); if (u.length > 100) useSubtitleStore.getState().setThumbnail(u); } catch {}
      vid.onseeked = null;
    }; };
    videoRef.current = vid;
    return () => { vid.pause(); vid.removeAttribute('src'); vid.load(); videoRef.current = null; };
  }, [videoUrl]);

  useEffect(() => { const vid = videoRef.current; if (!vid || !videoUrl) return; if (isPlaying) vid.play().catch(() => {}); else vid.pause(); }, [isPlaying, videoUrl]);
  useEffect(() => { const vid = videoRef.current; if (!vid || !videoUrl || isPlaying) return; vid.currentTime = currentTime / 1000; }, [currentTime, videoUrl, isPlaying]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);

  // RAF loop
  useEffect(() => {
    let prevWall: number | null = null;
    const loop = (wallMs: number) => {
      const vid = videoRef.current;

      // Time update from video or wall-clock delta
      if (playingRef.current) {
        if (vid && vid.readyState >= 2 && videoUrlRef.current) {
          // Use video's time as source of truth during playback
          const videoMs = vid.currentTime * 1000;
          if (Math.abs(videoMs - timeRef.current) > 50) {
            useSubtitleStore.getState().setCurrentTime(videoMs);
          }
        } else if (prevWall !== null) {
          const delta = wallMs - prevWall;
          const next = timeRef.current + delta;
          if (next >= durationRef.current) {
            useSubtitleStore.getState().setCurrentTime(0);
            useSubtitleStore.getState().setIsPlaying(false);
          } else {
            useSubtitleStore.getState().setCurrentTime(next);
          }
        }
        prevWall = wallMs;
      } else {
        prevWall = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // M2: Draw video frame as background if available
          if (vid && vid.readyState >= 2 && videoUrlRef.current) {
            const { videoWidth: vw, videoHeight: vh } = vid;
            if (vw > 0 && vh > 0) {
              const vAspect = vw / vh, cAspect = CANVAS_W / CANVAS_H;
              let sx = 0, sy = 0, sw = vw, sh = vh;
              if (vAspect > cAspect) { sw = vh * cAspect; sx = Math.round((vw - sw) / 2); }
              else { sh = vw / cAspect; sy = Math.round((vh - sh) / 2); }
              ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
            }
          }
          // Render subtitles on top (renderFrame draws gradient bg only if no video drawn)
          renderFrame({
            canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
            currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
            skipBackground: !!videoUrlRef.current,
          });
          // Apply LUT
          if (lutIdRef.current) {
            const lutData = getLutData(lutIdRef.current);
            if (lutData) applyLut(ctx, lutData, lutIdRef.current, CANVAS_W, CANVAS_H, lutIntensityRef.current);
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const activeFilter = FILTERS.find(f => f.id === filterId);
  const cssFilter = activeFilter?.css !== 'none' ? activeFilter?.css : undefined;

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width; const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: ((clientX - rect.left) * scaleX) / CANVAS_W, y: ((clientY - rect.top) * scaleY) / CANVAS_H };
  };
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    setIsDragging(true); dragStartRef.current = getRelativePos(e, canvas); posStartRef.current = { ...globalPreset.position };
  };
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !posStartRef.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const cur = getRelativePos(e, canvas);
    useSubtitleStore.getState().updateGlobalField('position', {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + (cur.x - dragStartRef.current.x))),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + (cur.y - dragStartRef.current.y))),
    });
  };
  const handlePointerUp = () => { setIsDragging(false); dragStartRef.current = null; posStartRef.current = null; };

  return (
    <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
      className="rounded-xl shadow-2xl w-full h-auto"
      style={{ maxWidth: '100%', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', filter: cssFilter }}
      onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
    />
  );
}
