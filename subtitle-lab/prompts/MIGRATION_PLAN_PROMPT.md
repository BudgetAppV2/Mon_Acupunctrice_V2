# MIGRATION PLAN — Subtitle Lab → Hub Editor V2

## Objectif
Migrer le Subtitle Lab standalone (`subtitle-lab/`) vers une route cachée 
dans le hub Mon Acupunctrice V2, en branchant la persistance Firestore.

## Contexte

### Le Lab standalone (à migrer)
- Location: `subtitle-lab/`
- Stack: Next.js 16, Zustand 5 (in-memory), TypeScript, Tailwind 3
- Composants clés:
  - `components/SubtitleCanvas.tsx` — RAF loop, video playback, filters, text overlays
  - `components/FilterPanel.tsx` — 16 CSS filters
  - `components/TextPanel.tsx` — rich text overlays (8 presets, 7 animations)
  - `components/CoverPanel.tsx` — frame slider capture
  - `components/AudioSheet.tsx` — audio import, volume, fade
  - `components/CameraOverlay.tsx` — viewfinder, countdown
  - `components/TranscribeButton.tsx` — transcription trigger
  - `components/TracksPanel.tsx` — multi-track timeline
  - `components/TrackBlock.tsx` — drag + trim blocks
  - `components/MiniScrubber.tsx` — persistent scrubber
  - `lib/store.ts` — Zustand store (tracks[], clips, overlays, all state)
  - `lib/types.ts` — Track, VideoClip, AudioClip, TextOverlay
  - `lib/renderer.ts` — canvas rendering engine
  - `lib/playback.ts` — findActiveClip, coverCrop, createVideoElement
  - `lib/useSubtitleDrag.ts` — subtitle/overlay drag on canvas
  - `lib/filters.ts` — filter definitions
  - `lib/presets.ts` — subtitle style presets
  - `app/api/transcribe/route.ts` — AssemblyAI Universal-3 Pro

### Le Hub existant (destination)
- Location: racine du repo (`/`)
- Stack: Next.js 15, React 19, Firebase/Firestore, Zustand, TypeScript, Tailwind
- Editor existant (V1 — `feature/editor-pro` branch):
  - `components/features/editor/` — EditorLayout, VideoPreview, panels, timeline
  - `components/features/editor/timeline/` — Track.tsx, TrimHandle.tsx, Timeline.tsx
    (pattern éprouvé: onDragStart/onDrag/onDragEnd avec RAF, zoomLevel en px)
  - `lib/editor/` — sceneGraph, sceneRenderer, subtitleEngine, templates, lutParser
  - `lib/store/useEditorStore.ts` — Zustand store pour l'éditeur V1
  - Route éditeur: `app/(dashboard)/editor/page.tsx`
- Firebase/Firestore:
  - Auth via Firebase (useAuth hook)
  - Firestore collections existantes
  - Cloud Functions déployées
  - Vercel API routes

### Bugs connus du Lab (à résoudre pendant la migration)
- Timeline drag bounce-back (blocs ne persistent pas après drag)
  → Adopter le pattern TrimHandle.tsx du hub
- Scrubber pas toujours synchronisé avec la vidéo
- Filter thumbnails pas toujours générés

## Instructions pour Claude Code

### Phase 1: ANALYSE (mode plan)
Tu es en mode PLAN. Analyse la codebase complète avant de proposer quoi que ce soit.

1. Lis TOUS les fichiers du Lab (`subtitle-lab/`) pour comprendre l'architecture
2. Lis les fichiers de l'éditeur V1 du hub (`components/features/editor/`, `lib/editor/`, `lib/store/useEditorStore.ts`)
3. Lis la structure Firestore existante (`lib/firebase/`, collections, schemas)
4. Lis la route éditeur existante (`app/(dashboard)/editor/`)
5. Identifie les dépendances, imports, et patterns communs

### Phase 2: PLAN DE MIGRATION
Propose un plan détaillé avec :

1. **Nouvelle route cachée** — où la créer, comment la cacher de la nav
2. **Mapping des composants** — quels composants du Lab copier, lesquels adapter du hub V1
3. **Schema Firestore** — comment persister tracks[], clips, overlays, settings
4. **Store migration** — comment adapter le store Zustand pour lire/écrire Firestore
5. **Timeline refonte** — adopter TrimHandle pattern pour le drag/trim
6. **API routes** — transcribe, export, etc.
7. **Assets/media** — où stocker les vidéos/audio (Firebase Storage? blobs?)
8. **Auth integration** — comment brancher l'auth existante
9. **Milestones** — étapes ordonnées avec DoD pour chaque
10. **Risques** — ce qui pourrait casser, incompatibilités

### Format du plan
Pour chaque milestone, indiquer :
- Fichiers à créer/modifier
- Dépendances
- Estimation de complexité (S/M/L)
- Definition of Done

NE PAS écrire de code. Seulement le plan.
