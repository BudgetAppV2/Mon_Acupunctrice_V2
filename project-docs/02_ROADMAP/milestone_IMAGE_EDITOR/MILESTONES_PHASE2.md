# Plan milestones — Editeur d'images Phase 2

## Decision technique

Phase 1 (Fabric.js v6 + sidebar + export) est complete.
Phase 2 ajoute des fonctionnalites avancees : icones Iconify, animations GSAP,
detourage IA, extraction palette, undo/redo.

## Dependances npm a installer

| Milestone | Package | Taille |
|-----------|---------|--------|
| M1 | `@iconify/react` | ~50KB (icones chargees on-demand via API) |
| M2 | `gsap`, `split-type` | ~120KB + ~8KB |
| M3 | `@imgly/background-removal` | ~2MB (+ ~40MB modele WASM telecharge au runtime) |
| M4 | `colorthief` | ~10KB |
| M5 | aucun (Fabric.js toJSON/loadFromJSON natif) | — |

## Milestones

### M1 — Icones Iconify (M)
**Objectif :** Remplacer les SVG mock par un browser de 200k+ icones.

**Fichiers :**
- `npm install @iconify/react`
- Remplacer `panels/ElementsPanel.tsx` par `panels/IconSearchPanel.tsx`
- Mettre a jour `Sidebar.tsx` pour pointer vers le nouveau panel

**Implementation :**
- Barre de recherche avec debounce 300ms vers l'API Iconify
- 6 categories par defaut : zen, nature, sante, formes, fleches, decoratif
- Chaque categorie = une recherche pre-definie (ex: "zen" → "lotus,leaf,meditation")
- Clic icone → fetch SVG path data → `new fabric.Path()` sur le canvas
- Fallback : si l'API Iconify est lente, garder quelques icones en cache local

**DoD :**
- [ ] @iconify/react installe
- [ ] IconSearchPanel avec recherche fonctionnelle
- [ ] Les icones s'ajoutent au canvas comme Path Fabric.js
- [ ] 6 categories d'icones visibles

### M2 — Animations GSAP + Panel Animer (XL)
**Objectif :** 16 presets d'animation + preview + overlay HTML pour texte.

**Fichiers :**
- `npm install gsap split-type`
- `lib/image-editor/animationPresets.ts` — 16 presets en 3 categories
- `lib/image-editor/animationEngine.ts` — moteur playback
- `components/features/image-editor/panels/AnimatePanel.tsx`
- Modifier `Sidebar.tsx` (5eme onglet)
- Modifier `ImageEditorLayout.tsx` (bouton Jouer)

**Architecture animations texte :**
1. Creer un overlay `<div>` HTML positionne par-dessus l'objet Fabric.js
2. Appliquer SplitType pour decouper en lettres/mots
3. Animer avec GSAP
4. Apres animation : SplitType.revert() + retirer overlay + restore objet Fabric

**Architecture animations generales :**
- Animer les proprietes Fabric.js directement (left, top, opacity, scaleX, scaleY, angle)
- Utiliser `gsap.to()` avec `onUpdate: () => canvas.requestRenderAll()`

**DoD :**
- [ ] gsap et split-type installes
- [ ] 16 presets (5 texte + 7 general + 4 continus)
- [ ] Onglet "Animer" dans la sidebar
- [ ] Bouton "Jouer" lance la preview
- [ ] Animations texte via overlay HTML temporaire
- [ ] Canvas editable apres preview

### M3 — Background Removal IA (S)
**Objectif :** Detourage d'image 100% client-side via WASM.

**Fichiers :**
- `npm install @imgly/background-removal`
- Modifier `ImageEditorLayout.tsx` (bouton contextuel "Detourer")

**Implementation :**
- Bouton visible seulement quand un objet FabricImage est selectionne
- `removeBackground(imageDataUrl)` → retourne image detouree
- Remplacer l'image originale sur le canvas
- Loader pendant le traitement (~5-15s premier run, ~2-5s ensuite)

**DoD :**
- [ ] @imgly/background-removal installe
- [ ] Bouton "Detourer" visible sur selection image
- [ ] Detourage fonctionne et remplace l'image
- [ ] Loader affiche pendant traitement

### M4 — Color Thief (S)
**Objectif :** Extraire une palette de 5 couleurs d'une image.

**Fichiers :**
- `npm install colorthief`
- Modifier `panels/TextPanel.tsx` (section palette extraite)
- Modifier `ImageEditorCanvas.tsx` ou `ImageEditorLayout.tsx` (extraction au ajout image)

**Implementation :**
- Quand une image est ajoutee (PhotosPanel ou import), extraire 5 couleurs
- Stocker la palette dans un state partage (prop ou context)
- Afficher dans TextPanel comme raccourcis couleur au-dessus de la palette statique

**DoD :**
- [ ] colorthief installe
- [ ] Palette extraite automatiquement a l'ajout d'image
- [ ] 5 couleurs affichees dans TextPanel

### M5 — Undo/Redo (M)
**Objectif :** Historique d'etats avec stack JSON.

**Fichiers :**
- `lib/image-editor/historyManager.ts`
- Modifier `ImageEditorLayout.tsx` (boutons + raccourcis clavier)

**Implementation :**
- `canvas.toJSON()` apres chaque `object:modified`, `object:added`, `object:removed`
- Stack de 30 etats max (shift si depasse)
- `canvas.loadFromJSON(state)` pour undo/redo
- Raccourcis Ctrl+Z / Ctrl+Shift+Z

**DoD :**
- [ ] Boutons Undo/Redo dans le header
- [ ] Raccourcis Ctrl+Z / Ctrl+Shift+Z
- [ ] Stack limite a 30

## Dependances entre milestones

```
M1 (icones) ──────────────────────────────┐
M2 (animations) ──────────────────────────┤
M3 (detourage) ───┐                       │
M4 (color thief) ─┤ (M4 depend de M3     │
                   │  pour le flow image)  │
M5 (undo/redo) ───────────────────────────┘ tous independants sauf M3→M4
```

M1, M2, M3, M5 sont independants.
M4 peut etre fait avant M3 mais le flow est plus naturel apres.

## Estimation

| Milestone | Effort | Complexite |
|-----------|--------|------------|
| M1 | M | API Iconify + conversion SVG→Path |
| M2 | XL | Overlay HTML + GSAP + SplitType + cleanup |
| M3 | S | API simple, WASM fait le travail |
| M4 | S | ColorThief API simple |
| M5 | M | toJSON/loadFromJSON + event listeners |
