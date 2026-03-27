# MILESTONE E01 — Éditeur Timeline Pro
*Mon Acupunctrice Hub V2 — Mars 2026*

---

## Objectif

Transformer l'éditeur vidéo d'un outil rigide avec des panels à hauteur fixe
en une expérience fluide et ajustable, où Judith peut se concentrer sur la
preview OU sur la timeline selon son besoin du moment, avec des trim handles
sur les clips pour un montage précis.

## Problèmes actuels identifiés

### 1. Layout rigide et compressé
- Les panels ont des hauteurs fixes (`h-[90px]`, `h-[100px]`, `h-[120px]`)
- La timeline a une hauteur insuffisante — éléments coupés en bas de l'écran
- Le scroll donne l'impression d'être coincé dans un espace trop petit
- Pas de moyen de prioriser preview vs timeline selon le besoin

### 2. Pas de trim handles
- Impossible d'ajuster le début/fin d'un clip directement sur la timeline
- Pour trimmer, il faut aller dans le panel Trim séparé
- Pas de feedback visuel en temps réel pendant le trim

### 3. Bouton "Modifier" vs "Créer le contenu"
- ✅ Fixé — le bouton est maintenant contextuel (vidéo existante ou non)

---

## Livrables

### E01-A : Divider draggable + presets de taille

**Concept :**
Un divider horizontal entre la preview vidéo et la zone panels/timeline
que Judith peut tirer vers le haut (plus de timeline) ou vers le bas
(plus de preview). Trois presets rapides accessibles via des boutons.

**Détails techniques :**
- Divider = barre horizontale avec poignée tactile (zone de hit 44px)
- Touch events : `onTouchStart` → enregistre Y, `onTouchMove` → calcule delta,
  `onTouchEnd` → applique la nouvelle proportion
- State : ratio preview/timeline stocké dans le `useEditorStore` (persiste par session)
- Presets : 3 boutons discrets sur le divider
  - 📹 Preview max (~75% preview, ~25% timeline) — pour visionner
  - ⚖️ Balanced (~50/50) — défaut
  - ✂️ Timeline max (~30% preview, ~70% timeline) — pour monter
- Animation fluide entre les presets (transition 200ms)
- La preview garde toujours son aspect ratio 9:16 (calculé dynamiquement)

**Changements fichiers :**
- `components/features/editor/EditorLayout.tsx` — remplacer le layout fixe
  par un layout flex avec ratio dynamique
- `lib/store/useEditorStore.ts` — ajouter `timelineRatio` au store
- Nouveau composant `components/features/editor/ResizeDivider.tsx`

**Contraintes :**
- Le divider doit fonctionner sur mobile (touch) ET desktop (mouse)
- Min preview height : 150px (pour que la vidéo reste visible)
- Min timeline height : 100px (pour que les blocs soient utilisables)
- Safe area bottom doit être respectée (PWA standalone)

### E01-B : Timeline plus haute et scrollable

**Concept :**
La timeline doit utiliser l'espace disponible intelligemment — pas de
hauteur fixe. Quand il y a plusieurs tracks (vidéo + texte + audio),
la timeline grandit pour les montrer toutes.

**Détails techniques :**
- Remplacer les `h-[XXpx]` par `min-h-[XXpx]` + `flex-1` 
- Le panel actif (trim, texte, audio, etc.) utilise un `max-h` avec scroll
  interne si le contenu déborde
- La timeline elle-même utilise `overflow-y: auto` si plus de 3 tracks
- Indicateur visuel si du contenu est hors-écran (gradient fade en bas)

**Changements fichiers :**
- `components/features/editor/EditorLayout.tsx` — layout flex dynamique
- `components/features/editor/timeline/Timeline.tsx` — hauteur auto

### E01-C : Trim handles sur les blocs de la timeline

**Concept :**
Chaque bloc (clip vidéo, overlay texte, segment audio) a des handles
gauche/droite qu'on peut tirer pour ajuster le début et la fin du bloc.

**Recherche — leçons de img.ly :**
- Zone de hit tactile 2x plus large que le visuel du handle
  (pattern img.ly : "nothing beats rapid prototyping")
