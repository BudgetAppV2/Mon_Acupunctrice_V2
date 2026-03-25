# Fix Architecture — Gestion vidéo optimisée pour fichiers longs (60-90s)

## Problème de fond
Chaque opération qui a besoin de la vidéo la re-télécharge depuis Firebase Storage via `/api/proxy-video`. Pour un fichier de 150MB, ça veut dire :
- **Ouverture éditeur** : télécharge 150MB via proxy → blob → File → store
- **Cover picker** : re-télécharge 150MB via proxy pour un `<video>` séparé
- **Export WebCodecs** : re-crée un `<video>` avec le même fichier (OK, c'est un blob local)
- **Export FFmpeg** : `fetchFile(videoFile)` copie 150MB en mémoire WASM

Sur iPhone Safari avec ~1.5GB de RAM, ces copies multiples causent des OOM.
L'export via `requestVideoFrameCallback` est en temps réel (90s pour exporter 90s).
Le cover picker seek sur un fichier proxié est lent et peu fiable sur Safari iOS.

## Objectif
Créer une architecture où le fichier vidéo est chargé UNE SEULE FOIS et réutilisé partout, avec un export plus rapide que le temps réel.

## Stack
Next.js 15, TypeScript, Zustand, FFmpeg.wasm 0.12.6, WebCodecs API, mp4-muxer.

## Livrables attendus

### 1. Cache vidéo local — charger une fois, réutiliser partout

**Fichier principal :** `lib/store/useEditorStore.ts`

Le store a déjà `videoFile: File | null` et `videoUrl: string` (blob URL). Le problème c'est que le CoverPicker crée son propre `<video>` avec `/api/proxy-video?url=...` au lieu de réutiliser le blob URL du store.

**Fix dans `components/features/publish/CoverPicker.tsx` :**
- Remplacer `const videoSrc = /api/proxy-video?url=${encodeURIComponent(videoUrl)};` par utiliser directement le blob URL du store : `useEditorStore.getState().videoUrl`
- Si le blob URL du store n'existe pas (l'éditeur n'a pas été ouvert), ALORS utiliser le proxy comme fallback
- Ça élimine le re-téléchargement de 150MB pour le cover picker

### 2. Export seek-based au lieu de temps réel (CRITIQUE)

**Fichier :** `lib/utils/exportWebCodecs.ts`

Remplacer le pattern `video.play()` + `requestVideoFrameCallback` par un seek loop :

```
const fps = 30;
const totalFrames = Math.ceil((trimEnd - trimStart) * fps);

for (let i = 0; i < totalFrames; i++) {
  video.currentTime = trimStart + (i / fps);
  await new Promise(resolve => {
    video.onseeked = resolve;
  });
  // draw canvas, encode frame
  await new Promise(r => setTimeout(r, 0)); // yield au thread principal
  onProgress(Math.round(i / totalFrames * 100));
}
```

**Avantages :**
- 3-6x plus rapide que le temps réel (seek est quasi-instantané sur blob local)
- Fonctionne si le tab perd le focus ou l'écran se locke
- Pas de dépendance à `video.play()` (bloqué par Safari dans certains contextes)
- Progression plus granulaire et fiable

**Points d'attention :**
- Le `<video>` doit utiliser le blob URL local (pas le proxy) pour que le seek soit rapide
- Après chaque seek, attendre l'event `seeked` avant de capturer
- Ajouter un `await new Promise(r => setTimeout(r, 0))` entre chaque frame pour ne pas bloquer l'UI
- Garder le keyframe interval (1 keyframe toutes les 60 frames)

### 3. Seuil intelligent WebCodecs vs FFmpeg

**Fichier :** `lib/hooks/useVideoExport.ts`

Actuellement `const useWC = supportsWebCodecs && !s.audioUrl;`
Le problème c'est que pour les gros fichiers, l'extraction audio FFmpeg fait `fetchFile(s.videoFile)` qui charge tout en mémoire WASM (~300MB pour un fichier de 150MB).

**Fix :**
```typescript
const fileSizeMB = s.videoFile.size / (1024 * 1024);
const useWC = supportsWebCodecs && !s.audioUrl && fileSizeMB < 100;
```

- Fichiers < 100MB (~60s de vidéo) : WebCodecs seek loop + extraction audio FFmpeg
- Fichiers >= 100MB (~90s+) : Pipeline FFmpeg complet (une seule passe, gère mieux la mémoire)

Pour les gros fichiers avec le pipeline FFmpeg, NE PAS extraire l'audio séparément — FFmpeg fait tout en une passe (trim + filtres + encodage vidéo + audio).

### 4. Extraction audio optimisée pour WebCodecs path

**Fichier :** `lib/hooks/useVideoExport.ts`

Pour les fichiers < 100MB qui passent par WebCodecs, l'extraction audio actuelle charge le fichier entier en mémoire WASM (`fetchFile`). Optimiser :

- Utiliser `s.videoFile.arrayBuffer()` directement au lieu de `fetchFile` (évite une copie supplémentaire)
- Extraire en MP3 compressé au lieu de WAV non compressé : `-vn -ar 48000 -ac 2 -b:a 128k audio.mp3`
- Un MP3 de 60s @ 128kbps = ~1MB vs WAV = ~30MB
- Nettoyer la mémoire WASM immédiatement après extraction : `ffmpeg.deleteFile('input.mp4')`

### 5. CoverPicker plus réactif

**Fichier :** `components/features/publish/CoverPicker.tsx`

Problèmes actuels :
- Charge la vidéo via proxy (lent sur gros fichiers)
- Le seek sur un fichier proxié est très lent
- Multiples timeouts/fallbacks Safari compliquent le code

**Fix :**
- Utiliser le blob URL du store (déjà en mémoire, seek instantané)
- Simplifier le code Safari : le blob URL local n'a pas de problème cross-origin
- Supprimer le proxy fallback puisque le CoverPicker n'est accessible que depuis l'éditeur (où le blob existe toujours)
- Augmenter le `step` du slider pour les longues vidéos : `step={duration > 60 ? 500 : 100}` (sauts de 0.5s au lieu de 0.1s)
- Debouncer le seek du slider (200ms) pour ne pas seek à chaque pixel de déplacement

### 6. Nettoyage mémoire après export

**Fichier :** `lib/utils/exportWebCodecs.ts`

Après le loop de frames :
```typescript
video.pause();
video.removeAttribute('src');
video.load(); // force le release des buffers
URL.revokeObjectURL(video.src); // déjà fait
canvas.width = 0; canvas.height = 0; // force le release du canvas buffer
audioBuf = null;
```

## Contraintes
- NE PAS modifier les tracks de la timeline
- NE PAS modifier ResizeDivider, TrimHandle, EditorLayout
- NE PAS modifier les Cloud Functions
- NE PAS supprimer le pipeline FFmpeg (garder comme fallback pour gros fichiers et audio custom)
- Le format de sortie reste MP4 H.264
- Les vidéos courtes (< 30s) doivent fonctionner identiquement ou mieux
- Les overlays texte et sous-titres doivent être rendus dans les deux pipelines
- Le CoverPicker doit fonctionner même si on y accède sans passer par l'éditeur (ex: depuis ItemDetailSheet) — dans ce cas, fallback au proxy

## Definition of Done
- [ ] Le CoverPicker utilise le blob URL du store (pas le proxy) quand disponible
- [ ] Le seek du slider CoverPicker est fluide (debounce + step adaptatif)
- [ ] L'export utilise un seek loop au lieu de requestVideoFrameCallback
- [ ] L'export de 90s prend < 45 secondes (au lieu de 90s+)
- [ ] Fichiers > 100MB utilisent le pipeline FFmpeg complet
- [ ] L'extraction audio produit du MP3 (pas WAV) pour le path WebCodecs
- [ ] La mémoire est nettoyée après l'export
- [ ] Les vidéos courtes fonctionnent identiquement
- [ ] L'export fonctionne même si le tab perd le focus momentanément
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md`
- `lib/utils/exportWebCodecs.ts` (le frame loop à refaire)
- `lib/hooks/useVideoExport.ts` (orchestrateur export)
- `lib/hooks/useFFmpeg.ts` (singleton FFmpeg)
- `lib/utils/ffmpegCommands.ts` (commandes FFmpeg)
- `components/features/publish/CoverPicker.tsx` (à optimiser)
- `lib/store/useEditorStore.ts` (blob URL du store)
- `components/features/editor/ExportButton.tsx` (UI)
