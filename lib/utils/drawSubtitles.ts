import type { SubtitleSegment, SubtitleStyle } from '@/lib/types';

/**
 * Dessine les sous-titres sur un canvas pour l'export vidéo.
 * Gère les 3 styles : classic (blanc contouré), tiktok (mot courant jaune), karaoke (fond vert).
 */
export function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  subtitles: SubtitleSegment[],
  style: SubtitleStyle,
  time: number,
  w: number,
  h: number,
) {
  const seg = subtitles.find(s => time >= s.startTime && time <= s.endTime);
  if (!seg) return;

  const scale = w / 375;
  const fontSize = Math.round(28 * scale);
  const y = h * 0.85;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "Inter", sans-serif`;

  if (style === 'tiktok' && seg.words.length > 0) {
    // Mot courant en jaune, reste en blanc
    const fullText = seg.words.map(ww => ww.word).join(' ');
    const totalW = ctx.measureText(fullText).width;
    let x = (w - totalW) / 2;
    ctx.textAlign = 'left';
    for (const ww of seg.words) {
      const isCurrent = time >= ww.start && time <= ww.end;
      ctx.fillStyle = isCurrent ? '#FFD700' : '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3 * scale;
      ctx.strokeText(ww.word, x, y);
      ctx.fillText(ww.word, x, y);
      x += ctx.measureText(ww.word + ' ').width;
    }
  } else if (style === 'karaoke') {
    // Fond vert + texte blanc
    const pad = 8 * scale;
    const tw = ctx.measureText(seg.text).width;
    ctx.fillStyle = 'rgba(0, 128, 0, 0.7)';
    ctx.fillRect((w - tw) / 2 - pad, y - fontSize / 2 - pad, tw + pad * 2, fontSize + pad * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(seg.text, w / 2, y);
  } else {
    // Classic — blanc avec contour noir
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3 * scale;
    ctx.strokeText(seg.text, w / 2, y);
    ctx.fillText(seg.text, w / 2, y);
  }

  ctx.restore();
}
