'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Rect, Ellipse, Textbox, FabricImage } from 'fabric';
import { getTemplateObjects, LOGO_URL } from '@/lib/data/imageEditorTemplates';

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
  const loadedRef = useRef(false);

  const loadTemplate = useCallback(async (canvas: Canvas) => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const objects = getTemplateObjects();
    for (const obj of objects) {
      const t = obj.type as string;
      let fabricObj;
      if (t === 'rect') {
        fabricObj = new Rect(obj as Record<string, unknown>);
      } else if (t === 'ellipse') {
        fabricObj = new Ellipse(obj as Record<string, unknown>);
      } else if (t === 'textbox') {
        fabricObj = new Textbox(obj.text as string, obj as Record<string, unknown>);
      }
      if (fabricObj) canvas.add(fabricObj);
    }

    // Load logo image
    try {
      const img = await FabricImage.fromURL(LOGO_URL, { crossOrigin: 'anonymous' });
      const logoSize = 220;
      img.scaleToWidth(logoSize);
      img.set({ left: CANVAS_W - logoSize - 60, top: CANVAS_H - logoSize - 60, selectable: true, evented: true });
      canvas.add(img);
    } catch { /* logo load failed — continue without */ }

    canvas.renderAll();
  }, []);

  // Init Fabric canvas
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;
    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#D4EDEC',
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;
    loadTemplate(canvas);
    if (onCanvasReady) onCanvasReady(canvas);
    return () => { canvas.dispose(); fabricRef.current = null; };
  }, [onCanvasReady, loadTemplate]);

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
