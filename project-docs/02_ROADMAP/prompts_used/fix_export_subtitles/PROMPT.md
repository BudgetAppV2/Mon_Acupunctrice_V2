# Fix — Export vidéo et sous-titres pour fichiers > 60 secondes

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
L'export vidéo et la génération de sous-titres échouent sur des vidéos > 60s.
Les root causes ont été identifiées (voir `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md`).
Les commits E01-A/E01-C n'ont rien cassé — le problème est pré-existant.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand, Firebase Storage, FFmpeg.wasm, WebCodecs, mp4-muxer.

## Objectif
Appliquer les fixes prioritaires pour que l'export et les sous-titres fonctionnent sur des vidéos de 60-90 secondes sur iPhone Safari.

## Livrables attendus

### 1. Extraire l'audio AVANT l'upload transcription (PRIORITÉ 1)

**Fichier :** `lib/hooks/useTranscription.ts`

Actuellement le hook upload le fichier VIDEO complet (~50-200MB) vers Storage, puis la Cloud Function le passe à Whisper (limite 25MB). Fix :

- Utiliser le singleton FFmpeg.wasm (via `useFFmpeg`) pour extraire l'audio en MP3 compressé AVANT l'upload
- Commande FFmpeg : `-i input.mp4 -vn -ar 16000 -ac 1 -b:a 32k audio.mp3` (mono, 16kHz, ~1MB/min)
- Uploader seulement le fichier audio MP3 (~1-2MB) au lieu de la vidéo (~200MB)
- Changer le `storagePath` pour refléter que c'est un audio (ex: `transcriptions/${uid}/${itemId}.mp3`)
- Ajouter un state `extracting` pour montrer "Extraction audio..." dans l'UI avant l'upload

**Le hook `useFFmpeg.ts` existe déjà** — c'est un singleton qui charge FFmpeg.wasm une seule fois.
Lire `lib/hooks/useFFmpeg.ts` pour comprendre comment l'utiliser.

### 2. Upload resumable pour les gros fichiers (PRIORITÉ 2)

**Fichiers :** `lib/hooks/useTranscription.ts`, `lib/hooks/useVideoExport.ts`

Remplacer tous les `uploadBytes` par `uploadBytesResumable` de Firebase Storage :
- `uploadBytesResumable` supporte la reprise après échec réseau
- Expose un callback `on('state_changed')` pour le feedback de progression
- Ne change rien pour les petits fichiers

### 3. Supprimer les catch vides + console.log (PRIORITÉ 3)

**Fichiers à corriger :**
- `lib/utils/exportWebCodecs.ts` ligne ~21 : `catch {}` vide sur `decodeAudioData` → logger l'erreur, mettre `audioBuf = null`, et continuer l'export sans audio (avec un avertissement)
- `lib/hooks/useVideoExport.ts` ligne ~86 : `catch {}` vide sur thumbnail upload → logger `console.warn` minimum
- `lib/hooks/useVideoExport.ts` ligne ~40 : `console.log('[EXPORT] start')` → supprimer

### 4. Réduire la mémoire de l'export (PRIORITÉ 4)

**Fichier :** `lib/utils/exportWebCodecs.ts`

Le problème : `file.arrayBuffer()` + `decodeAudioData` alloue ~300MB pour un fichier de 150MB. Safari iOS tue le tab.

Fix :
- NE PAS faire `await file.arrayBuffer()` pour tout le fichier
- Extraire l'audio via FFmpeg.wasm (même pattern que la transcription) pour obtenir un fichier WAV/PCM plus petit
- Décoder seulement le fichier audio extrait, pas la vidéo entière
- Si FFmpeg n'est pas disponible (fallback), utiliser `file.slice(0, maxSize)` et avertir

Optionnel (si le temps le permet) :
- Remplacer `ArrayBufferTarget` par `StreamTarget` dans mp4-muxer pour ne pas accumuler tous les chunks encodés en mémoire

### 5. Feedback de progression amélioré

**Fichier :** `components/features/editor/ExportButton.tsx`

Ajouter des étapes lisibles :
- "Préparation..." (chargement FFmpeg, extraction audio)
- "Encodage vidéo... 45%" (pendant le frame-by-frame)
- "Sauvegarde..." (pendant l'upload)
- Si `duration > 60` : afficher un avertissement avant l'export : "Cette vidéo fait [X]s — l'export peut prendre 1-2 minutes"

**Fichier :** `lib/hooks/useVideoExport.ts` ou `lib/utils/exportWebCodecs.ts`
- Exposer un callback `onProgress(stage, percent)` au lieu d'un simple `percent`
- Stages : 'preparing' | 'encoding' | 'uploading'

**Fichier :** `components/features/editor/panels/SubtitlePanel.tsx`
- Afficher "Extraction audio..." puis "Transcription..." au lieu de juste "Transcription..."

### 6. Messages d'erreur clairs

Remplacer les messages génériques par des messages spécifiques :
- OOM/crash : "La vidéo est trop volumineuse. Essaie de la trimmer à moins de 60 secondes."
- Timeout transcription : "La transcription a pris trop de temps. Essaie avec une vidéo plus courte."
- Upload échoué : "La sauvegarde a échoué. Vérifie ta connexion et réessaie."

## Contraintes
- NE PAS modifier le pipeline WebCodecs frame-by-frame (juste le decode audio)
- NE PAS modifier la Cloud Function transcribeAudio
- NE PAS modifier les fichiers de l'éditeur non liés (ResizeDivider, TrimHandle, Timeline, tracks)
- NE PAS changer le format de sortie (MP4 H.264)
- Rétrocompatible — les vidéos courtes doivent continuer à fonctionner
- Mobile first — tester mentalement les allocations mémoire sur iPhone (~1.5GB disponible)

## Definition of Done
- [ ] La transcription extrait l'audio en MP3 via FFmpeg avant l'upload
- [ ] L'export ne fait pas `file.arrayBuffer()` sur le fichier vidéo complet
- [ ] Les uploads utilisent `uploadBytesResumable`
- [ ] Aucun `catch {}` vide dans le code
- [ ] Aucun `console.log` en production
- [ ] Feedback de progression par étapes (préparation/encodage/sauvegarde)
- [ ] Avertissement pour les vidéos > 60s
- [ ] Messages d'erreur en français et clairs
- [ ] Vidéos courtes (~15s) fonctionnent identiquement
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire avant de commencer
- `CLAUDE.md`
- `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md`
- `lib/hooks/useTranscription.ts`
- `lib/hooks/useVideoExport.ts`
- `lib/hooks/useFFmpeg.ts`
- `lib/utils/exportWebCodecs.ts`
- `lib/utils/ffmpegCommands.ts`
- `components/features/editor/ExportButton.tsx`
- `components/features/editor/panels/SubtitlePanel.tsx`
