# Analyse & Fix — Export vidéo et génération de sous-titres sur fichiers > 60 secondes

## Problème constaté
Lors de tests avec Judith (25 mars 2026), deux fonctionnalités ont échoué sur une
vidéo de plus de 60 secondes :
1. **La génération de sous-titres a échoué** — pas de message d'erreur clair
2. **L'export vidéo a échoué** — la vidéo n'a pas été exportée

Ces fonctionnalités marchent sur des vidéos courtes (~7-15 sec). Le problème est
probablement lié à la taille/durée du fichier.

## Contexte récent
Plusieurs commits ont modifié l'éditeur récemment (E01-A, E01-C). Vérifier si ces
changements ont cassé quelque chose ou si c'est un problème pré-existant lié à la
taille des fichiers.

## Ta mission

### Phase 1 : Analyse du code (ne rien modifier)

Lis et analyse ces fichiers dans cet ordre :

**Pipeline de sous-titres :**
1. `components/features/editor/panels/SubtitlePanel.tsx` — UI qui lance la transcription
2. `lib/hooks/useTranscription.ts` — hook qui orchestre la transcription
3. `app/api/transcribe/route.ts` — API route qui appelle Whisper/Cloud Function
4. `lib/utils/subtitleGrouper.ts` — groupage des mots en segments

**Pipeline d'export :**
5. `components/features/editor/ExportButton.tsx` — bouton qui lance l'export
6. `lib/hooks/useVideoExport.ts` — hook qui orchestre l'export
7. `lib/hooks/useFFmpeg.ts` — hook FFmpeg.wasm
8. `lib/utils/exportWebCodecs.ts` — export via WebCodecs API
9. `lib/utils/ffmpegCommands.ts` — commandes FFmpeg

**Store :**
10. `lib/store/useEditorStore.ts` — state de l'éditeur

**Changements récents (vérifier s'ils ont cassé quelque chose) :**
11. `components/features/editor/EditorLayout.tsx` — modifié par E01-A
12. `components/features/editor/timeline/Timeline.tsx` — modifié par E01-A

### Phase 2 : Diagnostic

Pour chaque pipeline, identifie :

**Sous-titres :**
- Comment l'audio est extrait de la vidéo (format, taille)
- Quelle est la limite de taille envoyée à l'API (Whisper a une limite de 25MB)
- Y a-t-il un timeout côté client ou serveur qui pourrait expirer sur un fichier long
- L'extraction audio via FFmpeg.wasm peut-elle échouer sur un fichier > 60s
- Le fichier audio est-il stocké en mémoire ou streamé

**Export :**
- Comment la vidéo est ré-encodée (WebCodecs vs FFmpeg.wasm, fallback)
- Les overlays texte et sous-titres sont-ils composités frame par frame
- Y a-t-il une limite de mémoire (les vidéos 9:16 1080x1920 @ 30fps = beaucoup de frames)
- Le processus est-il bloquant (freeze du UI pendant l'export)
- Y a-t-il un timeout ou une erreur silencieuse (catch vide)

**Général :**
- Les changements E01-A/E01-C ont-ils modifié le flow d'export ou de transcription
- Y a-t-il des `catch {}` vides qui avalent les erreurs silencieusement
- L'état de l'éditeur (store Zustand) est-il cohérent après les modifications E01

### Phase 3 : Rapport et suggestions

Génère un fichier `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md` avec :

1. **Diagnostic** — Les problèmes identifiés pour chaque pipeline
2. **Root causes probables** — Classées par probabilité (haute/moyenne/basse)
3. **Suggestions de fix** — Pour chaque problème, une solution concrète avec :
   - Fichier(s) à modifier
   - Changement à faire (description, pas le code)
   - Impact sur les fichiers courts (ne rien casser)
4. **Améliorations UX pour fichiers longs (> 60s)** :
   - Barre de progression pendant l'export (pas juste un spinner)
   - Estimation du temps restant
   - Avertissement si le fichier est très gros
   - Gestion gracieuse des timeouts
   - Messages d'erreur clairs pour Judith
5. **Recommandations d'architecture** — Si le problème est fondamental
   (ex: FFmpeg.wasm ne gère pas les gros fichiers en mémoire), quelle
   alternative proposer

## Contraintes
- NE PAS modifier de code dans cette analyse — c'est un diagnostic seulement
- Le rapport doit être dans `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md`
- Identifier les `catch {}` vides et les recommander à corriger
- Vérifier les timeouts côté Vercel (limite de 10s sur les API routes en plan Hobby)
- Vérifier la taille max de upload du body (Vercel limite à 4.5MB par défaut)

## Référence
- `CLAUDE.md` (règles du projet)
- `project-docs/03_TECH/ARCHITECTURE.md`
- `project-docs/05_LATER/BACKLOG_LATER.md` (section Éditeur)
