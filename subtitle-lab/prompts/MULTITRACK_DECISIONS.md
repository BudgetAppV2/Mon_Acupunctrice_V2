# Décisions d'architecture — Consolidation Claude.ai + Claude Code

## Résumé des décisions validées

Ce document consolide les réponses de Claude Code à l'analyse d'impact
et les décisions finales pour chaque aspect de la migration multi-track.

---

## 1. Audio — Web Audio API ✅ VALIDÉ

**Décision** : `createMediaElementSource()` pour les 3 sources (vid1, vid2, audio musique).

```
vid1 → createMediaElementSource(vid1) → gainNode1 ─┐
vid2 → createMediaElementSource(vid2) → gainNode2 ─┤→ audioCtx.destination
audio → createMediaElementSource(audio) → gainNode3 ─┘
```

**Points confirmés par Claude Code :**
- `createMediaElementSource(vid)` survit au swap de `vid.src` (lié à l'élément, pas à la source)
- Après connexion, `vid.volume` et `vid.muted` n'ont plus d'effet → tout passe par GainNode
- Workaround Safari iOS : `await audioCtx.resume()` AVANT `vid.play()`
- Pour la musique : utiliser `createMediaElementSource(audioElement)` (PAS `fetch` + `decodeAudioData`) → plus simple, moins de RAM
- Le fade se fait via `gainNode.gain.value` dans le RAF tick (identique au pattern actuel)

**Attention** : premières ~50ms au volume par défaut sur Safari avant que le GainNode prenne effet.

---

## 2. WebGL multi-pass ✅ VALIDÉ — Option A (dernier-dessine-gagne)

**Décision** : 2 appels `renderVideoFrame()` séquentiels. Pas besoin de `gl.BLEND` pour le MVP.

```ts
renderVideoFrame(vid1, W, H, uniforms1);  // track fond
renderVideoFrame(vid2, W, H, uniforms2);  // track dessus (écrase)
```

**Points confirmés :**
- Performance : ~2-3ms total pour 2 passes à 540×960. iPhone 12+ tient facilement 60fps
- Singleton `state` avec une seule texture : OK. `texImage2D` réécrit la texture à chaque passe
- Pas besoin de 2 textures ni de multi-sampler
- PIP/opacité : futur — ajouter `gl.BLEND` + uniform `u_alpha` quand nécessaire

---

## 3. Export ✅ VALIDÉ — Mono-clip pour le MVP

**Décision** : garder l'export limité à 1 clip. L'export multi-track = chantier séparé (M6+).

**Points confirmés :**
- `ctx.filter` fonctionne sur Chrome desktop, PAS sur Safari iOS
- Recommandation : afficher un warning si export avec filtre sur Safari iOS
- Futur : migrer l'export vers le WebGL renderer pour correspondance preview ↔ export
- Risque identifié : les formules GLSL ≠ CSS filters → rendu légèrement différent entre preview et export

---

## 4. Ordre de rendu ✅ DÉCIDÉ — Track 0 = dessus pour le MVP

**Décision MVP** : garder l'ordre actuel (track 0 au-dessus, itération inverse).

- Convention NLE standard = track du bas = fond, track du haut = dessus
- Le code actuel fait l'inverse (track 0 = dessinée en dernier = au-dessus)
- Pour le MVP : documenter ce comportement. Inverser quand on ajoutera le réordonnement des tracks.
- L'itération naturelle (for i=0→N) avec track 0 = fond viendra en M5+.

---

## 5. Firestore ✅ FIX IDENTIFIÉ

**Décision** : ajouter `volume: t.volume ?? 1.0` dans `loadFromFirestore` pour chaque track.

```ts
// Dans loadFromFirestore, quand on restore les tracks :
const tracks = (ed.tracks as Track[]).map(t => ({
  ...t,
  volume: t.volume ?? 1.0,  // ← default pour vieux documents
  clips: t.type === 'video' && t.clips
    ? t.clips.map(c => ({ ...c, file: null, blobUrl: null }))
    : t.clips,
  // ... reste identique
}));
```

- `syncFlatFromTracks()` ne sync que le 1er clip de la 1ère track → legacy, pas critique

---

## 6. Drag sous-titres / text overlays ✅ PAS IMPACTÉ

- Le drag opère sur le canvas overlay 2D, découplé du playback WebGL
- Tant que le JSX return garde les 2 canvas superposés avec les mêmes classes/styles → OK
- `useSubtitleDrag.ts` n'est pas touché par la refactorisation

---

## 7. Ratio d'image ✅ PAS IMPACTÉ

- CANVAS_W/CANVAS_H restent 540×960 (9:16)
- CoverCrop recalculé par `renderVideoFrame()` via UV coords pour chaque vidéo source
- Chaque appel gère indépendamment le ratio de sa source vidéo

---

## 8. Risques supplémentaires identifiés par Claude Code

### A. Mémoire Safari iOS — RISQUE MOYEN
- 2 tracks × possiblement 2 `<video>` (preload) = 4 éléments vidéo
- Safari iOS peut evict des frames du cache avec des vidéos 1080p
- **Mitigation** : 1 `<video>` par track (pas de preload). Tester sur iPhone 12.

### B. AudioContext 'interrupted' — RISQUE MOYEN
- Appel téléphonique ou switch d'app → AudioContext passe à 'interrupted'
- **Mitigation** : écouter `audioCtx.onstatechange` + `document.visibilitychange` → `audioCtx.resume()`

### C. Clock drift rVFC vs Web Audio — RISQUE FAIBLE
- Les 2 APIs ont des clocks indépendants qui peuvent dériver
- **Mitigation** : négligeable pour vidéos < 90s (use-case Judith). Ignorer pour le MVP.

### D. Store throttle 15fps — RISQUE FAIBLE
- Le MiniScrubber et le timecode lisent `currentTime` du store, mis à jour à ~15fps
- Le timecode affiché sera légèrement saccadé pendant le play
- **Mitigation** : acceptable pour le MVP. Futur : lire `timeRef.current` directement via un hook.

### E. Différence preview ↔ export (GLSL vs CSS filters) — RISQUE FAIBLE
- Les formules GLSL ne sont pas identiques à 100% aux CSS filters
- **Mitigation** : utiliser le même WebGL renderer pour l'export dans un futur milestone.

---

## Séquence d'implémentation révisée

### M1 — Fix playback + Web Audio API (résout les 3 bugs + prépare multi-track)
**Fichiers touchés :**
- `components/features/editor-v2/SubtitleCanvas.tsx` (réécriture RAF loop + audio)
- `lib/editor-v2/playback.ts` (pas de changements)
- `lib/editor-v2/types.ts` (ajouter `volume: number` à Track)

**Ne PAS toucher :**
- `lib/editor-v2/useSubtitleDrag.ts`
- `lib/editor-v2/renderer.ts`
- `lib/editor-v2/webglRenderer.ts` (utilisé tel quel, 1 passe)
- `lib/hooks/useVideoExportV2.ts`
- Le JSX return du composant (garder les 2 canvas identiques)

**Changements :**
1. Supprimer `useVideoPool()` → remplacer par 1 `<video>` par track (créé via `createVideoElement()`)
2. Créer `useAudioEngine()` hook : AudioContext + 3 MediaElementSources + 3 GainNodes
3. Réécrire le RAF loop unifié : wall-clock + clip-switch + trim surveillance + WebGL draw
4. Seek UNIQUEMENT au clip-switch, scrub, et premier play
5. AudioContext.resume() dans le handler du bouton Play
6. Écouter `audioCtx.onstatechange` + `visibilitychange` pour re-resume

**Tests de validation :**
- [ ] Play un clip trimmé → pas figé
- [ ] Play continu → pas de saccades sur Safari iOS
- [ ] Vidéo + musique jouent ensemble
- [ ] Sliders Voix/Musique contrôlent les volumes indépendamment
- [ ] Pause → scrub → play → audio reprend correctement

### M2 — Store multi-track
**Fichiers touchés :**
- `lib/editor-v2/types.ts` (volume sur Track, confirmé en M1)
- `lib/store/useEditorV2Store.ts` (addVideoTrack, addVideoClip(file, trackId), setTrackVolume, loadFromFirestore fix)

**Tests :**
- [ ] Créer 2 tracks vidéo
- [ ] Ajouter un clip sur chaque track
- [ ] Reload → les 2 tracks persistent
- [ ] Vieux documents Firestore chargent sans crash (volume default 1.0)

### M3 — Playback multi-track simultané
**Fichiers touchés :**
- `components/features/editor-v2/SubtitleCanvas.tsx` (étendre RAF loop pour N tracks)
- Créer un 2e `<video>` element + MediaElementSource + GainNode quand 2e track existe

**Tests :**
- [ ] 2 clips sur 2 tracks jouent en même temps
- [ ] Volume indépendant par track fonctionne
- [ ] Clip-switch indépendant par track (track 1 change de clip pendant que track 2 continue)
- [ ] Fonctionne sur Safari iOS (iPhone 12+)

### M4 — UI multi-track
**Fichiers touchés :**
- `components/features/editor-v2/TracksPanel.tsx` (bouton nouvelle track, volume slider, ajout clip contextuel)

**Tests :**
- [ ] Bouton "Nouvelle piste vidéo" ajoute une track dans le TracksPanel
- [ ] Volume slider par track vidéo visible et fonctionnel
- [ ] "Ajouter clip" ajoute sur la bonne track

### M5+ (futur)
- Export multi-track (M6)
- Export via WebGL renderer au lieu de ctx.filter (M7)
- Réordonnement des tracks dans l'UI + inversion de l'ordre de rendu (convention NLE)
- PIP / split-screen / opacité par track (gl.BLEND + u_alpha)
