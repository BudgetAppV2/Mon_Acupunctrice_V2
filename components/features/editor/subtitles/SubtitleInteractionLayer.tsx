'use client';
// Konva ne supporte pas SSR — toujours importer via dynamic(() => ..., { ssr: false })

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Rect | null>>({});

  const visibleSegs = subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime,
  );

  // Attacher le Transformer au Rect sélectionné
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId]);

  // Désélectionner si le segment disparaît (fin du segment)
  useEffect(() => {
    if (selectedId && !visibleSegs.find(s => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visibleSegs, selectedId]);

  return (
    <Stage
      width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'auto' }}
      onClick={(e) => {
        // Toujours stopper la propagation DOM — le Stage gère entièrement les events du preview
        (e.evt as Event).stopPropagation();
        // Tap sur le fond vide → toggle play/pause et désélectionner
        if (e.target === e.target.getStage()) {
          setSelectedId(null);
          togglePlayPause();
        }
      }}
      onTap={(e) => {
        (e.evt as Event).stopPropagation();
        if (e.target === e.target.getStage()) {
          setSelectedId(null);
          togglePlayPause();
        }
      }}
    >
      <Layer>
        {/* Bounding box par segment visible — pas de ghost handle quand aucun segment */}
        {visibleSegs.map(seg => {
          const ov = subtitleOverrides[seg.id] ?? {};
          const pos = ov.position ?? subtitlePosition;
          const { x: cx, y: cy } = positionToCoords(pos, width, height);
          const isSelected = seg.id === selectedId;

          // Dimensions estimées du bloc de sous-titre en fonction de la taille de police
          const fontSize = (ov.fontSize ?? 0.045) * height;
          const rectW = width * 0.82;
          const rectH = fontSize * 3;

          return (
            <Rect
              key={seg.id}
              ref={(node) => { nodeRefs.current[seg.id] = node; }}
              x={cx - rectW / 2}
              y={cy - rectH / 2}
              width={rectW}
              height={rectH}
              stroke={isSelected ? '#7FA882' : 'rgba(255,255,255,0.35)'}
              strokeWidth={isSelected ? 2 : 1}
              dash={isSelected ? undefined : [5, 5]}
              fill="transparent"
              // Draggable uniquement si sélectionné — évite le drag accidentel
              draggable={isSelected}
              onClick={(e) => {
                (e.evt as Event).stopPropagation();
                setSelectedId(seg.id);
              }}
              onTap={(e) => {
                (e.evt as Event).stopPropagation();
                setSelectedId(seg.id);
              }}
              onDragEnd={(e) => {
                const node = e.target as Konva.Rect;
                // Calculer la position depuis le centre du Rect
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

        {/* Transformer avec poignées aux coins pour resize → change fontSize */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(_oldBox, newBox) => {
            // Limiter taille min/max du bloc
            if (newBox.width < width * 0.2 || newBox.width > width * 0.98) return _oldBox;
            if (newBox.height < height * 0.03) return _oldBox;
            return newBox;
          }}
          onTransformEnd={() => {
            if (!selectedId) return;
            const node = nodeRefs.current[selectedId];
            if (!node) return;
            // Dériver la nouvelle fontSize depuis le scale appliqué par le Transformer
            const scaleX = node.scaleX();
            const ov = subtitleOverrides[selectedId] ?? {};
            const base = ov.fontSize ?? 0.045;
            const newFontSize = Math.max(0.02, Math.min(0.12, base * scaleX));
            // Réinitialiser le scale — la taille est portée par l'override fontSize
            node.scaleX(1);
            node.scaleY(1);
            setSubtitleOverride(selectedId, { fontSize: newFontSize });
          }}
        />
      </Layer>
    </Stage>
  );
}
