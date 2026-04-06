/**
 * Animation playback engine for the image editor.
 * Uses GSAP to animate a proxy object, then applies values via Fabric's set() method.
 * This ensures Fabric.js internal state stays in sync.
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

type Props = Record<string, number>;

/** Read current values of keys from a Fabric object */
function readProps(obj: FabricObject, keys: string[]): Props {
  const out: Props = {};
  for (const k of keys) out[k] = (obj.get(k) as number) ?? 0;
  return out;
}

/** Apply proxy values to a Fabric object via set() and render */
function applyAndRender(canvas: Canvas, obj: FabricObject, proxy: Props) {
  for (const [k, v] of Object.entries(proxy)) obj.set(k, v);
  obj.setCoords();
  canvas.renderAll();
}

/** Resolve preset "from" values — deltas become absolute based on current position */
function resolveFrom(obj: FabricObject, raw: Props): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'leftDelta') out.left = (obj.get('left') as number ?? 0) + v;
    else if (k === 'topDelta') out.top = (obj.get('top') as number ?? 0) + v;
    else out[k] = v;
  }
  return out;
}

/** Resolve preset "to" values for continuous animations */
function resolveTo(obj: FabricObject, raw: Props): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'leftDelta') out.left = (obj.get('left') as number ?? 0) + v;
    else if (k === 'topDelta') out.top = (obj.get('top') as number ?? 0) + v;
    else if (k === 'angleDelta') out.angle = (obj.get('angle') as number ?? 0) + v;
    else if (k === 'scaleMultiplier') {
      out.scaleX = (obj.get('scaleX') as number ?? 1) * v;
      out.scaleY = (obj.get('scaleY') as number ?? 1) * v;
    } else out[k] = v;
  }
  return out;
}

function playGeneral(canvas: Canvas, obj: FabricObject, p: GeneralAnimPreset, tweens: gsap.core.Tween[]) {
  const fromVals = resolveFrom(obj, p.from);
  const keys = Object.keys(fromVals);
  const originalVals = readProps(obj, keys);

  // Set to "from" state immediately
  const proxy = { ...fromVals };
  applyAndRender(canvas, obj, proxy);

  // Animate proxy from "from" → original, applying via set() each frame
  const t = gsap.to(proxy, {
    ...originalVals,
    duration: p.duration,
    ease: p.ease,
    onUpdate: () => applyAndRender(canvas, obj, proxy),
  });
  tweens.push(t);
}

function playContinuous(canvas: Canvas, obj: FabricObject, p: ContinuousAnimPreset, tweens: gsap.core.Tween[]) {
  const toVals = resolveTo(obj, p.to);
  const keys = Object.keys(toVals);
  const proxy = readProps(obj, keys);

  const t = gsap.to(proxy, {
    ...toVals,
    duration: p.duration,
    ease: p.ease,
    yoyo: p.yoyo,
    repeat: -1,
    onUpdate: () => applyAndRender(canvas, obj, proxy),
  });
  tweens.push(t);
}

async function playText(
  canvas: Canvas, obj: FabricObject, p: TextAnimPreset,
  overlays: HTMLElement[], originals: Map<FabricObject, Props>,
  tweens: gsap.core.Tween[],
) {
  const textObj = obj as Textbox;
  originals.set(obj, { opacity: textObj.get('opacity') as number ?? 1 });
  const canvasEl = canvas.getElement();
  const rect = canvasEl.getBoundingClientRect();
  const sx = rect.width / canvas.getWidth();
  const sy = rect.height / canvas.getHeight();
  const bounds = textObj.getBoundingRect();

  textObj.set('opacity', 0);
  canvas.renderAll();

  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'pointer-events:none', 'z-index:9999', 'white-space:pre-wrap', 'overflow:visible',
    `left:${rect.left + bounds.left * sx}px`, `top:${rect.top + bounds.top * sy}px`,
    `width:${bounds.width * sx}px`, `font-family:${textObj.fontFamily}`,
    `font-size:${(textObj.fontSize ?? 32) * sx}px`, `font-weight:${textObj.fontWeight || 'normal'}`,
    `color:${typeof textObj.fill === 'string' ? textObj.fill : '#000'}`,
    `text-align:${textObj.textAlign || 'left'}`, `line-height:${textObj.lineHeight || 1.16}`,
    `letter-spacing:${((textObj.charSpacing ?? 0) / 1000) * (textObj.fontSize ?? 32) * sx}px`,
  ].join(';');
  el.innerHTML = (textObj.text ?? '').replace(/\n/g, '<br>');
  document.body.appendChild(el);
  overlays.push(el);

  const { default: SplitType } = await import('split-type');
  const split = new SplitType(el, { types: p.split === 'chars' ? 'chars' : 'words' });
  const targets = (p.split === 'chars' ? split.chars : split.words) ?? [];
  if (targets.length > 0) {
    tweens.push(gsap.from(targets, { ...p.from, stagger: p.stagger, duration: p.duration, ease: p.ease }));
  }
}

function playSingle(canvas: Canvas, obj: FabricObject, presetId: string) {
  const preset = findPreset(presetId);
  if (!preset) return null;
  const tweens: gsap.core.Tween[] = [];
  const overlays: HTMLElement[] = [];
  const originals = new Map<FabricObject, Props>();

  if (preset.category === 'text' && (obj.type === 'textbox' || obj.type === 'i-text')) {
    playText(canvas, obj, preset, overlays, originals, tweens);
  } else if (preset.category === 'general') {
    originals.set(obj, readProps(obj, ['left', 'top', 'opacity', 'scaleX', 'scaleY', 'angle']));
    playGeneral(canvas, obj, preset, tweens);
  } else if (preset.category === 'continuous') {
    originals.set(obj, readProps(obj, ['left', 'top', 'opacity', 'scaleX', 'scaleY', 'angle']));
    playContinuous(canvas, obj, preset, tweens);
  }

  return { tweens, overlays, originals };
}

/** Preview a single animation on one object (AnimatePanel on click) */
export function previewSingleObject(canvas: Canvas, obj: FabricObject, presetId: string): PlaybackHandle | null {
  const state = playSingle(canvas, obj, presetId);
  if (!state) return null;
  return {
    stop() {
      state.tweens.forEach((t) => t.kill());
      state.overlays.forEach((el) => el.remove());
      state.originals.forEach((props, o) => { for (const [k, v] of Object.entries(props)) o.set(k, v); o.setCoords(); });
      canvas.renderAll();
    },
  };
}

/** Play ALL animations on all canvas objects (header "Jouer" button) */
export function playPreview(canvas: Canvas): PlaybackHandle {
  const allTweens: gsap.core.Tween[] = [];
  const allOverlays: HTMLElement[] = [];
  const allOriginals = new Map<FabricObject, Props>();

  canvas.discardActiveObject();
  canvas.renderAll();

  for (const obj of canvas.getObjects()) {
    const data = (obj as unknown as Record<string, unknown>).data as Record<string, unknown> | undefined;
    const animId = data?.animationId as string | undefined;
    if (!animId) continue;
    const state = playSingle(canvas, obj, animId);
    if (!state) continue;
    allTweens.push(...state.tweens);
    allOverlays.push(...state.overlays);
    state.originals.forEach((v, k) => allOriginals.set(k, v));
  }

  return {
    stop() {
      allTweens.forEach((t) => t.kill());
      allOverlays.forEach((el) => el.remove());
      allOriginals.forEach((props, o) => { for (const [k, v] of Object.entries(props)) o.set(k, v); o.setCoords(); });
      canvas.renderAll();
    },
  };
}
