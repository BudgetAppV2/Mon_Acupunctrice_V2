/**
 * Animation playback engine for the image editor.
 * Handles 3 types: text (SplitType overlay), general (Fabric props), continuous (loop).
 */

import gsap from 'gsap';
import type { Canvas, FabricObject, Textbox } from 'fabric';
import {
  findPreset,
  type TextAnimPreset,
  type GeneralAnimPreset,
  type ContinuousAnimPreset,
} from './animationPresets';

export interface PlaybackHandle {
  stop: () => void;
}

/** Build GSAP "from" vars, resolving deltas relative to the object's current position */
function resolveFrom(obj: FabricObject, raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'leftDelta') out.left = (obj.left ?? 0) + v;
    else if (k === 'topDelta') out.top = (obj.top ?? 0) + v;
    else out[k] = v;
  }
  return out;
}

/** Build GSAP "to" vars for continuous animations */
function resolveTo(obj: FabricObject, raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'leftDelta') out.left = (obj.left ?? 0) + v;
    else if (k === 'topDelta') out.top = (obj.top ?? 0) + v;
    else if (k === 'angleDelta') out.angle = (obj.angle ?? 0) + v;
    else if (k === 'scaleMultiplier') {
      out.scaleX = (obj.scaleX ?? 1) * v;
      out.scaleY = (obj.scaleY ?? 1) * v;
    } else out[k] = v;
  }
  return out;
}

function playGeneral(canvas: Canvas, obj: FabricObject, p: GeneralAnimPreset, tweens: gsap.core.Tween[]) {
  const from = resolveFrom(obj, p.from);
  const t = gsap.from(obj, { ...from, duration: p.duration, ease: p.ease, onUpdate: () => canvas.requestRenderAll() });
  tweens.push(t);
}

function playContinuous(canvas: Canvas, obj: FabricObject, p: ContinuousAnimPreset, tweens: gsap.core.Tween[]) {
  const to = resolveTo(obj, p.to);
  const t = gsap.to(obj, { ...to, duration: p.duration, ease: p.ease, yoyo: p.yoyo, repeat: -1, onUpdate: () => canvas.requestRenderAll() });
  tweens.push(t);
}

async function playText(
  canvas: Canvas, obj: FabricObject, p: TextAnimPreset,
  overlays: HTMLElement[], originals: Map<FabricObject, Record<string, unknown>>,
  tweens: gsap.core.Tween[],
) {
  const textObj = obj as Textbox;
  originals.set(obj, { opacity: textObj.opacity });

  // Calculate screen position from canvas coords
  const canvasEl = canvas.getElement();
  const rect = canvasEl.getBoundingClientRect();
  const sx = rect.width / canvas.getWidth();
  const sy = rect.height / canvas.getHeight();
  const bounds = textObj.getBoundingRect();

  // Hide Fabric text
  textObj.set('opacity', 0);
  canvas.renderAll();

  // Create HTML overlay
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'pointer-events:none', 'z-index:9999', 'white-space:pre-wrap', 'overflow:visible',
    `left:${rect.left + bounds.left * sx}px`,
    `top:${rect.top + bounds.top * sy}px`,
    `width:${bounds.width * sx}px`,
    `font-family:${textObj.fontFamily}`,
    `font-size:${(textObj.fontSize ?? 32) * sx}px`,
    `font-weight:${textObj.fontWeight || 'normal'}`,
    `color:${typeof textObj.fill === 'string' ? textObj.fill : '#000'}`,
    `text-align:${textObj.textAlign || 'left'}`,
    `line-height:${textObj.lineHeight || 1.16}`,
    `letter-spacing:${((textObj.charSpacing ?? 0) / 1000) * (textObj.fontSize ?? 32) * sx}px`,
  ].join(';');
  el.innerHTML = (textObj.text ?? '').replace(/\n/g, '<br>');
  document.body.appendChild(el);
  overlays.push(el);

  // Dynamic import SplitType to avoid SSR issues
  const { default: SplitType } = await import('split-type');
  const split = new SplitType(el, { types: p.split === 'chars' ? 'chars' : 'words' });
  const targets = (p.split === 'chars' ? split.chars : split.words) ?? [];

  if (targets.length > 0) {
    const t = gsap.from(targets, {
      ...p.from,
      stagger: p.stagger,
      duration: p.duration,
      ease: p.ease,
    });
    tweens.push(t);
  }
}

export function playPreview(canvas: Canvas): PlaybackHandle {
  const tweens: gsap.core.Tween[] = [];
  const overlays: HTMLElement[] = [];
  const originals = new Map<FabricObject, Record<string, unknown>>();

  canvas.discardActiveObject();
  canvas.renderAll();

  const objects = canvas.getObjects();
  for (const obj of objects) {
    const animId = (obj as unknown as Record<string, unknown>).data
      ? ((obj as unknown as Record<string, unknown>).data as Record<string, unknown>)?.animationId as string | undefined
      : undefined;
    if (!animId) continue;

    const preset = findPreset(animId);
    if (!preset) continue;

    if (preset.category === 'text' && (obj.type === 'textbox' || obj.type === 'i-text')) {
      playText(canvas, obj, preset, overlays, originals, tweens);
    } else if (preset.category === 'general') {
      originals.set(obj, { left: obj.left, top: obj.top, opacity: obj.opacity, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle });
      playGeneral(canvas, obj, preset, tweens);
    } else if (preset.category === 'continuous') {
      originals.set(obj, { left: obj.left, top: obj.top, opacity: obj.opacity, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle });
      playContinuous(canvas, obj, preset, tweens);
    }
  }

  return {
    stop() {
      tweens.forEach((t) => t.kill());
      overlays.forEach((el) => el.remove());
      originals.forEach((props, obj) => { obj.set(props); });
      canvas.renderAll();
    },
  };
}
