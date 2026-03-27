import type { TextOverlayItem } from '@/lib/types';
import { wrapText } from '@/lib/data/designKnowledge';

const ANIM_DUR = 0.5; // duree d'animation en secondes

/** Calcule le progress d'animation (0→1) avec easing ease-out */
function animProgress(time: number, startTime: number): number {
  const elapsed = time - startTime;
  if (elapsed >= ANIM_DUR) return 1;
  if (elapsed <= 0) return 0;
  const t = elapsed / ANIM_DUR;
  return 1 - Math.pow(1 - t, 3); // ease-out cubic
}

/**
 * Dessine les overlays texte sur un canvas pour l'export video.
 * Supporte les effets (outline, glow, pill) et les animations (fade, slide, bounce, scale, typewriter).
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

    const p = animProgress(time, o.startTime);
    const anim = o.animation ?? 'none';
    const fontSize = Math.round(o.fontSize * scale);
    const px = o.x * w;
    let py = o.y * h;

    // Appliquer les transformations d'animation
    if (anim === 'fade' || anim === 'fade_in') {
      ctx.globalAlpha = p;
    } else if (anim === 'slide_up') {
      py += (1 - p) * 40 * scale;
      ctx.globalAlpha = p;
    } else if (anim === 'slide_left') {
      ctx.translate((1 - p) * 60 * scale, 0);
      ctx.globalAlpha = p;
    } else if (anim === 'bounce') {
      const bounce = p < 1 ? 1 + Math.sin(p * Math.PI * 2) * 0.15 * (1 - p) : 1;
      ctx.translate(px, py);
      ctx.scale(bounce, bounce);
      ctx.translate(-px, -py);
    } else if (anim === 'scale_pop' || anim === 'zoom') {
      const s = 0.3 + p * 0.7; // 0.3 → 1.0
      ctx.globalAlpha = p;
      ctx.translate(px, py);
      ctx.scale(s, s);
      ctx.translate(-px, -py);
    }

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;
    const maxWidth = w - 120 * scale;
    const lineH = fontSize * 1.2;
    const effect = o.effect ?? 'none';

    // Typewriter : afficher progressivement les caracteres
    const displayText = anim === 'typewriter' ? o.text.slice(0, Math.ceil(o.text.length * p)) : o.text;

    if (effect === 'pill') {
      const lines = getLines(ctx, displayText, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        const tw = ctx.measureText(lines[i]).width;
        const pad = 8 * scale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.roundRect(px - tw / 2 - pad, py + i * lineH - pad / 2, tw + pad * 2, lineH + pad, fontSize / 3);
        ctx.fill();
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, displayText, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'glow') {
      ctx.shadowColor = o.fill;
      ctx.shadowBlur = 12 * scale;
      ctx.fillStyle = o.fill;
      wrapText(ctx, displayText, px, py, maxWidth, lineH, 'center');
      ctx.shadowBlur = 0;
      wrapText(ctx, displayText, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'outline' || effect === 'double_outline') {
      const lines = getLines(ctx, displayText, maxWidth);
      if (effect === 'double_outline') {
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6 * scale; ctx.lineJoin = 'round';
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 3 * scale; ctx.lineJoin = 'round';
      for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      ctx.fillStyle = o.fill;
      wrapText(ctx, displayText, px, py, maxWidth, lineH, 'center');
    } else {
      if (o.shadowColor && o.shadowBlur) { ctx.shadowColor = o.shadowColor; ctx.shadowBlur = o.shadowBlur * scale; }
      if (o.strokeWidth && o.stroke) {
        ctx.strokeStyle = o.stroke; ctx.lineWidth = o.strokeWidth * scale;
        const lines = getLines(ctx, displayText, maxWidth);
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, displayText, px, py, maxWidth, lineH, 'center');
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
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else { line = test; }
  }
  lines.push(line);
  return lines;
}
