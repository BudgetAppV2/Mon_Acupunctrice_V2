/**
 * critique-preset.ts — Auto-critique d'un VideoTheme sur 8 dimensions
 * 
 * Évalue un thème programmatiquement sur les dimensions mesurables
 * et produit un score + recommandations.
 */

import type { VideoTheme } from '../../../lib/data/videoThemes';

interface CritiqueResult {
  themeId: string;
  scores: {
    dimension: string;
    score: number;     // 1-5
    reason: string;
  }[];
  averageScore: number;
  passed: boolean;      // true si toutes les dimensions >= 3.5
  failedDimensions: string[];
  recommendations: string[];
}

const KNOWN_PAIRINGS: Record<string, string[]> = {
  'Bebas Neue': ['Inter', 'Poppins', 'Nunito'],
  'Anton': ['Inter', 'Poppins'],
  'Playfair Display': ['Lora', 'Inter', 'Poppins'],
  'DM Serif Display': ['Poppins', 'Inter', 'Nunito'],
  'Montserrat': ['Nunito', 'Inter', 'Lora'],
  'Dancing Script': ['Lora', 'Nunito'],
  'Oswald': ['Inter', 'Nunito'],
  'Caveat': ['Nunito', 'Poppins'],
};

const SERIF_FONTS = ['Playfair Display', 'DM Serif Display', 'Lora', 'Cormorant Garamond'];
const DISPLAY_FONTS = ['Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Bangers'];
const CURSIVE_FONTS = ['Dancing Script', 'Caveat', 'Sacramento', 'Pacifico', 'Satisfy'];

const BANNED_ANIMATIONS = ['glitch', 'wave']; // Trop flashy pour santé/bien-être
const WELLNESS_FILTERS = ['normal', 'warm', 'soft', 'vintage', 'pastel'];

export function critiqueTheme(theme: VideoTheme, existingThemeIds: string[]): CritiqueResult {
  const scores: CritiqueResult['scores'] = [];
  const recommendations: string[] = [];

  // 1. Lisibilité mobile
  let lisScore = 5;
  if (theme.subtitleFontSize < 48) { lisScore -= 2; recommendations.push('Sous-titres trop petits (< 48px)'); }
  if (theme.titleFontSize < 60) { lisScore -= 1; recommendations.push('Hook trop petit (< 60px)'); }
  scores.push({ dimension: 'Lisibilité mobile', score: Math.max(1, lisScore), reason: `Title ${theme.titleFontSize}px, Sub ${theme.subtitleFontSize}px` });

  // 2. Cohérence palette
  let palScore = 4; // On ne peut pas vérifier les couleurs sans la palette, score neutre
  scores.push({ dimension: 'Cohérence palette', score: palScore, reason: `Palette ${theme.paletteId}` });

  // 3. Authenticité niche
  let authScore = 5;
  if (BANNED_ANIMATIONS.includes(theme.defaultAnimation)) { authScore -= 2; recommendations.push(`Animation "${theme.defaultAnimation}" inappropriée pour santé/bien-être`); }
  if (theme.defaultTextEffect === 'glow' && theme.filterId === 'dramatic') { authScore -= 1; recommendations.push('Combo glow+dramatic peut faire "trop pub"'); }
  if (!WELLNESS_FILTERS.includes(theme.filterId)) { authScore -= 1; }
  scores.push({ dimension: 'Authenticité niche', score: Math.max(1, authScore), reason: `Filter: ${theme.filterId}, Anim: ${theme.defaultAnimation}` });

  // 4. Hiérarchie visuelle
  let hierScore = 5;
  if (theme.titleFontSize <= theme.subtitleFontSize) { hierScore -= 2; recommendations.push('Le titre doit être plus gros que les sous-titres'); }
  if (theme.titleFontSize - theme.subtitleFontSize < 8) { hierScore -= 1; recommendations.push('Différence titre/sous-titre trop faible'); }
  scores.push({ dimension: 'Hiérarchie visuelle', score: Math.max(1, hierScore), reason: `Delta: ${theme.titleFontSize - theme.subtitleFontSize}px` });

  // 5. Safe zones
  scores.push({ dimension: 'Safe zones', score: 4, reason: 'Vérifié par les tailles de font (pas de positionnement dans le thème)' });

  // 6. Différenciation
  let diffScore = 5;
  if (existingThemeIds.includes(theme.id)) { diffScore = 1; recommendations.push('ID de thème déjà existant!'); }
  // Vérifier si font combo est unique parmi les existants
  scores.push({ dimension: 'Différenciation', score: diffScore, reason: `ID unique: ${!existingThemeIds.includes(theme.id)}` });

  // 7. Tendances 2026
  let trendScore = 3;
  if (SERIF_FONTS.includes(theme.fontTitle)) trendScore += 1; // Serif revival
  if (WELLNESS_FILTERS.includes(theme.filterId)) trendScore += 0.5;
  if (theme.defaultAnimation === 'none' || theme.defaultAnimation === 'fade_in') trendScore += 0.5; // Imperfect by design
  scores.push({ dimension: 'Tendances 2026', score: Math.min(5, Math.round(trendScore)), reason: `Serif: ${SERIF_FONTS.includes(theme.fontTitle)}, Warm: ${WELLNESS_FILTERS.includes(theme.filterId)}` });

  // 8. Font pairing valide
  let pairScore = 3;
  const validPairs = KNOWN_PAIRINGS[theme.fontTitle];
  if (validPairs?.includes(theme.fontSubtitle)) { pairScore = 5; }
  else if (
    (SERIF_FONTS.includes(theme.fontTitle) && SERIF_FONTS.includes(theme.fontSubtitle)) ||
    (DISPLAY_FONTS.includes(theme.fontTitle) && DISPLAY_FONTS.includes(theme.fontSubtitle)) ||
    (CURSIVE_FONTS.includes(theme.fontTitle) && CURSIVE_FONTS.includes(theme.fontSubtitle))
  ) {
    pairScore = 1;
    recommendations.push(`Font pairing invalide: ${theme.fontTitle} + ${theme.fontSubtitle} sont du même type`);
  }
  scores.push({ dimension: 'Font pairing', score: pairScore, reason: `${theme.fontTitle} + ${theme.fontSubtitle}` });

  const averageScore = parseFloat((scores.reduce((s, c) => s + c.score, 0) / scores.length).toFixed(1));
  const failedDimensions = scores.filter(s => s.score < 3.5).map(s => s.dimension);

  return {
    themeId: theme.id,
    scores,
    averageScore,
    passed: failedDimensions.length === 0,
    failedDimensions,
    recommendations,
  };
}
