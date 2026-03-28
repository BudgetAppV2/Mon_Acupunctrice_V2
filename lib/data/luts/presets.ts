/**
 * LUTs pre-packagees generees programmatiquement.
 * Chaque LUT est une transformation de couleur R,G,B → R,G,B.
 * Taille 17x17x17 = 14739 floats (~59KB) — leger et rapide.
 */

import { generateLut, type LutData } from '@/lib/editor/lutParser';

const SIZE = 17;

// Helpers
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export interface LutPreset {
  id: string;
  name: string;
  description: string;
  /** Couleur dominante pour le thumbnail */
  tint: string;
  getData: () => LutData;
}

export const LUT_PRESETS: LutPreset[] = [
  {
    id: 'warm-cinema',
    name: 'Cinema chaud',
    description: 'Tons dores chauds — ideal Enseigner/Inspirer',
    tint: '#D4A76A',
    getData: () => generateLut(SIZE, (r, g, b) => [
      clamp(r * 1.08 + 0.02),
      clamp(g * 0.98 + 0.01),
      clamp(b * 0.88),
    ]),
  },
  {
    id: 'soft-wellness',
    name: 'Doux bien-etre',
    description: 'Tons desatures doux — ideal bien-etre',
    tint: '#B8C5B8',
    getData: () => generateLut(SIZE, (r, g, b) => {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      return [
        clamp(lerp(lum, r, 0.75) * 1.02 + 0.01),
        clamp(lerp(lum, g, 0.78) * 1.01 + 0.01),
        clamp(lerp(lum, b, 0.72) * 0.98 + 0.01),
      ];
    }),
  },
  {
    id: 'cold-teal',
    name: 'Teal froid',
    description: 'Teintes bleu-vert — contenu serieux/medical',
    tint: '#6B9EA3',
    getData: () => generateLut(SIZE, (r, g, b) => [
      clamp(r * 0.9),
      clamp(g * 1.02 + 0.01),
      clamp(b * 1.1 + 0.02),
    ]),
  },
  {
    id: 'vintage-film',
    name: 'Film vintage',
    description: 'Aspect pellicule — Connecter nostalgique',
    tint: '#C4A882',
    getData: () => generateLut(SIZE, (r, g, b) => {
      // Sepia partiel + lift des noirs
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      return [
        clamp(lerp(lum * 1.1, r, 0.7) + 0.03),
        clamp(lerp(lum * 0.95, g, 0.75) + 0.02),
        clamp(lerp(lum * 0.85, b, 0.65) + 0.04),
      ];
    }),
  },
  {
    id: 'bright-clean',
    name: 'Vif propre',
    description: 'Couleurs vives nettoyees — Aider dynamique',
    tint: '#7EB87E',
    getData: () => generateLut(SIZE, (r, g, b) => [
      clamp(Math.pow(r, 0.92) * 1.05),
      clamp(Math.pow(g, 0.9) * 1.06),
      clamp(Math.pow(b, 0.93) * 1.04),
    ]),
  },
  {
    id: 'golden-hour',
    name: 'Heure doree',
    description: 'Lumiere doree fin de journee',
    tint: '#D4AA6A',
    getData: () => generateLut(SIZE, (r, g, b) => {
      const warmShift = 0.04;
      return [
        clamp(r * 1.1 + warmShift),
        clamp(g * 1.02 + warmShift * 0.5),
        clamp(b * 0.85),
      ];
    }),
  },
];

/** Cache des LUT deja generees */
const cache = new Map<string, LutData>();

export function getLutData(id: string): LutData | null {
  if (cache.has(id)) return cache.get(id)!;
  const preset = LUT_PRESETS.find(p => p.id === id);
  if (!preset) return null;
  const data = preset.getData();
  data.title = preset.name;
  cache.set(id, data);
  return data;
}
