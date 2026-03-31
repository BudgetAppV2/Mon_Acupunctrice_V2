'use client';

import { useState, useRef, useCallback } from 'react';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { CANVAS_W, CANVAS_H } from './playback';
import type { StylePreset } from './types';

/** Manages position drag on the canvas — subtitles or text overlay */
export function useSubtitleDrag(position: StylePreset['position'], overlayId?: string | null) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);

  const getRelPos = (e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: ((cx - r.left) * CANVAS_W / r.width) / CANVAS_W, y: ((cy - r.top) * CANVAS_H / r.height) / CANVAS_H };
  };

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    setIsDragging(true);
    dragStartRef.current = getRelPos(e, canvas);
    posStartRef.current = { ...position };
  }, [position]);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if (!isDragging || !dragStartRef.current || !posStartRef.current) return;
    const cur = getRelPos(e, canvas);
    const newPos = {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + (cur.x - dragStartRef.current.x))),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + (cur.y - dragStartRef.current.y))),
    };
    if (overlayId) {
      const o = useEditorV2Store.getState().textOverlays.find(t => t.id === overlayId);
      if (o) useEditorV2Store.getState().updateTextOverlay(overlayId, { style: { ...o.style, position: newPos } });
    } else {
      useEditorV2Store.getState().updateGlobalField('position', newPos);
    }
  }, [isDragging, overlayId]);

  const onUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    posStartRef.current = null;
  }, []);

  return { isDragging, onDown, onMove, onUp };
}
