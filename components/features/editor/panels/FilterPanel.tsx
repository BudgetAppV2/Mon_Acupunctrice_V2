'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';

export default function FilterPanel() {
  const { filter, setFilter } = useEditorStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const capturedRef = useRef(false);

  // Capturer une frame de la video deja dans le DOM
  useEffect(() => {
    if (capturedRef.current) return;
    const capture = () => {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;
      try {
        const canvas = document.createElement('canvas');
        // Ratio 9:16
        canvas.width = 90;
        canvas.height = 160;
        canvas.getContext('2d')!.drawImage(video, 0, 0, 90, 160);
        const url = canvas.toDataURL('image/jpeg', 0.8);
        if (url !== 'data:,') {
          setThumbUrl(url);
          capturedRef.current = true;
        }
      } catch {
        // securite cross-origin, on retente plus tard
      }
    };

    // Essayer immediatement + retry toutes les 200ms
    capture();
    const interval = setInterval(capture, 200);
    const timeout = setTimeout(() => clearInterval(interval), 3000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

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
              {thumbUrl ? (
                <img
                  src={thumbUrl}
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
