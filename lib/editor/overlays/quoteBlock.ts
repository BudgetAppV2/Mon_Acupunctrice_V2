/** Quote block — guillemets + texte serif italic (style Connecter/Inspirer) */
export function drawQuoteBlock(
  ctx: CanvasRenderingContext2D,
  text: string, attribution: string,
  x: number, y: number, w: number,
  fontFamily: string, accentColor: string,
) {
  const fontSize = Math.round(w * 0.04);
  const maxWidth = w * 0.75;

  // Guillemet ouvrant decoratif
  ctx.font = `italic ${fontSize * 2.5}px "${fontFamily}", serif`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.4;
  ctx.fillText('\u201C', x, y - fontSize * 1.5);
  ctx.globalAlpha = 1;

  // Texte citation
  ctx.font = `italic ${fontSize}px "${fontFamily}", serif`;
  ctx.fillStyle = '#ffffff';
  const lines = wrapLines(ctx, text, maxWidth);
  const lineH = fontSize * 1.4;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineH);
  }

  // Attribution
  if (attribution) {
    const attrY = y + lines.length * lineH + fontSize * 0.5;
    ctx.font = `${Math.round(fontSize * 0.7)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`— ${attribution}`, x, attrY);
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
