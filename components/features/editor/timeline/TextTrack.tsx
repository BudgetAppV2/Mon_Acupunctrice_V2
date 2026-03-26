'use client';

import { useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import TrimHandle from './TrimHandle';

interface Props { zoomLevel: number }

export default function TextTrack({ zoomLevel }: Props) {
  const { overlays, selectedOverlayId, selectOverlay, updateOverlay, duration } = useEditorStore();
  const trimRef = useRef({ start: 0, end: 0 });
  const dragRef = useRef({ startX: 0, origStart: 0, origEnd: 0, active: false });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const DRAG_THRESHOLD = 5;

  const onTrimStart = useCallback((o: { startTime: number; endTime: number }) => {
    trimRef.current = { start: o.startTime, end: o.endTime };
  }, []);

  if (overlays.length === 0) return null;

  return (
    <div className="relative h-7 mt-0.5">
      {overlays.map(o => {
        const isSelected = o.id === selectedOverlayId;
        const isDragging = o.id === draggingId;

        const handlePointerDown = (e: React.PointerEvent) => {
          e.stopPropagation();
          if (!isSelected) { selectOverlay(o.id); return; }
          if ((e.target as HTMLElement).closest('[data-trim-handle]')) return;
          dragRef.current = { startX: e.clientX, origStart: o.startTime, origEnd: o.endTime, active: false };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        };

        const handlePointerMove = (e: React.PointerEvent) => {
          if (!isSelected) return;
          e.stopPropagation(); e.preventDefault();
          const dx = e.clientX - dragRef.current.startX;
          if (!dragRef.current.active && Math.abs(dx) < DRAG_THRESHOLD) return;
          dragRef.current.active = true;
          setDraggingId(o.id);
          const deltaSec = dx / zoomLevel;
          const dur = dragRef.current.origEnd - dragRef.current.origStart;
          let ns = dragRef.current.origStart + deltaSec;
          if (ns < 0) ns = 0;
          if (ns + dur > duration) ns = duration - dur;
          updateOverlay(o.id, { startTime: ns, endTime: ns + dur });
        };

        const handlePointerUp = () => {
          dragRef.current.active = false;
          setDraggingId(null);
        };

        return (
          <div
            key={o.id}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute top-0 h-full rounded text-[8px] text-white px-1 truncate flex items-center touch-none ${
              isDragging ? 'bg-sage ring-2 ring-amber-400 opacity-80'
              : isSelected ? 'bg-sage ring-1 ring-white' : 'bg-sage/50'
            }`}
            style={{
              left: `${o.startTime * zoomLevel}px`,
              width: `${Math.max((o.endTime - o.startTime) * zoomLevel, 20)}px`,
            }}
          >
            {o.text || '...'}
            {isSelected && !isDragging && (
              <>
                <TrimHandle side="left" onDragStart={() => onTrimStart(o)}
                  onDrag={(d) => { const ns = Math.max(0, trimRef.current.start + d / zoomLevel); if (trimRef.current.end - ns >= 0.3) updateOverlay(o.id, { startTime: ns }); }}
                  onDragEnd={() => {}} />
                <TrimHandle side="right" onDragStart={() => onTrimStart(o)}
                  onDrag={(d) => { const ne = Math.min(duration, trimRef.current.end + d / zoomLevel); if (ne - trimRef.current.start >= 0.3) updateOverlay(o.id, { endTime: ne }); }}
                  onDragEnd={() => {}} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
