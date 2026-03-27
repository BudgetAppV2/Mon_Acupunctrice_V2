/**
 * generate-preview.ts — Génère un preview HTML d'un VideoTheme
 * 
 * Produit un fichier HTML autonome qui simule un Reel 9:16 avec le thème appliqué.
 * Peut être ouvert dans le navigateur pour validation visuelle.
 * 
 * Usage: L'agent directeur artistique génère le HTML et le sauvegarde
 * dans /tmp ou le retourne comme artifact pour review.
 */

import type { VideoTheme } from '../../../lib/data/videoThemes';

interface PreviewPalette {
  text: string;
  accent: string;
  background: string;
  stroke: string;
}

export function generatePreviewHTML(theme: VideoTheme, palette: PreviewPalette): string {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${theme.fontTitle.replace(/ /g, '+')}:wght@400;700&family=${theme.fontSubtitle.replace(/ /g, '+')}:wght@400;600&display=swap`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${theme.name}</title>
  <link href="${googleFontUrl}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #1a1a1a; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      font-family: system-ui;
      color: white;
      gap: 24px;
      flex-wrap: wrap;
      padding: 20px;
    }
    .preview-card {
      width: 270px;
      height: 480px;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      background: linear-gradient(180deg, #3a5a40 0%, #588157 30%, #a3b18a 60%, #dad7cd 100%);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .preview-card.dark-bg {
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    .safe-zone {
      position: absolute;
      border: 1px dashed rgba(255,255,255,0.15);
    }
    .safe-top { top: 27px; left: 0; right: 0; height: 1px; }
    .safe-bottom { bottom: 80px; left: 0; right: 0; height: 1px; }
    .safe-right { top: 0; right: 30px; width: 1px; bottom: 0; }
    .hook-text {
      position: absolute;
      top: 80px;
      left: 20px;
      right: 50px;
      font-family: '${theme.fontTitle}', sans-serif;
      font-size: ${Math.round(theme.titleFontSize / 4)}px;
      font-weight: 700;
      color: ${palette.text};
      text-transform: uppercase;
      line-height: 1.1;
      -webkit-text-stroke: ${Math.max(0.5, 2/4)}px ${palette.stroke};
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    .subtitle-area {
      position: absolute;
      bottom: 100px;
      left: 20px;
      right: 50px;
      text-align: center;
    }
    .subtitle-line {
      font-family: '${theme.fontSubtitle}', sans-serif;
      font-size: ${Math.round(theme.subtitleFontSize / 4)}px;
      font-weight: 600;
      color: ${palette.text};
      line-height: 1.4;
      display: inline;
    }
    .subtitle-word {
      display: inline;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .subtitle-word.active {
      color: ${palette.accent};
      transform: scale(1.05);
      display: inline-block;
    }
    .subtitle-pill .subtitle-line {
      background: ${palette.background};
      padding: 4px 10px;
      border-radius: 8px;
      display: inline-block;
    }
    .subtitle-outline .subtitle-line {
      -webkit-text-stroke: 0.5px ${palette.stroke};
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    }
    .cta-area {
      position: absolute;
      bottom: 45px;
      left: 20px;
      right: 50px;
      text-align: center;
    }
    .cta-pill {
      display: inline-block;
      background: ${palette.accent};
      color: ${palette.text};
      font-family: '${theme.fontSubtitle}', sans-serif;
      font-size: ${Math.round(theme.subtitleFontSize / 4.5)}px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 20px;
    }
    .theme-info {
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
      text-align: center;
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      font-family: system-ui;
    }
    .ig-ui {
      position: absolute;
      right: 8px;
      bottom: 120px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .ig-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
    }
    .meta-panel {
      width: 300px;
      background: #2a2a2a;
      border-radius: 12px;
      padding: 20px;
      font-size: 12px;
      line-height: 1.8;
    }
    .meta-panel h3 { color: ${palette.accent}; margin-bottom: 8px; font-size: 16px; }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding: 4px 0; }
    .meta-label { color: #888; }
    .meta-value { color: #ddd; font-family: monospace; }
  </style>
</head>
<body>
  <!-- Preview Reel -->
  <div class="preview-card ${palette.text === '#1A1A1A' ? '' : (theme.paletteId.includes('dark') ? 'dark-bg' : '')}">
    <div class="safe-zone safe-top"></div>
    <div class="safe-zone safe-bottom"></div>
    <div class="safe-zone safe-right"></div>
    
    <div class="hook-text">
      Le conseil que je répète le plus en consultation
    </div>

    <div class="subtitle-area ${theme.subtitleStyle === 'pill' ? 'subtitle-pill' : 'subtitle-outline'}">
      <span class="subtitle-line">
        <span class="subtitle-word">L'acupuncture</span>
        <span class="subtitle-word active">peut</span>
        <span class="subtitle-word">vraiment</span>
        <span class="subtitle-word">aider</span>
      </span>
    </div>

    <div class="cta-area">
      <span class="cta-pill">Lien dans la bio</span>
    </div>

    <div class="ig-ui">
      <div class="ig-icon"></div>
      <div class="ig-icon"></div>
      <div class="ig-icon"></div>
      <div class="ig-icon"></div>
    </div>

    <div class="theme-info">${theme.name} — ${theme.id}</div>
  </div>

  <!-- Meta panel -->
  <div class="meta-panel">
    <h3>${theme.name}</h3>
    <p style="color: #aaa; margin-bottom: 12px;">${theme.description}</p>
    <div class="meta-row"><span class="meta-label">Font titre</span><span class="meta-value">${theme.fontTitle}</span></div>
    <div class="meta-row"><span class="meta-label">Font sous-titres</span><span class="meta-value">${theme.fontSubtitle}</span></div>
    <div class="meta-row"><span class="meta-label">Style sous-titres</span><span class="meta-value">${theme.subtitleStyle}</span></div>
    <div class="meta-row"><span class="meta-label">Palette</span><span class="meta-value">${theme.paletteId}</span></div>
    <div class="meta-row"><span class="meta-label">Filtre</span><span class="meta-value">${theme.filterId}</span></div>
    <div class="meta-row"><span class="meta-label">Animation</span><span class="meta-value">${theme.defaultAnimation}</span></div>
    <div class="meta-row"><span class="meta-label">Effet texte</span><span class="meta-value">${theme.defaultTextEffect}</span></div>
    <div class="meta-row"><span class="meta-label">Taille hook</span><span class="meta-value">${theme.titleFontSize}px</span></div>
    <div class="meta-row"><span class="meta-label">Taille sous-titres</span><span class="meta-value">${theme.subtitleFontSize}px</span></div>
    <div class="meta-row">
      <span class="meta-label">Couleurs</span>
      <span class="meta-value" style="display:flex;gap:4px;">
        <span style="width:16px;height:16px;background:${palette.text};border:1px solid #555;border-radius:3px;display:inline-block;" title="text"></span>
        <span style="width:16px;height:16px;background:${palette.accent};border:1px solid #555;border-radius:3px;display:inline-block;" title="accent"></span>
        <span style="width:16px;height:16px;background:${palette.stroke};border:1px solid #555;border-radius:3px;display:inline-block;" title="stroke"></span>
      </span>
    </div>
  </div>
</body>
</html>`;
}
