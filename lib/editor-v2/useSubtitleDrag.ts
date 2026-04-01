'use client';

import { useState, useRef, useCallback } from 'react';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { CANVAS_W, CANVAS_H } from './playback';
import type { TextOverlay, SubtitleBlock } from './types';

interface HitTarget {
  type: 'overlay' | 'subtitle';
  id: string;
  position: { x: number; y: number };
}

const HIT_RADIUS = 0.12; // 12% of canvas = hit zone around element center

function getRelPos(e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect();
  const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
}

function hitTest(
  pos: { x: number; y: number },
  currentMs: number,
  textOverlays: TextOverlay[],
  blocks: SubtitleBlock[],
  globalSubPos: { x: number; y: number },
): HitTarget | null {
  // Check text overlays first (they're on top)
  for (const o of textOverlays) {
    if (currentMs < o.startMs || currentMs > o.endMs) continue;
    const dx = Math.abs(pos.x - o.style.position.x);
    const dy = Math.abs(pos.y - o.style.position.y);
    if (dx < HIT_RADIUS && dy < HIT_RADIUS) {
      return { type: 'overlay', id: o.id, position: o.style.position };
    }
  }
  // Check subtitles (use global position)
  for (const b of blocks) {
    if (currentMs < b.startMs || currentMs > b.endMs + 200) continue;
    const dx = Math.abs(pos.x - globalSubPos.x);
    const dy = Math.abs(pos.y - globalSubPos.y);
    if (dx < HIT_RADIUS && dy < HIT_RADIUS) {
      return { type: 'subtitle', id: 'global', position: globalSubPos };
    }
  }
  return null;
}

/** Manages position drag on canvas with hit-testing */
export function useSubtitleDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const posStartRef = useRef<{ x: number; y: number } | null>(null);
  const targetRef = useRef<HitTarget | null>(null);

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const pos = getRelPos(e, canvas);
    const store = useEditorV2Store.getState();

    const target = hitTest(
      pos, store.currentTime,
      store.textOverlays, store.blocks,
      store.globalPreset.position,
    );

    if (!target) return;

    // If we hit an overlay, select it
    if (target.type === 'overlay') {
      store.selectOverlay(target.id);
    }

    targetRef.current = target;
    setIsDragging(true);
    dragStartRef.current = pos;
    posStartRef.current = { ...target.position };
  }, []);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if (!isDragging || !dragStartRef.current || !posStartRef.current || !targetRef.current) return;
    const cur = getRelPos(e, canvas);
    const newPos = {
      x: Math.max(0.05, Math.min(0.95, posStartRef.current.x + (cur.x - dragStartRef.current.x))),
      y: Math.max(0.05, Math.min(0.98, posStartRef.current.y + (cur.y - dragStartRef.current.y))),
    };
    const target = targetRef.current;
    if (target.type === 'overlay') {
      const o = useEditorV2Store.getState().textOverlays.find(t => t.id === target.id);
      if (o) useEditorV2Store.getState().updateTextOverlay(target.id, { style: { ...o.style, position: newPos } });
    } else {
      useEditorV2Store.getState().updateGlobalField('position', newPos);
    }
  }, [isDragging]);

  const onUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    posStartRef.current = null;
    targetRef.current = null;
  }, []);

  return { isDragging, onDown, onMove, onUp };
}
