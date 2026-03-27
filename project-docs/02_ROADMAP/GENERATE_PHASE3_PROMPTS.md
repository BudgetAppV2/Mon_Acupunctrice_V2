# Tâche — Générer les prompts one-shot pour la Phase 3 (auto-silence, templates, Lottie, transitions)

## Ta mission
Lis le plan de match, l'architecture, et le code actuel (post-Phase 0, 1 et 2),
puis génère les 4 prompts one-shot pour la Phase 3.

**IMPORTANT :** Lis `skills/oneshot-prompt-writer/SKILL.md` EN PREMIER pour
le format exact des prompts.

## Prérequis
Phases 0, 1 et 2 seront déjà complétées quand ces prompts seront exécutés.

Ça veut dire :
- Store convergé : `activeThemeId`, types V2, persistance thème
- 15 fonts Google Fonts, sélecteur catégorisé, wrapText intégré
- 3 styles sous-titres pro (bold_outline, pill, karaoke_pro)
- 3 effets texte (outline, glow, pill_background)
- 10 filtres CSS (FILTERS_V2)
- ThemeSelector UI (5 thèmes, 1-clic)
- Preview HQ (frame Canvas sur pause)
- Export dans Web Worker (OffscreenCanvas)
- 5 animations texte (fade_in, typewriter, scale_pop, slide_up, bounce)
- Audio ducking (détection voix par amplitude, auto-baisse musique)
- Undo/redo (Zustand temporal, 30 états)
- Pipeline WebCodecs uniquement (pas de FFmpeg)

## Documents de référence
1. `skills/oneshot-prompt-writer/SKILL.md` ← FORMAT DES PROMPTS
2. `CLAUDE.md`
3. `project-docs/PLAN_DE_MATCH.md` — Phase 3 section
4. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — architecture (section templates, stickers, transitions)
5. `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` — transitions Canvas, Lottie renderer
6. `project-docs/03_RESEARCH/VISUAL_ANALYSIS_RESEARCH.md` — pattern hooks viraux

## Code à analyser
7. `lib/store/useEditorStore.ts` — store (post-Phase 2)
8. `lib/utils/exportWebCodecs.ts` — export pipeline
9. `lib/utils/drawOverlays.ts` — rendu texte Canvas
10. `lib/utils/drawSubtitles.ts` — rendu sous-titres
11. `lib/data/designKnowledge.ts` — knowledge base
12. `lib/data/videoThemes.ts` — thèmes
13. `lib/hooks/useVideoExport.ts` — orchestrateur export
14. `lib/hooks/useTranscription.ts` — transcription Whisper (contient les timestamps audio)
15. `components/features/editor/panels/AudioPanel.tsx` — panel audio

## Les 4 prompts à générer

### P3.1 — Auto-silence removal

**Objectif :** Scanner l'audio de la vidéo source et couper automatiquement
les silences > 0.8s pour donner un rythme pro aux Reels talking head.

**Ce que le prompt doit couvrir :**
- Analyser l'audio via Web Audio API (décoder le fichier vidéo source)
- Détecter les segments de silence (RMS < seuil pendant > 0.8s)
- Produire un tableau de segments à garder [{start, end}]
- UI : bouton "Couper les silences" dans le panel audio ou timeline
- Preview : montrer les zones de silence sur la timeline (bandes grises)
- Application : créer des clips multiples via le store multi-clip (addClip pour chaque segment non-silencieux)
- L'utilisateur peut ajuster le seuil de silence (slider 0.3s → 1.5s)
- Undo : le undo/redo (P2.4) doit pouvoir restaurer l'état avant la coupe
- ATTENTION : cette feature dépend du multi-clip M1 (clips[]) qui est déjà implémenté.
  Elle ne nécessite PAS M2 (timeline multi-clip) — on crée les clips mais
  l'export les concatène séquentiellement comme aujourd'hui.

### P3.2 — Templates V1

**Objectif :** Permettre à Judith d'appliquer un template structurel à sa vidéo.
Un template = thème + sections prédéfinies (hook, contenu, CTA) avec texte placeholder.

