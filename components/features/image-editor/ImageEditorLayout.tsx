'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Canvas, FabricObject } from 'fabric';
import { ActiveSelection, Group, Point, util } from 'fabric';
import Link from 'next/link';
import {
  ArrowLeftIcon, ArrowDownTrayIcon, PlayIcon, StopIcon,
  ArrowUturnLeftIcon, ArrowUturnRightIcon, ScissorsIcon, TrashIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import ImageEditorCanvas from './ImageEditorCanvas';
import Sidebar from './Sidebar';
import MobileBar from './MobileBar';
import { playPreview, type PlaybackHandle } from '@/lib/image-editor/animationEngine';
import { HistoryManager } from '@/lib/image-editor/historyManager';

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setM(mq.matches);
    const fn = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return m;
}

function useReturnTo() {
  const [returnTo, setReturnTo] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get('returnTo'));
  }, []);
  return returnTo;
}

export default function ImageEditorLayout() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const returnTo = useReturnTo();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [hist, setHist] = useState({ u: false, r: false });
  const pbRef = useRef<PlaybackHandle | null>(null);
  const hmRef = useRef(new HistoryManager());
  const isMobile = useIsMobile();

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

  // Keyboard shortcuts — Delete + Undo/Redo
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!canvas) return;
      // Don't intercept delete/backspace when editing text or typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if (mod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); doRedo(); }
      if (mod && e.key === 'y') { e.preventDefault(); doRedo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && !(canvas.getActiveObject() as unknown as { isEditing?: boolean })?.isEditing) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });

  const doUndo = async () => { if (canvas) { await hmRef.current.undo(canvas); setHist({ u: hmRef.current.canUndo, r: hmRef.current.canRedo }); } };
  const doRedo = async () => { if (canvas) { await hmRef.current.redo(canvas); setHist({ u: hmRef.current.canUndo, r: hmRef.current.canRedo }); } };

  const deleteSelected = useCallback(() => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    // Multi-selection (shift+click) → remove all selected objects
    if (active instanceof ActiveSelection) {
      const objs = active.getObjects();
      canvas.discardActiveObject();
      objs.forEach((o) => canvas.remove(o));
    } else {
      canvas.remove(active);
    }
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [canvas]);

  const ungroupSelected = useCallback(() => {
    if (!canvas) return;
    const grp = canvas.getActiveObject();
    if (!grp || !(grp instanceof Group)) return;

    // Capture absolute center of each child WHILE still in group
    const items = grp.getObjects().slice();
    const centers = items.map((item) => {
      const m = item.calcTransformMatrix();
      const d = util.qrDecompose(m);
      return { x: d.translateX, y: d.translateY, sx: d.scaleX, sy: d.scaleY, a: d.angle };
    });

    // Fabric's removeAll detaches children from the group properly
    grp.removeAll();
    canvas.remove(grp);

    items.forEach((item, i) => {
      const c = centers[i];
      // Make every item interactive
      item.set({ selectable: true, evented: true, hasControls: true });
      item.scaleX = c.sx;
      item.scaleY = c.sy;
      item.angle = c.a;

      // Enable text editing — direct property access (TypeScript set() ignores unknown keys)
      if (item.type === 'textbox' || item.type === 'i-text') {
        (item as unknown as { editable: boolean }).editable = true;
      }

      canvas.add(item);
      item.setPositionByOrigin(new Point(c.x, c.y), 'center', 'center');
      item.setCoords();
    });

    canvas.discardActiveObject();
    canvas.renderAll();
  }, [canvas]);

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
    if (!canvas || exporting) return;
    setExporting(true);
    canvas.discardActiveObject(); canvas.renderAll();
    try {
      const storyDataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });

      // Generate blog cover (1200x675) — crop 16:9 band from upper-center
      const im = document.createElement('img'); im.src = storyDataUrl;
      await new Promise<void>((r) => { im.onload = () => r(); });
      const cropCanvas = document.createElement('canvas'); cropCanvas.width = 1200; cropCanvas.height = 675;
      const ctx = cropCanvas.getContext('2d')!;
      const cropH = im.width * (9 / 16);
      ctx.drawImage(im, 0, (im.height - cropH) * 0.35, im.width, cropH, 0, 0, 1200, 675);
      const coverDataUrl = cropCanvas.toDataURL('image/png');

      if (returnTo === 'blog') {
        // Send BOTH formats back to BlogEditor via localStorage bridge
        localStorage.setItem('editor-export-blog', JSON.stringify({ coverDataUrl, storyDataUrl }));
        // Close this tab — user returns to BlogEditor
        window.close();
      } else {
        // Standard export — download both files
        dl(storyDataUrl, 'design-story-1080x1920.png');
        dl(coverDataUrl, 'design-blog-1200x675.png');
        setExported(true);
        setTimeout(() => setExported(false), 3000);
      }
    } catch { /* tainted canvas */ }
    setExporting(false);
  }, [canvas, returnTo, exporting]);

  const hasSelection = selectedType !== null;

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-900" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/idees" className="text-white/60 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></Link>
          <span className="text-sm font-semibold text-white/80 hidden sm:inline">Editeur d&apos;images</span>
        </div>
        <div className="flex items-center gap-1">
          <HBtn icon={ArrowUturnLeftIcon} onClick={doUndo} disabled={!hist.u} title="Undo" />
          <HBtn icon={ArrowUturnRightIcon} onClick={doRedo} disabled={!hist.r} title="Redo" />
          {hasSelection && (
            <HBtn icon={TrashIcon} onClick={deleteSelected} title="Supprimer" />
          )}
          {selectedType === 'group' && (
            <HBtn icon={Square2StackIcon} onClick={ungroupSelected} title="Degrouper" />
          )}
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          {selectedType === 'image' && (
            <button onClick={removeBg} disabled={removing}
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
              <ScissorsIcon className="w-3.5 h-3.5" />{removing ? '...' : 'Detourer'}
            </button>
          )}
          <button onClick={togglePlay}
            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-lg ${playing ? 'text-white bg-red-600 hover:bg-red-500' : 'text-white bg-indigo-600 hover:bg-indigo-500'}`}>
            {playing ? <StopIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{playing ? 'Arreter' : 'Jouer'}</span>
          </button>
          <button onClick={doExport} disabled={exporting}
            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-white rounded-lg disabled:opacity-50 ${exported ? 'bg-emerald-600' : 'bg-teal-600 hover:bg-teal-500'}`}>
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{exporting ? 'Export...' : exported ? 'Exporte!' : 'Exporter'}</span>
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop: sidebar */}
        {!isMobile && <Sidebar canvas={canvas} selectedType={selectedType} extractedPalette={palette} />}
        {/* Canvas */}
        <ImageEditorCanvas onCanvasReady={setCanvas} />
        {/* Mobile: bottom bar + sheet */}
        {isMobile && <MobileBar canvas={canvas} selectedType={selectedType} extractedPalette={palette} />}
      </div>
    </div>
  );
}

function HBtn({ icon: I, onClick, disabled, title }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="p-2 sm:p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none min-w-[36px] min-h-[36px] flex items-center justify-center">
      <I className="w-4 h-4" />
    </button>
  );
}

function dl(u: string, n: string) {
  const a = document.createElement('a'); a.href = u; a.download = n;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
