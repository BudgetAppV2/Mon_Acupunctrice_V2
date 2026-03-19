'use client';

import { loadFont, FONT_CATEGORIES, CATEGORY_LABELS } from '@/lib/utils/fontLoader';

interface Props {
  value: string;
  onChange: (family: string) => void;
}

export default function FontSelector({ value, onChange }: Props) {
  const handleChange = (family: string) => {
    loadFont(family);
    onChange(family);
  };

  return (
    <div>
      <label className="text-xs text-gray-500">Police</label>
      <select
        value={value}
        onChange={e => handleChange(e.target.value)}
        className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 mt-0.5"
      >
        {Object.entries(FONT_CATEGORIES).map(([cat, fonts]) => (
          <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
