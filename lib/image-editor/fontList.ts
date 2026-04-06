/**
 * Google Fonts list for the image editor font browser.
 * Each font includes name, category, and available weights.
 */

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export interface GoogleFont {
  name: string;
  category: FontCategory;
  weights: number[];
}

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'sans-serif', label: 'Sans-serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Handwriting' },
  { id: 'monospace', label: 'Monospace' },
];

export const WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin', 200: 'Extra-light', 300: 'Light', 400: 'Normal',
  500: 'Medium', 600: 'Semi-bold', 700: 'Bold', 800: 'Extra-bold', 900: 'Black',
};

export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans-serif
  { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700] },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { name: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', category: 'sans-serif', weights: [300, 400, 700] },
  { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Mulish', category: 'sans-serif', weights: [300, 400, 600, 700, 800] },
  { name: 'Nunito', category: 'sans-serif', weights: [300, 400, 600, 700, 800] },
  { name: 'Raleway', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Work Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700] },
  { name: 'Manrope', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Outfit', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Figtree', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  // Serif
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800] },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Antic Slab', category: 'serif', weights: [400] },
  { name: 'PT Serif', category: 'serif', weights: [400, 700] },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700] },
  { name: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { name: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Source Serif 4', category: 'serif', weights: [300, 400, 600, 700] },
  { name: 'DM Serif Display', category: 'serif', weights: [400] },
  { name: 'Bitter', category: 'serif', weights: [300, 400, 500, 600, 700] },
  // Display
  { name: 'Abril Fatface', category: 'display', weights: [400] },
  { name: 'Bebas Neue', category: 'display', weights: [400] },
  { name: 'Righteous', category: 'display', weights: [400] },
  { name: 'Archivo Black', category: 'display', weights: [400] },
  { name: 'Russo One', category: 'display', weights: [400] },
  { name: 'Fredoka', category: 'display', weights: [300, 400, 500, 600, 700] },
  { name: 'Comfortaa', category: 'display', weights: [300, 400, 500, 600, 700] },
  { name: 'Bungee', category: 'display', weights: [400] },
  { name: 'Rubik Mono One', category: 'display', weights: [400] },
  { name: 'Oswald', category: 'display', weights: [300, 400, 500, 600, 700] },
  { name: 'Anton', category: 'display', weights: [400] },
  { name: 'Barlow Condensed', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Londrina Shadow', category: 'display', weights: [400] },
  { name: 'Limelight', category: 'display', weights: [400] },
  // Canva preset fonts
  { name: 'Vollkorn', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Glass Antiqua', category: 'display', weights: [400] },
  { name: 'PT Sans', category: 'sans-serif', weights: [400, 700] },
  { name: 'Glacial Indifference', category: 'sans-serif', weights: [400, 700] },
  { name: 'Arimo', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Racing Sans One', category: 'display', weights: [400] },
  { name: 'Quicksand', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Yellowtail', category: 'handwriting', weights: [400] },
  { name: 'Glegoo', category: 'serif', weights: [400, 700] },
  { name: 'Alfa Slab One', category: 'display', weights: [400] },
  { name: 'Amatic SC', category: 'handwriting', weights: [400, 700] },
  { name: 'Exo 2', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Josefin Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Shrikhand', category: 'display', weights: [400] },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { name: 'Source Serif Pro', category: 'serif', weights: [400, 600, 700] },
  { name: 'Ubuntu', category: 'sans-serif', weights: [300, 400, 500, 700] },
  // Handwriting
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700] },
  { name: 'Pacifico', category: 'handwriting', weights: [400] },
  { name: 'Caveat', category: 'handwriting', weights: [400, 500, 600, 700] },
  { name: 'Great Vibes', category: 'handwriting', weights: [400] },
  { name: 'Satisfy', category: 'handwriting', weights: [400] },
  { name: 'Sacramento', category: 'handwriting', weights: [400] },
  { name: 'Kalam', category: 'handwriting', weights: [300, 400, 700] },
  { name: 'Indie Flower', category: 'handwriting', weights: [400] },
  { name: 'Amatic SC', category: 'handwriting', weights: [400, 700] },
  // Monospace
  { name: 'Roboto Mono', category: 'monospace', weights: [300, 400, 500, 700] },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 700] },
  { name: 'Space Mono', category: 'monospace', weights: [400, 700] },
  { name: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 700] },
  { name: 'IBM Plex Mono', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { name: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700] },
];

/** Build the Google Fonts CSS URL for preview subsets (lightweight, only "AaBbCc" glyphs) */
export function buildPreviewUrl(): string {
  const families = GOOGLE_FONTS.map((f) => `family=${f.name.replace(/ /g, '+')}:wght@400`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&text=${encodeURIComponent('AaBbCc')}&display=swap`;
}

/** Build the full Google Fonts URL for a specific font + weights */
export function buildFontUrl(name: string, weights: number[]): string {
  return `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@${weights.join(';')}&display=swap`;
}

const injected = new Set<string>();

/** Inject a Google Font link and wait for it to load */
export async function loadFont(name: string, weight: number = 400): Promise<void> {
  const key = `${name}:${weight}`;
  if (injected.has(key)) return;
  injected.add(key);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = buildFontUrl(name, [weight]);
  document.head.appendChild(link);

  try { await document.fonts.load(`${weight} 16px "${name}"`); } catch { /* font load failed */ }
}
