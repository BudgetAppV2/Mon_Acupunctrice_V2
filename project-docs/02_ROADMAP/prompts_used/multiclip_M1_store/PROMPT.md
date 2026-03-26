# Multi-clip M1 — Refonte du store Zustand pour multi-clip

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
L'éditeur gère actuellement UN SEUL fichier vidéo (`videoFile: File`, `trimStart`, `trimEnd`).
On migre vers un système multi-clip où la piste vidéo contient N clips, chacun avec
son propre fichier source, ses points de trim, et sa position dans la timeline.

Ce milestone modifie SEULEMENT le store et les types — pas de changement UI visible.
L'app doit continuer à fonctionner identiquement avec un seul clip après cette migration.

**Ce prompt a été revu par un reviewer IA senior.** Les corrections issues de la review
sont documentées dans `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md`.

## Stack
Next.js 15, TypeScript, Zustand.

## Architecture cible

### Nouveau type VideoClip
```typescript
interface VideoClip {
  id: string;                    // UUID
  file: File | null;             // fichier source (null si restauré depuis Firestore)
  blobUrl: string;               // URL.createObjectURL pour la preview ('' si pas de file)
  duration: number;              // durée totale du fichier source
  trimStart: number;             // début du trim dans le fichier source
  trimEnd: number;               // fin du trim dans le fichier source
  timelineStart: number;         // position de début sur la timeline globale (calculé)
  sourceVideoUrl?: string;       // URL Firebase Storage (pour la persistance/restauration)
}
```

La durée effective d'un clip = `trimEnd - trimStart`.
La position `timelineStart` est calculée automatiquement (somme des durées des clips précédents).

### Helper functions (à créer en dehors du store)

```typescript
// Recalcule les timelineStart de tous les clips
function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => {
    const updated = { ...c, timelineStart: t };
    t += c.trimEnd - c.trimStart;
    return updated;
  });
}

// Synchronise les champs legacy pour rétrocompatibilité
function syncLegacyFields(clips: VideoClip[]): Partial<EditorState> {
  const first = clips[0];
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    trimStart: first?.trimStart ?? 0,
    trimEnd: first?.trimEnd ?? 0,
    duration: clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0),
  };
}

// Lit la durée d'un fichier vidéo via un <video> temporaire
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const d = video.duration;
      URL.revokeObjectURL(video.src);
      resolve(isFinite(d) ? d : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Cannot read video duration'));
    };
    video.src = URL.createObjectURL(file);
  });
}
```

### Modifications du store

**Remplacer :**
- `videoFile: File | null` → `clips: VideoClip[]`
- `videoUrl: string | null` → synchronisé via syncLegacyFields
- `trimStart: number` → synchronisé via syncLegacyFields
- `trimEnd: number` → synchronisé via syncLegacyFields
- `duration: number` → somme des durées effectives de tous les clips

**Ajouter :**
- `activeClipId: string | null` — le clip actuellement sélectionné
- `addClip(file: File, blobUrl: string)` — ajoute un clip à la fin
- `removeClip(id: string)` — supprime un clip
- `updateClipTrim(id: string, trimStart: number, trimEnd: number)` — trim un clip
- `setActiveClip(id: string | null)` — sélectionne un clip
- `initClipDuration(clipId: string, duration: number)` — met à jour la durée après le load

**NE PAS implémenter dans M1 (reporté à M3) :**
- ~~`splitClip`~~ — complexe (faut gérer les overlays), reporté à M3
- ~~`reorderClips`~~ — nécessite l'UI de drag, reporté à M3

**Garder les champs legacy synchronisés :**
Le code existant utilise `videoFile`, `videoUrl`, `trimStart`, `trimEnd` partout.
Ces champs RESTENT dans l'interface du store et sont mis à jour automatiquement
via `syncLegacyFields` à chaque mutation de `clips[]`.

## Livrables attendus

### 1. Ajouter le type VideoClip

**Fichier :** `lib/types/editor.ts`
Ajouter l'interface `VideoClip` comme décrite ci-dessus.
Exporter dans `lib/types/index.ts`.

