'use client';

import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import Track from './Track';

const ZOOM_LEVEL = 60; // px par seconde

function formatMark(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function Timeline() {
  const { duration, currentTime, trimStart, trimEnd, seekTo } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const totalWidth = Math.max(duration * ZOOM_LEVEL, 1);
  const playheadLeft = currentTime * ZOOM_LEVEL;

  // Convertir la position du pointeur en temps
  const timeFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    return Math.max(0, Math.min(x / ZOOM_LEVEL, duration));
  }, [duration]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seekTo(timeFromPointer(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    seekTo(timeFromPointer(e.clientX));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Marques temporelles toutes les 5 secondes
  const marks: number[] = [];
  for (let t = 0; t <= duration; t += 5) marks.push(t);

  if (duration === 0) return null;

  return (
    <div
      ref={containerRef}
      className="h-[120px] bg-gray-950 overflow-x-auto shrink-0 relative select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative" style={{ width: `${totalWidth}px`, minHeight: '100%' }}>
        {/* Règle temporelle */}
        <div className="h-6 border-b border-gray-800 relative">
          {marks.map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{ left: `${t * ZOOM_LEVEL}px` }}
            >
              <div className="w-px h-2 bg-gray-600" />
              <span className="text-[9px] text-gray-500 mt-0.5">{formatMark(t)}</span>
            </div>
          ))}
        </div>

        {/* Track vidéo */}
        <Track
          duration={duration}
          trimStart={trimStart}
          trimEnd={trimEnd}
          zoomLevel={ZOOM_LEVEL}
        />

        {/* Playhead — ligne blanche + triangle en haut */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
          style={{ left: `${playheadLeft}px` }}
        >
          <div className="absolute -top-0.5 -translate-x-1/2 left-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      </div>
    </div>
  );
}
