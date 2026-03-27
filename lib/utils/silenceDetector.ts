/**
 * Detecte les segments de silence dans un AudioBuffer.
 * Retourne les plages temporelles des silences > minDuration.
 */
export interface SilenceRange {
  start: number;
  end: number;
}

const RMS_THRESHOLD = 0.01; // amplitude RMS sous laquelle on considere le silence
const WINDOW_MS = 50; // fenetre d'analyse en ms

export function detectSilences(
  audio: AudioBuffer,
  minDuration = 0.8,
): SilenceRange[] {
  const samples = audio.getChannelData(0);
  const sr = audio.sampleRate;
  const windowSize = Math.floor(sr * WINDOW_MS / 1000);
  const silences: SilenceRange[] = [];
  let silenceStart: number | null = null;

  for (let i = 0; i < samples.length; i += windowSize) {
    const end = Math.min(i + windowSize, samples.length);
    let sumSq = 0;
    for (let j = i; j < end; j++) sumSq += samples[j] * samples[j];
    const rms = Math.sqrt(sumSq / (end - i));

    const time = i / sr;
    if (rms < RMS_THRESHOLD) {
      if (silenceStart === null) silenceStart = time;
    } else {
      if (silenceStart !== null) {
        const duration = time - silenceStart;
        if (duration >= minDuration) silences.push({ start: silenceStart, end: time });
        silenceStart = null;
      }
    }
  }

  // Silence en fin de fichier
  if (silenceStart !== null) {
    const endTime = samples.length / sr;
    if (endTime - silenceStart >= minDuration) silences.push({ start: silenceStart, end: endTime });
  }

  return silences;
}

/**
 * Calcule les segments non-silencieux (inverse des silences).
 * Utilise pour couper les silences a l'export.
 */
export function getNonSilentRanges(
  silences: SilenceRange[],
  totalDuration: number,
  keepPad = 0.1,
): { start: number; end: number }[] {
  if (silences.length === 0) return [{ start: 0, end: totalDuration }];
  const ranges: { start: number; end: number }[] = [];
  let cursor = 0;

  for (const s of silences) {
    const segStart = cursor;
    const segEnd = Math.max(cursor, s.start + keepPad);
    if (segEnd > segStart + 0.1) ranges.push({ start: segStart, end: segEnd });
    cursor = Math.max(cursor, s.end - keepPad);
  }

  if (cursor < totalDuration) ranges.push({ start: cursor, end: totalDuration });
  return ranges;
}
