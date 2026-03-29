'use client';

import { TEXT_STYLE_PRESETS } from '@/lib/data/fontPack';

interface Props {
  value: string | null;
  onChange: (presetId: string | null) => void;
}

const PRESET_CATEGORY_LABELS: Record<string, string> = {
  subtitle: 'Sous-titres',
  hook: 'Hook',
  quote: 'Citation',
  creative: 'Créatif',
};

const PRESET_CATEGORIES = ['subtitle', 'hook', 'quote', 'creative'] as const;

export default function StylePresets({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {PRESET_CATEGORIES.map(cat => {
        const presets = TEXT_STYLE_PRESETS.filter(p => p.category === cat);
        if (!presets.length) return null;
        return (
          <div key={cat}>
            <p className="text-[9px] text-gray-600 mb-0.5 uppercase tracking-wide">
              {PRESET_CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-wrap gap-1">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => onChange(value === p.id ? null : p.id)}
                  style={{
                    fontFamily: `"${p.fontFamily}", sans-serif`,
                    fontWeight: p.fontWeight,
                    textTransform: p.textTransform === 'uppercase' ? 'uppercase' : undefined,
                    color: p.color,
                    backgroundColor: p.backgroundColor ?? 'rgba(20,20,20,0.9)',
                    letterSpacing: p.letterSpacing ? `${p.letterSpacing}em` : undefined,
                    border: value === p.id
                      ? '1.5px solid #7FA882'
                      : '1px solid rgba(255,255,255,0.12)',
                  }}
                  className="px-2 py-1 rounded text-[11px] transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
