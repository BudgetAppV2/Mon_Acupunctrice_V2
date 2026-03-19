'use client';

import { useRef, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import type { TextOverlayItem } from '@/lib/types';

interface Props { width: number; height: number; interactive: boolean }

function buildShadow(o: TextOverlayItem): string | undefined {
  const s: string[] = [];
  if (o.strokeWidth && o.stroke) {
    const w = o.strokeWidth;
    s.push(`-${w}px -${w}px 0 ${o.stroke}`, `${w}px -${w}px 0 ${o.stroke}`, `-${w}px ${w}px 0 ${o.stroke}`, `${w}px ${w}px 0 ${o.stroke}`);
  }
  if (o.shadowColor && o.shadowBlur) s.push(`0 0 ${o.shadowBlur}px ${o.shadowColor}`);
  return s.length ? s.join(', ') : undefined;
}

export default function TextOverlayLayer({ width, height, interactive }: Props) {
  const { overlays, currentTime, selectedOverlayId, updateOverlay, selectOverlay } = useEditorStore();
  const visible = overlays.filter(o => currentTime >= o.startTime && currentTime <= o.endTime);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
      {visible.map(o => (
        <DraggableText
          key={o.id} overlay={o} selected={o.id === selectedOverlayId}
          interactive={interactive} parentW={width} parentH={height} currentTime={currentTime}
          onSelect={() => selectOverlay(o.id)}
          onMove={(x, y) => updateOverlay(o.id, { x, y })}
        />
      ))}
    </div>
  );
}

interface DragProps {
  overlay: TextOverlayItem; selected: boolean; interactive: boolean;
  parentW: number; parentH: number; currentTime: number;
  onSelect: () => void; onMove: (x: number, y: number) => void;
}

function DraggableText({ overlay: o, selected, interactive, parentW, parentH, currentTime, onSelect, onMove }: DragProps) {
  const ref = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    ref.current = { sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    onMove(ref.current.ox + (e.clientX - ref.current.sx) / parentW, ref.current.oy + (e.clientY - ref.current.sy) / parentH);
  };
  const onPointerUp = () => setDragging(false);

  // Animation d'entrée (0.5s)
  const t = Math.min((currentTime - o.startTime) / 0.5, 1);
  let transform = 'translate(-50%, -50%)';
  let opacity = 1;
  if (t < 1) {
    switch (o.animation) {
      case 'fade': opacity = t; break;
      case 'slide_up': transform += ` translateY(${(1 - t) * 40}px)`; opacity = t; break;
      case 'slide_left': transform += ` translateX(${(1 - t) * 40}px)`; opacity = t; break;
      case 'bounce': { const s = t < 0.6 ? (t / 0.6) * 1.2 : 1.2 - ((t - 0.6) / 0.4) * 0.2; transform += ` scale(${s})`; break; }
      case 'zoom': transform += ` scale(${t})`; opacity = t; break;
    }
  }

  return (
    <div
      className={`absolute select-none whitespace-nowrap ${interactive ? 'cursor-move' : ''} ${selected ? 'outline outline-2 outline-sage outline-offset-2 rounded' : ''}`}
      style={{
        left: `${o.x * 100}%`, top: `${o.y * 100}%`, transform, opacity,
        fontFamily: `"${o.fontFamily}", sans-serif`, fontSize: `${o.fontSize}px`, fontWeight: 700,
        color: o.fill, textShadow: buildShadow(o),
      }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
    >
      {o.text}
    </div>
  );
}
