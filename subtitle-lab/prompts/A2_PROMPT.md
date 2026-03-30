# A2 — Scrubber persistant + Sheet Tracks multi-piste

## Contexte
Subtitle Lab a un store tracks[] (A1). Le Timeline.tsx actuel est un scrubber basique. On le remplace par un mini-scrubber elegant toujours visible + un sheet Tracks multi-piste avec blocs draggables, trim handles, et playhead.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, @heroicons/react.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/Timeline.tsx` → Scrubber actuel (sera remplace)
- `subtitle-lab/lib/store.ts` → Store avec tracks[], getVideoTrack(), getSubtitleTrack(), selectedItemId
- `subtitle-lab/lib/types.ts` → Track, VideoClip, SubtitleBlock, AudioClip
- `subtitle-lab/app/page.tsx` → Layout avec SheetId toggle et Toolbar
- `subtitle-lab/components/BottomSheet.tsx` → Bottom sheet reutilisable (40dvh)
- `components/features/editor/timeline/TrimHandle.tsx` (editeur principal) → Pattern pointer capture + RAF debounce
- `project-docs/02_ROADMAP/prompts_used/multiclip_M2_timeline/PROMPT.md` → Spec ClipTrack, playhead, selection

---

## Livrable 1 — MiniScrubber.tsx (design soigne)

**Nouveau fichier :** `subtitle-lab/components/MiniScrubber.tsx`

PAS un simple slider 4px. Un scrubber compact mais visuellement riche :

- Hauteur 24px (pas 4px — assez pour etre visuellement significatif)
- Fond: barre sombre `bg-white/5` avec bordures arrondies
- Le remplissage (progress) montre la position actuelle en `bg-emerald-500/30`
- Le playhead est un triangle/losange fin (pas un cercle) en `emerald-400`
  pointant vers le bas, avec une ligne verticale fine qui descend
- Afficher le timecode compact a droite : `0:12 / 1:45`
- Si des clips video existent, montrer des mini-blocs de couleur sur la barre
  (comme une minimap — vert pour video, bleu pour sous-titres)
- Touch-enabled : `pointerDown + pointerMove` avec `setPointerCapture`
  pour un scrub precis meme si le doigt sort de la barre
- `touchAction: none` pour empecher le scroll

Le MiniScrubber est TOUJOURS visible entre le canvas et les bottom sheets.

---

## Livrable 2 — Sheet Tracks (nouveau SheetId 'tracks')

**Fichier :** `subtitle-lab/app/page.tsx`

Ajouter `'tracks'` au type SheetId. Ajouter une icone dans la Toolbar :
utiliser `Bars3BottomLeftIcon` ou `QueueListIcon` de @heroicons/react/24/outline.

**Nouveau fichier :** `subtitle-lab/components/TracksPanel.tsx`

Affiche les pistes empilees verticalement dans le bottom sheet :

```
┌─────────────────────────────────────────┐
│ V1  [████████clip1████████][██clip2██]  │  48px
│ Sub [██b1██][█b2█][████b3████]          │  48px
│ A1  [░░░░░░░░waveform░░░░░░░░░░░░░░░]  │  48px
│      │← playhead (ligne verticale)       │
└─────────────────────────────────────────┘
```

**Regles UX critiques pour le sheet Tracks :**
- Chaque piste fait **48px de haut minimum** (pas 36px — les doigts ont
  besoin d'espace pour les trim handles et le tap)
- Label de la piste a gauche (icone + nom, 50px de large)
- Les blocs occupent le reste de la largeur, positionnes proportionnellement
- Le playhead est une ligne verticale emerald-400 avec un petit triangle
  en haut, traversant TOUTES les pistes
- Le playhead est draggable (touch) — dragger le playhead = setCurrentTime
- Scroll horizontal si la timeline est plus longue que l'ecran
- Pinch-to-zoom horizontal pour ajuster le niveau de detail

---

## Livrable 3 — TrackBlock.tsx avec trim handles

**Nouveau fichier :** `subtitle-lab/components/TrackBlock.tsx`

Bloc individuel dans une piste. Represente un VideoClip ou un SubtitleBlock.

**Apparence :**
- Fond colore par type : emerald/30 pour video, blue/30 pour sous-titres, amber/30 pour audio
- Texte tronque (nom du clip ou debut du texte du bloc)
- Coins arrondis (4px)
- Quand selectionne : `ring-2 ring-emerald-400`

**Trim handles (quand le bloc est selectionne) :**
- Barres verticales de **28px de large** (assez pour les doigts)
  sur les bords gauche et droit du bloc
- Couleur : `bg-emerald-400/50` avec une petite poignee visible (3 lignes)
- `setPointerCapture(e.pointerId)` pour le drag precis
  (le doigt peut sortir du handle et le drag continue)
- `stopPropagation()` pour ne pas declencher le scroll du sheet
- Utiliser `requestAnimationFrame` pour debouncer les mises a jour du store
  pendant le drag (eviter les re-renders excessifs)
- Pour les clips video : modifie `trimStart`/`trimEnd` du VideoClip
- Pour les blocs sous-titres : modifie `startMs`/`endMs` du SubtitleBlock

**Gestes :**
- Tap court → `selectItem(trackId, blockId)` (selection partagee)
- Les trim handles ont priorite sur le tap (stopPropagation)

---

## Livrable 4 — Integrer dans page.tsx

**Fichier :** `subtitle-lab/app/page.tsx`

1. Placer le MiniScrubber entre le canvas et les bottom sheets (toujours visible)
2. Retirer le Timeline actuel du sheet 'sub' (remplace par MiniScrubber + Tracks)
3. Ajouter le BottomSheet pour le sheet 'tracks'

```tsx
<SubtitleCanvas />
<MiniScrubber />
<BottomSheet isOpen={activeSheet === 'tracks'} onClose={...}>
  <TracksPanel />
</BottomSheet>
<BottomSheet isOpen={activeSheet === 'sub'} onClose={...}>
  <PresetGallery />
  <ControlPanel />
</BottomSheet>
```

---

## Contraintes
- NE PAS modifier SubtitleCanvas.tsx
- NE PAS modifier ControlPanel.tsx ou PresetGallery.tsx
- Le MiniScrubber est TOUJOURS visible, meme quand un sheet est ouvert
- Les trim handles font **28px de large minimum** (gestes fins sur mobile)
- Les pistes font **48px de haut minimum**
- Touch-action: none sur TOUS les elements draggables
- Le playhead est draggable a travers toutes les pistes
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] MiniScrubber visible entre le canvas et les sheets, avec mini-blocs de couleur et timecode
- [ ] Le MiniScrubber est touch-draggable avec pointerCapture (scrub precis)
- [ ] Sheet Tracks s'ouvre avec une icone dans la toolbar
- [ ] Les 3 pistes (video, sous-titres, audio) sont visibles avec blocs positionnes, 48px de haut
- [ ] Un playhead vertical emerald traverse les pistes et est draggable
- [ ] Tap sur un bloc le selectionne via selectItem() (selection partagee)
- [ ] Les trim handles apparaissent sur le bloc selectionne, 28px de large, draggables avec pointerCapture
- [ ] Scroll horizontal si la timeline deborde
- [ ] `npm run build` passe dans `subtitle-lab/`
