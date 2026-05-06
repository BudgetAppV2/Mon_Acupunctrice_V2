import sharp from 'sharp';

/**
 * Convertit un JPG line art en PNG transparent avec couleur ink uniforme.
 * Port direct du POC validé (lineArtToTransparentPng).
 *
 * - Fond blanc → alpha 0 (transparent)
 * - Lignes sombres → couleur ink #2C2A26 avec alpha proportionnel
 */
export async function lineArtToTransparentPng(
  filepath: string,
  threshold = 235,
): Promise<Buffer> {
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
