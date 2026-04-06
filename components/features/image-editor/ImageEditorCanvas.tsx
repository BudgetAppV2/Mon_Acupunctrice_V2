'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Canvas, Rect, Ellipse, Textbox, FabricImage, FabricObject } from 'fabric';
import { getTemplateObjects, LOGO_URL } from '@/lib/data/imageEditorTemplates';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

interface Props {
  onCanvasReady?: (canvas: Canvas) => void;
}

/** Create a Fabric object from a template config, stripping type/text from options */
function createFabricObject(obj: Record<string, unknown>) {
  const { type, text, ...opts } = obj;
  switch (type) {
    case 'rect':    return new Rect(opts);
    case 'ellipse': return new Ellipse(opts);
    case 'textbox': return new Textbox((text as string) ?? '', opts);
    default:        return null;
  }
}

export default function ImageEditorCanvas({ onCanvasReady }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const loadTemplate = useCallback(async (canvas: Canvas) => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Wait for Google Fonts before rendering text on canvas
    try {
      await Promise.all([
        document.fonts.load('110px "Antic Slab"'),
        document.fonts.load('800 72px "Mulish"'),
      ]);
    } catch { /* fonts may not be ready yet — text will render in fallback */ }

    for (const obj of getTemplateObjects()) {
      const fo = createFabricObject(obj);
      if (fo) canvas.add(fo);
    }

    try {
      const img = await FabricImage.fromURL(LOGO_URL, { crossOrigin: 'anonymous' });
      img.scaleToWidth(220);
      img.set({ left: CANVAS_W - 280, top: CANVAS_H - 280, selectable: true, evented: true });
      canvas.add(img);
    } catch { /* logo unavailable */ }

    canvas.renderAll();
  }, []);

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#D4EDEC',
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = canvas;

    // Global selection styling — turquoise theme (Canva-like)
    canvas.selectionColor = 'rgba(126, 190, 197, 0.1)';
    canvas.selectionBorderColor = '#7EBEC5';
    canvas.selectionLineWidth = 2;
    FabricObject.ownDefaults.borderColor = '#7EBEC5';
    FabricObject.ownDefaults.borderScaleFactor = 2.5;
    FabricObject.ownDefaults.cornerColor = '#7EBEC5';
    FabricObject.ownDefaults.cornerStrokeColor = '#FFFFFF';
    FabricObject.ownDefaults.cornerSize = 16;
    FabricObject.ownDefaults.touchCornerSize = 40; // Large touch zone for mobile
    FabricObject.ownDefaults.cornerStyle = 'circle';
    FabricObject.ownDefaults.transparentCorners = false;
    FabricObject.ownDefaults.padding = 10;
    FabricObject.ownDefaults.selectionBackgroundColor = 'rgba(126, 190, 197, 0.05)';

    // Scale to fit container via CSS-only dimensions.
    // Keeps internal resolution at 1080x1920 (crisp export)
    // and Fabric.js correctly maps pointer coords via getBoundingClientRect.
    const container = containerRef.current!;
    const fit = () => {
      const { width: cw, height: ch } = container.getBoundingClientRect();
      const s = Math.min((cw - 32) / CANVAS_W, (ch - 32) / CANVAS_H, 1);
      canvas.setDimensions(
        { width: CANVAS_W * s, height: CANVAS_H * s },
        { cssOnly: true },
      );
    };
    fit();
    const obs = new ResizeObserver(fit);
    obs.observe(container);

    loadTemplate(canvas);
    if (onCanvasReady) onCanvasReady(canvas);

    return () => {
      obs.disconnect();
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [onCanvasReady, loadTemplate]);

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-gray-800 overflow-hidden p-4">
      <canvas ref={canvasElRef} className="shadow-2xl rounded" />
    </div>
  );
}
