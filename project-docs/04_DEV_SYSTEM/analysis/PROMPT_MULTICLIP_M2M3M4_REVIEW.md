# Review critique — Prompts multi-clip M2, M3, M4

## Ta mission
Tu es un reviewer senior. Analyse les 3 prompts multi-clip M2, M3 et M4 et identifie
les problèmes, oublis et améliorations possibles. Tu as déjà fait la review de M1
(voir `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md`) — réutilise
les mêmes standards de qualité.

## Étape 1 : Lis ces fichiers dans cet ordre

**Plans et review précédente :**
1. `project-docs/02_ROADMAP/MULTICLIP_PLAN.md`
2. `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md`

**Les 3 prompts à reviewer :**
3. `project-docs/02_ROADMAP/prompts_used/multiclip_M2_timeline/PROMPT.md`
4. `project-docs/02_ROADMAP/prompts_used/multiclip_M3_interactions/PROMPT.md`
5. `project-docs/02_ROADMAP/prompts_used/multiclip_M4_export/PROMPT.md`

**Code actuel (post-M1) :**
6. `lib/store/useEditorStore.ts`
7. `lib/types/editor.ts`
8. `components/features/editor/timeline/Track.tsx`
9. `components/features/editor/timeline/Timeline.tsx`
10. `components/features/editor/timeline/TrimHandle.tsx`
11. `components/features/editor/timeline/TextTrack.tsx`
12. `components/features/editor/timeline/SubtitleTrack.tsx`
13. `components/features/editor/VideoPreview.tsx`
14. `components/features/editor/ImportModal.tsx`
15. `components/features/editor/EditorLayout.tsx`
16. `components/features/editor/EditorToolbar.tsx`
17. `components/features/editor/ExportButton.tsx`
18. `lib/utils/exportWebCodecs.ts`
19. `lib/hooks/useVideoExport.ts`
20. `lib/hooks/useEditorPersistence.ts`

## Étape 2 : Analyse critique par milestone

### M2 — Timeline multi-clip + preview
- Est-ce que ClipTrack.tsx remplace bien Track.tsx sans casser les trim handles ?
- Comment la preview gère le changement de `src` du `<video>` pendant le play ? Y a-t-il un flash noir entre les clips ?
- Est-ce que `getClipAtTime` gère correctement les edge cases (temps entre deux clips, temps > durée totale) ?
- `registerVideoElement` et `_videoEl` : est-ce que ça fonctionne si le `<video>` change de `src` ?
- Les overlays texte et sous-titres en temps global : est-ce qu'ils restent positionnés correctement avec N clips ?
- Le bouton "+" dans ImportModal mode `add` : est-ce que `initClipDuration` est appelé correctement ?
- Le zoom de la timeline : est-ce que `totalDuration` est calculé correctement vs `duration` du store ?
- La persistance (useEditorPersistence) : est-ce que les clips sont sauvegardés/restaurés correctement avec M2 ?

### M3 — Interactions
- Long press (300ms) + drag vs tap (< 300ms) : est-ce que la distinction est fiable sur mobile ?
- Drag-to-reorder + E01-D drag-to-reposition : y a-t-il un conflit de gestes ?
- `duplicateClip` : le clone partage le même `file` et `blobUrl` — faut-il un refcount pour éviter de révoquer le blobUrl quand un seul des deux est supprimé ?
- `splitClip` : les deux clips résultants partagent le même `file` et `blobUrl` — même problème de refcount pour le cleanup (revokeObjectURL) ?
- Le bouton "Couper" : faut-il recalculer les overlays/sous-titres après un split ou est-ce acceptable de ne rien faire ?
- Suppression d'un clip : les overlays/sous-titres orphelins sont-ils gérés ?
- Le réordonnement et les overlays en temps global : est-ce que les overlays deviennent incohérents après un reorder ?

### M4 — Export multi-clip
- Créer un `<video>` par clip dans la boucle d'export : est-ce que ça alloue trop de mémoire ?
- Les audioBlobs extraits en parallèle avec `Promise.all` : OOM sur iPhone si 3+ clips ?
- Le fallback FFmpeg pour multi-clip (> 100MB total) : est-ce que `buildExportCommand` supporte le concat ?
- Les timestamps globaux continus : est-ce que le muxer gère des timestamps qui ne commencent pas à 0 pour le 2e clip ?
- `firstTimestampBehavior: 'offset'` dans le muxer : est-ce que ça gère les timestamps continus ou faut-il changer ?

### Cross-cutting
- La persistance multi-clip (save/restore) est-elle cohérente à travers M2/M3/M4 ?
- L'upload de la vidéo source (sourceVideoUrl) : faut-il uploader CHAQUE clip séparément ?
- La transcription : doit-elle être par clip ou globale ?
- Les captions basées sur la transcription : comment ça marche avec N clips de transcription différentes ?

## Étape 3 : Rapport

Génère un fichier `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M2M3M4_REVIEW.md` avec :

1. **Par milestone** — Validation, problèmes critiques, oublis
2. **Cross-cutting** — Problèmes qui affectent plusieurs milestones
3. **Modifications recommandées** pour chaque prompt
4. **Ordre d'exécution** — Confirmer ou ajuster l'ordre M2→M3→M4

## Contraintes
- NE PAS modifier de code
- Être spécifique : citer les fichiers et lignes
- Identifier les risques de régression
- Le rapport doit être dans `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M2M3M4_REVIEW.md`

## Référence
- `CLAUDE.md`
