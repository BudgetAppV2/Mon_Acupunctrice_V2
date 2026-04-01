'use client';

import { useEffect, useRef } from 'react';
import { useEditorV2Store, getVideoTrack } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS, interpolateFilter } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClip, getFirstAudioUrl } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);

  // Init video metadata + thumbnail + clip duration
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoUrl) return;
    vid.src = videoUrl;
    const firstClipId = getVideoTrack(useEditorV2Store.getState().tracks)?.clips?.[0]?.id ?? null;
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useEditorV2Store.getState();
        store.setDuration(dMs);
        if (firstClipId) store.initClipDuration(firstClipId, dMs);
        // Generate thumbnail
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

  // Audio element for music
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) { if (!audioRef.current) audioRef.current = new Audio(); audioRef.current.src = url; audioRef.current.loop = true; }
    else if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src'); audioRef.current = null; }
  }, [tracks]);

  // Sync volumes
  useEffect(() => { if (videoRef.current) videoRef.current.volume = voiceVolume; }, [voiceVolume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);

  // Play/pause
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    if (isPlaying) { v.muted = false; v.volume = voiceVolume; v.play().catch(() => {}); }
    else { v.pause(); }
  }, [isPlaying, voiceVolume]);
  useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause(); } }, [isPlaying]);

  // Scrub: seek video directly — the browser shows the frame natively (instant)
  useEffect(() => {
    const vid = videoRef.current; if (!vid || isPlaying || !videoUrl) return;
    const r = findActiveClip(tracks, currentTime);
    if (r) {
      vid.currentTime = r.localTimeMs / 1000;
    } else {
      // Outside clip range: seek to nearest edge
      const allClips = tracks.filter(t => t.type === 'video').flatMap(t => t.clips ?? []);
      if (allClips.length > 0) {
        let best = allClips[0], bestDist = Infinity;
        for (const c of allClips) {
          const absS = c.timelineStart + c.trimStart, absE = c.timelineStart + c.trimEnd;
          const d = currentTime < absS ? absS - currentTime : currentTime > absE ? currentTime - absE : 0;
          if (d < bestDist) { bestDist = d; best = c; }
        }
        const absS = best.timelineStart + best.trimStart;
        vid.currentTime = (currentTime <= absS ? best.trimStart : best.trimEnd) / 1000;
      }
    }
  }, [currentTime, isPlaying, tracks, videoUrl]);

  // Sync audio scrub position
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);

  // Playback: advance currentTime via timeupdate from native video
  useEffect(() => {
    const vid = videoRef.current; if (!vid) return;
    const onTimeUpdate = () => {
      if (!useEditorV2Store.getState().isPlaying) return;
      const trks = useEditorV2Store.getState().tracks;
      const ar = findActiveClip(trks, timeRef.current);
      if (ar) {
        const gMs = ar.clip.timelineStart + (vid.currentTime * 1000 - ar.clip.trimStart);
        if (gMs >= 0) useEditorV2Store.getState().setCurrentTime(gMs);
      }
    };
    vid.addEventListener('timeupdate', onTimeUpdate);
    return () => vid.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  // End of playback detection
  useEffect(() => {
    if (isPlaying && duration > 0 && currentTime >= duration) {
      useEditorV2Store.getState().setCurrentTime(0);
      useEditorV2Store.getState().setIsPlaying(false);
    }
  }, [currentTime, isPlaying, duration]);

  // RAF loop — ONLY draws overlays on the transparent canvas
  useEffect(() => {
    const loop = (wallMs: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          // Demo gradient when no video
          const skipBg = hasVideo;
          renderFrame({
            canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
            currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
            skipBackground: skipBg, textOverlays: textOverlaysRef.current,
          });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hasVideo]);

  // CSS filter
  const ac = findActiveClip(tracks, currentTime);
  const cFid = (ac?.clip.filterId && ac.clip.filterId !== 'normal') ? ac.clip.filterId : filterId;
  const af = FILTERS.find(f => f.id === cFid);
  const cssFilter = (af?.css && af.css !== 'none' && fIntensity > 0)
    ? interpolateFilter(af.css, fIntensity)
    : undefined;

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onMove(e, c); };

  return (
    <div ref={containerRef} className="relative w-full h-auto max-h-full" style={{ aspectRatio: '9/16' }}>
      {/* Native <video> — browser decodes and displays frames instantly */}
      {hasVideo && (
        <video ref={videoRef} playsInline muted preload="auto"
          className="absolute inset-0 w-full h-full object-cover rounded"
          style={{ filter: cssFilter }} />
      )}

      {/* Transparent canvas overlay — subtitles + text overlays only */}
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
        className={`w-full h-full ${hasVideo ? 'absolute inset-0' : ''}`}
        style={{ background: 'transparent', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
    </div>
  );
}
