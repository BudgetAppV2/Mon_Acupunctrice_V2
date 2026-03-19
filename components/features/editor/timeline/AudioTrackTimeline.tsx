'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

interface Props { zoomLevel: number }

/** Piste audio sur la timeline (bloc violet) */
export default function AudioTrackTimeline({ zoomLevel }: Props) {
  const { audioUrl, audioName, duration } = useEditorStore();
  if (!audioUrl) return null;

  return (
    <div className="relative h-5 mt-0.5">
      <div
        className="absolute top-0 h-full bg-purple-500/70 rounded text-[7px] text-white px-1 truncate flex items-center"
        style={{ left: 0, width: `${duration * zoomLevel}px` }}
      >
        {audioName || 'Audio'}
      </div>
    </div>
  );
}
