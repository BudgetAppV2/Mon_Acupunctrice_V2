# A7 — Interactions avancees (split, reorder, suppression)

## Contexte
Subtitle Lab a le multi-clip (A3) et le sheet Tracks (A2) avec trim handles. On ajoute les interactions avancees : couper un clip au playhead, reordonner les clips par drag, et supprimer un clip.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → Store avec tracks[], clips video, recalcTimelineStarts().
- `subtitle-lab/lib/types.ts` → VideoClip interface.
- `subtitle-lab/components/TrackBlock.tsx` → Bloc dans la piste avec trim handles (A2). A enrichir.
- `subtitle-lab/components/TracksPanel.tsx` → Pistes empilees dans le sheet Tracks.
- `project-docs/02_ROADMAP/prompts_used/multiclip_M3_interactions/PROMPT.md` → 138 lignes. Spec complete : reorderClips, splitClip, drag-to-reorder avec long press, confirmations.

---

## Livrable 1 — splitClip dans le store

**Fichier :** `subtitle-lab/lib/store.ts`

```typescript
splitClip: (clipId: string, globalSplitTimeMs: number) => void;
```

Implementation :
1. Trouver le clip par id dans la piste video
2. Calculer le temps local : `localSplit = clip.trimStart + (globalSplitTimeMs - clip.timelineStart)`
3. Verifier que localSplit est entre trimStart et trimEnd (pas aux extremites)
4. Creer 2 clips :
   - Clip A : meme file/blobUrl, trimStart inchange, trimEnd = localSplit
   - Clip B : meme file/blobUrl, trimStart = localSplit, trimEnd inchange, nouveau id
5. Remplacer le clip original par les 2 nouveaux
6. Appeler recalcTimelineStarts()

---

## Livrable 2 — reorderClips dans le store

**Fichier :** `subtitle-lab/lib/store.ts`

```typescript
reorderClips: (fromIndex: number, toIndex: number) => void;
```

Implementation :
1. Lire les clips de la piste video
2. Deplacer le clip de fromIndex a toIndex (splice)
3. Appeler recalcTimelineStarts()
4. Synchroniser les champs flat

---

## Livrable 3 — deleteClip dans le store

**Fichier :** `subtitle-lab/lib/store.ts`

```typescript
deleteClip: (clipId: string) => void;
```

Implementation :
1. Filtrer le clip par id
2. Si c'etait le dernier clip : vider la piste (videoUrl = null)
3. Revoquer le blobUrl du clip supprime
4. Appeler recalcTimelineStarts()

---

## Livrable 4 — Bouton Split dans le sheet Tracks

**Fichier :** `subtitle-lab/components/TracksPanel.tsx`

Ajouter une barre d'outils au-dessus des pistes quand un clip est selectionne :
- Bouton Scissors (ScissorsIcon) → `splitClip(selectedClipId, currentTime)`
- Bouton Trash (TrashIcon) → `deleteClip(selectedClipId)` avec confirmation
- Disabled si pas de clip selectionne

Le split coupe au playhead (currentTime). Si le playhead n'est pas dans le clip selectionne, le bouton est disabled.

---

## Livrable 5 — Drag-to-reorder sur les clips

**Fichier :** `subtitle-lab/components/TrackBlock.tsx`

Gestes :
- **Tap court** (< 300ms) → selectionner le clip
- **Long press** (>= 300ms) → entrer en mode drag
  - Le bloc suit le doigt horizontalement
  - Une ligne d'insertion verticale (2px emerald-400) apparait entre les clips
  - Au release : appeler `reorderClips(fromIdx, toIdx)`

Pattern :
```typescript
const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
const onPointerDown = () => {
  longPressTimer.current = setTimeout(() => {
    setDragging(true); // mode drag
  }, 300);
};
const onPointerUp = () => {
  clearTimeout(longPressTimer.current);
  if (!dragging) selectClip(); // tap court = selection
};
```

`stopPropagation` pendant le drag pour ne pas scroller le sheet.

---

## Contraintes
- Le split ne fonctionne que sur les clips VIDEO (pas les blocs sous-titres)
- Les blocs sous-titres ont des trim handles (A2) mais pas de split
- Le split ne cree PAS de nouveau fichier — les 2 clips partagent le meme file/blobUrl
- La suppression du dernier clip vide la piste (pas de crash si 0 clips)
- NE PAS modifier SubtitleCanvas.tsx
- NE PAS modifier les sous-titres ou le renderer
- Confirmation avant suppression (texte simple, pas de modal elaborate)
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] `splitClip()` coupe un clip en 2 au temps global specifie
- [ ] `reorderClips()` deplace un clip et recalcule les positions
- [ ] `deleteClip()` supprime un clip avec cleanup memoire
- [ ] Bouton Scissors coupe au playhead (disabled si hors du clip)
- [ ] Bouton Trash supprime avec confirmation
- [ ] Long press + drag reordonne les clips visuellement
- [ ] `npm run build` passe dans `subtitle-lab/`
