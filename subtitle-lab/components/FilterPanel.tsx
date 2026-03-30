'use client';

import { useSubtitleStore } from '../lib/store';
import { FILTERS } from '../lib/filters';
import { LUT_PRESETS } from '../lib/luts/presets';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function FilterPanel() {
  const { filterId, setFilter, activeLutId, setLut, lutIntensity, setLutIntensity, thumbnailUrl } = useSubtitleStore();

  return (
    <div className="px-3 py-2 space-y-3">
      {/* CSS Filters — horizontal scroll with thumbnails */}
      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Filtres</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => {
            const isActive = filterId === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`flex flex-col items-center gap-1 shrink-0 transition ${isActive ? 'opacity-100' : 'opacity-60 active:opacity-90'}`}>
                <div className={`w-12 h-16 rounded-lg overflow-hidden ${isActive ? 'ring-2 ring-emerald-400' : ''}`}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={f.label} className="w-full h-full object-cover"
                      style={f.css !== 'none' ? { filter: f.css } : undefined} />
                  ) : (
                    <div className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #e8a87c 50%, #16213e 100%)',
                        filter: f.css !== 'none' ? f.css : undefined }} />
                  )}
                </div>
                <span className={`text-[9px] font-medium w-12 text-center truncate ${isActive ? 'text-emerald-400' : 'text-white/40'}`}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LUTs — grid with tint previews */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Color grading</p>
          {activeLutId && (
            <button onClick={() => setLut(null)} className="flex items-center gap-1 text-[10px] text-white/30 active:text-white/60">
              <XMarkIcon className="w-3 h-3" /> Retirer
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LUT_PRESETS.map(lut => {
            const isActive = activeLutId === lut.id;
            return (
              <button key={lut.id} onClick={() => setLut(isActive ? null : lut.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition ${isActive ? 'bg-emerald-500/15 ring-1 ring-emerald-500' : 'bg-white/5'}`}>
                <div className="w-full h-10 rounded overflow-hidden relative">
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${lut.tint}, #222)` }} />
                  <div className="absolute inset-0" style={{ backgroundColor: lut.tint, opacity: 0.3, mixBlendMode: 'color' }} />
                </div>
                <span className={`text-[9px] font-medium truncate w-full text-center ${isActive ? 'text-emerald-400' : 'text-white/40'}`}>
                  {lut.name}
                </span>
              </button>
            );
          })}
        </div>

        {activeLutId && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-[10px] text-white/30 min-w-[50px]">Intensité</label>
            <input type="range" min={0} max={100} value={Math.round(lutIntensity * 100)}
              onChange={(e) => setLutIntensity(Number(e.target.value) / 100)}
              className="flex-1 accent-emerald-400 h-1.5" />
            <span className="text-[10px] text-white/30 min-w-[28px] text-right">{Math.round(lutIntensity * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
