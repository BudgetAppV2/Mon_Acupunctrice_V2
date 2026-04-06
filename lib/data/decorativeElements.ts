/**
 * 20 decorative SVG elements for the image editor.
 * 4 categories: art-nouveau, botanique, wellness, ornement.
 * Source: subtitle-lab/fabric-presets/chatgpt-decorative-elements.json
 */

export interface DecorativeElement {
  name: string;
  category: string;
  svgPath: string;
  viewBox: string;
  defaultFill: string;
  defaultStroke?: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const DECORATIVE_CATEGORIES = [
  { id: 'art-nouveau', label: 'Art Nouveau' },
  { id: 'botanique', label: 'Botanique' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'ornement', label: 'Ornement' },
];

export const DECORATIVE_ELEMENTS: DecorativeElement[] = [
  // Art Nouveau
  { name: 'Cadre Art Nouveau', category: 'art-nouveau', svgPath: 'M10 10 Q5 30 10 50 Q5 70 10 90 L90 90 Q95 70 90 50 Q95 30 90 10 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Bordure florale', category: 'art-nouveau', svgPath: 'M0 40 Q20 20 40 40 Q60 60 80 40 Q90 30 100 40 L100 60 L0 60 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 80 },
  { name: 'Separateur liane', category: 'art-nouveau', svgPath: 'M0 50 Q20 30 40 50 Q60 70 80 50 Q90 40 100 50 M30 50 Q25 40 20 50 M70 50 Q75 60 80 50', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 40 },
  { name: 'Coin floral', category: 'art-nouveau', svgPath: 'M0 0 Q30 10 40 40 Q10 30 0 60 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 100, defaultHeight: 100 },
  { name: 'Medaillon ovale', category: 'art-nouveau', svgPath: 'M50 10 Q80 20 90 50 Q80 80 50 90 Q20 80 10 50 Q20 20 50 10 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 120 },
  // Botanique
  { name: 'Branche eucalyptus', category: 'botanique', svgPath: 'M10 80 Q30 60 50 40 Q70 20 90 10 M40 50 Q35 45 30 50 M60 30 Q65 25 70 30', viewBox: '0 0 100 100', defaultFill: '#5C7A5F', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Couronne feuilles', category: 'botanique', svgPath: 'M20 70 Q50 30 80 70 M30 65 Q50 45 70 65', viewBox: '0 0 100 100', defaultFill: '#5C7A5F', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Lavande', category: 'botanique', svgPath: 'M50 80 L50 20 M50 20 Q45 25 50 30 Q55 35 50 40 Q45 45 50 50', viewBox: '0 0 100 100', defaultFill: '#5C7A5F', defaultWidth: 100, defaultHeight: 120 },
  { name: 'Feuille monstera', category: 'botanique', svgPath: 'M50 10 Q80 30 70 70 Q50 90 30 70 Q20 30 50 10 M50 30 L50 70 M40 40 L30 50 M60 40 L70 50', viewBox: '0 0 100 100', defaultFill: '#5C7A5F', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Branche cerisier', category: 'botanique', svgPath: 'M10 60 Q40 40 80 20 M40 40 Q45 35 50 40 Q45 45 40 40 M60 30 Q65 25 70 30 Q65 35 60 30', viewBox: '0 0 100 100', defaultFill: '#5C7A5F', defaultWidth: 120, defaultHeight: 120 },
  // Wellness
  { name: 'Mandala', category: 'wellness', svgPath: 'M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z', viewBox: '0 0 100 100', defaultFill: '#7EBEC5', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Lotus symetrique', category: 'wellness', svgPath: 'M50 70 Q30 50 50 30 Q70 50 50 70 M30 60 Q20 50 30 40 M70 60 Q80 50 70 40', viewBox: '0 0 100 100', defaultFill: '#7EBEC5', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Vague zen', category: 'wellness', svgPath: 'M0 60 Q20 40 40 60 Q60 80 80 60 Q90 50 100 60', viewBox: '0 0 100 100', defaultFill: '#7EBEC5', defaultWidth: 120, defaultHeight: 80 },
  { name: 'Yin Yang floral', category: 'wellness', svgPath: 'M50 10 Q80 30 50 50 Q20 70 50 90 Q80 70 50 50 Q20 30 50 10', viewBox: '0 0 100 100', defaultFill: '#7EBEC5', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Pierres spa', category: 'wellness', svgPath: 'M50 80 Q30 70 50 60 Q70 70 50 80 M50 60 Q30 50 50 40 Q70 50 50 60 M50 40 Q35 30 50 20 Q65 30 50 40', viewBox: '0 0 100 100', defaultFill: '#7EBEC5', defaultWidth: 120, defaultHeight: 120 },
  // Ornement
  { name: 'Separateur diamant', category: 'ornement', svgPath: 'M0 50 L40 50 L50 40 L60 50 L100 50', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 40 },
  { name: 'Cadre polaroid', category: 'ornement', svgPath: 'M10 10 H90 V90 H10 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Ribbon banner', category: 'ornement', svgPath: 'M10 40 H90 L80 60 H20 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 80 },
  { name: 'Etoile 8 branches', category: 'ornement', svgPath: 'M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 120 },
  { name: 'Soleil mystique', category: 'ornement', svgPath: 'M50 20 Q70 30 80 50 Q70 70 50 80 Q30 70 20 50 Q30 30 50 20 M50 10 L50 0 M90 50 L100 50 M50 90 L50 100 M10 50 L0 50', viewBox: '0 0 100 100', defaultFill: '#212121', defaultWidth: 120, defaultHeight: 120 },
];
