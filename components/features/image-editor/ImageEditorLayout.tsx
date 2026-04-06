'use client';

import { useState, useCallback } from 'react';
import type { Canvas } from 'fabric';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ImageEditorCanvas from './ImageEditorCanvas';
import Sidebar from './Sidebar';

export default function ImageEditorLayout() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const handleExport = useCallback(async () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();

    try {
      const storyDataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
      download(storyDataUrl, 'design-story-1080x1920.png');

      // Blog cover (1200x675) — crop center band of the story
      const img = document.createElement('img');
      img.src = storyDataUrl;
      await new Promise<void>((r) => { img.onload = () => r(); });

      const crop = document.createElement('canvas');
      crop.width = 1200;
      crop.height = 675;
      const ctx = crop.getContext('2d')!;
      const cropH = img.width * (675 / 1200);
      const srcY = (img.height - cropH) / 2;
      ctx.drawImage(img, 0, srcY, img.width, cropH, 0, 0, 1200, 675);
      download(crop.toDataURL('image/png'), 'design-blog-1200x675.png');
    } catch {
      // Tainted canvas from cross-origin images — export silently fails
    }
  }, [canvas]);

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-900">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/idees" className="text-white/60 hover:text-white">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <span className="text-sm font-semibold text-white/80">Editeur d&apos;images</span>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Exporter
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar canvas={canvas} />
        <ImageEditorCanvas onCanvasReady={setCanvas} />
      </div>
    </div>
  );
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
