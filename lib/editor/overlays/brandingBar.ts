/** Branding bar — bandeau "MON ACUPUNCTRICE" avec letterspacing */
export function drawBrandingBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  bgColor: string, textColor: string, fontFamily: string,
) {
  const fontSize = Math.round(w * 0.018);
  const text = 'M O N   A C U P U N C T R I C E';
  ctx.font = `500 ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const pad = fontSize * 0.6;

  // Bandeau pill
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - tw / 2 - pad, y - fontSize / 2 - pad * 0.4, tw + pad * 2, fontSize + pad * 0.8, fontSize * 0.5);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
}
