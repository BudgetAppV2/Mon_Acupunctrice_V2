'use client';
// Konva ne supporte pas SSR — toujours importer via dynamic(() => ..., { ssr: false })

import { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { positionToCoords } from '@/lib/editor/subtitleEngine';

interface Props { width: number; height: number }

export default function SubtitleInteractionLayer({ width, height }: Props) {
  const {
    subtitles, subtitlePosition, subtitleOverrides,
    currentTime, selectedSubtitleId,
    setSubtitleOverride, selectSubtitle, togglePlayPause,
  } = useEditorStore();

  // Refs Konva
  const selectedRectRef = useRef<Konva.Rect | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Empêche le play/pause immédiatement après un drag ou un resize
  const justGestured = useRef(false);
  const gestureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markGestured = () => {
    justGestured.current = true;
    if (gestureTimer.current) clearTimeout(gestureTimer.current);
    gestureTimer.current = setTimeout(() => { justGestured.current = false; }, 200);
  };

  // Synchroniser le Transformer avec le Rect sélectionné
  useEffect(() => {
    if (!transformerRef.current) return;
    if (!selectedSubtitleId) {
      selectedRectRef.current = null;
      transformerRef.current.nodes([]);
    } else if (selectedRectRef.current) {
      transformerRef.current.nodes([selectedRectRef.current]);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedSubtitleId]);

  const visibleSegs = subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime,
  );

  return (
    <Stage
      width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'auto' }}
      onClick={(e) => {
        (e.evt as Event).stopPropagation();
        if (justGestured.current) return;
        if (e.target === e.target.getStage()) {
          selectSubtitle(null);
          togglePlayPause();
        }
      }}
      onTap={(e) => {
        (e.evt as Event).stopPropagation();
        if (justGestured.current) return;
        if (e.target === e.target.getStage()) {
          selectSubtitle(null);
          togglePlayPause();
        }
      }}
    >
      <Layer>
        {visibleSegs.map(seg => {
          const isSelected = selectedSubtitleId === seg.id;
          const ov = subtitleOverrides[seg.id] ?? {};
          const fallback = positionToCoords(ov.position ?? subtitlePosition, width, height);
          const cx = ov.positionX !== undefined ? ov.positionX * width : fallback.x;
          const cy = ov.positionY !== undefined ? ov.positionY * height : fallback.y;

          const fontSize = (ov.fontSize ?? 0.045) * height;
          const rectW = width * 0.82;
          const rectH = fontSize * 3;

          return (
            <Rect
              key={seg.id}
              ref={isSelected ? (node) => { selectedRectRef.current = node; } : undefined}
              x={cx - rectW / 2}
              y={cy - rectH / 2}
              width={rectW}
              height={rectH}
              stroke={isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isSelected ? 1.5 : 1}
              dash={[4, 6]}
              fill="transparent"
              draggable
              onClick={(e) => {
                e.cancelBubble = true;
                if (!justGestured.current) selectSubtitle(seg.id);
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                if (!justGestured.current) selectSubtitle(seg.id);
              }}
              onDragStart={(e) => {
                // Cacher le bord pendant le drag — seul le texte canvas doit bouger
                (e.target as Konva.Rect).stroke('transparent');
                e.target.getLayer()?.batchDraw();
              }}
              onDragMove={(e) => {
                // Mise à jour temps réel du canvas pendant le drag — sans markEditorTouched
                const node = e.target as Konva.Rect;
                const centerX = node.x() + rectW / 2;
                const centerY = node.y() + rectH / 2;
                useEditorStore.setState((state) => ({
                  subtitleOverrides: {
                    ...state.subtitleOverrides,
                    [seg.id]: {
                      ...state.subtitleOverrides[seg.id],
                      positionX: Math.max(0, Math.min(1, centerX / width)),
                      positionY: Math.max(0, Math.min(1, centerY / height)),
                    },
                  },
                }));
              }}
              onDragEnd={(e) => {
                markGestured();
                const node = e.target as Konva.Rect;
                const centerX = node.x() + rectW / 2;
                const centerY = node.y() + rectH / 2;
                // Rétablir le bord après drag
                node.stroke(isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)');
                // Commit final avec markEditorTouched (déclenche la persistance)
                setSubtitleOverride(seg.id, {
                  positionX: Math.max(0, Math.min(1, centerX / width)),
                  positionY: Math.max(0, Math.min(1, centerY / height)),
                });
              }}
              onTransformEnd={(e) => {
                markGestured();
                const node = e.target as Konva.Rect;
                const scaleX = node.scaleX();
                const currentFontSize = ov.fontSize ?? 0.045;
                const newFontSize = Math.max(0.02, Math.min(0.25, currentFontSize * scaleX));
                node.scaleX(1);
                node.scaleY(1);
                const centerX = node.x() + rectW / 2;
                const centerY = node.y() + rectH / 2;
                setSubtitleOverride(seg.id, {
                  fontSize: newFontSize,
                  positionX: Math.max(0, Math.min(1, centerX / width)),
                  positionY: Math.max(0, Math.min(1, centerY / height)),
                });
              }}
            />
          );
        })}

        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={['bottom-right']}
          anchorSize={44}
          anchorCornerRadius={4}
          anchorFill="white"
          anchorStroke="rgba(0,0,0,0.3)"
          borderStroke="rgba(255,255,255,0.5)"
          borderDash={[4, 4]}
          keepRatio
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 60) return oldBox;
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}
