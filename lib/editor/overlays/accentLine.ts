/** Accent line — ligne decorative horizontale */
export function drawAccentLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, widthRatio: number, w: number,
  color: string, thickness: number,
) {
  const lineW = widthRatio * w;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - lineW / 2, y);
  ctx.lineTo(x + lineW / 2, y);
  ctx.stroke();
}
