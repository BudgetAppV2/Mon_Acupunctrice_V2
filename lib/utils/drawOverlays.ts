import type { TextOverlayItem } from '@/lib/types';
import { wrapText } from '@/lib/data/designKnowledge';

/**
 * Dessine les overlays texte sur un canvas pour l'export video.
 * Coordonnees en ratio 0-1, converties en pixels.
 * Echelle la taille de police par rapport a la largeur de preview (375px).
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
    ctx.fillStyle = o.fill;
    if (o.shadowColor && o.shadowBlur) {
      ctx.shadowColor = o.shadowColor;
      ctx.shadowBlur = o.shadowBlur * scale;
    }
    const px = o.x * w;
    const py = o.y * h;
    const maxWidth = w - 120 * scale;
    const lineH = fontSize * 1.2;

    if (o.strokeWidth && o.stroke) {
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.strokeWidth * scale;
      const lines = getLines(ctx, o.text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        ctx.strokeText(lines[i], px, py + i * lineH);
      }
    }
    wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    ctx.restore();
  }
}

/** Calcule les lignes wrappees (meme algo que wrapText) */
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
