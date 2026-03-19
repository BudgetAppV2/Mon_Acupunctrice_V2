import { FILTERS } from './filters';
import type { TextOverlayItem, SubtitleSegment } from '@/lib/types';

interface ExportOpts {
  trimStart: number;
  trimEnd: number;
  filter?: string;
  overlays?: TextOverlayItem[];
  subtitles?: SubtitleSegment[];
  subtitleStyle?: string;
  audioUrl?: string | null;
  voiceVolume?: number;
  audioVolume?: number;
  audioFadeIn?: number;
  audioFadeOut?: number;
}

function buildVideoFilters(opts: ExportOpts): string {
  const vf = ['scale=1080:1920:force_original_aspect_ratio=decrease', 'pad=1080:1920:(ow-iw)/2:(oh-ih)/2'];

  const filterDef = FILTERS.find(f => f.id === opts.filter);
  if (filterDef?.ffmpeg) vf.push(filterDef.ffmpeg);

  if (opts.overlays) {
    for (const o of opts.overlays) {
      const esc = o.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
      vf.push(`drawtext=text='${esc}':x=${Math.round(o.x * 1080)}:y=${Math.round(o.y * 1920)}:fontsize=${o.fontSize}:fontcolor=${o.fill.replace('#', '0x')}:enable='between(t\\,${o.startTime.toFixed(2)}\\,${o.endTime.toFixed(2)})'`);
    }
  }

  if (opts.subtitles) {
    for (const seg of opts.subtitles) {
      const esc = seg.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
      vf.push(`drawtext=text='${esc}':x=(w-text_w)/2:y=h*0.85:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:enable='between(t\\,${seg.startTime.toFixed(2)}\\,${seg.endTime.toFixed(2)})'`);
    }
  }

  return vf.join(',');
}

/** Construit les arguments FFmpeg pour l'export complet (trim + filtre + texte + sous-titres + audio mix) */
export function buildExportCommand(opts: ExportOpts): string[] {
  const duration = opts.trimEnd - opts.trimStart;
  const hasAudio = !!opts.audioUrl;
  const codec = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p'];

  // Cas simple : pas de mixage audio
  if (!hasAudio) {
    return [
      '-ss', opts.trimStart.toFixed(3), '-i', 'input.mp4', '-t', duration.toFixed(3),
      '-vf', buildVideoFilters(opts), ...codec,
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
      '-movflags', '+faststart', '-y', 'output.mp4',
    ];
  }

  // Cas complexe : mix voix + musique via filter_complex
  const vVol = opts.voiceVolume ?? 1;
  const mVol = opts.audioVolume ?? 0.3;
  const fadeIn = opts.audioFadeIn ?? 0;
  const fadeOut = opts.audioFadeOut ?? 0;

  let musicFilter = `[1:a]volume=${mVol}`;
  if (fadeIn > 0) musicFilter += `,afade=t=in:d=${fadeIn}`;
  if (fadeOut > 0) musicFilter += `,afade=t=out:st=${Math.max(0, duration - fadeOut).toFixed(2)}:d=${fadeOut}`;
  musicFilter += '[music]';

  const fc = [
    `[0:v]${buildVideoFilters(opts)}[outv]`,
    `[0:a]volume=${vVol}[voice]`,
    musicFilter,
    '[voice][music]amix=inputs=2:duration=first[outa]',
  ].join(';');

  return [
    '-ss', opts.trimStart.toFixed(3), '-i', 'input.mp4', '-i', 'music.mp3',
    '-t', duration.toFixed(3), '-filter_complex', fc,
    '-map', '[outv]', '-map', '[outa]', ...codec,
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-movflags', '+faststart', '-y', 'output.mp4',
  ];
}
