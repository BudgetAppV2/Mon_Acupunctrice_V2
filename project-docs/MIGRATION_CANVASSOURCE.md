# Migration encodage vidéo vers Mediabunny CanvasSource

## Contexte
Le pipeline vidéo dans exportWebCodecs.ts utilise un VideoEncoder WebCodecs manuel
avec une gestion custom des timestamps, keyframes, metadata, et EncodedVideoPacketSource.
C'est fragile et source de bugs (ex: metadata "must be provided").

Mediabunny a un `CanvasSource` qui fait tout ça automatiquement — il suffit de dessiner
sur le canvas et appeler `canvasSource.add(timestamp, duration)`.

## Objectif
Remplacer le VideoEncoder + EncodedVideoPacketSource par un CanvasSource de Mediabunny.
L'audio reste sur AudioBufferSource (déjà Mediabunny).

## Fichier à modifier
`lib/utils/exportWebCodecs.ts` sur la branche main

## Architecture actuelle (à remplacer)
```typescript
// 1. Créer EncodedVideoPacketSource manuellement
const videoSource = new EncodedVideoPacketSource('avc');
output.addVideoTrack(videoSource);

// 2. Créer VideoEncoder WebCodecs manuellement
const vEnc = new VideoEncoder({
  output: async (chunk, meta) => {
    // Conversion manuelle chunk → EncodedPacket
    const pkt = new EncodedPacket(data, type, ts, dur);
    await videoSource.add(pkt, meta || undefined);  // ← bug metadata ici
  },
  error: (e) => { throw e; },
});
vEnc.configure({ codec: 'avc1.640028', width: W, height: H, ... });

// 3. Boucle seek-based avec VideoFrame
for (frame...) {
  ctx.drawImage(video, ...);
  const frame = new VideoFrame(canvas, { timestamp: ts });
  vEnc.encode(frame, { keyFrame: i % 30 === 0 });
  frame.close();
}
await vEnc.flush(); vEnc.close();
```

## Nouvelle architecture avec CanvasSource
```typescript
import { CanvasSource, QUALITY_HIGH } from 'mediabunny';

// 1. Créer CanvasSource — Mediabunny gère VideoEncoder en interne
const canvasSource = new CanvasSource(canvas, {
  codec: 'avc',
  bitrate: 12_000_000,  // 12 Mbps
  bitrateMode: 'variable',
  hardwareAcceleration: 'prefer-hardware',
  latencyMode: 'quality',
});
output.addVideoTrack(canvasSource);

// 2. Boucle seek-based — plus simple, plus de VideoFrame/VideoEncoder
for (let i = 0; i < totalFrames; i++) {
  const t = trimStart + i / FPS;
  video.currentTime = t;
  await new Promise(r => { video.onseeked = () => r(); });
  
  // Dessiner sur le canvas (filtres, overlays, subtitles)
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
  drawTextOverlays(ctx, overlays, t, W, H);
  drawSubtitles(ctx, subtitles, subtitleStyle, t, W, H);
  
  // Ajouter la frame — Mediabunny s'occupe de tout
  await canvasSource.add((t - trimStart), 1 / FPS);
  onProgress(Math.round(i / totalFrames * 90));
}
canvasSource.close();  // Signaler qu'on a fini
```

## Ce qui change
1. Supprimer : VideoEncoder, VideoFrame, EncodedVideoPacketSource, EncodedPacket (pour vidéo)
2. Ajouter : CanvasSource
3. La boucle seek-based reste identique (canvas drawImage + overlays + subtitles)
4. Plus de gestion manuelle des timestamps microseconds, keyframes, metadata
5. L'audio ne change pas (AudioBufferSource reste tel quel)

## Ce qui ne change PAS
- La logique de seek-based canvas rendering (drawImage, drawOverlays, drawSubtitles)
- Le fallback audio (AudioBufferSource + @mediabunny/aac-encoder)
- La détection iOS pour choisir transmux vs fallback
- Le test de packet audio pour les fMP4
- Les calculs de résolution adaptative (computeExportSize)
- L'import de drawOverlays, drawSubtitles, filters

## Imports simplifiés
Avant :
```typescript
import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, EncodedVideoPacketSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS, AudioBufferSource,
} from 'mediabunny';
```

Après :
```typescript
import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, CanvasSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS, AudioBufferSource,
} from 'mediabunny';
```
(EncodedVideoPacketSource remplacé par CanvasSource)

## Contraintes
- npm run build doit passer
- L'export doit fonctionner sur Safari iOS ET Chrome desktop
- La résolution adaptative doit toujours fonctionner
- Les filtres CSS, overlays et subtitles doivent être appliqués
- Instagram doit accepter la vidéo
- Le canvas `display-p3` colorSpace doit être préservé

## Documentation Mediabunny
- CanvasSource : https://mediabunny.dev/guide/media-sources#canvassource
- `canvasSource.add(timestamp, duration)` — timestamp et duration en secondes
- Le CanvasSource lit le contenu du canvas au moment de l'appel à add()
- Il gère automatiquement l'encodage, les keyframes, le backpressure
- Il supporte OffscreenCanvas aussi
