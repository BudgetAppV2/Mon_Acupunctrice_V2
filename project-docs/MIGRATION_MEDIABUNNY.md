# Migration audio : mp4-muxer → Mediabunny

## Contexte
L'export vidéo WebCodecs dans Mon Acupunctrice Hub V2 utilise `mp4-muxer` (v5.2.2) pour muxer la vidéo H.264 + audio AAC.
Le problème : sur Safari iOS, FFmpeg.wasm ne charge pas (blob: module error), et le fallback Web Audio API
(`AudioContext.decodeAudioData`) est fragile sur les gros fichiers (87MB+), produisant parfois des AudioBuffers
avec 0 channels → audio corrompue → Instagram rejette la vidéo.

## Solution : Mediabunny
`mediabunny` est le successeur officiel de `mp4-muxer`, créé par le même développeur (Vanilagy).
Il peut **demuxer** un MP4 source pour extraire la piste audio, puis la **remuxer** dans l'export — 
sans FFmpeg.wasm ni `AudioContext.decodeAudioData`.

Key features :
- Zero-dependency, pure TypeScript, tree-shakable (~5 kB min)
- Safari 16.4+ supporté avec WebCodecs
- Streaming I/O : gère des fichiers de toute taille en mémoire constante O(1)
- Peut demuxer MP4 → extraire audio encoded packets → remuxer dans l'output
- API `Conversion` pour transmuxer/transcoder automatiquement

## Fichiers à modifier

### 1. package.json
- `npm install mediabunny`
- Garder `mp4-muxer` pour l'instant (on migrera le muxer vidéo après si tout fonctionne)

### 2. lib/utils/exportWebCodecs.ts — FICHIER PRINCIPAL
Remplacer le pipeline audio actuel. Actuellement :
```
audioBlob (MP3 via FFmpeg ou WAV via Web Audio) → AudioContext.decodeAudioData → AudioEncoder → mp4-muxer
```
Nouveau pipeline avec Mediabunny :
```
File source (MP4) → Mediabunny Input (BlobSource, demux) → audio encoded packets → Mediabunny Output (remux direct)
```

**Approche recommandée — Conversion API :**
Mediabunny peut faire TOUTE l'opération : lire le MP4 source, decoder/encoder la vidéo via canvas (avec nos overlays/subtitles), 
et copier/transcoder la piste audio automatiquement. C'est la solution la plus propre.

Cependant, notre export a une logique custom (seek-based frame loop, canvas drawing avec filters/overlays/subtitles),
donc l'approche la plus réaliste est :

**Approche hybride :**
1. Utiliser `Mediabunny Input` pour demuxer le MP4 source et extraire les audio encoded packets
2. Garder notre boucle vidéo seek-based avec `VideoEncoder` WebCodecs (inchangée)
3. Utiliser `Mediabunny Output` (au lieu de mp4-muxer) pour muxer :
   - La vidéo encodée par notre VideoEncoder → via `EncodedVideoPacketSource`
   - L'audio extraite du source → via `EncodedAudioPacketSource` (transmux, pas de re-encode)
4. Appliquer le trim sur l'audio en filtrant les packets par timestamp

Exemple d'extraction audio avec Mediabunny :
```typescript
import { Input, MP4, BlobSource, EncodedPacketSink } from 'mediabunny';

const input = new Input({
  source: new BlobSource(file),
  formats: [MP4],
});

const audioTrack = await input.getPrimaryAudioTrack();
if (audioTrack) {
  const sink = new EncodedPacketSink(audioTrack);
  // Itérer les packets audio encodés (AAC) sans les décoder
  for await (const packet of sink.packets()) {
    // packet.timestamp, packet.data, packet.type
    // → remuxer directement dans l'output
  }
}
```

Exemple d'output avec Mediabunny :
```typescript
import { Output, Mp4OutputFormat, BufferTarget, EncodedVideoPacketSource, EncodedAudioPacketSource } from 'mediabunny';

const output = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(),
});

// Vidéo : nos chunks encodés par VideoEncoder
const videoSource = new EncodedVideoPacketSource();
output.addVideoTrack(videoSource);

// Audio : packets du source (transmux direct, pas de re-encode)
const audioSource = new EncodedAudioPacketSource();
output.addAudioTrack(audioSource);

await output.start();

// ... ajouter les video chunks et audio packets ...

await output.finalize();
const blob = new Blob([output.target.buffer], { type: 'video/mp4' });
```

### 3. lib/hooks/useVideoExport.ts — SIMPLIFIER
L'extraction audio séparée (FFmpeg / Web Audio fallback) n'est plus nécessaire.
Le nouveau `exportWebCodecs.ts` reçoit directement le `File` source et s'occupe de tout.
- Supprimer toute la logique `audioBlob`, `extractViaWebAudio`, `loadFFmpeg` pour l'audio
- Supprimer la détection `isIOS` pour le seuil de taille
- L'appel à `exportWithWebCodecs` ne prend plus `audioBlob` en paramètre
- FFmpeg reste nécessaire UNIQUEMENT pour le pipeline complet (gros fichiers desktop avec audio custom)

### 4. Fichiers à NE PAS modifier
- `lib/utils/drawOverlays.ts` — inchangé
- `lib/utils/drawSubtitles.ts` — inchangé
- `lib/utils/filters.ts` — inchangé
- `components/features/editor/` — inchangé
- `app/api/publish-instagram/route.ts` — inchangé

## Contraintes
- Le build (`npm run build`) doit passer sans erreur
- L'export doit fonctionner sur Safari iOS 16.4+ (iPhone 12 de Judith)
- L'export doit fonctionner sur Chrome desktop
- La vidéo exportée doit avoir une piste audio valide (pas 0 channels, pas d'audio object type 0)
- Le trim (trimStart, trimEnd) doit s'appliquer à la vidéo ET à l'audio
- Les overlays et subtitles doivent fonctionner comme avant
- La vidéo doit être acceptée par Instagram (H.264 + AAC, 9:16, < 90s)

## Tests de validation
1. `npm run build` passe
2. La vidéo source `/tmp/source_video.mp4` (87MB, H.264 640x480, AAC mono 48kHz) 
   peut être lue par Mediabunny (test avec un script Node.js)
3. L'export produit un MP4 avec ffprobe montrant :
   - Video: h264, 1080x1920
   - Audio: aac, 48000Hz, >= 1 channel
4. Le fichier exporté est jouable dans QuickTime et accepté par Instagram

## Docs de référence
- https://mediabunny.dev/guide/introduction
- https://mediabunny.dev/guide/reading-files (Input, BlobSource, EncodedPacketSink)
- https://mediabunny.dev/guide/writing-files (Output, BufferTarget, EncodedVideoPacketSource)
- https://mediabunny.dev/guide/media-sources (AudioBufferSource, EncodedAudioPacketSource)
- https://mediabunny.dev/guide/converting-media-files (Conversion API — alternative plus simple)
- Migration depuis mp4-muxer : https://mediabunny.dev (voir migration guide dans l'intro)

## Note importante sur la Conversion API
Si l'approche hybride est trop complexe, Claude Code peut envisager d'utiliser la Conversion API 
de Mediabunny directement. L'API Conversion peut :
- Lire le source MP4
- Appliquer un trim (start/end en secondes)
- Transcoder la vidéo via un `process` callback qui reçoit des VideoSamples → on peut dessiner nos overlays
- Transmuxer l'audio directement (pas de re-encode si le codec est compatible)

Cela simplifierait considérablement le code, mais il faut vérifier que le `process` callback
de la Conversion API permet d'appliquer nos filtres CSS, overlays et subtitles sur chaque frame.
