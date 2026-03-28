'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { LUT_PRESETS } from '@/lib/data/luts/presets';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function LutPanel() {
  const { activeLutId, setLut, thumbnailUrl } = useEditorStore();

  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Color grading</span>
        {activeLutId && (
          <button onClick={() => setLut(null)} className="flex items-center gap-1 text-[10px] text-gray-500">
            <XMarkIcon className="w-3 h-3" /> Retirer
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LUT_PRESETS.map(lut => {
          const isActive = activeLutId === lut.id;
          return (
            <button
              key={lut.id}
              onClick={() => setLut(isActive ? null : lut.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition ${
                isActive ? 'bg-sage/20 ring-1 ring-sage' : 'bg-gray-800'
              }`}
            >
              {/* Thumbnail teintee */}
              <div className="w-full h-10 rounded overflow-hidden relative">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={lut.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${lut.tint}, #333)` }} />
                )}
                {/* Tint overlay pour simuler le LUT */}
                <div className="absolute inset-0" style={{ backgroundColor: lut.tint, opacity: 0.3, mixBlendMode: 'color' }} />
              </div>
              <span className={`text-[9px] font-medium truncate w-full text-center ${
                isActive ? 'text-sage' : 'text-gray-400'
              }`}>
                {lut.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
