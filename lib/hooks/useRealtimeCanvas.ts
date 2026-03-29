'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';
import { drawTextOverlays } from '@/lib/utils/drawOverlays';
import { drawSubtitles } from '@/lib/utils/drawSubtitles';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
import { buildExportScene } from '@/lib/editor/buildExportScene';
import { renderScene } from '@/lib/editor/sceneRenderer';
import { applyLut } from '@/lib/editor/lutRenderer';
import { applyCanvasFilter } from '@/lib/editor/filterRenderer';
import { getLutData } from '@/lib/data/luts/presets';
import { renderSubtitlesPro } from '@/lib/editor/subtitleEngine';
import { toProSegments } from '@/lib/utils/subtitleProAdapter';
import { TEXT_STYLE_PRESETS } from '@/lib/data/fontPack';
import type { SceneGraph } from '@/lib/editor/sceneGraph';
import type { SubtitleStyle } from '@/lib/types';

/**
 * Canvas temps reel qui dessine la video + tous les effets a chaque frame.
 * Utilise requestVideoFrameCallback (sync video framerate) avec fallback rAF.
 * Le canvas EST le preview — le <video> est cache visuellement.
 */
export function useRealtimeCanvas(
  videoEl: HTMLVideoElement | null,
  canvasEl: HTMLCanvasElement | null,
) {
  const sceneRef = useRef<SceneGraph | null>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  // Rebuild scene quand le store change (pas a chaque frame)
  useEffect(() => {
    const rebuild = () => {
      const s = useEditorStore.getState();
      sceneRef.current = buildExportScene({
        duration: s.trimEnd - s.trimStart,
        overlays: s.overlays, subtitles: s.subtitles,
        templateId: s.activeTemplateId ?? undefined,
        templateConfig: s.activeTemplateId ? {
          title: s.templateTitle, points: s.templatePoints,
          quote: s.templateQuote, cta: s.templateCta, duration: s.trimEnd - s.trimStart,
        } : undefined,
      });
    };
    rebuild();
    return useEditorStore.subscribe(rebuild);
  }, []);

  const drawFrame = useCallback(() => {
    if (!videoEl || !canvasEl || videoEl.readyState < 2) return;
    const s = useEditorStore.getState();
    const w = canvasEl.width;
    const h = canvasEl.height;
    if (w === 0 || h === 0) return;

    const ctx = canvasEl.getContext('2d', { alpha: false });
    if (!ctx) return;

    // 1. Dessiner la video (cover fit, coords arrondis pour perf)
    const { videoWidth: vw, videoHeight: vh } = videoEl;
    if (vw === 0 || vh === 0) return;
    const videoAspect = vw / vh, canvasAspect = w / h;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > canvasAspect) { sw = vh * canvasAspect; sx = Math.round((vw - sw) / 2); }
    else { sh = vw / canvasAspect; sy = Math.round((vh - sh) / 2); }
    ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, w, h);

    // 2. Filtre CSS — via WebGL (ctx.filter non supporté Safari iOS < 18)
    if (s.filter !== 'normal') {
      const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';
      if (filterCss !== 'none') applyCanvasFilter(ctx, filterCss, w, h);
    }

    // 3. LUT color grading
    if (s.activeLutId) {
      const lutData = getLutData(s.activeLutId);
      if (lutData) applyLut(ctx, lutData, s.activeLutId, w, h, s.lutIntensity ?? 1.0);
    }

    // 4. Scene graph (overlays animes + effets) ou legacy overlays
    const time = s.currentTime;
    const scene = sceneRef.current;
    if (scene) {
      renderScene(ctx, scene, time - s.trimStart, w, h);
    } else {
      if (s.overlays.length > 0) drawTextOverlays(ctx, s.overlays, time, w, h);
      // Sous-titres V1 uniquement si pas de famille Pro active
      if (s.subtitles.length > 0 && !s.subtitleFamily) {
        const theme = getTheme(s.activeThemeId);
        const palette = getThemePalette(theme);
        drawSubtitles(ctx, s.subtitles, s.subtitleStyle as SubtitleStyle, time, w, h, palette);
      }
    }

    // 5. Sous-titres Pro — rendu par-dessus la scene si famille selectionnee
    if (s.subtitleFamily && s.subtitles.length > 0) {
      const proSegs = toProSegments(s.subtitles, s.subtitlePosition, s.subtitleAnimation, 'narration', s.subtitleOverrides);
      const preset = s.subtitlePresetId ? TEXT_STYLE_PRESETS.find(p => p.id === s.subtitlePresetId) : null;
      renderSubtitlesPro(ctx, proSegs, s.subtitleFamily, time, w, h, {
        accentColor: s.subtitleAccentColor,
        fontTitle: s.subtitleFontFamily,
        fontBody: s.subtitleFontFamily,
        ...(preset ? {
          fontWeight: preset.fontWeight,
          textTransform: preset.textTransform,
          textColor: preset.color,
          strokeEnabled: !!preset.strokeWidth,
          strokeWidth: preset.strokeWidth,
          strokeColor: preset.strokeColor,
          shadowBlur: preset.shadowBlur,
          shadowColor: preset.shadowColor,
          backgroundColor: preset.backgroundColor,
        } : {}),
      });
    }
  }, [videoEl, canvasEl]);

  // Boucle de rendu — requestVideoFrameCallback si dispo, sinon rAF
  useEffect(() => {
    if (!videoEl || !canvasEl) return;
    activeRef.current = true;

    const hasRVFC = 'requestVideoFrameCallback' in videoEl;

    const loop = () => {
      if (!activeRef.current) return;
      drawFrame();
      if (hasRVFC) {
        (videoEl as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
          .requestVideoFrameCallback(loop);
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    // Lancer la boucle
    if (hasRVFC) {
      (videoEl as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
        .requestVideoFrameCallback(loop);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    // Redessiner aussi quand le store change (pour les changements en pause)
    const unsub = useEditorStore.subscribe(() => {
      if (!useEditorStore.getState().isPlaying) drawFrame();
    });

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      unsub();
    };
  }, [videoEl, canvasEl, drawFrame]);
}