**Ce que le prompt doit couvrir :**
- Schema `VideoTemplate` dans un nouveau fichier `lib/data/videoTemplates.ts`
- 4 templates de base (1 par style de contenu de Judith) :
  - "Hook & Teach" (enseigner) — hook bold 0-2s + 3 points + CTA
  - "Story Time" (connecter) — intro personnelle + anecdote + leçon
  - "Quick Tip" (aider) — hook question + réponse en 30s + CTA
  - "Inspiration Quote" (inspirer) — citation + explication + CTA
- Chaque template définit : themeId + sections [{type, startPercent, endPercent, textPreset}]
- Application d'un template : applique le thème + crée les overlays texte aux bonnes positions
- UI : page ou modal de sélection de template (4 cartes avec preview)
- Le template est un point de départ — Judith peut modifier chaque texte après application
- Undo/redo doit tracker l'application du template

### P3.3 — Stickers Lottie

**Objectif :** Intégrer lottie-web pour ajouter des stickers animés sur les vidéos.

**Ce que le prompt doit couvrir :**
- Installer lottie-web (~250KB)
- Interface `StickerItem` : lottieUrl, position (x,y), scale, rotation, startTime, endTime, loop
- Ajouter un panel "Stickers" dans l'éditeur
- Bibliothèque de 10-15 stickers santé/bien-être (fichiers JSON Lottie)
  - Sources : LottieFiles.com catégorie Health & Wellness (vérifier licence)
  - Ou créer des stickers simples (étoiles, cœurs, flèches, check marks)
- Preview DOM : afficher le sticker Lottie en overlay sur la vidéo
- Export Canvas : lottie.loadAnimation() avec renderer 'canvas',
  goToAndStop(frame, true) pour chaque frame d'export
- ATTENTION : les assets Lottie JSON doivent être chargés AVANT le début
  de la boucle d'export WebCodecs (sinon frames vides)
- Le sticker est draggable et resizable dans la preview
- Timing : le sticker apparaît/disparaît basé sur startTime/endTime

### P3.4 — Transitions entre clips

**Objectif :** Ajouter des transitions visuelles entre les clips vidéo.

**Ce que le prompt doit couvrir :**
- PRÉREQUIS : multi-clip M2 (timeline multi-clip) doit être implémenté
  avant cette feature. Si M2 n'est pas fait, ce prompt est en attente.
- 6 transitions Canvas 2D :
  - dissolve (cross-fade opacity)
  - slide_left, slide_right (translation horizontale)
  - wipe_down (révélation verticale)
  - zoom_in (scale + fade)
  - blur (flou → net)
- Interface `Transition` : type, duration (200-1000ms)
- Dans l'export : pendant la zone de transition, les 2 clips sont rendus
  simultanément sur le Canvas avec l'effet de transition
- UI : icône entre les clips dans la timeline, tap → sélecteur de transition
- Chaque transition a une durée ajustable (défaut 500ms)
- Le thème actif peut définir une transition par défaut
- Les transitions utilisent requestAnimationFrame pour la preview
  et le seek-based loop pour l'export

## Format de sortie

Pour chaque prompt, génère un fichier PROMPT.md dans :
- `project-docs/02_ROADMAP/prompts_used/P3.1_auto_silence/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P3.2_templates/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P3.3_stickers_lottie/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P3.4_transitions/PROMPT.md`

## Contraintes pour la génération
- Chaque prompt est AUTONOME
- Citer les fichiers et lignes EXACTES du code actuel
- Ordre d'exécution : P3.1 → P3.2 → P3.3 → P3.4
- P3.4 dépend de multi-clip M2 — le mentionner clairement
- Chaque prompt passe `tsc --noEmit` et `npm run build`
- Mobile first 375px, Heroicons, 0 console.log, composants < 150 lignes

## Référence
- `skills/oneshot-prompt-writer/SKILL.md` ← **LIS CE FICHIER EN PREMIER**
- `CLAUDE.md`
