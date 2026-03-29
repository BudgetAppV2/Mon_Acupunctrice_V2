'use client';
// Konva ne supporte pas SSR — toujours importer via dynamic(() => ..., { ssr: false })

import { Stage, Layer, Rect } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { positionToCoords } from '@/lib/editor/subtitleEngine';

interface Props { width: number; height: number }

export default function SubtitleInteractionLayer({ width, height }: Props) {
  const {
    subtitles, subtitlePosition, subtitleOverrides,
    currentTime, setSubtitleOverride, togglePlayPause,
  } = useEditorStore();

  const visibleSegs = subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime,
  );

  return (
    <Stage
      width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'auto' }}
      onClick={(e) => {
        (e.evt as Event).stopPropagation();
        if (e.target === e.target.getStage()) togglePlayPause();
      }}
      onTap={(e) => {
        (e.evt as Event).stopPropagation();
        if (e.target === e.target.getStage()) togglePlayPause();
      }}
    >
      <Layer>
        {/* Bounding box draggable libre par segment visible */}
        {visibleSegs.map(seg => {
          const ov = subtitleOverrides[seg.id] ?? {};
          // Position libre si dispo, sinon fallback sur enum
          const fallback = positionToCoords(ov.position ?? subtitlePosition, width, height);
          const cx = ov.positionX !== undefined ? ov.positionX * width : fallback.x;
          const cy = ov.positionY !== undefined ? ov.positionY * height : fallback.y;

          const fontSize = (ov.fontSize ?? 0.045) * height;
          const rectW = width * 0.82;
          const rectH = fontSize * 3;

          return (
            <Rect
              key={seg.id}
              x={cx - rectW / 2}
              y={cy - rectH / 2}
              width={rectW}
              height={rectH}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              dash={[4, 6]}
              fill="transparent"
              draggable
              onClick={(e) => {
                (e.evt as Event).stopPropagation();
                togglePlayPause();
              }}
              onTap={(e) => {
                (e.evt as Event).stopPropagation();
                togglePlayPause();
              }}
              onDragEnd={(e) => {
                const node = e.target as Konva.Rect;
                const centerX = node.x() + rectW / 2;
                const centerY = node.y() + rectH / 2;
                // Stocker la position en coordonnées relatives (0-1), drag libre sans snap
                setSubtitleOverride(seg.id, {
                  positionX: Math.max(0, Math.min(1, centerX / width)),
                  positionY: Math.max(0, Math.min(1, centerY / height)),
                });
              }}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
