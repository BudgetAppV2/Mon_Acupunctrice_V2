'use client';

import { TEXT_STYLES, type TextStyleDef } from '@/lib/utils/textStyles';

interface Props {
  value: string;
  onChange: (styleId: string, props: TextStyleDef['props']) => void;
}

export default function StyleSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-gray-500">Style</label>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mt-0.5 pb-0.5">
        {TEXT_STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(s.id, s.props)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition ${
              value === s.id ? 'border-sage bg-sage/20' : 'border-gray-700'
            }`}
            style={{
              color: s.props.fill,
              textShadow: s.props.shadowColor ? `0 0 4px ${s.props.shadowColor}` : undefined,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
