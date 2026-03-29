'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useEditorStore, registerVideoElement } from '@/lib/store/useEditorStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useRealtimeCanvas } from '@/lib/hooks/useRealtimeCanvas';
import TextOverlayLayer from './text/TextOverlay';

// Konva ne supporte pas SSR — chargement uniquement côté client
const SubtitleInteractionLayer = dynamic(
  () => import('./subtitles/SubtitleInteractionLayer'),
  { ssr: false },
);

interface Props { interactive?: boolean; subtitleInteractive?: boolean }

export default function VideoPreview({ interactive = false, subtitleInteractive = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    videoUrl, isPlaying, currentTime, trimStart, trimEnd, filter, audioUrl, audioVolume,
    setCurrentTime, setDuration, pause, togglePlayPause, seekTo,
    setThumbnail, setVideoOrientation, thumbnailUrl, subtitleFamily,
  } = useEditorStore();
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => { registerVideoElement(videoRef.current); return () => registerVideoElement(null); }, []);

  // Resize canvas quand le conteneur change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const { width: cw, height: ch } = e.contentRect;
      setSize({ w: cw, h: ch });
      if (canvasRef.current) {
        canvasRef.current.width = Math.round(cw * (window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio || 1));
        canvasRef.current.height = Math.round(ch * (window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio || 1));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Canvas temps reel — remplace le rendu DOM pour overlays/sous-titres/effets
  useRealtimeCanvas(videoRef.current, canvasRef.current);

  useEffect(() => {
    if (isPlaying) { hideTimer.current = setTimeout(() => setShowControls(false), 2000); }
    else { setShowControls(true); }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying]);

  useEffect(() => {
    const a = bgAudioRef.current;
    if (!a || !audioUrl) return;
    a.volume = audioVolume;
    if (isPlaying) a.play().catch(() => {}); else a.pause();
  }, [isPlaying, audioVolume, audioUrl]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.currentTime >= trimEnd && trimEnd > 0) { seekTo(trimStart); pause(); }
    const a = bgAudioRef.current;
    if (a && audioUrl && Math.abs(a.currentTime - v.currentTime) > 0.3) a.currentTime = v.currentTime;
  }, [trimStart, trimEnd, audioUrl, setCurrentTime, seekTo, pause]);

  const trySetDuration = (v: HTMLVideoElement) => { if (v.duration && isFinite(v.duration) && v.duration > 0) { setDuration(v.duration); return true; } return false; };
  const handleLoaded = () => { const v = videoRef.current; if (!v) return; trySetDuration(v); setVideoOrientation(v.videoWidth > v.videoHeight ? 'landscape' : 'portrait'); };
  const handleDurationChange = () => { if (videoRef.current) trySetDuration(videoRef.current); };
  const handleCanPlay = () => {
    const v = videoRef.current; if (!v) return; trySetDuration(v);
    if (thumbnailUrl) return;
    setTimeout(() => {
      try { const c = document.createElement('canvas'); c.width = 90; c.height = 160; c.getContext('2d')!.drawImage(v, 0, 0, 90, 160); const u = c.toDataURL('image/jpeg', 0.8); if (u !== 'data:,' && u.length > 100) setThumbnail(u); } catch {}
    }, 200);
  };

  // Safari iOS fallback duration
  useEffect(() => {
    const v = videoRef.current; if (!v || !videoUrl) return;
    const check = () => { if (v.duration && isFinite(v.duration) && v.duration > 0) { setDuration(v.duration); return true; } return false; };
    if (check()) return;
    const cb = () => check();
    v.addEventListener('loadedmetadata', cb); v.addEventListener('canplay', cb); v.addEventListener('durationchange', cb);
    const iv = setInterval(() => { if (check()) clearInterval(iv); }, 500);
    const to = setTimeout(() => clearInterval(iv), 10000);
    return () => { v.removeEventListener('loadedmetadata', cb); v.removeEventListener('canplay', cb); v.removeEventListener('durationchange', cb); clearInterval(iv); clearTimeout(to); };
  }, [videoUrl, setDuration]);

  // Pinch-to-zoom natif (2 doigts) → resize fontSize des sous-titres visibles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let pinchDist: number | null = null;
    let pinchBaseSize: number | null = null;
    let pinchSegIds: string[] = [];

    const getDist = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const s = useEditorStore.getState();
      if (!s.subtitleFamily) return;
      pinchDist = getDist(e.touches[0], e.touches[1]);
      const visible = s.subtitles.filter(seg => s.currentTime >= seg.startTime && s.currentTime <= seg.endTime);
      pinchSegIds = visible.map(seg => seg.id);
      const first = visible[0];
      pinchBaseSize = first ? (s.subtitleOverrides[first.id]?.fontSize ?? 0.045) : 0.045;
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || pinchDist === null || pinchBaseSize === null) return;
      const s = useEditorStore.getState();
      if (!s.subtitleFamily) return;
      const newDist = getDist(e.touches[0], e.touches[1]);
      const scale = newDist / pinchDist;
      const newSize = Math.max(0.02, Math.min(0.25, pinchBaseSize * scale));
      for (const segId of pinchSegIds) {
        s.setSubtitleOverride(segId, { fontSize: newSize });
      }
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchDist = null;
        pinchBaseSize = null;
        pinchSegIds = [];
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Scroll wheel (desktop) → resize fontSize des sous-titres visibles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      const s = useEditorStore.getState();
      if (!s.subtitleFamily) return;
      e.preventDefault();
      const visible = s.subtitles.filter(seg => s.currentTime >= seg.startTime && s.currentTime <= seg.endTime);
      for (const seg of visible) {
        const current = s.subtitleOverrides[seg.id]?.fontSize ?? 0.045;
        const delta = e.deltaY > 0 ? -0.003 : 0.003;
        s.setSubtitleOverride(seg.id, { fontSize: Math.max(0.02, Math.min(0.25, current + delta)) });
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // subtitleInteractive n'est plus ici — le Stage Konva gère les taps et stopPropagation lui-même
  const handleTap = () => { if (interactive) return; setShowControls(true); togglePlayPause(); };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black" onClick={handleTap}>
      {/* Video cachee visuellement — reste dans le DOM pour audio + timing */}
      <video ref={videoRef} src={videoUrl ?? undefined}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        playsInline preload="auto"
        onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoaded}
        onDurationChange={handleDurationChange} onCanPlay={handleCanPlay} />
      {audioUrl && <audio ref={bgAudioRef} src={audioUrl} loop />}
      {/* Canvas temps reel — affiche video + filtres + LUT + overlays + sous-titres */}
      <canvas ref={canvasRef} className="w-full h-full object-contain" style={{ imageRendering: 'auto' }} />
      {/* TextOverlayLayer DOM seulement en mode interactif (drag-and-drop) */}
      {interactive && size.w > 0 && <TextOverlayLayer width={size.w} height={size.h} interactive />}
      {/* Couche Konva pour interaction sous-titres Pro (drag position) */}
      {(interactive || subtitleInteractive) && subtitleFamily && size.w > 0 && (
        <SubtitleInteractionLayer width={size.w} height={size.h} />
      )}
      {showControls && !interactive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
            {isPlaying ? <PauseIcon className="w-7 h-7 text-white" /> : <PlayIcon className="w-7 h-7 text-white ml-0.5" />}
          </div>
        </div>
      )}
    </div>
  );
}
