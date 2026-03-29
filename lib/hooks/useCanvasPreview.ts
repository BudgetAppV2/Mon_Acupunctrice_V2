'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';
import { drawTextOverlays } from '@/lib/utils/drawOverlays';
import { drawSubtitles } from '@/lib/utils/drawSubtitles';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
import { buildExportScene } from '@/lib/editor/buildExportScene';
import { renderScene } from '@/lib/editor/sceneRenderer';
import { applyLut } from '@/lib/editor/lutRenderer';
import { getLutData } from '@/lib/data/luts/presets';
import type { SubtitleStyle } from '@/lib/types';

/**
 * Genere une frame Canvas haute qualite quand la video est en pause.
 * Utilise les MEMES fonctions de rendu que l'export.
 */
export function useCanvasPreview(
  videoEl: HTMLVideoElement | null,
  containerW: number,
  containerH: number,
) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const generateFrame = () => {
      const s = useEditorStore.getState();
      if (s.isPlaying || !videoEl || videoEl.readyState < 2 || containerW === 0) {
        setFrameUrl(null);
        return;
      }

      if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(containerW * dpr);
      const h = Math.round(containerH * dpr);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';
      if (filterCss !== 'none') ctx.filter = filterCss;

      const { videoWidth: vw, videoHeight: vh } = videoEl;
      if (vw === 0 || vh === 0) return;
      const videoAspect = vw / vh, canvasAspect = w / h;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (videoAspect > canvasAspect) { sw = vh * canvasAspect; sx = (vw - sw) / 2; }
      else { sh = vw / canvasAspect; sy = (vh - sh) / 2; }
      ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, w, h);
      ctx.filter = 'none';

      // LUT color grading
      if (s.activeLutId) {
        const lutData = getLutData(s.activeLutId);
        if (lutData) applyLut(ctx, lutData, s.activeLutId, w, h, s.lutIntensity ?? 1.0);
      }

      // Rendu scene graph (template/overlays animes) ou legacy
      const scene = buildExportScene({
        duration: s.trimEnd - s.trimStart,
        overlays: s.overlays,
        subtitles: s.subtitles,
        templateId: s.activeTemplateId ?? undefined,
        templateConfig: s.activeTemplateId ? {
          title: s.templateTitle, points: s.templatePoints,
          quote: s.templateQuote, cta: s.templateCta, duration: s.trimEnd - s.trimStart,
        } : undefined,
      });
      if (scene) {
        renderScene(ctx, scene, s.currentTime - s.trimStart, w, h);
      } else {
        if (s.overlays.length > 0) drawTextOverlays(ctx, s.overlays, s.currentTime, w, h);
        if (s.subtitles.length > 0) {
          const theme = getTheme(s.activeThemeId);
          const palette = getThemePalette(theme);
          drawSubtitles(ctx, s.subtitles, s.subtitleStyle as SubtitleStyle, s.currentTime, w, h, palette);
        }
      }

      setFrameUrl(canvas.toDataURL('image/jpeg', 0.92));
    };

    const unsub = useEditorStore.subscribe(() => {
      const { isPlaying } = useEditorStore.getState();
      if (isPlaying) { setFrameUrl(null); return; }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(generateFrame, 100);
    });

    // Generate initial frame if paused
    if (!useEditorStore.getState().isPlaying) {
      timerRef.current = setTimeout(generateFrame, 100);
    }

    return () => { unsub(); clearTimeout(timerRef.current); };
  }, [videoEl, containerW, containerH]);

  useEffect(() => {
    return () => { canvasRef.current = null; };
  }, []);

  return frameUrl;
}
