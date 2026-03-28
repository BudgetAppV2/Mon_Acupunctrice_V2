/** Pill overlay — bloc arrondi semi-transparent + texte */
export function drawPillOverlay(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, w: number,
  fontSize: number, fontFamily: string,
  bgColor: string, textColor: string,
) {
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const pad = fontSize * 0.4;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - tw / 2 - pad, y - fontSize / 2 - pad * 0.4, tw + pad * 2, fontSize + pad * 0.8, fontSize * 0.3);
  ctx.fill();
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
}
