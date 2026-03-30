'use client';

import { useRef, useCallback } from 'react';
import { useSubtitleStore } from '@/lib/store';

export default function Timeline() {
  const { blocks, selectedBlockId, currentTime, duration, isPlaying, selectBlock, setCurrentTime, setIsPlaying } =
    useSubtitleStore();

  const trackRef = useRef<HTMLDivElement>(null);

  const seekTo = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setCurrentTime(ratio * duration);
    },
    [duration, setCurrentTime],
  );

  const handleTrackClick = (e: React.MouseEvent) => seekTo(e.clientX);

  const handleScrubberDrag = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    seekTo(e.clientX);
  };

  const msToPercent = (ms: number) => `${(ms / duration) * 100}%`;

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const dec = Math.floor((ms % 1000) / 100);
    return `${s}.${dec}s`;
  };

  return (
    <div className="border-t border-white/10 bg-[#111] px-4 py-3 select-none">
      {/* Transport controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setCurrentTime(0)}
          className="text-white/40 hover:text-white/80 text-lg leading-none"
          title="Retour début"
        >
          ⏮
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center text-sm transition-colors"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="text-xs text-white/40 font-mono">
          {formatMs(currentTime)} / {formatMs(duration)}
        </span>
      </div>

      {/* Scrubber track */}
      <div
        ref={trackRef}
        className="relative h-2 bg-white/10 rounded-full cursor-pointer mb-3"
        onClick={handleTrackClick}
        onMouseMove={handleScrubberDrag}
      >
        {/* Progress bar */}
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500/60 rounded-full pointer-events-none"
          style={{ width: msToPercent(currentTime) }}
        />
        {/* Scrubber handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg pointer-events-none"
          style={{ left: msToPercent(currentTime), transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>

      {/* Block track */}
      <div className="relative h-10 bg-white/5 rounded-lg overflow-hidden">
        {blocks.map((block) => {
          const left = (block.startMs / duration) * 100;
          const width = ((block.endMs - block.startMs) / duration) * 100;
          const isSelected = block.id === selectedBlockId;
          const isActive = currentTime >= block.startMs && currentTime <= block.endMs;

          return (
            <button
              key={block.id}
              onClick={() => selectBlock(isSelected ? null : block.id)}
              className={`
                absolute top-1 h-8 rounded text-[9px] font-medium px-1 truncate text-left transition-all
                ${isSelected
                  ? 'bg-emerald-500 text-white ring-1 ring-emerald-300'
                  : isActive
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }
              `}
              style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
              title={block.text}
            >
              {block.text.slice(0, 20)}
            </button>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-emerald-400/80 pointer-events-none"
          style={{ left: msToPercent(currentTime) }}
        />
      </div>

      {/* Hint */}
      {selectedBlockId && (
        <p className="text-[10px] text-white/30 mt-2">
          Bloc sélectionné — les contrôles de droite n&apos;affectent que ce bloc
        </p>
      )}
    </div>
  );
}
