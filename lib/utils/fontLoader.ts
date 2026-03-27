import { FONTS, FONT_CATEGORIES as DK_CATEGORIES } from '@/lib/data/designKnowledge';

const loaded = new Set<string>();

/** Catalogue de fonts organise par categorie (depuis designKnowledge.ts) */
export const FONT_CATEGORIES: Record<string, readonly string[]> = Object.fromEntries(
  DK_CATEGORIES.map(cat => [
    cat.id,
    FONTS.filter(f => f.category === cat.id).map(f => f.family),
  ]),
);

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  DK_CATEGORIES.map(cat => [cat.id, cat.label]),
);

export const ALL_FONTS = FONTS.map(f => f.family);

/** Charge une Google Font a la demande via un <link> + FontFace API */
export async function loadFont(family: string): Promise<void> {
  if (loaded.has(family)) return;
  loaded.add(family);

  const fontDef = FONTS.find(f => f.family === family);
  const urlParam = fontDef?.googleUrl ?? `${encodeURIComponent(family)}:wght@400;700`;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${urlParam}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const weight = fontDef?.weight ?? 700;
  await document.fonts.load(`${weight} 24px "${family}"`);
}
