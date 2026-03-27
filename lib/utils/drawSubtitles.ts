import type { SubtitleSegment, SubtitleStyle } from '@/lib/types';
import type { ColorPalette } from '@/lib/data/designKnowledge';

/**
 * Dessine les sous-titres sur un canvas pour l'export video.
 * 6 styles : classic, tiktok, karaoke, bold_outline, pill, karaoke_pro.
 */
export function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  subtitles: SubtitleSegment[],
  style: SubtitleStyle,
  time: number,
  w: number,
  h: number,
  palette?: ColorPalette | null,
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

  if (style === 'bold_outline') {
    const textColor = palette?.text ?? '#ffffff';
    const strokeColor = palette?.stroke ?? '#000000';
    ctx.font = `bold ${Math.round(fontSize * 1.2)}px "Inter", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 6 * scale;
    ctx.lineJoin = 'round';
    ctx.strokeText(seg.text, w / 2, y);
    ctx.fillText(seg.text, w / 2, y);
  } else if (style === 'pill') {
    const bgColor = palette?.background ?? 'rgba(0, 0, 0, 0.6)';
    const textColor = palette?.text ?? '#ffffff';
    const pad = 10 * scale;
    const tw = ctx.measureText(seg.text).width;
    const rx = (w - tw) / 2 - pad;
    const ry = y - fontSize / 2 - pad / 2;
    const rw = tw + pad * 2;
    const rh = fontSize + pad;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, fontSize / 3);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.fillText(seg.text, w / 2, y);
  } else if (style === 'karaoke_pro' && seg.words.length > 0) {
    const accentColor = palette?.accent ?? '#5C7A5F';
    const textColor = palette?.text ?? '#ffffff';
    const fullText = seg.words.map(ww => ww.word).join(' ');
    const totalW = ctx.measureText(fullText).width;
    let x = (w - totalW) / 2;
    ctx.textAlign = 'left';
    for (const ww of seg.words) {
      const isCurrent = time >= ww.start && time <= ww.end;
      ctx.save();
      if (isCurrent) {
        const wordW = ctx.measureText(ww.word).width;
        const cx = x + wordW / 2;
        ctx.translate(cx, y);
        ctx.scale(1.1, 1.1);
        ctx.translate(-cx, -y);
        ctx.fillStyle = accentColor;
      } else {
        ctx.fillStyle = textColor;
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 * scale;
      ctx.strokeText(ww.word, x, y);
      ctx.fillText(ww.word, x, y);
      ctx.restore();
      x += ctx.measureText(ww.word + ' ').width;
    }
  } else if (style === 'tiktok' && seg.words.length > 0) {
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
