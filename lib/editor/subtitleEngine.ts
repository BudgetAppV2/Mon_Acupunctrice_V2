/**
 * Subtitle Engine Pro — moteur de sous-titres animes avec 3 familles.
 * Remplace drawSubtitles pour les styles pro.
 */

import type { SubtitleSegmentPro, SubtitleFamily } from '@/lib/types/editor';
import { renderNarratif } from './subtitleStyles/narratif';
import { renderBoldHighlight } from './subtitleStyles/boldHighlight';
import { renderMinimalWellness } from './subtitleStyles/minimalWellness';

export interface SubtitleRenderConfig {
  accentColor: string;  // couleur highlight (pills, mots-cles)
  fontTitle: string;     // font principale
  fontBody: string;      // font secondaire
  // Overrides optionnels depuis un preset — si absent, le renderer utilise ses défauts
  fontWeight?: number;
  textTransform?: 'none' | 'uppercase';
  textColor?: string;         // override couleur texte (défaut #FFFFFF)
  strokeEnabled?: boolean;    // forcer activation/désactivation du stroke
  strokeWidth?: number;       // largeur en px à référence canvas 400px
  strokeColor?: string;
  shadowBlur?: number;        // blur en px à référence canvas 400px
  shadowColor?: string;
  backgroundColor?: string;   // couleur de fond (pill derrière texte)
}

const DEFAULT_CONFIG: SubtitleRenderConfig = {
  accentColor: '#E91E8C', // magenta style Elodie
  fontTitle: 'Inter',
  fontBody: 'Inter',
};

/**
 * Dessine les sous-titres pro a l'instant t sur le canvas.
 * Utilise la famille pour choisir le renderer.
 */
export function renderSubtitlesPro(
  ctx: CanvasRenderingContext2D,
  segments: SubtitleSegmentPro[],
  family: SubtitleFamily,
  time: number,
  w: number,
  h: number,
  config?: Partial<SubtitleRenderConfig>,
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Trouver le segment actif
  const seg = segments.find(s => time >= s.startTime && time <= s.endTime);
  if (!seg) return;

  // Calculer le progress d'animation d'entree (0-1)
  const animDur = 0.25;
  const elapsed = time - seg.startTime;
  const remaining = seg.endTime - time;
  const enterProgress = Math.min(1, elapsed / animDur);
  const exitProgress = remaining < 0.15 ? remaining / 0.15 : 1;

  ctx.save();
  ctx.globalAlpha = exitProgress;

  switch (family) {
    case 'narratif':
      renderNarratif(ctx, seg, enterProgress, w, h, cfg);
      break;
    case 'boldHighlight':
      renderBoldHighlight(ctx, seg, enterProgress, time, w, h, cfg);
      break;
    case 'minimalWellness':
      renderMinimalWellness(ctx, seg, enterProgress, time, w, h, cfg);
      break;
  }

  ctx.restore();
}

/** Convertit une SubtitlePosition en coordonnees ratio (x, y) */
export function positionToCoords(pos: SubtitleSegmentPro['position'], w: number, h: number): { x: number; y: number } {
  const margin = 0.06;
  const positions: Record<string, { x: number; y: number }> = {
    'top-left': { x: margin, y: 0.12 },
    'top-center': { x: 0.5, y: 0.12 },
    'top-right': { x: 1 - margin, y: 0.12 },
    'center-left': { x: margin, y: 0.45 },
    'center': { x: 0.5, y: 0.45 },
    'center-right': { x: 1 - margin, y: 0.45 },
    'bottom-left': { x: margin, y: 0.78 },
    'bottom-center': { x: 0.5, y: 0.78 },
    'bottom-right': { x: 1 - margin, y: 0.78 },
  };
  const p = positions[pos] ?? positions['bottom-center'];
  return { x: p.x * w, y: p.y * h };
}
