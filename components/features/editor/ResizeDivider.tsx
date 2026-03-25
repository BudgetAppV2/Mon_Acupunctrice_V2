'use client';

import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { VideoCameraIcon, AdjustmentsHorizontalIcon, ScissorsIcon } from '@heroicons/react/24/outline';

const PRESETS = [
  { icon: VideoCameraIcon, ratio: 0.70, label: 'Preview max' },
  { icon: AdjustmentsHorizontalIcon, ratio: 0.50, label: 'Balance' },
  { icon: ScissorsIcon, ratio: 0.30, label: 'Timeline max' },
];

interface Props {
  containerHeight: number;
}

export default function ResizeDivider({ containerHeight }: Props) {
  const { editorSplitRatio, setEditorSplitRatio } = useEditorStore();
  const dragging = useRef(false);
  const startY = useRef(0);
  const startRatio = useRef(0);
  const dividerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    console.log('[Divider] pointerDown, target:', (e.target as HTMLElement).tagName, 'closest button:', !!(e.target as HTMLElement).closest('button'));
    // Ne pas capturer si c'est un bouton preset
    if ((e.target as HTMLElement).closest('button')) return;

    console.log('[Divider] starting drag, clientY:', e.clientY, 'ratio:', editorSplitRatio);
    dragging.current = true;
    startY.current = e.clientY;
    startRatio.current = editorSplitRatio;
    dividerRef.current?.setPointerCapture(e.pointerId);
  }, [editorSplitRatio]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || containerHeight === 0) return;
    const delta = e.clientY - startY.current;
    const newRatio = startRatio.current + delta / containerHeight;
    console.log('[Divider] move delta:', delta, 'newRatio:', newRatio.toFixed(3), 'containerH:', containerHeight);
    setEditorSplitRatio(newRatio);
  }, [containerHeight, setEditorSplitRatio]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    dividerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={dividerRef}
      className="shrink-0 relative flex items-center justify-center gap-3 bg-gray-900 cursor-row-resize touch-none select-none z-10"
      style={{ height: 36 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Handle visuel — zone de drag */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 w-8 h-1 rounded-full bg-gray-600 pointer-events-none" />

      {/* Presets */}
      {PRESETS.map(({ icon: Icon, ratio, label }) => (
        <button
          key={ratio}
          onPointerDown={(e) => { e.stopPropagation(); console.log('[Divider] button pointerDown stopped'); }}
          onClick={() => { console.log('[Divider] preset click ratio:', ratio); setEditorSplitRatio(ratio); }}
          className={`p-1.5 rounded transition-colors relative z-20 ${
            Math.abs(editorSplitRatio - ratio) < 0.05
              ? 'text-sage bg-sage/20'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
