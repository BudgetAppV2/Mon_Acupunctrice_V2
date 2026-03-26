'use client';

import { useRef, useCallback, useState } from 'react';

interface Props {
  side: 'left' | 'right';
  onDrag: (deltaPx: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default function TrimHandle({ side, onDrag, onDragStart, onDragEnd }: Props) {
  const [active, setActive] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const rafRef = useRef<number | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    setActive(true);
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
    rafRef.current = requestAnimationFrame(() => { onDrag(delta); rafRef.current = null; });
  }, [onDrag]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    handleRef.current?.releasePointerCapture(e.pointerId);
    onDragEnd();
  }, [onDragEnd]);

  return (
    <div
      ref={handleRef}
      data-trim-handle
      className={`absolute top-0 h-full z-20 flex items-center justify-center cursor-col-resize touch-none ${
        side === 'left' ? '-left-3' : '-right-3'
      }`}
      style={{ width: 24 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className={`${active ? 'w-1.5 bg-amber-400' : 'w-1 bg-white/60 hover:bg-white'} h-full rounded-full transition-all duration-100`} />
    </div>
  );
}
