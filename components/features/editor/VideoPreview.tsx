'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorStore, registerVideoElement } from '@/lib/store/useEditorStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

export default function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    videoUrl, isPlaying, trimStart, trimEnd,
    setCurrentTime, setDuration, pause, togglePlayPause, seekTo,
  } = useEditorStore();
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enregistrer l'élément vidéo pour que le store puisse le piloter
  useEffect(() => {
    registerVideoElement(videoRef.current);
    return () => registerVideoElement(null);
  }, []);

  // Auto-masquer le bouton play/pause 2s après le début de la lecture
  useEffect(() => {
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2000);
    } else {
      setShowControls(true);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    // Boucler au début du trim quand on atteint la fin
    if (video.currentTime >= trimEnd && trimEnd > 0) {
      seekTo(trimStart);
      pause();
    }
  };

  const handleLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleTap = () => {
    setShowControls(true);
    togglePlayPause();
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-black"
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        className="max-w-full max-h-full object-contain"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
      />

      {/* Bouton Play/Pause — centré, semi-transparent */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
            {isPlaying ? (
              <PauseIcon className="w-7 h-7 text-white" />
            ) : (
              <PlayIcon className="w-7 h-7 text-white ml-0.5" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
