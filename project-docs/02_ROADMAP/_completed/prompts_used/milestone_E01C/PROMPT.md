# Milestone E01-C — Trim handles sur les blocs de la timeline

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
L'éditeur a une timeline avec 4 types de tracks : vidéo (Track.tsx), texte (TextTrack.tsx),
sous-titres (SubtitleTrack.tsx), audio (AudioTrackTimeline.tsx). Actuellement, pour trimmer
la vidéo ou ajuster les overlays texte, il faut passer par le panel Trim (sliders séparés).
On veut ajouter des trim handles directement sur les blocs de la timeline.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe déjà

### Timeline.tsx
- Container avec `touch-none select-none` et pointer events pour le playhead
- Zoom dynamique : `zoomLevel = containerWidth / duration`
- Playhead draggable via `onPointerDown/Move/Up` avec RAF et `setPointerCapture`
- Tracks empilées verticalement : vidéo (h-10), texte (h-7), sous-titres (h-5), audio (h-5)
- Playhead = ligne blanche + triangle, z-10

### Track.tsx (vidéo)
- Affiche la zone active en vert sage, zones hors-trim en gris
- Props : `duration, trimStart, trimEnd, zoomLevel`
- Pas interactif (pas de click/tap handlers)

### TextTrack.tsx (overlays texte)
- Chaque overlay = un `<button>` positionné absolument
- Click sélectionne l'overlay (`selectOverlay(id)`)
- Style : bleu sage quand sélectionné (ring-1 ring-white)
- Overlay a `startTime` et `endTime`

### SubtitleTrack.tsx
- Blocs jaunes positionnés absolument
- Pas interactif actuellement
- Chaque segment a `startTime` et `endTime`

### AudioTrackTimeline.tsx
- Un seul bloc violet qui couvre toute la durée
- Pas interactif

### useEditorStore.ts (propriétés pertinentes)
```typescript
trimStart: number;          // trim début vidéo (secondes)
trimEnd: number;            // trim fin vidéo (secondes)
setTrim: (start, end) => void;

overlays: TextOverlayItem[];  // chaque overlay a startTime, endTime
updateOverlay: (id, changes) => void;
selectedOverlayId: string | null;
selectOverlay: (id) => void;

subtitles: SubtitleSegment[];  // chaque segment a startTime, endTime
// pas de updateSubtitleTiming actuellement

currentTime: number;
seekTo: (time) => void;
duration: number;
```

## Objectif
Ajouter des trim handles (poignées gauche/droite) sur les blocs de la timeline
pour que Judith puisse ajuster le début et la fin de chaque élément directement
par drag sur la timeline, sans passer par le panel Trim.

## Livrables attendus

### 1. Nouveau composant TrimHandle.tsx
Créer `components/features/editor/timeline/TrimHandle.tsx` :
```typescript
interface Props {
  side: 'left' | 'right';
  onDrag: (deltaPx: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}
```

**Visuel :**
- Barre verticale de 4px de large, hauteur 100% du bloc parent
- Couleur : blanc semi-transparent (`bg-white/60`) au repos, `bg-white` pendant le drag
- Zone de hit : 24px de large (12px de chaque côté de la barre visible) pour faciliter le touch
- Visible seulement quand le bloc est sélectionné/actif
- Petite encoche triangulaire au centre pour indiquer que c'est draggable

**Comportement :**
- `onPointerDown` : capture le pointer, appelle `onDragStart`, empêche la propagation
- `onPointerMove` : calcule le delta en pixels depuis le start, appelle `onDrag(deltaPx)`
- `onPointerUp` : relâche le pointer, appelle `onDragEnd`
- Utiliser `requestAnimationFrame` pour throttler les updates pendant le drag
- `e.stopPropagation()` sur tous les pointer events pour ne pas trigger le scroll/playhead de la timeline

