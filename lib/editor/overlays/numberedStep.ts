/** Numbered step — cercle numerote + texte + sous-texte (style Aider/Enseigner) */
export function drawNumberedStep(
  ctx: CanvasRenderingContext2D,
  num: number, title: string, subtitle: string,
  x: number, y: number, w: number,
  accentColor: string, fontFamily: string,
) {
  const circleR = w * 0.025;
  const fontSize = Math.round(w * 0.032);
  const subFontSize = Math.round(w * 0.022);

  // Cercle numerote
  ctx.beginPath();
  ctx.arc(x - w * 0.12, y, circleR, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(circleR * 1.2)}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), x - w * 0.12, y);

  // Titre
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.fillText(title, x - w * 0.08, y - subFontSize * 0.3);

  // Sous-titre
  if (subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${subFontSize}px "${fontFamily}", sans-serif`;
    ctx.fillText(subtitle, x - w * 0.08, y + fontSize * 0.6);
  }
}
