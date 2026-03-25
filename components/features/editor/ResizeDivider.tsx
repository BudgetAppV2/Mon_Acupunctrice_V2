'use client';

import { useRef } from 'react';
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

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    startY.current = e.clientY;
    startRatio.current = editorSplitRatio;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || containerHeight === 0) return;
    e.preventDefault();
    const delta = e.clientY - startY.current;
    const newRatio = startRatio.current + delta / containerHeight;
    setEditorSplitRatio(newRatio);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="shrink-0 flex items-center justify-center gap-3 bg-gray-900 cursor-row-resize touch-none select-none z-10"
      style={{ height: 36 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Presets */}
      {PRESETS.map(({ icon: Icon, ratio, label }) => (
        <button
          key={ratio}
          onClick={(e) => { e.stopPropagation(); setEditorSplitRatio(ratio); }}
          className={`p-1.5 rounded transition-colors ${
            Math.abs(editorSplitRatio - ratio) < 0.05
              ? 'text-sage bg-sage/20'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
      {/* Handle visual */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 w-8 h-1 rounded-full bg-gray-600" />
    </div>
  );
}
