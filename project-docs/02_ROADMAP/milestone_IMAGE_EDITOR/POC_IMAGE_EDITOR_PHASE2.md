# Extensions éditeur d'images — Phase 2

## Rôle

Tu es un ingénieur Frontend expert en Next.js 14 (App Router), React, TypeScript,
Fabric.js v6, et GSAP. Ta mission est d'étendre l'éditeur d'images POC existant
avec des fonctionnalités avancées.

## Contexte

L'éditeur d'images existe déjà dans :
- Page : `app/(app)/editeur-image/page.tsx`
- Layout : `components/features/image-editor/ImageEditorLayout.tsx`
- Canvas : `components/features/image-editor/ImageEditorCanvas.tsx`
- Sidebar : `components/features/image-editor/Sidebar.tsx`
- Panels : `components/features/image-editor/panels/` (Templates, Text, Elements, Photos)

L'éditeur utilise Fabric.js v6 avec un canvas 1080x1920.
Les éléments sont draggables et le texte est éditable.

## Phase 1 — PLAN

Écris le plan de milestones dans
`project-docs/02_ROADMAP/milestone_IMAGE_EDITOR/MILESTONES_PHASE2.md`

## Milestones

### M1 : Icônes Iconify (200k+ icônes)
- `npm install @iconify/react`
- Remplacer les SVG mock dans ElementsPanel par un vrai browser d'icônes
- Barre de recherche pour chercher parmi les icônes
- Catégories : zen, nature, santé, formes, flèches, décoratif
- Clic sur une icône → l'ajoute comme SVG sur le canvas Fabric.js
- Collections recommandées : `mdi`, `lucide`, `tabler`, `ph` (Phosphor)

### M2 : Animations GSAP + Panel Animer
- `npm install gsap split-type`
- Créer `lib/image-editor/animationPresets.ts` avec 3 catégories :

**Catégorie 1 — Textes (nécessite split-type pour découper en lettres/mots) :**
- "machine_a_ecrire" : lettres apparaissent une par une (stagger opacité)
- "ascension" : texte monte de bas en haut (y: +30 → 0 avec stagger)
- "fusion" : lettres partent de très écartées vers position normale
- "explosion" : lettres éclatent (scale: 0 → 1 avec rebond)
- "rebond" : lettres tombent d'en haut avec ease bounce.out

