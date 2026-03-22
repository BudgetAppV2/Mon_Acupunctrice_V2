'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

interface Props {
  zoomLevel: number;
}

/** Piste texte sur la timeline — blocs tappables avec selection */
export default function TextTrack({ zoomLevel }: Props) {
  const { overlays, selectedOverlayId, selectOverlay } = useEditorStore();
  if (overlays.length === 0) return null;

  return (
    <div className="relative h-7 mt-0.5">
      {overlays.map(o => {
        const isSelected = o.id === selectedOverlayId;
        return (
          <button
            key={o.id}
            onClick={(e) => { e.stopPropagation(); selectOverlay(o.id); }}
            className={`absolute top-0 h-full rounded text-[8px] text-white px-1 truncate flex items-center ${
              isSelected ? 'bg-sage ring-1 ring-white' : 'bg-sage/50'
            }`}
            style={{
              left: `${o.startTime * zoomLevel}px`,
              width: `${Math.max((o.endTime - o.startTime) * zoomLevel, 20)}px`,
            }}
          >
            {o.text || '...'}
          </button>
        );
      })}
    </div>
  );
}
