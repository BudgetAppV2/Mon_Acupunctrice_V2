import type { TextOverlayItem } from '@/lib/types';
import { wrapText } from '@/lib/data/designKnowledge';

/**
 * Dessine les overlays texte sur un canvas pour l'export video.
 * Coordonnees en ratio 0-1, converties en pixels.
 * Supporte les effets : none, outline, double_outline, glow, pill.
 */
export function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlayItem[],
  time: number,
  w: number,
  h: number,
) {
  const scale = w / 375;
  for (const o of overlays) {
    if (time < o.startTime || time > o.endTime) continue;
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    const fontSize = Math.round(o.fontSize * scale);
    ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;
    const px = o.x * w;
    const py = o.y * h;
    const maxWidth = w - 120 * scale;
    const lineH = fontSize * 1.2;
    const effect = o.effect ?? 'none';

    if (effect === 'pill') {
      const lines = getLines(ctx, o.text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        const tw = ctx.measureText(lines[i]).width;
        const pad = 8 * scale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.roundRect(px - tw / 2 - pad, py + i * lineH - pad / 2, tw + pad * 2, lineH + pad, fontSize / 3);
        ctx.fill();
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'glow') {
      ctx.shadowColor = o.fill;
      ctx.shadowBlur = 12 * scale;
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
      ctx.shadowBlur = 0;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'outline' || effect === 'double_outline') {
      const lines = getLines(ctx, o.text, maxWidth);
      if (effect === 'double_outline') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6 * scale;
        ctx.lineJoin = 'round';
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3 * scale;
      ctx.lineJoin = 'round';
      for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else {
      if (o.shadowColor && o.shadowBlur) {
        ctx.shadowColor = o.shadowColor;
        ctx.shadowBlur = o.shadowBlur * scale;
      }
      if (o.strokeWidth && o.stroke) {
        ctx.strokeStyle = o.stroke;
        ctx.lineWidth = o.strokeWidth * scale;
        const lines = getLines(ctx, o.text, maxWidth);
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    }
    ctx.restore();
  }
}

function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}
