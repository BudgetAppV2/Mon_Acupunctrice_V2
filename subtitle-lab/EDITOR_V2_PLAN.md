# Editor V2 — Plan de migration (révisé)

## Stratégie en deux phases

### Phase A — Lab standalone (subtitle-lab sur Vercel)
Implémenter et valider TOUT dans le Lab isolé, sans Firestore/auth/routing.
On teste le multi-track, l'audio, les filtres, les transitions. On identifie
les pièges et on stabilise l'architecture. Le Lab a sa propre URL Vercel
et peut être testé sur mobile immédiatement.

### Phase B — Intégration hub (un oneshot confiant)
Une fois le Lab stable, on écrit UN oneshot qui porte tout dans le hub :
- Créer `/editeur-v2/[id]` qui utilise le nouveau code
- Brancher Firestore (persistence, ContentItem)
- Brancher les hooks métier (auth, transcription, export, publication)
- Feature flag pour switcher entre ancien et nouveau

La Phase A élimine l'incertitude technique. La Phase B est de la plomberie.

---

## Phase A — Milestones Lab

### Ce qu'on a (code prouvé dans editor-pro à réutiliser)

**Audio** (beaucoup de troubleshooting déjà fait):
- `AudioPanel.tsx` — recherche musique, import local, volume voix/musique,
  fade in/out, ducking
- `useMusicSearch.ts` — Recherche Jamendo API
- `AudioTrackTimeline.tsx` — waveform sur la timeline
- Audio mix dans l'export (Web Audio API + AAC WASM polyfill pour Safari)
- `voiceVolume`, `audioVolume`, `audioFadeIn/Out`, `audioDucking` dans le store

**Qualité vidéo** (important à préserver):
- Canvas 540×960 (9:16) — cover-fit avec crop
- requestVideoFrameCallback pour sync frame-perfect
- CSS filter appliqué sur le canvas element (pas WebGL pour preview)
- WebGL LUT uniquement à l'export (évite le bug de noircissement)
- H.264 High Profile 3.5 Mbps 30fps dans l'export

**Multi-clip** (planifié en M2-M4, jamais implémenté):
- `recalcTimelineStarts()` — recalcul des positions après trim/reorder
- `getClipAtTime()` — conversion temps global → local
- Changement de src vidéo entre clips pendant le playback
- Export séquentiel (timestamps globaux continus, un seul muxer)
- Audio par clip avec concaténation
- Nettoyage mémoire entre clips (critique iPhone)

**Transcription**:
- `useTranscription.ts` — AssemblyAI, chunking WAV, merge, post-processing FR
- API route `/api/transcribe` — proxy AssemblyAI
- `subtitleGrouper.ts` — groupement des mots en segments

**Recording**:
- `useMediaRecorder.ts` — webcam, countdown 3-2-1, MP4/WebM, fix-webm-duration

---

| ID | Nom | Description | Risque |
|----|-----|-------------|--------|
| A1 | Store tracks[] | Nouveau data model multi-piste | Bas |
| A2 | Scrubber + Sheet Tracks | UI timeline multi-piste | Moyen |
| A3 | Multi-clip playback | Preview séquentielle N clips | Haut |
| A4 | Audio complet | Import audio, mix, volume, waveform | Moyen |
| A5 | Import camera + countdown | Enregistrement avec 3-2-1 | Bas |
| A6 | Transcription | AssemblyAI → SubtitleBlock[] réels | Moyen |
| A7 | Interactions avancées | Split, reorder, trim handles | Moyen |
| A8 | Filtres fixes | CSS filter par clip, retirer LUT WebGL du preview | Bas |

### A1 — Store tracks[]

**Objectif**: Refactorer le store flat en structure tracks[].

```typescript
type TrackType = 'video' | 'subtitle' | 'audio';

interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  duration: number;        // ms, durée source
  trimStart: number;       // ms
  trimEnd: number;         // ms
  timelineStart: number;   // ms, calculé par recalcTimelineStarts
  filterId: string;        // CSS filter par clip
  thumbnailUrl: string | null;
}

interface SubtitleTrackData {
  blocks: SubtitleBlock[];
  globalPreset: StylePreset;
}

interface AudioClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  name: string;
  duration: number;
  startMs: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

interface Track {
  id: string;
  type: TrackType;
  label: string;
  muted: boolean;
  clips?: VideoClip[];
  subtitles?: SubtitleTrackData;
  audioClips?: AudioClip[];
}
```

