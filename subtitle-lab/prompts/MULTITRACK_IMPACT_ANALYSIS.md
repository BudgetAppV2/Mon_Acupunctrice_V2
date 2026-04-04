# Analyse d'impact — Migration Multi-Track Video + Web Audio API

## Contexte
Ce document liste les impacts potentiels du changement d'architecture décrit dans
`MULTITRACK_ARCHITECTURE_PLAN.md` sur chaque aspect de l'éditeur V2.
**OBJECTIF** : Claude Code doit vérifier chaque point ci-dessous, confirmer ou infirmer
le risque, et proposer un plan de mitigation AVANT d'écrire du code.

---

## 1. Drag des sous-titres et text overlays

### Fichier : `lib/editor-v2/useSubtitleDrag.ts`
### Mécanisme actuel
- Le drag utilise l'overlay canvas (2D, transparent par-dessus le WebGL canvas)
- `hitTest()` compare la position du touch/click aux positions des overlays et sous-titres
- `getRelPos()` calcule la position relative via `canvas.getBoundingClientRect()`
- La position est stockée dans le store (`globalPreset.position`, `textOverlay.style.position`)

### Risque potentiel
- Le drag est découplé du playback vidéo — il opère sur le canvas overlay, pas le canvas WebGL
- **MAIS** : si on change la structure JSX du `SubtitleCanvas` (l'ordre ou la taille des canvas),
  le `getBoundingClientRect()` pourrait retourner des valeurs différentes
- Le `touchAction: 'none'` est sur le canvas overlay — ça doit rester

### Question pour Claude Code
- Est-ce que la refactorisation du RAF loop ou du video pool touche au JSX du canvas overlay ?
- Si oui, vérifier que les deux canvas restent exactement superposés (même `className`, même `style`)
- Le drag ne devrait PAS être impacté si on ne touche pas au JSX return du composant

---

## 2. Filtres WebGL

### Fichier : `lib/editor-v2/webglRenderer.ts`
### Mécanisme actuel
- `renderVideoFrame(video, canvasW, canvasH, uniforms)` dessine UNE texture vidéo avec des filtres GLSL
- CoverCrop calculé via UV coords (ratio d'aspect vidéo vs canvas 9:16)
- Uniforms calculés par `cssFilterToUniforms(css, intensity)`
- Chaque clip peut avoir son propre `clip.filterId`
- Le state WebGL est un singleton global (`let state: GLState | null = null`)

### Risque potentiel — ÉLEVÉ
- **Multi-track** : actuellement on appelle `renderVideoFrame()` pour UN seul vidéo.
  Pour 2 tracks simultanées, il faut l'appeler 2 fois (multi-pass).
- Problème : le 2e appel ÉCRASE le 1er (gl.clear + nouveau drawArrays)
- Il faut soit activer le blending WebGL (`gl.enable(gl.BLEND)`), soit composer en 2D
- Le CoverCrop sera différent pour chaque vidéo (résolutions différentes possibles)
- Le singleton `state` avec un seul `texture` — il faudra peut-être 2 textures

### Question pour Claude Code
- Option A : Activer `gl.enable(gl.BLEND)` + `gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)`,
  dessiner track 0 d'abord puis track 1 par-dessus. Simple mais track 1 cache track 0
  sauf si on ajoute un alpha uniform.
- Option B : Utiliser 2 textures et un shader multi-sampler qui compose les 2 inputs.
  Plus flexible mais plus complexe.
- Option C : Dessiner track 0 en WebGL, lire les pixels (`readPixels` ou `toDataURL`),
  dessiner track 1 en WebGL, puis composer les deux sur le canvas 2D overlay.
  Lent sur mobile.
- **Recommandation** : Option A pour le MVP. Track 0 = plein écran. Track 1 = plein écran
  par-dessus (l'utilisateur contrôle quel track est au-dessus dans l'UI). Pas de blend
  pour le MVP, juste dernier-dessine-gagne. Le PIP/split-screen vient plus tard.

---

## 3. Persistence Firestore

### Fichier : `lib/store/useEditorV2Store.ts` → `loadFromFirestore()`
### Mécanisme actuel
- `loadFromFirestore(data)` restore : globalPreset, blocks, textOverlays, filterId,
  filterIntensity, voiceVolume, audioVolume, audioDucking, coverFrameMs, coverDataUrl, tracks
- Les tracks sont restaurées SANS `file` ni `blobUrl` (set à null)
- La durée est recalculée à partir des clips
- Les blocks du subtitle track sont synchronisés avec le flat `blocks` field

### Risque potentiel — MOYEN
- **Nouveau champ `volume` sur Track** : si on ajoute `volume: number` au type Track,
  les documents Firestore existants n'auront pas ce champ. `loadFromFirestore` doit
  mettre un default (1.0) quand le champ est absent.
- **Nouveau type de track vidéo** (`v2`, `v3`...) : les documents existants n'ont que `v1`.
  Pas de problème tant que `loadFromFirestore` accepte un tableau `tracks` de taille variable.
- **L'action `addVideoTrack()`** génère des IDs comme `v2`, `v3` — ces IDs doivent être
  stables entre les sessions (enregistrés dans Firestore, pas régénérés).

### Question pour Claude Code
- Vérifier que `loadFromFirestore` gère gracieusement des tracks sans `volume`
  (default à 1.0)
- Vérifier que la sérialisation des tracks inclut bien le `volume` dans Firestore
- Le `syncFlatFromTracks()` ne sync que le PREMIER clip de la PREMIÈRE track vidéo
  (`videoFile`, `videoUrl`, `thumbnailUrl`) — est-ce que ça pose problème avec multi-track ?

---

## 4. Fluidité de la lecture (playback)

### Mécanisme actuel (cassé)
- RAF loop avec wall-clock advancement + `vid.currentTime = expected` forcé → saccades Safari
- rVFC séparé pour WebGL redraw → complexité inutile

### Ce que le plan propose
- RAF loop unifié (un seul, comme le Lab)
- Seek uniquement au clip-switch, scrub, et premier play
- Le trim est surveillé par comparaison passive de `vid.currentTime` vs `trimEnd`

### Risque potentiel — FAIBLE (c'est le but du fix)
- Le wall-clock advancement (timeRef += wallMs - prevWall) peut dériver par rapport au
  vrai currentTime du vidéo. Le Lab compense ça en LISANT `vid.currentTime` passivement
  et en recalculant le globalTime à partir de la position réelle du vidéo.
- **Attention** : avec 2 tracks, quelle track est la "source de vérité" pour le temps ?
  → Le wall-clock devrait rester la source principale, chaque vidéo joue indépendamment.

### Question pour Claude Code
- Est-ce qu'on garde le throttle store updates à ~15fps (66ms) du code actuel ?
  → Oui, c'est une bonne optimisation mobile.
- Le Lab utilise `vid.currentTime` comme source de vérité quand le vidéo joue et
  wall-clock comme fallback quand pas de vidéo. Comment adapter pour multi-track ?

---

## 5. Ratio d'image (aspect ratio)

### Mécanisme actuel
- Canvas fixe : `CANVAS_W = 540`, `CANVAS_H = 960` (9:16)
- Container div : `aspectRatio: '9/16'`, `maxHeight: '100%'`
- WebGL CoverCrop : calculé dans les UV coords pour chaque vidéo source
- Export : `computeExportSize()` force aussi un ratio 9:16

### Risque potentiel — FAIBLE
- Le ratio 9:16 est fixe et indépendant du nombre de tracks
- Chaque vidéo source peut avoir un ratio différent — le CoverCrop s'en occupe déjà
- **MAIS** : avec 2 vidéos sources de ratios différents, le multi-pass WebGL doit
  recalculer les UV coords indépendamment pour chaque `renderVideoFrame()` call.
  C'est déjà le cas puisque les UV sont calculés à partir de `video.videoWidth/videoHeight`.

### Question pour Claude Code
- Pas de risque identifié, mais vérifier que le CoverCrop est bien recalculé
  pour CHAQUE appel à `renderVideoFrame()` (pas caché dans un ref stale)

---

## 6. Qualité de l'export

### Fichier : `lib/hooks/useVideoExportV2.ts`
### Mécanisme actuel
- Export frame-by-frame : seek chaque frame → `drawImage` → `canvasSource.add()`
- Audio : transmux via Mediabunny (ou AAC fallback via AudioBufferSource)
- Rendu des sous-titres via `renderFrame()` sur le même canvas
- **LIMITÉ à 1 clip** : `if (clips.length > 1) { error }`

### Risque potentiel — ÉLEVÉ
- L'export actuel ne supporte qu'UN SEUL clip. Avec multi-track, il faut :
  1. Pour chaque frame, seek CHAQUE vidéo de CHAQUE track active à ce timestamp
  2. Composer les frames (drawImage track 0, puis drawImage track 1 par-dessus)
  3. Appliquer les filtres WebGL par track
  4. Mixer l'audio de toutes les tracks (voix track 1 + voix track 2 + musique)
- L'export utilise `ctx.filter = filterCss` (CSS filter) pas le WebGL renderer.
  C'est un problème : sur Safari iOS, `ctx.filter` n'est PAS supporté.
  L'export Desktop utilise probablement Chrome où ça marche.
- Le mix audio est aussi mono-clip : il extrait l'audio du seul fichier source.

### Question pour Claude Code
- L'export multi-track est un chantier séparé (M6 dans la roadmap).
  Pour le MVP, est-ce qu'on peut garder l'export limité à 1 clip ?
- Si oui, quelle erreur afficher quand l'utilisateur a 2 tracks ?
- Le CSS filter dans l'export devrait-il être remplacé par le WebGL renderer ?
  (Ça résoudrait le bug Safari iOS dans l'export aussi)

---

## 7. Comportement des clips vidéo empilés (stacking)

### Mécanisme actuel
- `findActiveClipsAllTracks()` retourne un clip par track vidéo active à un temps donné
- Le `drawVideo()` itère `activeClips` en ordre inverse (track 0 en dernier = au-dessus)
- Chaque clip a son propre `<video>` dans le pool

### Risque potentiel — MOYEN
- L'ordre de rendu (quelle track au-dessus de quelle autre) dépend de l'index de la track
  dans le tableau `tracks`. Track 0 (v1) est dessinée en premier (fond), Track 1 (v2) par-dessus.
- **Actuellement** le code itère en ordre INVERSE (`for (let i = activeClips.length - 1; i >= 0; i--)`),
  ce qui met la track d'index 0 AU-DESSUS. C'est contre-intuitif (dans un NLE, les tracks
  du haut sont visuellement au-dessus). Il faut décider de l'ordre.
- Avec le plan "un `<video>` par track" (pas par clip), le swap de source au changement
  de clip peut causer un flash noir momentané. Le Lab gère ça mais avec un seul vidéo.
  Avec 2, il faut tester que le flash n'est pas pire.

### Question pour Claude Code
- Quel ordre de rendu adopter ? Convention NLE : track d'index plus élevé = dessus ?
  Ou l'inverse (track v1 = fond, v2 = dessus) ?
- Comment gérer le flash au swap de source ? Double-buffer (2 `<video>` par track,
  un qui preload pendant que l'autre joue) ?

---

## 8. Gain individuel par track et audio Jamendo/TemPolor

### Mécanisme actuel
- `voiceVolume` (slider) → `vid.volume` pour TOUS les vidéos du pool
- `audioVolume` (slider) → `audioRef.current.volume` pour le `<audio>` musique
- La musique est chargée via `getFirstAudioUrl(tracks)` → `new Audio()` → simple `<audio>` HTML
- Le fade (fadeIn/fadeOut) est géré dans le RAF loop en modifiant `audioRef.current.volume`
- **BUG ACTIF** : sur iOS Safari, `<audio>` et `<video>` se disputent le canal audio

### Risque potentiel — ÉLEVÉ (c'est le cœur du M2)
- La migration vers Web Audio API change TOUT le pipeline audio :
  - `vid.volume` ne fonctionne plus après `createMediaElementSource(vid)`
  - Chaque track vidéo a son propre GainNode
  - La musique passe par `fetch()` → `decodeAudioData()` → `AudioBufferSourceNode` → GainNode
  - Le fade doit être recalculé via `gainNode.gain.linearRampToValueAtTime()` (plus précis)
    ou via le RAF loop qui modifie `gainNode.gain.value` (plus simple, comme actuellement)
- La musique Jamendo/TemPolor est chargée via blobUrl (fichier uploadé). Le `fetch(blobUrl)`
  pour `decodeAudioData()` devrait marcher mais il faut le tester.
- L'AudioContext doit être `resume()` dans un geste utilisateur. Le bouton Play est un geste
  utilisateur, donc ça devrait aller. Mais si l'utilisateur fait play → pause → play,
  il faut vérifier que l'AudioContext n'est pas suspendu entre-temps.

### Questions pour Claude Code
- `createMediaElementSource(vid)` ne peut être appelé qu'UNE FOIS par `<video>` element.
  Si on swap la source du `<video>` (changement de clip), le MediaElementSource survit-il ?
  (Probable : oui, c'est lié à l'élément, pas à la source)
- Si on a un `<video>` par track (pas par clip), le MediaElementSource est créé une seule
  fois par track et persiste. Mais quid quand on crée une nouvelle track ?
  → Créer le MediaElementSource au moment où le `<video>` est créé, pas à chaque play.
- Le fade `gainNode.gain.linearRampToValueAtTime()` est plus fluide mais nécessite
  le timing précis de l'AudioContext. Plus simple : garder le pattern actuel (RAF loop
  qui set `gainNode.gain.value` chaque frame).
- Tester que `fetch(blobUrl)` → `decodeAudioData()` fonctionne sur Safari iOS.
  Alternative : `createMediaElementSource(audioElement)` pour la musique aussi
  (plus simple, pas besoin de décoder en mémoire).

---

## Résumé des niveaux de risque

| Aspect | Risque | Raison |
|--------|--------|--------|
| 1. Drag sous-titres/overlays | FAIBLE | Découplé du playback, opère sur le canvas overlay |
| 2. Filtres WebGL | ÉLEVÉ | Multi-pass nécessaire, blending, 2 textures |
| 3. Persistence Firestore | MOYEN | Nouveau champ `volume`, rétrocompatibilité |
| 4. Fluidité playback | FAIBLE | C'est le but du fix |
| 5. Ratio d'image | FAIBLE | CoverCrop déjà indépendant par source |
| 6. Qualité export | ÉLEVÉ | Export mono-clip, CSS filter vs WebGL, mix audio |
| 7. Clips empilés | MOYEN | Ordre de rendu, flash au swap |
| 8. Audio/Gain | ÉLEVÉ | Toute la pipeline audio change |

### Priorité de réponse pour Claude Code
1. **Audio/Gain (8)** → valider l'approche Web Audio API, tester createMediaElementSource
2. **Filtres WebGL (2)** → décider multi-pass vs multi-sampler
3. **Export (6)** → confirmer que l'export reste mono-clip pour le MVP
4. **Clips empilés (7)** → décider l'ordre de rendu
5. **Firestore (3)** → ajouter le default `volume: 1.0` dans loadFromFirestore
6. Les autres → vérification rapide, pas de risque majeur
