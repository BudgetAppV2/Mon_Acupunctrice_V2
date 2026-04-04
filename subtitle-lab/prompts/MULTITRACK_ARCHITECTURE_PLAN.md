# Plan d'architecture — Editor V2 Multi-Track Video + Audio

## Contexte et problèmes actuels

### Bugs actifs (TRANSFER_SUMMARY.md)
1. **Vidéo figée après trim** — le RAF loop ne repositionne plus les clips trimmés
2. **Audio musique inaudible** quand vidéo joue — compétition pour le canal audio iOS
3. **Saccades Safari iOS** — chaque `vid.currentTime = X` pendant le play interrompt le décodage 300-400ms

### Cause racine
Le fix anti-saccades a supprimé TOUS les seeks pendant le play. Ça élimine les saccades mais casse le repositionnement des clips. Le video pool (Map&lt;clipId, HTMLVideoElement&gt;) crée un élément `<video>` par clip, avec seeks constants pour la synchronisation.

### Ce qui manque pour le vrai multi-track
- `addVideoClip()` est hardcodé sur `t.id === 'v1'` → tout va sur une seule track
- Pas de bouton/action store pour créer une 2e track vidéo
- Pas de volume par track vidéo (un seul `voiceVolume` global)
- Le `TracksPanel` itère déjà avec `getVideoTracks().map()` → l'UI est prête pour multi-track
- `findActiveClipsAllTracks()` existe → le playback est codé pour multi-track

---

## Objectif cible

Un éditeur vidéo mobile-first (Safari iOS) supportant :
- **2+ tracks vidéo** jouant simultanément (superposition, split-screen, PIP)
- **Volume indépendant par track** (voix track 1 à 30%, voix track 2 à 80%, musique à 50%)
- **Trim, split, réordonnement** par clip sur chaque track
- **Filtres WebGL** par clip
- **Playback fluide** sur Safari iOS (pas de saccades)

---

## Recherche Exa — Constats clés