**Catégorie 2 — Général (animations d'entrée) :**
- "fondu" : opacity 0 → 1
- "balayage" : glisse horizontalement (x: -100 → 0)
- "pop" : agrandissement rapide (scale: 0 → 1, ease: back.out)
- "zoom" : agrandissement lent (scale: 0.5 → 1)
- "chute" : tombe du haut (y: -200 → 0)
- "roulade" : entre en tournant (rotation: -180 → 0)
- "derive" : déplacement très lent et fluide

**Catégorie 3 — Effets continus (boucles infinies) :**
- "rotation" : tourne à l'infini (rotation: 360, repeat: -1)
- "impulsion" : grossit/rétrécit en boucle (scale: 1.05, yoyo: true)
- "scintillement" : pulsation opacité (opacity: 0.4, yoyo: true)
- "tremblement" : secousse rapide (x/y tremblants, repeat: -1)

**UI — Panel Animer dans la sidebar :**
- Ajouter un 5ème onglet "Animer" dans la sidebar (icône SparklesIcon)
- 3 sections visuelles : Textes, Général, Effets continus
- La section "Textes" visible SEULEMENT si l'élément sélectionné est du texte
- Bouton "Supprimer l'animation" en haut du panel
- Sélection d'un preset → sauvegarde l'ID animation dans les custom data de l'objet Fabric.js

**Playback — Bouton Jouer dans le header :**
- Bouton ▶ Jouer dans le header à côté d'Exporter
- `playPreview()` :
  1. Cherche les objets avec une animation assignée (via custom data)
  2. `gsap.killTweensOf()` pour nettoyer les animations en cours
  3. Si animation "Texte" : créer un overlay HTML temporaire par-dessus le canvas
     avec le texte, appliquer SplitType, animer avec GSAP, puis retirer l'overlay
  4. Si animation "Général" ou "Continu" : animer directement les propriétés
     Fabric.js (left, top, opacity, scaleX, scaleY, angle) via `canvas.requestRenderAll()`

**ATTENTION sur les animations texte avec Fabric.js :**
Fabric.js rend le texte dans un `<canvas>`, pas dans le DOM. SplitType ne peut
PAS agir sur du texte canvas. La solution est de créer un overlay HTML temporaire
positionné exactement par-dessus l'objet texte Fabric.js, y appliquer SplitType +
GSAP, puis retirer l'overlay quand l'animation est finie. Pendant la preview,
masquer temporairement l'objet Fabric.js original (opacity: 0).

### M3 : Background Removal (IA locale)
- `npm install @imgly/background-removal`
- Ajouter un bouton "Détourer" dans le header ou dans un menu contextuel
  quand une image est sélectionnée sur le canvas
- Le détourage se fait 100% dans le navigateur (WASM, ~40MB à télécharger)
- Afficher un loader pendant le traitement
- Remplacer l'image originale par l'image détourée sur le canvas
- Avertissement : le premier détourage sera lent (téléchargement du modèle)

### M4 : Color Thief (extraction de palette)
- `npm install colorthief` (pas color-thief-react, on utilise la version vanilla)
- Quand une image est ajoutée au canvas, extraire automatiquement 5 couleurs dominantes
- Afficher la palette extraite dans le TextPanel comme raccourci de couleurs
- Permet de créer des designs harmonisés avec les couleurs de la photo

### M5 : Undo/Redo
- Implémenter un historique d'états du canvas Fabric.js
- `canvas.toJSON()` après chaque modification → push dans un stack
- Boutons ⟲ Undo / ⟳ Redo dans le header
- Raccourcis clavier Ctrl+Z / Ctrl+Shift+Z
- Limiter le stack à 30 états pour la mémoire

## Structure des fichiers à créer

```
components/features/image-editor/panels/AnimatePanel.tsx  — Onglet animations
components/features/image-editor/panels/IconSearchPanel.tsx — Browser d'icônes (remplace ElementsPanel)
lib/image-editor/animationPresets.ts                      — Presets GSAP
lib/image-editor/animationEngine.ts                       — Moteur de playback
lib/image-editor/historyManager.ts                        — Undo/redo stack
```

## Contraintes

- Ne PAS modifier les fichiers existants du hub en dehors de l'éditeur d'images
- Ne PAS toucher à l'éditeur vidéo V2 (`components/features/editor-v2/`)
- Le canvas Fabric.js doit rester éditable après la preview des animations
- SplitType.revert() DOIT être appelé quand on arrête la preview
- Heroicons pour les icônes de la sidebar
- TailwindCSS pour le style
- TypeScript strict
- Tester que le build passe après chaque milestone

## Definition of Done

### M1 — Icônes
- [ ] @iconify/react installé
- [ ] ElementsPanel remplacé par IconSearchPanel avec recherche
- [ ] Les icônes s'ajoutent au canvas comme objets SVG Fabric.js
- [ ] Au moins 6 catégories d'icônes visibles

### M2 — Animations
- [ ] gsap et split-type installés
- [ ] 16 presets d'animation fonctionnels (5 texte + 7 général + 4 continus)
- [ ] Onglet "Animer" visible dans la sidebar
- [ ] Bouton "Jouer" dans le header lance la preview
- [ ] Les animations texte utilisent un overlay HTML temporaire
- [ ] Le canvas est éditable après la preview (SplitType.revert)

### M3 — Background Removal
- [ ] @imgly/background-removal installé
- [ ] Bouton "Détourer" visible quand une image est sélectionnée
- [ ] Le détourage fonctionne et remplace l'image sur le canvas
- [ ] Un loader est affiché pendant le traitement

### M4 — Color Thief
- [ ] colorthief installé
- [ ] Palette de 5 couleurs extraite quand une image est ajoutée
- [ ] Palette affichée dans le TextPanel comme raccourcis couleur

### M5 — Undo/Redo
- [ ] Boutons Undo/Redo dans le header
- [ ] Raccourcis Ctrl+Z / Ctrl+Shift+Z fonctionnels
- [ ] Stack limité à 30 états
