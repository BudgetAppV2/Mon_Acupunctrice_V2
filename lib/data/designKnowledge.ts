/**
 * designKnowledge.ts — Knowledge base de design graphique pour vidéo mobile
 *
 * Source de vérité pour les règles de design, palettes, fonts, et contraintes
 * utilisées par le système de thèmes (VideoTheme) et l'agent directeur artistique.
 *
 * Basé sur les recherches :
 * - EDITOR_PRO_DEEP_RESEARCH.md (30 fonts, effets Canvas)
 * - DESIGN_AGENT_RESEARCH.md (palettes santé/bien-être, safe zones)
 * - EDITOR_PRO_ARCHITECTURE_REVIEW.md (review Gemini, contraste WCAG)
 */

// ─────────────────────────────────────────────
// SAFE ZONES (1080×1920)
// ─────────────────────────────────────────────

export const SAFE_ZONES = {
  /** Zone sûre pour le texte — évite les cropping Instagram/TikTok */
  top: 108,        // Username + icônes
  bottom: 320,     // CTA, boutons like/comment/share, caption
  left: 60,        // Marge latérale
  right: 120,      // Icônes droite (like, comment, share, bookmark)
  /** Zone "titre" idéale — centre supérieur */
  titleY: { min: 200, max: 600 },
  /** Zone "sous-titres" idéale — centre inférieur */
  subtitleY: { min: 1200, max: 1600 },
} as const;

export const CANVAS = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// ─────────────────────────────────────────────
// TYPOGRAPHIE
// ─────────────────────────────────────────────

export const FONT_MIN_SIZE = 45; // px minimum pour lisibilité mobile
export const SUBTITLE_MIN_SIZE = 48; // px minimum sous-titres (confirmé par données terrain)
export const HOOK_MIN_SIZE = 60; // px minimum hooks (gros texte, bold condensé)

// Règles de design validées par les données terrain (VISUAL_ANALYSIS_RESEARCH.md)
export const DESIGN_RULES = {
  /** Stroke minimum 2px noir sur tout texte vidéo (non négociable) */
  minStrokeWidth: 2,
  /** Hooks : toujours majuscules + font bold condensée */
  hookUppercase: true,
  /** 1 animation max par élément */
  maxAnimationsPerElement: 1,
  /** Sous-titres dans 80% des Reels performants */
  subtitlesRecommended: true,
  /** Hook dans les 2 premières secondes */
  hookMaxDelay: 2,
  /** Filtre warm subtil pour 3/4 des contenus santé */
  defaultFilterWarm: true,
  /** CTA avec background pill = tendance montante */
  ctaUsePill: true,
} as const;

export interface FontDef {
  family: string;
  category: 'impact' | 'elegant' | 'modern' | 'cursive' | 'fun';
  weight: number;
  googleUrl: string;
}

export const FONTS: FontDef[] = [
  // Impact (titres gras)
  { family: 'Bebas Neue', category: 'impact', weight: 400, googleUrl: 'Bebas+Neue' },
  { family: 'Anton', category: 'impact', weight: 400, googleUrl: 'Anton' },
  { family: 'Oswald', category: 'impact', weight: 700, googleUrl: 'Oswald:wght@700' },
  { family: 'Archivo Black', category: 'impact', weight: 400, googleUrl: 'Archivo+Black' },

  // Élégant (serif, editorial)
  { family: 'Playfair Display', category: 'elegant', weight: 700, googleUrl: 'Playfair+Display:wght@700' },
  { family: 'DM Serif Display', category: 'elegant', weight: 400, googleUrl: 'DM+Serif+Display' },
  { family: 'Lora', category: 'elegant', weight: 600, googleUrl: 'Lora:wght@600' },

  // Moderne (sans-serif clean)
  { family: 'Montserrat', category: 'modern', weight: 700, googleUrl: 'Montserrat:wght@700' },
  { family: 'Poppins', category: 'modern', weight: 600, googleUrl: 'Poppins:wght@600' },
  { family: 'Inter', category: 'modern', weight: 600, googleUrl: 'Inter:wght@600' },
  { family: 'Nunito', category: 'modern', weight: 700, googleUrl: 'Nunito:wght@700' },

  // Cursif (handwritten, script)
  { family: 'Dancing Script', category: 'cursive', weight: 700, googleUrl: 'Dancing+Script:wght@700' },
  { family: 'Caveat', category: 'cursive', weight: 700, googleUrl: 'Caveat:wght@700' },
  { family: 'Sacramento', category: 'cursive', weight: 400, googleUrl: 'Sacramento' },

  // Fun (decoratif)
  { family: 'Permanent Marker', category: 'fun', weight: 400, googleUrl: 'Permanent+Marker' },
];

