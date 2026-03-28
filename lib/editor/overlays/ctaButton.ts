/** CTA button — bouton arrondi bas d'ecran */
export function drawCtaButton(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, w: number,
  bgColor: string, textColor: string, fontFamily: string,
) {
  const fontSize = Math.round(w * 0.028);
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const padX = fontSize * 1.2;
  const padY = fontSize * 0.5;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - tw / 2 - padX, y - fontSize / 2 - padY, tw + padX * 2, fontSize + padY * 2, fontSize * 0.6);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
}
