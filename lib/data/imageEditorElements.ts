/**
 * SVG elements for the image editor sidebar.
 * Categories: Zen, Sante, Formes.
 * Each element defines how to create a Fabric.js object and a preview SVG.
 */

export interface EditorElement {
  id: string;
  name: string;
  category: string;
  fabricType: 'circle' | 'rect' | 'triangle' | 'line' | 'path';
  pathData?: string;
  previewSvg: string;
  props?: Record<string, unknown>;
}

export const ELEMENTS: EditorElement[] = [
  // --- Zen ---
  {
    id: 'leaf',
    name: 'Feuille',
    category: 'Zen',
    fabricType: 'path',
    pathData: 'M50,5 Q80,25 95,50 Q80,75 50,95 Q20,75 5,50 Q20,25 50,5 Z',
    previewSvg: '<svg viewBox="0 0 100 100"><path d="M50,5 Q80,25 95,50 Q80,75 50,95 Q20,75 5,50 Q20,25 50,5 Z" fill="currentColor"/></svg>',
  },
  {
    id: 'drop',
    name: 'Goutte',
    category: 'Zen',
    fabricType: 'path',
    pathData: 'M50,5 Q75,40 75,60 Q75,85 50,95 Q25,85 25,60 Q25,40 50,5 Z',
    previewSvg: '<svg viewBox="0 0 100 100"><path d="M50,5 Q75,40 75,60 Q75,85 50,95 Q25,85 25,60 Q25,40 50,5 Z" fill="currentColor"/></svg>',
  },
  {
    id: 'lotus',
    name: 'Lotus',
    category: 'Zen',
    fabricType: 'path',
    pathData: 'M50,85 Q25,60 15,35 Q25,15 50,10 Q75,15 85,35 Q75,60 50,85 Z',
    previewSvg: '<svg viewBox="0 0 100 100"><path d="M50,85 Q25,60 15,35 Q25,15 50,10 Q75,15 85,35 Q75,60 50,85 Z" fill="currentColor" opacity="0.5"/><path d="M50,80 Q35,60 30,42 Q38,25 50,20 Q62,25 70,42 Q65,60 50,80 Z" fill="currentColor"/></svg>',
  },
  {
    id: 'bamboo',
    name: 'Bambou',
    category: 'Zen',
    fabricType: 'path',
    pathData: 'M45,95 L45,5 M55,95 L55,5 M38,30 L62,30 M38,60 L62,60',
    previewSvg: '<svg viewBox="0 0 100 100"><line x1="45" y1="95" x2="45" y2="5" stroke="currentColor" stroke-width="4"/><line x1="55" y1="95" x2="55" y2="5" stroke="currentColor" stroke-width="4"/><line x1="38" y1="30" x2="62" y2="30" stroke="currentColor" stroke-width="3"/><line x1="38" y1="60" x2="62" y2="60" stroke="currentColor" stroke-width="3"/></svg>',
    props: { fill: '', stroke: '#5C7A5F', strokeWidth: 3 },
  },
  // --- Sante ---
  {
    id: 'needle',
    name: 'Aiguille',
    category: 'Sante',
    fabricType: 'path',
    pathData: 'M50,2 L54,40 L50,98 L46,40 Z',
    previewSvg: '<svg viewBox="0 0 100 100"><path d="M50,2 L54,40 L50,98 L46,40 Z" fill="currentColor"/></svg>',
  },
  {
    id: 'yinyang',
    name: 'Yin-Yang',
    category: 'Sante',
    fabricType: 'path',
    pathData: 'M50,5 A45,45 0 0,1 50,95 A22.5,22.5 0 0,1 50,50 A22.5,22.5 0 0,0 50,5 Z',
    previewSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/><path d="M50,5 A45,45 0 0,1 50,95 A22.5,22.5 0 0,1 50,50 A22.5,22.5 0 0,0 50,5 Z" fill="currentColor"/><circle cx="50" cy="27.5" r="5" fill="currentColor" opacity="0.3"/><circle cx="50" cy="72.5" r="5" fill="currentColor"/></svg>',
  },
  {
    id: 'meridian',
    name: 'Meridien',
    category: 'Sante',
    fabricType: 'path',
    pathData: 'M30,90 Q30,60 50,50 Q70,40 70,10',
    previewSvg: '<svg viewBox="0 0 100 100"><path d="M30,90 Q30,60 50,50 Q70,40 70,10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="30" cy="90" r="4" fill="currentColor"/><circle cx="50" cy="50" r="4" fill="currentColor"/><circle cx="70" cy="10" r="4" fill="currentColor"/></svg>',
    props: { fill: '', stroke: '#5C7A5F', strokeWidth: 3 },
  },
  // --- Formes ---
  {
    id: 'circle',
    name: 'Cercle',
    category: 'Formes',
    fabricType: 'circle',
    previewSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>',
  },
  {
    id: 'rect',
    name: 'Rectangle',
    category: 'Formes',
    fabricType: 'rect',
    previewSvg: '<svg viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="60" rx="4" fill="currentColor"/></svg>',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    category: 'Formes',
    fabricType: 'triangle',
    previewSvg: '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="currentColor"/></svg>',
  },
  {
    id: 'line',
    name: 'Ligne',
    category: 'Formes',
    fabricType: 'line',
    previewSvg: '<svg viewBox="0 0 100 100"><line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/></svg>',
  },
];
