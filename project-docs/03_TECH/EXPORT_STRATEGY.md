# EXPORT_STRATEGY.md
# Stratégie d'export vidéo — Optimisation mobile
*Version 1.0 — Mars 2026*

---

## Objectif

Export rapide sur iPhone.
Qualité acceptable pour Instagram Reels.
Pas de serveur — tout in-browser.

---

## Specs cibles — Instagram Reels 2026

```
Résolution : 1080 × 1920px (9:16 vertical)
FPS        : 30fps
Codec      : H.264 (AVC)  ← PAS H.265
Bitrate    : 8 Mbps (vidéo)
Audio      : AAC, 48kHz, 256kbps
Container  : MP4
Taille     : ~60-100MB pour 60 secondes
```

### Pourquoi H.264 et pas H.265

- Instagram recompresse à l'upload de toute façon → H.265 ne donne aucun avantage
- H.264 hardware encoder disponible sur tous les iPhones (A-series chip)
- WebCodecs supporte H.264 partout, H.265 seulement sur les appareils récents
- FFmpeg.wasm encode H.264 2x plus vite que H.265

---

## Architecture à 2 niveaux

```
Démarrer l'export
      ↓
WebCodecs disponible?
  (typeof VideoEncoder !== 'undefined')
      ↓
  OUI → WebCodecs pipeline    ← hardware-accelerated, 10-50x plus rapide
  NON → FFmpeg.wasm fallback  ← CPU uniquement, plus lent mais universel
```

---

## Niveau 1 — WebCodecs (prioritaire)

### Disponibilité
- Chrome 94+ ✅
- Safari 16.4+ (iPhone iOS 16.4+) ✅
- Firefox ❌ (pas encore implémenté)

### Pipeline

```typescript
// 1. Lire la vidéo frame par frame via VideoDecoder
// 2. Appliquer les filtres CSS convertis en canvas operations
// 3. Encoder chaque frame via VideoEncoder (hardware H.264)
// 4. Muxer en MP4 via mp4-muxer

import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

const muxer = new Muxer({
  target: new ArrayBufferTarget(),
  video: {
    codec: 'avc',           // H.264
    width: 1080,
    height: 1920,
  },
  audio: {
    codec: 'aac',
    sampleRate: 48000,
    numberOfChannels: 2,
  },
  fastStart: 'in-memory',   // Optimisé pour streaming
})

const encoder = new VideoEncoder({
  output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
  error: console.error,
})

encoder.configure({
  codec: 'avc1.4d0028',     // H.264 High Profile Level 4.0
  width: 1080,
  height: 1920,
  bitrate: 8_000_000,       // 8 Mbps
  framerate: 30,
  bitrateMode: 'variable',
  hardwareAcceleration: 'prefer-hardware',  // iPhone hardware encoder
})
```

### Librairies requises
```bash
npm install mp4-muxer
# WebCodecs est natif — pas de lib supplémentaire
```

---

## Niveau 2 — FFmpeg.wasm (fallback)

### Quand utilisé
- Firefox
- Anciens iPhones (iOS < 16.4)
- Safari Desktop (rare dans notre cas)

### Commande optimisée

```typescript
// Optimisations clés :
// -ss avant -i : seek rapide (3-5x plus vite)
// -c:v libx264 ultrafast : encoding le plus rapide
// -crf 23 : qualité/taille optimale
// -preset ultrafast : priorité vitesse
// -movflags +faststart : optimisé pour streaming web

const ffmpegArgs = [
  '-ss', trimStart.toString(),     // Seek AVANT -i (rapide)
  '-i', 'input.mp4',
  '-to', duration.toString(),
  '-vf', `scale=1080:1920:force_original_aspect_ratio=decrease,
          pad=1080:1920:(ow-iw)/2:(oh-ih)/2,
          ${filterString}`,        // Filtres CSS → FFmpeg equivalent
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-crf', '23',
  '-profile:v', 'high',
  '-level', '4.0',
  '-pix_fmt', 'yuv420p',          // Compatible avec tous les players
  '-c:a', 'aac',
  '-b:a', '256k',
  '-ar', '48000',
  '-movflags', '+faststart',
  '-y',
  'output.mp4'
]
```

### Filtres CSS → FFmpeg equivalents

