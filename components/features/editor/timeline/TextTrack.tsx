'use client';

import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import TrimHandle from './TrimHandle';

interface Props { zoomLevel: number }

/** Piste texte sur la timeline — blocs tappables avec trim handles sur la selection */
export default function TextTrack({ zoomLevel }: Props) {
  const { overlays, selectedOverlayId, selectOverlay, updateOverlay, duration } = useEditorStore();
  const startRef = useRef({ start: 0, end: 0 });

  const onDragStartFn = useCallback((o: { startTime: number; endTime: number }) => {
    startRef.current = { start: o.startTime, end: o.endTime };
  }, []);

  if (overlays.length === 0) return null;

  return (
    <div className="relative h-7 mt-0.5">
      {overlays.map(o => {
        const isSelected = o.id === selectedOverlayId;
        return (
          <button
            key={o.id}
            onClick={(e) => { e.stopPropagation(); selectOverlay(o.id); }}
            className={`absolute top-0 h-full rounded text-[8px] text-white px-1 truncate flex items-center ${
              isSelected ? 'bg-sage ring-1 ring-white' : 'bg-sage/50'
            }`}
            style={{
              left: `${o.startTime * zoomLevel}px`,
              width: `${Math.max((o.endTime - o.startTime) * zoomLevel, 20)}px`,
            }}
          >
            {o.text || '...'}
            {isSelected && (
              <>
                <TrimHandle
                  side="left"
                  onDragStart={() => onDragStartFn(o)}
                  onDrag={(delta) => {
                    const ns = Math.max(0, startRef.current.start + delta / zoomLevel);
                    if (startRef.current.end - ns >= 0.3) updateOverlay(o.id, { startTime: ns });
                  }}
                  onDragEnd={() => {}}
                />
                <TrimHandle
                  side="right"
                  onDragStart={() => onDragStartFn(o)}
                  onDrag={(delta) => {
                    const ne = Math.min(duration, startRef.current.end + delta / zoomLevel);
                    if (ne - startRef.current.start >= 0.3) updateOverlay(o.id, { endTime: ne });
                  }}
                  onDragEnd={() => {}}
                />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
