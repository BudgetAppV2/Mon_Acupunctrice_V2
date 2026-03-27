# Milestone E01-D — Drag-and-drop des blocs + feedback visuel + anti-swipe Safari

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
E01-C est en place : les trim handles fonctionnent sur les blocs vidéo, texte
et sous-titres. On veut maintenant pouvoir déplacer un bloc sélectionné horizontalement
sur la timeline pour le repositionner dans le temps, avec du feedback visuel clair
et sans déclencher le swipe-back de Safari iOS.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe déjà

### TrimHandle.tsx (62 lignes)
- Pointer events avec setPointerCapture + RAF throttle + stopPropagation
- Props : side, onDrag(deltaPx), onDragStart, onDragEnd
- Zone de hit 24px, barre visible 4px blanche semi-transparente
- Aucun feedback visuel actif pendant le drag (la barre reste blanche)

### TextTrack.tsx
- Overlays texte = `<button>` positionnés absolument
- Click sélectionne (`selectOverlay(id)`)
- TrimHandles gauche/droite visibles sur l'overlay sélectionné

### SubtitleTrack.tsx
- Segments sous-titres avec sélection + trim handles
- Tap sélectionne le segment

### Track.tsx — Piste vidéo
- TrimHandles sur trimStart/trimEnd
- Pas de déplacement (le clip vidéo est fixe)

### Timeline.tsx
- Container avec `touch-none select-none` et pointer events pour le playhead
- Les TrimHandles utilisent stopPropagation

### EditorLayout.tsx
- `fixed inset-0` — plein écran
- Pas de `overscroll-behavior` défini

## Objectif
1. Drag-and-drop des blocs texte et sous-titres sur la timeline
2. Feedback visuel clair : trim handles jaunes pendant le trim, contour jaune pendant le drag
3. Empêcher le swipe-back de Safari iOS dans la zone de l'éditeur

## Livrables attendus

### 1. Feedback visuel sur les TrimHandles pendant le trim

**Fichier :** `components/features/editor/timeline/TrimHandle.tsx`

Ajouter un état `isDragging` visible :
- Au repos : barre `bg-white/60` (actuel)
- Pendant le drag (`onDragStart` → `onDragEnd`) : barre `bg-amber-400 w-1.5` (jaune, plus épaisse)
- Utiliser un `useState` local pour `isDragging` qui toggle dans onDragStart/onDragEnd
- Transition CSS rapide (100ms) pour l'animation

```typescript
const [active, setActive] = useState(false);
// Dans onPointerDown: setActive(true)
// Dans onPointerUp: setActive(false)
```

Visuel :
```
<div className={`${active ? 'w-1.5 bg-amber-400' : 'w-1 bg-white/60 hover:bg-white'} h-full rounded-full transition-all duration-100`} />
```

### 2. Drag-and-drop des blocs texte (TextTrack.tsx)

**Fichier :** `components/features/editor/timeline/TextTrack.tsx`

Quand un overlay est sélectionné et qu'on drag le bloc (pas un trim handle) :
- Calculer le delta en pixels → convertir en secondes via `zoomLevel`
- Déplacer le bloc : `startTime += delta`, `endTime += delta`
- Garder la durée identique (endTime - startTime ne change pas)
- Clamp : `startTime >= 0`, `endTime <= duration`

**Coordination des gestes :**
- Tap sur un bloc non-sélectionné = sélection (pas de drag)
- Drag sur un bloc sélectionné = déplacement
- Drag sur un trim handle = trim (priorité — le handle a stopPropagation)
- Le drag du bloc ne doit PAS trigger le playhead de la timeline

**Feedback visuel pendant le drag du bloc :**
- Le contour du bloc devient jaune/ambre : `ring-2 ring-amber-400` pendant le drag
- Opacité légèrement réduite : `opacity-80`
- Au relâchement : retour au style normal (ring-white si sélectionné)

**Implémentation :**
- Sur l'overlay sélectionné, ajouter onPointerDown/Move/Up
- Dans onPointerDown : vérifier `e.target.closest('[data-trim-handle]')` — si c'est un handle, ne rien faire
- Sinon : capturer le pointer, enregistrer startX et les temps de départ
- Seuil de 5px avant de commencer le drag (distinguer tap de drag)
- RAF throttle sur le move
- `e.stopPropagation()` + `e.preventDefault()` sur tous les events pour éviter le playhead ET le swipe Safari

### 3. Drag-and-drop des blocs sous-titres (SubtitleTrack.tsx)

**Fichier :** `components/features/editor/timeline/SubtitleTrack.tsx`

Même pattern que TextTrack :
- Drag du segment sélectionné pour le repositionner
- Contour jaune pendant le drag
- Seuil 5px, RAF throttle, stopPropagation

