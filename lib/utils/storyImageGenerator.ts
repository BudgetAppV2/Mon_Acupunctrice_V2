/** Génère une image 1080x1920 pour les stories Instagram.
 * Utilise Canvas API côté client — ne pas appeler dans le cron.
 */

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
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
}

export async function generateStoryImage(
  title: string,
  type: 'promo' | 'rappel',
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;

  // Fond sage
  ctx.fillStyle = '#87A878';
  ctx.fillRect(0, 0, 1080, 1920);

  // Bande sombre en haut et en bas pour la lisibilité
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, 'rgba(0,0,0,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 600);

  const grad2 = ctx.createLinearGradient(0, 1320, 0, 1920);
  grad2.addColorStop(0, 'rgba(0,0,0,0)');
  grad2.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 1320, 1080, 600);

  // Titre
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px Inter, sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, title, 540, 700, 900, 80);

  // CTA
  ctx.font = '40px Inter, sans-serif';
  const cta = type === 'promo' ? 'Nouvel article! Lien dans ma bio' : 'Tu as manqué cet article?';
  ctx.fillText(cta, 540, 1300);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
}
