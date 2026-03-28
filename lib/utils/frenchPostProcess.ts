/**
 * Post-traitement des transcriptions Whisper pour le francais.
 * Corrige les apostrophes manquantes et les contractions courantes.
 */

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

/** Corrige une phrase complete */
export function fixFrenchText(text: string): string {
  let fixed = text;
  for (const [pattern, replacement] of ELISION_PATTERNS) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}
