# Multi-clip M2 — Timeline multi-clip + preview séquentielle

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
M1 a refactoré le store pour supporter `clips: VideoClip[]`. Le store a les actions
`addClip`, `removeClip`, `updateClipTrim`, `setActiveClip`, `initClipDuration`.
Les champs legacy (`videoFile`, `videoUrl`, `trimStart`, `trimEnd`, `duration`)
sont synchronisés via `syncLegacyFields` vers le premier clip.

M2 rend le multi-clip visible : la timeline affiche N clips, la preview les joue
en séquence, et l'ImportModal permet d'ajouter un clip.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe (post-M1)

### Store (useEditorStore.ts)
```typescript
clips: VideoClip[];           // tableau de clips
activeClipId: string | null;  // clip sélectionné
addClip(file, blobUrl)        // ajoute un clip à la fin
removeClip(id)                // supprime un clip
updateClipTrim(id, start, end) // trim un clip spécifique
setActiveClip(id)             // sélectionne un clip
initClipDuration(clipId, dur) // initialise la durée d'un clip
```

### VideoClip type
```typescript
interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  timelineStart: number;      // position sur la timeline globale (calculé)
  sourceVideoUrl?: string;
}
```

### Timeline.tsx — affiche une seule piste vidéo via Track.tsx
### Track.tsx — UN seul bloc vert avec trim handles
### VideoPreview.tsx — UN seul `<video>` element avec `videoUrl` du store
### ImportModal.tsx — 3 options (fichier, webcam, écran) → `loadVideo()` (remplace le clip)

## Livrables attendus

### 1. Remplacer Track.tsx par ClipTrack.tsx

**Fichier :** `components/features/editor/timeline/ClipTrack.tsx` (nouveau)

Affiche N clips sur la piste vidéo au lieu d'un seul bloc :
- Chaque clip = un bloc coloré positionné par `timelineStart * zoomLevel`
- Largeur du bloc = `(trimEnd - trimStart) * zoomLevel`
- Le clip actif (`activeClipId`) a un `ring-2 ring-white`
- Les clips non-actifs sont légèrement transparents (`opacity-60`)
- Tap sur un clip = `setActiveClip(id)` (sélection)
- Trim handles sur le clip actif seulement (réutiliser TrimHandle.tsx)
- Les trim handles appellent `updateClipTrim(id, ...)` au lieu de `setTrim()`
- Les zones entre les clips sont vides (gap visuel, fond transparent)

**Couleurs des clips :** Alterner entre `bg-sage/80` et `bg-sage/60` pour
distinguer visuellement les clips adjacents.

**Props :** `{ zoomLevel: number }` — lit les clips depuis le store.

### 2. Modifier Timeline.tsx pour utiliser ClipTrack

**Fichier :** `components/features/editor/timeline/Timeline.tsx`

- Remplacer `<Track ... />` par `<ClipTrack zoomLevel={zoomLevel} />`
- Le `duration` pour le zoom doit être la durée TOTALE de la timeline
  (somme des durées effectives de tous les clips) :
  `const totalDuration = clips.reduce((s, c) => s + (c.trimEnd - c.trimStart), 0);`
- Utiliser `totalDuration` pour le zoomLevel au lieu de `duration` du store
  (qui est la durée source du premier clip)
- Le playhead se déplace sur toute la timeline (temps global)
- Les marques temporelles couvrent toute la durée totale

### 3. Modifier VideoPreview.tsx pour jouer N clips en séquence

**Fichier :** `components/features/editor/VideoPreview.tsx`

C'est le changement le plus complexe. Le `<video>` element doit jouer les clips
en séquence, en changeant de `src` quand le playhead passe d'un clip au suivant.

**Concept :** Convertir le `currentTime` global en temps local du clip actif :
```typescript
function getClipAtTime(clips: VideoClip[], globalTime: number): { clip: VideoClip; localTime: number } | null {
  for (const c of clips) {
    const clipDuration = c.trimEnd - c.trimStart;
    if (globalTime >= c.timelineStart && globalTime < c.timelineStart + clipDuration) {
      return { clip: c, localTime: c.trimStart + (globalTime - c.timelineStart) };
    }
  }
  return null;
}
```

**Quand le currentTime change (seek ou play) :**
1. Calculer quel clip est actif à ce temps
2. Si c'est un clip différent du `src` actuel → changer le `src` du `<video>`
3. Seeker le `<video>` au `localTime` dans le clip