### 4. Attribut data pour distinguer les TrimHandles

**Fichier :** `components/features/editor/timeline/TrimHandle.tsx`

Ajouter `data-trim-handle` sur le div du TrimHandle pour que le drag du bloc puisse vérifier si le pointerDown vient d'un handle :

```typescript
<div
  ref={handleRef}
  data-trim-handle
  className="..."
```

### 5. Anti-swipe Safari iOS sur toute la zone éditeur

**Fichier :** `components/features/editor/EditorLayout.tsx`

Safari iOS déclenche le "swipe-back" (navigation historique) quand on swipe depuis le bord gauche de l'écran. Ça interfère avec les gestes de trim et de drag dans la timeline.

**Fix :** Ajouter `overscroll-behavior-x: none` et `touch-action: pan-y` sur le conteneur principal de l'éditeur pour empêcher le swipe-back :

```typescript
<div className="fixed inset-0 flex flex-col bg-gray-950 overscroll-none"
     style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
```

**ET** sur la zone de la timeline spécifiquement, renforcer avec `touch-action: none` (déjà en place via `touch-none`) pour que TOUS les gestes horizontaux soient gérés par les pointer events.

**Fix additionnel :** Ajouter un event listener sur `touchstart` au niveau du document quand l'éditeur est monté, pour empêcher le comportement par défaut sur les swipes horizontaux dans la zone timeline :

```typescript
useEffect(() => {
  const preventSwipe = (e: TouchEvent) => {
    // Si le touch commence dans la zone timeline, empêcher le swipe
    if ((e.target as HTMLElement)?.closest('[data-timeline]')) {
      if (e.touches.length === 1) {
        // On laisse le pointer event system gérer
      }
    }
  };
  document.addEventListener('touchmove', preventSwipe, { passive: false });
  return () => document.removeEventListener('touchmove', preventSwipe);
}, []);
```

### 6. Attribut data-timeline sur Timeline.tsx

**Fichier :** `components/features/editor/timeline/Timeline.tsx`

Ajouter `data-timeline` sur le conteneur principal pour que le fix anti-swipe puisse identifier la zone :

```typescript
<div
  ref={containerRef}
  data-timeline
  className="bg-gray-950 flex-1 min-h-[60px] relative select-none touch-none"
```

## NE PAS modifier
- Track.tsx (la piste vidéo n'a pas de déplacement, seulement du trim)
- AudioTrackTimeline.tsx (pas de drag sur l'audio)
- ResizeDivider.tsx
- ExportButton.tsx, ImportModal.tsx, PublishSheet.tsx
- Les panels (TrimPanel, TextPanel, etc.)

## Contraintes
- Le drag ne doit PAS interférer avec les trim handles existants (les handles ont priorité via stopPropagation)
- Le drag ne doit PAS trigger le playhead de la timeline
- Le drag ne doit PAS trigger le swipe-back de Safari iOS
- Mobile first 375px — les zones tactiles doivent être assez grandes
- Seuil de 5px avant de commencer le drag (pour ne pas confondre avec un tap)
- `touch-none` est déjà sur la timeline — ne pas le retirer
- Les couleurs de feedback (ambre/jaune) doivent être cohérentes entre le trim et le drag

## Definition of Done
- [ ] Drag horizontal d'un overlay texte sélectionné le repositionne dans le temps
- [ ] Drag horizontal d'un segment sous-titre sélectionné le repositionne
- [ ] La durée du bloc ne change pas pendant le drag
- [ ] Le bloc ne sort pas des limites (startTime >= 0, endTime <= duration)
- [ ] Le drag ne déclenche PAS le playhead de la timeline
- [ ] Le drag ne déclenche PAS le swipe-back de Safari iOS
- [ ] Les trim handles deviennent jaunes et plus épais pendant le trim
- [ ] Le contour du bloc devient jaune pendant le drag
- [ ] Les trim handles fonctionnent toujours (priorité sur le drag du bloc)
- [ ] Un seuil de 5px distingue tap (sélection) de drag (déplacement)
- [ ] `overscroll-behavior-x: none` sur le layout éditeur
- [ ] `data-timeline` attribut sur le conteneur Timeline
- [ ] `data-trim-handle` attribut sur les TrimHandles
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `components/features/editor/timeline/TrimHandle.tsx` (feedback visuel à ajouter)
- `components/features/editor/timeline/TextTrack.tsx` (drag blocs texte)
- `components/features/editor/timeline/SubtitleTrack.tsx` (drag blocs sous-titres)
- `components/features/editor/timeline/Timeline.tsx` (data-timeline)
- `components/features/editor/EditorLayout.tsx` (anti-swipe)
- `lib/store/useEditorStore.ts`
