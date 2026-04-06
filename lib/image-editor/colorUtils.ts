/**
 * Color conversion utilities: HSV ↔ RGB ↔ HEX.
 * All HSV values: h 0-360, s 0-1, v 0-1.
 */

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, max === 0 ? 0 : d / max, max];
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export function hsvToHex(h: number, s: number, v: number): string {
  return rgbToHex(...hsvToRgb(h, s, v));
}

export function hexToHsv(hex: string): [number, number, number] {
  return rgbToHsv(...hexToRgb(hex));
}

/** Gradient direction presets. Coords are computed from object width/height. */
export const GRADIENT_DIRS = [
  { id: 'h',  label: 'Horizontal', type: 'linear' as const, coords: (w: number, h: number) => ({ x1: 0, y1: h / 2, x2: w, y2: h / 2 }) },
  { id: 'v',  label: 'Vertical',   type: 'linear' as const, coords: (w: number, h: number) => ({ x1: w / 2, y1: 0, x2: w / 2, y2: h }) },
  { id: 'd',  label: 'Diagonal',   type: 'linear' as const, coords: (w: number, h: number) => ({ x1: 0, y1: 0, x2: w, y2: h }) },
  { id: 'r',  label: 'Radial',     type: 'radial' as const, coords: (w: number, h: number) => ({ x1: w / 2, y1: h / 2, x2: w / 2, y2: h / 2, r1: 0, r2: Math.max(w, h) / 2 }) },
  { id: 'di', label: 'Diag. inv.', type: 'linear' as const, coords: (w: number, h: number) => ({ x1: 0, y1: h, x2: w, y2: 0 }) },
];

export const BRAND_GRADIENTS = [
  { name: 'Turquoise-Menthe', stops: [{ offset: 0, color: '#7EBEC5' }, { offset: 1, color: '#AAD1D2' }] },
  { name: 'Sage-Foret',       stops: [{ offset: 0, color: '#5C7A5F' }, { offset: 1, color: '#3D5E40' }] },
  { name: 'Ocean',            stops: [{ offset: 0, color: '#7EBEC5' }, { offset: 1, color: '#2C5F6E' }] },
  { name: 'Aurore',           stops: [{ offset: 0, color: '#AAD1D2' }, { offset: 1, color: '#F4F4F4' }] },
];