export const FONT_CATEGORIES = [
  { id: 'impact', label: 'Impact' },
  { id: 'elegant', label: 'Élégant' },
  { id: 'modern', label: 'Moderne' },
  { id: 'cursive', label: 'Cursif' },
  { id: 'fun', label: 'Fun' },
] as const;

/** Pairings de fonts validés (titre + corps) */
export const FONT_PAIRINGS: { title: string; body: string; usage: string }[] = [
  { title: 'Bebas Neue', body: 'Inter', usage: 'Éducatif, tutoriel' },
  { title: 'Playfair Display', body: 'Lora', usage: 'Inspirant, émotionnel' },
  { title: 'Montserrat', body: 'Nunito', usage: 'Moderne, professionnel' },
  { title: 'DM Serif Display', body: 'Poppins', usage: 'Santé, bien-être' },
  { title: 'Anton', body: 'Inter', usage: 'Bold, énergique' },
  { title: 'Dancing Script', body: 'Lora', usage: 'Personnel, chaleureux' },
];

// ─────────────────────────────────────────────
// PALETTES DE COULEURS
// ─────────────────────────────────────────────

export interface ColorPalette {
  id: string;
  name: string;
  text: string;         // Couleur texte principale
  accent: string;       // Couleur accent (karaoké, CTA)
  background: string;   // Fond semi-transparent pour pills/blocs
  stroke: string;       // Contour du texte
}

export const PALETTES: ColorPalette[] = [
  {
    id: 'sage_naturel',
    name: 'Sage Naturel',
    text: '#FFFFFF',
    accent: '#5C7A5F',     // sage (couleur de marque Judith)
    background: 'rgba(92, 122, 95, 0.75)',
    stroke: '#2D3E2F',
  },
  {
    id: 'terre_chaleur',
    name: 'Terre & Chaleur',
    text: '#FFFFFF',
    accent: '#B07D4F',     // terracotta plus foncé (contraste 3.2:1 sur blanc)
    background: 'rgba(196, 149, 106, 0.7)',
    stroke: '#5C3D21',
  },
  {
    id: 'ocean_calm',
    name: 'Océan Calme',
    text: '#FFFFFF',
    accent: '#6B8F71',     // vert terreux (ajusté — le teal est moins courant en MTC)
    background: 'rgba(107, 143, 113, 0.7)',
    stroke: '#2A4F3F',
  },
  {
    id: 'minimal_pro',
    name: 'Minimal Pro',
    text: '#1A1A1A',
    accent: '#5C7A5F',     // sage (assez foncé pour contraster sur blanc)
    background: 'rgba(255, 255, 255, 0.85)',
    stroke: '#FFFFFF',     // stroke BLANC sur texte foncé (pas noir sur noir!)
  },
  {
    id: 'sunset_healing',
    name: 'Sunset Healing',
    text: '#FFFFFF',
    accent: '#C48A5C',     // pêche plus foncé (contraste 3.0+ sur blanc)
    background: 'rgba(232, 168, 124, 0.7)',
    stroke: '#6B3A24',
  },
  {
    id: 'dark_clinic',
    name: 'Dark Clinic',
    text: '#FFFFFF',
    accent: '#87A878',     // sage sur fond sombre
    background: 'rgba(26, 26, 46, 0.85)',
    stroke: '#000000',
  },
  {
    id: 'pantone_2026',
    name: 'Pantone 2026',
    text: '#FFFFFF',       // blanc sur fond sombre (vidéo) avec stroke charcoal
    accent: '#5C7A5F',     // sage green (Pantone complementary, assez foncé)
    background: 'rgba(245, 240, 235, 0.9)', // Cloud Dancer off-white
    stroke: '#2D3436',     // charcoal foncé pour le contraste
  },
];

