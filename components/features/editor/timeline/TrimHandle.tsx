'use client';

import { useRef, useCallback } from 'react';

interface Props {
  side: 'left' | 'right';
  onDrag: (deltaPx: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default function TrimHandle({ side, onDrag, onDragStart, onDragEnd }: Props) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const rafRef = useRef<number | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    handleRef.current?.setPointerCapture(e.pointerId);
    onDragStart();
  }, [onDragStart]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.stopPropagation();
    e.preventDefault();
    const delta = e.clientX - startX.current;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      onDrag(delta);
      rafRef.current = null;
    });
  }, [onDrag]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    handleRef.current?.releasePointerCapture(e.pointerId);
    onDragEnd();
  }, [onDragEnd]);

  return (
    <div
      ref={handleRef}
      className={`absolute top-0 h-full z-20 flex items-center justify-center cursor-col-resize touch-none ${
        side === 'left' ? '-left-3' : '-right-3'
      }`}
      style={{ width: 24 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Barre visible */}
      <div className="w-1 h-full bg-white/60 hover:bg-white rounded-full transition-colors" />
    </div>
  );
}
