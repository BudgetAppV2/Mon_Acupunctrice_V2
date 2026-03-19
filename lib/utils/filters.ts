export interface FilterDef {
  id: string;
  label: string;
  css: string;
  ffmpeg: string;
}

export const FILTERS: FilterDef[] = [
  { id: 'normal', label: 'Normal', css: 'none', ffmpeg: '' },
  { id: 'lumineux', label: 'Lumineux', css: 'brightness(1.2) contrast(1.1) saturate(1.3)', ffmpeg: 'eq=brightness=0.2:contrast=1.1:saturation=1.3' },
  { id: 'chaud', label: 'Chaud', css: 'saturate(1.4) hue-rotate(-15deg) brightness(1.1)', ffmpeg: 'eq=saturation=1.4:brightness=0.1,colorchannelmixer=rr=1.1:gg=0.95:bb=0.85' },
  { id: 'froid', label: 'Froid', css: 'saturate(0.8) hue-rotate(15deg) brightness(1.05)', ffmpeg: 'eq=saturation=0.8:brightness=0.05,colorchannelmixer=rr=0.85:gg=0.95:bb=1.1' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.5) contrast(1.1) brightness(0.9)', ffmpeg: 'eq=saturation=0.9:brightness=0.05,colorchannelmixer=rr=1.1:gg=0.95:bb=0.85,vignette' },
  { id: 'noir_blanc', label: 'N&B', css: 'grayscale(1) contrast(1.3)', ffmpeg: 'hue=s=0,eq=contrast=1.3' },
  { id: 'doux', label: 'Doux', css: 'brightness(1.1) saturate(0.9) contrast(0.95)', ffmpeg: 'eq=brightness=0.1:saturation=0.9:contrast=0.95' },
  { id: 'vif', label: 'Vif', css: 'saturate(1.6) contrast(1.15)', ffmpeg: 'eq=saturation=1.6:contrast=1.15' },
  { id: 'sombre', label: 'Sombre', css: 'brightness(0.75) contrast(1.3) saturate(1.1)', ffmpeg: 'eq=brightness=-0.25:contrast=1.3:saturation=1.1' },
];