**Store initial**: Créer 3 tracks par défaut (V1, Sous-titres, Audio).
Migrer les composants existants pour lire depuis tracks[].
Helpers: `getVideoTrack()`, `getSubtitleTrack()`, `getAudioTrack()`,
`getActiveVideoClip(currentTime)`, `recalcTimelineStarts()`.

**DoD**: Le Lab fonctionne comme avant mais avec le nouveau store.

---

### A2 — Scrubber persistant + Sheet Tracks

**Objectif**: Scrubber mini toujours visible + sheet Tracks multi-piste.

**MiniScrubber.tsx**: Barre fine 4px entre canvas et bottom sheet.
Touch-enabled. Toujours visible quel que soit le sheet ouvert.

**TracksPanel.tsx**: Contenu du sheet Tracks. Affiche les pistes empilées
(vidéo, sous-titres, audio) avec un playhead vertical synchronisé.
Tap un bloc → sélection. La sélection persiste entre sheets.

**TrackBlock.tsx**: Bloc individuel avec trim handles draggables.
Réutiliser les patterns de TrimHandle.tsx du editor-pro.

**Règle multi-cam**: La piste vidéo la plus haute au moment currentTime
est le preview principal. Si V1 a un clip à t=5s et V2 aussi, V1 gagne.

**DoD**: Le scrubber est visible et draggable. Le sheet Tracks montre
les pistes avec les blocs. Tap sélectionne. Playhead se déplace.

---

### A3 — Multi-clip playback

**Objectif**: Le preview joue N clips en séquence avec changement de source.

**Logique critique** (documentée dans multiclip_M2):
- `getClipAtTime(clips, globalTime)` → `{ clip, localTime }`
- Pendant le play: quand `video.currentTime >= clip.trimEnd` → charger le clip
  suivant (`video.src = nextClip.blobUrl`, seek à `trimStart`)
- Pendant le seek: trouver le bon clip, changer src si nécessaire
- Preview noire si aucun clip à currentTime

**2e vidéo importée → nouvelle piste V2** (pas bout-à-bout sur V1).

**DoD**: Import 2 vidéos → 2 pistes visibles → le preview montre la piste
du haut → scrub fonctionne sur les deux → play séquentiel fonctionne.

---

### A4 — Audio complet

**Objectif**: Import audio (fichier local ou recherche Jamendo),
volume voix/musique, fade in/out, ducking, waveform timeline.

**Code à porter depuis editor-pro**:
- `AudioPanel.tsx` → adapter pour le bottom sheet mobile
- `useMusicSearch.ts` → copier tel quel
- `AudioTrackTimeline.tsx` → adapter pour le sheet Tracks
- Store: `voiceVolume`, `audioVolume`, `audioFadeIn/Out`, `audioDucking`
  → déjà dans AudioClip du track audio

**Sheet Audio** (nouveau SheetId: 'audio'):
- Icône MusicNote dans la toolbar
- Import fichier local + recherche Jamendo (si API dispo)
- Sliders volume voix/musique
- Fade in/out
- Toggle ducking

**DoD**: Import audio fonctionne. Volume voix/musique ajustable.
Le waveform apparaît sur la piste audio dans le sheet Tracks.

---

### A5 — Import caméra + countdown

**Objectif**: Le bouton Import offre Fichier ou Caméra.
Caméra avec countdown 3-2-1 animé sur le canvas.

**Code à porter**: `useMediaRecorder.ts` (copier, adapter les imports).
Overlay countdown: 3→2→1→REC sur le canvas pendant le décompte.

**DoD**: Tap Import → menu Fichier/Caméra. Caméra affiche le viewfinder
dans le canvas. Countdown 3-2-1 animé. La vidéo enregistrée charge
dans le preview normalement.

---

### A6 — Transcription

**Objectif**: Bouton "Transcrire" qui envoie l'audio à AssemblyAI
et génère des SubtitleBlock[] réels avec word-level timing.

**Code à porter**: `useTranscription.ts`, `/api/transcribe` route.

**Conversion**: AssemblyAI words[] → SubtitleBlock[] du Lab.
C'est direct car les deux ont des word-level timestamps.
Utiliser `subtitleGrouper.ts` pour le groupement en blocs.

**Alternative**: Import SRT/VTT → parse → SubtitleBlock[].

**DoD**: Bouton Transcrire dans le sheet Sous-titres. Loading state.
Les blocs générés s'affichent sur le preview en sync avec la vidéo.

---

### A7 — Interactions avancées

**Objectif**: Split au playhead, réordonnement drag, trim handles.

**Référence**: multiclip_M3_interactions/PROMPT.md contient toute la spec.
- `splitClip(id, globalTime)` → coupe un clip en deux
- `reorderClips(fromIdx, toIdx)` → drag-to-reorder avec long press
- Trim handles sur le clip sélectionné dans le sheet Tracks
- Bouton supprimer clip (si > 1 clip)

