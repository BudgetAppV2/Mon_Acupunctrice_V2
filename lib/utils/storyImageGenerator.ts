/** Genere une image 1080x1920 pour les stories Instagram.
 * Design brande "La Source en Soi" avec CTA GoRendezVous.
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

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Gradient vertical sage fonce → sage moyen
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#3D5E40');
  bg.addColorStop(1, '#5C7A5F');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Overlay sombre en haut
  const top = ctx.createLinearGradient(0, 0, 0, 500);
  top.addColorStop(0, 'rgba(0,0,0,0.4)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 500);

  // Overlay sombre en bas
  const bot = ctx.createLinearGradient(0, H - 600, 0, H);
  bot.addColorStop(0, 'rgba(0,0,0,0)');
  bot.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = bot;
  ctx.fillRect(0, H - 600, W, 600);
}

function drawBranding(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';

  // Nom de la pratique
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.font = 'bold 42px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('LA SOURCE EN SOI', W / 2, 280);

  // Nom + titre
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

  // CTA
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Prends rendez-vous', W / 2, 1480);

  // URL GoRendezVous
  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('gorendezvous.com/lasourceensoi', W / 2, 1530);

  // Instruction Instagram
  ctx.font = '24px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Lien dans ma bio', W / 2, 1600);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

export async function generateStoryImage(
  title: string,
  type: 'promo' | 'rappel',
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  drawBackground(ctx);
  drawBranding(ctx);

  // Title section — centered vertically
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;

  if (type === 'promo') {
    // Promo: blog title large
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    wrapText(ctx, title, W / 2, 780, 900, 76);
  } else {
    // Rappel: "Tu as manque cet article?" + title smaller
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
