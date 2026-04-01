export interface FilterPreset {
  id: string;
  label: string;
  css: string;
}

/** Neutral values for CSS filter functions (identity = no effect) */
const NEUTRAL: Record<string, number> = {
  brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0,
};

/**
 * Interpolate a CSS filter string by intensity (0 = no effect, 1 = full effect).
 * Example: interpolateFilter('brightness(1.3) contrast(0.8)', 0.5)
 *   → 'brightness(1.15) contrast(0.9)'
 */
export function interpolateFilter(css: string, intensity: number): string {
  if (css === 'none' || intensity <= 0) return 'none';
  if (intensity >= 1) return css;
  return css.replace(
    /(brightness|contrast|saturate|sepia|grayscale)\(([\d.]+)\)/g,
    (_, fn, val) => {
      const v = parseFloat(val);
      const n = NEUTRAL[fn] ?? (v > 1 ? 1 : 0);
      const interp = n + (v - n) * intensity;
      return `${fn}(${interp.toFixed(3)})`;
    }
  ).replace(
    /hue-rotate\(([\d.]+)deg\)/g,
    (_, val) => `hue-rotate(${(parseFloat(val) * intensity).toFixed(1)}deg)`
  );
}

export const FILTERS: FilterPreset[] = [
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
  { id: 'lut-warm-cinema', label: 'Cinema chaud', css: 'brightness(1.08) saturate(1.15) sepia(0.08)' },
  { id: 'lut-soft-wellness', label: 'Doux bien-etre', css: 'brightness(1.02) saturate(0.8) contrast(0.95)' },
  { id: 'lut-cold-teal', label: 'Teal froid', css: 'brightness(0.98) saturate(0.9) hue-rotate(15deg)' },
  { id: 'lut-vintage-film', label: 'Film vintage', css: 'sepia(0.2) contrast(1.05) brightness(0.95)' },
  { id: 'lut-bright-clean', label: 'Vif propre', css: 'brightness(1.08) saturate(1.2) contrast(1.05)' },
  { id: 'lut-golden-hour', label: 'Heure doree', css: 'brightness(1.1) saturate(1.1) sepia(0.12)' },
];
