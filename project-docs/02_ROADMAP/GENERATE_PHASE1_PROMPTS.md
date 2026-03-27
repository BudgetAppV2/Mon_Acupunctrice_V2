# Tâche — Générer les prompts one-shot pour la Phase 1 (thèmes, typographie, sous-titres pro)

## Ta mission
Lis le plan de match, l'architecture, la knowledge base, et le code actuel,
puis génère les 6 prompts one-shot pour la Phase 1. Chaque prompt doit être
autonome, précis, et prêt à être exécuté par Claude Code.

**IMPORTANT :** Lis `skills/oneshot-prompt-writer/SKILL.md` EN PREMIER pour
le format exact des prompts (structure obligatoire, règles, conventions).

## Prérequis
La Phase 0 (convergence) sera déjà complétée quand ces prompts seront exécutés.
Ça veut dire :
- `activeThemeId` est dans le store Zustand
- FILTERS_V2 est la source de vérité des filtres
- Le catalogue de fonts est unifié dans designKnowledge.ts
- `wrapText()` est intégré dans drawOverlays.ts
- Le pipeline FFmpeg est retiré (WebCodecs uniquement)

## Documents de référence
1. `skills/oneshot-prompt-writer/SKILL.md` ← FORMAT DES PROMPTS
2. `CLAUDE.md` — contexte technique
3. `project-docs/PLAN_DE_MATCH.md` — plan de match (Phase 1 section)
4. `project-docs/DIRECTION.md` — document de direction
5. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — architecture
6. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE_REVIEW.md` — review Gemini
7. `project-docs/03_RESEARCH/VISUAL_ANALYSIS_RESEARCH.md` — données terrain
8. `project-docs/03_RESEARCH/VISUAL_TRENDS_2026_RESEARCH.md` — tendances 2026

## Code à analyser pour chaque prompt
9. `lib/data/designKnowledge.ts` — knowledge base (fonts, palettes, WCAG, wrapText)
10. `lib/data/videoThemes.ts` — 8 thèmes prédéfinis
11. `lib/store/useEditorStore.ts` — store Zustand (post-P0.1 : a activeThemeId)
12. `lib/types/editor.ts` — types (post-P0.1 : SubtitleStyleV2, TextEffectType, etc.)
13. `lib/utils/drawOverlays.ts` — rendu texte Canvas (post-P0.2 : a wrapText)
14. `lib/utils/drawSubtitles.ts` — rendu sous-titres Canvas
15. `lib/utils/exportWebCodecs.ts` — export pipeline (post-P0.3 : WebCodecs only)
16. `lib/utils/filters.ts` — filtres (post-P0.2 : re-exporte FILTERS_V2)
17. `lib/utils/fontLoader.ts` — fonts (post-P0.2 : unifié avec designKnowledge)
18. `components/features/editor/panels/TextPanel.tsx` — panel texte
19. `components/features/editor/panels/FilterPanel.tsx` — panel filtres
20. `components/features/editor/panels/SubtitlePanel.tsx` — panel sous-titres
21. `components/features/editor/EditorLayout.tsx` — layout éditeur (onglets)
22. `components/features/editor/VideoPreview.tsx` — preview vidéo

## Les 6 prompts à générer

### P1.1 — Fonts (15) + sélecteur catégorisé

**Objectif :** Intégrer les 15 fonts de designKnowledge dans l'éditeur avec un
sélecteur catégorisé (Impact / Élégant / Moderne / Cursif / Fun) dans TextPanel.

**Ce que le prompt doit couvrir :**
- Charger les fonts Google Fonts dynamiquement via document.fonts.load()
- Sélecteur de font dans TextPanel organisé par catégorie
- Mettre à jour l'overlay texte quand la font change
- L'export Canvas utilise la font sélectionnée (déjà géré par drawOverlays?)
- Preview temps réel de la font dans la preview DOM

### P1.2 — Sous-titres pro (3 nouveaux styles)

**Objectif :** Ajouter les styles bold_outline, pill, et karaoke_pro dans
drawSubtitles.ts avec le rendu Canvas pour chaque style.

**Ce que le prompt doit couvrir :**
- `bold_outline` : contour 6px noir, remplissage blanc, font bold
- `pill` : fond coloré arrondi derrière chaque ligne, texte centré
- `karaoke_pro` : mot actif en surbrillance (accent color du thème) + scale 1.1
- Algorithme de groupement amélioré (pauses > 300ms, ponctuation, max 37 chars)
- Sélecteur de style dans SubtitlePanel (6 styles total)
- Le style utilise les couleurs de la palette du thème actif

### P1.3 — Effets texte (3 effets Canvas)

**Objectif :** Ajouter les effets outline, glow, et pill_background dans
drawOverlays.ts pour les overlays texte.

**Ce que le prompt doit couvrir :**
- `outline` : strokeText avec contour 3px noir
- `glow` : shadowBlur + shadowColor + double draw
- `pill` : fond arrondi semi-transparent derrière le texte (mesurer le texte d'abord)
- Sélecteur d'effet dans TextPanel
- Chaque overlay a un champ `effect: TextEffectType`
- Le thème actif définit l'effet par défaut pour les nouveaux overlays

### P1.4 — Filtres enrichis (10 presets CSS)

**Objectif :** Étendre les filtres de 5 à 10 presets CSS avec preview
dans FilterPanel.

**Ce que le prompt doit couvrir :**
- Les 10 filtres de FILTERS_V2 dans designKnowledge.ts
- FilterPanel affiche les 10 filtres avec miniature preview
- Chaque thème a un filterId par défaut
- Quand le thème change, le filtre s'applique automatiquement
- L'export utilise le filtre via ctx.filter

### P1.5 — Système de Thèmes UI (ThemeSelector)

**Objectif :** Créer le ThemeSelector widget qui permet à Judith de choisir
un thème en 1 tap. Le thème applique font + filtre + style sous-titres + couleurs.

**Ce que le prompt doit couvrir :**
- Nouveau composant ThemeSelector (scroll horizontal de cartes miniatures)
- Chaque carte montre : nom du thème + preview visuel (couleurs + font sample)
- Tap sur un thème = applique tout (setActiveTheme + setFilter + etc.)
- 5 thèmes au lancement (Sage Zen, Minimal Chic, Terre & Chaleur, Bold Énergie, Raw Authentique)
- Placement dans l'éditeur : nouvel onglet "Style" ou en haut du panel Filtre
- Les options individuelles (font, filtre, effet) restent modifiables après
  application du thème (mode "avancé")

### P1.6 — Preview haute qualité

**Objectif :** Sur pause, générer la frame courante avec TOUS les effets via
Canvas et l'afficher au-dessus de la preview DOM.

**Ce que le prompt doit couvrir :**
- Quand la vidéo est en pause, générer une frame Canvas avec :
  - Le filtre CSS appliqué via ctx.filter
  - Les overlays texte avec leurs effets (outline, glow, pill)
  - Les sous-titres avec le style actif
  - Le word-wrap
- Afficher le Canvas frame au-dessus du <video> element
- Quand play reprend, cacher le Canvas frame (retour au DOM preview)
- Le Canvas utilise les MÊMES fonctions que l'export (drawOverlays, drawSubtitles)
- Performance : générer la frame en < 100ms (c'est une seule frame)

## Format de sortie

Pour chaque prompt, génère un fichier PROMPT.md dans :
- `project-docs/02_ROADMAP/prompts_used/P1.1_fonts/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P1.2_subtitles_pro/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P1.3_text_effects/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P1.4_filters/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P1.5_theme_selector/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P1.6_preview_hq/PROMPT.md`

## Contraintes pour la génération
- Chaque prompt est AUTONOME
- Citer les fichiers et lignes EXACTES du code actuel
- Ordre d'exécution : P1.1 → P1.2 → P1.3 → P1.4 → P1.5 → P1.6
- Chaque prompt passe `tsc --noEmit` et `npm run build`
- Mobile first 375px, Heroicons, 0 console.log, composants < 150 lignes

## Référence
- `skills/oneshot-prompt-writer/SKILL.md` ← **LIS CE FICHIER EN PREMIER**
- `CLAUDE.md`
