'use client';

import { useState, useRef, useCallback } from 'react';
import type { Canvas } from 'fabric';
import { Gradient } from 'fabric';
import { PlusIcon, EyeDropperIcon } from '@heroicons/react/24/outline';
import { hsvToHex, hexToHsv, GRADIENT_DIRS, BRAND_GRADIENTS } from '@/lib/image-editor/colorUtils';

interface Props { canvas: Canvas | null }

const BRAND = ['#7EBEC5', '#AAD1D2', '#5C7A5F', '#3D5E40', '#212121', '#F4F4F4', '#FFFFFF'];
const GRID = [
  '#000000', '#434343', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#E91E63', '#9B59B6', '#3498DB', '#2ECC71', '#F1C40F',
  '#E67E22', '#1ABC9C', '#8E44AD', '#2980B9', '#27AE60', '#F39C12',
];

export default function ColorPanel({ canvas }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const [tab, setTab] = useState<'solid' | 'gradient'>('solid');
  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(0.7);
  const [val, setVal] = useState(0.8);
  const [hexIn, setHexIn] = useState(hsvToHex(180, 0.7, 0.8));
  const [mode, setMode] = useState<'fill' | 'stroke'>('fill');
  const [gDir, setGDir] = useState('h');
  const [gStops, setGStops] = useState([
    { offset: 0, color: '#7EBEC5' },
    { offset: 1, color: '#AAD1D2' },
  ]);

  const apply = useCallback((color: string) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set(mode, color);
    canvas.renderAll();
  }, [canvas, mode]);

  const applyGrad = useCallback((stops: { offset: number; color: string }[], dirId?: string) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const dir = GRADIENT_DIRS.find((d) => d.id === (dirId ?? gDir)) ?? GRADIENT_DIRS[0];
    // Use object's local width/height (before scale) — Fabric applies scale at render time
    const w = obj.width ?? 100;
    const h = obj.height ?? 100;
    obj.set('fill', new Gradient({ type: dir.type, coords: dir.coords(w, h), colorStops: stops }));
    canvas.renderAll();
  }, [canvas, gDir]);

  const pickHsv = (h: number, s: number, v: number) => {
    setHue(h); setSat(s); setVal(v);
    const hex = hsvToHex(h, s, v);
    setHexIn(hex);
    apply(hex);
  };

  const onHexCommit = () => {
    const clean = hexIn.startsWith('#') ? hexIn : '#' + hexIn;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      const [h, s, v] = hexToHsv(clean);
      setHue(h); setSat(s); setVal(v);
      apply(clean);
    }
  };

  const eyeDrop = async () => {
    if (!('EyeDropper' in window)) return;
    try {
      const result = await new (window as unknown as { EyeDropper: { new(): { open(): Promise<{ sRGBHex: string }> } } }).EyeDropper().open();
      const [h, s, v] = hexToHsv(result.sRGBHex);
      pickHsv(h, s, v);
    } catch { /* user cancelled */ }
  };

  // Document colors — collected from canvas objects
  const docColors: string[] = [];
  if (canvas) {
    const set = new Set<string>();
    for (const o of canvas.getObjects()) {
      if (typeof o.fill === 'string' && o.fill && o.fill !== 'transparent') set.add(o.fill);
    }
    set.forEach((c) => { if (c.startsWith('#') && docColors.length < 10) docColors.push(c); });
  }

  const active = canvas?.getActiveObject();
  if (!active) return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Couleurs</h3>
      <p className="text-xs text-white/40">Selectionnez un element pour modifier sa couleur.</p>
    </div>
  );

  // --- Advanced picker ---
  if (advanced) return (
    <div>
      <button onClick={() => setAdvanced(false)} className="text-[10px] text-teal-400 mb-2 hover:underline">Retour</button>
      <div className="flex gap-1 mb-3">
        {(['solid', 'gradient'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1 text-[10px] rounded-lg ${tab === t ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/50'}`}>
            {t === 'solid' ? 'Couleur unie' : 'Degrade'}
          </button>
        ))}
      </div>

      {tab === 'solid' ? (
        <div className="space-y-3">
          <Spectrum hue={hue} sat={sat} val={val} onChange={(s, v) => pickHsv(hue, s, v)} />
          <HueBar hue={hue} onChange={(h) => pickHsv(h, sat, val)} />
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded border border-white/20" style={{ backgroundColor: hsvToHex(hue, sat, val) }} />
            <input value={hexIn} onChange={(e) => setHexIn(e.target.value)} onBlur={onHexCommit} onKeyDown={(e) => e.key === 'Enter' && onHexCommit()}
              className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white font-mono focus:outline-none focus:border-teal-400" />
            {'EyeDropper' in globalThis && (
              <button onClick={eyeDrop} className="p-1.5 rounded bg-white/5 hover:bg-white/10" title="Pipette">
                <EyeDropperIcon className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-[10px] text-white/50 uppercase">Stops</h4>
          <div className="flex gap-1 items-center">
            {gStops.map((s, i) => (
              <input key={i} type="color" value={s.color}
                onChange={(e) => { const next = [...gStops]; next[i] = { ...next[i], color: e.target.value }; setGStops(next); applyGrad(next); }}
                className="w-7 h-7 rounded-full border border-white/20 cursor-pointer bg-transparent" />
            ))}
            {gStops.length < 5 && (
              <button onClick={() => { const next = [...gStops, { offset: 1, color: '#FFFFFF' }]; const spaced = next.map((s, i) => ({ ...s, offset: i / (next.length - 1) })); setGStops(spaced); applyGrad(spaced); }}
                className="w-7 h-7 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/70">
                <PlusIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <h4 className="text-[10px] text-white/50 uppercase">Direction</h4>
          <div className="flex gap-1">
            {GRADIENT_DIRS.map((d) => (
              <button key={d.id} onClick={() => { setGDir(d.id); applyGrad(gStops, d.id); }}
                className={`flex-1 py-1.5 text-[10px] rounded ${gDir === d.id ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/50'}`}>
                {d.label}
              </button>
            ))}
          </div>
          <h4 className="text-[10px] text-white/50 uppercase">Predefinis</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {BRAND_GRADIENTS.map((g) => (
              <button key={g.name} onClick={() => { setGStops(g.stops); applyGrad(g.stops); }}
                className="h-8 rounded-lg border border-white/10 hover:border-teal-400"
                style={{ background: `linear-gradient(to right, ${g.stops.map((s) => s.color).join(', ')})` }}
                title={g.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // --- Main panel ---
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/60 uppercase">Couleurs</h3>
        <div className="flex gap-1">
          {(['fill', 'stroke'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-[9px] rounded ${mode === m ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/40'}`}>
              {m === 'fill' ? 'Remplissage' : 'Contour'}
            </button>
          ))}
        </div>
      </div>

      {docColors.length > 0 && (<>
        <p className="text-[10px] text-white/40 mb-1">Couleurs du document</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {docColors.map((c) => <Swatch key={c} color={c} onClick={apply} />)}
        </div>
      </>)}

      <p className="text-[10px] text-white/40 mb-1">La Source en Soi</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {BRAND.map((c) => <Swatch key={c} color={c} onClick={apply} />)}
      </div>

      <p className="text-[10px] text-white/40 mb-1">Couleurs unies</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {GRID.map((c) => <Swatch key={c} color={c} onClick={apply} />)}
      </div>

      <button onClick={() => setAdvanced(true)}
        className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/80 transition-colors">
        <PlusIcon className="w-4 h-4" /> Selecteur avance
      </button>
    </div>
  );
}

// --- Sub-components ---

function Swatch({ color, onClick }: { color: string; onClick: (c: string) => void }) {
  return (
    <button onClick={() => onClick(color)}
      className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
      style={{ backgroundColor: color }} title={color} />
  );
}

function Spectrum({ hue, sat, val, onChange }: { hue: number; sat: number; val: number; onChange: (s: number, v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDrag(ref, (x, y) => onChange(x, 1 - y));
  return (
    <div ref={ref} className="relative w-full aspect-square rounded cursor-crosshair"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
      onPointerDown={drag}>
      <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }} />
    </div>
  );
}

function HueBar({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDrag(ref, (x) => onChange(x * 360));
  return (
    <div ref={ref} className="relative w-full h-3 rounded-full cursor-pointer"
      style={{ background: 'linear-gradient(to right, hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))' }}
      onPointerDown={drag}>
      <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${(hue / 360) * 100}%` }} />
    </div>
  );
}

/** Reusable pointer drag — returns normalized (0-1) x,y while dragging */
function useDrag(ref: React.RefObject<HTMLDivElement | null>, onMove: (x: number, y: number) => void) {
  return (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const up = (ev: PointerEvent) => { calc(ev); window.removeEventListener('pointermove', calc); window.removeEventListener('pointerup', up); };
    const calc = (ev: PointerEvent | React.PointerEvent) => {
      onMove(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)));
    };
    calc(e);
    window.addEventListener('pointermove', calc);
    window.addEventListener('pointerup', up);
  };
}
