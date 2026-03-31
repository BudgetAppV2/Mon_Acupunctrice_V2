'use client';

import { useSubtitleStore, getActiveVideoClip } from '../lib/store';
import { FILTERS } from '../lib/filters';

export default function FilterPanel() {
  const { filterId, setFilter, setClipFilter, thumbnailUrl, tracks, currentTime, selectedItemId, filterIntensity, setFilterIntensity } = useSubtitleStore();

  const handleFilterSelect = (id: string) => {
    // A8: If a clip is selected, apply filter to that clip
    if (selectedItemId) {
      setClipFilter(selectedItemId, id);
    }
    setFilter(id);
  };

  // Show active clip's filter if available
  const activeClip = getActiveVideoClip(tracks, currentTime);
  const activeFilterId = activeClip?.filterId ?? filterId;

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Filtres</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => {
          const isActive = activeFilterId === f.id;
          return (
            <button key={f.id} onClick={() => handleFilterSelect(f.id)}
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
      {activeFilterId !== 'normal' && (
        <div className="mt-2">
          <label className="text-[10px] text-white/40">Intensite : {Math.round(filterIntensity * 100)}%</label>
          <input type="range" min={0} max={1} step={0.05} value={filterIntensity}
            onChange={e => setFilterIntensity(+e.target.value)} className="w-full accent-emerald-400" />
        </div>
      )}
    </div>
  );
}
