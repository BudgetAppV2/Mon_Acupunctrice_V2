/**
 * Style Minimal Bien-etre
 * - Texte serif ou sans-serif elegant, blanc, pas d'outline
 * - Karaoke doux : mot actif change de couleur subtilement
 * - Position fixe bottom-center
 * - Pill semi-transparent optionnelle derriere la ligne
 */

import type { SubtitleSegmentPro } from '@/lib/types/editor';
import type { SubtitleRenderConfig } from '../subtitleEngine';
import { resolveSegmentCoords } from '../subtitleEngine';

export function renderMinimalWellness(
  ctx: CanvasRenderingContext2D,
  seg: SubtitleSegmentPro,
  enterProgress: number,
  time: number,
  w: number,
  h: number,
  config: SubtitleRenderConfig,
) {
  const fontSize = Math.round((seg.fontSize ?? 0.038) * w);
  const font = seg.fontFamily ?? config.fontBody;
  const weight = config.fontWeight ?? 600;
  const { x, y } = resolveSegmentCoords(seg, w, h);
  const transform = config.textTransform === 'uppercase';
  const textColor = config.textColor ?? 'rgba(255, 255, 255, 0.95)';

  // Fade douce
  ctx.globalAlpha *= enterProgress;

  ctx.font = `${weight} ${fontSize}px "${font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineH = fontSize * 1.35;
  const maxWidth = w * 0.85;
  const rawText = transform ? seg.text.toUpperCase() : seg.text;
  const lines = wrapLines(ctx, rawText, maxWidth);
  const totalH = lines.length * lineH;
  const startY = y - totalH / 2;

  // Pill semi-transparent derriere le texte
  if (seg.displayType !== 'karaoke') {
    const longestW = Math.max(...lines.map(l => ctx.measureText(l).width));
    const pad = fontSize * 0.4;
    const bgColor = config.backgroundColor ?? 'rgba(0, 0, 0, 0.35)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x - longestW / 2 - pad, startY - pad * 0.5, longestW + pad * 2, totalH + pad, fontSize * 0.25);
    ctx.fill();
  }

  // Shadow optionnelle
  if (config.shadowBlur) {
    ctx.shadowBlur = config.shadowBlur * (w / 400);
    ctx.shadowColor = config.shadowColor ?? 'rgba(0,0,0,0.8)';
  }

  // Rendu karaoke doux ou texte simple
  if (seg.displayType === 'karaoke' && seg.words.length > 0) {
    // Karaoke doux : mot actif en accent, reste en blanc
    const fullText = seg.words.map(ww => ww.word).join(' ');
    const totalW = ctx.measureText(fullText).width;
    let curX = x - totalW / 2;
    ctx.textAlign = 'left';
    for (const ww of seg.words) {
      const isCurrent = time >= ww.start && time <= ww.end;
      ctx.fillStyle = isCurrent ? config.accentColor : textColor;
      ctx.fillText(ww.word, curX, y);
      curX += ctx.measureText(ww.word + ' ').width;
    }
  } else {
    ctx.fillStyle = textColor;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, startY + i * lineH + lineH / 2);
    }
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else { line = test; }
  }
  lines.push(line);
  return lines;
}
