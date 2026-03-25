'use client';

import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import TrimHandle from './TrimHandle';

interface Props { zoomLevel: number }

/** Piste sous-titres sur la timeline — blocs jaunes tappables avec trim handles */
export default function SubtitleTrack({ zoomLevel }: Props) {
  const { subtitles, selectedSubtitleId, selectSubtitle, updateSubtitleTiming, duration } = useEditorStore();
  const startRef = useRef({ start: 0, end: 0 });

  const onDragStartFn = useCallback((s: { startTime: number; endTime: number }) => {
    startRef.current = { start: s.startTime, end: s.endTime };
  }, []);

  if (subtitles.length === 0) return null;

  return (
    <div className="relative h-5 mt-0.5">
      {subtitles.map(s => {
        const isSelected = s.id === selectedSubtitleId;
        return (
          <button
            key={s.id}
            onClick={(e) => { e.stopPropagation(); selectSubtitle(s.id); }}
            className={`absolute top-0 h-full rounded text-[7px] text-white px-0.5 truncate flex items-center ${
              isSelected ? 'bg-amber-500 ring-1 ring-white' : 'bg-amber-500/70'
            }`}
            style={{
              left: `${s.startTime * zoomLevel}px`,
              width: `${Math.max((s.endTime - s.startTime) * zoomLevel, 3)}px`,
            }}
          >
            {isSelected && (
              <>
                <TrimHandle
                  side="left"
                  onDragStart={() => onDragStartFn(s)}
                  onDrag={(delta) => {
                    const ns = Math.max(0, startRef.current.start + delta / zoomLevel);
                    if (startRef.current.end - ns >= 0.3) updateSubtitleTiming(s.id, { startTime: ns });
                  }}
                  onDragEnd={() => {}}
                />
                <TrimHandle
                  side="right"
                  onDragStart={() => onDragStartFn(s)}
                  onDrag={(delta) => {
                    const ne = Math.min(duration, startRef.current.end + delta / zoomLevel);
                    if (ne - startRef.current.start >= 0.3) updateSubtitleTiming(s.id, { endTime: ne });
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
