'use client';
// Konva ne supporte pas SSR — toujours importer via dynamic(() => ..., { ssr: false })

import { Stage, Layer, Rect } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { positionToCoords } from '@/lib/editor/subtitleEngine';
import type { SubtitlePosition } from '@/lib/types';

interface Props { width: number; height: number }

/** Inverse de positionToCoords — snap aux 9 zones */
function coordsToPosition(x: number, y: number, w: number, h: number): SubtitlePosition {
  const col = x < w * 0.33 ? 'left' : x < w * 0.67 ? 'center' : 'right';
  const row = y < h * 0.33 ? 'top' : y < h * 0.67 ? 'center' : 'bottom';
  if (row === 'center' && col === 'center') return 'center';
  return `${row}-${col}` as SubtitlePosition;
}

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
        // Tap sur le fond vide → toggle play/pause
        if (e.target === e.target.getStage()) togglePlayPause();
      }}
      onTap={(e) => {
        (e.evt as Event).stopPropagation();
        if (e.target === e.target.getStage()) togglePlayPause();
      }}
    >
      <Layer>
        {/* Bounding box draggable par segment visible — sans Transformer */}
        {visibleSegs.map(seg => {
          const ov = subtitleOverrides[seg.id] ?? {};
          const pos = ov.position ?? subtitlePosition;
          const { x: cx, y: cy } = positionToCoords(pos, width, height);

          // Dimensions estimées en fonction de la taille de police
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
              // Tap sur le sous-titre → toggle play/pause (cohérent avec tap partout)
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
                const newPos = coordsToPosition(centerX, centerY, width, height);
                setSubtitleOverride(seg.id, { position: newPos });
                // Snap visuel vers le centre de la zone
                const snapped = positionToCoords(newPos, width, height);
                node.position({ x: snapped.x - rectW / 2, y: snapped.y - rectH / 2 });
                node.getLayer()?.batchDraw();
              }}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
