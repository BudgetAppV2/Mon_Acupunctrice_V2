# Bug : Safari iOS AudioEncoder AAC produit "audio object type 0"

## Contexte
L'AudioEncoder WebCodecs de Safari iOS encode le AAC avec des metadata corrompues :
- "audio object type 0" (invalide)
- 22050 Hz au lieu de 48000 Hz demandé
- 0 channels
Instagram rejette la vidéo.

## Solution
Mediabunny a `AudioBufferSource` qui accepte directement des AudioBuffer
et gère l'encodage AAC en interne (avec polyfill WASM `@mediabunny/aac-encoder` si le navigateur n'encode pas bien).

## Fix dans `lib/utils/exportWebCodecs.ts`

Remplacer le fallback Web Audio qui utilise notre propre `AudioEncoder` par le `AudioBufferSource` de Mediabunny.

### Ancien code (cassé sur Safari iOS) :
```
AudioContext.decodeAudioData → AudioEncoder({ codec: 'mp4a.40.2' }) → EncodedAudioPacketSource
```

### Nouveau code :
```
AudioContext.decodeAudioData → AudioBufferSource({ codec: 'aac', bitrate: 128000 }) → output.addAudioTrack()
```

1. `npm install @mediabunny/aac-encoder`
2. Dans exportWebCodecs.ts, au début du fichier, importer et enregistrer le polyfill :
```typescript
import { AudioBufferSource, QUALITY_MEDIUM } from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';
registerAacEncoder(); // Polyfill AAC pour Safari iOS
```
3. Remplacer les DEUX blocs de fallback Web Audio (dans le catch du transmux ET dans le else if !audioTrack) par :
```typescript
const ac = new AudioContext({ sampleRate: 48000 });
const arrayBuf = await file.arrayBuffer();
const decoded = await ac.decodeAudioData(arrayBuf);
await ac.close();
if (decoded.numberOfChannels >= 1) {
  const bufferSource = new AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
  output.addAudioTrack(bufferSource);
  // Trim : extraire seulement la partie nécessaire
  const sr = decoded.sampleRate;
  const startSmp = Math.floor(trimStart * sr);
  const endSmp = Math.min(Math.floor(trimEnd * sr), decoded.length);
  const nCh = Math.min(decoded.numberOfChannels, 2);
  const trimmedLength = endSmp - startSmp;
  const trimmedBuf = new AudioBuffer({ length: trimmedLength, sampleRate: sr, numberOfChannels: nCh });
  for (let ch = 0; ch < nCh; ch++) {
    trimmedBuf.copyToChannel(decoded.getChannelData(ch).subarray(startSmp, endSmp), ch);
  }
  await bufferSource.add(trimmedBuf);
  bufferSource.close();
}
```
4. Supprimer tout le code AudioEncoder/AudioData/EncodedAudioPacketSource du fallback
5. Garder le try-catch autour du tout

## Important
- `registerAacEncoder()` doit être appelé UNE SEULE FOIS, idéalement au top-level du module
- Le AudioBufferSource gère le trim via le AudioBuffer qu'on lui passe
- Si audioSource a déjà été ajouté via EncodedAudioPacketSource (demux path), ne pas re-ajouter un track

## Contraintes
- npm run build doit passer
- La vidéo doit avoir de l'audio valide sur Safari iOS ET Chrome desktop
- Instagram doit accepter la vidéo
