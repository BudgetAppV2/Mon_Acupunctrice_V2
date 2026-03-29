'use client';

import { FONT_OPTIONS, FONT_CATEGORY_LABELS } from '@/lib/data/fontPack';
import { loadFont } from '@/lib/utils/fontLoader';

interface Props {
  value: string;
  onChange: (fontFamily: string) => void;
  /** Mode compact : pas de labels de catégorie, boutons plus petits */
  compact?: boolean;
}

const CATEGORIES = ['impact', 'elegant', 'modern', 'creative'] as const;

export default function FontPicker({ value, onChange, compact = false }: Props) {
  return (
    <div className={compact ? 'flex flex-wrap gap-1' : 'space-y-2'}>
      {CATEGORIES.map(cat => {
        const fonts = FONT_OPTIONS.filter(f => f.category === cat);
        if (!fonts.length) return null;
        return (
          <div key={cat}>
            {!compact && (
              <p className="text-[9px] text-gray-600 mb-0.5 uppercase tracking-wide">
                {FONT_CATEGORY_LABELS[cat]}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {fonts.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    onChange(f.fontFamily);
                    loadFont(f.fontFamily).catch(() => {});
                  }}
                  style={{ fontFamily: `"${f.fontFamily}", ${f.fallback}` }}
                  className={`px-2 py-1 rounded-md text-xs border transition ${
                    value === f.fontFamily
                      ? 'border-sage bg-sage/20 text-white'
                      : 'border-gray-700 text-gray-300 bg-gray-800/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
