/**
 * Scene Renderer — traverse le SceneGraph et dessine chaque layer sur un Canvas 2D.
 * Compatible avec le seek-based export Mediabunny CanvasSource.
 */

import type { SceneGraph, SceneLayer, TextLayer, ShapeLayer, EffectLayer } from './sceneGraph';
import { resolveAnimation } from './sceneGraph';
import { applyLut } from './lutRenderer';
import { getLutData } from '@/lib/data/luts/presets';

/** Dessine le SceneGraph complet a l'instant t sur le canvas */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: SceneGraph,
  time: number,
  w: number,
  h: number,
) {
  for (const layer of scene.layers) {
    if (time < layer.startTime || time > layer.endTime) continue;
    ctx.save();
    applyTransforms(ctx, layer, time, w, h);
    switch (layer.type) {
      case 'text': renderText(ctx, layer as TextLayer, w, h); break;
      case 'shape': renderShape(ctx, layer as ShapeLayer, w, h); break;
      case 'effect': renderEffect(ctx, layer as EffectLayer, w, h); break;
      // subtitle layers sont rendus par le subtitle engine separement
    }
    ctx.restore();
  }
}

/** Applique les transformations animees (position, scale, rotation, opacity, blur) */
function applyTransforms(ctx: CanvasRenderingContext2D, layer: SceneLayer, time: number, w: number, h: number) {
  const ls = layer.startTime;
  const a = layer.animations;

  const opacity = resolveAnimation(a, 'opacity', ls, time, 1);
  const offX = resolveAnimation(a, 'x', ls, time, 0);
  const offY = resolveAnimation(a, 'y', ls, time, 0);
  const scale = resolveAnimation(a, 'scale', ls, time, 1);
  const rotation = resolveAnimation(a, 'rotation', ls, time, 0);
  const blur = resolveAnimation(a, 'blur', ls, time, 0);

  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  if (blur > 0) ctx.filter = `blur(${blur}px)`;

  const px = (layer.position.x + offX) * w;
  const py = (layer.position.y + offY) * h;

  if (scale !== 1 || rotation !== 0) {
    ctx.translate(px, py);
    if (rotation !== 0) ctx.rotate(rotation * Math.PI / 180);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.translate(-px, -py);
  }
}

/** Rendu d'un TextLayer */
function renderText(ctx: CanvasRenderingContext2D, layer: TextLayer, w: number, h: number) {
  const fontSize = Math.round(layer.fontSize * w);
  ctx.font = `bold ${fontSize}px "${layer.fontFamily}", sans-serif`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = 'top';

  const px = layer.position.x * w;
  const py = layer.position.y * h;
  const maxWidth = layer.maxWidthRatio * w;
  const lineH = fontSize * 1.25;
  const lines = wrapLines(ctx, layer.text, maxWidth);

  if (layer.shadow) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur;
    ctx.shadowOffsetX = layer.shadow.offsetX;
    ctx.shadowOffsetY = layer.shadow.offsetY;
  }

  for (let i = 0; i < lines.length; i++) {
    const ly = py + i * lineH;
    if (layer.stroke) {
      ctx.strokeStyle = layer.stroke.color;
      ctx.lineWidth = layer.stroke.width;
      ctx.lineJoin = 'round';
      ctx.strokeText(lines[i], px, ly);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(lines[i], px, ly);
  }
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/** Rendu d'un ShapeLayer */
function renderShape(ctx: CanvasRenderingContext2D, layer: ShapeLayer, w: number, h: number) {
  const px = layer.position.x * w;
  const py = layer.position.y * h;
  const sw = layer.width * w;
  const sh = layer.height * h;

  ctx.fillStyle = layer.fill;
  if (layer.shape === 'roundRect') {
    ctx.beginPath();
    ctx.roundRect(px - sw / 2, py - sh / 2, sw, sh, layer.cornerRadius ?? 8);
    ctx.fill();
  } else if (layer.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(px, py, Math.min(sw, sh) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (layer.shape === 'line') {
    ctx.strokeStyle = layer.fill;
    ctx.lineWidth = layer.strokeWidth ?? 2;
    ctx.beginPath();
    ctx.moveTo(px - sw / 2, py);
    ctx.lineTo(px + sw / 2, py);
    ctx.stroke();
  } else {
    ctx.fillRect(px - sw / 2, py - sh / 2, sw, sh);
  }
}

function renderEffect(ctx: CanvasRenderingContext2D, layer: EffectLayer, w: number, h: number) {
  const i = layer.intensity;
  if (layer.effect === 'vignette') {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.6 * i})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  } else if (layer.effect === 'gradient') {
    const top = layer.config?.direction !== 'bottom';
    const g = ctx.createLinearGradient(0, top ? 0 : h, 0, top ? h * 0.4 : h * 0.6);
    g.addColorStop(0, `rgba(0,0,0,${0.5 * i})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  } else if (layer.effect === 'warmFilter') {
    ctx.fillStyle = `rgba(255,200,150,${0.08 * i})`; ctx.fillRect(0, 0, w, h);
  } else if (layer.effect === 'grain') {
    ctx.globalAlpha = 0.04 * i;
    for (let j = 0; j < 500; j++) { const c = Math.random() > 0.5 ? 255 : 0; ctx.fillStyle = `rgb(${c},${c},${c})`; ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    ctx.globalAlpha = 1;
  } else if (layer.effect === 'lut' && layer.lutId) {
    const lutData = getLutData(layer.lutId);
    if (lutData) applyLut(ctx, lutData, layer.lutId, w, h, i);
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' '); const lines: string[] = []; let line = '';
  for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else { line = test; } }
  lines.push(line); return lines;
}
