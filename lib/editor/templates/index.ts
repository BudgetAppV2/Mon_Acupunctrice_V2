/**
 * Template System — 3 templates core combinant overlays + sous-titres + theme.
 * Chaque template genere un SceneGraph pre-configure.
 */

import type { SceneGraph, TextLayer, ShapeLayer, EffectLayer, Animation } from '../sceneGraph';
import { createScene, addLayer } from '../sceneGraph';
import type { SubtitleFamily } from '@/lib/types/editor';

export interface TemplateConfig {
  title: string;
  points?: string[];       // pour Enseigner/Aider
  quote?: string;           // pour Connecter/Inspirer
  attribution?: string;
  cta?: string;
  duration: number;
}

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  subtitleFamily: SubtitleFamily;
  palette: { primary: string; secondary: string; accent: string; bg: string; text: string };
  fonts: { title: string; body: string };
  build: (config: TemplateConfig) => SceneGraph;
}

// --- Template Enseigner ---
const enseigner: TemplateDef = {
  id: 'enseigner',
  name: 'Enseigner',
  description: 'Contenu educatif avec hook + points numerotes',
  subtitleFamily: 'narratif',
  palette: { primary: '#8A9A8A', secondary: '#3E5F4E', accent: '#C6A769', bg: '#F5F1E8', text: '#ffffff' },
  fonts: { title: 'Playfair Display', body: 'Inter' },
  build: (config) => {
    const d = config.duration;
    let scene = createScene(d);

    // Branding bar en haut
    scene = addLayer(scene, makeShape('branding-bg', 0, d, 10, { x: 0.5, y: 0.045 }, 0.35, 0.025, 'rgba(62, 95, 78, 0.85)', 20));
    scene = addLayer(scene, makeText('branding', 'M O N   A C U P U N C T R I C E', 0, d, 11, { x: 0.5, y: 0.038 }, 0.014, 'Inter', '#F5F1E8', 'center'));

    // Titre principal
    scene = addLayer(scene, makeText('title', config.title, 0, d * 0.15, 20, { x: 0.5, y: 0.12 }, 0.045, 'Playfair Display', '#ffffff', 'center',
      [fadeIn(0, 0.3), fadeOut(d * 0.13, 0.2)]));

    // Points numerotes
    if (config.points) {
      const segDur = (d * 0.7) / config.points.length;
      config.points.forEach((pt, i) => {
        const start = d * 0.15 + i * segDur;
        scene = addLayer(scene, makeShape(`pill-${i}`, start, start + segDur, 15,
          { x: 0.5, y: 0.65 + i * 0.001 }, 0.8, 0.045, 'rgba(245, 241, 232, 0.9)', 24));
        scene = addLayer(scene, makeText(`step-${i}`, `${i + 1}.  ${pt}`, start, start + segDur, 16,
          { x: 0.5, y: 0.645 + i * 0.001 }, 0.028, 'Inter', '#3E5F4E', 'center',
          [slideUp(0, 0.25)]));
      });
    }

    // CTA
    if (config.cta) {
      scene = addLayer(scene, makeShape('cta-bg', d * 0.85, d, 25, { x: 0.5, y: 0.88 }, 0.6, 0.04, 'rgba(198, 167, 105, 0.9)', 20));
      scene = addLayer(scene, makeText('cta', config.cta, d * 0.85, d, 26, { x: 0.5, y: 0.875 }, 0.022, 'Inter', '#ffffff', 'center', [fadeIn(0, 0.2)]));
    }

    // Vignette subtile
    scene = addLayer(scene, makeEffect('vignette', 0, d, 1, 'vignette', 0.4));
    return scene;
  },
};

// --- Template Connecter ---
const connecter: TemplateDef = {
  id: 'connecter',
  name: 'Connecter',
  description: 'Contenu personnel, citation intime',
  subtitleFamily: 'minimalWellness',
  palette: { primary: '#E8CFCF', secondary: '#F5E6E0', accent: '#6B4F4F', bg: '#FAF9F6', text: '#ffffff' },
  fonts: { title: 'Libre Baskerville', body: 'Inter' },
  build: (config) => {
    const d = config.duration;
    let scene = createScene(d);

    // Citation
    if (config.quote) {
      scene = addLayer(scene, makeText('quote', `\u201C${config.quote}\u201D`, d * 0.1, d * 0.7, 20,
        { x: 0.5, y: 0.3 }, 0.038, 'Libre Baskerville', '#ffffff', 'center',
        [fadeIn(0, 0.4)]));
      if (config.attribution) {
        scene = addLayer(scene, makeText('attr', `— ${config.attribution}`, d * 0.3, d * 0.7, 21,
          { x: 0.5, y: 0.5 }, 0.022, 'Inter', 'rgba(255,255,255,0.6)', 'center',
          [fadeIn(0, 0.3)]));
      }
    }

    // Gradient bas
    scene = addLayer(scene, makeEffect('gradient', 0, d, 1, 'gradient', 0.5));
    // Warm filter
    scene = addLayer(scene, makeEffect('warm', 0, d, 2, 'warmFilter', 0.6));
    return scene;
  },
};