- Le playback ne bouge PAS pendant le trim — un overlay temporaire
  montre la frame exacte au point de trim
- Feedback visuel : le handle s'élargit quand touché, le bloc change
  de couleur pour montrer la zone qui sera coupée
- Snap magnétique aux bords des autres blocs + au playhead
- Les handles sont visibles seulement quand le bloc est sélectionné

**Détails techniques :**
- Chaque `TimelineBlock` reçoit des `TrimHandle` gauche/droite
- `TrimHandle` : div absolu positionné, 8px visuel, 24px zone de hit
- Touch events avec `preventDefault()` pour éviter le scroll pendant le drag
- State temporaire `trimPreviewTime` dans le store — séparé du `currentTime`
- L'overlay de trim preview réutilise le `<video>` existant avec un
  `currentTime` temporaire
- Au relâchement : update le start/end du bloc, remet la preview normale

**Coordination des gestes (insight img.ly) :**
5 gestes à harmoniser :
1. Scroll horizontal de la timeline (pan)
2. Tap sur un bloc (sélection)
3. Drag d'un handle (trim) — PRIORITAIRE quand touché
4. Drag du playhead (scrub)
5. Scroll vertical entre preview et panels

Règle de priorité : si le touch commence sur un handle, c'est du trim.
Si le touch commence sur un bloc (pas un handle), c'est de la sélection.
Si le touch commence dans le vide, c'est du scroll.

**Changements fichiers :**
- Nouveau composant `components/features/editor/timeline/TrimHandle.tsx`
- `components/features/editor/timeline/TimelineBlock.tsx` — intégrer les handles
- `lib/store/useEditorStore.ts` — ajouter `trimPreviewTime`

---

## Ordre d'implémentation

```
Sprint 1 : E01-A (divider draggable + presets)
           → Impact UX immédiat, fondation pour E01-B
           → Estimé : 1 session

Sprint 2 : E01-B (timeline flexible)
           → Utilise le layout dynamique de E01-A
           → Estimé : 1 session

Sprint 3 : E01-C (trim handles)
           → Le plus complexe, nécessite E01-B pour l'espace
           → Estimé : 2 sessions
```

---

## Références

- **img.ly blog** : "Designing a Timeline for Mobile Video Editing"
  - Timeline ajuste sa hauteur au contenu
  - Trim preview = overlay temporaire indépendant du playback
  - Coordination des gestes = le défi le plus surprenant
  - Zone de hit tactile 2x plus large que le visuel
  - Source SwiftUI : github.com/imgly/IMGLYUI-swift

- **CapCut / Instagram Edits** : modèles d'UX de référence pour Judith

---

## Definition of Done

### E01-A
- [ ] Le divider est draggable verticalement sur mobile et desktop
- [ ] 3 presets fonctionnent (preview max, balanced, timeline max)
- [ ] La preview garde son ratio 9:16 dans tous les modes
- [ ] Le ratio persiste pendant la session d'édition
- [ ] Safe area bottom respectée en PWA standalone

### E01-B
- [ ] La timeline utilise l'espace disponible (pas de hauteur fixe)
- [ ] Plusieurs tracks sont visibles sans scroll si l'espace le permet
- [ ] Un indicateur montre si du contenu est hors-écran
- [ ] Les panels gardent un scroll interne si le contenu déborde

### E01-C
- [ ] Les trim handles sont visibles sur le bloc sélectionné
- [ ] Drag d'un handle ajuste le début ou la fin du bloc
- [ ] Un overlay de trim preview montre la frame exacte
- [ ] Les handles ne déclenchent pas le scroll de la timeline
- [ ] Le snap magnétique fonctionne au playhead et aux bords des blocs

---

## Ce qu'on ne fait PAS dans E01

- Pinch-to-zoom sur la timeline (E02)
- Drag-and-drop repositionnement de blocs (E02)
- Multi-sélection de blocs (E02)
- Filtres WebGL avancés (V3+)
- Stickers/emojis (V3+)
