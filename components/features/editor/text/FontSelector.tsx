'use client';

import { useState, useEffect } from 'react';
import { loadFont, FONT_CATEGORIES, CATEGORY_LABELS } from '@/lib/utils/fontLoader';

interface Props {
  value: string;
  onChange: (family: string) => void;
}

const CATS = Object.keys(FONT_CATEGORIES);

export default function FontSelector({ value, onChange }: Props) {
  const [activeCat, setActiveCat] = useState(() => {
    for (const [cat, fonts] of Object.entries(FONT_CATEGORIES)) {
      if (fonts.includes(value)) return cat;
    }
    return CATS[0];
  });

  const fonts = FONT_CATEGORIES[activeCat] ?? [];

  useEffect(() => { fonts.forEach(f => loadFont(f)); }, [activeCat]);

  const handleSelect = (family: string) => {
    loadFont(family);
    onChange(family);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">Police</label>
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
              activeCat === cat ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {fonts.map(f => (
          <button
            key={f}
            onClick={() => handleSelect(f)}
            className={`px-2 py-1.5 rounded text-sm text-left truncate transition ${
              value === f ? 'bg-sage/20 ring-1 ring-sage text-white' : 'bg-gray-800 text-gray-300'
            }`}
            style={{ fontFamily: `"${f}", sans-serif` }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
