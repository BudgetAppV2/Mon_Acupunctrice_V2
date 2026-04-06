'use client';

import { useState, useCallback, useRef } from 'react';
import type { Canvas } from 'fabric';
import { Path, Group, FabricImage } from 'fabric';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ORGANIC_SHAPES, type OrganicShape } from '@/lib/data/organicShapes';

interface Props { canvas: Canvas | null }

const CATEGORIES = [
  { id: 'zen', label: 'Zen', query: 'lotus leaf meditation zen bamboo' },
  { id: 'nature', label: 'Nature', query: 'flower tree sun mountain water' },
  { id: 'sante', label: 'Sante', query: 'heart health medical wellness pulse' },
  { id: 'formes', label: 'Formes', query: 'circle square triangle star hexagon' },
  { id: 'fleches', label: 'Fleches', query: 'arrow chevron direction pointer' },
  { id: 'deco', label: 'Decoratif', query: 'ornament sparkle frame border decoration' },
];

const FALLBACK: Record<string, string[]> = {
  zen: ['mdi:leaf', 'mdi:flower-outline', 'mdi:spa-outline', 'mdi:yin-yang', 'mdi:nature', 'mdi:sprout-outline'],
  nature: ['mdi:tree-outline', 'mdi:flower', 'mdi:weather-sunny', 'mdi:waves', 'mdi:water-outline', 'mdi:earth'],
  sante: ['mdi:heart-outline', 'mdi:medical-bag', 'mdi:pulse', 'mdi:pill', 'mdi:stethoscope', 'mdi:hospital-box-outline'],
  formes: ['mdi:circle-outline', 'mdi:square-outline', 'mdi:triangle-outline', 'mdi:star-outline', 'mdi:hexagon-outline', 'mdi:diamond-outline'],
  fleches: ['mdi:arrow-right', 'mdi:arrow-left', 'mdi:arrow-up', 'mdi:arrow-down', 'mdi:chevron-right', 'mdi:chevron-double-right'],
  deco: ['mdi:creation', 'mdi:crown-outline', 'mdi:shimmer', 'mdi:ribbon', 'mdi:star-four-points-outline', 'mdi:flare'],
};
const DEFAULT_FALLBACK = [...FALLBACK.zen, ...FALLBACK.formes, ...FALLBACK.sante];

/** Convert "mdi:leaf" → "mdi/leaf" for the SVG API URL */
function iconSvgUrl(icon: string) {
  return `https://api.iconify.design/${icon.replace(':', '/')}.svg?height=120`;
}

async function addSvgToCanvas(canvas: Canvas, iconName: string) {
  try {
    const res = await fetch(iconSvgUrl(iconName));
    if (!res.ok) throw new Error('fetch failed');
    const svgStr = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const fabricPaths: Path[] = [];
    doc.querySelectorAll('path').forEach((p) => {
      const d = p.getAttribute('d');
      if (!d) return;
      const fill = p.getAttribute('fill');
      fabricPaths.push(new Path(d, {
        fill: (!fill || fill === 'currentColor') ? '#212121' : fill === 'none' ? 'transparent' : fill,
        stroke: (p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none') ? p.getAttribute('stroke')! : undefined,
        strokeWidth: parseFloat(p.getAttribute('stroke-width') || '0') || 0,
      }));
    });
    let obj: InstanceType<typeof Path> | InstanceType<typeof Group> | InstanceType<typeof FabricImage>;
    if (fabricPaths.length > 0) {
      obj = fabricPaths.length === 1 ? fabricPaths[0] : new Group(fabricPaths);
    } else {
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      obj = await FabricImage.fromURL(url);
      URL.revokeObjectURL(url);
    }
    obj.set({ left: 440, top: 840, scaleX: 4, scaleY: 4, selectable: true, evented: true });
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  } catch { /* SVG fetch/parse failed */ }
}

function addOrganic(canvas: Canvas, shape: OrganicShape) {
  const p = new Path(shape.pathData, {
    fill: shape.defaultFill, left: 340, top: 760,
    scaleX: 3, scaleY: 3, selectable: true, evented: true,
  });
  canvas.add(p);
  canvas.setActiveObject(p);
  canvas.renderAll();
}

export default function IconSearchPanel({ canvas }: Props) {
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<string[]>(DEFAULT_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, catId?: string) => {
    if (!q.trim()) { setIcons(DEFAULT_FALLBACK); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=24`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const results = data.icons ?? [];
      setIcons(results.length > 0 ? results : (catId && FALLBACK[catId] ? FALLBACK[catId] : DEFAULT_FALLBACK));
    } catch {
      setIcons(catId && FALLBACK[catId] ? FALLBACK[catId] : DEFAULT_FALLBACK);
    }
    setLoading(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val); setActiveCat(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const pickCategory = (cat: typeof CATEGORIES[number]) => {
    setActiveCat(cat.id); setQuery(cat.query); search(cat.query, cat.id);
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Icones</h3>
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={query} onChange={(e) => handleInput(e.target.value)}
          placeholder="Rechercher une icone..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-teal-400" />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => pickCategory(c)}
            className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${activeCat === c.id ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
            {c.label}
          </button>
        ))}
      </div>
      {/* Organic shapes */}
      <h4 className="text-[10px] font-semibold text-white/50 uppercase mb-2 mt-3">Formes organiques</h4>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ORGANIC_SHAPES.map((s) => (
          <button key={s.id} onClick={() => canvas && addOrganic(canvas, s)}
            className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center p-2" title={s.name}>
            <svg viewBox={s.viewBox} className="w-8 h-8"><path d={s.pathData} fill={s.defaultFill} /></svg>
          </button>
        ))}
      </div>

      {loading && <p className="text-xs text-white/40">Chargement...</p>}
      <div className="grid grid-cols-4 gap-2">
        {icons.map((icon) => (
          <button key={icon} onClick={() => canvas && addSvgToCanvas(canvas, icon)}
            className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center" title={icon}>
            {/* Use direct SVG img instead of @iconify/react — more reliable, no JS runtime needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSvgUrl(icon)} alt={icon.split(':')[1]} width={24} height={24}
              className="w-6 h-6 invert opacity-70" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