**Pendant le play :**
- `onTimeUpdate` : convertir `video.currentTime` en temps global et appeler `setCurrentTime`
- Quand `video.currentTime >= clip.trimEnd` → passer au clip suivant :
  - Changer le `src` vers le clip suivant
  - Seeker à `clip.trimStart` du nouveau clip
  - Continuer le play
- Quand le dernier clip finit → pause

**Seek (playhead drag) :**
- `seekTo(globalTime)` → trouver le clip → changer src si nécessaire → seek au localTime

**Preview noire :** Si le globalTime ne correspond à aucun clip (ex: entre deux clips
si on ajoute des gaps futurs), afficher du noir.

### 4. Bouton "Ajouter un clip" dans l'éditeur

**Fichier :** `components/features/editor/EditorToolbar.tsx` ou `EditorLayout.tsx`

Ajouter un bouton "+" à droite du toolbar (ou après le dernier onglet) qui ouvre
l'ImportModal en mode "ajout" (pas remplacement).

**Modifications nécessaires :**
- `ImportModal.tsx` : Ajouter une prop `mode: 'replace' | 'add'` (défaut: 'replace')
  - En mode `replace` : appelle `loadVideo()` comme avant (remplace tous les clips)
  - En mode `add` : appelle `addClip(file, blobUrl)` puis `initClipDuration` avec
    la durée obtenue via `getVideoDuration(file)`
- `EditorLayout.tsx` : State pour ouvrir l'ImportModal en mode 'add'
- Le bouton "+" n'apparaît que si au moins un clip existe déjà

### 5. Helper getVideoDuration accessible globalement

**Fichier :** `lib/utils/videoHelpers.ts` (nouveau)

Extraire le helper `getVideoDuration` du store (si c'est inline) vers un utilitaire :
```typescript
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(isFinite(video.duration) ? video.duration : 0);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => { URL.revokeObjectURL(video.src); resolve(0); };
    video.src = URL.createObjectURL(file);
  });
}
```

Utilisé dans ImportModal (mode add) pour `initClipDuration`.

### 6. Indicateur de clip actif dans le header

**Fichier :** `components/features/editor/EditorLayout.tsx`

Si `clips.length > 1`, afficher "Clip 2/3" dans le header à côté du timer.
Petit texte discret pour que Judith sache quel clip est sélectionné.

## Contraintes
- NE PAS modifier le store multi-clip (M1 est fixé)
- NE PAS modifier l'export (M4)
- NE PAS modifier TrimHandle.tsx (il fonctionne bien)
- NE PAS implémenter le drag-to-reorder (M3)
- NE PAS implémenter le split (M3)
- Garder Track.tsx comme fichier (renommer en ClipTrack.tsx ou remplacer le contenu)
- Le `_videoEl` global continue de pointer vers l'unique `<video>` element
- L'overlay noir hors-trim doit fonctionner avec les clips multiples
- Mobile first 375px
- L'anti-swipe Safari doit continuer à fonctionner

## Definition of Done
- [ ] La timeline affiche N clips comme des blocs séparés sur la piste vidéo
- [ ] Tap sur un clip le sélectionne (ring blanc)
- [ ] Trim handles apparaissent sur le clip actif seulement
- [ ] La preview joue les clips en séquence (clip 1 → clip 2 → ...)
- [ ] Le playhead traverse tous les clips
- [ ] Seeker (drag playhead) fonctionne sur n'importe quel clip
- [ ] Bouton "+" pour ajouter un clip (ouvre ImportModal en mode add)
- [ ] Le nouveau clip a sa durée initialisée correctement
- [ ] Indicateur "Clip X/Y" si multi-clip
- [ ] L'app fonctionne identiquement avec un seul clip
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence
- `CLAUDE.md`
- `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md`
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md`
- `lib/store/useEditorStore.ts` (store M1)
- `lib/types/editor.ts` (VideoClip)
- `components/features/editor/timeline/Track.tsx` (à remplacer par ClipTrack)
- `components/features/editor/timeline/Timeline.tsx`
- `components/features/editor/VideoPreview.tsx`
- `components/features/editor/ImportModal.tsx`
- `components/features/editor/EditorLayout.tsx`
- `components/features/editor/EditorToolbar.tsx`
