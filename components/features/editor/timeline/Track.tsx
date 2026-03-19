'use client';

interface TrackProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  zoomLevel: number;
}

/** Piste vidéo sur la timeline — vert sage avec zones hors-trim grisées */
export default function Track({ duration, trimStart, trimEnd, zoomLevel }: TrackProps) {
  const totalWidth = duration * zoomLevel;
  const trimStartPx = trimStart * zoomLevel;
  const trimEndPx = trimEnd * zoomLevel;

  return (
    <div className="relative h-10 mt-1" style={{ width: `${totalWidth}px` }}>
      {/* Zone hors trim (début) */}
      {trimStartPx > 0 && (
        <div
          className="absolute top-0 left-0 h-full bg-gray-700/60 rounded-l"
          style={{ width: `${trimStartPx}px` }}
        />
      )}

      {/* Zone active (trim) */}
      <div
        className="absolute top-0 h-full bg-sage/80 rounded"
        style={{ left: `${trimStartPx}px`, width: `${trimEndPx - trimStartPx}px` }}
      />

      {/* Zone hors trim (fin) */}
      {trimEndPx < totalWidth && (
        <div
          className="absolute top-0 h-full bg-gray-700/60 rounded-r"
          style={{ left: `${trimEndPx}px`, width: `${totalWidth - trimEndPx}px` }}
        />
      )}
    </div>
  );
}
