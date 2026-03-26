# Review critique — Multi-clip M1 (refonte store Zustand)

Date : 26 mars 2026

---

## 1. Validation — Ce qui est bien dans le plan

1. **syncLegacyFields est la bonne strategie.** Zustand ne supporte pas les getters computed. Synchroniser les champs legacy a chaque mutation de `clips[]` est le pattern correct pour garder la retrocompat sans toucher au code existant.

2. **Scope limite au store.** Ne pas toucher l'UI dans M1 est correct — ca isole le risque. Les 6 tests de non-regression (import, trim, overlays, sous-titres, export, persistence) sont les bons.

3. **recalcTimelineStarts** est necessaire et bien place — appele a chaque mutation de clips.

4. **Le type VideoClip** est bien concu. Separer `duration` (fichier source) de `trimStart/trimEnd` (region active) et `timelineStart` (position globale) couvre les besoins.

5. **L'ordre M1→M2→M3→M4** respecte les dependances techniques.

---

## 2. Problemes critiques

### P1 — `setDuration` casse si appele avant `loadVideo`

`VideoPreview.tsx` (ligne ~handler `handleLoaded`) appelle `setDuration(video.duration)` quand `onLoadedMetadata` fire. Le prompt M1 fait que `setDuration` met a jour `clips[0]`. Mais `setDuration` peut etre appele par le polling fallback (useEffect ligne ~103-113 de VideoPreview) qui fire meme quand `clips` est vide (duration fallback polling tourne des que `videoUrl` change). Si `clips` est vide → `clips.map(...)` retourne `[]` → `syncLegacyFields([])` met `duration: 0` → boucle infinie de re-render.

**Fix requis :** `setDuration` doit faire un early return si `clips.length === 0`.

### P2 — `setTrim` et `markEditorTouched` — double write Firestore

Actuellement `setTrim(start, end)` appelle `markEditorTouched()` qui ecrit dans Firestore une seule fois par session. Le plan M1 fait que `setTrim` met a jour `clips[0].trimStart/trimEnd` + appelle `syncLegacyFields`. Mais `markEditorTouched` lit `useEditorStore.getState().itemId` — si le store est en train de se mettre a jour (mid-set), `itemId` pourrait etre null dans un race condition. C'est un probleme pre-existant mais le refactoring l'aggrave car `set()` est appele plus souvent.

**Fix requis :** `markEditorTouched` doit verifier `itemId` DANS le callback, pas avant.

### P3 — `_videoEl` global ne fonctionne pas en multi-clip

`_videoEl` (module-level ref) est set par `registerVideoElement` (appele dans VideoPreview `useEffect`). Il n'y a qu'UN seul element `<video>`. En multi-clip, si on veut `play()` le clip 2, il faut changer le `src` du `<video>`. Mais `_videoEl` est utilise par `play()`, `pause()`, `seekTo()` dans le store. Si le store fait `_videoEl.play()` et que le src pointe vers le clip 1 au lieu du clip 2, ca joue le mauvais clip.

**Impact M1 :** Aucun — M1 n'a qu'un seul clip, donc `_videoEl` pointe toujours vers le bon fichier. Mais c'est un **probleme de design pour M2** qui doit etre documente maintenant.

### P4 — L'export lit `s.videoFile` et `s.trimStart/End` — desynchronisation possible

`useVideoExport.ts` (ligne 28) fait `const s = useEditorStore.getState()` puis utilise `s.videoFile`, `s.trimStart`, `s.trimEnd`. Avec `syncLegacyFields`, ces champs pointent vers le premier clip. Ca fonctionne pour single-clip. Mais si quelqu'un ajoute un 2e clip (via `addClip`) avant M4, l'export exporterait SEULEMENT le premier clip — sans erreur ni avertissement.

**Fix requis :** Ajouter un guard dans `exportVideo` : si `clips.length > 1`, afficher un message "L'export multi-clip n'est pas encore supporte. Seul le premier clip sera exporte." ou bloquer l'export.

