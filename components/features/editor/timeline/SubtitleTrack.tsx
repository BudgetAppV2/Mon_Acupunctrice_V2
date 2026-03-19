'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

interface Props { zoomLevel: number }

/** Piste sous-titres sur la timeline (blocs jaune/ambre) */
export default function SubtitleTrack({ zoomLevel }: Props) {
  const { subtitles } = useEditorStore();
  if (subtitles.length === 0) return null;

  return (
    <div className="relative h-5 mt-0.5">
      {subtitles.map(s => (
        <div
          key={s.id}
          className="absolute top-0 h-full bg-amber-500/70 rounded text-[7px] text-white px-0.5 truncate flex items-center"
          style={{
            left: `${s.startTime * zoomLevel}px`,
            width: `${Math.max((s.endTime - s.startTime) * zoomLevel, 3)}px`,
          }}
        />
      ))}
    </div>
  );
}
