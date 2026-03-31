import type { AnimationType, StylePreset, RenderWord } from './types';

/**
 * Given the current time, block start/end, and word list,
 * compute per-word render state (progress + active flag).
 */
export function computeWordStates(
  currentMs: number,
  words: { text: string; startMs: number; endMs: number }[],
  animation: StylePreset['animation'],
): RenderWord[] {
  return words.map((word, index) => {
    const { startMs, endMs } = word;
    const active = currentMs >= startMs && currentMs < endMs;

    let progress = 0;
    if (animation.type === 'karaoke') {
      // karaoke: progress drives color shift (0=inactive grey, 1=fully lit)
      if (currentMs >= endMs) progress = 1;
      else if (currentMs >= startMs) progress = (currentMs - startMs) / Math.max(1, endMs - startMs);
    } else {
      // word-by-word: each word animates in from its own startMs
      const animEnd = startMs + animation.duration;
      if (currentMs >= animEnd) progress = 1;
      else if (currentMs >= startMs) progress = (currentMs - startMs) / Math.max(1, animation.duration);
    }

    return { text: word.text, progress, active, index };
  });
}

/**
 * Easing helpers (no external lib).
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Returns a canvas alpha (0..1) for the current render word,
 * based on animation type and progress.
 */
export function getWordAlpha(type: AnimationType, progress: number): number {
  switch (type) {
    case 'fade':
      return easeInOutSine(Math.min(1, progress));
    case 'pop':
    case 'bounce':
    case 'slide-up':
      return progress > 0 ? 1 : 0;
    case 'karaoke':
      return 1; // always visible, colour changes instead
    case 'typewriter':
      return 1;
    case 'neon-pulse':
      return easeOutCubic(Math.min(1, progress));
    case 'none':
    default:
      return 1;
  }
}

/**
 * Returns scale for pop/bounce animations.
 */
export function getWordScale(type: AnimationType, progress: number): number {
  if (type === 'pop') {
    if (progress <= 0) return 0;
    return easeOutBack(Math.min(1, progress));
  }
  if (type === 'bounce') {
    if (progress <= 0) return 0;
    return easeOutElastic(Math.min(1, progress));
  }
  return 1;
}

/**
 * Returns vertical offset (px) for slide-up animation.
 */
export function getWordOffsetY(type: AnimationType, progress: number, fontSize: number): number {
  if (type === 'slide-up') {
    if (progress <= 0) return fontSize * 1.2;
    return fontSize * 1.2 * (1 - easeOutCubic(Math.min(1, progress)));
  }
  return 0;
}

/**
 * For typewriter: returns how many characters to show (0..text.length).
 * Applied to the whole block text, not per-word.
 */
export function getTypewriterChars(
  currentMs: number,
  blockStartMs: number,
  blockEndMs: number,
  totalChars: number,
): number {
  const elapsed = currentMs - blockStartMs;
  const duration = blockEndMs - blockStartMs;
  if (elapsed <= 0) return 0;
  if (elapsed >= duration) return totalChars;
  return Math.floor((elapsed / duration) * totalChars);
}

/**
 * For neon-pulse: glow intensity (0..1) that oscillates slightly.
 */
export function getNeonGlow(progress: number, nowMs: number): number {
  if (progress <= 0) return 0;
  const base = easeOutCubic(Math.min(1, progress));
  // subtle oscillation after appearing
  const oscillation = progress >= 1 ? 0.15 * Math.sin(nowMs / 300) : 0;
  return Math.max(0, Math.min(1, base + oscillation));
}
