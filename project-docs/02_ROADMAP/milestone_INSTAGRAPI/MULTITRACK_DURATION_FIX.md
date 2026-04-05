# Fix — Duration et playback multi-track

## Bug

Quand on supprime tous les clips du premier track vidéo (V1) mais qu'il y a
des clips sur un deuxième track (V2), le playback et le scrubbing ne fonctionnent
plus. La durée tombe à 0 et videoUrl devient null.

## Cause

Dans `lib/editor-v2/store.ts`, deux fonctions ne regardent que le premier track :

1. `totalClipsDuration()` — calcule la durée depuis `getVideoTrack()` (premier track seulement)
2. `syncFlatFromTracks()` — prend `videoFile` et `videoUrl` du premier clip du premier track

## Fichier à modifier

`lib/editor-v2/store.ts` — seulement ce fichier.

## Fix 1 — totalClipsDuration doit parcourir TOUS les tracks

```typescript
// AVANT (cassé)
export function totalClipsDuration(tracks: Track[]): number {
  const vt = getVideoTrack(tracks);
  if (!vt?.clips?.length) return 0;
  return vt.clips.reduce((acc, c) => acc + c.duration, 0);
}

// APRÈS (multi-track)
export function totalClipsDuration(tracks: Track[]): number {
  let maxEnd = 0;
  for (const t of getVideoTracks(tracks)) {
    if (!t.clips?.length) continue;
    for (const c of t.clips) {
      const clipEnd = c.timelineStart + c.trimEnd;
      maxEnd = Math.max(maxEnd, clipEnd);
    }
  }
  return maxEnd;
}
```

La durée totale est la fin du dernier clip sur TOUS les tracks, pas la somme
des durées du premier track. C'est aussi plus correct pour les tracks qui
ont des clips décalés dans le temps (timelineStart > 0).

## Fix 2 — syncFlatFromTracks doit trouver le premier clip disponible

```typescript
// AVANT (cassé)
export function syncFlatFromTracks(tracks: Track[]) {
  const vt = getVideoTrack(tracks);
  const first = vt?.clips?.[0];
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    thumbnailUrl: first?.thumbnailUrl ?? null,
  };
}

// APRÈS (multi-track)
export function syncFlatFromTracks(tracks: Track[]) {
  let first: VideoClip | undefined;
  for (const t of getVideoTracks(tracks)) {
    if (t.clips?.length) {
      first = t.clips[0];
      break;
    }
  }
  return {
    videoFile: first?.file ?? null,
    videoUrl: first?.blobUrl ?? null,
    thumbnailUrl: first?.thumbnailUrl ?? null,
  };
}
```

## Contraintes

- Ne PAS modifier d'autres fichiers
- Ne PAS modifier les fonctions getVideoTrack, getVideoTracks, getClipAtTime, getActiveVideoClip
- Ne PAS modifier le store useEditorV2Store.ts

## Definition of Done

- [ ] Supprimer tous les clips du track V1 ne casse pas le playback si V2 a des clips
- [ ] La durée reflète le clip le plus long sur tous les tracks
- [ ] Le scrubbing fonctionne quand V1 est vide mais V2 a du contenu
- [ ] Le playback fonctionne avec des clips sur n'importe quel track
