import type { SubtitleBlock, StylePreset, RenderWord } from './types';
import {
  computeWordStates,
  getWordAlpha,
  getWordScale,
  getWordOffsetY,
  getTypewriterChars,
  getNeonGlow,
} from './animations';

interface RendererOptions {
  canvas: HTMLCanvasElement;
  blocks: SubtitleBlock[];
  globalPreset: StylePreset;
  currentMs: number;
  nowMs: number; // wall-clock time for oscillation effects
  canvasWidth: number;
  canvasHeight: number;
}

// Load font into canvas context
function applyFont(ctx: CanvasRenderingContext2D, style: StylePreset): void {
  const transform = style.textTransform === 'uppercase' ? 'uppercase' : '';
  ctx.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}", sans-serif`;
  // textTransform is CSS-only; we handle it manually below when drawing
  void transform;
}

function transformText(text: string, style: StylePreset): string {
  return style.textTransform === 'uppercase' ? text.toUpperCase() : text;
}

/**
 * Draw background pill behind a line of text.
 */
function drawBgPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: string,
  borderRadius: number,
  padding: number,
): void {
  const px = x - padding;
  const py = y - height + 4 - padding;
  const pw = width + padding * 2;
  const ph = height + padding * 2;
  const r = Math.min(borderRadius, ph / 2);

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(px + r, py);
  ctx.lineTo(px + pw - r, py);
  ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
  ctx.lineTo(px + pw, py + ph - r);
  ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
  ctx.lineTo(px + r, py + ph);
  ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
  ctx.lineTo(px, py + r);
  ctx.quadraticCurveTo(px, py, px + r, py);
  ctx.closePath();
  ctx.fill();
}

/**
 * Core render: draws one visible block onto the canvas.
 */
