'use client';

import { useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import type { Canvas } from 'fabric';
import { Path, Group, FabricImage } from 'fabric';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props { canvas: Canvas | null }

const CATEGORIES = [
  { id: 'zen', label: 'Zen', query: 'lotus leaf meditation zen bamboo' },
  { id: 'nature', label: 'Nature', query: 'flower tree sun mountain water' },
  { id: 'sante', label: 'Sante', query: 'heart health medical wellness pulse' },
  { id: 'formes', label: 'Formes', query: 'circle square triangle star hexagon' },
  { id: 'fleches', label: 'Fleches', query: 'arrow chevron direction pointer' },
  { id: 'deco', label: 'Decoratif', query: 'ornament sparkle frame border decoration' },
];

async function addSvgToCanvas(canvas: Canvas, iconName: string) {
  const [prefix, name] = iconName.split(':');
  const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg?height=120`);
  const svgStr = await res.text();

  // Try extracting paths for vector rendering
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
    // Fallback: render SVG as image
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    obj = await FabricImage.fromURL(url);
    URL.revokeObjectURL(url);
  }
  obj.set({ left: 440, top: 840, scaleX: 4, scaleY: 4, selectable: true, evented: true });
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

export default function IconSearchPanel({ canvas }: Props) {
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setIcons([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=24`);
      const data = await res.json();
      setIcons(data.icons ?? []);
    } catch { setIcons([]); }
    setLoading(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    setActiveCat(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const pickCategory = (cat: typeof CATEGORIES[number]) => {
    setActiveCat(cat.id);
    setQuery(cat.query);
    search(cat.query);
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
      {loading && <p className="text-xs text-white/40">Chargement...</p>}
      <div className="grid grid-cols-4 gap-2">
        {icons.map((icon) => (
          <button key={icon} onClick={() => canvas && addSvgToCanvas(canvas, icon)}
            className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center" title={icon}>
            <Icon icon={icon} width={24} className="text-white/70" />
          </button>
        ))}
      </div>
    </div>
  );
}
