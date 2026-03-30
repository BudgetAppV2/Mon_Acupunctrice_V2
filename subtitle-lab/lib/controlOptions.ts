import type { AnimationType } from './types';

export const FONT_FAMILIES = [
  'Inter',
  'Archivo Black',
  'Poppins',
  'Space Grotesk',
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
  'Manrope',
  'DM Sans',
  'Oswald',
  'Caveat',
  'Kalam',
];

export const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'fade', label: 'Fondu' },
  { value: 'pop', label: 'Pop' },
  { value: 'slide-up', label: 'Glissement haut' },
  { value: 'typewriter', label: 'Machine à écrire' },
  { value: 'karaoke', label: 'Karaoké' },
  { value: 'bounce', label: 'Rebond' },
  { value: 'neon-pulse', label: 'Néon pulse' },
];
