'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorStore, registerVideoElement } from '@/lib/store/useEditorStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { FILTERS } from '@/lib/utils/filters';
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

  const trySetDuration = (video: HTMLVideoElement) => {
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
      return true;
    }
    return false;
  };

  const handleLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    trySetDuration(video);
    // Détecter l'orientation — sur iPhone la webcam enregistre en landscape
    // L'orientation est stockée pour que l'export FFmpeg puisse corriger avec transpose
    const isLandscape = video.videoWidth > video.videoHeight;
    setVideoOrientation(isLandscape ? 'landscape' : 'portrait');
  };

  const handleDurationChange = () => {
    if (videoRef.current) trySetDuration(videoRef.current);
  };

  // onCanPlay est plus fiable que onLoadedMetadata sur Safari iOS pour les blobs
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    trySetDuration(video);
    // Capturer la miniature ici — la frame est décodée, contrairement à loadedmetadata
    if (thumbnailUrl) return;
    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 90;
        canvas.height = 160;
        canvas.getContext('2d')!.drawImage(video, 0, 0, 90, 160);
        const url = canvas.toDataURL('image/jpeg', 0.8);
        if (url !== 'data:,' && url.length > 100) setThumbnail(url);
      } catch { /* fallback gradient dans FilterPanel */ }
    }, 200);
  };

  // Fallback pour Safari iOS — les blobs peuvent avoir duration=Infinity
  // Aussi : s'assurer que la duration est capturée même si les events ne fire pas
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const check = () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        return true;
      }
      return false;
    };

    // Essayer immédiatement
    if (check()) return;

    // Écouter les events directement sur l'élément
    const onMeta = () => check();
    const onCanPlay = () => check();
    const onDurChange = () => check();
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('durationchange', onDurChange);

    // Polling fallback toutes les 500ms pendant 10s
    const interval = setInterval(() => {
      if (check()) clearInterval(interval);
    }, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('durationchange', onDurChange);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [videoUrl, setDuration]);

  const handleTap = () => {
    if (interactive) return;
    setShowControls(true);
    togglePlayPause();
  };

  const filterDef = FILTERS.find(f => f.id === filter);
  const filterStyle = filterDef && filterDef.css !== 'none' ? { filter: filterDef.css } : undefined;

  // Hors-trim : cacher la vidéo et laisser le fond noir du conteneur visible
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
      {size.w > 0 && <TextOverlayLayer width={size.w} height={size.h} interactive={interactive} />}
      <SubtitlePreview />
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
