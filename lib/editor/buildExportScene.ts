/**
 * Construit le SceneGraph pour l'export a partir de l'etat du store.
 * Backward compatible — sans template, utilise les overlays/subtitles existants.
 */

import type { SceneGraph, TextLayer, Animation } from './sceneGraph';
import { createScene, addLayer } from './sceneGraph';
import type { TextOverlayItem, SubtitleSegment } from '@/lib/types';
import { getTemplate, type TemplateConfig } from './templates';

interface BuildOptions {
  duration: number;
  overlays: TextOverlayItem[];
  subtitles: SubtitleSegment[];
  templateId?: string;
  templateConfig?: TemplateConfig;
}

/**
 * Construit un SceneGraph pour l'export.
 * Si un templateId est fourni, utilise le template.
 * Sinon, convertit les overlays existants en TextLayers.
 */
export function buildExportScene(opts: BuildOptions): SceneGraph | null {
  // Mode template
  if (opts.templateId) {
    const tpl = getTemplate(opts.templateId);
    if (tpl && opts.templateConfig) {
      return tpl.build(opts.templateConfig);
    }
  }

  // Mode sans template — convertir les overlays existants en SceneGraph
  if (opts.overlays.length === 0) return null; // pas de scene, utiliser le rendu legacy

  let scene = createScene(opts.duration);

  for (const o of opts.overlays) {
    const anims: Animation[] = [];
    const anim = o.animation ?? 'none';
    if (anim === 'fade' || anim === 'fade_in') {
      anims.push({ property: 'opacity', from: 0, to: 1, startTime: 0, duration: 0.4, easing: 'easeOut' });
    } else if (anim === 'slide_up') {
      anims.push({ property: 'y', from: 0.03, to: 0, startTime: 0, duration: 0.4, easing: 'easeOut' });
      anims.push({ property: 'opacity', from: 0, to: 1, startTime: 0, duration: 0.3, easing: 'easeOut' });
    } else if (anim === 'scale_pop' || anim === 'zoom') {
      anims.push({ property: 'scale', from: 0.5, to: 1, startTime: 0, duration: 0.35, easing: 'easeOutBack' });
      anims.push({ property: 'opacity', from: 0, to: 1, startTime: 0, duration: 0.2, easing: 'easeOut' });
    } else if (anim === 'bounce') {
      anims.push({ property: 'scale', from: 0.3, to: 1, startTime: 0, duration: 0.5, easing: 'easeOutBounce' });
    }

    const layer: TextLayer = {
      id: o.id, type: 'text', startTime: o.startTime, endTime: o.endTime,
      zIndex: 10, position: { x: o.x, y: o.y }, animations: anims,
      text: o.text, fontFamily: o.fontFamily, fontSize: o.fontSize / 375 * 0.28,
      color: o.fill, align: 'center', maxWidthRatio: 0.85,
    };

    if (o.stroke && o.strokeWidth) {
      layer.stroke = { color: o.stroke, width: o.strokeWidth };
    }
    if (o.shadowColor && o.shadowBlur) {
      layer.shadow = { color: o.shadowColor, blur: o.shadowBlur, offsetX: 0, offsetY: 0 };
    }

    scene = addLayer(scene, layer);
  }

  return scene;
}
