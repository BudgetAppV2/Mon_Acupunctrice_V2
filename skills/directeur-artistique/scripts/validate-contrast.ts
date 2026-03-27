/**
 * validate-contrast.ts — Validation WCAG du contraste des couleurs d'un thème
 * 
 * Utilisé par le skill directeur-artistique pour vérifier programmatiquement
 * que les combinaisons de couleurs respectent le ratio WCAG 4.5:1.
 * 
 * Usage: npx ts-node skills/directeur-artistique/scripts/validate-contrast.ts <paletteId>
 * Ou importé comme module par l'agent.
 */

interface ColorPalette {
  id: string;
  name: string;
  text: string;
  accent: string;
  background: string;
  stroke: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

interface ValidationResult {
  valid: boolean;
  checks: {
    pair: string;
    color1: string;
    color2: string;
    ratio: number;
    required: number;
    pass: boolean;
  }[];
  summary: string;
}

export function validatePaletteContrast(palette: ColorPalette): ValidationResult {
  const MIN_RATIO = 4.5;
  const checks = [];

  // Texte sur fond vidéo (on assume fond moyen — le stroke compense)
  // Mais on vérifie quand même text vs stroke (le stroke doit être lisible)
  
  // Check 1: Text color vs background (pour les pills)
  if (palette.background && !palette.background.includes('rgba')) {
    checks.push({
      pair: 'Text sur Background',
      color1: palette.text,
      color2: palette.background,
      ratio: parseFloat(contrastRatio(palette.text, palette.background).toFixed(2)),
      required: MIN_RATIO,
      pass: contrastRatio(palette.text, palette.background) >= MIN_RATIO,
    });
  }

  // Check 2: Text vs stroke (le stroke doit contraster avec le texte)
  checks.push({
    pair: 'Text vs Stroke',
    color1: palette.text,
    color2: palette.stroke,
    ratio: parseFloat(contrastRatio(palette.text, palette.stroke).toFixed(2)),
    required: MIN_RATIO,
    pass: contrastRatio(palette.text, palette.stroke) >= MIN_RATIO,
  });

  // Check 3: Accent vs un fond blanc (pour les karaoke highlights)
  checks.push({
    pair: 'Accent sur Blanc',
    color1: palette.accent,
    color2: '#FFFFFF',
    ratio: parseFloat(contrastRatio(palette.accent, '#FFFFFF').toFixed(2)),
    required: 3.0, // Plus permissif pour l'accent (c'est un highlight, pas du texte)
    pass: contrastRatio(palette.accent, '#FFFFFF') >= 3.0,
  });

  // Check 4: Accent vs un fond noir (pour les karaoke highlights sur fond sombre)
  checks.push({
    pair: 'Accent sur Noir',
    color1: palette.accent,
    color2: '#000000',
    ratio: parseFloat(contrastRatio(palette.accent, '#000000').toFixed(2)),
    required: 3.0,
    pass: contrastRatio(palette.accent, '#000000') >= 3.0,
  });

  // Check 5: Text vs noir (lisibilité du texte avec stroke noir)
  checks.push({
    pair: 'Text vs Noir (stroke)',
    color1: palette.text,
    color2: '#000000',
    ratio: parseFloat(contrastRatio(palette.text, '#000000').toFixed(2)),
    required: MIN_RATIO,
    pass: contrastRatio(palette.text, '#000000') >= MIN_RATIO,
  });

  const allPass = checks.every(c => c.pass);
  const failCount = checks.filter(c => !c.pass).length;

  return {
    valid: allPass,
    checks,
    summary: allPass
      ? `✅ Palette "${palette.name}" : tous les contrastes OK (${checks.length} checks)`
      : `❌ Palette "${palette.name}" : ${failCount}/${checks.length} checks échoués`,
  };
}

// CLI mode
if (typeof process !== 'undefined' && process.argv?.[2]) {
  // Dynamically import palettes when run as CLI
  const paletteId = process.argv[2];
  console.log(`Validation de la palette: ${paletteId}`);
  console.log('(Importer les palettes depuis designKnowledge.ts pour exécuter)');
}
