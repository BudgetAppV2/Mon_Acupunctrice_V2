# V2_M2 — UI Layout + Canvas + Composants

## Objectif
Copier les 15 composants du Lab, construire le layout maitre EditorV2Layout, et fixer Bug 5 (gradient apres import) et Bug 2 (Safari filters) dans la copie.

## Fichiers a lire avant de coder

### Lab (source)
- `subtitle-lab/app/page.tsx` — layout complet du Lab (structure, Toolbar, SheetId, BottomSheet, sheets)
- `subtitle-lab/components/SubtitleCanvas.tsx` — canvas avec RAF loop, double-buffered playback, CSS filter
- `subtitle-lab/components/ControlPanel.tsx` — panneau de controle des sous-titres
- `subtitle-lab/components/MiniScrubber.tsx` — scrubber persistant
- `subtitle-lab/components/PresetGallery.tsx` — galerie de presets
- `subtitle-lab/components/FilterPanel.tsx` — panneau de filtres
- `subtitle-lab/components/TracksPanel.tsx` — panneau des pistes timeline
- `subtitle-lab/components/BottomSheet.tsx` — composant bottom sheet
- `subtitle-lab/components/AudioSheet.tsx` — panneau audio
- `subtitle-lab/components/TranscribeButton.tsx` — bouton de transcription
- `subtitle-lab/components/CameraOverlay.tsx` — overlay camera
- `subtitle-lab/components/TextPanel.tsx` — panneau text overlays
- `subtitle-lab/components/CoverPanel.tsx` — panneau couverture
- `subtitle-lab/components/Timeline.tsx` — timeline
- `subtitle-lab/components/TrackBlock.tsx` — bloc dans la timeline
- `subtitle-lab/components/AudioWaveform.tsx` — waveform audio

### Hub (patterns de reference)
- `components/features/editor/EditorLayout.tsx` — layout V1 (header avec back, time, save indicator, EditorToolbar)
- `app/(app)/layout.tsx` — navigation cachee sur /editeur
- `lib/store/useEditorV2Store.ts` — store cree en M1

## Ce que ce milestone doit accomplir

### 1. Copier les 15 composants dans `components/features/editor-v2/`

Copier depuis `subtitle-lab/components/` :
- `SubtitleCanvas.tsx`
- `ControlPanel.tsx`
- `MiniScrubber.tsx`
- `PresetGallery.tsx`
- `FilterPanel.tsx`
- `TracksPanel.tsx`
- `BottomSheet.tsx`
- `AudioSheet.tsx`
- `TranscribeButton.tsx`
- `CameraOverlay.tsx`
- `TextPanel.tsx`
- `CoverPanel.tsx`
- `Timeline.tsx`
- `TrackBlock.tsx`
- `AudioWaveform.tsx`

Corriger tous les imports :
- `../lib/store` → `@/lib/store/useEditorV2Store` (et `useSubtitleStore` → `useEditorV2Store`)
- `../lib/renderer` → `@/lib/editor-v2/renderer`
- `../lib/filters` → `@/lib/editor-v2/filters`
- `../lib/playback` → `@/lib/editor-v2/playback`
- `../lib/types` → `@/lib/editor-v2/types`
- `../lib/useSubtitleDrag` → `@/lib/editor-v2/useSubtitleDrag`
- `../lib/presets` → `@/lib/editor-v2/presets`
- `../lib/controlOptions` → `@/lib/editor-v2/controlOptions`
- etc. pour tous les imports relatifs du Lab

### 2. Construire `EditorV2Layout.tsx`

Remplacer le placeholder cree en M1. Ce composant est le coeur du V2.

Structure a reproduire depuis `subtitle-lab/app/page.tsx` :
- `<main>` plein ecran `h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden`
- Header : remplacer le header "Subtitle Lab prototype" par un header Hub :
  - Bouton back (ArrowLeftIcon) → `router.push('/calendrier')`
  - Affichage temps `MM:SS / MM:SS` en font mono
  - Indicateur de sauvegarde (sera wire en M3 — mettre un placeholder)
- Toolbar identique au Lab (Toolbar component inline dans page.tsx → extraire ou copier)
- Canvas centre dans un flex container
- MiniScrubber positionne fixe au-dessus des sheets sur mobile
- 6 BottomSheets (tracks, sub, filter, audio, text, cover) avec le meme toggle
- CameraOverlay conditionnel
- Desktop sidebar (`hidden lg:block lg:w-80`) avec les panneaux

Props : `{ itemId: string }`

Au mount : appeler `useEditorV2Store.getState().setItemId(itemId)`.
Au unmount : appeler `useEditorV2Store.getState().reset()`.

### 3. Fixer Bug 5 — Gradient visible apres import

**Probleme :** Parfois le gradient de demo (bleu fonce) reste visible apres l'import d'une video. La video devrait s'afficher immediatement sans avoir a appuyer play.

**Ou chercher :** `SubtitleCanvas.tsx` dans la copie. Le bug est dans la logique de rendu quand `skipBackground` n'est pas mis a `true` assez tot, ou quand le premier frame n'est pas dessine avant que le RAF loop commence.

**Resultat attendu :** Des qu'une video est importee, la premiere frame s'affiche sur le canvas. Le gradient de demo n'est jamais visible si une video est chargee.

### 4. Fixer Bug 2 — Filtres ne s'affichent pas sur Safari

**Probleme :** `ctx.filter` n'est pas supporte sur Safari iOS (WebKit bug #198416). Le Lab utilise deja `style.filter` CSS comme workaround sur le canvas element. Verifier que ca fonctionne dans la copie.

**Ou chercher :** `SubtitleCanvas.tsx` dans la copie, lignes ou `cssFilter` est calcule et applique via `style={{ filter: cssFilter }}`. Aussi verifier que `FilterPanel.tsx` genere les thumbnails correctement.

**Resultat attendu :** Les filtres s'affichent correctement en preview sur Safari iOS et Chrome. Le canvas element recoit `style.filter` du clip actif, pas `ctx.filter`.

## Ce que ce milestone ne fait PAS
- Pas de persistance Firestore (M3)
- Pas de chargement depuis Firestore (M3)
- Pas d'upload media (M5)
- Pas d'export (M6)
- L'indicateur de sauvegarde dans le header est un placeholder visuel

## Definition of Done
1. `npm run build` passe sans erreur
2. La route `/editeur-v2/[id]` affiche le layout complet du Lab
3. Le canvas affiche le gradient de demo quand aucune video n'est importee
4. L'import d'une video affiche immediatement la premiere frame (Bug 5 fixe)
5. Les filtres s'appliquent visuellement en preview sur Safari ET Chrome (Bug 2 fixe)
6. La toolbar mobile avec les 7 onglets fonctionne (import, tracks, audio, filtres, subs, texte, cover)
7. Les 6 bottom sheets s'ouvrent/ferment correctement
8. Le MiniScrubber est persistant au-dessus des sheets sur mobile
9. Le header Hub affiche back + temps + placeholder sauvegarde
10. La sidebar desktop fonctionne (breakpoint lg)
11. Le V1 fonctionne toujours
12. Aucun console.log en production
13. Fonctionne sur mobile 375px
