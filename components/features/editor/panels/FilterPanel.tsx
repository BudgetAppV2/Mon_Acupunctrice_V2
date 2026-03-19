'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';

export default function FilterPanel() {
  const { filter, setFilter, videoUrl } = useEditorStore();
  const [thumb, setThumb] = useState<string | null>(null);

  // Extraire une frame de la vidéo pour les miniatures de filtre
  useEffect(() => {
    if (!videoUrl) return;
    const vid = document.createElement('video');
    vid.src = videoUrl;
    vid.crossOrigin = 'anonymous';
    vid.muted = true;
    vid.currentTime = 1;
    vid.onseeked = () => {
      const c = document.createElement('canvas');
      c.width = 60; c.height = 80;
      c.getContext('2d')!.drawImage(vid, 0, 0, 60, 80);
      setThumb(c.toDataURL('image/jpeg', 0.5));
    };
    vid.load();
  }, [videoUrl]);

  return (
    <div className="px-2 py-3">
      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition ${
              filter === f.id ? 'ring-2 ring-sage bg-gray-800' : 'hover:bg-gray-800/50'
            }`}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={f.label}
                className="w-full aspect-[3/4] rounded object-cover"
                style={f.css !== 'none' ? { filter: f.css } : undefined}
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded bg-gray-700" />
            )}
            <span className="text-[10px] text-gray-300">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
