# Architecture — Éditeur Pro Mon Acupunctrice Hub

## Vue d'ensemble

Ce document définit l'architecture du rendering pipeline, le modèle de composition,
le système d'effets, et le plan d'implémentation pour transformer l'éditeur de base
en un éditeur de qualité professionnelle.

**Principe fondamental :** Tout est construit en Canvas 2D natif + WebCodecs.
Pas de framework externe lourd (PixiJS, Fabric.js, Three.js). La seule dépendance
externe est lottie-web pour les stickers animés. WebGL sera ajouté uniquement pour
les LUTs cinématiques si nécessaire.

## 1. Rendering Pipeline

### Architecture à 2 niveaux

```
┌─────────────────────────────────────────────────────┐
│                    PREVIEW (temps réel)               │
│                                                       │
│  <video> element                                      │
│       ↓                                               │
│  CSS filters (brightness, contrast, saturate)         │
│       ↓                                               │
│  DOM overlays (texte interactif, sous-titres)         │
│       ↓                                               │
│  Visible dans la preview à ~30fps                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    EXPORT (offline, seek-based)        │
│                                                       │
│  Pour chaque frame :                                  │
│    1. video.currentTime = t → onseeked                │
│    2. ctx.drawImage(video) sur Canvas 1080×1920       │
│    3. applyEffectStack(ctx, frame, t)                 │
│       ├── Filter CSS → ctx.filter                     │
│       ├── LUT → getImageData + pixel mapping          │
│       ├── Grain → noise overlay compositing           │
│       └── Vignette → radialGradient overlay           │
│    4. drawTextOverlays(ctx, overlays, t)              │
│       ├── Font loading + Canvas text API              │
│       ├── Text effects (glow, outline, gradient...)   │
│       └── Text animations (easing, keyframes)         │
│    5. drawSubtitles(ctx, subtitles, style, t)         │
│       ├── Word grouping + timing                      │
│       ├── Style rendering (pill, karaoke, outline)    │
│       └── Word-by-word animation                      │
│    6. drawStickers(ctx, stickers, t)                  │
│       └── Lottie goToAndStop(frame) + render()        │
│    7. VideoEncoder.encode(frame)                      │
│    8. AudioEncoder (voix + musique + ducking)         │
│                                                       │
│  Muxer → MP4 Blob                                     │
└─────────────────────────────────────────────────────┘
```

### Principe clé : le preview est simple, l'export est riche

Le preview utilise CSS/DOM pour la rapidité (pas de Canvas temps réel).
L'export utilise Canvas 2D pour la qualité maximale frame-par-frame.
Les effets avancés (LUT, grain, animations complexes) ne sont visibles
qu'à l'export — le preview montre une approximation CSS.

## 2. Modèle de composition (Layer System)

### Structure de données

```typescript
interface Composition {
  id: string;
  clips: VideoClip[];           // Piste vidéo (séquentielle)
  textLayers: TextOverlayItem[]; // Overlays texte avec timing
  subtitleLayer: {
    segments: SubtitleSegment[];
    style: SubtitleStyle;        // Étendu avec les nouveaux styles
  };
  stickerLayers: StickerItem[];  // Stickers Lottie avec timing
  audioTrack: {
    url: string | null;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    ducking: boolean;            // Auto-ducking quand voix détectée
  };
  effectStack: EffectConfig[];   // Pipeline d'effets global
  template?: TemplateRef;        // Template appliqué (optionnel)
}
```

### Effect Stack (pipeline d'effets chainable)

```typescript
interface EffectConfig {
  type: 'filter' | 'lut' | 'grain' | 'vignette' | 'light_leak' | 'chromatic';
  enabled: boolean;
  params: Record<string, number | string>;
}

// Exemple de stack d'effets :
const effectStack: EffectConfig[] = [
  { type: 'filter', enabled: true, params: { brightness: 1.05, contrast: 1.1, saturate: 1.15 } },
  { type: 'lut', enabled: true, params: { name: 'warm_glow', intensity: 0.7 } },
  { type: 'grain', enabled: true, params: { amount: 0.08, size: 1.5 } },
  { type: 'vignette', enabled: true, params: { intensity: 0.3, radius: 0.7 } },
];
```

