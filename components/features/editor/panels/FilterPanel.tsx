'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';
import { getTheme, getThemeFilter } from '@/lib/data/videoThemes';

export default function FilterPanel() {
  const { filter, setFilter, thumbnailUrl, activeThemeId } = useEditorStore();
  const themeFilterId = getThemeFilter(getTheme(activeThemeId)).id;

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
            <div className={`w-11 h-[60px] rounded-lg overflow-hidden relative ${
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
              {f.id === themeFilterId && f.id !== 'normal' && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sage" />
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
