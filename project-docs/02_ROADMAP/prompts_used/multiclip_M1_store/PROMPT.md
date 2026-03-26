# Multi-clip M1 — Refonte du store Zustand pour multi-clip

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
L'éditeur gère actuellement UN SEUL fichier vidéo (`videoFile: File`, `trimStart`, `trimEnd`).
On migre vers un système multi-clip où la piste vidéo contient N clips, chacun avec
son propre fichier source, ses points de trim, et sa position dans la timeline.

Ce milestone modifie SEULEMENT le store et les types — pas de changement UI visible.
L'app doit continuer à fonctionner identiquement avec un seul clip après cette migration.

## Stack
Next.js 15, TypeScript, Zustand.

## Architecture cible

### Nouveau type VideoClip
```typescript
interface VideoClip {
  id: string;                    // UUID
  file: File;                    // fichier source
  blobUrl: string;               // URL.createObjectURL pour la preview
  duration: number;              // durée totale du fichier source
  trimStart: number;             // début du trim dans le fichier source
  trimEnd: number;               // fin du trim dans le fichier source
  timelineStart: number;         // position de début sur la timeline globale
  sourceVideoUrl?: string;       // URL Firebase Storage (pour la persistance)
}
```

La durée effective d'un clip = `trimEnd - trimStart`.
La position `timelineStart` est calculée automatiquement (somme des durées des clips précédents).

### Modifications du store

**Remplacer :**
- `videoFile: File | null` → `clips: VideoClip[]`
- `videoUrl: string | null` → dérivé du clip actif
- `trimStart: number` → dérivé du clip actif
- `trimEnd: number` → dérivé du clip actif
- `duration: number` → durée TOTALE de tous les clips (somme des durées effectives)

**Ajouter :**
- `activeClipId: string | null` — le clip actuellement actif/sélectionné
- `addClip(file: File, blobUrl: string)` — ajoute un clip à la fin
- `removeClip(id: string)` — supprime un clip
- `reorderClips(fromIndex: number, toIndex: number)` — réordonne
- `updateClipTrim(id: string, trimStart: number, trimEnd: number)` — trim un clip
- `setActiveClip(id: string | null)` — sélectionne un clip
- `splitClip(id: string, splitTime: number)` — divise un clip en deux

**Garder les getters de rétrocompatibilité :**
Le code existant utilise `videoFile`, `videoUrl`, `trimStart`, `trimEnd` partout.
Pour ne pas tout casser, on les garde comme propriétés dérivées du clip actif :

```typescript
// Getters pour retrocompat — pointent vers le premier clip (ou clip actif)
get videoFile() { return clips[0]?.file ?? null; }
get videoUrl() { return clips[0]?.blobUrl ?? null; }
get trimStart() { return clips[0]?.trimStart ?? 0; }
get trimEnd() { return clips[0]?.trimEnd ?? 0; }
```

**IMPORTANT :** Zustand ne supporte pas les getters computed nativement.
La solution : garder `videoFile`, `videoUrl`, `trimStart`, `trimEnd` comme des champs
du store qui sont MIS À JOUR automatiquement quand les clips changent.

Créer une fonction helper `syncLegacyFields(clips)` qui met à jour les champs legacy :
```typescript
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
```

Chaque action qui modifie les clips doit aussi appeler `syncLegacyFields`.

### Recalcul des timelineStart
Chaque fois que les clips changent (ajout, suppression, trim, réordonnement),
recalculer les `timelineStart` de tous les clips :
```typescript
function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => {
    const updated = { ...c, timelineStart: t };
    t += c.trimEnd - c.trimStart;
    return updated;
  });
}
```

### Overlays et sous-titres
Les overlays texte et sous-titres ont des `startTime` et `endTime` qui sont en
temps GLOBAL (timeline). Pas de changement nécessaire — ils fonctionnent déjà
par rapport au temps global.

### currentTime et seekTo
Le `currentTime` reste en temps GLOBAL (timeline). La conversion vers le temps
local d'un clip spécifique sera gérée dans M2 (VideoPreview).

## Livrables attendus

### 1. Ajouter le type VideoClip

**Fichier :** `lib/types/editor.ts`
Ajouter l'interface `VideoClip` comme décrite ci-dessus.

### 2. Modifier le store

**Fichier :** `lib/store/useEditorStore.ts`

