import { FILTERS } from './filters';
import type { TextOverlayItem } from '@/lib/types';

/**
 * Construit les arguments FFmpeg pour trim + filtre + texte.
 * -ss avant -i = seek rapide (input seeking).
 * Les filtres vidéo sont chaînés dans une seule option -vf.
 */
export function buildExportCommand(
  trimStart: number,
  trimEnd: number,
  filter?: string,
  overlays?: TextOverlayItem[],
): string[] {
  const duration = trimEnd - trimStart;

  // Chaîne de filtres vidéo
  const vf = [
    'scale=1080:1920:force_original_aspect_ratio=decrease',
    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
  ];

  // Filtre couleur
  const filterDef = FILTERS.find(f => f.id === filter);
  if (filterDef?.ffmpeg) vf.push(filterDef.ffmpeg);

  // Textes — drawtext sans fontfile (police par défaut FFmpeg)
  if (overlays) {
    for (const o of overlays) {
      const escaped = o.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
      const dt = [
        `drawtext=text='${escaped}'`,
        `x=${Math.round(o.x * 1080)}`,
        `y=${Math.round(o.y * 1920)}`,
        `fontsize=${o.fontSize}`,
        `fontcolor=${o.fill.replace('#', '0x')}`,
        `enable='between(t\\,${o.startTime.toFixed(2)}\\,${o.endTime.toFixed(2)})'`,
      ].join(':');
      vf.push(dt);
    }
  }

  return [
    '-ss', trimStart.toFixed(3),
    '-i', 'input.mp4',
    '-t', duration.toFixed(3),
    '-vf', vf.join(','),
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
