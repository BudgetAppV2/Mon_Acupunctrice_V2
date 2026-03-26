# Review critique — Prompts multi-clip M2, M3, M4

Date : 26 mars 2026

---

## M2 — Timeline multi-clip + preview sequentielle

### Validation
- ClipTrack.tsx comme remplacement de Track.tsx est le bon choix — decoupler la logique multi-clip dans un nouveau composant.
- `getClipAtTime()` est le bon pattern pour convertir temps global → local.
- Le bouton "+" dans le toolbar pour ajouter un clip est bien place.
- L'indicateur "Clip 2/3" est une bonne touche UX.

### Problemes critiques

**P1 — Timeline.tsx utilise `duration` du store mais M1 l'a change**

Le prompt dit : "Utiliser `totalDuration` pour le zoomLevel au lieu de `duration` du store".
Mais Timeline.tsx (ligne 104) lit aussi `duration` pour le calcul de `timelineHeight` et pour les marques temporelles. Le prompt ne mentionne pas de changer TOUTES les references a `duration` dans Timeline.

De plus, `seekTo` (ligne 152 du store) clamp a `Math.max(duration, clips[0].duration)`. Avec multi-clip, `duration` = somme des durees effectives, et `clips[0].duration` = duree source du premier clip seulement. Si on a 3 clips de 10s chacun, `duration = 30` mais `clips[0].duration = 10`. Le clamp fonctionne car `max(30, 10) = 30`, OK.

**Verdict :** OK mais le prompt doit etre explicite : remplacer TOUTES les utilisations de `duration` dans Timeline.tsx par `totalDuration` calcule depuis les clips.

**P2 — VideoPreview changement de src pendant le play : gap noir**

Quand on change le `src` d'un `<video>` element, le navigateur doit :
1. Arreter la lecture du fichier actuel
2. Charger le nouveau fichier (headers, buffers)
3. Decoder les premieres frames
4. Afficher

Ce processus prend 50-500ms selon le fichier et l'appareil. Pendant ce temps, le video element affiche du noir ou la derniere frame. Sur iPhone Safari, le flash noir est tres visible.

**Fix requis :** Pre-charger le clip suivant dans un 2e `<video>` element cache. Pattern "double buffer" :
- Video A joue le clip courant
- Video B est pre-charge avec le clip suivant (src set, preload=auto, currentTime=trimStart)
- Quand le clip finit, swapper A et B (A devient cache, B devient visible)
- Ca elimine le gap noir

**Alternative simple pour M2 :** Accepter un court flash noir entre les clips et documenter que le "seamless transition" sera ameliore post-M4. C'est acceptable pour un MVP.

**P3 — `registerVideoElement` et `_videoEl` global**

Le store utilise `_videoEl` pour `seekTo`, `play()`, `pause()`. Avec multi-clip, le `src` du video change, mais l'element HTML reste le meme. `_videoEl.currentTime = c` applique le temps LOCAL du clip courant, mais le store envoie le temps GLOBAL. Il faut convertir.

**Fix requis :** `seekTo` doit convertir le temps global en local avant de set `_videoEl.currentTime`. Ajouter dans `seekTo` :
```typescript
const clipInfo = getClipAtTime(get().clips, c);
if (clipInfo && _videoEl) _videoEl.currentTime = clipInfo.localTime;
```

Mais `getClipAtTime` est defini dans VideoPreview... Il faudrait l'extraire dans un utilitaire partage.

**P4 — `handleTimeUpdate` dans VideoPreview envoie le temps local, pas global**

Actuellement (ligne 53 de VideoPreview) : `setCurrentTime(video.currentTime)`. Avec multi-clip, `video.currentTime` est le temps LOCAL du clip courant. Il faut convertir en global :
```typescript
const globalTime = clip.timelineStart + (video.currentTime - clip.trimStart);
setCurrentTime(globalTime);
```

Le prompt mentionne ce point mais ne donne pas le code exact. C'est critique.

### Oublis

**O1 — Track.tsx n'est pas supprime**

Le prompt dit "Remplacer Track.tsx par ClipTrack.tsx" mais ne specifie pas quoi faire du fichier Track.tsx. S'il reste, Timeline.tsx l'importe encore. Il faut soit :
- Supprimer Track.tsx et changer l'import dans Timeline.tsx
- Renommer Track.tsx en ClipTrack.tsx

