# Fix — Export vidéo robuste pour fichiers longs (60-90s)

## Problème constaté
Sur iPhone Safari, l'export d'une vidéo de ~90s :
1. Le bouton Exporter ne répondait pas → fixé (window.confirm remplacé par UI inline)
2. L'export démarre mais freeze à 12% → le `requestVideoFrameCallback` joue en TEMPS RÉEL, donc 90s de vidéo = minimum 90s d'export. Si le tab perd le focus ou l'écran se locke, `video.play()` est suspendu et les callbacks s'arrêtent.
3. L'extraction audio via FFmpeg fait `fetchFile(s.videoFile)` qui charge TOUT le fichier (~150MB) en mémoire WASM avant même de commencer — probable OOM sur iPhone.

## Root causes (du rapport d'analyse)
- `requestVideoFrameCallback` ne fonctionne que pendant `video.play()` → temps réel
- `fetchFile(videoFile)` dans useVideoExport charge ~150MB en mémoire WASM pour extraire l'audio
- `file.arrayBuffer()` dans exportWebCodecs charge ~150MB + decodeAudioData ajoute ~150MB en PCM
- Total mémoire pic : ~450MB+ pour un fichier de 150MB → OOM sur iPhone (~1.5GB dispo)

## Stack
Next.js 15, TypeScript, Zustand, FFmpeg.wasm 0.12.6, WebCodecs API, mp4-muxer.

## Ce qui existe

### exportWebCodecs.ts — le frame loop problématique
```
video.requestVideoFrameCallback(capture) → video.play()
```
Ce pattern joue la vidéo en temps réel. Chaque frame est capturée quand le navigateur la rend. Pour 90s @ 30fps = 2700 frames, ça prend minimum 90 secondes, et le tab DOIT rester actif.

### useVideoExport.ts — double chargement mémoire
L'extraction audio FFmpeg fait :
```typescript
await ffmpeg.writeFile('input.mp4', await fetchFile(s.videoFile)); // ~150MB en WASM
```
Puis le WebCodecs loop recrée un `<video>` element avec le même fichier.

## Objectif
Rendre l'export fiable sur des vidéos de 60-90s sur iPhone Safari sans crash mémoire ni freeze.

## Livrables attendus

### 1. Remplacer requestVideoFrameCallback par un seek loop (CRITIQUE)

**Fichier :** `lib/utils/exportWebCodecs.ts`

Remplacer le pattern play+requestVideoFrameCallback par un seek loop :
```
for each frame:
  video.currentTime = trimStart + (frameIndex / fps)
  await waitForSeeked()
  draw canvas
  encode frame
```

Ce pattern est PLUS RAPIDE que le temps réel (le seek est quasi-instantané sur les fichiers locaux) et ne dépend pas de `video.play()` — donc le tab peut être en arrière-plan.

**Détails d'implémentation :**
- FPS cible : 30
- Nombre total de frames : `Math.ceil((trimEnd - trimStart) * 30)`
- Pour chaque frame :
  1. `video.currentTime = trimStart + (frameIndex / 30)`
  2. Attendre l'event `seeked` via une Promise
  3. Dessiner sur le canvas (avec filtres, overlays, sous-titres)
  4. Créer le VideoFrame et encoder
  5. Appeler `onProgress(Math.round(frameIndex / totalFrames * 100))`
- NE PAS appeler `video.play()` — tout se fait par seek
- Utiliser un petit `await new Promise(r => setTimeout(r, 0))` entre chaque frame pour ne pas bloquer le thread principal et permettre les updates UI

**Avantage :** L'export de 90s prend ~15-30s au lieu de 90s+, et fonctionne même si le tab perd le focus.

### 2. Extraire l'audio SANS charger le fichier entier en mémoire WASM

**Fichier :** `lib/hooks/useVideoExport.ts`

Le problème actuel : `fetchFile(s.videoFile)` charge tout le fichier en `Uint8Array` puis le copie en mémoire WASM. Pour un fichier de 150MB, c'est ~300MB d'allocation.

**Solution :** Utiliser `file.arrayBuffer()` directement (sans passer par fetchFile) et le writer en chunks :
```typescript
const buffer = await s.videoFile.arrayBuffer();
await ffmpeg.writeFile('input.mp4', new Uint8Array(buffer));
```
C'est pareil en mémoire mais évite la copie supplémentaire de fetchFile.

