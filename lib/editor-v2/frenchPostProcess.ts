/**
 * Post-processing for French transcriptions.
 * Fixes missing apostrophes, common contractions,
 * and acupuncture-specific vocabulary.
 */

const VOCABULARY_CORRECTIONS: [RegExp, string][] = [
  [/\bmeridians\b/gi, 'meridiens'],
  [/\bmeridian\b/gi, 'meridien'],
  [/\bmeridiens\b/g, 'meridiens'],
  [/\bacuponcture\b/gi, 'acupuncture'],
  [/\bacuponction\b/gi, 'acupuncture'],
  [/\bchi gong\b/gi, 'qigong'],
  [/\bqi gong\b/gi, 'qigong'],
  [/\baiguilles d acupuncture\b/gi, "aiguilles d'acupuncture"],
  [/\bmedecine traditionnelle chinoise\b/gi, 'medecine traditionnelle chinoise'],
];

const ELISION_PATTERNS: [RegExp, string][] = [
  [/\bl (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "l'"],
  [/\bd (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "d'"],
  [/\bn (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "n'"],
  [/\bj (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "j'"],
  [/\bs (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "s'"],
  [/\bqu (?=[aeéèêiïîoôuùûyhAEÉÈÊIÏÎOÔUÙÛYH])/g, "qu'"],
  [/\bc est\b/g, "c'est"],
  [/\bjusqu (?=[aeéèêiïîoôuùûàAEÉÈÊIÏÎOÔUÙÛÀ])/g, "jusqu'"],
  [/\bpuisqu (?=[aeéèêiïîoôuùûAEÉÈÊIÏÎOÔUÙÛ])/g, "puisqu'"],
  [/\blorsqu (?=[aeéèêiïîoôuùûAEÉÈÊIÏÎOÔUÙÛ])/g, "lorsqu'"],
  [/\baujourd hui\b/g, "aujourd'hui"],
];

/** Fix a single word (missing apostrophes) */
export function fixFrenchWord(word: string): string {
  let fixed = word;
  for (const [pattern, replacement] of ELISION_PATTERNS) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}

/** Fix a full sentence (elisions + acupuncture vocabulary) */
export function fixFrenchText(text: string): string {
  let fixed = text;
  for (const [pattern, replacement] of ELISION_PATTERNS) {
    fixed = fixed.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of VOCABULARY_CORRECTIONS) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}

/** Capitalize first character */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
