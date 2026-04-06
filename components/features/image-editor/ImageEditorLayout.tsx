'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Canvas, FabricObject } from 'fabric';
import Link from 'next/link';
import {
  ArrowLeftIcon, ArrowDownTrayIcon, PlayIcon, StopIcon,
  ArrowUturnLeftIcon, ArrowUturnRightIcon, ScissorsIcon,
} from '@heroicons/react/24/outline';
import ImageEditorCanvas from './ImageEditorCanvas';
import Sidebar from './Sidebar';
import { playPreview, type PlaybackHandle } from '@/lib/image-editor/animationEngine';
import { HistoryManager } from '@/lib/image-editor/historyManager';

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');

export default function ImageEditorLayout() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [hist, setHist] = useState({ u: false, r: false });
  const pbRef = useRef<PlaybackHandle | null>(null);
  const hmRef = useRef(new HistoryManager());

  // Canvas event wiring
  useEffect(() => {
    if (!canvas) return;
    const hm = hmRef.current;
    const sync = () => setHist({ u: hm.canUndo, r: hm.canRedo });
    const onMod = () => { hm.push(canvas); sync(); };
    const onAdd = (e: { target?: FabricObject }) => {
      hm.push(canvas); sync();
      if (e.target?.type === 'image') extractColors(e.target);
    };
    const onRm = () => { hm.push(canvas); sync(); };
    const onSel = (e: { selected?: FabricObject[] }) => setSelectedType(e.selected?.[0]?.type ?? null);
    const onClr = () => setSelectedType(null);

    canvas.on('object:modified', onMod);
    canvas.on('object:added', onAdd);
    canvas.on('object:removed', onRm);
    canvas.on('selection:created', onSel);
    canvas.on('selection:updated', onSel);
    canvas.on('selection:cleared', onClr);
    hm.push(canvas); sync();

    async function extractColors(obj: FabricObject) {
      try {
        const el = (obj as unknown as { getElement?: () => HTMLElement }).getElement?.() as HTMLImageElement | undefined;
        if (!el || !(el instanceof HTMLImageElement) || !el.complete) return;
        const { getPaletteSync } = await import('colorthief');
        const colors = getPaletteSync(el, { colorCount: 5 });
        if (colors) setPalette(colors.map((c) => c.hex()));
      } catch { /* extraction failed */ }
    }

    return () => {
      canvas.off('object:modified', onMod); canvas.off('object:added', onAdd);
      canvas.off('object:removed', onRm); canvas.off('selection:created', onSel);
      canvas.off('selection:updated', onSel); canvas.off('selection:cleared', onClr);
    };
  }, [canvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!canvas) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if (mod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey)) ) { e.preventDefault(); doRedo(); }
      if (mod && e.key === 'y') { e.preventDefault(); doRedo(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });

  const doUndo = async () => { if (canvas) { await hmRef.current.undo(canvas); setHist({ u: hmRef.current.canUndo, r: hmRef.current.canRedo }); } };
  const doRedo = async () => { if (canvas) { await hmRef.current.redo(canvas); setHist({ u: hmRef.current.canUndo, r: hmRef.current.canRedo }); } };

  const togglePlay = () => {
    if (!canvas) return;
    if (playing) { pbRef.current?.stop(); pbRef.current = null; setPlaying(false); return; }
    pbRef.current = playPreview(canvas); setPlaying(true);
  };

  const removeBg = useCallback(async () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'image') return;
    setRemoving(true);
    try {
      const du = (obj as unknown as { toDataURL: (o: { format: string }) => string }).toDataURL({ format: 'png' });
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(du);
      const url = URL.createObjectURL(blob);
      const { FabricImage } = await import('fabric');
      const ni = await FabricImage.fromURL(url);
      ni.set({ left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle, selectable: true, evented: true });
      canvas.remove(obj); canvas.add(ni); canvas.setActiveObject(ni); canvas.renderAll();
      URL.revokeObjectURL(url);
    } catch { /* removal failed */ }
    setRemoving(false);
  }, [canvas]);

  const doExport = useCallback(async () => {
    if (!canvas) return;
    canvas.discardActiveObject(); canvas.renderAll();
    try {
      const sd = canvas.toDataURL({ format: 'png', multiplier: 1 });
      dl(sd, 'design-story-1080x1920.png');
      const im = document.createElement('img'); im.src = sd;
      await new Promise<void>((r) => { im.onload = () => r(); });
      const c = document.createElement('canvas'); c.width = 1200; c.height = 675;
      const cx = c.getContext('2d')!;
      const ch = im.width * (675 / 1200);
      cx.drawImage(im, 0, (im.height - ch) / 2, im.width, ch, 0, 0, 1200, 675);
      dl(c.toDataURL('image/png'), 'design-blog-1200x675.png');
    } catch { /* tainted canvas */ }
  }, [canvas]);

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-900">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/idees" className="text-white/60 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></Link>
          <span className="text-sm font-semibold text-white/80">Editeur d&apos;images</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Btn icon={ArrowUturnLeftIcon} onClick={doUndo} disabled={!hist.u} title="Undo (Ctrl+Z)" />
          <Btn icon={ArrowUturnRightIcon} onClick={doRedo} disabled={!hist.r} title="Redo (Ctrl+Shift+Z)" />
          <div className="w-px h-5 bg-white/10 mx-1" />
          {selectedType === 'image' && (
            <button onClick={removeBg} disabled={removing}
              className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
              <ScissorsIcon className="w-3.5 h-3.5" />{removing ? 'Detourage...' : 'Detourer'}
            </button>
          )}
          <button onClick={togglePlay}
            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-lg ${playing ? 'text-white bg-red-600 hover:bg-red-500' : 'text-white bg-indigo-600 hover:bg-indigo-500'}`}>
            {playing ? <StopIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
            {playing ? 'Arreter' : 'Jouer'}
          </button>
          <button onClick={doExport}
            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500">
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />Exporter
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar canvas={canvas} selectedType={selectedType} extractedPalette={palette} />
        <ImageEditorCanvas onCanvasReady={setCanvas} />
      </div>
    </div>
  );
}

function Btn({ icon: I, onClick, disabled, title }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none">
      <I className="w-4 h-4" />
    </button>
  );
}

function dl(u: string, n: string) {
  const a = document.createElement('a'); a.href = u; a.download = n;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