// --- Template Aider ---
const aider: TemplateDef = {
  id: 'aider',
  name: 'Aider',
  description: 'Tutoriel pratique avec etapes bold',
  subtitleFamily: 'boldHighlight',
  palette: { primary: '#C47A5A', secondary: '#3E5F4E', accent: '#FF6B35', bg: '#FFFFFF', text: '#ffffff' },
  fonts: { title: 'Montserrat', body: 'Inter' },
  build: (config) => {
    const d = config.duration;
    let scene = createScene(d);

    // Hook titre
    scene = addLayer(scene, makeText('hook', config.title.toUpperCase(), 0, d * 0.12, 20,
      { x: 0.5, y: 0.25 }, 0.055, 'Montserrat', '#ffffff', 'center',
      [{ property: 'scale', from: 0.5, to: 1, startTime: 0, duration: 0.3, easing: 'easeOutBack' },
       { property: 'opacity', from: 0, to: 1, startTime: 0, duration: 0.2, easing: 'easeOut' }]));

    // Etapes bold
    if (config.points) {
      const segDur = (d * 0.7) / config.points.length;
      config.points.forEach((pt, i) => {
        const start = d * 0.15 + i * segDur;
        scene = addLayer(scene, makeText(`step-${i}`, pt.toUpperCase(), start, start + segDur, 20,
          { x: 0.5, y: 0.5 }, 0.042, 'Montserrat', '#ffffff', 'center',
          [{ property: 'scale', from: 0.3, to: 1, startTime: 0, duration: 0.25, easing: 'easeOutBack' },
           { property: 'opacity', from: 0, to: 1, startTime: 0, duration: 0.2, easing: 'easeOut' }]));
      });
    }

    // CTA
    if (config.cta) {
      scene = addLayer(scene, makeShape('cta-bg', d * 0.85, d, 25, { x: 0.5, y: 0.88 }, 0.55, 0.04, '#FF6B35', 20));
      scene = addLayer(scene, makeText('cta', config.cta, d * 0.85, d, 26, { x: 0.5, y: 0.875 }, 0.022, 'Inter', '#ffffff', 'center', [fadeIn(0, 0.2)]));
    }

    scene = addLayer(scene, makeEffect('vignette', 0, d, 1, 'vignette', 0.3));
    return scene;
  },
};

export const TEMPLATES: TemplateDef[] = [enseigner, connecter, aider];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find(t => t.id === id);
}

// --- Helpers ---

function makeText(
  id: string, text: string, start: number, end: number, z: number,
  pos: { x: number; y: number }, fontSize: number, font: string,
  color: string, align: CanvasTextAlign, anims: Animation[] = [],
): TextLayer {
  return { id, type: 'text', startTime: start, endTime: end, zIndex: z, position: pos, animations: anims,
    text, fontFamily: font, fontSize, color, align, maxWidthRatio: 0.85 };
}

function makeShape(
  id: string, start: number, end: number, z: number,
  pos: { x: number; y: number }, width: number, height: number,
  fill: string, cornerRadius: number, anims: Animation[] = [],
): ShapeLayer {
  return { id, type: 'shape', startTime: start, endTime: end, zIndex: z, position: pos, animations: anims,
    shape: 'roundRect', width, height, fill, cornerRadius };
}

function makeEffect(id: string, start: number, end: number, z: number, effect: EffectLayer['effect'], intensity: number): EffectLayer {
  return { id, type: 'effect', startTime: start, endTime: end, zIndex: z, position: { x: 0, y: 0 }, animations: [], effect, intensity };
}

function fadeIn(start: number, dur: number): Animation {
  return { property: 'opacity', from: 0, to: 1, startTime: start, duration: dur, easing: 'easeOut' };
}

function fadeOut(start: number, dur: number): Animation {
  return { property: 'opacity', from: 1, to: 0, startTime: start, duration: dur, easing: 'easeIn' };
}

function slideUp(start: number, dur: number): Animation {
  return { property: 'y', from: 0.03, to: 0, startTime: start, duration: dur, easing: 'easeOut' };
}
