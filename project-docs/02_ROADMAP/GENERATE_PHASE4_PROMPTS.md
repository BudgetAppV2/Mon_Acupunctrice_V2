# Tâche — Générer les prompts one-shot pour la Phase 4 (LUTs, grain, templates V2, animations avancées)

## Ta mission
Lis le plan de match, l'architecture, et le code actuel (post-Phase 0, 1, 2 et 3),
puis génère les 4 prompts one-shot pour la Phase 4.

**IMPORTANT :** Lis `skills/oneshot-prompt-writer/SKILL.md` EN PREMIER pour
le format exact des prompts.

## Prérequis
Phases 0, 1, 2 et 3 seront déjà complétées quand ces prompts seront exécutés.

Ça veut dire :
- Store convergé : activeThemeId, types V2, persistance, undo/redo (30 snapshots)
- 15 fonts Google Fonts, sélecteur catégorisé, wrapText intégré
- 6 styles sous-titres (classic, tiktok, karaoke, bold_outline, pill, karaoke_pro)
- 4 effets texte (outline, double_outline, glow, pill)
- 5 animations texte (fade_in, typewriter, scale_pop, slide_up, bounce)
- 10 filtres CSS (FILTERS_V2)
- ThemeSelector UI (5 thèmes, 1-clic)
- Preview HQ (frame Canvas sur pause avec tous effets)
- Export dans Web Worker (OffscreenCanvas) — UI réactive pendant export
- Audio ducking (détection voix par amplitude, auto-baisse musique)
- Auto-silence removal (coupe silences > 0.8s)
- Templates V1 (4 templates, 1 par style de contenu)
- Stickers Lottie (lottie-web, bibliothèque santé, rendu frame-by-frame)
- Transitions Canvas 2D entre clips (si multi-clip M2 fait)
- Pipeline WebCodecs uniquement

## Documents de référence
1. `skills/oneshot-prompt-writer/SKILL.md` ← FORMAT DES PROMPTS
2. `CLAUDE.md`
3. `project-docs/PLAN_DE_MATCH.md` — Phase 4 section
4. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — architecture
5. `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` — LUTs .cube, grain, animations avancées

## Code à analyser
6. `lib/store/useEditorStore.ts` — store (post-Phase 3)
7. `lib/utils/exportWebCodecs.ts` — export pipeline (post-Worker P2.1)
8. `lib/utils/drawOverlays.ts` — rendu texte Canvas (post-P1.3 effets + P2.2 animations)
9. `lib/data/designKnowledge.ts` — knowledge base
10. `lib/data/videoThemes.ts` — thèmes
11. `lib/data/videoTemplates.ts` — templates V1 (post-P3.2)

## Les 4 prompts à générer

### P4.1 — LUTs cinématiques

**Objectif :** Appliquer des LUTs .cube pour du color grading cinématique
dans l'export. Les LUTs sont appliquées pixel-par-pixel via getImageData.

**Ce que le prompt doit couvrir :**
- Parser de fichier .cube (format standard 3D LUT)
  - Lire SIZE (typiquement 33 ou 64)
  - Parser les triplets RGB normalisés (0.0-1.0)
  - Construire la table 3D en mémoire
- Application de la LUT sur chaque frame d'export :
  - getImageData → pour chaque pixel, lookup dans la LUT 3D avec interpolation trilinéaire
  - putImageData
- 5 LUTs pré-packagées (fichiers .cube dans public/luts/) :
  - Warm Glow — tons chauds dorés (santé/bien-être)
  - Teal & Orange — cinématique Hollywood
  - Soft Pastel — doux et aérien
  - Clean Bright — propre et lumineux (tutoriel)
  - Vintage Film — couleurs désaturées rétro
- UI : sélecteur de LUT dans FilterPanel (séparé des filtres CSS)
  - Miniature preview pour chaque LUT
  - Slider d'intensité (0-100%) — blending entre original et LUT
- PERFORMANCE : ~50ms par frame pour 1080×1920. Sur une vidéo de 60s à 30fps
  (1800 frames), ça ajoute ~90s à l'export. C'est acceptable car l'export
  tourne dans le Worker (P2.1) et l'UI reste réactive.
- La LUT est appliquée APRÈS le filtre CSS dans le pipeline d'effets
- Preview HQ (P1.6) doit aussi montrer la LUT sur la frame pausée

