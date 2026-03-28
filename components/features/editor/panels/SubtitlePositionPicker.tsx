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

export default function SubtitlePositionPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {POSITIONS.map(pos => (
        <button
          key={pos}
          onClick={() => onChange(pos)}
          className={`py-1.5 rounded text-sm font-medium transition ${
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
