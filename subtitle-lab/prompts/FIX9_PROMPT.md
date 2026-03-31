# FIX-9 — Refonte timeline drag (bounce back bug)

## Contexte
Le drag des blocs dans la timeline "bounce back" a la position originale.
Plusieurs patches incrementaux ont ete appliques mais le bug persiste.
Ce FIX demande une REFONTE PROPRE du systeme de drag dans TrackBlock.

## Probleme racine
Le store met a jour `timelineStart` via `moveVideoClip`, mais quelque chose
le reset a 0 apres. L'investigation console a montre que `initClipDuration`
appelait `recalcTimelineStarts` qui remettait `timelineStart` a 0. Ce bug
a ete corrige, mais d'autres actions du store peuvent encore appeler
`recalcTimelineStarts` inopinement.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a modifier
- `subtitle-lab/components/TrackBlock.tsx` — drag + trim
- `subtitle-lab/lib/store.ts` — moveVideoClip, recalcTimelineStarts
- `subtitle-lab/components/TracksPanel.tsx` — callbacks onDrag

---

## Tache 1 — Auditer et proteger recalcTimelineStarts

**Fichier :** `subtitle-lab/lib/store.ts`

`recalcTimelineStarts` remet TOUS les clips en position sequentielle
a partir de 0. C'est destructif pour le drag car il ecrase le
`timelineStart` modifie par le drag.

LISTER TOUTES les actions qui appellent `recalcTimelineStarts` et
s'assurer qu'AUCUNE ne peut etre declenchee pendant ou apres un drag :

Actions qui DOIVENT garder recalcTimelineStarts :
- `splitClip` — OK (cree 2 clips, positions recalculees)
- `reorderClips` — OK (change l'ordre, positions recalculees)
- `deleteClip` — OK (supprime un clip, positions recalculees)

Actions qui NE DOIVENT PAS appeler recalcTimelineStarts :
- `updateClipTrim` — deja corrige (ne recalcule plus)
- `initClipDuration` — deja corrige (ne recalcule plus)
- `moveVideoClip` — ne doit PAS recalculer (c'est le drag)
- `addVideoClip` — le FIX-5 fait initClipDuration apres, qui ne recalcule plus

## Tache 2 — Refonte TrackBlock drag

**Fichier :** `subtitle-lab/components/TrackBlock.tsx`

Le drag actuel a un probleme de double-fire et de timing entre
le pointerUp et les re-renders React. REECRIRE le drag avec
cette approche simple et fiable :

```typescript
// Le drag utilise des positions ABSOLUES, pas des deltas
// 1. pointerDown: memoriser la position du pointeur et origStart
// 2. pointerMove: calculer la nouvelle position absolue et mettre
//    a jour un state local (dragPx) pour le feedback visuel
// 3. pointerUp: calculer la position finale en ms et appeler
//    onDrag(newAbsoluteStartMs). UN SEUL appel, protege par un flag.
//    Pas de deuxieme appel possible.

// CRITIQUE: Ne pas lire startMs du props pendant le drag —
// utiliser origStart capture au pointerDown. Les props peuvent
// changer pendant le drag (re-render) et causer un mauvais calcul.
```

Le `onDrag` callback recoit une position ABSOLUE en ms (pas un delta).
C'est plus stable car meme si le composant re-render, la position
finale ne change pas.

## Tache 3 — moveVideoClip simple et fiable

**Fichier :** `subtitle-lab/lib/store.ts`

`moveVideoClip(clipId, newTimelineStart)` prend une position ABSOLUE :
```typescript
moveVideoClip: (clipId, newTimelineStart) => set((s) => {
  const tracks = s.tracks.map(t => {
    if (t.type !== 'video' || !t.clips) return t;
    return { ...t, clips: t.clips.map(c =>
      c.id === clipId ? { ...c, timelineStart: Math.max(0, newTimelineStart) } : c
    )};
  });
  return { tracks, ...syncFlatFromTracks(tracks) };
}),
```

PAS de `recalcTimelineStarts`. PAS de reorder. Juste un set direct.

## Tache 4 — TracksPanel callbacks corrects

**Fichier :** `subtitle-lab/components/TracksPanel.tsx`

Pour les clips video, le callback onDrag convertit la position absolue
du bloc (startMs) en timelineStart (en soustrayant trimStart) :
```tsx
onDrag={newStartMs => moveVideoClip(c.id, newStartMs - c.trimStart)}
```

Pour les sous-titres et text overlays, adapter moveSubtitleBlock et
moveTextOverlay pour accepter une position absolue aussi :
```tsx
onDrag={newStartMs => {
  const delta = newStartMs - b.startMs;
  moveSubtitleBlock(b.id, delta);
}}
```

## Contraintes
- UN SEUL appel a onDrag par geste de drag
- Pas de double-fire, pas de bounce back
- Le drag doit etre fluide (translateX pendant le drag)
- Les trim handles continuent de fonctionner
- 0 console.log en production (retirer tous les logs de debug)
- `npm run build` = succes

## Definition of Done
- [ ] Dragger un clip video → le clip reste a la nouvelle position
- [ ] Dragger un bloc sous-titre → le bloc reste a la nouvelle position
- [ ] Dragger un text overlay → l'overlay reste a la nouvelle position
- [ ] Le trim gauche et droit fonctionnent toujours
- [ ] Pas de bounce back apres le drag
- [ ] Pas d'erreur React "hooks order" dans la console
- [ ] `npm run build` passe
