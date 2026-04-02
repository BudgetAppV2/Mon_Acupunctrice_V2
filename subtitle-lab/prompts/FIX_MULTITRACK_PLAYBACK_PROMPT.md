# INVESTIGATION — Playback multi-track cassé après fix saccades

## Contexte du fix saccades
On a corrigé les saccades sur Safari iOS en supprimant TOUS les
`vid.currentTime = expected` pendant le play. Sur Safari iOS, chaque
seek interrompt le pipeline de décodage vidéo pendant 300-400ms,
causant du judder visible. Le fix : ne jamais seek pendant que
`vid.play()` tourne → playback fluide.

MAIS ce fix a cassé d'autres choses.

## Symptômes actuels

### Symptôme 1 : Vidéo figée après trim
Quand on trim un bloc vidéo (change startMs/endMs via les trim
handles dans le TracksPanel), la vidéo devient une image fixe
pendant le playback — elle ne joue plus.

**Comportement attendu :** Après un trim, le playback doit jouer
la portion trimmée de la vidéo. Si le bloc vidéo commence à 3s
et finit à 8s, le playback doit montrer les frames de 3s à 8s.

### Symptôme 2 : Audio musique inaudible quand vidéo joue
Quand un bloc vidéo est actif au même moment qu'une track musique
(Jamendo/TemPolor), la musique est couverte par le son de la vidéo.
Quand on est dans une zone sans bloc vidéo (après le trim), la
musique est audible.

**Comportement attendu :** Les deux sons jouent ensemble. Le volume
de chacun est contrôlé par les sliders dans le panneau Audio :
- Slider "Voix" → contrôle `voiceVolume` → `vid.volume`
- Slider "Musique" → contrôle `audioVolume` → `audioRef.volume`
Les deux doivent être audibles simultanément selon leurs volumes.

### Symptôme 3 : Fade handles audio
Les fade-in/fade-out sur l'audio (via les triangles dans le waveform)
doivent s'appliquer pendant le playback. Le slider "Musique" contrôle
le volume de base, et les fades multiplient ce volume.

**Comportement attendu :** 
- Fade-in : volume monte de 0 au volume du slider pendant les X
  premières secondes de la timeline
- Fade-out : volume descend du volume slider à 0 pendant les X
  dernières secondes de la timeline

## Analyse du problème

### Le code actuel dans SubtitleCanvas.tsx
Le playback tick (RAF) gère :
1. Wall clock avance linéairement (timeRef.current)
2. Throttle les store updates à ~15fps
3. Audio fade calcul
4. Multi-track clip management

Le multi-track clip management fait :
```typescript
if (!playingClips.has(clip.id)) {
  // Premier play — seek au bon moment puis play
  vid.currentTime = localTimeMs / 1000;
  vid.play();
  playingClips.add(clip.id);
}
// AUCUN seek après — la vidéo avance naturellement
```

### Pourquoi la vidéo se fige après un trim
Quand on trim un bloc, le `localTimeMs` change au prochain tick.
Mais le clip est déjà dans `playingClips`, donc on ne re-seek PAS.
La vidéo continue de jouer à son ancienne position.

### Pourquoi l'audio est couvert
La vidéo a `vid.muted = voiceVolume === 0` — si voiceVolume est
0.3 (défaut), la vidéo n'est PAS mutée. Le son de la vidéo
(bruit ambiant de la caméra) couvre la musique.

## Solution attendue

### Pour les saccades + trim
Le problème fondamental : on ne peut PAS seek pendant le play sur
Safari iOS (cause 300-400ms de stutter), MAIS on DOIT seek quand
le clip actif change (nouveau clip, ou trim modifié).

La solution : ne seek que quand c'est NÉCESSAIRE :
- Un NOUVEAU clip devient actif → seek + play (OK, ça arrive 1 fois)
- Le même clip continue de jouer → NE PAS seek (sinon saccades)
- Le clip a été trimmé (startMs/endMs changé) → le playingClips
  set doit détecter que le clip a changé et re-seek

Pour détecter un trim : stocker le startMs/endMs du clip au moment
du premier play. Si au tick suivant le startMs/endMs a changé,
re-seek.

### Pour l'audio
Le volume de la vidéo doit être contrôlé par le slider "Voix"
(voiceVolume). La vidéo ne doit jamais être mutée automatiquement
— c'est l'utilisateur qui décide via le slider.

`vid.volume = voiceVolume` est suffisant. Pas besoin de toucher
`vid.muted` — laisser à `false` toujours, et le volume à 0 si
l'utilisateur veut muter.

MAIS attention : `vid.muted` est initialement `true` (dans
createVideoElement). Il faut le passer à `false` quand on fait
`vid.play()`.

### Résumé des fixes
1. Détecter quand un clip actif a changé ses timings → re-seek
2. Ne JAMAIS seek si le clip n'a pas changé (évite les saccades)
3. `vid.muted = false; vid.volume = voiceVolume;` au play
4. Ne PAS conditionner le mute sur la présence de musique
5. Les fades audio continuent de fonctionner via le calcul existant

## Fichier à modifier
- `components/features/editor-v2/SubtitleCanvas.tsx`

## Logs de debug
Ajouter des logs clairs pour vérifier :
- `[CLIP_PLAY]` quand un clip commence à jouer (avec clipId, localTimeMs)
- `[CLIP_RESEEK]` quand un clip est re-seeké (trim changed)
- `[AUDIO_MIX]` avec les volumes voix et musique au play

## Definition of Done
- [ ] Playback fluide (pas de saccades sur Safari iOS)
- [ ] Vidéo joue correctement après un trim
- [ ] Musique Jamendo/TemPolor audible avec une vidéo
- [ ] Slider "Voix" contrôle le volume de la vidéo
- [ ] Slider "Musique" contrôle le volume de la musique
- [ ] Fades audio s'appliquent pendant le play
- [ ] npm run build passe