**DoD**: Split, reorder, trim, suppression fonctionnent dans le Lab.

---

### A8 — Filtres fixes

**Objectif**: Corriger le bug LUT noircissant. CSS filter par clip.

**Solution**: Retirer applyLut() du RAF loop. Les LUT presets deviennent
des approximations CSS filter (on a déjà le `tint` de chaque LUT).
Le WebGL LUT renderer est gardé pour l'export uniquement.

Chaque VideoClip a son `filterId`. Le preview applique le CSS filter
du clip actif sur le canvas element.

**DoD**: Les filtres fonctionnent sans couche noire. Chaque clip
peut avoir un filtre différent visible dans le preview.

---

## Phase B — Intégration hub (oneshot unique)

**Prérequis**: Phase A complète et stable.

**Scope du oneshot**:
1. Créer `app/(app)/editeur-v2/[id]/page.tsx`
2. Copier les composants du Lab dans le hub (ou imports croisés)
3. Brancher `useEditorPersistence` adapté au store tracks[]
4. Brancher `useAuth` (gate login)
5. Brancher `useVideoExport` adapté au multi-track
6. Brancher `useMultiPlatformPublish`
7. Charger ContentItem existant → hydrater tracks[]
8. Feature flag `NEXT_PUBLIC_EDITOR_V2=true`
9. `editorVersion: 2` dans Firestore pour rétrocompatibilité
10. Route `/api/transcribe` déjà dans le hub → réutiliser

**Ce oneshot sera facile** parce que toute l'incertitude technique est
résolue en Phase A. C'est de la plomberie.

---

## Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| LUT noircit | UX cassée | A8: CSS filter preview, WebGL export only |
| Multi-clip changement src | Glitch audio/vidéo | A3: preload clip suivant, blackframe pendant transition |
| Audio mix Safari | Pas de son | Réutiliser AAC WASM polyfill prouvé dans editor-pro |
| Mémoire iPhone multi-clip | Crash | Nettoyage agressif, un seul <video> element |
| Firestore indexes | Deploy bloqué | Vérifier indexes avant Phase B |
| Transcription coûts | Budget | Même API, même limites que editor-pro |
| Performance canvas 60fps | Lag mobile | requestVideoFrameCallback, throttle si batterie |

## Décisions actées

- Scrubber persistant entre canvas et sheet (barre fine toujours visible)
- Sélection depuis sheet Tracks uniquement (tap un bloc)
- Sélection partagée entre sheets (persiste quand on switch)
- Filtre par clip vidéo
- 2e vidéo → nouvelle piste V2 (multi-cam, pas bout-à-bout)
- Piste la plus haute = preview principal
- Position sous-titres préservée lors des changements de preset
- Types Lab (SubtitleBlock avec word timing) = source de vérité
- Phase A dans le Lab standalone → Phase B oneshot dans le hub
- CSS filter pour preview, WebGL LUT pour export uniquement
- Audio complet: volume voix/musique, fade, ducking, waveform

## Fichiers de référence (editor-pro)

**Hooks à porter**:
- `lib/hooks/useTranscription.ts` → transcription AssemblyAI
- `lib/hooks/useMediaRecorder.ts` → caméra + countdown
- `lib/hooks/useEditorPersistence.ts` → Firestore (Phase B)
- `lib/hooks/useVideoExport.ts` → export WebCodecs (Phase B)
- `lib/hooks/useMultiPlatformPublish.ts` → publication (Phase B)
- `lib/hooks/useMusicSearch.ts` → recherche Jamendo

**Composants à porter/adapter**:
- `components/features/editor/panels/AudioPanel.tsx`
- `components/features/editor/timeline/TrimHandle.tsx`
- `components/features/editor/timeline/AudioTrackTimeline.tsx`
- `components/features/editor/ImportModal.tsx` (partie caméra)

**Prompts multiclip non-implémentés** (référence précieuse):
- `project-docs/02_ROADMAP/prompts_used/multiclip_M2_timeline/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/multiclip_M3_interactions/PROMPT.md`
- `project-docs/02_ROADMAP/prompts_used/multiclip_M4_export/PROMPT.md`

**Utils critiques**:
- `lib/utils/subtitleGrouper.ts` → groupement mots en segments
- `lib/utils/frenchPostProcess.ts` → correction français
- `lib/utils/exportWebCodecs.ts` → export (Phase B)
- `lib/editor/lutParser.ts` + `lutRenderer.ts` → déjà dans Lab
