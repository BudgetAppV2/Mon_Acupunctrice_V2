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

  // Stroke activé par défaut pour boldHighlight, désactivable via config
  const strokeOn = config.strokeEnabled !== undefined ? config.strokeEnabled : true;

  // Grouper les mots en lignes (word wrap)
  const maxWidth = w * 0.8;
  const lineH = fontSize * 1.3;
  const lines: { wordIdx: number; word: string }[][] = [];
  let curLine: { wordIdx: number; word: string }[] = [];
  let curLineW = 0;
  for (let i = 0; i < words.length; i++) {
    const wordW = ctx.measureText(words[i] + ' ').width;
    if (curLine.length > 0 && curLineW + wordW > maxWidth) {
      lines.push(curLine);
      curLine = [{ wordIdx: i, word: words[i] }];
      curLineW = wordW;
    } else {
      curLine.push({ wordIdx: i, word: words[i] });
      curLineW += wordW;
    }
  }
  if (curLine.length > 0) lines.push(curLine);

  const totalH = lines.length * lineH;
  const baseY = y - totalH / 2 + lineH / 2; // centre vertical de la première ligne

  for (let li = 0; li < lines.length; li++) {
    const lineWords = lines[li];
    const lineText = lineWords.map(lw => lw.word).join(' ');
    const lineW2 = ctx.measureText(lineText).width;
    let drawX = x - lineW2 / 2;
    const lineY = baseY + li * lineH;

    for (const { wordIdx, word } of lineWords) {
      const ww = ctx.measureText(word).width;
      const cx = drawX + ww / 2; // centre du mot pour textAlign:'center'

      if (strokeOn) {
        const lw = config.strokeWidth != null ? config.strokeWidth * (w / 400) : fontSize * 0.12;
        ctx.strokeStyle = config.strokeColor ?? '#000000';
        ctx.lineWidth = lw;
        ctx.strokeText(word, cx, lineY);
      }

      if (config.shadowBlur) {
        ctx.shadowBlur = config.shadowBlur * (w / 400);
        ctx.shadowColor = config.shadowColor ?? 'rgba(0,0,0,0.8)';
      }

      ctx.fillStyle = highlighted.has(wordIdx) ? (highlightColors.get(wordIdx) ?? config.accentColor) : textColor;
      ctx.fillText(word, cx, lineY);
      ctx.shadowBlur = 0;

      drawX += ctx.measureText(word + ' ').width;
    }
  }
}
