'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorStore, registerVideoElement } from '@/lib/store/useEditorStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { FILTERS } from '@/lib/utils/filters';
import { useCanvasPreview } from '@/lib/hooks/useCanvasPreview';
import TextOverlayLayer from './text/TextOverlay';
import SubtitlePreview from './subtitles/SubtitlePreview';

interface Props { interactive?: boolean }

export default function VideoPreview({ interactive = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    videoUrl, isPlaying, currentTime, trimStart, trimEnd, filter, audioUrl, audioVolume,
    setCurrentTime, setDuration, pause, togglePlayPause, seekTo,
    setThumbnail, setVideoOrientation, thumbnailUrl,
  } = useEditorStore();
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => { registerVideoElement(videoRef.current); return () => registerVideoElement(null); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isPlaying) { hideTimer.current = setTimeout(() => setShowControls(false), 2000); }
    else { setShowControls(true); }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying]);

  // Sync musique de fond avec la vidéo
  useEffect(() => {
    const a = bgAudioRef.current;
    if (!a || !audioUrl) return;
    a.volume = audioVolume;
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [isPlaying, audioVolume, audioUrl]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.currentTime >= trimEnd && trimEnd > 0) { seekTo(trimStart); pause(); }
    // Garder l'audio sync avec la vidéo
    const a = bgAudioRef.current;
    if (a && audioUrl && Math.abs(a.currentTime - video.currentTime) > 0.3) {
      a.currentTime = video.currentTime;
    }
  };

  const trySetDuration = (v: HTMLVideoElement) => {
    if (v.duration && isFinite(v.duration) && v.duration > 0) { setDuration(v.duration); return true; }
    return false;
  };
  const handleLoaded = () => { const v = videoRef.current; if (!v) return; trySetDuration(v); setVideoOrientation(v.videoWidth > v.videoHeight ? 'landscape' : 'portrait'); };
  const handleDurationChange = () => { if (videoRef.current) trySetDuration(videoRef.current); };
  const handleCanPlay = () => {
    const v = videoRef.current; if (!v) return; trySetDuration(v);
    if (thumbnailUrl) return;
    setTimeout(() => {
      try { const c = document.createElement('canvas'); c.width = 90; c.height = 160; c.getContext('2d')!.drawImage(v, 0, 0, 90, 160); const u = c.toDataURL('image/jpeg', 0.8); if (u !== 'data:,' && u.length > 100) setThumbnail(u); } catch {}
    }, 200);
  };

  // Safari iOS fallback — duration=Infinity on blobs
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

  const handleTap = () => {
    if (interactive) return;
    setShowControls(true);
    togglePlayPause();
  };

  const frameUrl = useCanvasPreview(videoRef.current, size.w, size.h);
  const showCanvasFrame = !!frameUrl && !isPlaying && !interactive;

  const filterDef = FILTERS.find(f => f.id === filter);
  const filterStyle = filterDef && filterDef.css !== 'none' ? { filter: filterDef.css } : undefined;

  const isOutOfTrim = trimEnd > 0 && (currentTime < trimStart || currentTime > trimEnd);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black" onClick={handleTap}>
      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        className="w-full h-full object-cover"
        style={{ ...filterStyle, visibility: isOutOfTrim ? 'hidden' : 'visible' }}
        playsInline preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        onDurationChange={handleDurationChange}
        onCanPlay={handleCanPlay}
      />
      {audioUrl && <audio ref={bgAudioRef} src={audioUrl} loop />}
      {showCanvasFrame && <img src={frameUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
      {(!showCanvasFrame || interactive) && size.w > 0 && <TextOverlayLayer width={size.w} height={size.h} interactive={interactive} />}
      {!showCanvasFrame && <SubtitlePreview />}
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
