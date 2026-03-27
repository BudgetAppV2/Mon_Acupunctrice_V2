# Tâche — Générer les prompts one-shot pour la Phase 2 (worker, animations, ducking, undo/redo)

## Ta mission
Lis le plan de match, l'architecture, et le code actuel (post-Phase 0 et Phase 1),
puis génère les 4 prompts one-shot pour la Phase 2.

**IMPORTANT :** Lis `skills/oneshot-prompt-writer/SKILL.md` EN PREMIER pour
le format exact des prompts.

## Prérequis
Phase 0 (convergence) et Phase 1 (thèmes, fonts, sous-titres, effets, filtres,
preview HQ) seront déjà complétées quand ces prompts seront exécutés.

Ça veut dire :
- `activeThemeId` est dans le store avec persistance
- 15 fonts Google Fonts chargées dynamiquement, sélecteur catégorisé
- 3 nouveaux styles sous-titres (bold_outline, pill, karaoke_pro) dans drawSubtitles
- 3 effets texte (outline, glow, pill) dans drawOverlays avec wrapText
- 10 filtres CSS (FILTERS_V2 est la source de vérité)
- ThemeSelector UI (5 thèmes, application 1-clic)
- Preview HQ (frame Canvas sur pause avec tous effets)
- Pipeline export WebCodecs uniquement (pas de FFmpeg)

## Documents de référence
1. `skills/oneshot-prompt-writer/SKILL.md` ← FORMAT DES PROMPTS
2. `CLAUDE.md`
3. `project-docs/PLAN_DE_MATCH.md` — Phase 2 section
4. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — architecture

## Code à analyser
5. `lib/utils/exportWebCodecs.ts` — export pipeline (post-P0.3)
6. `lib/store/useEditorStore.ts` — store (post-P0.1)
7. `lib/hooks/useVideoExport.ts` — orchestrateur export (post-P0.3)
8. `lib/utils/drawOverlays.ts` — rendu texte (post-P0.2 + P1.3)
9. `lib/utils/drawSubtitles.ts` — rendu sous-titres (post-P1.2)
10. `lib/data/designKnowledge.ts` — knowledge base
11. `components/features/editor/VideoPreview.tsx`

## Les 4 prompts à générer

### P2.1 — Export Worker OffscreenCanvas

**Objectif :** Déplacer le rendering d'export dans un Web Worker avec
OffscreenCanvas pour ne pas bloquer l'UI pendant l'export.

**Ce que le prompt doit couvrir :**
- Créer un Web Worker (`lib/workers/exportWorker.ts`)
- Transférer le Canvas via OffscreenCanvas (transferControlToOffscreen)
- Le Worker reçoit : fichier vidéo (via transferable), trim points, filtre,
  overlays, sous-titres, thème actif
- Le Worker exécute exportWithWebCodecs et renvoie le Blob final
- L'UI montre la progression via Worker.postMessage
- Fallback : si OffscreenCanvas n'est pas supporté, export sur le main thread (comme avant)
- Safari iOS 16.5+ supporte OffscreenCanvas
- ATTENTION : document.fonts n'est PAS disponible dans un Worker —
  les fonts doivent être préchargées AVANT de démarrer le Worker

### P2.2 — Animations texte (5 animations)

**Objectif :** Ajouter 5 animations texte frame-by-frame dans drawOverlays
pour l'export et la preview HQ.

**Ce que le prompt doit couvrir :**
- 5 animations : fade_in, typewriter, scale_pop, slide_up, bounce
- Fonctions d'easing en pur JS (easeOutCubic, easeOutBounce, easeOutElastic)
- Rendu frame-by-frame : chaque animation calcule son état à `globalTime`
- Chaque overlay a `animation: TextAnimationType` et `animationDuration: number`
- Le thème définit l'animation par défaut pour les nouveaux overlays
- L'animation ne joue que pendant les N premières secondes de l'overlay
  (de startTime à startTime + animationDuration)
- Sélecteur d'animation dans TextPanel
- La preview HQ (P1.6) montre l'animation à la frame courante

### P2.3 — Audio ducking

**Objectif :** Auto-baisser le volume de la musique de fond quand Judith parle.

**Ce que le prompt doit couvrir :**
- Détecter les segments de voix dans l'audio de la vidéo source
  (via amplitude : si RMS > seuil → voix détectée)
- Pendant l'export : baisser le volume de la musique de fond dans les segments
  où la voix est détectée (ex: musique à 30% quand voix, 100% sinon)
- Transition douce (fade 200ms) entre les niveaux de volume
- Web Audio API : AnalyserNode ou simple calcul RMS sur les samples
- L'UI montre un toggle "Audio ducking" dans AudioPanel
- Le ducking est calculé AVANT l'export (pendant la phase "preparing")
  et stocké comme un tableau de segments [{start, end, hasVoice}]
- Pas de ML (Silero VAD) — juste détection par amplitude (simple, rapide)

### P2.4 — Undo/redo

**Objectif :** Permettre de défaire/refaire les actions dans l'éditeur.

**Ce que le prompt doit couvrir :**
- Zustand temporal middleware (ou implémentation custom)
- Boutons undo/redo dans le header de l'éditeur (ArrowUturnLeftIcon, ArrowUturnRightIcon)
- Actions qui sont trackées : trim, filtre, ajout/suppression overlay,
  modification overlay, ajout/suppression sous-titres, changement de thème
- Actions qui ne sont PAS trackées : play/pause, seekTo, currentTime
  (trop fréquentes, pollueraient l'historique)
- Limite de 30 états dans l'historique
- Raccourci clavier Ctrl+Z / Ctrl+Shift+Z (si sur desktop)
- L'undo/redo doit fonctionner AVANT l'arrivée des templates et de
  l'auto-silence (Phase 3) qui modifient le store de façon complexe

## Format de sortie

Pour chaque prompt, génère un fichier PROMPT.md dans :
- `project-docs/02_ROADMAP/prompts_used/P2.1_export_worker/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P2.2_text_animations/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P2.3_audio_ducking/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P2.4_undo_redo/PROMPT.md`

## Contraintes pour la génération
- Chaque prompt est AUTONOME
- Citer les fichiers et lignes EXACTES du code actuel
- Ordre d'exécution : P2.1 → P2.2 → P2.3 → P2.4
- Chaque prompt passe `tsc --noEmit` et `npm run build`
- Mobile first 375px, Heroicons, 0 console.log, composants < 150 lignes

## Référence
- `skills/oneshot-prompt-writer/SKILL.md` ← **LIS CE FICHIER EN PREMIER**
- `CLAUDE.md`
