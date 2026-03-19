'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function TrimPanel() {
  const { duration, trimStart, trimEnd, setTrim, seekTo } = useEditorStore();

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val < trimEnd) {
      setTrim(val, trimEnd);
      seekTo(val);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val > trimStart) {
      setTrim(trimStart, val);
      seekTo(val);
    }
  };

  const trimDuration = trimEnd - trimStart;

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Durée : {formatTime(trimDuration)}</span>
        <span>{formatTime(trimStart)} → {formatTime(trimEnd)}</span>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Début</label>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimStart}
          onChange={handleStartChange}
          className="w-full accent-sage"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Fin</label>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimEnd}
          onChange={handleEndChange}
          className="w-full accent-sage"
        />
      </div>
    </div>
  );
}
