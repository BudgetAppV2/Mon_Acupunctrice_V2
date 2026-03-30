'use client';

import { useSubtitleStore } from '../lib/store';
import { PRESETS } from '../lib/presets';

export default function PresetGallery() {
  const { globalPreset, setGlobalPreset } = useSubtitleStore();

  return (
    <div className="p-4 border-b border-white/10">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Presets</p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => {
          const isActive = globalPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setGlobalPreset(preset)}
              className={`
                text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all
                ${isActive
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/90'
                }
              `}
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-[10px] opacity-60 mt-0.5 font-normal">{preset.animation.type}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