- Ajouter `clips: VideoClip[]` et `activeClipId: string | null`
- Ajouter les actions : `addClip`, `removeClip`, `reorderClips`, `updateClipTrim`, `setActiveClip`, `splitClip`
- Garder les champs legacy (`videoFile`, `videoUrl`, `trimStart`, `trimEnd`, `duration`) synchronisés
- Modifier `loadVideo` pour créer un premier clip au lieu de set `videoFile` directement
- Modifier `setTrim` pour mettre à jour le premier clip
- Modifier `setDuration` pour mettre à jour le premier clip
- Modifier `reset` pour vider les clips
- Ajouter `syncLegacyFields` et `recalcTimelineStarts` comme fonctions helper

### 3. Modifier loadVideo pour créer un clip

```typescript
loadVideo: (file, url) => {
  // Révoquer les anciens blob URLs
  get().clips.forEach(c => URL.revokeObjectURL(c.blobUrl));
  const clip: VideoClip = {
    id: crypto.randomUUID(),
    file,
    blobUrl: url,
    duration: 0, // sera mis à jour par setDuration
    trimStart: 0,
    trimEnd: 0, // sera mis à jour par setDuration
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

### 4. Modifier setDuration pour mettre à jour le clip

Quand `setDuration` est appelé (par VideoPreview quand la vidéo se charge),
il doit mettre à jour le `duration` et `trimEnd` du premier clip :

```typescript
setDuration: (d) => {
  const clips = get().clips.map((c, i) =>
    i === 0 ? { ...c, duration: d, trimEnd: c.trimEnd === 0 ? d : c.trimEnd } : c
  );
  set({ clips: recalcTimelineStarts(clips), ...syncLegacyFields(recalcTimelineStarts(clips)) });
},
```

### 5. Implémenter addClip

```typescript
addClip: (file, blobUrl) => {
  const clip: VideoClip = {
    id: crypto.randomUUID(),
    file,
    blobUrl,
    duration: 0,
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

### 6. Implémenter removeClip

Supprime un clip, recalcule les positions. Si c'est le clip actif, sélectionne le suivant ou le précédent.

### 7. Implémenter splitClip

Divise un clip en deux à un temps donné (relatif au clip). Le deuxième clip
commence là où le premier a été coupé. Les deux clips pointent vers le même `file`
mais ont des `trimStart`/`trimEnd` différents.

### 8. Vérifier que editorData persistence fonctionne

**Fichier :** `lib/hooks/useEditorPersistence.ts`

Ajouter `clips` (sans les `file` et `blobUrl` — non sérialisables) dans les données
sauvegardées. Sauvegarder `sourceVideoUrl` pour chaque clip pour la restauration.

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

## Contraintes
- NE PAS modifier les composants UI (Track.tsx, Timeline.tsx, VideoPreview.tsx, etc.)
- NE PAS modifier l'export (exportWebCodecs.ts, useVideoExport.ts)
- NE PAS modifier les panels (TrimPanel, TextPanel, etc.)
- L'app DOIT fonctionner identiquement avec un seul clip après cette migration
- Les champs legacy (`videoFile`, `videoUrl`, `trimStart`, `trimEnd`) sont synchronisés
- Pas de breaking change — tout le code existant qui lit ces champs continue de fonctionner
- Les `File` et `blobUrl` ne sont PAS sérialisables — ne pas les sauvegarder dans Firestore

## Tests de non-régression
Après cette migration, ces flows doivent fonctionner identiquement :
1. Importer une vidéo → l'éditeur affiche la preview
2. Trimmer la vidéo → les points de trim changent
3. Ajouter des overlays texte → positionnés sur la timeline
4. Générer des sous-titres → apparaissent sur la timeline
5. Exporter → la vidéo exportée est correcte
6. Quitter et revenir → les données éditables sont restaurées

## Definition of Done
- [ ] Le type `VideoClip` est défini dans `lib/types/editor.ts`
- [ ] Le store a `clips: VideoClip[]` et `activeClipId`
- [ ] `loadVideo` crée un clip au lieu de set `videoFile` directement
- [ ] `setDuration` et `setTrim` mettent à jour le premier clip
- [ ] Les champs legacy sont synchronisés via `syncLegacyFields`
- [ ] `addClip`, `removeClip`, `reorderClips`, `updateClipTrim`, `splitClip` sont implémentés
- [ ] `recalcTimelineStarts` recalcule les positions à chaque changement
- [ ] `editorData` persistence sauvegarde les clips (sans File/blobUrl)
- [ ] L'app fonctionne identiquement avec un seul clip
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts` (store actuel — à migrer)
- `lib/types/editor.ts` (types actuels)
- `lib/hooks/useEditorPersistence.ts` (persistance editorData)
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md` (plan global)