**O2 — `getClipAtTime` doit etre un utilitaire partage**

Utilise par VideoPreview (play/seek) ET potentiellement par le store (seekTo). Creer `lib/utils/clipHelpers.ts` avec `getClipAtTime` et `recalcTimelineStarts`.

**O3 — TrimPanel.tsx**

Le TrimPanel actuel lit `trimStart/trimEnd` du store et appelle `setTrim()`. Avec multi-clip, ces champs legacy pointent vers le premier clip. Si le clip actif est le 2e clip, TrimPanel trim le MAUVAIS clip. Le prompt ne mentionne pas ce probleme.

**Fix :** TrimPanel devrait lire le clip actif et appeler `updateClipTrim(activeClipId, ...)` au lieu de `setTrim()`. Mais le prompt dit "NE PAS modifier les panels" — contradiction. A documenter comme limitation M2 (TrimPanel trim toujours le premier clip).

---

## M3 — Interactions

### Validation
- Long press (300ms) pour distinguer tap de drag est un pattern mobile standard.
- Le drag-to-reorder est sur la piste VIDEO, le drag de E01-D est sur les pistes TEXTE/SOUS-TITRES — pas de conflit direct.
- Le bouton split au playhead est intuitif.

### Problemes critiques

**P5 — `duplicateClip` et blobUrl refcount**

Le prompt mentionne `duplicateClip` qui partage le meme `file` et `blobUrl`. Le probleme : si un des deux clips est supprime (`removeClip`), le blobUrl est revoque (ligne du store : `if (removed?.blobUrl) URL.revokeObjectURL(removed.blobUrl)`). Le clone qui partage le meme blobUrl perd sa video.

**Fix requis :** Deux options :
1. **Refcount :** Compter combien de clips referent chaque blobUrl. Ne revoquer que quand le count tombe a 0. Complexe.
2. **Nouveau blobUrl :** Dans `duplicateClip`, creer un NOUVEAU blobUrl a partir du meme `File` : `URL.createObjectURL(file)`. Chaque clip a son propre blobUrl. Simple et correct.

**Recommandation :** Option 2 — un nouveau `createObjectURL` ne coute presque rien.

Meme logique pour `splitClip` : les deux clips resultants doivent avoir des blobUrls differents.

**P6 — `reorderClips` et overlays en temps global**

Quand on reordonne les clips, les `timelineStart` changent. Mais les overlays texte et sous-titres ont des `startTime/endTime` en temps GLOBAL qui ne sont pas recalcules. Si Judith a un overlay "Bonjour" a 0-3s (sur le clip 1) et qu'elle deplace le clip 1 en position 2, l'overlay est maintenant a 0-3s (sur le clip 2 qui est devenu le premier). C'est incoherent.

Le prompt documente ce probleme comme "limitation" mais c'est confus pour l'utilisatrice.

**Recommandation :** Afficher un warning quand on reordonne avec des overlays : "Les textes et sous-titres ne sont pas ajustes automatiquement." Ou mieux : lier les overlays a un clip specifique (pas en temps global) via un `clipId` sur chaque overlay. Mais ca casse le temps global... C'est un probleme de design fondamental.

**Pour M3 :** Accepter la limitation et documenter. Le reordonnement est un cas d'usage avance — la plupart des Reels de Judith sont 1-2 clips simples.

**P7 — Long press 300ms peut conflicter avec le context menu iOS**

Sur iOS Safari, un long press declenche le context menu natif (Copy, Look Up, etc.) apres ~500ms. Le seuil de 300ms est en dessous, mais si l'utilisatrice hesite, le context menu apparait pendant le drag.

**Fix :** Ajouter `-webkit-touch-callout: none` et `user-select: none` sur les clips de ClipTrack pendant le long press.

### Oublis

**O4 — `duplicateClip` n'est pas dans le prompt M3 du store mais est mentionne dans le texte**

Le prompt M3 mentionne `duplicateClip` dans le texte mais ne l'ajoute pas a la liste des actions du store dans le livrable 1. Il faut l'ajouter explicitement.

**O5 — Confirmation de suppression**

