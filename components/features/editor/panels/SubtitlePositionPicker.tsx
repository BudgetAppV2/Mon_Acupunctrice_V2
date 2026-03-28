'use client';

import type { SubtitlePosition } from '@/lib/types';

const POSITIONS: SubtitlePosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const LABELS: Record<SubtitlePosition, string> = {
  'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
  'center-left': '←', 'center': '·', 'center-right': '→',
  'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
};

interface Props {
  value: SubtitlePosition;
  onChange: (p: SubtitlePosition) => void;
}

// Picker compact — raccourci rapide (le drag Konva est le mode principal)
export default function SubtitlePositionPicker({ value, onChange }: Props) {
  return (
    <div className="inline-grid grid-cols-3 gap-0.5">
      {POSITIONS.map(pos => (
        <button
          key={pos}
          onClick={() => onChange(pos)}
          className={`w-7 h-6 rounded text-xs font-medium transition ${
            value === pos
              ? 'bg-sage text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {LABELS[pos]}
        </button>
      ))}
    </div>
  );
}