### 2. Modifier Track.tsx — trim handles sur la piste vidéo
- Ajouter un TrimHandle gauche sur le bord gauche de la zone active (trimStart)
- Ajouter un TrimHandle droite sur le bord droit de la zone active (trimEnd)
- Les handles sont toujours visibles sur la piste vidéo (pas besoin de sélection)
- Quand on drag le handle gauche : `setTrim(newTrimStart, trimEnd)` où `newTrimStart = trimStart + deltaPx/zoomLevel`
- Quand on drag le handle droit : `setTrim(trimStart, newTrimEnd)` où `newTrimEnd = trimEnd + deltaPx/zoomLevel`
- Clamp : trimStart >= 0, trimEnd <= duration, trimEnd - trimStart >= 0.5 (min 0.5 sec)

### 3. Modifier TextTrack.tsx — trim handles sur les overlays texte
- Les handles apparaissent seulement sur l'overlay sélectionné (`selectedOverlayId`)
- Quand on drag le handle gauche : `updateOverlay(id, { startTime: newStart })`
- Quand on drag le handle droit : `updateOverlay(id, { endTime: newEnd })`
- Clamp : startTime >= 0, endTime <= duration, endTime - startTime >= 0.3

### 4. Modifier SubtitleTrack.tsx — trim handles sur les segments
- Ajouter la sélection de segment (tap = sélectionne) — nouveau state `selectedSubtitleId` dans le store
- Les handles apparaissent sur le segment sélectionné
- Pas de `updateSubtitleTiming` dans le store actuellement → l'ajouter

### 5. Modifier useEditorStore.ts
Ajouter :
```typescript
selectedSubtitleId: string | null;
selectSubtitle: (id: string | null) => void;
updateSubtitleTiming: (id: string, changes: { startTime?: number; endTime?: number }) => void;
```

### 6. Coordination des gestes avec la timeline
C'est le point critique — le `Timeline.tsx` a des pointer events pour le playhead.
Il faut que les trim handles aient PRIORITÉ sur le playhead.

**Règle :** Si le pointerDown est sur un TrimHandle, le handle capture le pointer
et la timeline ne reçoit jamais l'event. C'est déjà géré par `e.stopPropagation()`
dans le TrimHandle, mais il faut vérifier que ça fonctionne dans la structure DOM.

**Structure DOM attendue :**
```
Timeline (pointer events → playhead)
  └── Track (pas de pointer events)
       └── Zone active
            ├── TrimHandle left (stopPropagation)
            └── TrimHandle right (stopPropagation)
  └── TextTrack
       └── Overlay button (stopPropagation → sélection)
            ├── TrimHandle left (stopPropagation)
            └── TrimHandle right (stopPropagation)
```

## Contraintes
- NE PAS modifier ResizeDivider.tsx ni EditorLayout.tsx
- NE PAS modifier le zoom, le playhead ou la règle temporelle
- NE PAS modifier AudioTrackTimeline.tsx (pas de trim sur l'audio pour l'instant)
- NE PAS ajouter de snap magnétique (backlog futur)
- NE PAS ajouter de preview overlay pendant le trim (backlog futur)
- Les handles doivent fonctionner sur mobile (touch) ET desktop (mouse)
- Le header et le divider ne sont pas affectés
- Mobile first 375px — les handles doivent être assez gros pour des doigts
- Garder `touch-none` sur la timeline (le système de pointer events gère tout)

## Definition of Done
- [ ] Les trim handles sont visibles sur la piste vidéo (toujours)
- [ ] Drag du handle gauche ajuste trimStart
- [ ] Drag du handle droit ajuste trimEnd
- [ ] Les handles apparaissent sur l'overlay texte sélectionné
- [ ] Drag des handles texte ajuste startTime/endTime de l'overlay
- [ ] Les handles apparaissent sur le segment de sous-titre sélectionné
- [ ] Tap sur un segment de sous-titre le sélectionne
- [ ] Le drag des handles ne déclenche PAS le playhead de la timeline
- [ ] Clamp : minimum 0.5s pour vidéo, 0.3s pour texte/sous-titres
- [ ] Zone de hit de 24px sur les handles (tactile friendly)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire avant de commencer
- `CLAUDE.md`
- `components/features/editor/timeline/Timeline.tsx`
- `components/features/editor/timeline/Track.tsx`
- `components/features/editor/timeline/TextTrack.tsx`
- `components/features/editor/timeline/SubtitleTrack.tsx`
- `lib/store/useEditorStore.ts`
- `project-docs/02_ROADMAP/MILESTONE_E01.md`
