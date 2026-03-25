'use client';

import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import TrimHandle from './TrimHandle';

interface TrackProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  zoomLevel: number;
}

/** Piste video sur la timeline — vert sage avec zones hors-trim grisees + trim handles */
export default function Track({ duration, trimStart, trimEnd, zoomLevel }: TrackProps) {
  const { setTrim } = useEditorStore();
  const totalWidth = duration * zoomLevel;
  const trimStartPx = trimStart * zoomLevel;
  const trimEndPx = trimEnd * zoomLevel;
  const startRef = useRef({ trimStart, trimEnd });

  const onDragStartLeft = useCallback(() => { startRef.current = { trimStart, trimEnd }; }, [trimStart, trimEnd]);
  const onDragLeft = useCallback((deltaPx: number) => {
    const newStart = Math.max(0, startRef.current.trimStart + deltaPx / zoomLevel);
    if (startRef.current.trimEnd - newStart >= 0.5) setTrim(newStart, startRef.current.trimEnd);
  }, [zoomLevel, setTrim]);

  const onDragStartRight = useCallback(() => { startRef.current = { trimStart, trimEnd }; }, [trimStart, trimEnd]);
  const onDragRight = useCallback((deltaPx: number) => {
    const newEnd = Math.min(duration, startRef.current.trimEnd + deltaPx / zoomLevel);
    if (newEnd - startRef.current.trimStart >= 0.5) setTrim(startRef.current.trimStart, newEnd);
  }, [zoomLevel, duration, setTrim]);

  const noop = useCallback(() => {}, []);

  return (
    <div className="relative h-10 mt-1" style={{ width: `${totalWidth}px` }}>
      {trimStartPx > 0 && (
        <div className="absolute top-0 left-0 h-full bg-gray-700/60 rounded-l" style={{ width: `${trimStartPx}px` }} />
      )}
      <div className="absolute top-0 h-full bg-sage/80 rounded" style={{ left: `${trimStartPx}px`, width: `${trimEndPx - trimStartPx}px` }}>
        <TrimHandle side="left" onDrag={onDragLeft} onDragStart={onDragStartLeft} onDragEnd={noop} />
        <TrimHandle side="right" onDrag={onDragRight} onDragStart={onDragStartRight} onDragEnd={noop} />
      </div>
      {trimEndPx < totalWidth && (
        <div className="absolute top-0 h-full bg-gray-700/60 rounded-r" style={{ left: `${trimEndPx}px`, width: `${totalWidth - trimEndPx}px` }} />
      )}
    </div>
  );
}
