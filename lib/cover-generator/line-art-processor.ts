import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Convertit un line art en data URL utilisable par Satori.
 *
 * Supporte 2 modes :
 * 1. SVG (vectoriel, prefere) : lecture du fichier, encoding base64 -> data:image/svg+xml
 *    Qualite parfaite a toute echelle, taille fichier reduite (~2-40 KB).
 * 2. JPG/PNG (legacy fallback) : chroma key sur le blanc, conversion en PNG transparent
 *    avec couleur ink uniforme.
 *
 * Le format est detecte automatiquement par l'extension du fichier.
 */
export async function lineArtToDataUrl(
  filepath: string,
  threshold = 235,
): Promise<string> {
  const ext = path.extname(filepath).toLowerCase();

  // SVG : lecture directe, encoding base64
  if (ext === '.svg') {
    const svgContent = await readFile(filepath, 'utf-8');
    const base64 = Buffer.from(svgContent, 'utf-8').toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  // JPG/PNG : workflow chroma key (port direct du POC valide)
  const original = sharp(filepath);
  const metadata = await original.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read dimensions for ${filepath}`);
  }

  const greyBuffer = await original.clone().greyscale().raw().toBuffer();

  const inkR = 0x2c;
  const inkG = 0x2a;
  const inkB = 0x26;
  const rgbaBuffer = Buffer.alloc(greyBuffer.length * 4);

  for (let i = 0; i < greyBuffer.length; i++) {
    const luminance = greyBuffer[i];
    let alpha = 0;
    if (luminance < threshold) {
      alpha = Math.round(((threshold - luminance) / threshold) * 255);
    }
    rgbaBuffer[i * 4] = inkR;
    rgbaBuffer[i * 4 + 1] = inkG;
    rgbaBuffer[i * 4 + 2] = inkB;
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  const pngBuffer = await sharp(rgbaBuffer, {
    raw: { width: metadata.width, height: metadata.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

/**
 * Legacy : alias retro-compatible qui retourne un Buffer PNG (utilise par tests existants).
 * @deprecated Utilise lineArtToDataUrl pour le pipeline production.
 */
export async function lineArtToTransparentPng(
  filepath: string,
  threshold = 235,
): Promise<Buffer> {
  const ext = path.extname(filepath).toLowerCase();

  if (ext === '.svg') {
    // Pour la retro-compat : rasteriser le SVG en PNG transparent via Resvg
    const svgContent = await readFile(filepath, 'utf-8');
    const { Resvg } = await import('@resvg/resvg-js');
    const resvg = new Resvg(svgContent, {
      background: 'transparent',
      fitTo: { mode: 'width', value: 2000 },
    });
    return resvg.render().asPng();
  }

  // JPG/PNG : workflow chroma key original
  const original = sharp(filepath);
  const metadata = await original.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read dimensions for ${filepath}`);
  }

  const greyBuffer = await original.clone().greyscale().raw().toBuffer();

  const inkR = 0x2c;
  const inkG = 0x2a;
  const inkB = 0x26;
  const rgbaBuffer = Buffer.alloc(greyBuffer.length * 4);

  for (let i = 0; i < greyBuffer.length; i++) {
    const luminance = greyBuffer[i];
    let alpha = 0;
    if (luminance < threshold) {
      alpha = Math.round(((threshold - luminance) / threshold) * 255);
    }
    rgbaBuffer[i * 4] = inkR;
    rgbaBuffer[i * 4 + 1] = inkG;
    rgbaBuffer[i * 4 + 2] = inkB;
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  return sharp(rgbaBuffer, {
    raw: { width: metadata.width, height: metadata.height, channels: 4 },
  })
    .png()
    .toBuffer();
}
