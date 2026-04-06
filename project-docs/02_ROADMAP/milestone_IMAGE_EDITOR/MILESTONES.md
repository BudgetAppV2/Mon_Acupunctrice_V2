# Plan milestones — Editeur d'images "Canva-like" integre au Hub

## Decision technique : Fabric.js v6

LidoJS (`@lidojs/design-editor`) est unpublished de npm. Cloner le repo
et adapter les imports pour Next.js 14+ serait fragile et non-maintenable.

**Fabric.js v6** est le choix :
- Package npm stable (`fabric@6`), 30K+ stars, doc complete
- Canvas-based, client-only (dynamic import ssr: false)
- API directe : IText (editable), Image.fromURL, loadFromJSON, toDataURL
- Compatible Next.js via dynamic import
- Utilise par de nombreux editeurs web en production

## Milestones

### M1 — Setup + Canvas vide (S)
**Objectif :** Page `/editeur-image` avec un canvas Fabric.js 1080x1920.

**Fichiers :**
- `npm install fabric@6`
- `app/(app)/editeur-image/page.tsx` — page avec dynamic import
- `components/features/image-editor/ImageEditorCanvas.tsx` — canvas Fabric.js
- Google Fonts Antic Slab + Mulish dans le head

**DoD :**
- [ ] `/editeur-image` charge sans erreur SSR
- [ ] Canvas 1080x1920 affiche, scale-to-fit dans le viewport
- [ ] Fonts Antic Slab et Mulish chargees
- [ ] npm run build passe

### M2 — Template La Source en Soi (M)
**Objectif :** Pre-charger le template brande avec texte editable.

**Fichiers :**
- `lib/data/imageEditorTemplates.ts` — template JSON Fabric.js
- `components/features/image-editor/ImageEditorCanvas.tsx` — charger le template

**Template :**
- Fond : rect turquoise (#7EBEC5) + formes menthe (#AAD1D2)
- Haut : "Judith Dufour Savard" (Antic Slab) + "ACUPUNCTURE" (Mulish bold)
- Centre : "TITRE DU BLOGUE" (Antic Slab, grande taille, editable)
- Bas : "GORENDEZVOUS.COM/LASOURCEENSOI" + "@LASOURCEENSOI"
- Logo : Image from URL (La Source en Soi)
- Palette : turquoise, menthe, sage, foret, charbon, creme

**DoD :**
- [ ] Template s'affiche au chargement
- [ ] "TITRE DU BLOGUE" editable au double-clic
- [ ] Objets draggables et redimensionnables
- [ ] Palette de couleurs disponible

### M3 — Sidebar UI avec onglets (L)
**Objectif :** Sidebar avec Templates, Photos, Elements, Texte.

**Fichiers :**
- `components/features/image-editor/ImageEditorLayout.tsx` — layout plein ecran
- `components/features/image-editor/Sidebar.tsx` — sidebar avec onglets
- `components/features/image-editor/panels/TemplatesPanel.tsx`
- `components/features/image-editor/panels/TextPanel.tsx`
- `components/features/image-editor/panels/ElementsPanel.tsx`
- `components/features/image-editor/panels/PhotosPanel.tsx`
- `lib/data/imageEditorElements.ts` — SVGs thematiques

**DoD :**
- [ ] Layout plein ecran : header + sidebar + canvas
- [ ] 4 onglets fonctionnels
- [ ] Templates : clic charge un template
- [ ] Texte : 3 styles ajoutables + selecteur font
- [ ] Elements : SVG ajoutables au canvas
- [ ] Photos : recherche Unsplash ou placeholder

### M4 — Export double format (S)
**Objectif :** Exporter en PNG 1080x1920 (story) + 1200x675 (blog cover).

**Fichiers :**
- Modifier le header dans ImageEditorLayout
- Logique d'export dans ImageEditorCanvas ou un hook

**DoD :**
- [ ] Bouton "Exporter" telecharge 2 PNG
- [ ] Story 1080x1920 correct
- [ ] Blog cover 1200x675 = crop centre du story
- [ ] Noms descriptifs

### M5 — Integration BlogEditor (S, bonus)
**Objectif :** Bouton dans BlogEditor pour ouvrir l'editeur d'images.

**Fichiers :**
- `components/features/blog/BlogEditor.tsx` — ajouter un bouton

**DoD :**
- [ ] Bouton "Creer l'image" dans BlogEditor
- [ ] Ouvre /editeur-image dans un nouvel onglet

## Dependances

```
M1 → M2 → M3 → M4 → M5
```

Chaque milestone depend de la precedente. M5 est optionnel.

## Estimation

| Milestone | Effort | Duree |
|-----------|--------|-------|
| M1 | S | 10 min |
| M2 | M | 20 min |
| M3 | L | 30 min |
| M4 | S | 10 min |
| M5 | S | 5 min |
