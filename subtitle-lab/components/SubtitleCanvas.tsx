'use client';

import { useEffect, useRef, useState } from 'react';
import { useSubtitleStore } from '../lib/store';
import { renderFrame } from '../lib/renderer';
import { FILTERS } from '../lib/filters';
import { applyLut } from '../lib/luts/lutRenderer';
import { getLutData } from '../lib/luts/presets';

const CANVAS_W = 540;
const CANVAS_H = 960;

export default function SubtitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const { blocks, globalPreset, currentTime, isPlaying, duration, setCurrentTime, setIsPlaying, filterId, activeLutId, lutIntensity } =
    useSubtitleStore();

  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const durationRef = useRef(duration);
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const lutIdRef = useRef(activeLutId);
  const lutIntensityRef = useRef(lutIntensity);

  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { lutIdRef.current = activeLutId; }, [activeLutId]);
  useEffect(() => { lutIntensityRef.current = lutIntensity; }, [lutIntensity]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);

  // RAF loop
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
          canvas, blocks: blocksRef.current, globalPreset: presetRef.current,
          currentMs: timeRef.current, nowMs: wallMs, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
        });
        // Apply LUT after 2D render
        if (lutIdRef.current) {
          const lutData = getLutData(lutIdRef.current);
          const ctx = canvas.getContext('2d');
          if (lutData && ctx) {
            applyLut(ctx, lutData, lutIdRef.current, CANVAS_W, CANVAS_H, lutIntensityRef.current);
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Get CSS filter string
  const activeFilter = FILTERS.find(f => f.id === filterId);
  const cssFilter = activeFilter?.css !== 'none' ? activeFilter?.css : undefined;

  // Drag handlers
  const getRelativePos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: ((clientX - rect.left) * scaleX) / CANVAS_W, y: ((clientY - rect.top) * scaleY) / CANVAS_H };
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
    useSubtitleStore.getState().updateGlobalField('position', {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + (cur.x - dragStartRef.current.x))),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + (cur.y - dragStartRef.current.y))),
    });
  };
  const handlePointerUp = () => { setIsDragging(false); dragStartRef.current = null; posStartRef.current = null; };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="rounded-xl shadow-2xl w-full h-auto"
      style={{
        maxWidth: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        filter: cssFilter,
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
}
