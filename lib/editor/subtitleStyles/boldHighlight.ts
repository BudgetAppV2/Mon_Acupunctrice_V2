/**
 * Style Bold Highlight (inspire de Hormozi)
 * - Texte blanc ultra bold avec outline noir epaisse
 * - 2-3 mots a la fois, centres
 * - Un mot-cle en couleur accent
 * - Scale-pop sur chaque chunk
 */

import type { SubtitleSegmentPro } from '@/lib/types/editor';
import type { SubtitleRenderConfig } from '../subtitleEngine';
import { positionToCoords } from '../subtitleEngine';

export function renderBoldHighlight(
  ctx: CanvasRenderingContext2D,
  seg: SubtitleSegmentPro,
  enterProgress: number,
  time: number,
  w: number,
  h: number,
  config: SubtitleRenderConfig,
) {
  const fontSize = Math.round((seg.fontSize ?? 0.06) * w);
  const font = seg.fontFamily ?? config.fontTitle;
  const { x, y } = positionToCoords(seg.position || 'center', w, h);

  // Scale-pop animation
  const popScale = enterProgress < 1
    ? 0.3 + enterProgress * 0.8 + Math.sin(enterProgress * Math.PI) * 0.1
    : 1;
  ctx.translate(x, y);
  ctx.scale(popScale, popScale);
  ctx.translate(-x, -y);
  ctx.globalAlpha *= enterProgress;

  ctx.font = `900 ${fontSize}px "${font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const highlighted = new Set((seg.highlightedWords ?? []).map(hw => hw.wordIndex));
  const highlightColors = new Map((seg.highlightedWords ?? []).map(hw => [hw.wordIndex, hw.color]));
  const words = seg.text.split(' ');

  // Calculer la largeur totale
  const fullText = words.join(' ');
  const totalW = ctx.measureText(fullText).width;
  let curX = x - totalW / 2;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const ww = ctx.measureText(word).width;

    // Outline noir epaisse
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.12;
    ctx.strokeText(word, curX + ww / 2, y);

    // Fill : accent pour highlighted, blanc sinon
    if (highlighted.has(i)) {
      ctx.fillStyle = highlightColors.get(i) ?? config.accentColor;
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(word, curX + ww / 2, y);

    curX += ctx.measureText(word + ' ').width;
  }
}
