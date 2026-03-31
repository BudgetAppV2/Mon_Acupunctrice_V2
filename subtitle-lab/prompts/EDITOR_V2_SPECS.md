# EDITOR V2 — Spécifications Techniques

## Vision
Construire un NOUVEL éditeur vidéo mobile-first dans le Hub Mon Acupunctrice,
qui combine le meilleur du Lab (UI, presets, canvas renderer) et du Hub V1
(patterns éprouvés : TrimHandle, persistence, export pipeline).

Ce n'est PAS une migration copier-coller. C'est une reconstruction informée.

---

## Sous-systèmes et décisions techniques

### 1. TIMELINE & DRAG — Le bug #1 du Lab

**Problème Lab :** Le drag des blocs "bounce back" parce que :
- `recalcTimelineStarts()` est appelé par plusieurs actions du store et
  remet toutes les positions à 0 séquentiellement
- Le TrackBlock utilise des deltas relatifs entre pointerDown et pointerUp,
  mais les props changent entre les deux à cause des re-renders React
- Le `initClipDuration` appelait `recalcTimelineStarts` après le drag

**Solution V2 : Adopter le pattern TrimHandle du Hub V1**

Le Hub V1 a un TrimHandle qui fonctionne parfaitement :
- `components/features/editor/timeline/TrimHandle.tsx`
- Pattern: `onDragStart()` capture l'état initial dans un ref,
  `onDrag(deltaPx)` est appelé CONTINUELLEMENT pendant le move (via RAF),
  `onDragEnd()` finalise
- Le delta est calculé depuis `startX` capturé au pointerDown
- setPointerCapture pour ne pas perdre le drag
- Pas de double-fire possible


**Architecture timeline V2 :**
```
Track.tsx (hub V1 pattern)
├── Positionnement en PIXELS (pas en %) via zoomLevel (px/sec)
├── Zone grise source complete (0 → duration)
├── Zone active colorée (trimStart → trimEnd) positionnée EN DEDANS
├── TrimHandle left/right (hub V1, drag continu via RAF)
└── Drag du bloc entier = déplacer timelineStart (nouveau)
    ├── onDragStart: capturer timelineStart dans ref
    ├── onDrag(deltaPx): mettre à jour le store DIRECTEMENT
    │   (pas de translateX, pas de delta cumulé)
    └── onDragEnd: noop (store déjà à jour)
```

