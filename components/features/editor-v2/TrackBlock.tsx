'use client';

import { useRef } from 'react';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';

interface Props {
  id: string;
  trackId: string;
  label: string;
  startMs: number;
  endMs: number;
  duration: number;
  color: string;
  selected: boolean;
  onTrimChange?: (newStart: number, newEnd: number) => void;
  onDrag?: (newStartMs: number) => void;
}

export default function TrackBlock({ id, trackId, label, startMs, endMs, duration, color, selected, onTrimChange, onDrag }: Props) {
  const { selectItem } = useEditorV2Store();
  const mode = useRef<'idle' | 'drag' | 'trim'>('idle');
  const trimSideRef = useRef<'left' | 'right' | null>(null);
  const start = useRef({ x: 0, origStart: 0, origEnd: 0, time: 0 });

  if (duration <= 0) return null;
  const left = (startMs / duration) * 100;
  const width = ((endMs - startMs) / duration) * 100;

  const getPxPerMs = (el: HTMLElement) => {
    const p = el.closest('[data-track-row]') as HTMLElement | null;
    return p ? p.clientWidth / duration : 1;
  };

  // --- Trim handles ---
  const onTrimDown = (side: 'left' | 'right', e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    mode.current = 'trim'; trimSideRef.current = side;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, origStart: startMs, origEnd: endMs, time: Date.now() };
  };
  const onTrimMove = (e: React.PointerEvent) => {
    if (mode.current !== 'trim' || !trimSideRef.current || !onTrimChange) return;
    e.stopPropagation();
    const ppm = getPxPerMs(e.currentTarget as HTMLElement);
    const delta = (e.clientX - start.current.x) / ppm;
    if (trimSideRef.current === 'left') onTrimChange(Math.max(0, Math.min(start.current.origEnd - 200, start.current.origStart + delta)), start.current.origEnd);
    else onTrimChange(start.current.origStart, Math.max(start.current.origStart + 200, start.current.origEnd + delta));
  };
  const onTrimUp = () => { mode.current = 'idle'; trimSideRef.current = null; };

  // --- Block drag: absolute position, store updated every move ---
  const onBlockDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, origStart: startMs, origEnd: endMs, time: Date.now() };
    mode.current = 'idle';
  };
  const onBlockMove = (e: React.PointerEvent) => {
    e.stopPropagation(); // Always stop propagation to prevent parent playhead drag
    if (mode.current === 'trim') return;
    const dx = e.clientX - start.current.x;
    if (mode.current === 'idle' && Math.abs(dx) > 5) mode.current = 'drag';
    if (mode.current === 'drag' && onDrag) {
      const ppm = getPxPerMs(e.currentTarget as HTMLElement);
      const deltaMs = dx / ppm;
      const newStartMs = Math.max(0, start.current.origStart + deltaMs);
      onDrag(newStartMs);
    }
  };
  const onBlockUp = (e: React.PointerEvent) => {
    if (mode.current === 'idle' && Date.now() - start.current.time < 300) {
      e.stopPropagation(); selectItem(trackId, id);
    }
    mode.current = 'idle';
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded ${color} flex items-center overflow-hidden ${selected ? 'ring-2 ring-emerald-400' : ''}`}
      style={{ left: `${left}%`, width: `${width}%`, minWidth: 4, touchAction: 'none' }}
      onPointerDown={onBlockDown} onPointerMove={onBlockMove} onPointerUp={onBlockUp}>
      <span className="text-[8px] text-white/70 truncate px-1 pointer-events-none">{label}</span>
      {selected && onTrimChange && (<>
        <div className="absolute left-0 top-0 bottom-0 w-7 cursor-col-resize flex items-center justify-center bg-emerald-400/40 rounded-l" style={{ touchAction: 'none' }}
          onPointerDown={e => onTrimDown('left', e)} onPointerMove={onTrimMove} onPointerUp={onTrimUp}>
          <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-7 cursor-col-resize flex items-center justify-center bg-emerald-400/40 rounded-r" style={{ touchAction: 'none' }}
          onPointerDown={e => onTrimDown('right', e)} onPointerMove={onTrimMove} onPointerUp={onTrimUp}>
          <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
        </div>
      </>)}
    </div>
  );
}
