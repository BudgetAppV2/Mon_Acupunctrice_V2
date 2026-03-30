# CLAUDE.md — Subtitle Lab / Editor V2

## Lire en premier
- Ce fichier pour le contexte
- `EDITOR_V2_PLAN.md` pour le plan complet de migration
- `skills/oneshot-prompt-writer/SKILL.md` pour le format des prompts

## Projet
Subtitle Lab = un éditeur vidéo mobile-first dans `subtitle-lab/`.
Il deviendra l'Editor V2 de Mon Acupunctrice Hub.

## Architecture actuelle du Lab
- Next.js 16, React 19, Zustand 5, Tailwind 3, @heroicons/react
- Canvas 2D renderer 60fps (RAF loop avec refs, pas de stale closures)
- Multi-sheet bottom sheets (SheetId toggle)
- Import vidéo + preview canvas (Phase 2 complète)
- 8 presets sous-titres animés (word-by-word)
- Per-block subtitle overrides
- CSS filters (10 presets)
- WebGL LUT renderer (BUGGY — voir ci-dessous)

## Bugs connus

### LUT noircit l'image (RÉSOLU — ne pas utiliser WebGL pour le preview)
Le `drawImage` d'un canvas WebGL `premultipliedAlpha:false` vers un canvas 2D
cause une double conversion alpha qui noircit. Solution: utiliser CSS filter
approximations pour le preview temps réel. Garder le WebGL LUT renderer
uniquement pour l'export final (où on utilise `readPixels` + `putImageData`).

### Résolution
- Preview canvas: 540×960 (moitié de la résolution, ok pour mobile)
- Export final: 1080×1920 max (calculé par `computeExportSize()` selon la source)
- La caméra demande `{ width: { ideal: 1920 }, height: { ideal: 1080 } }` 
  pour capturer en résolution native

## Stack complète du hub (pour Phase B)
- Next.js 15 (le hub), Firebase Auth/Firestore/Storage
- AssemblyAI pour la transcription
- WebCodecs + mp4-muxer pour l'export
- MediaBunny (CanvasSource + AudioBufferSource AAC WASM) pour Safari

## Tâche: Écrire les prompts oneshot pour la Phase A

### Contexte
Le plan `EDITOR_V2_PLAN.md` définit 8 milestones (A1-A8).
Chaque milestone doit devenir un prompt oneshot détaillé suivant
le format de `skills/oneshot-prompt-writer/SKILL.md`.

### Processus
Pour CHAQUE milestone (A1 en premier, puis A2, etc.):
1. Lire les fichiers de référence listés dans EDITOR_V2_PLAN.md
2. Lire le code actuel du Lab (`subtitle-lab/`) 
3. Lire le code correspondant dans editor-pro (branche actuelle)
4. Écrire le prompt oneshot dans `subtitle-lab/prompts/A[N]_PROMPT.md`
5. Suivre STRICTEMENT le format du skill oneshot-prompt-writer

### Points importants pour les prompts

**Store tracks[] (A1)**:
- Voir `lib/store/useEditorStore.ts` pour le pattern multi-clip existant
- `recalcTimelineStarts()` et `syncLegacyFields()` sont des patterns prouvés
- Les types sont définis dans EDITOR_V2_PLAN.md

**Sheet Tracks (A2)**:
- Chaque bloc dans la timeline DOIT avoir des trim handles draggables
- Le UI du sheet Tracks doit être suffisamment large pour les gestes fins
- Le scrubber persistant ne doit PAS être un simple slider —
  trouver un design plus élégant (barre fine avec playhead animé,
  ou waveform mini, ou film strip)
- Voir `components/features/editor/timeline/TrimHandle.tsx` pour les handles
- Voir `components/features/editor/timeline/ClipTrack.tsx` concept dans
  `project-docs/02_ROADMAP/prompts_used/multiclip_M2_timeline/PROMPT.md`

**Multi-clip playback (A3)**:
- Le prompt M2 (multiclip_M2_timeline) contient la spec complète
  de `getClipAtTime()` et le changement de source vidéo
- Piste la plus haute = preview principal (multi-cam)
- 2e import → piste V2 (pas bout-à-bout)

**Audio (A4)**:
- Copier `AudioPanel.tsx`, `useMusicSearch.ts` depuis editor-pro
- Adapter pour bottom sheet mobile-first
- Volume voix/musique, fade in/out, ducking — tous prouvés
- Waveform sur la piste audio dans le sheet Tracks

**Caméra + countdown (A5)**:
- Copier `useMediaRecorder.ts` depuis editor-pro
- Le countdown 3-2-1 est déjà implémenté dans ce hook
- L'overlay visuel du countdown doit être sur le canvas

**Transcription (A6)**:
- Copier `useTranscription.ts` + `subtitleGrouper.ts` + `frenchPostProcess.ts`
- L'API route `/api/transcribe` existe dans le hub
- Pour le Lab standalone, créer la même route dans `subtitle-lab/`
- AssemblyAI words[] → SubtitleBlock[] est une conversion directe

**Interactions avancées (A7)**:
- Le prompt M3 (multiclip_M3_interactions) contient la spec complète
- split, reorder (long press + drag), suppression

**Filtres (A8)**:
- Retirer `applyLut()` du RAF loop dans SubtitleCanvas
- Convertir les LUT presets en approximations CSS filter
- Chaque VideoClip a son `filterId`
- Le canvas element reçoit `style.filter` du clip actif

## Commandes dev
```bash
cd ~/Desktop/Mon_Acupunctrice_V2/subtitle-lab
npm run dev      # localhost:3001
npm run build    # vérifier avant deploy
```
