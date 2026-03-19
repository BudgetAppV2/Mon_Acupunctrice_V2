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
    videoUrl, isPlaying, trimStart, trimEnd, filter, audioUrl, audioVolume,
    setCurrentTime, setDuration, pause, togglePlayPause, seekTo,
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

  const handleLoaded = () => { if (videoRef.current) setDuration(videoRef.current.duration); };

  const handleTap = () => {
    if (interactive) return;
    setShowControls(true);
    togglePlayPause();
  };

  const filterDef = FILTERS.find(f => f.id === filter);
  const filterStyle = filterDef && filterDef.css !== 'none' ? { filter: filterDef.css } : undefined;

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black" onClick={handleTap}>
      <video ref={videoRef} src={videoUrl ?? undefined} className="w-full h-full object-contain" style={filterStyle} playsInline onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoaded} />
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
