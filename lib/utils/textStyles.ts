import type { TextOverlayItem } from '@/lib/types';

type StyleProps = Partial<Pick<TextOverlayItem, 'fill' | 'stroke' | 'strokeWidth' | 'shadowColor' | 'shadowBlur'>>;

export interface TextStyleDef {
  id: string;
  label: string;
  props: StyleProps;
}

export const TEXT_STYLES: TextStyleDef[] = [
  { id: 'classic', label: 'Classic', props: { fill: '#ffffff', strokeWidth: 0, shadowBlur: 0 } },
  { id: 'neon', label: 'Neon', props: { fill: '#00ff88', stroke: '#00ff88', strokeWidth: 1, shadowColor: '#00ff88', shadowBlur: 15 } },
  { id: 'gold', label: 'Gold', props: { fill: '#FFD700', stroke: '#B8860B', strokeWidth: 2, shadowColor: '#000000', shadowBlur: 4 } },
  { id: 'shadow', label: 'Shadow', props: { fill: '#ffffff', strokeWidth: 0, shadowColor: '#000000', shadowBlur: 10 } },
  { id: 'bubbly', label: 'Bubbly', props: { fill: '#FF69B4', stroke: '#ffffff', strokeWidth: 3, shadowBlur: 0 } },
  { id: 'minimal', label: 'Minimal', props: { fill: '#cccccc', strokeWidth: 0, shadowBlur: 0 } },
  { id: 'dark_pill', label: 'Dark Pill', props: { fill: '#ffffff', stroke: '#000000', strokeWidth: 4, shadowColor: '#000000', shadowBlur: 8 } },
];

export const TEXT_ANIMATIONS = [
  { id: 'none', label: 'Aucune' },
  { id: 'fade', label: 'Fondu' },
  { id: 'slide_up', label: 'Glisser haut' },
  { id: 'slide_left', label: 'Glisser gauche' },
  { id: 'bounce', label: 'Rebond' },
  { id: 'zoom', label: 'Zoom' },
] as const;
