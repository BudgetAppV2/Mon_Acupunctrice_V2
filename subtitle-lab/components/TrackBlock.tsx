'use client';

import { useRef, useState } from 'react';
import { useSubtitleStore, getVideoTrack } from '../lib/store';

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
}

export default function TrackBlock({ id, trackId, label, startMs, endMs, duration, color, selected, onTrimChange }: Props) {
  const { selectItem, reorderClips, tracks } = useSubtitleStore();
  const [draggingSide, setDraggingSide] = useState<'left' | 'right' | null>(null);
  const [isDragReorder, setIsDragReorder] = useState(false);
  const dragRef = useRef({ startX: 0, origStart: 0, origEnd: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDownTime = useRef(0);

  if (duration <= 0) return null;
  const left = (startMs / duration) * 100;
  const width = ((endMs - startMs) / duration) * 100;

  // A7: Get this clip's index for reorder
  const clipIndex = (() => {
    const vt = getVideoTrack(tracks);
    if (!vt?.clips) return -1;
    return vt.clips.findIndex(c => c.id === id);
  })();

  const onTrimDown = (side: 'left' | 'right', e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    setDraggingSide(side);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, origStart: startMs, origEnd: endMs };
  };

  const onTrimMove = (e: React.PointerEvent) => {
    if (!draggingSide || !onTrimChange) return;
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!parent) return;
    const pxPerMs = parent.clientWidth / duration;
    const deltaMs = (e.clientX - dragRef.current.startX) / pxPerMs;
    if (draggingSide === 'left') {
      const ns = Math.max(0, Math.min(dragRef.current.origEnd - 200, dragRef.current.origStart + deltaMs));
      onTrimChange(ns, dragRef.current.origEnd);
    } else {
      const ne = Math.max(dragRef.current.origStart + 200, Math.min(duration, dragRef.current.origEnd + deltaMs));
      onTrimChange(dragRef.current.origStart, ne);
    }
  };

  const onTrimUp = () => setDraggingSide(null);

  // A7: Long press to reorder
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownTime.current = Date.now();
    dragRef.current = { startX: e.clientX, origStart: startMs, origEnd: endMs };
    longPressTimer.current = setTimeout(() => {
      setIsDragReorder(true);
    }, 300);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isDragReorder && clipIndex >= 0) {
      // Calculate target index from drag distance
      const parent = (e.currentTarget as HTMLElement).parentElement;
      if (parent) {
        const pxPerMs = parent.clientWidth / duration;
        const deltaMs = (e.clientX - dragRef.current.startX) / pxPerMs;
        const vt = getVideoTrack(tracks);
        const clips = vt?.clips ?? [];
        if (clips.length > 1) {
          const targetTimeMs = startMs + deltaMs;
          let toIdx = clips.findIndex(c => {
            const cStart = c.timelineStart;
            const cEnd = cStart + (c.trimEnd - c.trimStart);
            return targetTimeMs >= cStart && targetTimeMs < cEnd;
          });
          if (toIdx === -1) toIdx = targetTimeMs > startMs ? clips.length - 1 : 0;
          if (toIdx !== clipIndex) reorderClips(clipIndex, toIdx);
        }
      }
      setIsDragReorder(false);
    } else if (Date.now() - pointerDownTime.current < 300) {
      // Short tap -> select
      e.stopPropagation();
      selectItem(trackId, id);
    }
    setIsDragReorder(false);
  };

  return (
    <div className={`absolute top-1 bottom-1 rounded ${color} flex items-center overflow-hidden ${selected ? 'ring-2 ring-emerald-400' : ''} ${isDragReorder ? 'opacity-70 scale-105 z-10' : ''}`}
      style={{ left: `${left}%`, width: `${width}%`, minWidth: 4, transition: isDragReorder ? 'none' : 'opacity 150ms' }}
      onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <span className="text-[8px] text-white/70 truncate px-1 pointer-events-none">{label}</span>
      {/* Trim handles */}
      {selected && onTrimChange && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-7 cursor-col-resize flex items-center justify-center bg-emerald-400/40 rounded-l"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => onTrimDown('left', e)} onPointerMove={onTrimMove} onPointerUp={onTrimUp}>
            <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-7 cursor-col-resize flex items-center justify-center bg-emerald-400/40 rounded-r"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => onTrimDown('right', e)} onPointerMove={onTrimMove} onPointerUp={onTrimUp}>
            <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
}