### P4.2 — Grain film + vignette + light leaks

**Objectif :** Ajouter des effets de post-production cinématiques en Canvas 2D.

**Ce que le prompt doit couvrir :**
- **Grain film** :
  - Générer un bruit aléatoire (noise) sur le Canvas
  - Overlay en mode multiply ou overlay (compositing)
  - Paramètres : amount (0-0.2), size (1-3px)
  - Le grain doit être différent à chaque frame (random seed basé sur frame number)
  - ~5ms par frame (très rapide)
- **Vignette** :
  - Radial gradient du centre vers les bords
  - ctx.createRadialGradient + globalCompositeOperation 'multiply'
  - Paramètres : intensity (0-0.5), radius (0.5-1.0)
  - ~2ms par frame
- **Light leaks** (optionnel, bonus) :
  - Overlay de taches lumineuses semi-transparentes
  - Position et opacité varient lentement avec le temps
  - ctx.globalCompositeOperation 'screen' ou 'lighten'
- UI : toggles + sliders dans FilterPanel (section "Effets cinématiques")
- Ces effets font partie de l'effectStack du thème
- Chaque thème peut définir des valeurs par défaut de grain/vignette
- Preview HQ doit les montrer

### P4.3 — Templates V2 (12 templates complets)

**Objectif :** Étendre les 4 templates V1 à 12 templates complets avec
placeholders éditables et preview avant application.

**Ce que le prompt doit couvrir :**
- 12 templates (3 par style de contenu de Judith) :
  - **Enseigner (3)** : Hook & Teach, 3 Points, Myth Buster
  - **Connecter (3)** : Story Time, Before/After, Day in the Life
  - **Aider (3)** : Quick Tip, Step by Step, DIY Guide
  - **Inspirer (3)** : Testimonial, Transformation, Quote Card
- Chaque template a des sections avec texte placeholder éditable
  - Ex: "{{hook}}" → Judith tape son propre hook
  - Les placeholders sont pré-remplis avec des suggestions contextuelle
- Page de sélection de template améliorée :
  - Filtrage par style (enseigner/connecter/aider/inspirer)
  - Preview miniature de chaque template (Canvas 270×480)
  - Tap → preview plein écran → "Appliquer" ou "Retour"
- L'application du template crée les overlays texte avec le bon timing,
  applique le thème associé, et pré-remplit les placeholders
- Undo/redo doit tracker l'application complète du template comme 1 action

### P4.4 — Animations texte avancées

**Objectif :** Ajouter 3 animations texte avancées pour enrichir les
possibilités créatives.

**Ce que le prompt doit couvrir :**
- 3 animations avancées :
  - **wave** : chaque lettre ondule verticalement avec un décalage temporel
    (sin(time + index * phase))
  - **glitch** : distortion numérique (décalage horizontal aléatoire,
    changement de couleur, artifacts rectangulaires) pendant 200-500ms
  - **rotate_in** : rotation de -90° à 0° + fade in
- Fonctions d'easing additionnelles si nécessaire
- Ces animations sont dans la catégorie "avancées" du sélecteur
  (séparées des 5 animations de base P2.2)
- NOTE pour la niche santé : le glitch doit être subtil et court
  (200ms max). La review Gemini et les données terrain indiquent que
  le glitch intense est dans la liste noire pour la niche santé.
  L'implémenter quand même car Judith peut l'utiliser ponctuellement
  pour un contenu "Bold Énergie", mais ne PAS le mettre comme défaut
  dans aucun thème.
- Le wave est l'animation la plus applicable pour la niche — doux,
  organique, naturel.

## Format de sortie

Pour chaque prompt, génère un fichier PROMPT.md dans :
- `project-docs/02_ROADMAP/prompts_used/P4.1_luts/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P4.2_grain_vignette/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P4.3_templates_v2/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P4.4_animations_advanced/PROMPT.md`

## Contraintes pour la génération
- Chaque prompt est AUTONOME
- Citer les fichiers et lignes EXACTES du code actuel
- Ordre d'exécution : P4.1 → P4.2 → P4.3 → P4.4
- Chaque prompt passe `tsc --noEmit` et `npm run build`
- Mobile first 375px, Heroicons, 0 console.log, composants < 150 lignes

## Référence
- `skills/oneshot-prompt-writer/SKILL.md` ← **LIS CE FICHIER EN PREMIER**
- `CLAUDE.md`
