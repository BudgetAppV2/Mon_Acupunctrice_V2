/**
 * Construit les arguments FFmpeg pour trimmer et redimensionner en 9:16.
 * -ss avant -i = seek rapide (input seeking)
 */
export function buildTrimCommand(
  trimStart: number,
  trimEnd: number,
): string[] {
  const duration = trimEnd - trimStart;

  return [
    '-ss', trimStart.toFixed(3),
    '-i', 'input.mp4',
    '-t', duration.toFixed(3),
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '23',
    '-profile:v', 'high',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-ar', '48000',
    '-movflags', '+faststart',
    '-y',
    'output.mp4',
  ];
}
