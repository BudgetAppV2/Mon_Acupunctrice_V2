'use client';

import { useSubtitleStore } from '../lib/store';
import { PRESETS } from '../lib/presets';

export default function PresetGallery() {
  const { globalPreset, setGlobalPreset } = useSubtitleStore();

  return (
    <div className="px-3 py-2 border-b border-white/10">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Presets</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {PRESETS.map((preset) => {
          const isActive = globalPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setGlobalPreset(preset)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap
                ${isActive
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 text-white/50 active:border-white/30 active:text-white/80'
                }
              `}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
