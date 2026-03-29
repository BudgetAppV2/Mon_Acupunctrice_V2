/**
 * fontPack.ts — Pack de fonts pro pour les sous-titres.
 * Source de vérité pour FONT_OPTIONS et TEXT_STYLE_PRESETS.
 */

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
  category: 'impact' | 'elegant' | 'modern' | 'creative';
  weights: number[];
  fallback: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'inter', label: 'Inter', fontFamily: 'Inter', category: 'impact', weights: [400, 600, 700, 900], fallback: 'sans-serif' },
  { id: 'archivo-black', label: 'Archivo Black', fontFamily: 'Archivo Black', category: 'impact', weights: [400], fallback: 'sans-serif' },
  { id: 'poppins', label: 'Poppins', fontFamily: 'Poppins', category: 'impact', weights: [400, 600, 700, 900], fallback: 'sans-serif' },
  { id: 'space-grotesk', label: 'Space Grotesk', fontFamily: 'Space Grotesk', category: 'impact', weights: [400, 500, 700], fallback: 'sans-serif' },
  { id: 'playfair', label: 'Playfair Display', fontFamily: 'Playfair Display', category: 'elegant', weights: [400, 700], fallback: 'serif' },
  { id: 'cormorant', label: 'Cormorant Garamond', fontFamily: 'Cormorant Garamond', category: 'elegant', weights: [400, 600], fallback: 'serif' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', fontFamily: 'Libre Baskerville', category: 'elegant', weights: [400, 700], fallback: 'serif' },
  { id: 'manrope', label: 'Manrope', fontFamily: 'Manrope', category: 'modern', weights: [300, 400, 600, 700], fallback: 'sans-serif' },
  { id: 'dm-sans', label: 'DM Sans', fontFamily: 'DM Sans', category: 'modern', weights: [400, 500, 700], fallback: 'sans-serif' },
  { id: 'oswald', label: 'Oswald', fontFamily: 'Oswald', category: 'modern', weights: [400, 600, 700], fallback: 'sans-serif' },
  { id: 'caveat', label: 'Caveat', fontFamily: 'Caveat', category: 'creative', weights: [400, 700], fallback: 'cursive' },
  { id: 'kalam', label: 'Kalam', fontFamily: 'Kalam', category: 'creative', weights: [400, 700], fallback: 'cursive' },
];

export const FONT_CATEGORY_LABELS: Record<FontOption['category'], string> = {
  impact: 'Impact',
  elegant: 'Élégant',
  modern: 'Moderne',
  creative: 'Créatif',
};

export interface TextStylePreset {
  id: string;
  label: string;
  category: 'subtitle' | 'hook' | 'quote' | 'creative';
  fontFamily: string;
  fontWeight: number;
  /** Multiplicateur relatif de la fontSize par défaut (1 = neutre) */
  fontSize: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase';
  color: string;
  strokeWidth?: number;
  strokeColor?: string;
  shadowBlur?: number;
  shadowColor?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    id: 'bold-subtitle', label: 'Bold Subtitle', category: 'subtitle',
    fontFamily: 'Archivo Black', fontWeight: 400, fontSize: 1.1, letterSpacing: 0,
    textTransform: 'uppercase', color: '#FFFFFF', strokeWidth: 3, strokeColor: '#000000',
  },
  {
    id: 'clean-subtitle', label: 'Clean Subtitle', category: 'subtitle',
    fontFamily: 'Inter', fontWeight: 600, fontSize: 1, letterSpacing: 0.02,
    textTransform: 'none', color: '#FFFFFF', shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.8)',
  },
  {
    id: 'highlight-caption', label: 'Highlight Caption', category: 'subtitle',
    fontFamily: 'Poppins', fontWeight: 700, fontSize: 1.05, letterSpacing: 0,
    textTransform: 'none', color: '#1A1A1A', backgroundColor: 'rgba(255,230,0,0.85)',
    padding: 6, borderRadius: 6,
  },
  {
    id: 'promo-hook', label: 'Promo Hook', category: 'hook',
    fontFamily: 'Oswald', fontWeight: 700, fontSize: 1.1, letterSpacing: -0.02,
    textTransform: 'uppercase', color: '#FFFFFF', strokeWidth: 2, strokeColor: '#000000',
  },
  {
    id: 'authority-title', label: 'Authority Title', category: 'hook',
    fontFamily: 'DM Sans', fontWeight: 700, fontSize: 1, letterSpacing: 0.04,
    textTransform: 'none', color: '#FFFFFF', shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.9)',
  },
  {
    id: 'editorial-punch', label: 'Editorial Punch', category: 'hook',
    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 1.1, letterSpacing: -0.01,
    textTransform: 'none', color: '#FFFFFF', strokeWidth: 2, strokeColor: '#000000',
  },
  {
    id: 'elegant-quote', label: 'Elegant Quote', category: 'quote',
    fontFamily: 'Playfair Display', fontWeight: 400, fontSize: 0.95, letterSpacing: 0.01,
    textTransform: 'none', color: '#F5E6C8',
  },
  {
    id: 'soft-feminine', label: 'Soft Feminine', category: 'quote',
    fontFamily: 'Cormorant Garamond', fontWeight: 400, fontSize: 0.95, letterSpacing: 0.02,
    textTransform: 'none', color: '#FFFFFF', shadowBlur: 3, shadowColor: 'rgba(0,0,0,0.5)',
  },
  {
    id: 'luxe-minimal', label: 'Luxe Minimal', category: 'quote',
    fontFamily: 'Manrope', fontWeight: 300, fontSize: 0.9, letterSpacing: 0.08,
    textTransform: 'none', color: '#FFFFFF',
  },
  {
    id: 'handwritten-accent', label: 'Handwritten Accent', category: 'creative',
    fontFamily: 'Caveat', fontWeight: 700, fontSize: 1.15, letterSpacing: 0,
    textTransform: 'none', color: '#FFD166',
  },
  {
    id: 'story-note', label: 'Story Note', category: 'creative',
    fontFamily: 'Kalam', fontWeight: 400, fontSize: 1.05, letterSpacing: 0,
    textTransform: 'none', color: '#FFFFFF', shadowBlur: 3, shadowColor: 'rgba(0,0,0,0.6)',
  },
  {
    id: 'bold-poster', label: 'Bold Poster', category: 'creative',
    fontFamily: 'Archivo Black', fontWeight: 400, fontSize: 1.2, letterSpacing: 0.02,
    textTransform: 'uppercase', color: '#FFFFFF', strokeWidth: 4, strokeColor: '#000000',
    shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.5)',
  },
];
