# A1 — Store tracks[] (refactoring data model multi-piste)

## Contexte
Subtitle Lab est un editeur video mobile-first dans `subtitle-lab/`. Le store Zustand actuel est flat (un seul videoFile, un seul filterId, des blocks globaux). On refactore vers une architecture tracks[] multi-piste (video, sous-titres, audio) pour preparer le multi-clip et l'audio.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → 82 lignes. Store flat actuel : globalPreset, blocks[], videoFile, videoUrl, filterId, activeLutId. Actions: setVideo, setFilter, setLut, updateBlock, etc.
- `subtitle-lab/lib/types.ts` → 61 lignes. Types actuels : AnimationType, StylePreset, SubtitleBlock, WordToken. PAS de VideoClip ni AudioClip.
- `subtitle-lab/lib/testData.ts` → 42 lignes. TEST_BLOCKS avec word timing, TOTAL_DURATION_MS.
- `subtitle-lab/components/SubtitleCanvas.tsx` → 151 lignes. RAF loop qui lit blocksRef, presetRef, videoUrlRef, etc. depuis le store.
- `subtitle-lab/components/Timeline.tsx` → 78 lignes. Scrubber + block track. Lit blocks, currentTime, duration du store.
- `subtitle-lab/components/FilterPanel.tsx` → Lit filterId, activeLutId, thumbnailUrl du store.
- `lib/store/useEditorStore.ts` (editeur principal) → lignes 20-38, `recalcTimelineStarts()` et `syncLegacyFields()` — patterns a reproduire.

---

## Livrable 1 — Nouveaux types dans types.ts

**Fichier :** `subtitle-lab/lib/types.ts`

Ajouter les types suivants apres les types existants (ne pas supprimer les types existants) :

```typescript
export type TrackType = 'video' | 'subtitle' | 'audio';

export interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  duration: number;        // ms, duree source
  trimStart: number;       // ms
  trimEnd: number;         // ms
  timelineStart: number;   // ms, calcule par recalcTimelineStarts
  filterId: string;        // CSS filter par clip
  thumbnailUrl: string | null;
}

export interface AudioClip {
  id: string;
  file: File | null;
  blobUrl: string | null;
  name: string;
  duration: number;        // ms
  startMs: number;         // position sur la timeline
  volume: number;          // 0-1
  fadeIn: number;          // ms
  fadeOut: number;          // ms
}

export interface SubtitleTrackData {
  blocks: SubtitleBlock[];
  globalPreset: StylePreset;
}

export interface Track {
  id: string;
  type: TrackType;
  label: string;
  muted: boolean;
  clips?: VideoClip[];            // pour type='video'
  subtitles?: SubtitleTrackData;  // pour type='subtitle'
  audioClips?: AudioClip[];       // pour type='audio'
}
```

---

## Livrable 2 — Refactorer le store avec tracks[]

**Fichier :** `subtitle-lab/lib/store.ts`

Remplacer les champs flat par un tableau `tracks: Track[]`. Creer 3 tracks par defaut :
- V1 (video) — contient le clip initial si videoFile existe
- Sous-titres — contient blocks + globalPreset actuels
- Audio — vide

Ajouter les helpers au module (pas dans le store) :
```typescript
function recalcTimelineStarts(clips: VideoClip[]): VideoClip[] {
  let t = 0;
  return clips.map(c => {
    const u = { ...c, timelineStart: t };
    t += c.trimEnd - c.trimStart;
    return u;
  });
}

export function getVideoTrack(tracks: Track[]): Track | undefined {
  return tracks.find(t => t.type === 'video');
}
export function getSubtitleTrack(tracks: Track[]): Track | undefined {
  return tracks.find(t => t.type === 'subtitle');
}
export function getAudioTrack(tracks: Track[]): Track | undefined {
  return tracks.find(t => t.type === 'audio');
}
export function getActiveVideoClip(tracks: Track[], currentTimeMs: number): VideoClip | null {
  const vt = getVideoTrack(tracks);
  if (!vt?.clips?.length) return null;
  for (const c of vt.clips) {
    const dur = c.trimEnd - c.trimStart;
    if (currentTimeMs >= c.timelineStart && currentTimeMs < c.timelineStart + dur) return c;
  }
  return null;
}
```

**Interface du store** — garder TOUS les champs et actions existants pour la retrocompatibilite. Ajouter :
```typescript
tracks: Track[];
addVideoClip: (file: File) => void;
removeVideoClip: (id: string) => void;
updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
setClipFilter: (clipId: string, filterId: string) => void;
```

**Valeurs initiales** — migrer les champs flat existants :
```typescript
tracks: [
  { id: 'v1', type: 'video', label: 'Video 1', muted: false, clips: [] },
  { id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false, subtitles: { blocks: TEST_BLOCKS, globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } } } },
  { id: 'a1', type: 'audio', label: 'Audio', muted: false, audioClips: [] },
],
```

