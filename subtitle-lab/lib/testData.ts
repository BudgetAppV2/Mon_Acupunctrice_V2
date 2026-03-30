import type { SubtitleBlock } from './types';

// Données de test — thème acupuncture / bien-être
// Les timestamps sont simulés (pas de vraie vidéo)

function makeWords(sentence: string, startMs: number): { words: SubtitleBlock['words']; endMs: number } {
  const parts = sentence.trim().split(/\s+/);
  const msPerWord = 350;
  const words = parts.map((text, i) => ({
    text,
    startMs: startMs + i * msPerWord,
    endMs: startMs + (i + 1) * msPerWord - 30,
  }));
  return { words, endMs: startMs + parts.length * msPerWord + 200 };
}

const blocks: SubtitleBlock[] = [];
let cursor = 500;
const sentences = [
  "L'acupuncture rétablit l'équilibre naturel du corps",
  "Chaque séance est une invitation au calme intérieur",
  "Les méridiens transportent l'énergie vitale qi",
  "Réduire le stress commence par une respiration consciente",
  "Votre corps sait comment guérir il a juste besoin d'espace",
  "L'aiguille fine libère le flux d'énergie bloqué",
];

sentences.forEach((sentence, i) => {
  const { words, endMs } = makeWords(sentence, cursor);
  blocks.push({
    id: `block-${i}`,
    text: sentence,
    words,
    startMs: cursor,
    endMs,
  });
  cursor = endMs + 400;
});

export const TEST_BLOCKS = blocks;
export const TOTAL_DURATION_MS = cursor + 500;