### P5 — `splitClip` ne gere pas les overlays/sous-titres

Le prompt mentionne `splitClip(id, splitTime)` mais ne specifie pas quoi faire des overlays et sous-titres. Les overlays ont des `startTime/endTime` en temps GLOBAL. Si on split un clip, les overlays qui chevauchent le point de split ne sont pas ajustes. Visuellement, un overlay qui commencait au milieu du clip 1 se retrouve sur le clip 2 apres le split.

**Impact M1 :** Minimal — `splitClip` est implemente mais pas expose dans l'UI. Mais le code doit documenter que les overlays ne sont pas ajustes (TODO pour M3).

---

## 3. Oublis

### O1 — Restauration des clips depuis Firestore

Le prompt dit de sauvegarder les clips dans `editorData` (sans `file` ni `blobUrl`). Mais il ne specifie pas comment les restaurer dans `EditorLayout.loadExisting`. Actuellement, `loadExisting` telecharge UNE video (sourceVideoUrl ou videoUrl) et appelle `loadVideo(file, url)`. Pour multi-clip, il faudrait telecharger N fichiers sources, un par clip. Le prompt M1 ne couvre pas ce cas.

**Fix requis :** Le prompt doit specifier que la restauration de `editorData.clips` reconstruit les clips SANS les `File` objects. Les `File` objects sont recrees SEULEMENT quand le clip est lu (lazy loading dans M2). En M1, la restauration charge toujours un seul fichier (le premier clip) comme avant.

### O2 — `addClip` set `trimEnd: 0` mais pas `duration`

Quand `addClip` cree un nouveau clip, `duration` et `trimEnd` sont a 0. Qui met a jour ces valeurs ? Actuellement, `setDuration` est appele par `VideoPreview` quand `onLoadedMetadata` fire. Mais `VideoPreview` montre UN seul `<video>` — celui du premier clip (via `videoUrl` legacy). Le nouveau clip ne sera jamais charge dans le `<video>`, donc sa `duration` restera a 0.

**Fix requis :** `addClip` devrait creer un element `<video>` temporaire pour lire la duree du fichier ajoute, puis set `duration` et `trimEnd` sur le clip AVANT de l'ajouter au store. Ou bien ajouter un helper `getVideoDuration(file): Promise<number>`.

### O3 — `reset()` ne revoque pas les blob URLs des clips

Le prompt montre `loadVideo` qui fait `get().clips.forEach(c => URL.revokeObjectURL(c.blobUrl))`, mais `reset()` devrait aussi le faire. Le reset actuel revoque seulement `get().videoUrl`. Avec multi-clip, chaque clip a son propre `blobUrl` qui doit etre revoque.

### O4 — `removeClip` et les overlays/sous-titres orphelins

Si un clip est supprime, les overlays/sous-titres qui etaient positionnes dans la plage temporelle de ce clip deviennent orphelins. Ils pointent vers un temps qui n'existe plus. Le prompt ne specifie pas quoi en faire.

**Recommandation :** Supprimer les overlays/sous-titres dont le `startTime` tombe dans la plage du clip supprime. Ou les deplacer au clip precedent. A documenter comme decision pour M3.

### O5 — `useEditorPersistence` subscribe a l'entier du store

`useEditorPersistence` utilise `useEditorStore.subscribe()` qui fire a CHAQUE changement du store. Avec multi-clip, les mutations de `clips[]` + `syncLegacyFields` generent 2+ ecritures par action (une pour `clips`, une pour les champs legacy). Ca pourrait tripler le nombre de debounce resets.

**Impact :** Mineur — le debounce de 2s absorbe les multiples updates. Mais verifier que le `JSON.stringify` ne produit pas de strings differentes pour le meme etat (a cause des `File` objects non-serialisables qui changeraient en reference).

---

## 4. Suggestions d'amelioration

### S1 — Helper `getVideoDuration` a creer dans M1

```typescript
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  });
}
```