**Règle critique :** `recalcTimelineStarts()` est INTERDIT sauf dans :
- `splitClip` (recrée 2 clips, positions recalculées)
- `reorderClips` (change l'ordre explicitement)
- `deleteClip` (supprime, repositionne les restants)
- `addVideoClip` (premier positionnement séquentiel)

`updateClipTrim`, `initClipDuration`, `moveVideoClip` ne DOIVENT JAMAIS
appeler `recalcTimelineStarts`.

---

### 2. FILTRES — ctx.filter vs style.filter

**Problème Lab :** `ctx.filter` ne fonctionne PAS sur Safari iOS
(WebKit bug #198416, toujours ouvert en mars 2026).

**Solution V2 :**
- Preview : `style.filter` CSS sur l'element canvas
  - Compromis accepté : les sous-titres sont aussi filtrés dans le preview
  - C'est le même compromis que CapCut/InShot font

- Export : 2 stratégies selon le browser :
  1. Chrome/Firefox : `ctx.filter` fonctionne → draw video filtré, puis
     draw sous-titres sans filtre (meilleure qualité)
  2. Safari : draw video sans filtre sur un canvas temporaire,
     appliquer CSS filter via `getImageData/putImageData` pixel manipulation,
     ou accepter le compromis style.filter

- Thumbnails filtres : capturer une frame de la vidéo à t=2s via
  canvas.toDataURL, afficher avec CSS filter dans les boutons

---

### 3. SCRUBBER — Synchronisation vidéo

**Problème Lab :** Le scrubber ne seek pas la vidéo avant d'avoir
ajouté du contenu. Le scrubber n'affiche pas les frames exactes.

**Solution V2 :**
- `duration` du store = durée SOURCE du clip (pas trimmée)
- Le scrubber va de 0 à `duration` (toute l'étendue source)
- `findActiveClip` utilise les positions ABSOLUES :
  clip actif si `currentTime` est entre `timelineStart + trimStart`
  et `timelineStart + trimEnd`
- Le `useEffect` qui seek la vidéo dépend de `[currentTime, tracks]`
  (pas juste `[currentTime, isPlaying]`)
- Après `initClipDuration`, forcer un seek à t=0.01s pour afficher
  la première frame immédiatement

---

### 4. STORE — Architecture Zustand + Firestore

**Pattern :** Store Zustand in-memory + auto-save Firestore en background.
Comme `useEditorPersistence.ts` du Hub V1 (subscribe + debounce 2s + JSON diff).

**Différences avec le Lab :**
- `File` et `blobUrl` sont des champs RUNTIME (pas persistés)
- `sourceVideoUrl` (Firebase Storage URL) est persisté pour le reload
- `loadFromFirestore(data)` hydrate le store depuis Firestore
- Au mount : fetch Firestore → si sourceVideoUrl, télécharger via fetch,
  créer blob URL, hydrater le store
- Les actions du store sont IDENTIQUES au Lab (même API), mais
  chaque mutation trigger un debounced save via subscribe

**Champ Firestore :** `editorDataV2` sur la collection `contentItems`
(coexiste avec `editorData` du V1 sans conflit)

---

### 5. MEDIA STORAGE — Vidéos et audio

**Upload :** Fire-and-forget via `uploadBytesResumable` après l'import
- Videos : `videos/{userId}/{itemId}/source_{clipId}.mp4`
- Audio : `audio/{userId}/{itemId}/{clipId}.mp3`
- Cover : généré à l'export, pas stocké séparément

**Download au reload :** fetch le blob depuis Firebase Storage URL,
créer un blob URL local pour le playback

---

### 6. EXPORT — Pipeline de rendu

**Pattern de référence :** `lib/hooks/useVideoExport.ts` du Hub V1

**Approche V2 :**
1. Canvas offscreen 1080×1920 (ou résolution source)
2. Seek frame-by-frame via `requestVideoFrameCallback` (Chrome)
   ou `seek + seeked event` (Safari fallback)
3. Pour chaque frame :
   - Draw video sur le canvas offscreen
   - Appliquer filtre via ctx.filter (Chrome) ou pixel manipulation (Safari)
   - Appeler renderFrame() du Lab pour les sous-titres + text overlays
4. Feed frames à Mediabunny CanvasSource + AudioBufferSource
5. Encode MP4
6. Upload vers Firebase Storage
7. Update contentItem : videoUrl, exportedAt, workflowState: 'ready'

---

### 7. COMPOSANTS — Quoi garder, quoi refaire

**Garder du Lab (copier avec adaptations d'imports) :**
- `renderer.ts` + `animations.ts` — moteur de rendu canvas ✅
- `playback.ts` — findActiveClip, coverCrop, createVideoElement ✅
- `filters.ts` — 16 définitions de filtres CSS ✅
- `presets.ts` — 8 presets de sous-titres ✅
- `types.ts` — Track, VideoClip, AudioClip, TextOverlay ✅
- `frenchPostProcess.ts` + `subtitleGrouper.ts` ✅
- `useSubtitleDrag.ts` — drag sous-titres/overlays sur canvas ✅
- `useMediaRecorder.ts` — capture caméra ✅
- `SubtitleCanvas.tsx` — RAF loop, video, canvas ✅
- `FilterPanel.tsx` — grille de filtres ✅
- `TextPanel.tsx` — éditeur text overlays ✅
- `CoverPanel.tsx` — slider de frame ✅
- `AudioSheet.tsx` — import audio ✅
- `CameraOverlay.tsx` — viewfinder ✅
- `MiniScrubber.tsx` — scrubber persistant ✅
- `PresetGallery.tsx` — sélection de presets ✅
- `BottomSheet.tsx` — système de sheets ✅

**Refaire avec le pattern Hub V1 :**
- `TrackBlock.tsx` → Nouveau `TrackBlockV2.tsx` basé sur TrimHandle pattern
- `TracksPanel.tsx` → Nouveau `TracksPanelV2.tsx` avec zoomLevel en px
- `store.ts` → Nouveau `useEditorV2Store.ts` avec persistence Firestore

**Créer nouveau :**
- `EditorV2Layout.tsx` — layout maître avec auth, persistence, header
- `ExportButtonV2.tsx` — export + upload
- `useEditorV2Persistence.ts` — auto-save Firestore
- `useVideoExportV2.ts` — export avec Lab renderer
- `ImportModalV2.tsx` — import fichier + caméra

---

## MILESTONES — Ordre d'exécution

Chaque milestone est un oneshot prompt pour Claude Code.
Claude Code DOIT lire les fichiers de référence indiqués AVANT de coder.

### M1 — Fondation (lib + store + route)
Créer lib/editor-v2/, lib/store/useEditorV2Store.ts, route /editeur-v2/[id]
Refs: lib/editor-v2/types.ts from Lab, useEditorStore.ts from V1

### M2 — Canvas + Playback
Copier SubtitleCanvas, playback, renderer, animations. Brancher sur V2 store.
Le canvas doit afficher la vidéo immédiatement après import.
Ref: SubtitleCanvas.tsx du Lab

### M3 — Timeline (CRITIQUE — refaire, pas copier)
Nouveau TracksPanelV2 + TrackBlockV2 basé sur TrimHandle pattern du Hub V1.
Drag continu, trim continu, positionnement en pixels, pas de bounce-back.
Refs: TrimHandle.tsx, Track.tsx du Hub V1

### M4 — Sheets UI
Copier les panels (Filter, Text, Audio, Cover, Camera, Presets, Subs).
Adapter imports. Tester chaque panel individuellement.
Ref: page.tsx du Lab pour le système de sheets

### M5 — Persistence Firestore
useEditorV2Persistence (debounce 2s, JSON diff, subscribe pattern).
Upload source media vers Firebase Storage.
Ref: useEditorPersistence.ts du Hub V1

### M6 — Transcription
Brancher useTranscription sur /api/transcribe existant du Hub.
Ref: useTranscription.ts du Lab, api/transcribe/route.ts du Hub

### M7 — Export Pipeline
useVideoExportV2 avec Lab renderer + Mediabunny + upload.
Ref: useVideoExport.ts du Hub V1

### M8 — Polish + Feature Flag
Mobile 375px, edge cases, feature flag NEXT_PUBLIC_EDITOR_V2.
Flow complet end-to-end.

---

## Fichiers de référence clés (Claude Code DOIT les lire)
- `components/features/editor/timeline/TrimHandle.tsx` — pattern drag
- `components/features/editor/timeline/Track.tsx` — pattern timeline
- `lib/hooks/useEditorPersistence.ts` — pattern persistence
- `lib/hooks/useVideoExport.ts` — pattern export
- `lib/store/useEditorStore.ts` — pattern store Hub V1
- `subtitle-lab/lib/store.ts` — store Lab (base pour V2)
- `subtitle-lab/components/SubtitleCanvas.tsx` — RAF loop
- `subtitle-lab/lib/renderer.ts` — moteur de rendu
