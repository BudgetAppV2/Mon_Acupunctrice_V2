# Bug : Audio AAC corrompu dans les exports WebCodecs

## Symptôme
Les vidéos exportées par `lib/utils/exportWebCodecs.ts` ont une piste audio AAC invalide.
ffprobe retourne : `Audio object type 0 is not implemented` et `0 channels`.
Instagram rejette la vidéo au processing (container créé OK, mais status_code = ERROR après ~25s).

## Fichier vidéo pour tester
`/tmp/test_video.mp4` — 24.9 MB, MP4 valide (header ftyp OK), video H.264 OK, audio corrompue.

## Fichiers à lire
- `lib/utils/exportWebCodecs.ts` — le code d'export complet
- `lib/hooks/useVideoExport.ts` — comment audioBlob est créé (FFmpeg ou Web Audio fallback)

## Ce qu'on sait
- L'audio est extraite soit via FFmpeg.wasm (`-vn -ar 48000 -ac 2 -b:a 128k audio.mp3`) puis décodée avec `AudioContext.decodeAudioData()`, soit via Web Audio API fallback (WAV).
- L'AudioEncoder WebCodecs encode ensuite en `mp4a.40.2` (AAC-LC) avec `sampleRate: sr, numberOfChannels: nCh`.
- Le problème : quand `nCh = 0` (ce qui arrive si `audioBuf.numberOfChannels` retourne 0 ou si l'audio n'a pas pu être décodée correctement), le muxer crée une piste audio avec 0 channels et un audio object type invalide.
- Le `mp4-muxer` package ne valide pas `numberOfChannels: 0` et produit un fichier corrompu silencieusement.

## Fix attendu
1. Valider que `nCh >= 1` avant de configurer la piste audio dans le muxer. Si `nCh === 0`, ne pas ajouter de piste audio.
2. Ajouter un guard dans l'AudioEncoder section aussi.
3. S'assurer que le fallback Web Audio (WAV) produit au moins 1 channel.
4. Vérifier que le build passe après le fix.

## Contraintes
- Ne pas changer la structure générale de l'export
- Le fix doit être minimal et défensif
- Tester que `npm run build` passe
