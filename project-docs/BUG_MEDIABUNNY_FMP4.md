# Bug : Mediabunny crash sur MP4 fragmenté iPhone

## Erreur
"Tried reading [0, 9), but slice is [0, 4). This is likely an internal error, please report it alongside the file that caused it."

L'erreur survient quand Mediabunny tente de demuxer un MP4 enregistré sur iPhone (fragmented MP4).

## Fichier
Source vidéo: `/tmp/source_video.mp4` (87MB, iPhone 12, fragmented MP4)
- ffprobe confirme: H.264 640x480 47fps, AAC mono 48kHz
- Mediabunny en Node.js lit le fichier avec des warnings "Can't have two trun boxes" mais retourne quand même les metadata (duration, tracks)
- En production (Safari iOS), le BlobSource crash avec l'erreur ci-dessus

## Fichier à modifier
`lib/utils/exportWebCodecs.ts` sur la branche main

## Fix requis
Le demux audio avec Mediabunny doit être wrappé dans un try-catch.
Si Mediabunny ne peut pas lire le MP4 source (fMP4 iPhone), il faut un fallback :

### Option A — Fallback Web Audio API (simple)
Si Mediabunny crash au demux, fallback vers AudioContext.decodeAudioData + AudioEncoder WebCodecs.
C'est l'ancien chemin qui marchait sur desktop mais avait des problèmes de 0 channels sur iOS.
Avec le guard nCh >= 1, au pire on aura une vidéo sans audio (mieux qu'un crash).

### Option B — Fallback Web Audio API amélioré
Même chose mais en utilisant Mediabunny Output (au lieu de mp4-muxer) pour le muxing.
L'AudioEncoder WebCodecs encode en AAC, et on pipe les chunks dans un EncodedAudioPacketSource.

### Recommandation : Option B
1. Try: Mediabunny Input demux → transmux audio packets
2. Catch: Web Audio API decode → AudioEncoder AAC → EncodedAudioPacketSource
3. Catch catch: export sans audio (guard existant)

Le muxer reste Mediabunny dans tous les cas (pas de retour à mp4-muxer).

## Contraintes
- npm run build doit passer
- Ne pas toucher au pipeline vidéo (VideoEncoder + canvas seek loop)
- Garder Mediabunny Output comme muxer dans tous les cas
