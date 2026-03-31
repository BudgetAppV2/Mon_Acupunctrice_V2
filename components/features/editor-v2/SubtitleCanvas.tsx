'use client';

import { useEffect, useRef } from 'react';
import { useEditorV2Store, getVideoTrack } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClip,
  createVideoElement, getFirstAudioUrl, coverCrop } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const activeClipIdRef = useRef<string | null>(null);

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks, filterIntensity: fIntensity,
    textOverlays, selectedOverlayId } = useEditorV2Store();
  const selOverlay = textOverlays.find(o => o.id === selectedOverlayId);
  const dragPos = selOverlay ? selOverlay.style.position : globalPreset.position;
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(dragPos, selectedOverlayId);

  // Refs for RAF loop (avoids stale closures)
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
  // FIX-1: Load video source immediately on import + init clip duration
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoUrl) return;
    vid.src = videoUrl;
    const firstClipId = getVideoTrack(tracksRef.current)?.clips?.[0]?.id ?? null;
    activeClipIdRef.current = firstClipId;
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useEditorV2Store.getState();
        store.setDuration(dMs);
        if (firstClipId) store.initClipDuration(firstClipId, dMs);
        // Bug 4 fix: always regenerate thumbnail from actual video frame
        vid.currentTime = Math.min(2, vid.duration);
        vid.onseeked = () => {
          try { const c = document.createElement('canvas'); c.width = 90; c.height = 160; c.getContext('2d')!.drawImage(vid, 0, 0, 90, 160); const u = c.toDataURL('image/jpeg', 0.7); if (u.length > 100) store.setThumbnail(u); } catch {}
          vid.currentTime = 0.01; // Show first frame
          vid.onseeked = null;
        };
      }
    };
    vid.addEventListener('loadedmetadata', onMeta);
    return () => vid.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);
  // Play/pause audio + video
  useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause(); } }, [isPlaying]);
  useEffect(() => { if (audioRef.current && !isPlaying) audioRef.current.currentTime = currentTime / 1000; }, [currentTime, isPlaying]);
  useEffect(() => { const v = videoRef.current; if (!v) return; if (isPlaying) { v.muted = false; v.volume = voiceVolume; v.play().catch(() => {}); } else { v.pause(); } }, [isPlaying, voiceVolume]);
  // Bug 3 fix: scrub video to correct clip — use tracks directly (not ref) for reactivity
  useEffect(() => {
    const vid = videoRef.current; if (!vid || isPlaying) return;
    const r = findActiveClip(tracks, currentTime);
    if (r) {
      if (r.clip.id !== activeClipIdRef.current && r.clip.blobUrl) { vid.src = r.clip.blobUrl; activeClipIdRef.current = r.clip.id; }
      vid.currentTime = r.localTimeMs / 1000;
    } else {
      // Fallback: seek first clip proportionally when findActiveClip misses
      const allClips = tracks.filter(t => t.type === 'video').flatMap(t => t.clips ?? []);
      if (allClips.length > 0 && duration > 0) {
        const first = allClips[0];
        if (first.blobUrl && first.duration > 0) {
          if (activeClipIdRef.current !== first.id) { vid.src = first.blobUrl; activeClipIdRef.current = first.id; }
          vid.currentTime = Math.min((currentTime / duration) * (first.duration / 1000), first.duration / 1000);
        }
      }
    }
  }, [currentTime, isPlaying, duration, tracks]);

  // RAF loop
  useEffect(() => {
    let prevWall: number | null = null;
    const loop = (wallMs: number) => {
      const vid = videoRef.current;
      const ar = findActiveClip(tracksRef.current, timeRef.current);
      if (playingRef.current) {
        if (vid && vid.readyState >= 2 && ar) {
          const gMs = ar.clip.timelineStart + (vid.currentTime * 1000 - ar.clip.trimStart);
          if (Math.abs(gMs - timeRef.current) > 50) useEditorV2Store.getState().setCurrentTime(gMs);
        } else if (prevWall !== null) {
          const n = timeRef.current + (wallMs - prevWall);
          if (n >= durationRef.current) { useEditorV2Store.getState().setCurrentTime(0); useEditorV2Store.getState().setIsPlaying(false); }
          else useEditorV2Store.getState().setCurrentTime(n);
        }
        prevWall = wallMs;
      } else { prevWall = null; }
      if (vid && ar && ar.clip.id !== activeClipIdRef.current) {
        activeClipIdRef.current = ar.clip.id;
        if (ar.clip.blobUrl) {
          vid.src = ar.clip.blobUrl; vid.currentTime = ar.localTimeMs / 1000;
          if (ar.clip.duration === 0) {
            const clipId = ar.clip.id;
            const onM = () => { if (vid.duration && isFinite(vid.duration)) { useEditorV2Store.getState().initClipDuration(clipId, vid.duration * 1000); } vid.removeEventListener('loadedmetadata', onM); };
            vid.addEventListener('loadedmetadata', onM);
          }
          if (playingRef.current) vid.play().catch(() => {});
        }
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const hasAnyClips = tracksRef.current.some(t => t.type === 'video' && t.clips && t.clips.length > 0);
          if (!ar && hasAnyClips) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
          else if (!ar) { /* no clips — gradient drawn by renderFrame below */ }
          else if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
            const c = coverCrop(vid.videoWidth, vid.videoHeight, CANVAS_W, CANVAS_H);
            ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);
          } else if (ar) {
            // Bug 5 fix: clip exists but video not ready — show black instead of stale gradient
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          }
          renderFrame({ canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
            currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
            skipBackground: !!ar || hasAnyClips, textOverlays: textOverlaysRef.current });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // CSS filter for Safari (ctx.filter not supported on WebKit)
  const ac = findActiveClip(tracksRef.current, currentTime);
  const cFid = (ac?.clip.filterId && ac.clip.filterId !== 'normal') ? ac.clip.filterId : filterId;
  const af = FILTERS.find(f => f.id === cFid);
  const cssFilter = (af?.css !== 'none' && fIntensity > 0) ? af?.css : undefined;

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = canvasRef.current; if (c) onMove(e, c); };

  return (
    <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
      className="w-full h-auto max-h-full"
      style={{ objectFit: 'contain', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', filter: cssFilter }}
      onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
  );
}
