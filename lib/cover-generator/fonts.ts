import { readFile } from 'node:fs/promises';
import path from 'node:path';

let cachedFonts: { cormorant500i: Buffer; inter500: Buffer; inter600: Buffer } | null = null;

export async function loadFonts() {
  if (cachedFonts) return cachedFonts;

  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const [cormorant500i, inter500, inter600] = await Promise.all([
    readFile(path.join(fontsDir, 'CormorantGaramond-Italic-500.woff2')),
    readFile(path.join(fontsDir, 'Inter-500.woff2')),
    readFile(path.join(fontsDir, 'Inter-600.woff2')),
  ]);

  cachedFonts = { cormorant500i, inter500, inter600 };
  return cachedFonts;
}

export function buildSatoriFontConfig(fonts: Awaited<ReturnType<typeof loadFonts>>) {
  return [
    { name: 'Cormorant', data: fonts.cormorant500i, weight: 500 as const, style: 'italic' as const },
    { name: 'Inter', data: fonts.inter500, weight: 500 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.inter600, weight: 600 as const, style: 'normal' as const },
  ];
}
