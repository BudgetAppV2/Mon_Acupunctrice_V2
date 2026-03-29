/**
 * Style Bold Highlight (inspire de Hormozi)
 * - Texte blanc ultra bold avec outline noir epaisse
 * - 2-3 mots a la fois, centres
 * - Un mot-cle en couleur accent
 * - Scale-pop sur chaque chunk
 */

import type { SubtitleSegmentPro } from '@/lib/types/editor';
import type { SubtitleRenderConfig } from '../subtitleEngine';
import { resolveSegmentCoords } from '../subtitleEngine';

export function renderBoldHighlight(
  ctx: CanvasRenderingContext2D,
  seg: SubtitleSegmentPro,
  enterProgress: number,
  _time: number,
  w: number,
  _h: number,
  config: SubtitleRenderConfig,
) {
  const fontSize = Math.round((seg.fontSize ?? 0.06) * w);
  const font = seg.fontFamily ?? config.fontTitle;
  const weight = config.fontWeight ?? 900;
  const { x, y } = resolveSegmentCoords(seg, w, _h);
  const transform = config.textTransform === 'uppercase';
  const textColor = config.textColor ?? '#ffffff';

  // Scale-pop animation
  const popScale = enterProgress < 1
    ? 0.3 + enterProgress * 0.8 + Math.sin(enterProgress * Math.PI) * 0.1
    : 1;
  ctx.translate(x, y);
  ctx.scale(popScale, popScale);
  ctx.translate(-x, -y);
  ctx.globalAlpha *= enterProgress;

  ctx.font = `${weight} ${fontSize}px "${font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const highlighted = new Set((seg.highlightedWords ?? []).map(hw => hw.wordIndex));
  const highlightColors = new Map((seg.highlightedWords ?? []).map(hw => [hw.wordIndex, hw.color]));
  const rawWords = seg.text.split(' ');
  const words = transform ? rawWords.map(wd => wd.toUpperCase()) : rawWords;

  // Calculer la largeur totale
  const fullText = words.join(' ');
  const totalW = ctx.measureText(fullText).width;
  let curX = x - totalW / 2;

  // Stroke activé par défaut pour boldHighlight, désactivable via config
  const strokeOn = config.strokeEnabled !== undefined ? config.strokeEnabled : true;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const ww = ctx.measureText(word).width;

    if (strokeOn) {
      const lw = config.strokeWidth != null ? config.strokeWidth * (w / 400) : fontSize * 0.12;
      ctx.strokeStyle = config.strokeColor ?? '#000000';
      ctx.lineWidth = lw;
      ctx.strokeText(word, curX + ww / 2, y);
    }

    // Shadow optionnelle (sur le fill)
    if (config.shadowBlur) {
      ctx.shadowBlur = config.shadowBlur * (w / 400);
      ctx.shadowColor = config.shadowColor ?? 'rgba(0,0,0,0.8)';
    }

    // Fill : accent pour highlighted, textColor sinon
    if (highlighted.has(i)) {
      ctx.fillStyle = highlightColors.get(i) ?? config.accentColor;
    } else {
      ctx.fillStyle = textColor;
    }
    ctx.fillText(word, curX + ww / 2, y);
    ctx.shadowBlur = 0;

    curX += ctx.measureText(word + ' ').width;
  }
}
