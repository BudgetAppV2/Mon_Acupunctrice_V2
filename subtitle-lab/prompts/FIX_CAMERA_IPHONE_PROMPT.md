# FIX — Caméra iPhone saccadée + cadre noir

## Problème 1: Image et son saccadés pendant l'enregistrement
Le MediaRecorder utilise `recorder.start(1000)` — timeslice de 1s.
Sur Safari iOS, ça cause des saccades.
### Fix: `recorder.start()` sans timeslice (enregistrement continu).

## Problème 2: Cadre noir pendant l'enregistrement
La contrainte caméra demande `width: { ideal: 1920 }, height: { ideal: 1080 }`
ce qui capture en 16:9 paysage. Le viewfinder est en 9:16 portrait.
### Fix: Demander une résolution portrait pour la caméra frontale:
```typescript
video: {
  facingMode: 'user',
  width: { ideal: 1080 },
  height: { ideal: 1920 },
}
```
Et aussi ajouter `aspectRatio: { ideal: 9/16 }` pour forcer le portrait.

## Problème 3: Vidéo s'étire au playback
La vidéo 16:9 est lue dans un container 9:16 avec object-cover →
elle s'étire et perd les proportions.
### Fix: Le SubtitleCanvas utilise déjà `object-cover` ce qui est
correct. Mais si la vidéo source est en 16:9, le coverCrop la recadre.
Avec le fix #2 (capture portrait), ce problème se résout aussi.

## Fichiers à modifier
- `lib/editor-v2/useMediaRecorder.ts` — contraintes caméra + start()

## Definition of Done
- [ ] Enregistrement fluide sur iPhone (pas de saccades)
- [ ] Pas de cadre noir pendant l'enregistrement
- [ ] La vidéo enregistrée garde les bonnes proportions au playback
- [ ] npm run build passe
