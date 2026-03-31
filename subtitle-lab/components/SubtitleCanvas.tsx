'use client';

import { useEffect, useRef } from 'react';
import { useSubtitleStore } from '../lib/store';
import { renderFrame } from '../lib/renderer';
import { FILTERS } from '../lib/filters';
import { CANVAS_W, CANVAS_H, findActiveClip, findActiveVideoClip,
  createVideoElement, getFirstAudioUrl, coverCrop } from '../lib/playback';
import { useSubtitleDrag } from '../lib/useSubtitleDrag';

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const activeClipIdRef = useRef<string | null>(null);

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks } = useSubtitleStore();
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(globalPreset.position);

  // Refs for RAF loop (avoids stale closures)
  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const durationRef = useRef(duration);
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const tracksRef = useRef(tracks);

  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  // Two video elements for double-buffered playback (A3)
  useEffect(() => {
    videoRef.current = createVideoElement();
    preloadRef.current = createVideoElement();
    return () => {
      [videoRef, preloadRef].forEach(r => { r.current?.pause(); r.current?.removeAttribute('src'); r.current?.load(); });
      videoRef.current = null; preloadRef.current = null;
    };
  }, []);

  // Audio element for music (A4)
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) { if (!audioRef.current) audioRef.current = new Audio(); audioRef.current.src = url; audioRef.current.loop = true; }
    else if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src'); audioRef.current = null; }
  }, [tracks]);

  // Sync volumes (A4)
  useEffect(() => { if (videoRef.current) videoRef.current.volume = voiceVolume; if (preloadRef.current) preloadRef.current.volume = voiceVolume; }, [voiceVolume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);
  // Duration from single-video import
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const vid = videoRef.current;
    const h = () => { if (vid.duration && isFinite(vid.duration)) useSubtitleStore.getState().setDuration(vid.duration * 1000); };
    vid.addEventListener('loadedmetadata', h);
    return () => vid.removeEventListener('loadedmetadata', h);
  }, [videoUrl]);
  // Play/pause audio + video
  useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause(); } }, [isPlaying]);
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);
  useEffect(() => { if (videoRef.current) { if (isPlaying) videoRef.current.play().catch(() => {}); else videoRef.current.pause(); } }, [isPlaying]);
  // Scrub video to correct clip
  useEffect(() => {
    const vid = videoRef.current; if (!vid || isPlaying) return;
    const r = findActiveClip(tracksRef.current, currentTime);
    if (!r) return;
    if (r.clip.id !== activeClipIdRef.current && r.clip.blobUrl) { vid.src = r.clip.blobUrl; activeClipIdRef.current = r.clip.id; }
    vid.currentTime = r.localTimeMs / 1000;
  }, [currentTime, isPlaying]);

  // RAF loop
  useEffect(() => {
    let prevWall: number | null = null;
    const loop = (wallMs: number) => {
      const vid = videoRef.current;
      const ar = findActiveClip(tracksRef.current, timeRef.current);
      if (playingRef.current) {
        if (vid && vid.readyState >= 2 && ar) {
          const gMs = ar.clip.timelineStart + (vid.currentTime * 1000 - ar.clip.trimStart);
          if (Math.abs(gMs - timeRef.current) > 50) useSubtitleStore.getState().setCurrentTime(gMs);
        } else if (prevWall !== null) {
          const n = timeRef.current + (wallMs - prevWall);
          if (n >= durationRef.current) { useSubtitleStore.getState().setCurrentTime(0); useSubtitleStore.getState().setIsPlaying(false); }
          else useSubtitleStore.getState().setCurrentTime(n);
        }
        prevWall = wallMs;
      } else { prevWall = null; }
      if (vid && ar && ar.clip.id !== activeClipIdRef.current) {
        activeClipIdRef.current = ar.clip.id;
        if (ar.clip.blobUrl) { vid.src = ar.clip.blobUrl; vid.currentTime = ar.localTimeMs / 1000; if (playingRef.current) vid.play().catch(() => {}); }
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!ar) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
          else if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
            const c = coverCrop(vid.videoWidth, vid.videoHeight, CANVAS_W, CANVAS_H);
            ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);
          }
          renderFrame({ canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
            currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H, skipBackground: !!ar });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const clipFId = findActiveVideoClip(tracksRef.current, currentTime)?.filterId ?? filterId;
  const cssFilter = (() => { const f = FILTERS.find(x => x.id === clipFId); return f?.css !== 'none' ? f?.css : undefined; })();

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onMove(e, c); };

  return (
    <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
      className="rounded-xl shadow-2xl w-full h-auto"
      style={{ maxWidth: '100%', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', filter: cssFilter }}
      onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
  );
}
