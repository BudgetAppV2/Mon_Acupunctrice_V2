# Analyse critique — Plan multi-clip M1 (refonte store Zustand)

## Ta mission
Tu es un reviewer senior. Analyse le plan d'implémentation multi-clip M1 proposé dans `project-docs/02_ROADMAP/prompts_used/multiclip_M1_store/PROMPT.md` et identifie les problèmes, les oublis, et les améliorations possibles.

## Étape 1 : Lis ces fichiers dans cet ordre
1. `project-docs/02_ROADMAP/MULTICLIP_PLAN.md` — le plan global en 4 milestones
2. `project-docs/02_ROADMAP/prompts_used/multiclip_M1_store/PROMPT.md` — le prompt M1 à analyser
3. `lib/store/useEditorStore.ts` — le store actuel
4. `lib/types/editor.ts` — les types actuels
5. `lib/hooks/useEditorPersistence.ts` — la persistance
6. `lib/hooks/useVideoExport.ts` — le pipeline d'export
7. `lib/utils/exportWebCodecs.ts` — l'export WebCodecs
8. `components/features/editor/VideoPreview.tsx` — la preview vidéo
9. `components/features/editor/EditorLayout.tsx` — le layout éditeur
10. `components/features/editor/ImportModal.tsx` — l'import vidéo
11. `components/features/editor/timeline/Track.tsx` — la piste vidéo timeline
12. `components/features/editor/timeline/Timeline.tsx` — la timeline

## Étape 2 : Analyse critique

Pour chaque point, évalue si le plan M1 est correct :

### A. Architecture du store
- Est-ce que `syncLegacyFields` est la bonne approche pour la rétrocompatibilité ?
- Y a-t-il un risque de désynchronisation entre `clips[]` et les champs legacy ?
- Est-ce que Zustand peut gérer les updates fréquents d'un tableau d'objets sans problème de performance ?
- Y a-t-il des endroits dans le code existant qui ÉCRIVENT dans `videoFile`, `videoUrl`, `trimStart`, `trimEnd` directement (pas via les setters) et qui casseraient ?

### B. Impact sur les composants existants
- Quels composants lisent `videoFile`, `videoUrl`, `trimStart`, `trimEnd` du store et seraient affectés ?
- Est-ce que le `registerVideoElement` et le `_videoEl` global fonctionnent encore avec multi-clip ?
- Est-ce que `seekTo` et `play/pause` doivent être modifiés pour M1 ou est-ce que ça peut attendre M2 ?
- Y a-t-il des useEffect qui dépendent de `videoUrl` qui se re-triggeraient en boucle ?

### C. Persistance et restauration
- Comment restaure-t-on les `File` objects quand on revient dans l'éditeur ? (les File ne sont pas sérialisables)
- Est-ce que `sourceVideoUrl` suffit pour reconstruire les clips au rechargement ?
- Faut-il télécharger N fichiers sources au lieu de 1 quand on restaure un projet multi-clip ?

### D. Export
- Le prompt dit de NE PAS modifier l'export dans M1, mais `useVideoExport` lit `s.videoFile` et `s.trimStart/End`. Si ces champs pointent toujours vers le premier clip via `syncLegacyFields`, est-ce que l'export fonctionne encore pour un single-clip ?
- Qu'est-ce qui casse si quelqu'un a 2+ clips et essaie d'exporter avant M4 ?

### E. Fonctions manquantes ou à risque
- `splitClip` : est-ce que les overlays/sous-titres qui chevauchent le point de split doivent être ajustés ?
- `removeClip` : est-ce que les overlays/sous-titres positionnés sur le clip supprimé doivent être supprimés ou repositionnés ?
- `reorderClips` : les overlays/sous-titres sont en temps global — si on réordonne les clips, les overlays ne correspondent plus aux bons clips.
- Y a-t-il d'autres edge cases non couverts ?

### F. Plan en 4 milestones
- Est-ce que l'ordre M1→M2→M3→M4 est optimal ?
- Devrait-on fusionner certains milestones ?
- Y a-t-il des dépendances cachées entre les milestones ?

## Étape 3 : Rapport

Génère un fichier `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md` avec :

1. **Validation** — Ce qui est bien dans le plan
2. **Problèmes critiques** — Ce qui casserait l'app ou ne fonctionnerait pas
3. **Oublis** — Ce qui manque dans le plan
4. **Suggestions d'amélioration** — Des alternatives ou optimisations
5. **Prompt M1 corrigé** — Si nécessaire, proposer les modifications au prompt

## Contraintes
- NE PAS modifier de code — c'est une analyse seulement
- Le rapport doit être dans `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md`
- Être spécifique : citer les fichiers et lignes exactes
- Identifier les risques de régression pour les fonctionnalités existantes

## Référence
- `CLAUDE.md`
