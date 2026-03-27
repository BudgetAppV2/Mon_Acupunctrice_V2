# Milestone E01-A — Éditeur: Divider draggable + presets de taille

## Contexte
Mon Acupunctrice Hub V2 est un hub de création de contenu pour une acupunctrice solo (Next.js 15 + Firebase + Vercel). L'éditeur vidéo mobile permet de monter des Reels. Le layout actuel a un problème majeur : les panels et la timeline ont des hauteurs fixes en CSS (`h-[90px]`, `h-[100px]`, `h-[120px]`), ce qui rend l'éditeur rigide et compressé. La timeline est trop petite, des éléments sont coupés en bas de l'écran, et il n'y a aucun moyen de prioriser la preview vs la timeline.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand, déployé sur Vercel.

## Ce qui existe déjà

### EditorLayout.tsx (layout principal)
Structure actuelle : `fixed inset-0 flex flex-col`
- Header (44px + safe-area-top) : bouton retour, timer, bouton export
- Preview vidéo (`flex-1 min-h-0`) : conteneur 9:16 centré
- Zone bottom (`shrink-0`, `maxHeight: 55vh`) :
  - EditorToolbar (tabs : trim, filtres, texte, subs, audio)
  - Panel actif (hauteur fixe selon le tab)
  - Timeline

### Timeline.tsx
- Hauteur dynamique calculée : `20 + (trackCount * 26)` px
- Mais appliquée comme hauteur fixe sur le div (`height: ${timelineHeight}px`)
- Tracks : vidéo (toujours), texte (si overlays), sous-titres (si subs), audio (si audioUrl)
- Zoom dynamique : toute la durée tient dans la largeur
- Playhead draggable avec pointer events

### useEditorStore (Zustand)
Propriétés pertinentes : `videoFile`, `videoUrl`, `currentTime`, `duration`, `trimStart`, `trimEnd`, `seekTo`, `overlays`, `subtitles`, `audioUrl`, `isPlaying`, `thumbnailUrl`.

## Objectif de ce milestone
Remplacer le layout rigide de l'éditeur par un système flexible avec un divider draggable entre la preview et la zone timeline/panels, plus 3 presets rapides pour basculer entre modes.

## Livrables attendus

### 1. Nouveau composant `ResizeDivider.tsx`
Créer `components/features/editor/ResizeDivider.tsx` :
- Barre horizontale entre la preview et la zone bottom
- Poignée tactile visible (petite barre grise centrée, comme un handle de bottom sheet)
- Zone de hit de 44px (même si visuellement ~8px)
- Touch + mouse support (onPointerDown/Move/Up)
- Pendant le drag : met à jour un ratio en temps réel
- 3 boutons presets intégrés dans le divider :
  - Icône caméra : preview max (ratio 0.70 = 70% preview, 30% bottom)
  - Icône balance : balanced (ratio 0.50 = 50/50) — mode par défaut
  - Icône ciseaux : timeline max (ratio 0.30 = 30% preview, 70% bottom)
- Animation de transition entre presets (200ms ease-out)
- Les icônes utilisent Heroicons outline (VideoCameraIcon, AdjustmentsHorizontalIcon, ScissorsIcon)

### 2. Modifier `useEditorStore.ts`
Ajouter au store :
```typescript
editorSplitRatio: number  // 0.0 à 1.0, défaut 0.50 (proportion preview)
setEditorSplitRatio: (ratio: number) => void
```
Contraintes : clamp entre 0.25 (min preview) et 0.80 (max preview).

### 3. Modifier `EditorLayout.tsx`
Remplacer le layout fixe par un layout dynamique :
- La preview utilise `height: ${splitRatio * 100}%` de l'espace disponible (entre header et safe-area-bottom)
- La zone bottom utilise le reste `height: ${(1 - splitRatio) * 100}%`
- Supprimer le `maxHeight: 55vh` fixe sur la zone bottom
- Supprimer les `h-[XXpx]` fixes sur les panels — utiliser `flex-1 overflow-y-auto` à la place
- Le ResizeDivider se place entre la preview et la zone bottom
- La preview garde son aspect ratio 9:16 (max-width calculé dynamiquement)

### 4. Modifier `Timeline.tsx`
- Supprimer la hauteur fixe calculée (`height: ${timelineHeight}px`)
- Utiliser `flex-1 min-h-[60px]` pour que la timeline prenne l'espace restant dans la zone bottom
- Les tracks gardent leur hauteur de 26px chacune
- Si plus de tracks que l'espace permet, scroll vertical

## Contraintes
- NE PAS modifier les tracks individuels (Track.tsx, TextTrack.tsx, etc.)
- NE PAS ajouter de trim handles (c'est E01-C)
- NE PAS modifier le zoom ou le playhead
- NE PAS toucher à ExportButton, ImportModal, PublishSheet
- NE PAS ajouter de pinch-to-zoom
- Le header (44px + safe-area) reste fixe en haut — pas affecté par le resize
- La preview 9:16 doit rester centrée et proportionnelle
- Safe area bottom doit être respectée (PWA standalone)
- Mobile first 375px — tester que rien ne déborde
- Garder les `touch-none` et `select-none` sur la timeline (sinon conflit de gestes)

## Definition of Done
- [ ] Le divider est visible entre la preview et la zone bottom
- [ ] Drag vertical du divider redimensionne en temps réel
- [ ] Les 3 presets (caméra/balance/ciseaux) fonctionnent
- [ ] Transition animée entre les presets (200ms)
- [ ] Le ratio est clampé entre 0.25 et 0.80
- [ ] Le ratio par défaut est 0.50
- [ ] La preview garde son ratio 9:16 dans tous les modes
- [ ] La timeline utilise l'espace restant (pas de hauteur fixe)
- [ ] Les panels scrollent si leur contenu déborde
- [ ] Safe area bottom respectée
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire avant de commencer
- `CLAUDE.md` (règles du projet)
- `components/features/editor/EditorLayout.tsx` (layout actuel)
- `components/features/editor/timeline/Timeline.tsx` (timeline actuelle)
- `lib/store/useEditorStore.ts` (store Zustand)
- `components/features/editor/EditorToolbar.tsx` (toolbar tabs)
- `project-docs/02_ROADMAP/MILESTONE_E01.md` (contexte complet du milestone)
