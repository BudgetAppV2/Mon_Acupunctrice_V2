/**
 * Parser de fichiers .cube (LUT 3D standard industrie).
 * Convertit le texte .cube en un Float32Array utilisable comme texture WebGL.
 */

export interface LutData {
  title: string;
  size: number; // taille du cube (ex: 33 = 33x33x33)
  data: Float32Array; // RGB triplets normalises 0-1, taille = size^3 * 3
}

/** Parse un fichier .cube en LutData */
export function parseCubeFile(text: string): LutData {
  const lines = text.split('\n');
  let title = 'Untitled';
  let size = 0;
  const values: number[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('TITLE')) { title = line.replace(/^TITLE\s+"?/, '').replace(/"?\s*$/, ''); continue; }
    if (line.startsWith('LUT_3D_SIZE')) { size = parseInt(line.split(/\s+/)[1], 10); continue; }
    if (line.startsWith('DOMAIN_MIN') || line.startsWith('DOMAIN_MAX')) continue;

    const parts = line.split(/\s+/).map(Number);
    if (parts.length >= 3 && !isNaN(parts[0])) {
      values.push(parts[0], parts[1], parts[2]);
    }
  }

  if (size === 0) throw new Error('LUT_3D_SIZE missing in .cube file');
  const expected = size * size * size * 3;
  if (values.length < expected) throw new Error(`LUT data incomplete: got ${values.length / 3} entries, expected ${size ** 3}`);

  return { title, size, data: new Float32Array(values.slice(0, expected)) };
}

/**
 * Genere une LUT programmatiquement a partir d'une fonction de transformation.
 * Utile pour creer des LUTs sans fichier .cube.
 */
export function generateLut(
  size: number,
  transform: (r: number, g: number, b: number) => [number, number, number],
): LutData {
  const data = new Float32Array(size * size * size * 3);
  let idx = 0;
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const [or, og, ob] = transform(r / (size - 1), g / (size - 1), b / (size - 1));
        data[idx++] = Math.max(0, Math.min(1, or));
        data[idx++] = Math.max(0, Math.min(1, og));
        data[idx++] = Math.max(0, Math.min(1, ob));
      }
    }
  }
  return { title: 'Generated', size, data };
}
