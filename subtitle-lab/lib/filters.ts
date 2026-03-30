export interface FilterPreset {
  id: string;
  label: string;
  css: string;
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
];
