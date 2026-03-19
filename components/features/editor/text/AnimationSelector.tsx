'use client';

import { TEXT_ANIMATIONS } from '@/lib/utils/textStyles';

interface Props {
  value: string;
  onChange: (animation: string) => void;
}

export default function AnimationSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-gray-500">Animation</label>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mt-0.5 pb-0.5">
        {TEXT_ANIMATIONS.map(a => (
          <button
            key={a.id}
            onClick={() => onChange(a.id)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition ${
              value === a.id ? 'border-sage bg-sage/20 text-white' : 'border-gray-700 text-gray-400'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
