'use client';

import { useRef } from 'react';
import { useSubtitleStore, getVideoTrack, getSubtitleTrack } from '../lib/store';

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MiniScrubber() {
  const { currentTime, duration, setCurrentTime, tracks } = useSubtitleStore();
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const progress = duration > 0 ? currentTime / duration : 0;

  const scrub = (clientX: number) => {
    const bar = barRef.current; if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(ratio * duration);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragging.current = true;
    barRef.current?.setPointerCapture(e.pointerId);
    scrub(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => { if (!dragging.current) return; e.preventDefault(); e.stopPropagation(); scrub(e.clientX); };
  const onPointerUp = () => { dragging.current = false; };

  // Mini-blocs de couleur sur la barre
  const vt = getVideoTrack(tracks);
  const st = getSubtitleTrack(tracks);
  const videoClips = vt?.clips ?? [];
  const subBlocks = st?.subtitles?.blocks ?? [];

  return (
    <div className="px-3 py-1 shrink-0">
      <div ref={barRef} className="relative h-8 bg-white/5 rounded-full cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        {/* Progress fill */}
        <div className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-full" style={{ width: `${progress * 100}%` }} />
        {/* Video clip minimap */}
        {duration > 0 && videoClips.map(c => {
          const clipDur = c.trimEnd - c.trimStart;
          return <div key={c.id} className="absolute top-1 h-2 bg-emerald-500/30 rounded-sm"
            style={{ left: `${(c.timelineStart / duration) * 100}%`, width: `${(clipDur / duration) * 100}%` }} />;
        })}
        {/* Subtitle block minimap */}
        {duration > 0 && subBlocks.map(b => (
          <div key={b.id} className="absolute bottom-1 h-1.5 bg-blue-400/30 rounded-sm"
            style={{ left: `${(b.startMs / duration) * 100}%`, width: `${((b.endMs - b.startMs) / duration) * 100}%` }} />
        ))}
        {/* Playhead */}
        <div className="absolute top-0 w-0.5 h-full bg-emerald-400" style={{ left: `${progress * 100}%` }}>
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rotate-45" />
        </div>
        {/* Timecode */}
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/40 font-mono pointer-events-none">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