Utiliser dans `addClip` pour set `duration` et `trimEnd` immediatement :
```typescript
addClip: async (file, blobUrl) => {
  const duration = await getVideoDuration(file);
  const clip = { ..., duration, trimEnd: duration };
  // ...
}
```

**Probleme :** `addClip` devient async. Les actions Zustand sont normalement synchrones. Solution : garder `addClip` sync avec `duration: 0`, et ajouter un `initClipDuration(clipId)` async appele ensuite.

### S2 — Guard multi-clip dans l'export

Ajouter dans `useVideoExport.ts` :
```typescript
const s = useEditorStore.getState();
if (s.clips.length > 1) {
  setError('L\'export multi-clip sera disponible prochainement. Pour l\'instant, utilise un seul clip.');
  setState('error');
  return;
}
```

### S3 — Documenter les decisions M2/M3 dans le code

Chaque action multi-clip (`splitClip`, `removeClip`, `reorderClips`) devrait avoir un commentaire `// TODO M2/M3: gerer les overlays/sous-titres lors du split/remove/reorder`.

### S4 — Ne pas implementer `splitClip` et `reorderClips` dans M1

Le prompt dit que M1 = store seulement, pas d'UI. Mais il demande d'implementer `splitClip` et `reorderClips` qui sont des fonctionnalites M3. Ca complexifie M1 et ajoute du code non-teste (pas d'UI pour le tester). **Recommandation :** Dans M1, implementer seulement `addClip`, `removeClip`, `updateClipTrim`, `setActiveClip`. Deplacer `splitClip` et `reorderClips` a M3 quand l'UI les utilise.

---

## 5. Prompt M1 — Modifications recommandees

### Changements au prompt :

1. **`setDuration`** : Ajouter un early return si `clips.length === 0`.

2. **`addClip`** : Ajouter un helper `getVideoDuration` pour initialiser la duree du clip immediatement. Ou documenter que la duree sera mise a jour par M2 quand la preview change de clip.

3. **`reset()`** : Ajouter `get().clips.forEach(c => URL.revokeObjectURL(c.blobUrl))` avant de vider les clips.

4. **Retirer `splitClip` et `reorderClips`** : Les deplacer a M3. Garder seulement `addClip`, `removeClip`, `updateClipTrim`, `setActiveClip`.

5. **Guard export multi-clip** : Ajouter dans `useVideoExport.ts` un guard qui bloque l'export si `clips.length > 1` avec un message d'erreur clair.

6. **Restauration clips** : Specifier dans le prompt que `editorData.clips` est restaure dans `loadExisting` en recreant les clips SANS `File`/`blobUrl`. Le premier clip utilise la video telechargee (comme avant). Les clips supplementaires auront `file: null` et `blobUrl: ''` — ils seront reconstruits dans M2 via `sourceVideoUrl`.

7. **Persistence** : Exclure `clips` du `JSON.stringify` de comparaison dans `useEditorPersistence` car les `File` objects ne sont pas serialisables et causeraient des false positives. Sauvegarder seulement les champs serialisables des clips (`id`, `duration`, `trimStart`, `trimEnd`, `timelineStart`, `sourceVideoUrl`).

8. **Commentaires TODO** : Chaque action multi-clip doit documenter les edge cases non-geres (overlays orphelins, sous-titres chevauchants, etc.) pour M3.

---

## Resume

| Categorie | Items |
|-----------|-------|
| **Problemes critiques** | 5 (setDuration vide, desync export, _videoEl global, addClip duration, splitClip overlays) |
| **Oublis** | 5 (restauration, addClip duration, reset revoke, removeClip orphelins, persistence serialisation) |
| **Suggestions** | 4 (helper duration, guard export, retirer split/reorder de M1, documenter TODO) |

**Verdict global :** Le plan M1 est solide dans son architecture (syncLegacyFields, recalcTimelineStarts, retrocompat) mais incomplet sur les edge cases. Avec les 8 corrections recommandees, le prompt M1 est pret a etre execute sans risque de regression.