### Safari iOS et multi-vidéo simultanée
- **iOS 14.0+** supporte plusieurs `<video>` jouant simultanément (source: ZegoCloud docs)
- **Workaround obligatoire** : démarrer TOUS les vidéos mutés → play → unmute après geste utilisateur
- **Séquence critique** : `vid.muted = true` → `vid.play()` → (user gesture) → `vid.muted = false`
- Chaque `vid.currentTime = X` pendant le play interrompt le décodage 300-400ms (confirmé par hls.js #7583)
- Le `seeked` event peut se déclencher AVANT que le seek soit fini (bug Safari connu, signalé par robwalch de hls.js)

### requestVideoFrameCallback (rVFC)
- Supporté Safari 15.4+ → compatible iOS cibles
- Signale quand une VRAIE nouvelle frame est décodée, pas quand le seek est "fini"
- Peut servir de "flag nouvelle frame dispo" sans piloter le rendering (conseil de l'issue hls.js #7583)
- Un RAF loop séparé pour les overlays 2D reste nécessaire à 60fps

### Web Audio API pour le mix multi-track
- `createMediaElementSource(vid)` → route l'audio du `<video>` dans l'AudioContext
- **IMPORTANT** : une fois connecté, `vid.volume` ne fonctionne plus — tout passe par les GainNodes
- Sur iOS Safari, un seul canal `<audio>`/`<video>` peut jouer à la fois → Web Audio API est la SEULE solution pour mixer
- Pattern validé : `source.connect(gainNode).connect(audioCtx.destination)` avec un GainNode par source
- L'AudioContext DOIT être créé/resumed dans un handler de geste utilisateur sur iOS
- Bug Safari connu : les premières samples jouent au volume `audio.volume` avant que le gainNode prenne effet → workaround : `await audioCtx.resume()` avant `audio.play()`

### Architecture des éditeurs web open-source
- **BBC VideoContext / html5-video-compositor** : multi-track via canvas compositing, un `<video>` par clip source, rendu sur un seul canvas
- **OpenVideo** : WebCodecs + PixiJS pour composition multi-layer (pas compatible Safari iOS)
- **Twick** : timeline model séparé du rendu, un LivePlayer pour la preview
- **Pattern dominant** : les éditeurs web utilisent des `<video>` cachés comme sources de décodage, et composent tout sur un canvas unique via `drawImage()` ou WebGL

---

## Architecture proposée

### Principe : Video Pool corrigé + Web Audio API

On GARDE le video pool (un `<video>` par clip actif) mais on corrige le pattern de seek et on migre tout l'audio vers Web Audio API.

```
┌─────────────────────────────────────────────────┐
│                  AudioContext                    │
│                                                  │
│  Track V1 ──► MediaElementSource ──► GainNode ─┐│
│  Track V2 ──► MediaElementSource ──► GainNode ─┤│
│  Music   ──► AudioBufferSource  ──► GainNode ─┤│
│                                       ▼        ││
│                                   Destination   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│               RAF Loop (60fps)                   │
│                                                  │
│  1. Lire timeRef (wall-clock advancement)        │
│  2. Pour chaque track vidéo :                    │
│     - findActiveClip(track, time)                │
│     - Si clip changé → swap source + seek        │
│     - Si clip identique → NE PAS SEEK            │
│  3. drawImage(vid) → WebGL canvas (avec filtres) │
│  4. renderOverlays() → 2D overlay canvas         │
└─────────────────────────────────────────────────┘
```

### Règle d'or du seek

**JAMAIS de `vid.currentTime = X` pendant le play sauf :**
1. **Entrée dans un nouveau clip** (clip switch)
2. **Scrub** (quand `isPlaying === false`)
3. **Premier play** (positionnement initial)

Pendant le play continu d'un même clip : le vidéo joue naturellement. La timeline lit `vid.currentTime` passivement pour calculer le temps global.

### Gestion du trim sans seek

Le trim est géré par la logique timeline :
- `clip.trimStart` / `clip.trimEnd` définissent les bornes dans le fichier source
- Au **play initial** d'un clip : `vid.currentTime = clip.trimStart / 1000`
- Pendant le play : le RAF loop surveille `vid.currentTime`. Quand `vid.currentTime >= clip.trimEnd / 1000` → passer au clip suivant (ou boucler)
- **Pas de seek correctif** pendant le play → pas de saccades Safari

### Compositing multi-track sur canvas

Pour 2 tracks vidéo simultanées, le WebGL existant (`renderVideoFrame()`) dessine déjà une texture vidéo en plein canvas. Pour multi-track, on fait N passes (une par track active), avec blend/alpha. Track 0 = fond plein écran, Track 1 = overlay (plein écran aussi pour l'instant, prêt pour PIP/split-screen futur via transform).

---

## Changements store requis

### Nouvelle action : `addVideoTrack()`
```ts
addVideoTrack: () => set((s) => {
  const idx = s.tracks.filter(t => t.type === 'video').length + 1;
  const newTrack: Track = {
    id: `v${idx}`, type: 'video',
    label: `Video ${idx}`, muted: false, clips: [],
  };
  const lastVideoIdx = s.tracks.reduce((acc, t, i) => t.type === 'video' ? i : acc, -1);
  const tracks = [...s.tracks];
  tracks.splice(lastVideoIdx + 1, 0, newTrack);
  return { tracks };
}),
```

### Modifier `addVideoClip(file, trackId?)`
```ts
// Accepter un trackId optionnel (défaut: première track vidéo)
addVideoClip: (file, trackId?) => {
  const targetId = trackId ?? getVideoTrack(get().tracks)?.id ?? 'v1';
  const blobUrl = URL.createObjectURL(file);
  const clip: VideoClip = { ... };
  set((s) => {
    const tracks = s.tracks.map(t =>
      t.id === targetId ? { ...t, clips: [...(t.clips ?? []), clip] } : t
    );
    return { tracks, videoFile: file, videoUrl: blobUrl };
  });
},
```

### Volume par track
Ajouter `volume: number` au type `Track` (default 1.0) et action `setTrackVolume(trackId, volume)` qui met à jour le GainNode correspondant.

---

## Changements SubtitleCanvas requis

### Supprimer
- Le video pool `useVideoPool()` tel quel (trop de seeks)
- Les effets `rVFC` complexes séparés du RAF principal
- L'audio via `HTMLAudioElement` natif

### Ajouter
- **useAudioEngine(tracks, isPlaying)** : AudioContext + MediaElementSources + GainNodes + AudioBufferSource pour musique
- **useVideoElements(tracks)** : Pool minimal — un `<video>` par track vidéo (pas par clip), swap source au changement de clip
- **RAF loop unifié** inspiré du Lab : un seul loop (wall-clock → clip-switch → WebGL render → 2D overlay)
- **Surveillance du trim** : quand `vid.currentTime >= trimEnd` → pause ce vid, activer le suivant

---

## Séquence d'implémentation (milestones)

### M1 — Fix playback actuel (résout les 3 bugs)
- Réécrire le RAF loop : seek uniquement au clip-switch, jamais pendant le play continu
- Surveillance du trim via comparaison `vid.currentTime` vs `trimEnd`
- Garder le video pool mais simplifier (un `<video>` par clip source unique)
- **Tests** : play un clip trimmé → pas figé. Play continu → pas de saccades.

### M2 — Web Audio API
- Créer `useAudioEngine` hook
- AudioContext créé au premier user gesture (bouton Play)
- `createMediaElementSource(vid)` pour chaque vidéo active
- `AudioBufferSource` pour la musique (fetch + decodeAudioData)
- GainNodes : un par source, contrôlés par les sliders
- Audio fade (fadeIn/fadeOut) sur le music GainNode
- **Tests** : vidéo + musique jouent ensemble. Sliders contrôlent volumes indépendamment.

### M3 — Store multi-track
- `addVideoTrack()` action
- `addVideoClip(file, trackId)` avec trackId
- `volume: number` sur Track
- `setTrackVolume(trackId, volume)` connecté au GainNode
- **Tests** : créer 2 tracks vidéo, ajouter un clip sur chaque.

### M4 — Playback multi-track simultané
- RAF loop : itérer `getVideoTracks()`, trouver le clip actif de chaque track
- WebGL : N passes de `renderVideoFrame()`, une par track (blend par-dessus)
- Clip-switch indépendant par track
- **Tests** : 2 clips sur 2 tracks jouent en même temps sur Safari iOS.

### M5 — UI multi-track
- Bouton "Nouvelle piste vidéo" dans TracksPanel
- Volume slider par track vidéo
- Bouton "Ajouter clip" contextuel par track
- Input file routé vers la bonne track

---

## Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| `createMediaElementSource` bug Safari (premières samples au mauvais volume) | Audio glitch au play | `await audioCtx.resume()` avant `vid.play()`, workaround confirmé |
| Safari iOS limite le nombre de `<video>` simultanés | Playback échoue avec 3+ tracks | Limiter à 2 tracks vidéo pour V1, tester sur devices réels |
| `createMediaElementSource` ne peut être appelé qu'UNE FOIS par élément | Re-création impossible | Garder le MediaElementSource en mémoire, le reconnecter au swap de clip |
| WebGL multi-pass performance sur mobile | FPS drop | Tester avec 2 vidéos 720p. Fallback: canvas 2D `drawImage` si WebGL multi-pass trop lent |
| AudioContext suspendu par iOS quand app en background | Pas d'audio au retour | Re-resume au `visibilitychange` event |

---

## Questions ouvertes pour Claude Code

1. Le WebGL `renderVideoFrame()` actuel dessine UNE texture en plein canvas. Comment gérer 2 textures (2 tracks) ? Multi-pass avec blend, ou un seul shader avec 2 samplers ?

2. Le `createMediaElementSource(vid)` capture le `<video>` — quand on swap la source du même `<video>` pour un autre clip, est-ce que le MediaElementSource suit automatiquement ? (Réponse probable : oui, car c'est lié à l'élément HTML, pas à la source.)

3. Faut-il un `<video>` par track (swap source au changement de clip) ou un `<video>` par clip (pool actuel) ? La recherche suggère un par track pour minimiser le nombre d'éléments.

4. Performance Safari iOS avec 2 `<video>` + 1 AudioContext + WebGL — est-ce viable sur iPhone 12+ ?
