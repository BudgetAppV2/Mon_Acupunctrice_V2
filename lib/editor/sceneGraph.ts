/**
 * Scene Graph — structure declarative pour le rendu video.
 * Chaque SceneLayer represente un element visuel avec position, timing, et animations.
 */

// --- Easing ---

export type EasingType =
  | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  | 'easeOutBack' | 'easeOutBounce' | 'easeOutElastic'
  | 'spring' | 'snap' | 'smooth';

export const easings: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t) => { const c = 1.70158 + 1; return 1 + c * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2); },
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  spring: (t) => 1 - Math.pow(Math.E, -6 * t) * Math.cos(6 * t),
  snap: (t) => { const p = easings.easeOut(t); return p < 0.5 ? p * 2 : 1; },
  smooth: (t) => t * t * (3 - 2 * t),
};

// --- Animation ---

export type AnimatableProperty = 'opacity' | 'x' | 'y' | 'scale' | 'rotation' | 'blur';

export interface Animation {
  property: AnimatableProperty;
  from: number;
  to: number;
  /** Temps de debut relatif au layer startTime (en secondes) */
  startTime: number;
  duration: number;
  easing: EasingType;
}

/** Resout la valeur d'une propriete animee a un instant t (absolu) */
export function resolveAnimation(anims: Animation[], property: AnimatableProperty, layerStart: number, time: number, defaultValue: number): number {
  const matching = anims.filter(a => a.property === property);
  if (matching.length === 0) return defaultValue;
  let value = defaultValue;
  for (const a of matching) {
    const absStart = layerStart + a.startTime;
    const absEnd = absStart + a.duration;
    if (time < absStart) continue;
    if (time >= absEnd) { value = a.to; continue; }
    const progress = (time - absStart) / a.duration;
    const eased = easings[a.easing](progress);
    value = a.from + (a.to - a.from) * eased;
  }
  return value;
}

// --- Layer types ---

export type LayerType = 'video' | 'text' | 'shape' | 'subtitle' | 'overlay' | 'effect';

export type SubtitlePosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface BaseLayer {
  id: string;
  type: LayerType;
  startTime: number;
  endTime: number;
  zIndex: number;
  position: { x: number; y: number }; // ratio 0-1
  animations: Animation[];
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number; // ratio de la largeur (ex: 0.05 = 5% de W)
  color: string;
  stroke?: { color: string; width: number };
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  align: CanvasTextAlign;
  maxWidthRatio: number; // ratio de W pour le word-wrap
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rect' | 'roundRect' | 'circle' | 'line';
  width: number; // ratio
  height: number; // ratio
  fill: string;
  cornerRadius?: number; // px
  strokeColor?: string;
  strokeWidth?: number;
}

export interface EffectLayer extends BaseLayer {
  type: 'effect';
  effect: 'grain' | 'vignette' | 'gradient' | 'warmFilter';
  intensity: number; // 0-1
  config?: Record<string, number | string>;
}

export interface SubtitleLayer extends BaseLayer {
  type: 'subtitle';
  /** Rendered by the subtitle engine — this layer is a placeholder for timing/position */
  subtitleFamily: 'narratif' | 'boldHighlight' | 'minimalWellness';
}

export type SceneLayer = TextLayer | ShapeLayer | EffectLayer | SubtitleLayer | BaseLayer;

export interface SceneGraph {
  layers: SceneLayer[];
  /** Duree totale de la scene en secondes */
  duration: number;
  /** Fond — le video layer est implicite (toujours la couche 0) */
  background?: string;
}

/** Cree un SceneGraph vide */
export function createScene(duration: number): SceneGraph {
  return { layers: [], duration };
}

/** Ajoute un layer au scene graph */
export function addLayer(scene: SceneGraph, layer: SceneLayer): SceneGraph {
  return { ...scene, layers: [...scene.layers, layer].sort((a, b) => a.zIndex - b.zIndex) };
}