### Rendering de l'effect stack (export)

```typescript
function applyEffectStack(ctx: CanvasRenderingContext2D, effects: EffectConfig[], t: number) {
  for (const fx of effects) {
    if (!fx.enabled) continue;
    switch (fx.type) {
      case 'filter':
        // Déjà appliqué via ctx.filter avant drawImage
        break;
      case 'lut':
        applyLUT(ctx, fx.params.name as string, fx.params.intensity as number);
        break;
      case 'grain':
        applyGrain(ctx, fx.params.amount as number, fx.params.size as number, t);
        break;
      case 'vignette':
        applyVignette(ctx, fx.params.intensity as number, fx.params.radius as number);
        break;
      // ...
    }
  }
}
```

## 3. Système de texte avancé

### Text Effects

```typescript
type TextEffect =
  | 'none'           // Texte brut
  | 'outline'        // Contour simple
  | 'double_outline' // Double contour (blanc + noir)
  | 'glow'           // Lueur néon
  | 'gradient'       // Texte dégradé
  | 'shadow_3d'      // Ombre 3D multiple
  | 'pill'           // Fond arrondi derrière le texte
  | 'emboss';        // Relief

interface TextOverlayItem {
  // ... champs existants ...
  effect: TextEffect;
  effectParams: {
    outlineColor?: string;
    outlineWidth?: number;
    glowColor?: string;
    glowSize?: number;
    gradientColors?: [string, string];
    pillColor?: string;
    pillOpacity?: number;
  };
  animation: TextAnimation;
  animationDuration: number;  // durée de l'animation d'entrée (en secondes)
}
```

### Text Animations (frame-by-frame)

```typescript
type TextAnimation =
  | 'none'
  | 'fade_in'         // Opacité 0 → 1
  | 'typewriter'      // Lettre par lettre
  | 'word_reveal'     // Mot par mot, fade in
  | 'scale_pop'       // Zoom in avec bounce
  | 'slide_up'        // Glissement du bas
  | 'slide_left'      // Glissement de la gauche
  | 'bounce'          // Rebond physique
  | 'rotate_in'       // Rotation + fade
  | 'blur_in'         // De flou à net
  | 'wave'            // Chaque lettre ondule
  | 'glitch';         // Distortion numérique

// Fonctions d'easing (pur JS, pas de librairie)
function easeOutBounce(t: number): number { ... }
function easeOutElastic(t: number): number { ... }
function easeOutCubic(t: number): number { ... }

// Rendu d'une animation frame-par-frame
function renderTextAnimation(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlayItem,
  globalTime: number,
) {
  const elapsed = globalTime - overlay.startTime;
  const progress = Math.min(elapsed / overlay.animationDuration, 1);
  const eased = easeOutCubic(progress);

  switch (overlay.animation) {
    case 'fade_in':
      ctx.globalAlpha = eased;
      drawText(ctx, overlay);
      ctx.globalAlpha = 1;
      break;
    case 'scale_pop':
      const scale = 0.3 + 0.7 * easeOutElastic(progress);
      ctx.save();
      ctx.translate(overlay.x, overlay.y);
      ctx.scale(scale, scale);
      drawText(ctx, overlay, 0, 0);
      ctx.restore();
      break;
    // ...
  }
}
```

## 4. Sous-titres avancés

### Styles

```typescript
type SubtitleStyle =
  | 'classic'        // Blanc, ombre portée (existant)
  | 'tiktok'         // Style TikTok (existant)
  | 'karaoke'        // Mot actif en surbrillance (existant, à améliorer)
  | 'bold_outline'   // Gros texte, contour noir épais
  | 'pill'           // Fond coloré arrondi par mot/ligne
  | 'neon'           // Texte lumineux
  | 'minimal'        // Petit texte discret en bas
  | 'gradient'       // Texte avec dégradé
  | 'stacked'        // 2 lignes, grosse + petite
  | 'pop';           // Chaque mot apparaît avec scale animation
```

### Algorithme de groupement amélioré

