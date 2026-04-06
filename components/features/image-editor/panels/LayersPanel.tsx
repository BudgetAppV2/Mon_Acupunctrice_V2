'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Canvas, FabricObject, Textbox } from 'fabric';
import {
  EyeIcon, EyeSlashIcon, LockClosedIcon, LockOpenIcon,
  TrashIcon, ChevronUpIcon, ChevronDownIcon,
  ChevronDoubleUpIcon, ChevronDoubleDownIcon,
} from '@heroicons/react/24/outline';

interface Props { canvas: Canvas | null }

function getLayerName(obj: FabricObject): string {
  const t = obj.type;
  if (t === 'textbox' || t === 'i-text') {
    const text = (obj as Textbox).text || '';
    return text.substring(0, 22) + (text.length > 22 ? '...' : '');
  }
  if (t === 'image') return 'Image';
  if (t === 'rect') return 'Rectangle';
  if (t === 'circle') return 'Cercle';
  if (t === 'ellipse') return 'Ellipse';
  if (t === 'path') return 'Forme';
  if (t === 'group') return 'Groupe';
  return t || 'Objet';
}

function getTypeIcon(obj: FabricObject): string {
  const t = obj.type;
  if (t === 'textbox' || t === 'i-text') return 'T';
  if (t === 'image') return '\u{1F5BC}';
  if (t === 'rect' || t === 'circle' || t === 'ellipse') return '\u25A1';
  if (t === 'path') return '\u2B21';
  if (t === 'group') return '\u29C9';
  return '\u25CF';
}

export default function LayersPanel({ canvas }: Props) {
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [, forceUpdate] = useState(0);
  const dragIdx = useRef<number | null>(null);

  const refresh = useCallback(() => {
    if (!canvas) return;
    // Top-to-bottom order (reversed from canvas internal order)
    setObjects([...canvas.getObjects()].reverse());
    const sel = canvas.getActiveObject();
    setActiveId(sel ? canvas.getObjects().indexOf(sel) : null);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    refresh();
    const ev = ['object:added', 'object:removed', 'object:modified', 'selection:created', 'selection:updated', 'selection:cleared'] as const;
    ev.forEach((e) => canvas.on(e, refresh));
    return () => { ev.forEach((e) => canvas.off(e, refresh)); };
  }, [canvas, refresh]);

  const select = (obj: FabricObject) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    refresh();
  };

  const toggleVisible = (obj: FabricObject) => {
    obj.set('visible', !obj.visible);
    canvas?.renderAll();
    forceUpdate((n) => n + 1);
  };

  const toggleLock = (obj: FabricObject) => {
    const locked = !obj.selectable;
    obj.set({ selectable: locked, evented: locked });
    canvas?.renderAll();
    forceUpdate((n) => n + 1);
  };

  const remove = (obj: FabricObject) => {
    if (!canvas) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const moveUp = (obj: FabricObject) => { canvas?.bringObjectForward(obj); canvas?.renderAll(); refresh(); };
  const moveDown = (obj: FabricObject) => { canvas?.sendObjectBackwards(obj); canvas?.renderAll(); refresh(); };
  const moveTop = (obj: FabricObject) => { canvas?.bringObjectToFront(obj); canvas?.renderAll(); refresh(); };
  const moveBottom = (obj: FabricObject) => { canvas?.sendObjectToBack(obj); canvas?.renderAll(); refresh(); };

  // Drag and drop reorder
  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (targetIdx: number) => {
    if (!canvas || dragIdx.current === null || dragIdx.current === targetIdx) return;
    const allObjs = canvas.getObjects();
    const fromCanvas = allObjs.length - 1 - dragIdx.current;
    const toCanvas = allObjs.length - 1 - targetIdx;
    const obj = allObjs[fromCanvas];
    if (obj) { canvas.moveObjectTo(obj, toCanvas); canvas.renderAll(); refresh(); }
    dragIdx.current = null;
  };

  const selected = canvas?.getActiveObject();

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Calques</h3>

      {/* Layer list */}
      <div className="space-y-0.5 mb-3 max-h-[400px] overflow-y-auto">
        {objects.map((obj, i) => {
          const canvasIdx = (canvas?.getObjects().length ?? 0) - 1 - i;
          const isActive = obj === selected;
          const isLocked = !obj.selectable;
          const isHidden = !obj.visible;

          return (
            <div key={`${canvasIdx}-${obj.type}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              onClick={() => !isLocked && select(obj)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-teal-500/20 ring-1 ring-teal-400' : 'hover:bg-white/5'
              } ${isHidden ? 'opacity-40' : ''} ${isLocked ? 'cursor-not-allowed' : ''}`}
            >
              {/* Type icon */}
              <span className="w-5 h-5 flex items-center justify-center text-[11px] text-white/40 shrink-0 bg-white/5 rounded">
                {getTypeIcon(obj)}
              </span>

              {/* Name */}
              <span className="flex-1 text-[10px] text-white/70 truncate">
                {getLayerName(obj)}
              </span>

              {/* Visibility toggle */}
              <button onClick={(e) => { e.stopPropagation(); toggleVisible(obj); }}
                className="p-0.5 text-white/30 hover:text-white/70" title={isHidden ? 'Afficher' : 'Masquer'}>
                {isHidden ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>

              {/* Lock toggle */}
              <button onClick={(e) => { e.stopPropagation(); toggleLock(obj); }}
                className="p-0.5 text-white/30 hover:text-white/70" title={isLocked ? 'Deverrouiller' : 'Verrouiller'}>
                {isLocked ? <LockClosedIcon className="w-3.5 h-3.5 text-amber-400" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
        {objects.length === 0 && <p className="text-xs text-white/30">Aucun calque</p>}
      </div>

      {/* Actions for selected layer */}
      {selected && (
        <div className="border-t border-white/10 pt-2 flex flex-wrap gap-1">
          <ABtn icon={ChevronDoubleUpIcon} onClick={() => moveTop(selected)} title="Tout devant" />
          <ABtn icon={ChevronUpIcon} onClick={() => moveUp(selected)} title="Monter" />
          <ABtn icon={ChevronDownIcon} onClick={() => moveDown(selected)} title="Descendre" />
          <ABtn icon={ChevronDoubleDownIcon} onClick={() => moveBottom(selected)} title="Tout derriere" />
          <ABtn icon={LockClosedIcon} onClick={() => toggleLock(selected)} title="Verrouiller" />
          <ABtn icon={EyeSlashIcon} onClick={() => toggleVisible(selected)} title="Masquer" />
          <ABtn icon={TrashIcon} onClick={() => remove(selected)} title="Supprimer" className="text-red-400 hover:bg-red-400/10" />
        </div>
      )}
    </div>
  );
}

function ABtn({ icon: I, onClick, title, className }: {
  icon: React.ComponentType<{ className?: string }>; onClick: () => void; title: string; className?: string;
}) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors ${className ?? ''}`}>
      <I className="w-4 h-4" />
    </button>
  );
}
