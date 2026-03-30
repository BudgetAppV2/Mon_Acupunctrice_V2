'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSubtitleStore } from '../lib/store';
import { renderFrame } from '../lib/renderer';

const CANVAS_W = 540;
const CANVAS_H = 960; // 9:16

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const { blocks, globalPreset, currentTime, isPlaying, duration, setCurrentTime, setIsPlaying } =
    useSubtitleStore();

  // Drag-to-reposition state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);

  const drawFrame = useCallback(
    (ms: number, nowMs: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderFrame({
        canvas,
        blocks,
        globalPreset,
        currentMs: ms,
        nowMs,
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,
      });
    },
    [blocks, globalPreset],
  );

  // Animation loop
  useEffect(() => {
    let prevTime: number | null = null;

    const loop = (wallMs: number) => {
      if (isPlaying) {
        if (prevTime !== null) {
          const delta = wallMs - prevTime;
          const next = currentTime + delta;
          if (next >= duration) {
            setCurrentTime(0);
            setIsPlaying(false);
          } else {
            setCurrentTime(next);
          }
        }
        prevTime = wallMs;
      } else {
        prevTime = null;
      }

      drawFrame(currentTime, wallMs);
      lastTickRef.current = wallMs;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, duration, drawFrame]);

  // Re-render when time or style changes (non-playing)
  useEffect(() => {
    drawFrame(currentTime, lastTickRef.current);
  }, [currentTime, drawFrame]);

  // Drag to move subtitle position
  const getRelativePos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * scaleX) / CANVAS_W,
      y: ((clientY - rect.top) * scaleY) / CANVAS_H,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDragging(true);
    dragStartRef.current = getRelativePos(e, canvas);
    posStartRef.current = { ...globalPreset.position };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !posStartRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cur = getRelativePos(e, canvas);
    const dx = cur.x - dragStartRef.current.x;
    const dy = cur.y - dragStartRef.current.y;
    useSubtitleStore.getState().updateGlobalField('position', {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + dx)),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    posStartRef.current = null;
  };

  return (
    <div className="relative select-none">
      {/* Position hint */}
      <div className="absolute top-2 right-2 text-[10px] text-white/30 pointer-events-none">
        glisser pour repositionner
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl shadow-2xl"
        style={{
          width: 'min(100%, 270px)',
          height: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Play / Pause overlay */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full px-5 py-1.5 text-sm font-medium transition-colors backdrop-blur-sm"
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
    </div>
  );
}