```typescript
function groupWordsIntoSegments(
  words: SubtitleWord[],
  maxCharsPerLine: number = 37,
  maxWordsPerGroup: number = 7,
  silenceThreshold: number = 0.3, // secondes
): SubtitleSegment[] {
  // Couper aux pauses naturelles (silence > 300ms)
  // Couper à la ponctuation (., !, ?, ;)
  // Max 37 caractères par ligne (mobile 9:16)
  // Max 7 mots par groupe
  // Max 2 lignes simultanées
}
```

## 5. Fonts

### Catalogue de 30 fonts (Google Fonts, OFL)

Organisées en 5 catégories pour le sélecteur UI :
- **Impact** (8) : Bebas Neue, Anton, Staatliches, Righteous, Archivo Black, Oswald, Barlow Condensed, Bangers
- **Élégant** (5) : Playfair Display, Cormorant Garamond, DM Serif Display, Lora, Abril Fatface
- **Moderne** (7) : Montserrat, Poppins, Inter, Space Grotesk, Raleway, Work Sans, Nunito
- **Cursif** (6) : Dancing Script, Pacifico, Caveat, Shadows Into Light, Satisfy, Sacramento
- **Fun** (4) : Lobster, Itim, Permanent Marker, Amatic SC

### Chargement pour Canvas

```typescript
// Précharger une font pour le Canvas
async function loadFont(family: string): Promise<void> {
  if (document.fonts.check(`16px "${family}"`)) return;
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  await document.fonts.load(`16px "${family}"`);
}
```

## 6. Filtres et LUTs

### Filtres CSS enrichis (preview + export)

```typescript
const FILTERS_V2 = [
  // Existants
  { id: 'normal', label: 'Normal', css: 'none' },
  { id: 'warm', label: 'Chaud', css: 'brightness(1.05) contrast(1.1) saturate(1.2) sepia(0.1)' },
  // Nouveaux
  { id: 'cool_blue', label: 'Bleu froid', css: 'brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(10deg)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.3) contrast(1.1) brightness(0.95) saturate(0.8)' },
  { id: 'high_contrast', label: 'Contraste+', css: 'contrast(1.3) brightness(1.05) saturate(1.1)' },
  { id: 'soft_glow', label: 'Doux', css: 'brightness(1.1) contrast(0.95) saturate(1.05)' },
  { id: 'dramatic', label: 'Dramatique', css: 'contrast(1.25) brightness(0.9) saturate(1.3)' },
  { id: 'pastel', label: 'Pastel', css: 'brightness(1.15) contrast(0.85) saturate(0.7)' },
  { id: 'bw', label: 'N&B', css: 'grayscale(1) contrast(1.2) brightness(1.05)' },
  { id: 'bw_warm', label: 'N&B chaud', css: 'grayscale(1) sepia(0.15) contrast(1.15)' },
];
```

### LUTs cinématiques (export seulement)

Appliquées pixel-par-pixel via getImageData dans l'export.
5 LUTs pré-packagées :
1. **Warm Glow** — tons chauds dorés (santé/bien-être)
2. **Teal & Orange** — cinématique Hollywood
3. **Soft Pastel** — doux et aérien
4. **Clean Bright** — propre et lumineux (tutoriel)
5. **Vintage Film** — grain + couleurs désaturées

## 7. Templates

### Schema JSON

```typescript
interface VideoTemplate {
  id: string;
  name: string;
  style: ContentStyle;            // enseigner | connecter | aider | inspirer
  thumbnail: string;              // URL preview
  duration: number;               // durée suggérée
  aspectRatio: '9:16';
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    title: string;                // Ex: 'Bebas Neue'
    body: string;                 // Ex: 'Poppins'
    subtitle: string;             // Ex: 'Inter'
  };
  subtitleStyle: SubtitleStyle;
  filter: string;                 // ID du filtre
  effectStack: EffectConfig[];
  sections: TemplateSection[];
}

interface TemplateSection {
  type: 'intro_hook' | 'main_content' | 'key_point' | 'cta' | 'outro';
  startPercent: number;           // 0-1, position relative dans la vidéo
  endPercent: number;
  textPreset: {
    text: string;                 // Placeholder : "{{hook}}", "{{cta}}"
    position: { x: number; y: number };
    fontSize: number;
    fontFamily: string;
    effect: TextEffect;
    animation: TextAnimation;
  };
}
```

### 12 templates par style

