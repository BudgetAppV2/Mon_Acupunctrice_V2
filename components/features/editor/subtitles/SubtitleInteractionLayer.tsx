'use client';
// Konva ne supporte pas SSR — toujours importer via dynamic(() => ..., { ssr: false })

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle, Transformer } from 'react-konva';
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
    currentTime, setSubtitleOverride, setSubtitlePosition,
  } = useEditorStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Circle | null>>({});

  const visibleSegs = subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime,
  );

  // Attacher le Transformer au handle sélectionné
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

  // Coordonnées du handle fantôme (position globale par défaut)
  const ghostCoords = positionToCoords(subtitlePosition, width, height);

  return (
    <Stage
      width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'auto' }}
    >
      <Layer>
        {visibleSegs.length > 0 ? (
          // Handles pour les segments actifs au temps courant
          visibleSegs.map(seg => {
            const ov = subtitleOverrides[seg.id] ?? {};
            const pos = ov.position ?? subtitlePosition;
            const { x, y } = positionToCoords(pos, width, height);
            const isSelected = seg.id === selectedId;

            return (
              <Circle
                key={seg.id}
                ref={(node) => { nodeRefs.current[seg.id] = node; }}
                x={x} y={y} radius={22}
                fill={isSelected ? '#5C7A5F' : 'rgba(92,122,95,0.8)'}
                stroke={isSelected ? '#3d5240' : '#ffffff'}
                strokeWidth={2.5}
                draggable
                onClick={() => setSelectedId(seg.id)}
                onTap={() => setSelectedId(seg.id)}
                onDragEnd={(e) => {
                  const node = e.target as Konva.Circle;
                  const newPos = coordsToPosition(node.x(), node.y(), width, height);
                  setSubtitleOverride(seg.id, { position: newPos });
                  // Snap visuel vers le centre de la zone
                  const snapped = positionToCoords(newPos, width, height);
                  node.position(snapped);
                  node.getLayer()?.batchDraw();
                }}
              />
            );
          })
        ) : (
          // Handle fantôme — aucun segment actif, montre la position globale
          // Glisser ce handle change subtitlePosition pour tous les segments
          <Circle
            x={ghostCoords.x}
            y={ghostCoords.y}
            radius={22}
            fill="rgba(92,122,95,0.5)"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth={2}
            draggable
            onDragEnd={(e) => {
              const node = e.target as Konva.Circle;
              const newPos = coordsToPosition(node.x(), node.y(), width, height);
              setSubtitlePosition(newPos);
              const snapped = positionToCoords(newPos, width, height);
              node.position(snapped);
              node.getLayer()?.batchDraw();
            }}
          />
        )}
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(_oldBox, newBox) => {
            // Limiter taille min/max du handle
            if (newBox.width < 20 || newBox.height < 20) return _oldBox;
            if (newBox.width > 120 || newBox.height > 120) return _oldBox;
            return newBox;
          }}
          onTransformEnd={() => {
            if (!selectedId) return;
            const node = nodeRefs.current[selectedId];
            if (!node) return;
            const scaleX = node.scaleX();
            const ov = subtitleOverrides[selectedId] ?? {};
            const base = ov.fontSize ?? 0.045;
            const newSize = Math.max(0.025, Math.min(0.09, base * scaleX));
            setSubtitleOverride(selectedId, { fontSize: newSize });
            // Réinitialiser le scale (la taille est stockée dans l'override)
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      </Layer>
    </Stage>
  );
}
