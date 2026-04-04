# FIX — Audio du clip vidéo joue 1 seconde puis disparaît

## Symptôme
Après enregistrement d'un clip, le playback vidéo est fluide (M1 OK ✅) mais l'audio
du clip joue environ 1 seconde puis disparaît. La musique Jamendo fonctionne.

## Cause racine identifiée

### Problème 1 : voiceVolume pas appliqué aux GainNodes
Dans le playback tick (ligne ~280), le code fait :
```ts
setGain(track.id, track.volume ?? 1);
```
Mais `track.volume` est toujours `1.0` (default du type Track). Le slider "Voix" contrôle
`voiceVolume` dans le store (default `0.3`), mais `voiceVolume` n'est JAMAIS appliqué
au GainNode des tracks vidéo.

**Fix** : multiplier `track.volume` par `voiceVolume` :
```ts
setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
```
Pareil dans le play/pause effect.

### Problème 2 : AudioContext possiblement créé trop tôt
`connectElement(firstTrack.id, vid)` est appelé dans le `useEffect` d'init du premier clip
(quand `videoUrl` change). Ça crée l'AudioContext et `createMediaElementSource(vid)` AVANT
tout geste utilisateur. Sur Safari iOS, l'AudioContext démarre en `suspended`.

Ensuite quand le user fait Play, `resumeAudio()` est appelé mais APRÈS `vid.play()`.
Pendant cette fenêtre, `createMediaElementSource` a déjà capturé l'audio du `<video>`,
donc `vid.volume` ne fonctionne plus, mais l'AudioContext est encore `suspended` → silence.

La "1 seconde de son" correspond au moment AVANT que `createMediaElementSource` prenne
complètement effet — il y a un délai entre la connexion et le moment où le rerouting
est actif sur Safari.

**Fix** : 
1. `await resumeAudio()` AVANT `vid.play()` dans le play/pause effect
2. L'AudioContext peut être créé tôt (c'est OK) mais doit être resumed dans un geste user

### Problème 3 : race condition play/pause effect
Le play/pause effect fait `resumeAudio()` sans `await`. C'est un appel async non attendu.
Sur Safari iOS, si `vid.play()` est appelé avant que `audioCtx.resume()` soit terminé,
l'audio est routé vers un AudioContext `suspended` → silence.

**Fix** : rendre le play/pause effect async ou chaîner les promises :
```ts
// AVANT (broken)
resumeAudio();
vid.play().catch(() => {});

// APRÈS (fix)
resumeAudio().then(() => {
  vid.play().catch(() => {});
});
```
Ou mieux : rendre tout le block async.

## Changements à faire

### 1. SubtitleCanvas.tsx — play/pause effect (~ligne 216)
```ts
if (isPlaying && !prevPlayingRef.current) {
  // Resume AudioContext FIRST (required by iOS on user gesture)
  resumeAudio().then(() => {
    const t = useEditorV2Store.getState().currentTime;
    const allTracks = tracksRef.current;
    const actives = findActiveClipsAllTracks(allTracks, t);
    for (const { clip, localTimeMs, trackIndex } of actives) {
      const track = getVideoTracks(allTracks)[trackIndex];
      if (!track || !clip.blobUrl) continue;
      const vid = getTrackVideo(track.id);
      if (activeClipRef.current.get(track.id) !== clip.id) {
        vid.src = clip.blobUrl;
        activeClipRef.current.set(track.id, clip.id);
      }
      vid.currentTime = localTimeMs / 1000;
      vid.play().catch(() => {});
      setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);  // ← FIX
    }
    if (musicElRef.current) {
      musicElRef.current.currentTime = t / 1000;
      musicElRef.current.play().catch(() => {});
      setGain('music', audioVolumeRef.current);  // ← use ref
    }
  });
}
```

### 2. SubtitleCanvas.tsx — playback tick (~ligne 280)
```ts
// Update voice volume gains — apply voiceVolume × track.volume
for (const track of videoTracks) {
  setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);  // ← FIX
}
```

### 3. SubtitleCanvas.tsx — playback tick clip-switch (~ligne 268)
```ts
vid.play().catch(() => {});
setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);  // ← FIX
```

## Tests de validation
- [ ] Enregistrer un clip → Play → l'audio du clip est audible
- [ ] Slider Voix → le volume du clip change en temps réel
- [ ] Ajouter musique → les deux jouent ensemble
- [ ] Slider Musique → le volume de la musique change
- [ ] Pause → Play → l'audio reprend (pas de silence)
- [ ] Tester sur Safari iOS (iPhone)