function renderBlock(
  ctx: CanvasRenderingContext2D,
  block: SubtitleBlock,
  style: StylePreset,
  currentMs: number,
  nowMs: number,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const animType = style.animation.type;

  applyFont(ctx, style);

  // Position: style.position is 0..1 relative to canvas
  const centerX = style.position.x * canvasWidth;
  const baseY = style.position.y * canvasHeight;

  if (animType === 'typewriter') {
    // Draw whole block text, revealed char by char
    const rawText = transformText(block.text, style);
    const charsToShow = getTypewriterChars(currentMs, block.startMs, block.endMs, rawText.length);
    const displayText = rawText.slice(0, charsToShow) + (charsToShow < rawText.length ? '|' : '');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Measure for background
    const metrics = ctx.measureText(displayText || ' ');
    const textWidth = metrics.width;

    if (style.bgColor && style.bgColor !== 'undefined') {
      drawBgPill(ctx, centerX - textWidth / 2, baseY, textWidth, style.fontSize, style.bgColor, style.bgBorderRadius ?? 4, style.bgPadding ?? 8);
    }

    // Shadow
    if (style.shadowBlur && style.shadowBlur > 0) {
      ctx.shadowColor = style.shadowColor ?? 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = style.shadowBlur;
    }

    // Stroke
    if (style.outlineWidth && style.outlineWidth > 0) {
      ctx.strokeStyle = style.outlineColor ?? '#000';
      ctx.lineWidth = style.outlineWidth * 2;
      ctx.strokeText(displayText, centerX, baseY);
    }

    ctx.fillStyle = style.color;
    ctx.fillText(displayText, centerX, baseY);
    ctx.restore();
    return;
  }

  // Word-by-word animations
  const words = computeWordStates(currentMs, block.words, style.animation);

  // Measure all visible words to compute line wrap and centering
  const wordTexts = words.map((w) => transformText(w.text, style));

  // Build lines (simple word-wrap based on canvas width minus padding)
  const maxLineWidth = canvasWidth * 0.85;
  const lines: { words: RenderWord[]; texts: string[] }[] = [];
  let currentLine: { words: RenderWord[]; texts: string[] } = { words: [], texts: [] };
  let currentLineWidth = 0;
  const spaceWidth = ctx.measureText(' ').width;

  words.forEach((word, i) => {
    const text = wordTexts[i];
    const wordWidth = ctx.measureText(text).width;
    const addWidth = currentLine.words.length > 0 ? spaceWidth + wordWidth : wordWidth;

    if (currentLine.words.length > 0 && currentLineWidth + addWidth > maxLineWidth) {
      lines.push(currentLine);
      currentLine = { words: [word], texts: [text] };
      currentLineWidth = wordWidth;
    } else {
      currentLine.words.push(word);
      currentLine.texts.push(text);
      currentLineWidth += addWidth;
    }
  });
  if (currentLine.words.length > 0) lines.push(currentLine);

  const lineHeight = style.fontSize * 1.35;

  lines.forEach((line, lineIdx) => {
    // Compute total line width for centering
    let totalWidth = 0;
    const wordWidths: number[] = [];
    line.texts.forEach((text, ti) => {
      const w = ctx.measureText(text).width;
      wordWidths.push(w);
      totalWidth += w + (ti > 0 ? spaceWidth : 0);
    });

    let xCursor = centerX - totalWidth / 2;
    const lineY = baseY + lineIdx * lineHeight - (lines.length - 1) * lineHeight * 0.5;

    // Background pill per line
    if (style.bgColor && style.bgColor !== 'undefined' && style.bgColor !== 'rgba(0,0,0,0.0)') {
      drawBgPill(ctx, xCursor, lineY, totalWidth, style.fontSize, style.bgColor, style.bgBorderRadius ?? 4, style.bgPadding ?? 8);
    }

    line.words.forEach((word, wi) => {
      const text = line.texts[wi];
      const wordWidth = wordWidths[wi];
      const wordCenterX = xCursor + wordWidth / 2;

      const progress = word.progress;
      const alpha = getWordAlpha(animType, progress);
      if (alpha <= 0) {
        xCursor += wordWidth + (wi < line.words.length - 1 ? spaceWidth : 0);
        return;
      }

      const scale = getWordScale(animType, progress);
      const offsetY = getWordOffsetY(animType, progress, style.fontSize);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (scale !== 1) {
        ctx.translate(wordCenterX, lineY + offsetY);
        ctx.scale(scale, scale);
        ctx.translate(-wordCenterX, -(lineY + offsetY));
      }

      // Shadow
      if (style.shadowBlur && style.shadowBlur > 0) {
        let shadowColor = style.shadowColor ?? 'rgba(0,0,0,0.6)';
        if (animType === 'neon-pulse') {
          const glow = getNeonGlow(progress, nowMs);
          const glowAlpha = 0.4 + 0.6 * glow;
          shadowColor = (style.shadowColor ?? '#00F5FF').replace(')', `, ${glowAlpha})`).replace('rgb(', 'rgba(');
        }
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = style.shadowBlur;
      }

      // Karaoke: active word gets highlight colour
      let fillColor = style.color;
      if (animType === 'karaoke') {
        // Interpolate from grey to highlight colour based on progress
        fillColor = word.active || word.progress >= 1
          ? (style.shadowColor && style.shadowColor !== 'transparent' ? style.shadowColor : '#FFD700')
          : '#AAAAAA';
      }

      // Stroke / outline
      if (style.outlineWidth && style.outlineWidth > 0) {
        ctx.strokeStyle = style.outlineColor ?? '#000';
        ctx.lineWidth = style.outlineWidth * 2;
        ctx.lineJoin = 'round';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(text, xCursor, lineY + offsetY);
      }

      ctx.fillStyle = fillColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, xCursor, lineY + offsetY);

      ctx.restore();

      xCursor += wordWidth + (wi < line.words.length - 1 ? spaceWidth : 0);
    });
  });
}

/**
 * Main render entry — clears canvas, draws gradient bg, then all visible blocks.
 */
export function renderFrame(opts: RendererOptions): void {
  const { canvas, blocks, globalPreset, currentMs, nowMs, canvasWidth, canvasHeight } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle overlay pattern suggestion
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let y = 0; y < canvasHeight; y += 4) {
    ctx.fillRect(0, y, canvasWidth, 1);
  }

  blocks.forEach((block) => {
    if (currentMs < block.startMs || currentMs > block.endMs + 200) return;
    const style: StylePreset = { ...globalPreset, ...(block.overrides ?? {}) };
    renderBlock(ctx, block, style, currentMs, nowMs, canvasWidth, canvasHeight);
  });
}
