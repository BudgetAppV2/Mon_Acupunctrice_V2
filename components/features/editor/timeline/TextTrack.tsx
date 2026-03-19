'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

interface Props {
  zoomLevel: number;
}

/** Piste texte sur la timeline — blocs bleus représentant la durée de chaque overlay */
export default function TextTrack({ zoomLevel }: Props) {
  const { overlays } = useEditorStore();
  if (overlays.length === 0) return null;

  return (
    <div className="relative h-7 mt-0.5">
      {overlays.map(o => (
        <div
          key={o.id}
          className="absolute top-0 h-full bg-blue-500/70 rounded text-[8px] text-white px-1 truncate flex items-center"
          style={{
            left: `${o.startTime * zoomLevel}px`,
            width: `${Math.max((o.endTime - o.startTime) * zoomLevel, 4)}px`,
          }}
        >
          {o.text}
        </div>
      ))}
    </div>
  );
}
