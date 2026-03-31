# V2_M3 — Persistance Firestore + Load

## Objectif
Brancher l'auto-save Firestore, implementer le chargement depuis Firestore au mount, et fixer Bug 3 (scrubber sync) et Bug 4 (filter thumbnails).

## Fichiers a lire avant de coder

### Hub (patterns de reference)
- `lib/hooks/useEditorPersistence.ts` — pattern auto-save V1 (debounce 2s, JSON diff, Zustand subscribe, serialisation sans File/blob)
- `components/features/editor/EditorLayout.tsx` — pattern load V1 (getDoc, proxy-video, restauration editorData)
- `lib/firebase.ts` — `getFirebaseFirestore()`, `getFirebaseStorage()`, `getFirebaseAuth()`
- `lib/hooks/useAuth.ts` — auth pattern
- `app/api/proxy-video/route.ts` — proxy pour telecharger les videos depuis Firebase Storage (contourne CORS)
- `lib/store/useEditorV2Store.ts` — store V2 cree en M1

### Editor V2 (cree en M1-M2)
- `lib/store/useEditorV2Store.ts` — store avec `loadFromFirestore()` stub
- `components/features/editor-v2/EditorV2Layout.tsx` — layout cree en M2
- `components/features/editor-v2/SubtitleCanvas.tsx` — canvas avec scrubber sync
- `components/features/editor-v2/FilterPanel.tsx` — panneau filtres avec thumbnails
- `components/features/editor-v2/MiniScrubber.tsx` — scrubber

## Ce que ce milestone doit accomplir

### 1. Creer `lib/hooks/useEditorV2Persistence.ts`

Pattern identique a `useEditorPersistence.ts` mais adapte pour le store V2.

Differences avec le V1 :
- Subscribe a `useEditorV2Store` au lieu de `useEditorStore`
- Serialise le state V2 (tracks, globalPreset, blocks, textOverlays, filterId, filterIntensity, voiceVolume, audioVolume, audioDucking, coverFrameMs, coverDataUrl)
- Les clips video sont serialises SANS `file` et `blobUrl` (non-serialisables) — garder `id`, `duration`, `trimStart`, `trimEnd`, `timelineStart`, `filterId`, `sourceVideoUrl`
- Les audio clips sont serialises SANS `file` et `blobUrl` — garder `id`, `name`, `duration`, `startMs`, `volume`, `fadeIn`, `fadeOut`
- Sauvegarde dans le champ `editorDataV2` du document contentItems (PAS `editorData` — ne pas toucher au V1)
- Debounce 2 secondes
- JSON diff pour eviter les ecritures inutiles
- Retourne `{ saving, saved }`

### 2. Implementer `loadFromFirestore()` dans le store V2

Remplacer le stub cree en M1.

Au mount de EditorV2Layout :
1. Appeler `setItemId(itemId)`
2. Charger le document `contentItems/{itemId}` depuis Firestore
3. Si le document a un champ `editorDataV2`, restaurer l'etat complet
4. Si le document a un `sourceVideoUrl` (ou `videoUrl` en fallback), telecharger la video via `/api/proxy-video?url=...`, creer un File + blobUrl, et charger dans le store
5. Si pas de video et pas d'editorDataV2, montrer l'interface d'import (comme le Lab sans video)

Pattern de reference : `EditorLayout.tsx` lignes 49-96 (loadExisting).

`loadFromFirestore(data)` dans le store doit restaurer :
- Les tracks (avec les clips re-hydrates sans file/blobUrl — ils seront re-telecharges)
- `globalPreset`, `blocks`, `textOverlays`
- `filterId`, `filterIntensity`
- `voiceVolume`, `audioVolume`, `audioDucking`
- `coverFrameMs`, `coverDataUrl`

### 3. Wire la persistance dans EditorV2Layout

- Appeler `useEditorV2Persistence(videoFile ? itemId : null)` (pattern V1 — ne sauvegarde que quand une video est chargee)
- Afficher l'indicateur de sauvegarde dans le header : `CloudArrowUpIcon` animé pendant `saving`, `CheckCircleIcon` vert pendant `saved`
- Remplacer le placeholder de sauvegarde cree en M2

### 4. Fixer Bug 3 — Scrubber pas toujours synchronise

**Probleme :** Le scrubber ne seek pas toujours la video correctement. Les frames ne s'affichent pas en temps reel pendant le scrub. Le scrubber doit montrer la frame exacte correspondant a la position du playhead.

**Ou chercher :** `SubtitleCanvas.tsx` dans la copie — l'effet qui scrub la video quand `currentTime` change et `isPlaying` est false (lignes 101-118 du Lab). Aussi verifier `MiniScrubber.tsx` — est-ce que le onChange met a jour `currentTime` dans le store de facon fluide ?

**Resultat attendu :** Quand l'utilisateur deplace le scrubber, la video affiche la frame correspondante en temps reel. Pas de lag, pas de frame noire.

### 5. Fixer Bug 4 — Thumbnails des filtres

**Probleme :** Les vignettes dans FilterPanel n'utilisent pas toujours l'image de la video. Elles devraient montrer un frame de la video avec le filtre applique.

**Ou chercher :** `FilterPanel.tsx` dans la copie. La logique de generation des thumbnails doit capturer un frame de la video courante et l'afficher avec le CSS filter applique.

**Resultat attendu :** Chaque vignette dans le panneau filtres montre un frame de la video actuellement importee avec le filtre correspondant applique. Si aucune video n'est importee, un placeholder est affiche.

## Ce que ce milestone ne fait PAS
- Pas d'upload des medias source vers Storage (M5 — pour l'instant les videos ne survivent pas au refresh si elles n'ont pas de sourceVideoUrl)
- Pas d'export video (M6)
- Pas de feature flag (M7)

## Definition of Done
1. `npm run build` passe sans erreur
2. L'auto-save fonctionne : modifier un parametre → voir l'indicateur saving → saved dans le header
3. Le champ `editorDataV2` apparait dans Firestore apres une modification
4. Apres un refresh, l'etat est restaure depuis Firestore (presets, filtres, overlays, sous-titres, audio settings, cover)
5. Si une `sourceVideoUrl` existe dans Firestore, la video est re-telechargee et affichee
6. Le scrubber affiche la frame correcte en temps reel pendant le scrub (Bug 3 fixe)
7. Les thumbnails des filtres utilisent un frame de la video courante (Bug 4 fixe)
8. Le V1 n'est pas affecte (champ `editorData` intact)
9. Aucun console.log en production
10. Fonctionne sur mobile 375px
