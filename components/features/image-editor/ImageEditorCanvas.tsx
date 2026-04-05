'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

interface Props {
  onCanvasReady?: (canvas: Canvas) => void;
}

export default function ImageEditorCanvas({ onCanvasReady }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Init Fabric canvas
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;
    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#ffffff',
    });
    fabricRef.current = canvas;
    if (onCanvasReady) onCanvasReady(canvas);
    return () => { canvas.dispose(); fabricRef.current = null; };
  }, [onCanvasReady]);

  // Scale to fit container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(([e]) => {
      const { width: cw, height: ch } = e.contentRect;
      const s = Math.min(cw / CANVAS_W, ch / CANVAS_H, 1);
      setScale(s);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-gray-800 overflow-hidden p-4">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <canvas ref={canvasElRef} className="shadow-2xl rounded" />
      </div>
    </div>
  );
}
