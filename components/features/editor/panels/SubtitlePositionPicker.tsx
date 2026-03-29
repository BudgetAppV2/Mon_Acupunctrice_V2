'use client';

// Raccourcis rapides — 9 presets qui définissent des coordonnées relatives (0-1).
// Le drag Konva (SubtitleInteractionLayer) est le mode de positionnement principal.

interface Preset { label: string; x: number; y: number }

const PRESETS: Preset[] = [
  { label: '↖', x: 0.1,  y: 0.12 },
  { label: '↑', x: 0.5,  y: 0.12 },
  { label: '↗', x: 0.9,  y: 0.12 },
  { label: '←', x: 0.1,  y: 0.45 },
  { label: '·', x: 0.5,  y: 0.45 },
  { label: '→', x: 0.9,  y: 0.45 },
  { label: '↙', x: 0.1,  y: 0.78 },
  { label: '↓', x: 0.5,  y: 0.78 },
  { label: '↘', x: 0.9,  y: 0.78 },
];

interface Props {
  onChange: (x: number, y: number) => void;
}

export default function SubtitlePositionPicker({ onChange }: Props) {
  return (
    <div className="inline-grid grid-cols-3 gap-0.5">
      {PRESETS.map((p, i) => (
        <button
          key={i}
          onClick={() => onChange(p.x, p.y)}
          className="w-7 h-6 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
