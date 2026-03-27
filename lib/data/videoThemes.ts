/**
 * videoThemes.ts — Thèmes vidéo prédéfinis pour Mon Acupunctrice Hub
 *
 * Chaque thème contrôle l'esthétique complète d'une vidéo en 1 tap :
 * font titre + font sous-titres + style sous-titres + filtre + palette + animation
 *
 * Basé sur les pairings validés dans designKnowledge.ts et la review Gemini
 * (Thèmes > Options individuelles).
 */

import type { SubtitleStyleV2, TextEffectType, TextAnimationType, FilterPreset } from './designKnowledge';
import { PALETTES, FILTERS_V2 } from './designKnowledge';

export interface VideoTheme {
  id: string;
  name: string;
  description: string;
  /** Font pour les titres/overlays */
  fontTitle: string;
  /** Font pour les sous-titres */
  fontSubtitle: string;
  /** Style de sous-titres */
  subtitleStyle: SubtitleStyleV2;
  /** ID de la palette de couleurs */
  paletteId: string;
  /** ID du filtre CSS */
  filterId: string;
  /** Animation par défaut pour les overlays texte */
  defaultAnimation: TextAnimationType;
  /** Effet texte par défaut pour les overlays */
  defaultTextEffect: TextEffectType;
  /** Taille de font titre par défaut (px sur canvas 1080) */
  titleFontSize: number;
  /** Taille de font sous-titres par défaut (px sur canvas 1080) */
  subtitleFontSize: number;
}

export const VIDEO_THEMES: VideoTheme[] = [
  {
    id: 'sage_zen',
    name: 'Sage & Zen',
    description: 'Le style signature de Judith — naturel, chaleureux, professionnel',
    fontTitle: 'DM Serif Display',
    fontSubtitle: 'Poppins',
    subtitleStyle: 'karaoke_pro',
    paletteId: 'sage_naturel',
    filterId: 'warm',
    defaultAnimation: 'fade_in',
    defaultTextEffect: 'outline',
    titleFontSize: 72,
    subtitleFontSize: 52,
  },
  {
    id: 'minimal_chic',
    name: 'Minimal Chic',
    description: 'Épuré, moderne, professionnel — idéal pour enseigner',
    fontTitle: 'Montserrat',
    fontSubtitle: 'Inter',
    subtitleStyle: 'pill',
    paletteId: 'minimal_pro',
    filterId: 'normal',
    defaultAnimation: 'slide_up',
    defaultTextEffect: 'pill',
    titleFontSize: 64,
    subtitleFontSize: 48,
  },
  {
    id: 'terre_warm',
    name: 'Terre & Chaleur',
    description: 'Tons chauds terreux — connecte avec authenticité',
    fontTitle: 'Playfair Display',
    fontSubtitle: 'Lora',
    subtitleStyle: 'bold_outline',
    paletteId: 'terre_chaleur',
    filterId: 'warm',
    defaultAnimation: 'fade_in',
    defaultTextEffect: 'double_outline',
    titleFontSize: 68,
    subtitleFontSize: 50,
  },
  {
    id: 'bold_energy',
    name: 'Bold Énergie',
    description: 'Impact fort — attire l\'attention, idéal pour les hooks',
    fontTitle: 'Bebas Neue',
    fontSubtitle: 'Inter',
    subtitleStyle: 'karaoke_pro',
    paletteId: 'sunset_healing',
    filterId: 'high_contrast',
    defaultAnimation: 'scale_pop',
    defaultTextEffect: 'glow',
    titleFontSize: 84,
    subtitleFontSize: 54,
  },
  {
    id: 'ocean_doux',
    name: 'Océan Doux',
    description: 'Calme et apaisant — parfait pour inspirer et aider',
    fontTitle: 'Dancing Script',
    fontSubtitle: 'Nunito',
    subtitleStyle: 'pill',
    paletteId: 'ocean_calm',
    filterId: 'soft',
    defaultAnimation: 'fade_in',
    defaultTextEffect: 'pill',
    titleFontSize: 72,
    subtitleFontSize: 48,
  },
  {
    id: 'pantone_2026',
    name: 'Pantone 2026',
    description: 'Cloud Dancer + sage — la tendance mondiale 2026, minimalisme maximal',
    fontTitle: 'DM Serif Display',
    fontSubtitle: 'Inter',
    subtitleStyle: 'pill',
    paletteId: 'pantone_2026',
    filterId: 'normal',
    defaultAnimation: 'fade_in',
    defaultTextEffect: 'pill',
    titleFontSize: 68,
    subtitleFontSize: 48,
  },
  {
    id: 'raw_authentic',
    name: 'Raw Authentique',
    description: 'Zéro filtre, sous-titres bold outline — l\'authenticité est le nouveau luxe',
    fontTitle: 'Anton',
    fontSubtitle: 'Inter',
    subtitleStyle: 'bold_outline',
    paletteId: 'sage_naturel',
    filterId: 'normal',
    defaultAnimation: 'none',
    defaultTextEffect: 'outline',
    titleFontSize: 72,
    subtitleFontSize: 52,
  },
  {
    id: 'dark_clinic',
    name: 'Dark Clinic',
    description: 'Fond sombre, texte clair — crédibilité et expertise médicale',
    fontTitle: 'Montserrat',
    fontSubtitle: 'Poppins',
    subtitleStyle: 'karaoke_pro',
    paletteId: 'dark_clinic',
    filterId: 'dramatic',
    defaultAnimation: 'fade_in',
    defaultTextEffect: 'glow',
    titleFontSize: 64,
    subtitleFontSize: 50,
  },
];

/**
 * Retourne le thème par ID ou le thème par défaut (sage_zen).
 */
export function getTheme(id: string): VideoTheme {
  return VIDEO_THEMES.find(t => t.id === id) || VIDEO_THEMES[0];
}

/**
 * Retourne la palette de couleurs associée au thème.
 */
export function getThemePalette(theme: VideoTheme) {
  return PALETTES.find(p => p.id === theme.paletteId) || PALETTES[0];
}

/**
 * Retourne le filtre CSS associé au thème.
 */
export function getThemeFilter(theme: VideoTheme): FilterPreset {
  return FILTERS_V2.find(f => f.id === theme.filterId) || FILTERS_V2[0];
}
