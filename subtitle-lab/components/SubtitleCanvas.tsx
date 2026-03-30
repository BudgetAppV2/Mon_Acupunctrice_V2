'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSubtitleStore } from '../lib/store';
import { renderFrame } from '../lib/renderer';

const CANVAS_W = 540;
const CANVAS_H = 960; // 9:16

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const { blocks, globalPreset, currentTime, isPlaying, duration, setCurrentTime, setIsPlaying } =
    useSubtitleStore();

  // Use refs to avoid stale closures in the RAF loop
  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const durationRef = useRef(duration);
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);

  // Keep refs in sync
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);

  // Drag-to-reposition state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);

  // Single stable RAF loop — reads from refs, never stale
  useEffect(() => {
    let prevWall: number | null = null;

    const loop = (wallMs: number) => {
      if (playingRef.current) {
        if (prevWall !== null) {
          const delta = wallMs - prevWall;
          const next = timeRef.current + delta;
          if (next >= durationRef.current) {
            useSubtitleStore.getState().setCurrentTime(0);
            useSubtitleStore.getState().setIsPlaying(false);
          } else {
            useSubtitleStore.getState().setCurrentTime(next);
          }
        }
        prevWall = wallMs;
      } else {
        prevWall = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        renderFrame({
          canvas,
          blocks: blocksRef.current,
          globalPreset: presetRef.current,
          currentMs: timeRef.current,
          nowMs: wallMs,
          canvasWidth: CANVAS_W,
          canvasHeight: CANVAS_H,
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // Empty deps — loop is stable, reads from refs

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
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl shadow-2xl w-full h-auto"
        style={{
          maxWidth: '100%',
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
        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full px-5 py-2 text-sm font-medium transition-colors backdrop-blur-sm"
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
    </div>
  );
}
