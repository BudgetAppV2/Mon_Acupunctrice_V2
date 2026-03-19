const loaded = new Set<string>();

export const FONT_CATEGORIES: Record<string, readonly string[]> = {
  bold: ['Bebas Neue', 'Oswald', 'Anton', 'Archivo Black', 'Russo One'],
  elegant: ['Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Lora', 'Cinzel'],
  modern: ['Montserrat', 'Poppins', 'Inter', 'Raleway', 'Roboto'],
  handwritten: ['Dancing Script', 'Pacifico', 'Sacramento', 'Caveat', 'Satisfy'],
  display: ['Lobster', 'Permanent Marker', 'Righteous', 'Bangers', 'Bungee'],
  minimal: ['Nunito', 'Quicksand', 'Karla', 'Work Sans', 'DM Sans'],
};

export const CATEGORY_LABELS: Record<string, string> = {
  bold: 'Bold', elegant: 'Élégant', modern: 'Moderne',
  handwritten: 'Manuscrit', display: 'Display', minimal: 'Minimal',
};

export const ALL_FONTS = Object.values(FONT_CATEGORIES).flat();

/** Charge une Google Font à la demande via un <link> + FontFace API */
export async function loadFont(family: string): Promise<void> {
  if (loaded.has(family)) return;
  loaded.add(family);

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  await document.fonts.load(`700 24px "${family}"`);
}