### 2. Ajouter les helper functions

**Fichier :** `lib/store/useEditorStore.ts` (en haut, hors du store)
Ajouter `recalcTimelineStarts`, `syncLegacyFields`, et `getVideoDuration`.

### 3. Modifier le store

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter `clips: VideoClip[]` et `activeClipId: string | null` à l'interface et à l'état initial.

### 4. Modifier loadVideo — créer un clip

```typescript
loadVideo: (file, url) => {
  // Révoquer les anciens blob URLs de TOUS les clips
  get().clips.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
  const clip: VideoClip = {
    id: crypto.randomUUID(),
    file,
    blobUrl: url,
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    timelineStart: 0,
  };
  const clips = [clip];
  set({
    clips,
    activeClipId: clip.id,
    ...syncLegacyFields(clips),
    currentTime: 0,
    isPlaying: false,
  });
},
```

### 5. Modifier setDuration — AVEC early return si clips vide

```typescript
setDuration: (d) => {
  const { clips } = get();
  // Guard : VideoPreview peut appeler setDuration avant loadVideo
  if (clips.length === 0) return;
  const updated = recalcTimelineStarts(
    clips.map((c, i) => i === 0 ? { ...c, duration: d, trimEnd: c.trimEnd === 0 ? d : c.trimEnd } : c)
  );
  set({ clips: updated, ...syncLegacyFields(updated) });
},
```

### 6. Modifier setTrim — mettre à jour le premier clip

```typescript
setTrim: (start, end) => {
  const { clips } = get();
  if (clips.length === 0) return;
  const updated = recalcTimelineStarts(
    clips.map((c, i) => i === 0 ? { ...c, trimStart: start, trimEnd: end } : c)
  );
  set({ clips: updated, ...syncLegacyFields(updated) });
  markEditorTouched();
},
```

### 7. Implémenter addClip

```typescript
addClip: (file, blobUrl) => {
  const clip: VideoClip = {
    id: crypto.randomUUID(),
    file,
    blobUrl,
    duration: 0,  // sera initialisé par initClipDuration
    trimStart: 0,
    trimEnd: 0,
    timelineStart: 0,
  };
  const clips = recalcTimelineStarts([...get().clips, clip]);
  set({
    clips,
    activeClipId: clip.id,
    ...syncLegacyFields(clips),
  });
  markEditorTouched();
},
```

### 8. Implémenter initClipDuration

Appelé après addClip pour initialiser la durée du nouveau clip :
```typescript
initClipDuration: (clipId, duration) => {
  const clips = recalcTimelineStarts(
    get().clips.map(c => c.id === clipId ? { ...c, duration, trimEnd: c.trimEnd === 0 ? duration : c.trimEnd } : c)
  );
  set({ clips, ...syncLegacyFields(clips) });
},
```

### 9. Implémenter removeClip

```typescript
removeClip: (id) => {
  const { clips, activeClipId } = get();
  const filtered = recalcTimelineStarts(clips.filter(c => c.id !== id));
  // Révoquer le blob URL du clip supprimé
  const removed = clips.find(c => c.id === id);
  if (removed?.blobUrl) URL.revokeObjectURL(removed.blobUrl);
  // Si c'était le clip actif, sélectionner le premier ou null
  const newActive = activeClipId === id ? (filtered[0]?.id ?? null) : activeClipId;
  set({
    clips: filtered,
    activeClipId: newActive,
    ...syncLegacyFields(filtered),
  });
  // TODO M3: gérer les overlays/sous-titres orphelins positionnés sur le clip supprimé
},
```

### 10. Implémenter updateClipTrim et setActiveClip

```typescript
updateClipTrim: (id, trimStart, trimEnd) => {
  const clips = recalcTimelineStarts(
    get().clips.map(c => c.id === id ? { ...c, trimStart, trimEnd } : c)
  );
  set({ clips, ...syncLegacyFields(clips) });
  markEditorTouched();
},

setActiveClip: (id) => set({ activeClipId: id }),
```