**Garder les champs flat existants** (`blocks`, `globalPreset`, `videoUrl`, `filterId`, etc.) comme des getters/setters qui lisent/ecrivent dans tracks[]. Ceci maintient la retrocompatibilite avec SubtitleCanvas, Timeline, ControlPanel, etc. :
- `get blocks()` → `getSubtitleTrack(tracks)?.subtitles?.blocks ?? []`
- `setGlobalPreset(p)` → met a jour `tracks[].subtitles.globalPreset`
- `setVideo(file)` → ajoute un VideoClip dans la track video

**Note :** Zustand 5 ne supporte pas les getters natifs. Utiliser des computed values dans le subscribe ou garder les champs flat synchronises quand tracks[] change.

L'approche la plus pragmatique : garder les champs flat ET tracks[] en parallele. Les actions existantes modifient les champs flat comme avant. Les NOUVELLES actions (addVideoClip, etc.) modifient tracks[] ET synchronisent les champs flat.

---

## Livrable 3 — Migrer setVideo vers addVideoClip

**Fichier :** `subtitle-lab/lib/store.ts`

`setVideo(file)` doit maintenant :
1. Creer un VideoClip (id, file, blobUrl, duration=0, trimStart=0, trimEnd=0, timelineStart=0, filterId='normal', thumbnailUrl=null)
2. L'ajouter a la track video (tracks[0].clips)
3. Synchroniser les champs flat existants (videoFile, videoUrl) pour la retrocompatibilite
4. L'ancien comportement de SubtitleCanvas (lire videoUrl du store) reste inchange

`addVideoClip(file)` = meme chose mais cree aussi une nouvelle piste V2 si la track V1 a deja des clips.

---

## Livrable 4 — Recalcul de la duree totale

Quand les clips changent (ajout, suppression, trim), recalculer `duration` :
```typescript
const totalDuration = clips.reduce((acc, c) => acc + (c.trimEnd - c.trimStart), 0);
```

Et aussi appeler `recalcTimelineStarts()` sur les clips de la piste video apres chaque changement.

---


## Livrable 5 — Selection partagee entre sheets

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter au store :
```typescript
selectedTrackId: string | null;  // quel track est focus
selectedItemId: string | null;   // quel clip/block est selectionne pour edition
```

Actions :
```typescript
selectItem: (trackId: string | null, itemId: string | null) => void;
clearSelection: () => void;
```

La selection est PARTAGEE entre les bottom sheets. Quand on selectionne un
clip video dans le sheet Tracks, puis qu'on switch sur le sheet Filtres,
le filtre s'applique au clip selectionne. L'ancien `selectedBlockId` est
remplace par `selectedItemId` (qui peut etre un clip OU un bloc de sous-titre).

Migrer les usages de `selectedBlockId` vers `selectedItemId` dans le store.
Les composants existants (ControlPanel, PresetGallery) qui lisent
`selectedBlockId` doivent continuer a fonctionner — soit garder
`selectedBlockId` comme alias, soit le remplacer partout.

**Note sur la resolution :** Le canvas de preview est 540x960 (moitie de la
resolution finale). L'export final utilise 1080x1920 max (via computeExportSize
dans Phase B). Cette information est pour le contexte — pas besoin de
changer la resolution dans ce milestone.

---

## Contraintes
- NE PAS modifier SubtitleCanvas.tsx (il doit continuer a lire les champs flat du store)
- NE PAS modifier Timeline.tsx, ControlPanel.tsx, PresetGallery.tsx, FilterPanel.tsx
- NE PAS supprimer les champs flat existants — la retrocompatibilite est obligatoire
- Les champs flat (blocks, globalPreset, videoUrl, etc.) et tracks[] coexistent
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] `Track`, `VideoClip`, `AudioClip` types existent dans types.ts
- [ ] `tracks: Track[]` existe dans le store avec 3 tracks par defaut
- [ ] `getVideoTrack()`, `getSubtitleTrack()`, `getAudioTrack()`, `getActiveVideoClip()` fonctionnent
- [ ] `addVideoClip(file)` ajoute un clip et synchronise les champs flat
- [ ] `recalcTimelineStarts()` est appele apres chaque modification de clips
- [ ] Les composants existants (SubtitleCanvas, Timeline, etc.) fonctionnent sans modification
- [ ] `selectedTrackId` et `selectedItemId` existent dans le store
- [ ] `selectItem()` et `clearSelection()` fonctionnent
- [ ] L'ancien `selectedBlockId` est migre vers `selectedItemId`
- [ ] `npm run build` passe dans `subtitle-lab/`