Le prompt dit "confirmation inline" mais ne specifie pas le composant. Sur mobile 375px, une confirmation inline dans ClipTrack (qui fait 26px de haut) serait illisible. Mieux : utiliser un toast/banner en haut de l'ecran ou un petit dialog.

---

## M4 — Export multi-clip

### Validation
- Seek loop par clip avec timestamps globaux continus est le bon pattern.
- Reutiliser un seul VideoEncoder + Muxer pour toute la video est correct.
- Le seuil WebCodecs/FFmpeg base sur la taille totale est pertinent.

### Problemes critiques

**P8 — `firstTimestampBehavior: 'offset'` et timestamps continus**

Le muxer est configure avec `firstTimestampBehavior: 'offset'`. Ce mode soustrait le premier timestamp de tous les timestamps suivants, donc le premier frame commence a 0. Avec multi-clip, les timestamps du clip 2 commencent a la fin du clip 1. Si `firstTimestampBehavior: 'offset'` soustrait le premier timestamp du PREMIER clip, les timestamps du clip 2 sont corrects (car ils sont absolus et relatifs au debut de la video totale).

**Verdict :** Ca devrait fonctionner tel quel. Le premier frame a `timestamp = 0`, le dernier frame du clip 1 a `timestamp = clip1Duration * 1e6`, le premier frame du clip 2 a `timestamp = clip1Duration * 1e6 + 0`. Le muxer voit une sequence continue. OK.

**P9 — Audio multi-clip : `Promise.all` sur les arrayBuffers**

Le prompt M4 fait `await Promise.all(clips.map(async (clip) => { const buf = await clip.file!.arrayBuffer(); ... }))`. Pour 3 clips de 50MB chacun, ca alloue 150MB d'ArrayBuffers simultanement en memoire + les AudioBuffers decodes (~150MB supplementaires). Total : ~300MB. Sur iPhone avec ~1.5GB disponible, c'est risque.

**Fix requis :** Traiter les clips SEQUENTIELLEMENT, pas en parallele :
```typescript
const audioBlobs: (Blob | null)[] = [];
for (const clip of clips) {
  try { audioBlobs.push(await extractAudio(clip)); }
  catch { audioBlobs.push(null); }
}
```

Ca utilise max 1 clip en memoire a la fois au lieu de N.

**P10 — Creer un `<video>` par clip dans la boucle d'export**

Le prompt cree un `<video>` par clip. Chaque `<video>` charge le fichier via `URL.createObjectURL(clip.file)`. Pour 3 clips, ca cree 3 blob URLs supplementaires. Avec le cleanup apres chaque clip, ca devrait etre OK.

**Mais :** Le prompt ne revoque PAS les blob URLs des `<video>` temporaires a la fin. Le cleanup dit "ne PAS revoquer les blobUrl des clips du store" — correct. Mais les blob URLs crees pour les `<video>` temporaires DOIVENT etre revoques.

**Fix :** Creer un blobUrl temporaire, l'utiliser, le revoquer immediatement apres le seek loop du clip.

**P11 — `clip.file` peut etre null**

Les clips restaures depuis Firestore ont `file: null`. Le prompt mentionne "Erreur claire si un clip n'a pas de fichier source" dans la DoD. Mais le code propose fait `clip.file!.arrayBuffer()` (non-null assertion). Si `file` est null, ca crashe.

**Fix :** Ajouter un guard au debut de l'export : si un clip a `file === null`, afficher un message "Un clip n'a pas ete telecharge. Retourne dans l'editeur pour le recharger."

### Oublis

**O6 — FFmpeg multi-clip fallback**

Le prompt mentionne le fallback FFmpeg pour les gros fichiers mais ne specifie pas comment `buildExportCommand` gererait le concat de N clips. Actuellement `buildExportCommand` prend `trimStart/trimEnd` pour UN fichier. Pour multi-clip, il faudrait :
1. Ecrire N fichiers dans le virtual FS (`clip0.mp4`, `clip1.mp4`, ...)
2. Creer un fichier concat : `file 'clip0.mp4'\nfile 'clip1.mp4'`
3. Utiliser `-f concat` dans la commande FFmpeg

