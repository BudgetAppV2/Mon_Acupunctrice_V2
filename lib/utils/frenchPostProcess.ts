/**
 * Post-traitement des transcriptions pour le français.
 * Corrige les apostrophes manquantes, les contractions courantes,
 * et le vocabulaire spécifique à l'acupuncture.
 */

// Corrections de vocabulaire spécifiques à l'acupuncture
const VOCABULARY_CORRECTIONS: [RegExp, string][] = [
  [/\bmeridians\b/gi, 'méridiens'],
  [/\bmeridian\b/gi, 'méridien'],
  [/\bmeridiens\b/g, 'méridiens'],
  [/\bacuponcture\b/gi, 'acupuncture'],
  [/\bacuponction\b/gi, 'acupuncture'],
  [/\bchi gong\b/gi, 'qigong'],
  [/\bqi gong\b/gi, 'qigong'],
  [/\baiguilles d acupuncture\b/gi, "aiguilles d'acupuncture"],
  [/\bmedecine traditionnelle chinoise\b/gi, 'médecine traditionnelle chinoise'],
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

/** Corrige un mot individuel (apostrophes manquantes) */
export function fixFrenchWord(word: string): string {
  let fixed = word;
  for (const [pattern, replacement] of ELISION_PATTERNS) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}

/** Corrige une phrase complète (élisions + vocabulaire acupuncture) */
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

/** Capitalise le premier caractère d'un texte */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
