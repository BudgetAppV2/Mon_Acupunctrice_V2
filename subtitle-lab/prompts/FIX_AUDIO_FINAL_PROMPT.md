# FIX — Audio Safari iOS : keeper blob URL + audioSession.type = "playback"

## Contexte
Les fix 5 à 8 n'ont pas résolu le problème. Résumé des tests :
- `createMediaElementSource(video)` + `muted=true` → pas d'audio dans le graph
- `createMediaElementSource(video)` + `muted=false` → audio natif monopolise le canal
- `AudioBufferSourceNode` via `decodeAudioData` → PAS de son au premier Play
- `AudioBufferSourceNode` + musique importée (blob URL via `createMediaElementSource`) → LES DEUX jouent
- Silent keeper data URI WAV → ne débloque PAS le pipeline
- Silent unlock buffer (`createBuffer(1,1,22050)`) → ne débloque PAS le pipeline

## Découverte clé (recherche Exa)
1. Safari iOS ne produit PAS de son via `AudioBufferSourceNode` tant qu'un vrai
   `HTMLMediaElement` n'est pas connecté et joue via `createMediaElementSource`.
   Un data URI ne compte pas. Un blob URL d'un vrai fichier audio OUI.

2. Depuis iOS 17 : `navigator.audioSession.type = "playback"` dit à Safari de traiter
   le Web Audio comme du contenu de lecture (pas un son d'interface).
   Sans ça, le Web Audio est muté quand le ringer switch est en silencieux.
   Source: WebKit bug #237322, MDN AudioSession docs, Stack Overflow answer Oct 2025.

3. Le pattern confirmé par Audjust.com (utilisateur de Tone.js) : créer un `<audio>`
   avec un vrai fichier audio (blob URL), `loop=true`, `play()` dans un geste user,
   connecté via `createMediaElementSource` avec gain à 0.

## Solution complète (3 changements)

### 1. `navigator.audioSession.type = "playback"` dans getOrCreateEngine
```ts
const getOrCreateEngine = useCallback((): AudioEngineState => {
  if (engineRef.current) return engineRef.current;
  const ctx = new AudioContext();
  // iOS 17+ : traiter l'audio comme du contenu de lecture
  if ('audioSession' in navigator) {
    (navigator as any).audioSession.type = 'playback';
    console.log('[AUDIO_ENGINE] Set audioSession.type = playback');
  }
  engineRef.current = { ctx, gains: new Map(), ... };
  return engineRef.current;
}, []);
```

### 2. Silent keeper via BLOB URL (pas data URI)
Remplacer le keeper data URI par un vrai WAV généré en mémoire et converti en blob URL :
```ts
function createSilentWavBlobUrl(): string {
  const sampleRate = 44100;
  const numSamples = sampleRate; // 1 seconde
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  // Les samples sont déjà à 0 (silence)
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
```

Utiliser ce blob URL comme source du keeper `<audio>` :
```ts
// Dans le play/pause effect, au moment du resume (remplace le keeper actuel) :
if (!keeperRef.current && engineRef.current) {
  const keeper = new Audio();
  keeper.src = createSilentWavBlobUrl();
  keeper.loop = true;
  const src = engineRef.current.ctx.createMediaElementSource(keeper);
  const gain = engineRef.current.ctx.createGain();
  gain.gain.value = 0; // complètement silencieux
  src.connect(gain).connect(engineRef.current.ctx.destination);
  keeper.play().catch(() => {});
  keeperRef.current = keeper;
  console.log('[AUDIO_ENGINE] Silent keeper (blob URL) started');
}
```

### 3. Garder le reste identique
- Les `AudioBufferSourceNode` pour l'audio des clips vidéo → inchangé
- Le `createMediaElementSource(audioElement)` pour la musique → inchangé
- Le gesture listener pour resume → inchangé
- Le `playClipAudio` uniquement depuis le tick → inchangé (fix6)

## Build marker
`[EDITOR_V2] M1-fix10 — blob URL keeper + audioSession playback`

## Tests de validation
- [ ] Ouvrir l'éditeur V2 sur iPhone Safari
- [ ] Vérifier logs : `Set audioSession.type = playback`
- [ ] Enregistrer un clip → Play → audio du clip est audible (SANS importer de musique)
- [ ] Ajouter musique → Play → les DEUX jouent ensemble
- [ ] Slider Voix → change le volume du clip
- [ ] Slider Musique → change le volume de la musique
- [ ] Pause → Play → l'audio reprend
