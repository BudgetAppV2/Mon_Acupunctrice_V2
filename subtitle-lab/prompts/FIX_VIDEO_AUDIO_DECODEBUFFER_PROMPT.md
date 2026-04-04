# FIX — Audio vidéo via decodeAudioData (pas createMediaElementSource)

## Problème confirmé par tests Safari iOS
- `createMediaElementSource(vid)` + `vid.muted = true` → PAS d'audio (Safari ne décode pas l'audio d'un video muted)
- `createMediaElementSource(vid)` + `vid.muted = false` → audio sort nativement, monopolise le canal, coupe la musique
- `createMediaElementSource(audioElement)` pour la musique → FONCTIONNE

**Conclusion** : `createMediaElementSource` ne fonctionne pas de manière fiable pour les `<video>` sur Safari iOS. Il faut une autre approche.

## Solution : séparer vidéo (image) et audio

Le `<video>` reste `muted = true` — il sert UNIQUEMENT pour l'image (WebGL canvas).
L'audio du clip vidéo est extrait et joué séparément via le Web Audio API.

### Architecture audio révisée
```
Clip vidéo fichier → decodeAudioData() → AudioBufferSourceNode → gainNode1 ─┐
Musique <audio>   → createMediaElementSource → gainNode2                    ─┤→ destination
                                                                              ┘
```

### Comment ça marche
1. Quand un clip vidéo est ajouté (via camera ou file input), on a déjà le `File` objet
2. On fait `file.arrayBuffer()` → `audioCtx.decodeAudioData(buffer)` → on obtient un `AudioBuffer`
3. Au moment du Play, on crée un `AudioBufferSourceNode`, on le connecte au GainNode de la track
4. On synchronise le start de l'AudioBufferSourceNode avec le `vid.currentTime`
5. Le `<video>` joue muted (pour l'image), l'AudioBufferSourceNode joue l'audio

### Gestion du trim
- `AudioBufferSourceNode.start(when, offset, duration)`
  - `offset` = `clip.trimStart / 1000` (position de départ dans le buffer)
  - `duration` = `(clip.trimEnd - clip.trimStart) / 1000`
- Au clip-switch : stop l'ancien BufferSourceNode, en créer un nouveau avec le bon offset

### Gestion du scrub
- Quand paused et scrub : pas d'audio (normal, on scrub l'image seulement)
- Quand play reprend : nouveau BufferSourceNode avec offset = position actuelle dans le clip

### Attention : AudioBufferSourceNode est à usage unique
Un `AudioBufferSourceNode` ne peut être joué qu'UNE FOIS. Après `stop()` ou quand il
finit, il faut en créer un nouveau. C'est par design dans la spec Web Audio.

Pattern :
```ts
let currentSource: AudioBufferSourceNode | null = null;

function playClipAudio(buffer: AudioBuffer, offsetSec: number, gainNode: GainNode) {
  // Stop previous
  if (currentSource) { try { currentSource.stop(); } catch {} }
  
  // Create new
  currentSource = audioCtx.createBufferSource();
  currentSource.buffer = buffer;
  currentSource.connect(gainNode);
  currentSource.start(0, offsetSec); // start immediately, from offset
}
```

## Changements dans SubtitleCanvas.tsx

### 1. Supprimer `createMediaElementSource(vid)` pour les tracks vidéo
- Garder `createMediaElementSource(audioElement)` pour la musique (ça marche)
- Les `<video>` restent `muted = true` toujours

### 2. Ajouter un cache d'AudioBuffers
```ts
// Dans useAudioEngine ou un nouveau hook
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map()); // clipId → AudioBuffer

async function decodeClipAudio(clipId: string, file: File) {
  if (audioBuffersRef.current.has(clipId)) return;
  const arrayBuf = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
  audioBuffersRef.current.set(clipId, audioBuffer);
  console.log('[AUDIO_ENGINE] Decoded audio for clip', clipId.slice(0, 8), 
    'duration:', audioBuffer.duration.toFixed(1) + 's');
}
```

### 3. Décoder l'audio au chargement du clip
Quand `addVideoClip(file)` est appelé ou quand le composant monte avec un clip existant,
appeler `decodeClipAudio(clip.id, clip.file)`. Le File objet est stocké dans `clip.file`.

**Attention** : `clip.file` est `null` après reload depuis Firestore (les fichiers ne sont
pas persistés). Dans ce cas, on n'a pas d'audio pour le clip — c'est OK car après reload
l'utilisateur doit ré-importer la vidéo. Le `clip.blobUrl` est aussi null après reload.

### 4. Au Play : créer un AudioBufferSourceNode synchronisé avec le vidéo
```ts
// Dans le play/pause effect, pour chaque track vidéo active :
const buffer = audioBuffersRef.current.get(clip.id);
if (buffer) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(gainNode); // gainNode de cette track
  const offsetSec = localTimeMs / 1000;
  source.start(0, offsetSec);
  // Stocker pour pouvoir stop() plus tard
  activeSourcesRef.current.set(track.id, source);
}
```

### 5. Au Pause : stop les AudioBufferSourceNodes
```ts
for (const [trackId, source] of activeSourcesRef.current) {
  try { source.stop(); } catch {}
}
activeSourcesRef.current.clear();
```

### 6. Au clip-switch pendant le play : stop ancien, start nouveau
```ts
// Dans le playback tick, quand isNewClip :
const oldSource = activeSourcesRef.current.get(track.id);
if (oldSource) { try { oldSource.stop(); } catch {} }
const buffer = audioBuffersRef.current.get(clip.id);
if (buffer) {
  const newSource = audioCtx.createBufferSource();
  newSource.buffer = buffer;
  newSource.connect(gainNode);
  newSource.start(0, localTimeMs / 1000);
  activeSourcesRef.current.set(track.id, newSource);
}
```

### 7. Volume control via GainNode
Le slider Voix contrôle le GainNode de chaque track vidéo.
`setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current)` — identique à maintenant.

### 8. La musique reste via createMediaElementSource
Pas de changement pour la musique — `createMediaElementSource(audioElement)` fonctionne.

## Résumé de l'architecture audio finale

| Source | Méthode | Pourquoi |
|--------|---------|----------|
| Video track 1 audio | `decodeAudioData` → `AudioBufferSourceNode` | `createMediaElementSource` ne marche pas avec `<video>` muted sur Safari iOS |
| Video track 2 audio | `decodeAudioData` → `AudioBufferSourceNode` | Idem |
| Musique Jamendo/TemPolor | `createMediaElementSource(audioElement)` | Fonctionne car c'est un `<audio>`, pas un `<video>` |

## Build marker
`[EDITOR_V2] M1-fix4 — decodeAudioData for video audio, createMediaElementSource for music only`

## Tests de validation
- [ ] Play un clip vidéo → audio ET vidéo jouent (vidéo muted, audio via Web Audio)
- [ ] Ajouter musique → vidéo audio + musique jouent ENSEMBLE (le mix fonctionne!)
- [ ] Slider Voix → change le volume de l'audio vidéo
- [ ] Slider Musique → change le volume de la musique
- [ ] Trim → l'audio suit le trim (commence au bon endroit)
- [ ] Pause → Play → l'audio reprend correctement
- [ ] Clip-switch (si multi-clip) → l'audio switch aussi
- [ ] Tester sur Safari iOS (iPhone)
