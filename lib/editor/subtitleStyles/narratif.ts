/**
 * Style Narratif Contextuel (inspire d'Elodie Da Silva)
 * - Texte blanc bold, grande taille, pas d'outline
 * - Position variable par segment
 * - Mots-cles sur pill coloree
 * - Bulles de citation blanches
 */

import type { SubtitleSegmentPro } from '@/lib/types/editor';
import type { SubtitleRenderConfig } from '../subtitleEngine';
import { positionToCoords } from '../subtitleEngine';

export function renderNarratif(
  ctx: CanvasRenderingContext2D,
  seg: SubtitleSegmentPro,
  enterProgress: number,
  w: number,
  h: number,
  config: SubtitleRenderConfig,
) {
  const fontSize = Math.round((seg.fontSize ?? 0.048) * w);
  const font = seg.fontFamily ?? config.fontTitle;
  const weight = config.fontWeight ?? 700;
  const { x, y } = positionToCoords(seg.position, w, h);
  const maxWidth = w * 0.8;
  const lineH = fontSize * 1.3;
  const transform = config.textTransform === 'uppercase';
  const textColor = config.textColor ?? '#ffffff';

  // Animation d'entree
  const anim = seg.animation ?? 'fade';
  let offsetX = 0, offsetY = 0, alpha = enterProgress;
  if (anim === 'slide-left') { offsetX = (1 - enterProgress) * 40; alpha = enterProgress; }
  if (anim === 'slide-up') { offsetY = (1 - enterProgress) * 30; alpha = enterProgress; }
  if (anim === 'pop') { const s = 0.8 + enterProgress * 0.2; ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); alpha = enterProgress; }
  ctx.globalAlpha *= alpha;

  // Shadow optionnelle depuis preset
  if (config.shadowBlur) {
    ctx.shadowBlur = config.shadowBlur * (w / 400);
    ctx.shadowColor = config.shadowColor ?? 'rgba(0,0,0,0.8)';
  }

  if (seg.displayType === 'citation') {
    renderCitation(ctx, seg, x + offsetX, y + offsetY, fontSize, font, weight, maxWidth, lineH, w);
    return;
  }

  ctx.font = `${weight} ${fontSize}px "${font}", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const rawWords = seg.text.split(' ');
  const words = transform ? rawWords.map(wd => wd.toUpperCase()) : rawWords;
  const highlighted = new Set((seg.highlightedWords ?? []).map(hw => hw.wordIndex));
  const highlightColors = new Map((seg.highlightedWords ?? []).map(hw => [hw.wordIndex, hw.color]));

  // Wrap et dessiner mot par mot avec highlights
  let curX = x + offsetX - maxWidth / 2;
  let curY = y + offsetY;
  const startX = curX;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wWidth = ctx.measureText(word + ' ').width;

    // Retour a la ligne
    if (curX + wWidth > startX + maxWidth && curX > startX) {
      curX = startX;
      curY += lineH;
    }

    if (highlighted.has(i)) {
      // Pill coloree sur le mot
      const pw = ctx.measureText(word).width;
      const pad = fontSize * 0.2;
      ctx.shadowBlur = 0; // pas de shadow sur la pill
      ctx.fillStyle = highlightColors.get(i) ?? config.accentColor;
      ctx.beginPath();
      ctx.roundRect(curX - pad, curY - pad * 0.3, pw + pad * 2, fontSize + pad * 0.6, fontSize * 0.15);
      ctx.fill();
      if (config.shadowBlur) {
        ctx.shadowBlur = config.shadowBlur * (w / 400);
        ctx.shadowColor = config.shadowColor ?? 'rgba(0,0,0,0.8)';
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(word, curX, curY);
    } else {
      ctx.fillStyle = textColor;
      ctx.fillText(word, curX, curY);
    }
    curX += wWidth;
  }
}

function renderCitation(
  ctx: CanvasRenderingContext2D, seg: SubtitleSegmentPro,
  x: number, y: number, fontSize: number, font: string, weight: number,
  maxWidth: number, lineH: number, w: number,
) {
  ctx.font = `italic ${weight} ${fontSize}px "${font}", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Mesurer le texte pour la bulle
  const lines = wrapLines(ctx, seg.text, maxWidth * 0.85);
  const textH = lines.length * lineH;
  const pad = fontSize * 0.5;
  const bubbleW = maxWidth * 0.9;
  const bubbleH = textH + pad * 2;

  // Bulle blanche
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.roundRect(x - bubbleW / 2, y - pad, bubbleW, bubbleH, fontSize * 0.3);
  ctx.fill();

  // Texte noir
  ctx.fillStyle = '#1a1a1a';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineH);
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