**Meilleure solution :** Si le fichier est > 50MB, SKIP l'extraction audio côté FFmpeg et utiliser directement le `<audio>` element du navigateur pour décoder :
```typescript
if (s.videoFile.size > 50 * 1024 * 1024) {
  // Gros fichier : décoder l'audio via AudioContext + <audio> element
  // Pas besoin de FFmpeg du tout pour l'audio
  const audio = new Audio(URL.createObjectURL(s.videoFile));
  // ... utiliser MediaElementSourceNode
} else {
  // Petit fichier : FFmpeg comme avant
}
```

Ou encore mieux : ne pas extraire l'audio du tout si pas de modifications audio. Si `audioUrl` est null (pas de musique ajoutée) et pas de trim audio, on peut copier le stream audio directement dans le muxer.

**Solution pragmatique recommandée :**
Pour les fichiers > 30MB, utiliser le fallback FFmpeg complet (pas WebCodecs) pour l'export — FFmpeg gère mieux la mémoire et fait tout en une passe (video + audio). Le WebCodecs est gardé pour les fichiers courts où il est plus rapide.

### 3. Fallback intelligent basé sur la taille du fichier

**Fichier :** `lib/hooks/useVideoExport.ts`

```typescript
const useWC = supportsWebCodecs && !s.audioUrl && s.videoFile.size < 30 * 1024 * 1024; // < 30MB
```

Pour les fichiers > 30MB (typiquement > 30-40s de vidéo) :
- Utiliser le pipeline FFmpeg.wasm complet (déjà implémenté dans le else branch)
- FFmpeg fait le trim, les filtres, et l'encodage en une seule passe
- Pas de problème de mémoire car FFmpeg stream les données

Pour les fichiers < 30MB :
- Garder le pipeline WebCodecs (plus rapide, hardware-accelerated)
- Mais avec le seek loop au lieu de requestVideoFrameCallback

### 4. Nettoyage mémoire dans exportWebCodecs.ts

Après le loop de frames :
- `URL.revokeObjectURL(video.src)` — déjà fait ✅
- `video.remove()` — libérer l'element vidéo du DOM
- `canvas.remove()` — libérer le canvas
- Mettre `audioBuf = null` après utilisation

### 5. Progression informative pour les fichiers longs

**Fichier :** `components/features/editor/ExportButton.tsx`

Le warning inline est déjà en place. Ajouter :
- Pour les fichiers > 30MB (FFmpeg path) : montrer la progression FFmpeg (déjà exposée via `ffmpeg.on('progress')`)
- Pour les fichiers < 30MB (WebCodecs path) : montrer le frame count `Encodage ${frameIndex}/${totalFrames}`
- Pendant l'extraction audio : "Préparation audio..."

## Contraintes
- NE PAS modifier les tracks de la timeline (Track.tsx, TextTrack.tsx, etc.)
- NE PAS modifier ResizeDivider.tsx, TrimHandle.tsx, EditorLayout.tsx
- NE PAS modifier la Cloud Function transcribeAudio
- NE PAS supprimer le pipeline WebCodecs (le garder pour les petits fichiers)
- NE PAS supprimer le pipeline FFmpeg (le garder comme fallback)
- Le format de sortie reste MP4 H.264
- Les vidéos courtes (< 30s) doivent fonctionner identiquement
- Les overlays texte et sous-titres doivent être rendus correctement dans les deux pipelines

## Definition of Done
- [ ] Export d'une vidéo de 90s fonctionne sur iPhone Safari sans crash
- [ ] Le seek loop remplace requestVideoFrameCallback dans exportWebCodecs
- [ ] Les fichiers > 30MB utilisent le fallback FFmpeg automatiquement
- [ ] Pas de `fetchFile` pour les gros fichiers (ou chunked)
- [ ] La mémoire est nettoyée après l'export (video.remove, canvas.remove)
- [ ] La progression est informative (frame count ou pourcentage FFmpeg)
- [ ] Les vidéos courtes (< 15s) fonctionnent toujours via WebCodecs
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `project-docs/04_DEV_SYSTEM/analysis/EXPORT_SUBTITLE_ANALYSIS.md`
- `lib/utils/exportWebCodecs.ts` (le frame loop à modifier)
- `lib/hooks/useVideoExport.ts` (l'orchestrateur)
- `lib/hooks/useFFmpeg.ts` (singleton FFmpeg)
- `lib/utils/ffmpegCommands.ts` (commandes FFmpeg existantes)
- `components/features/editor/ExportButton.tsx` (UI)
