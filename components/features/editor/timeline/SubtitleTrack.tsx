'use client';

import { useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import TrimHandle from './TrimHandle';

interface Props { zoomLevel: number }

export default function SubtitleTrack({ zoomLevel }: Props) {
  const { subtitles, selectedSubtitleId, selectSubtitle, updateSubtitleTiming, duration } = useEditorStore();
  const trimRef = useRef({ start: 0, end: 0 });
  const dragRef = useRef({ startX: 0, origStart: 0, origEnd: 0, active: false });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const DRAG_THRESHOLD = 5;

  const onTrimStart = useCallback((s: { startTime: number; endTime: number }) => {
    trimRef.current = { start: s.startTime, end: s.endTime };
  }, []);

  if (subtitles.length === 0) return null;

  return (
    <div className="relative h-5 mt-0.5">
      {subtitles.map(s => {
        const isSelected = s.id === selectedSubtitleId;
        const isDragging = s.id === draggingId;

        const handlePointerDown = (e: React.PointerEvent) => {
          e.stopPropagation();
          if (!isSelected) { selectSubtitle(s.id); return; }
          if ((e.target as HTMLElement).closest('[data-trim-handle]')) return;
          dragRef.current = { startX: e.clientX, origStart: s.startTime, origEnd: s.endTime, active: false };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        };

        const handlePointerMove = (e: React.PointerEvent) => {
          if (!isSelected) return;
          e.stopPropagation(); e.preventDefault();
          const dx = e.clientX - dragRef.current.startX;
          if (!dragRef.current.active && Math.abs(dx) < DRAG_THRESHOLD) return;
          dragRef.current.active = true;
          setDraggingId(s.id);
          const deltaSec = dx / zoomLevel;
          const dur = dragRef.current.origEnd - dragRef.current.origStart;
          let ns = dragRef.current.origStart + deltaSec;
          if (ns < 0) ns = 0;
          if (ns + dur > duration) ns = duration - dur;
          updateSubtitleTiming(s.id, { startTime: ns, endTime: ns + dur });
        };

        const handlePointerUp = () => {
          dragRef.current.active = false;
          setDraggingId(null);
        };

        return (
          <div
            key={s.id}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute top-0 h-full rounded text-[7px] text-white px-0.5 truncate flex items-center touch-none ${
              isDragging ? 'bg-amber-500 ring-2 ring-amber-400 opacity-80'
              : isSelected ? 'bg-amber-500 ring-1 ring-white' : 'bg-amber-500/70'
            }`}
            style={{
              left: `${s.startTime * zoomLevel}px`,
              width: `${Math.max((s.endTime - s.startTime) * zoomLevel, 3)}px`,
            }}
          >
            {isSelected && !isDragging && (
              <>
                <TrimHandle side="left" onDragStart={() => onTrimStart(s)}
                  onDrag={(d) => { const ns = Math.max(0, trimRef.current.start + d / zoomLevel); if (trimRef.current.end - ns >= 0.3) updateSubtitleTiming(s.id, { startTime: ns }); }}
                  onDragEnd={() => {}} />
                <TrimHandle side="right" onDragStart={() => onTrimStart(s)}
                  onDrag={(d) => { const ne = Math.min(duration, trimRef.current.end + d / zoomLevel); if (ne - trimRef.current.start >= 0.3) updateSubtitleTiming(s.id, { endTime: ne }); }}
                  onDragEnd={() => {}} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