// ─────────────────────────────────────────────
// CONTRASTE ET ACCESSIBILITÉ
// ─────────────────────────────────────────────

/**
 * Calcule le ratio de contraste WCAG entre deux couleurs hex.
 * Retourne un ratio >= 1. WCAG AA exige >= 4.5 pour le texte normal.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const rgb = [
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    ].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Ratio minimum WCAG AA pour le texte sur vidéo */
export const WCAG_MIN_CONTRAST = 4.5;

// ─────────────────────────────────────────────
// STYLES DE SOUS-TITRES
// ─────────────────────────────────────────────

export const SUBTITLE_STYLES = [
  'classic',        // Blanc, ombre portée
  'tiktok',         // Style TikTok
  'karaoke',        // Mot actif en surbrillance (existant)
  'bold_outline',   // Gros texte, contour noir épais
  'pill',           // Fond coloré arrondi par ligne
  'karaoke_pro',    // Karaoké amélioré (scale 1.1 + accent color)
] as const;

export type SubtitleStyleV2 = typeof SUBTITLE_STYLES[number];

// ─────────────────────────────────────────────
// EFFETS TEXTE
// ─────────────────────────────────────────────

export const TEXT_EFFECTS = [
  'none',           // Texte brut
  'outline',        // Contour simple
  'double_outline', // Double contour (blanc + noir)
  'glow',           // Lueur néon
  'pill',           // Fond arrondi derrière le texte
] as const;

export type TextEffectType = typeof TEXT_EFFECTS[number];

// ─────────────────────────────────────────────
// ANIMATIONS TEXTE
// ─────────────────────────────────────────────

export const TEXT_ANIMATIONS = [
  'none',
  'fade_in',
  'typewriter',
  'scale_pop',
  'slide_up',
  'bounce',
] as const;

export type TextAnimationType = typeof TEXT_ANIMATIONS[number];

// ─────────────────────────────────────────────
// FILTRES CSS
// ─────────────────────────────────────────────

export interface FilterPreset {
  id: string;
  label: string;
  css: string;
}

export const FILTERS_V2: FilterPreset[] = [
  { id: 'normal', label: 'Normal', css: 'none' },
  { id: 'warm', label: 'Chaud', css: 'brightness(1.05) contrast(1.1) saturate(1.2) sepia(0.1)' },
  { id: 'cool', label: 'Froid', css: 'brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(10deg)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.3) contrast(1.1) brightness(0.95) saturate(0.8)' },
  { id: 'high_contrast', label: 'Contraste+', css: 'contrast(1.3) brightness(1.05) saturate(1.1)' },
  { id: 'soft', label: 'Doux', css: 'brightness(1.1) contrast(0.95) saturate(1.05)' },
  { id: 'dramatic', label: 'Dramatique', css: 'contrast(1.25) brightness(0.9) saturate(1.3)' },
  { id: 'pastel', label: 'Pastel', css: 'brightness(1.15) contrast(0.85) saturate(0.7)' },
  { id: 'bw', label: 'N&B', css: 'grayscale(1) contrast(1.2) brightness(1.05)' },
  { id: 'bw_warm', label: 'N&B chaud', css: 'grayscale(1) sepia(0.15) contrast(1.15)' },
];

// ─────────────────────────────────────────────
// WORD WRAP CANVAS
// ─────────────────────────────────────────────

/**
 * Dessine du texte avec retour à la ligne automatique sur un Canvas.
 * Retourne le nombre de lignes dessinées.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center',
): number {
  ctx.textAlign = align;
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = words[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  // Dernière ligne
  ctx.fillText(line, x, y + lineCount * lineHeight);
  return lineCount + 1;
}

/**
 * Mesure la hauteur totale du texte wrappé (sans le dessiner).
 */
export function measureWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      line = words[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  return (lineCount + 1) * lineHeight;
}
