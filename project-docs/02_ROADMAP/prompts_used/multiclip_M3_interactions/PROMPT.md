# Multi-clip M3 — Interactions : réordonnement, split, suppression UI

## Contexte
M1 a refactoré le store, M2 a rendu les clips visibles sur la timeline avec
la preview séquentielle. M3 ajoute les interactions avancées : réordonner les clips
par drag, couper un clip en deux (split), et supprimer un clip avec confirmation.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe (post-M2)

### Store
- `clips: VideoClip[]` avec `addClip`, `removeClip`, `updateClipTrim`, `setActiveClip`
- Les actions `reorderClips` et `splitClip` n'existent PAS encore (reportées de M1)

### ClipTrack.tsx (de M2)
- Affiche N clips comme blocs sur la piste vidéo
- Tap sélectionne un clip
- Trim handles sur le clip actif

### VideoPreview.tsx (de M2)
- Joue les clips en séquence
- getClipAtTime convertit temps global → local

## Livrables attendus

### 1. Ajouter reorderClips et splitClip au store

**Fichier :** `lib/store/useEditorStore.ts`

```typescript
reorderClips: (fromIndex: number, toIndex: number) => void;
splitClip: (id: string, globalSplitTime: number) => void;
```

**duplicateClip :** Crée une copie d'un clip (même `file`, même `blobUrl`, mêmes trim points).
Le nouveau clip est inséré juste après l'original. Judith peut ensuite trim chacun
différemment pour couper un bout au milieu d'une séquence.
IMPORTANT : ne PAS révoquer le `blobUrl` du clone (c'est le même fichier source).

**reorderClips :** Déplace un clip de `fromIndex` à `toIndex` dans le tableau.
Recalcule les `timelineStart` de tous les clips.
Les overlays/sous-titres ne sont PAS ajustés (ils sont en temps global et
devront être re-positionnés manuellement par l'utilisatrice — à documenter).

**splitClip :** Divise un clip en deux au temps global `globalSplitTime`.
1. Convertir le temps global en temps local du clip : `localTime = globalSplitTime - clip.timelineStart + clip.trimStart`
2. Clip 1 : `trimEnd = localTime` (garde le début)
3. Clip 2 : nouveau clip avec `trimStart = localTime`, même `file` et `blobUrl`
4. Recalculer les `timelineStart`

**Important :** Les overlays/sous-titres qui chevauchent le point de split
ne sont PAS ajustés automatiquement. Ajouter un commentaire TODO.

### 2. Drag-to-reorder sur ClipTrack

**Fichier :** `components/features/editor/timeline/ClipTrack.tsx`

Permettre de long-press + drag un clip pour le réordonner :
- Long press (300ms) sur un clip → active le mode drag
- Pendant le drag : le clip suit le doigt horizontalement, les autres clips
  s'écartent avec une animation pour montrer où le clip va être inséré
- Au relâchement : appeler `reorderClips(fromIndex, toIndex)`
- Feedback visuel : le clip en cours de drag a `opacity-70` et une ombre

**Coordination des gestes :**
- Tap court = sélection (< 300ms, < 5px de mouvement)
- Long press + drag = réordonnement (> 300ms)
- Drag sur trim handle = trim (priorité — stopPropagation du TrimHandle)
- Drag sur bloc sélectionné (E01-D) = déplacement temporel (pour les overlays, pas les clips)

**Note :** Le drag-to-reorder est pour les CLIPS vidéo sur la piste vidéo.
Le drag de E01-D est pour les OVERLAYS texte et sous-titres. Ce sont des pistes
différentes, donc pas de conflit.

### 3. Bouton Split (couper au playhead)

**Fichier :** `components/features/editor/EditorToolbar.tsx` ou nouveau composant

Ajouter un bouton "Couper" (ScissorsIcon) dans le toolbar de l'éditeur :
- Visible seulement si le playhead est positionné SUR un clip
- Tap → `splitClip(activeClipId, currentTime)`
- Le clip se divise visuellement en deux blocs sur la timeline
- Le clip gauche reste sélectionné

**Placement :** Bouton icône à côté du bouton "+" (ajouter clip).
Ou dans le panel Trim comme action supplémentaire.

### 4. Bouton Supprimer clip

**Fichier :** `components/features/editor/timeline/ClipTrack.tsx` ou panel

Quand un clip est sélectionné et qu'il y a > 1 clips :
- Afficher un petit bouton "×" (ou TrashIcon) sur le coin supérieur droit du clip
- Tap → confirmation inline "Supprimer ce clip?" avec Annuler/Supprimer
- Confirmation → `removeClip(id)`
- Le clip précédent ou suivant devient actif

**Pas de suppression si un seul clip** — le bouton "×" n'apparaît pas.

### 5. Feedback visuel pendant le réordonnement

Quand un clip est en mode drag :
- Les clips non-dragged s'animent pour montrer l'espace d'insertion
  (transition `transform` de 200ms)
- Une ligne verticale blanche montre la position d'insertion
- Le clip dragged est semi-transparent avec une ombre portée

## Contraintes
- NE PAS modifier l'export (M4)
- NE PAS modifier la preview séquentielle (M2)
- NE PAS ajuster les overlays/sous-titres lors du split/reorder (documenter comme limitation)
- Le drag-to-reorder doit fonctionner au touch (mobile first)
- Long press de 300ms pour distinguer tap de drag
- Les trim handles gardent priorité sur le drag (stopPropagation)
- Anti-swipe Safari doit continuer à fonctionner
- Mobile first 375px

## Definition of Done
- [ ] `reorderClips` et `splitClip` sont implémentés dans le store
- [ ] Long press + drag réordonne les clips visuellement
- [ ] L'animation montre où le clip sera inséré
- [ ] Bouton "Couper" divise le clip au playhead
- [ ] Bouton "×" supprime un clip (avec confirmation, si > 1 clip)
- [ ] Les trim handles fonctionnent toujours (priorité)
- [ ] L'app fonctionne avec un seul clip (pas de bouton supprimer ni réordonnement)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence
- `CLAUDE.md`
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md`
- `lib/store/useEditorStore.ts`
- `components/features/editor/timeline/ClipTrack.tsx` (de M2)
- `components/features/editor/timeline/TrimHandle.tsx`
- `components/features/editor/EditorToolbar.tsx`
