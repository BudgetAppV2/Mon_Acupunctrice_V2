'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';

export default function FilterPanel() {
  const { filter, setFilter, thumbnailUrl } = useEditorStore();

  return (
    <div className="px-3 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex flex-col items-center gap-1 shrink-0 transition ${
              filter === f.id ? 'opacity-100' : 'opacity-70 hover:opacity-90'
            }`}
          >
            {/* Miniature 44×60px */}
            <div className={`w-11 h-[60px] rounded-lg overflow-hidden ${
              filter === f.id ? 'ring-2 ring-sage' : ''
            }`}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={f.label}
                  className="w-full h-full object-cover"
                  style={f.css !== 'none' ? { filter: f.css } : undefined}
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(to bottom, #4a90d9, #f5a623)',
                    ...(f.css !== 'none' ? { filter: f.css } : {}),
                  }}
                />
              )}
            </div>
            <span className={`text-[9px] font-medium w-11 text-center truncate ${
              filter === f.id ? 'text-sage' : 'text-gray-400'
            }`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
