# Milestone E01-D — Drag-and-drop des blocs sur la timeline

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
E01-C vient d'être livré : les trim handles fonctionnent sur les blocs vidéo, texte
et sous-titres. On veut maintenant pouvoir déplacer un bloc sélectionné horizontalement
sur la timeline pour le repositionner dans le temps.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe déjà

### TrimHandle.tsx (62 lignes)
- Pointer events avec setPointerCapture + RAF throttle + stopPropagation
- Props : side, onDrag(deltaPx), onDragStart, onDragEnd
- Zone de hit 24px, barre visible 4px

### TextTrack.tsx (64 lignes)
- Overlays texte = `<button>` positionnés absolument
- Click sélectionne (`selectOverlay(id)`)
- TrimHandles gauche/droite visibles sur l'overlay sélectionné
- Chaque overlay a `startTime` et `endTime`

### SubtitleTrack.tsx (63 lignes)
- Segments sous-titres avec sélection + trim handles
- Chaque segment a `startTime` et `endTime`

### Track.tsx — Piste vidéo
- TrimHandles sur trimStart/trimEnd
- Pas de déplacement (le clip vidéo ne se déplace pas)

### Timeline.tsx
- Pointer events sur le container pour le playhead (scrub)
- Les TrimHandles utilisent stopPropagation pour ne pas trigger le playhead
- `touch-none select-none` sur le container

### useEditorStore.ts (propriétés pertinentes)
```typescript
overlays: TextOverlayItem[];  // startTime, endTime, id, text, etc.
updateOverlay: (id, changes) => void;
selectedOverlayId: string | null;
selectOverlay: (id) => void;

subtitles: SubtitleSegment[];  // startTime, endTime, id, text
selectedSubtitleId: string | null;
selectSubtitle: (id) => void;
updateSubtitleTiming: (id, { startTime?, endTime? }) => void;

duration: number;
```

## Objectif
Permettre de déplacer un bloc sélectionné (overlay texte ou segment sous-titre)
horizontalement sur la timeline par drag, pour le repositionner dans le temps.
Le bloc garde sa durée, seuls startTime et endTime changent du même delta.

## Livrables attendus

### 1. Modifier TextTrack.tsx — drag du bloc sélectionné
Quand un overlay est sélectionné et qu'on drag le bloc (pas un trim handle) :
- Calculer le delta en pixels → convertir en secondes via `zoomLevel`
- Déplacer le bloc : `startTime += delta`, `endTime += delta`
- Garder la durée identique (endTime - startTime ne change pas)
- Clamp : `startTime >= 0`, `endTime <= duration`

**Coordination des gestes — c'est la partie critique :**
- Tap sur un bloc non-sélectionné = sélection (pas de drag)
- Drag sur un bloc sélectionné = déplacement
- Drag sur un trim handle = trim (priorité sur le déplacement)
- Le drag du bloc ne doit PAS trigger le playhead de la timeline

**Implémentation suggérée :**
- Sur l'overlay sélectionné, ajouter des pointer events (onPointerDown/Move/Up)
- Dans onPointerDown : si `e.target` est un TrimHandle, ne rien faire (le handle gère)
- Sinon : capturer le pointer, enregistrer startX et les temps de départ
- Dans onPointerMove : calculer delta, update startTime/endTime
- Utiliser un seuil de 5px avant de commencer le drag (pour distinguer tap de drag)
- Feedback visuel : le bloc a une opacité réduite pendant le drag (opacity-70)

### 2. Modifier SubtitleTrack.tsx — même logique
Même pattern de drag que TextTrack pour les segments de sous-titres sélectionnés.

### 3. NE PAS modifier Track.tsx
La piste vidéo n'a pas de déplacement — le clip vidéo est fixe. Seul le trim
existe sur la piste vidéo.

## Contraintes
- NE PAS modifier TrimHandle.tsx (il fonctionne bien)
- NE PAS modifier Track.tsx, AudioTrackTimeline.tsx
- NE PAS modifier Timeline.tsx, ResizeDivider.tsx, EditorLayout.tsx
- NE PAS ajouter de snap magnétique (futur)
- Le drag ne doit PAS interférer avec les trim handles existants
- Le drag ne doit PAS trigger le playhead de la timeline (stopPropagation)
- Mobile first 375px — le drag doit fonctionner au touch
- Seuil de 5px avant de commencer le drag (pour ne pas confondre avec un tap)
- Garder `touch-none` héritée du parent (pointer events gèrent tout)

## Definition of Done
- [ ] Drag horizontal d'un overlay texte sélectionné le repositionne dans le temps
- [ ] Drag horizontal d'un segment sous-titre sélectionné le repositionne
- [ ] La durée du bloc ne change pas pendant le drag (startTime et endTime bougent ensemble)
- [ ] Le bloc ne sort pas des limites (startTime >= 0, endTime <= duration)
- [ ] Le drag ne déclenche PAS le playhead de la timeline
- [ ] Les trim handles fonctionnent toujours (priorité sur le drag du bloc)
- [ ] Un seuil de 5px distingue tap (sélection) de drag (déplacement)
- [ ] Feedback visuel pendant le drag (opacité réduite ou autre)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire avant de commencer
- `CLAUDE.md`
- `components/features/editor/timeline/TextTrack.tsx`
- `components/features/editor/timeline/SubtitleTrack.tsx`
- `components/features/editor/timeline/TrimHandle.tsx`
- `components/features/editor/timeline/Timeline.tsx`
- `lib/store/useEditorStore.ts`