```typescript
const CSS_TO_FFMPEG_FILTERS = {
  normal:     '',
  lumineux:   'eq=brightness=0.2:contrast=1.1:saturation=1.3',
  chaud:      'eq=saturation=1.4:hue=-15:brightness=0.1,colorchannelmixer=rr=1.1:gg=0.95:bb=0.85',
  froid:      'eq=saturation=0.8:hue=15:brightness=0.05',
  vintage:    'eq=saturation=0.9:brightness=0.05,colorchannelmixer=rr=1.1:gg=0.95:bb=0.85,vignette',
  noir_blanc: 'hue=s=0,eq=contrast=1.3',
  doux:       'eq=brightness=0.1:saturation=0.9:contrast=0.95',
  vif:        'eq=saturation=1.6:contrast=1.15',
  sombre:     'eq=brightness=-0.25:contrast=1.3:saturation=1.1',
}
```

---

## Gestion de la progression

```typescript
// WebCodecs — calculer la progression
const totalFrames = Math.ceil(duration * 30)
let processedFrames = 0

encoder.output = (chunk, meta) => {
  processedFrames++
  const progress = Math.round((processedFrames / totalFrames) * 100)
  onProgress(progress)
  muxer.addVideoChunk(chunk, meta)
}

// FFmpeg.wasm — listener natif
ffmpeg.on('progress', ({ progress }) => {
  onProgress(Math.round(progress * 100))
})
```

---

## Temps d'export estimés

| Durée vidéo | WebCodecs (iPhone) | FFmpeg.wasm (iPhone) |
|-------------|-------------------|---------------------|
| 15 secondes | ~3 secondes | ~30-60 secondes |
| 30 secondes | ~6 secondes | ~60-120 secondes |
| 60 secondes | ~12 secondes | ~120-240 secondes |
| 90 secondes | ~18 secondes | ~180-360 secondes |

WebCodecs = 10-20x plus rapide sur iPhone grâce au hardware encoder.

---

## UX pendant l'export

```typescript
// États à afficher
type ExportState =
  | 'idle'
  | 'preparing'      // "Préparation..."
  | 'exporting'      // "Export en cours... 45%"
  | 'uploading'      // "Sauvegarde dans le hub... "
  | 'done'           // "Vidéo prête!"
  | 'error'          // "Export échoué. Réessaie."

// Message contextuel selon le moteur utilisé
const exportMessage = useWebCodecs
  ? "Export rapide en cours..."
  : "Export en cours (peut prendre 1-2 minutes)..."
```

---

## Implémentation dans le projet

### Hook principal

```typescript
// hooks/useVideoExport.ts
export function useVideoExport() {
  const [state, setState] = useState<ExportState>('idle')
  const [progress, setProgress] = useState(0)

  const supportsWebCodecs = typeof VideoEncoder !== 'undefined'

  const exportVideo = async (options: ExportOptions) => {
    setState('preparing')

    try {
      let blob: Blob

      if (supportsWebCodecs) {
        blob = await exportWithWebCodecs(options, setProgress)
      } else {
        blob = await exportWithFFmpeg(options, setProgress)
      }

      setState('uploading')
      const { videoUrl, thumbnailUrl } = await uploadToFirebase(blob, options.itemId)

      await updateFirestore(options.itemId, {
        videoUrl,
        thumbnailUrl,
        workflowState: 'ready',
        exportedAt: serverTimestamp(),
      })

      setState('done')
    } catch (err) {
      setState('error')
      throw err
    }
  }

  return { exportVideo, state, progress, supportsWebCodecs }
}
```

---

## Résumé des dépendances

```bash
# WebCodecs pipeline
npm install mp4-muxer           # MP4 muxing in-browser

# FFmpeg fallback
npm install @ffmpeg/ffmpeg @ffmpeg/util  # FFmpeg.wasm

# Déjà dans le projet legacy — réutiliser directement
```

---

## Note sur les filtres à l'export

Les filtres CSS appliqués à la preview `<video>` sont visuels uniquement.
Pour les "brûler" dans la vidéo exportée :

- **WebCodecs** : dessiner sur un OffscreenCanvas avec les filtres CSS
  (`ctx.filter = 'brightness(1.2) contrast(1.1)'`) avant d'encoder
- **FFmpeg.wasm** : traduire les filtres CSS en filtres FFmpeg `eq=`
  (voir table CSS_TO_FFMPEG_FILTERS ci-dessus)