Ce n'est pas trivial et le prompt ne le couvre pas. **Recommandation :** Pour M4, supporter SEULEMENT le path WebCodecs pour multi-clip. Garder le guard FFmpeg mais avec un message "L'export multi-clip de videos > 100MB n'est pas supporte. Réduis la taille de tes clips."

**O7 — Transcription multi-clip**

Pas mentionne dans M4 mais important : si Judith a 3 clips, la transcription actuelle ne transcrit que le premier clip (via `useTranscription` qui lit `videoFile` du store = premier clip). Les sous-titres generes ne couvrent pas les clips 2 et 3.

**Recommandation :** Hors scope M4. Documenter comme limitation. La transcription multi-clip sera un milestone futur.

---

## Cross-cutting

### Persistance multi-clip

- M1 sauvegarde les clips dans `editorData.clips` (sans File/blobUrl). OK.
- La restauration dans EditorLayout ne reconstruit que le premier clip avec un File. Les autres clips sont des "placeholders" avec `file: null`. Ca fonctionne pour la lecture (les blobUrls sont vides) mais pas pour l'export (qui a besoin des Files).
- **Pour M4 :** L'export doit verifier que tous les clips ont un `file`. Si non, tenter de telecharger depuis `sourceVideoUrl`.

### Upload des videos sources

- Chaque clip devrait avoir son `sourceVideoUrl` dans Storage.
- Actuellement, `useVideoSourceUpload` uploade UN fichier via `ImportModal.handleFile`. Pour `addClip`, il faudrait aussi uploader le nouveau clip.
- Le prompt M2 ne mentionne pas l'upload de la source pour les clips ajoutes.
- **Fix M2 :** Dans ImportModal mode 'add', apres `addClip`, appeler `uploadSource(file, itemId)` avec un path unique par clip (`videos/{uid}/{itemId}/source_${clipId}.mp4`).

### Captions basees sur la transcription

- Les captions utilisent `subtitles.map(s => s.text).join(' ')` comme transcript.
- Avec multi-clip, les sous-titres ne couvrent que le premier clip.
- **Limitation acceptable** pour M2-M4. A documenter.

---

## Modifications recommandees par prompt

### M2
1. Specifier que TOUTES les refs a `duration` dans Timeline.tsx doivent utiliser `totalDuration`
2. Extraire `getClipAtTime` dans `lib/utils/clipHelpers.ts` (partage entre VideoPreview et store)
3. Specifier que `seekTo` dans le store doit convertir global → local via `getClipAtTime`
4. Specifier que `handleTimeUpdate` dans VideoPreview doit convertir local → global
5. Documenter la limitation TrimPanel (trim toujours le premier clip si multi-clip)
6. Ajouter l'upload source dans ImportModal mode 'add'
7. Ajouter l'option du double-buffer video OU documenter le flash noir comme limitation MVP

### M3
1. Ajouter `duplicateClip` explicitement dans le livrable 1
2. Specifier que duplicate/split creent de NOUVEAUX blobUrls (pas de partage)
3. Ajouter `-webkit-touch-callout: none` pendant le long press
4. Specifier le composant de confirmation (toast/dialog, pas inline dans un bloc de 26px)
5. Documenter le warning overlays lors du reorder

### M4
1. Traiter les clips SEQUENTIELLEMENT (pas Promise.all) pour l'extraction audio
2. Creer et revoquer les blobUrls temporaires dans la boucle d'export
3. Ajouter un guard `clip.file === null` avec message d'erreur clair
4. Supporter SEULEMENT WebCodecs pour multi-clip (pas de FFmpeg concat)
5. Documenter la limitation transcription (premier clip seulement)

---

## Ordre d'execution

**M2 → M3 → M4 est confirme.** Pas de changement recommande.

- M2 est prerequis pour M3 (ClipTrack, preview sequentielle)
- M3 est prerequis pour M4 (split/reorder doivent fonctionner avant l'export)
- M4 peut theoriquement etre commence apres M2 (comme le plan original le suggere), mais en pratique il vaut mieux avoir M3 pour tester l'export avec des clips splites/reordonnes

**Effort estime :**
- M2 : 4-6 heures (le plus complexe — preview sequentielle + changement de src)
- M3 : 3-4 heures (interactions drag, moins de logique complexe)
- M4 : 3-4 heures (adaptation du seek loop, audio sequentiel)