**Enseigner (3) :** Hook & Teach, 3 Points, Myth Buster
**Connecter (3) :** Story Time, Before/After, Day in the Life
**Aider (3) :** Quick Tip, Step by Step, DIY Guide
**Inspirer (3) :** Testimonial, Transformation, Quote Card

## 8. Stickers (Lottie)

### Intégration

```typescript
interface StickerItem {
  id: string;
  lottieUrl: string;             // URL du fichier JSON Lottie
  x: number;                     // Position relative (0-1)
  y: number;
  scale: number;
  rotation: number;
  startTime: number;
  endTime: number;
  loop: boolean;
}
```

### Rendu dans l'export

```typescript
import lottie from 'lottie-web';

function drawSticker(ctx: CanvasRenderingContext2D, sticker: StickerItem, globalTime: number) {
  const localTime = globalTime - sticker.startTime;
  const totalFrames = stickerAnimation.totalFrames;
  const fps = stickerAnimation.frameRate;
  const frame = Math.floor(localTime * fps) % totalFrames;

  // Lottie Canvas renderer : seek + render
  stickerAnimation.goToAndStop(frame, true);
  // Le Canvas renderer dessine directement sur notre ctx
}
```

## 9. Plan d'implémentation (révisé suite à review Gemini CLI)

### Principes de la review Gemini

1. **Thèmes > Options individuelles** — Judith ne veut pas 30 fonts × 8 effets × 11 animations.
   Elle veut cliquer "Minimal & Chic" et que tout s'applique. Le concept de `VideoTheme`
   en 1 clic est prioritaire sur les contrôles individuels.
2. **Preview haute qualité** — Les effets doivent être prévisualisables AVANT l'export.
   Un bouton pause qui génère la frame courante avec tous les effets via Canvas.
3. **Word-wrap** — Le texte doit gérer les retours à la ligne automatiquement.
4. **Auto-silence removal** — Feature "wow" : couper les silences > 0.8s automatiquement.
5. **LUTs reportées** — getImageData pixel-par-pixel est trop lent (50ms/frame = 90s
   pour 60s de vidéo). Reporté en Phase 4 ou après OffscreenCanvas Worker.

Voir la review complète : `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE_REVIEW.md`

### Phase 1 — Thèmes, typographie et sous-titres pro (Mois 1)

Objectif : impact visuel immédiat, 0 risque de performance, 0 nouvelle dépendance.

**P1.1 — Système de fonts + word-wrap (1 prompt)**
- 15 fonts Google Fonts clés (pas 30 — trop de choix = fatigue cognitive)
- Sélecteur catégorisé dans TextPanel (Impact / Élégant / Moderne / Cursif)
- Chargement Canvas via document.fonts.load()
- Fonction utilitaire `wrapText()` pour le Canvas (retour à la ligne auto)

**P1.2 — Sous-titres pro (2 prompts)**
- 3 nouveaux styles : `bold_outline`, `pill`, `karaoke_pro`
- Karaoke amélioré : mot actif en surbrillance + légèrement plus grand (scale 1.1)
- Algorithme de groupement amélioré (pauses > 300ms, ponctuation, max 37 chars/ligne)
- Rendu Canvas dans drawSubtitles.ts

**P1.3 — Système de Thèmes (VideoTheme) (2 prompts)**
- Interface `VideoTheme` (palette, fonts, subtitleStyle, filter, animation)
- 4-6 thèmes prédéfinis pour Judith (Minimal Chic, Nature Zen, Bold Energy, Soft Pastel)
- Sélecteur de thème dans l'éditeur (1 tap = tout s'applique)
- Le thème contrôle : font titre + font sous-titres + style sous-titres + filtre + couleurs
- Les options individuelles restent accessibles dans un mode "Avancé"

**P1.4 — Effets texte de base (1 prompt)**
- 3 effets prioritaires : `outline`, `glow`, `pill_background`
- Rendu Canvas dans drawOverlays.ts
- Contrôlés par le thème actif OU manuellement en mode avancé

**P1.5 — Filtres enrichis (1 prompt)**
- 10 presets CSS (vs 5 actuels)
- Preview temps réel via CSS filter
- Chaque thème a un filtre par défaut

### Phase 2 — Qualité et animations (Mois 2)