### 11. Modifier reset — révoquer TOUS les blob URLs

```typescript
reset: () => {
  // Révoquer tous les blob URLs des clips
  get().clips.forEach(c => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
  _videoEl = null;
  _editorTouched = false;
  set({
    clips: [], activeClipId: null,
    videoFile: null, videoUrl: null, duration: 0, currentTime: 0,
    // ... reste identique
  });
},
```

### 12. Guard multi-clip dans l'export

**Fichier :** `lib/hooks/useVideoExport.ts`

Ajouter un guard au début de `exportVideo` :
```typescript
if (s.clips.length > 1) {
  setState('error');
  setError('L\'export multi-clip sera disponible prochainement. Seul le premier clip est exporté.');
  return;
}
```

### 13. Persistence — sérialiser les clips sans File/blobUrl

**Fichier :** `lib/hooks/useEditorPersistence.ts`

Dans les données sauvegardées, ajouter les clips (sans les champs non-sérialisables) :
```typescript
editorData: {
  ...existant,
  clips: clips.map(c => ({
    id: c.id,
    duration: c.duration,
    trimStart: c.trimStart,
    trimEnd: c.trimEnd,
    timelineStart: c.timelineStart,
    sourceVideoUrl: c.sourceVideoUrl,
  })),
}
```

**IMPORTANT :** Dans la comparaison JSON pour éviter les écritures inutiles, exclure
les champs `clips` du store (ils contiennent des `File` objects non-sérialisables).
Comparer seulement les champs sérialisables extraits.

### 14. Restauration des clips dans loadExisting

**Fichier :** `components/features/editor/EditorLayout.tsx`

Quand `editorData.clips` existe dans Firestore, restaurer les métadonnées des clips
dans le store. Le premier clip utilise la vidéo téléchargée (comme avant).
Les clips supplémentaires sont créés avec `file: null` et `blobUrl: ''` — ils seront
reconstruits via `sourceVideoUrl` dans M2 (lazy loading).

Pour M1, seul le premier clip a un `File` object — les autres sont des "placeholders"
avec les métadonnées de timing. L'éditeur fonctionne normalement avec un seul clip actif.

## Contraintes
- NE PAS modifier les composants UI (Track.tsx, Timeline.tsx, VideoPreview.tsx, etc.)
- NE PAS modifier l'export WebCodecs (exportWebCodecs.ts) — seulement le guard dans useVideoExport
- NE PAS modifier les panels (TrimPanel, TextPanel, etc.)
- NE PAS implémenter splitClip ni reorderClips (M3)
- L'app DOIT fonctionner identiquement avec un seul clip
- Les champs legacy sont synchronisés via syncLegacyFields
- Les `File` et `blobUrl` ne sont PAS sérialisables — ne pas les sauvegarder dans Firestore
- Chaque action multi-clip a un commentaire `// TODO M3:` pour les edge cases non gérés

## Definition of Done
- [ ] Le type `VideoClip` est défini dans `lib/types/editor.ts`
- [ ] Le store a `clips: VideoClip[]`, `activeClipId`, et les nouvelles actions
- [ ] `loadVideo` crée un clip au lieu de set videoFile directement
- [ ] `setDuration` a un early return si clips est vide
- [ ] `setTrim` met à jour le premier clip
- [ ] Les champs legacy sont synchronisés via `syncLegacyFields`
- [ ] `addClip` et `initClipDuration` fonctionnent
- [ ] `removeClip` révoque le blobUrl et gère le clip actif
- [ ] `reset` révoque tous les blobUrls
- [ ] Guard multi-clip dans `useVideoExport` (message d'erreur si clips > 1)
- [ ] Persistence sérialise les clips sans File/blobUrl
- [ ] L'app fonctionne identiquement avec un seul clip
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md` (review critique)
- `lib/store/useEditorStore.ts` (store actuel)
- `lib/types/editor.ts` (types actuels)
- `lib/hooks/useEditorPersistence.ts` (persistance)
- `lib/hooks/useVideoExport.ts` (guard export)
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md` (plan global)
