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
