'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import Track from './Track';
import TextTrack from './TextTrack';
import SubtitleTrack from './SubtitleTrack';
import AudioTrackTimeline from './AudioTrackTimeline';

function formatMark(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function Timeline() {
  const { duration, currentTime, trimStart, trimEnd, seekTo, overlays, subtitles, audioUrl, videoFile } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Mesurer la largeur du conteneur pour adapter le zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Set initial width immediately (ResizeObserver peut etre async)
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) setContainerWidth(rect.width);
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [duration]); // re-run quand duration change (le composant est monte)

  // Zoom dynamique : toute la durée tient dans la largeur visible
  const PADDING = 12; // px-3 = 12px de chaque côté
  const zoomLevel = containerWidth > 0 && duration > 0
    ? (containerWidth - PADDING * 2) / duration
    : 1;
  const playheadLeft = PADDING + currentTime * zoomLevel;

  // Convertir la position du pointeur en temps
  const rafRef = useRef<number | null>(null);

  // Convertir la position du pointeur en temps
  const timeFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, clientX - rect.left - PADDING);
    return Math.max(0, Math.min(x / zoomLevel, duration));
  }, [duration, zoomLevel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    seekTo(timeFromPointer(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    // RAF pour throttler les updates et éviter le découplage
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const t = timeFromPointer(e.clientX);
    rafRef.current = requestAnimationFrame(() => {
      seekTo(t);
      rafRef.current = null;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Intervalle des marques adapté à la durée
  const markInterval = duration > 120 ? 30 : duration > 60 ? 15 : duration > 30 ? 10 : 5;
  const marks: number[] = [];
  for (let t = 0; t <= duration; t += markInterval) marks.push(t);

  // Hauteur dynamique selon les tracks actives
  const trackCount = 1 // vidéo toujours présente
    + (overlays.length > 0 ? 1 : 0)
    + (subtitles.length > 0 ? 1 : 0)
    + (audioUrl ? 1 : 0);
  const timelineHeight = 20 + (trackCount * 26); // règle 20px + 26px par track

  if (duration === 0) {
    return (
      <div className="bg-gray-950 shrink-0 flex items-center justify-center" style={{ height: `${timelineHeight}px` }}>
        {videoFile && <span className="text-xs text-gray-500">Chargement de la timeline...</span>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-gray-950 shrink-0 relative select-none touch-none"
      style={{ height: `${timelineHeight}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {containerWidth > 0 && (
        <div className="relative w-full h-full px-3">
          {/* Règle temporelle */}
          <div className="h-5 border-b border-gray-800 relative">
            {marks.map((t) => (
              <div
                key={t}
                className="absolute top-0 h-full flex flex-col items-center"
                style={{ left: `${t * zoomLevel}px` }}
              >
                <div className="w-px h-2 bg-gray-600" />
                <span className="text-[9px] text-gray-500 mt-0.5">{formatMark(t)}</span>
              </div>
            ))}
          </div>

          {/* Track vidéo */}
          <Track duration={duration} trimStart={trimStart} trimEnd={trimEnd} zoomLevel={zoomLevel} />

          {/* Track textes (blocs bleus) */}
          <TextTrack zoomLevel={zoomLevel} />
          {/* Track sous-titres (blocs jaunes) */}
          <SubtitleTrack zoomLevel={zoomLevel} />
          {/* Track audio (bloc violet) */}
          <AudioTrackTimeline zoomLevel={zoomLevel} />

          {/* Playhead — ligne blanche + triangle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
            style={{ left: `${playheadLeft}px` }}
          >
            <div className="absolute -top-0.5 -translate-x-1/2 left-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      )}
    </div>
  );
}
