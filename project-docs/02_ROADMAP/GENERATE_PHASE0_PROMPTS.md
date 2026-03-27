# Tâche — Générer les prompts one-shot pour la Phase 0 (convergence)

## Ta mission
Lis le plan de match et le code actuel, puis génère les 3 prompts one-shot
pour la Phase 0 (convergence code/architecture). Chaque prompt doit être
autonome, précis, et prêt à être exécuté par Claude Code.

## Ce que tu dois lire

### Documents de référence
1. `CLAUDE.md` — contexte technique
2. `project-docs/PLAN_DE_MATCH.md` — plan de match complet avec Phase 0
3. `project-docs/DIRECTION.md` — document de direction
4. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — architecture cible
5. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE_REVIEW.md` — review Gemini

### Code actuel à analyser pour chaque prompt
6. `lib/store/useEditorStore.ts` — store actuel (pas d'activeTheme)
7. `lib/types/editor.ts` — types V1 actuels
8. `lib/hooks/useEditorPersistence.ts` — persistance (pas de thème)
9. `lib/data/designKnowledge.ts` — knowledge base V2 (FILTERS_V2, FONTS, etc.)
10. `lib/data/videoThemes.ts` — thèmes V2
11. `lib/utils/filters.ts` — FILTERS V1 (à migrer vers FILTERS_V2)
12. `lib/utils/fontLoader.ts` — chargement fonts V1 (à unifier)
13. `lib/utils/drawOverlays.ts` — rendu texte (pas de wrapText)
14. `lib/utils/drawSubtitles.ts` — rendu sous-titres
15. `lib/utils/exportWebCodecs.ts` — export pipeline
16. `lib/hooks/useVideoExport.ts` — orchestrateur export (double pipeline FFmpeg/WebCodecs)
17. `lib/utils/ffmpegCommands.ts` — commandes FFmpeg (à retirer?)
18. `lib/hooks/useFFmpeg.ts` — hook FFmpeg (à retirer?)
19. `components/features/editor/panels/FilterPanel.tsx` — utilise FILTERS V1

### Le skill directeur artistique (pour comprendre les types cibles)
20. `skills/directeur-artistique/SKILL.md`

## Les 3 prompts à générer

### P0.1 — Convergence store + types

**Objectif :** Ajouter `activeTheme` au store Zustand, mettre à jour les types
dans editor.ts pour supporter les concepts V2 (TextEffect, TextAnimation,
SubtitleStyleV2), et sauvegarder le thème dans editorData persistence.

**Ce que le prompt doit couvrir :**
- Ajouter `activeThemeId: string` au store (défaut: 'sage_zen')
- Ajouter `setActiveTheme(id: string)` au store
- Quand le thème change, appliquer le filtre du thème (`setFilter`)
- Ajouter les types V2 à editor.ts (importer depuis designKnowledge.ts)
- Sauvegarder `activeThemeId` dans editorData persistence
- Restaurer le thème au chargement
- Rétrocompatible : si pas de thème sauvegardé, défaut 'sage_zen'

### P0.2 — Unifier les sources de vérité

**Objectif :** Éliminer la duplication entre V1 et V2. Une seule source de
vérité pour les filtres, les fonts, et le word-wrap.

**Ce que le prompt doit couvrir :**
- Migrer `lib/utils/filters.ts` pour exporter depuis `lib/data/designKnowledge.ts` (FILTERS_V2)
- Ou remplacer les imports de FILTERS par FILTERS_V2 partout
- Unifier le chargement de fonts : `fontLoader.ts` utilise le catalogue de `designKnowledge.ts`
- Intégrer `wrapText()` de designKnowledge dans `drawOverlays.ts`
- Mettre à jour FilterPanel.tsx pour utiliser la nouvelle source
- Vérifier tous les imports qui référencent filters.ts ou fontLoader.ts

### P0.3 — Nettoyer le double pipeline export

**Objectif :** Retirer le chemin FFmpeg de l'export. FFmpeg.wasm ne charge pas
sur Safari iOS, donc le chemin FFmpeg est du code mort qui ajoute de la complexité.

**Ce que le prompt doit couvrir :**
- Analyser useVideoExport.ts : identifier le seuil WebCodecs/FFmpeg
- Retirer le chemin FFmpeg de useVideoExport.ts (garder seulement WebCodecs)
- Retirer ou archiver useFFmpeg.ts et ffmpegCommands.ts
- Retirer les imports FFmpeg de useVideoExport.ts
- S'assurer que l'export fonctionne toujours pour tous les cas
- Garder le fallback Web Audio API pour l'extraction audio

## Format de sortie

Pour chaque prompt (P0.1, P0.2, P0.3), génère un fichier PROMPT.md dans :
- `project-docs/02_ROADMAP/prompts_used/P0.1_convergence_store/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P0.2_unifier_sources/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/P0.3_cleanup_export/PROMPT.md`

Chaque prompt doit suivre le format one-shot standard :
- Contexte
- Stack
- Ce qui existe (avec fichiers et lignes exactes)
- Livrables attendus (numérotés, avec code suggéré)
- Contraintes (NE PAS modifier X, Y, Z)
- Definition of Done (checkboxes)
- Référence — fichiers à lire

## Contraintes pour la génération
- Chaque prompt doit être AUTONOME (lisible sans les autres)
- Citer les fichiers et lignes EXACTES du code actuel
- Les prompts doivent être dans l'ordre d'exécution (P0.1 avant P0.2 avant P0.3)
- Chaque prompt doit passer `tsc --noEmit` et `npm run build`
- Mobile first 375px
- Zéro console.log en production

## Référence
- `CLAUDE.md`
- `skills/oneshot-prompt-writer/SKILL.md` (si disponible — format des prompts)
