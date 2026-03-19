import type { TextOverlayItem } from '@/lib/types';

/**
 * Dessine les overlays texte sur un canvas pour l'export vidéo.
 * Coordonnées en ratio 0-1, converties en pixels.
 * Échelle la taille de police par rapport à la largeur de preview (375px).
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
    ctx.font = `bold ${Math.round(o.fontSize * scale)}px "${o.fontFamily}", sans-serif`;
    ctx.fillStyle = o.fill;
    if (o.shadowColor && o.shadowBlur) {
      ctx.shadowColor = o.shadowColor;
      ctx.shadowBlur = o.shadowBlur * scale;
    }
    if (o.strokeWidth && o.stroke) {
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.strokeWidth * scale;
      ctx.strokeText(o.text, o.x * w, o.y * h);
    }
    ctx.fillText(o.text, o.x * w, o.y * h);
    ctx.restore();
  }
}
