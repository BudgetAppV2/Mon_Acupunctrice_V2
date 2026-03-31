# V2_M5 — Upload source media

## Objectif
Uploader les videos et audios importes vers Firebase Storage en background pour qu'ils survivent au refresh. Stocker les URLs sur les clips dans Firestore via la persistance auto-save.

## Fichiers a lire avant de coder

### Hub (patterns de reference)
- `lib/firebase.ts` — `getFirebaseStorage()`, `getFirebaseAuth()`
- `lib/hooks/useVideoExport.ts` — pattern upload resumable (`uploadBytesResumable`, `getDownloadURL`)
- `lib/hooks/useEditorPersistence.ts` — auto-save qui serialise `sourceVideoUrl` sur les clips
- `lib/store/useEditorStore.ts` — `sourceVideoUrl` sur VideoClip (V1)

### Editor V2 (cree en M1-M3)
- `lib/store/useEditorV2Store.ts` — store V2 avec `sourceVideoUrl` sur VideoClip
- `lib/hooks/useEditorV2Persistence.ts` — auto-save qui serialise les clips
- `components/features/editor-v2/EditorV2Layout.tsx` — layout ou wire l'upload

## Ce que ce milestone doit accomplir

### 1. Creer `lib/hooks/useEditorV2Upload.ts`

Hook qui uploade les medias importes en background.

Comportement :
- Quand un VideoClip est ajoute au store avec un `file` mais sans `sourceVideoUrl`, uploader le fichier vers Firebase Storage
- Path Storage : `editor-v2/{userId}/{itemId}/source_{clipId}.mp4`
- Upload resumable (`uploadBytesResumable`) pour les gros fichiers
- Une fois l'upload termine, mettre a jour le `sourceVideoUrl` du clip dans le store
- La persistance auto-save (M3) sauvegardera automatiquement le `sourceVideoUrl` dans Firestore

Meme logique pour les AudioClips :
- Path Storage : `editor-v2/{userId}/{itemId}/audio_{clipId}.mp3`
- Stocker dans un champ `audioUrl` sur l'AudioClip (ajouter ce champ au type si absent)
- La persistance serialise deja les audioClips sans file/blobUrl — `audioUrl` sera sauvegarde

### 2. Wire dans EditorV2Layout

- Appeler `useEditorV2Upload(itemId)` dans EditorV2Layout
- Le hook surveille le store via `subscribe` et uploade automatiquement les nouveaux fichiers
- Pas de UI visible pour l'upload (c'est en background) — l'indicateur de sauvegarde suffit

### 3. Gerer le re-download au load

Verifier que le flow de M3 (`loadFromFirestore`) fonctionne avec les `sourceVideoUrl` :
- Quand on restaure un clip avec `sourceVideoUrl`, telecharger via `/api/proxy-video`
- Creer un File + blobUrl et mettre a jour le clip dans le store
- Meme chose pour les AudioClips avec `audioUrl`

### 4. Ajouter `audioUrl` au type AudioClip si necessaire

Dans `lib/editor-v2/types.ts`, verifier que `AudioClip` a un champ `audioUrl?: string | null` pour stocker l'URL Firebase Storage.

## Ce que ce milestone ne fait PAS
- Pas d'upload du MP4 exporte (M6)
- Pas de progression visible pour l'upload (background silencieux)
- Pas de gestion de quota Storage

## Definition of Done
1. `npm run build` passe sans erreur
2. Importer une video → elle est uploadee en background vers Firebase Storage
3. Le `sourceVideoUrl` apparait dans Firestore apres l'upload
4. Refresh la page → la video est re-telechargee depuis Firebase Storage et affichee
5. Importer un audio → il est uploade en background
6. Refresh → l'audio est re-telechargee et fonctionnel
7. L'upload est resumable (pas de crash sur gros fichiers)
8. Le V1 n'est pas affecte
9. Aucun console.log en production
10. Fonctionne sur mobile 375px
