# Milestone E01-B — Timeline flexible + drag fluide du divider

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile (Next.js 15 + Zustand + Tailwind).
E01-A vient d'être livré : un divider draggable entre la preview et la zone bottom
avec 3 presets (caméra/balance/ciseaux). Les boutons presets fonctionnent, mais
le drag du divider manque de fluidité et la timeline a encore des problèmes
de hauteur/scroll.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe déjà

### ResizeDivider.tsx (68 lignes)
- 3 boutons presets : caméra (0.70), balance (0.50), ciseaux (0.30)
- Drag via pointer events + setPointerCapture
- Le drag fonctionne mais manque de fluidité (pas de RAF throttle, pas de visual feedback pendant le drag)
- Les boutons utilisent `onPointerDown` avec `e.stopPropagation()` pour ne pas trigger le drag parent

### EditorLayout.tsx (143 lignes)
- `containerH` initialisé à `window.innerHeight - 44` puis mis à jour par ResizeObserver
- Preview et bottom zone dimensionnées par `editorSplitRatio` (height en pixels)
- Panels en `flex-1 overflow-y-auto`
- Transition `duration-200 ease-out` sur les heights

### Timeline.tsx
- `flex-1 min-h-[60px]` (était en hauteur fixe avant E01-A)
- Zoom dynamique : toute la durée tient dans la largeur
- Playhead draggable
- Tracks : vidéo, texte, sous-titres, audio (26px chacune)

### useEditorStore.ts
- `editorSplitRatio: number` (défaut 0.50, clamp 0.25-0.80)
- `setEditorSplitRatio(ratio)` avec clamp

## Objectif de ce milestone
1. Rendre le drag du divider fluide et satisfaisant sur mobile
2. S'assurer que la timeline utilise correctement l'espace disponible
3. Ajouter un feedback visuel pendant le drag

## Livrables attendus

### 1. Améliorer le drag du ResizeDivider

**Problèmes actuels à corriger :**
- Le drag est saccadé — il faut throttler via `requestAnimationFrame`
- Pas de feedback visuel pendant le drag (le handle devrait s'élargir ou changer de couleur)
- La transition CSS `duration-200` sur les heights cause du lag pendant le drag (la transition doit être désactivée pendant le drag, réactivée après)

**Changements dans ResizeDivider.tsx :**
- Ajouter un RAF pour throttler `onPointerMove`
- Pendant le drag : le handle visuel (barre grise) devient plus large et plus clair (ex: w-12 bg-gray-400)
- Exposer un state `isDragging` via un callback prop `onDragStateChange(isDragging: boolean)` pour que EditorLayout puisse désactiver la transition CSS

**Changements dans EditorLayout.tsx :**
- State local `isDragging` mis à jour par le callback du ResizeDivider
- Conditionner la classe `transition-[height] duration-200 ease-out` : présente seulement quand `!isDragging`
- Quand isDragging, les heights changent instantanément (pas de transition)

### 2. Timeline hauteur minimale et scroll

**Changements dans Timeline.tsx :**
- Hauteur minimum de 80px (au lieu de 60px)
- Si les tracks dépassent l'espace disponible, `overflow-y: auto` avec un gradient fade en bas pour indiquer du contenu caché
- S'assurer que le scroll vertical fonctionne quand il y a 4+ tracks

### 3. Panels scrollables avec hauteur minimale

**Changements dans EditorLayout.tsx :**
- Le div des panels doit avoir `min-h-[60px]`
- Si un panel est trop petit pour son contenu, le scroll interne doit fonctionner

## Contraintes
- NE PAS modifier les tracks individuels (Track.tsx, TextTrack.tsx, etc.)
- NE PAS ajouter de trim handles (c'est E01-C)
- NE PAS toucher à ExportButton, ImportModal, PublishSheet, EditorToolbar
- NE PAS changer la logique du zoom ou du playhead
- Le header (44px + safe-area) reste fixe
- La preview 9:16 doit rester centrée et proportionnelle
- Mobile first 375px
- Respecter les `touch-none` et `select-none` sur la timeline

## Definition of Done
- [ ] Le drag du divider est fluide (RAF throttle, pas de saccade)
- [ ] Le handle s'élargit visuellement pendant le drag
- [ ] Pas de transition CSS pendant le drag (instantané), transition réactivée au relâchement
- [ ] La timeline a une hauteur min de 80px
- [ ] Les panels scrollent si le contenu déborde
- [ ] Le scroll de la timeline fonctionne avec plusieurs tracks
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire avant de commencer
- `CLAUDE.md` (règles du projet)
- `components/features/editor/ResizeDivider.tsx`
- `components/features/editor/EditorLayout.tsx`
- `components/features/editor/timeline/Timeline.tsx`
- `lib/store/useEditorStore.ts`
- `project-docs/02_ROADMAP/MILESTONE_E01.md`