**P2.1 — Export Worker OffscreenCanvas (1 prompt)**
- Déplacer l'export dans un Web Worker pour ne pas bloquer l'UI
- OffscreenCanvas supporté sur Safari iOS 16.5+
- L'UI reste réactive pendant l'export

**P2.2 — Animations texte (2 prompts)**
- 5 animations prioritaires : fade_in, typewriter, scale_pop, slide_up, bounce
- Fonctions d'easing en pur JS (pas de librairie)
- Rendu frame-by-frame dans l'export

**P2.3 — Preview haute qualité (1 prompt)**
- Bouton "pause" qui génère la frame courante avec TOUS les effets via Canvas
- Affiche au-dessus de la preview DOM pour que Judith voie le résultat final
- Pas d'export complet — juste la frame courante

**P2.4 — Audio ducking (2 prompts)**
- Détection voix par amplitude (simple, pas de ML)
- Auto-baisse musique de fond quand Judith parle
- Web Audio API natif

### Phase 3 — Templates et contenu riche (Mois 3)

**P3.1 — Templates V1 (3 prompts)**
- Schema JSON pour les templates
- 4 templates de base (1 par style de contenu)
- Application d'un template = applique le thème + positionne les sections

**P3.2 — Auto-silence removal (1 prompt)**
- Scanner l'audio pour détecter les silences > 0.8s
- Couper automatiquement (créer des clips sans les silences)
- Feature "wow" très impact pour le rythme des Reels

**P3.3 — Stickers Lottie (2 prompts)**
- Intégration lottie-web (250KB)
- Bibliothèque de stickers santé/bien-être
- Rendu frame-by-frame dans l'export via goToAndStop()

**P3.4 — Transitions (3 prompts, nécessite multi-clip M2)**
- 6 transitions prioritaires : dissolve, slide, wipe, zoom, blur, circle reveal
- UI de sélection entre les clips
- Rendu dans l'export

### Phase 4 — Polish et avancé (Mois 4-6)

**P4.1 — LUTs cinématiques (2 prompts, après OffscreenCanvas Worker)**
**P4.2 — Grain film + vignette + light leaks (1 prompt)**
**P4.3 — Animations texte avancées (wave, glitch, rotate) (1 prompt)**
**P4.4 — Templates V2 (12 templates complets) (2 prompts)**
**P4.5 — Undo/redo (1 prompt)**
**P4.6 — WebGPU exploration (quand iOS 26 est majoritaire)**

## 10. Dépendances

| Dépendance | Taille | Rôle | Phase |
|------------|--------|------|-------|
| lottie-web | ~250KB | Stickers animés | Phase 3 |
| (aucune autre) | — | — | — |

**Tout le reste est en Canvas 2D natif + WebCodecs + APIs web standards.**

## 11. Fichiers clés à créer/modifier

### Nouveaux fichiers
```
lib/utils/textEffects.ts        — Rendu des effets texte Canvas
lib/utils/textAnimations.ts     — Animations texte frame-by-frame
lib/utils/easings.ts            — Fonctions d'easing
lib/utils/effectStack.ts        — Pipeline d'effets (LUT, grain, vignette)
lib/utils/lutParser.ts          — Parser de fichiers .cube
lib/utils/subtitleStyles.ts     — Rendu des 10 styles de sous-titres
lib/utils/stickerRenderer.ts    — Rendu Lottie frame-by-frame
lib/utils/fontCatalog.ts        — Catalogue de 30 fonts + chargement
lib/utils/templates.ts          — Schema + application de templates
lib/data/filters.ts             — 10 presets de filtres
lib/data/luts/                  — Fichiers .cube pré-packagés
lib/data/templates/             — 12 templates JSON
```

### Fichiers à modifier
```
lib/utils/drawOverlays.ts       — Ajouter effets + animations
lib/utils/drawSubtitles.ts      — Ajouter 7 nouveaux styles
lib/utils/exportWebCodecs.ts    — Intégrer effectStack + stickers
lib/utils/filters.ts            — Étendre à 10 presets
lib/store/useEditorStore.ts     — Ajouter effectStack, template
components/features/editor/panels/TextPanel.tsx  — Font selector, effects, animations
components/features/editor/panels/FilterPanel.tsx — LUTs, grain, vignette
```
