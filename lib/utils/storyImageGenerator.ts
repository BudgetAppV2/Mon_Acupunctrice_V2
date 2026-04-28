/** Genere une image 1080x1920 pour les stories Instagram.
 * Design brande "La Source en Soi" avec CTA GoRendezVous.
 * Supporte une image de fond optionnelle (Canva) en mode cover.
 * Utilise Canvas API cote client — ne pas appeler dans le cron.
 */

const W = 1080;
const H = 1920;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxWidth: number, lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY;
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: ImageBitmap) {
  const scale = Math.max(W / img.width, H / img.height);
  const sw = W / scale;
  const sh = H / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

function drawGradientBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#3D5E40');
  bg.addColorStop(1, '#5C7A5F');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

function drawOverlays(ctx: CanvasRenderingContext2D) {
  const top = ctx.createLinearGradient(0, 0, 0, 500);
  top.addColorStop(0, 'rgba(0,0,0,0.4)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 500);

  const bot = ctx.createLinearGradient(0, H - 600, 0, H);
  bot.addColorStop(0, 'rgba(0,0,0,0)');
  bot.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = bot;
  ctx.fillRect(0, H - 600, W, 600);
}

function drawBranding(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.font = 'bold 42px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('LA SOURCE EN SOI', W / 2, 280);

  ctx.shadowBlur = 4;
  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Judith Dufour-Savard \u2022 Acupunctrice', W / 2, 330);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function drawCTA(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;

  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Prends rendez-vous', W / 2, 1480);

  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('acupuncturejudith.ca/reserver', W / 2, 1530);

  ctx.font = '24px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Lien dans ma bio', W / 2, 1600);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

export async function generateStoryImage(
  title: string,
  type: 'promo' | 'rappel',
  backgroundImageUrl?: string,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background: Canva image or gradient fallback
  if (backgroundImageUrl) {
    try {
      const res = await fetch(backgroundImageUrl);
      const blob = await res.blob();
      const img = await createImageBitmap(blob);
      drawCoverImage(ctx, img);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, W, H);
    } catch {
      drawGradientBackground(ctx);
    }
  } else {
    drawGradientBackground(ctx);
  }

  drawOverlays(ctx);
  drawBranding(ctx);

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;

  if (type === 'promo') {
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    wrapText(ctx, title, W / 2, 780, 900, 76);
  } else {
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Tu as manque cet article?', W / 2, 740);

    ctx.font = '40px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    wrapText(ctx, title, W / 2, 840, 880, 52);
  }

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  drawCTA(ctx);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92));
}

/** Crop a 9:16 story image to 16:9 blog cover (takes center band) */
export async function cropStoryToBlogCover(storyImageUrl: string): Promise<Blob> {
  const img = await fetch(storyImageUrl).then(r => r.blob()).then(b => createImageBitmap(b));
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 675; // 16:9
  const ctx = canvas.getContext('2d')!;
  const cropH = img.width * (9 / 16);
  const srcY = (img.height - cropH) / 2;
  ctx.drawImage(img, 0, srcY, img.width, cropH, 0, 0, 1200, 675);
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92));
}
