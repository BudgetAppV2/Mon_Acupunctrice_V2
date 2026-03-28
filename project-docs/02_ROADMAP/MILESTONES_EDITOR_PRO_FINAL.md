# Plan de milestones FINAL — Éditeur Pro (Mon Acupunctrice Hub V2)

**Date :** 27 mars 2026
**Branche :** `feature/editor-pro` (continuer dessus)
**Auteurs :** Benoit (product owner) + Claude.ai (architecture/stratégie)
**Implémentation :** Claude Code

---

## Vision

Transformer l'éditeur vidéo actuel en un éditeur capable de produire des Reels
visuellement professionnels, avec un système de sous-titres animés à la hauteur
de ce que font les créatrices comme Élodie Da Silva (801K followers), des templates
par style de contenu, et un système d'overlays riche.

## Principes directeurs

1. **Les sous-titres sont la priorité #1** — 90% du temps de visionnage, 85% sans le son
2. **3 templates core, pas 20** — Enseigner, Connecter/Inspirer, Aider
3. **Canvas 2D natif enrichi** — pas de grosse librairie, on contrôle tout
4. **Chaque milestone est testable visuellement** — export une vidéo, regarde-la
5. **Pipeline Mediabunny CanvasSource = contrainte non-négociable**

## Références visuelles

### Lookbook templates (ChatGPT/DALL-E — validés)
Stockés dans `project-docs/04_LOOKBOOK/` :
- `lookbook_enseigner.png` — pills structurées, sage/crème/doré
- `lookbook_connecter.png` — citation intime, rose poudré
- `lookbook_aider.png` — étapes bold, terracotta/orange
- `lookbook_inspirer.png` — phrase forte minimale, beige doré

### Référence sous-titres animés : Élodie Da Silva (@elodiedasilva)
Screen recording analysé frame par frame. Frames clés dans `project-docs/04_LOOKBOOK/frames_elodie/`.

**Observations clés du style Élodie :**
- Texte par **chunks de phrase** (2-5 mots), PAS mot par mot
- **Position variable** dans le frame — suit l'espace libre, évite le visage
- **Mots-clés sur pill rose magenta** — choix éditorial (sémantique), pas temporel
- **Font serif bold blanche, très grosse** (~45-60px sur 1080), pas d'outline noir
- **Pas de grain ni overlay** — force du rythme et du placement, pas des effets
- **Jump cuts** — le texte disparaît/réapparaît à nouvelle position à chaque cut
- **Bulle de dialogue blanche** pour les citations d'autres personnes

### 3 familles de sous-titres pro (2026)

| Famille | Description | Usage Judith |
|---------|-------------|-------------|
| **Narratif contextuel** (style Élodie) | Chunks de phrase, position variable, pills colorées sur mots-clés, bulles de citation | Enseigner, Connecter |
| **Bold highlight** (style Hormozi) | Blanc ultra bold + outline noir, 2-3 mots, mot-clé en jaune/rouge, centré | Aider (contenu action) |
| **Minimal bien-être** | Serif élégant, karaoke doux, position basse, discret et premium | Inspirer |

---

## Résumé des milestones

| ID | Nom | Type | Temps | Status |
|----|-----|------|-------|--------|
| EP-0 | Scene Graph & Animation Engine | Frontend | 6-8h | ✅ FAIT |
| EP-1 | Subtitle Engine Pro | Frontend | 10-12h | ✅ FAIT |
| EP-1b | Fix Whisper français | Backend | 2-3h | ✅ FAIT |
| EP-2 | Font System (15 Google Fonts) | Frontend | 3-4h | ✅ FAIT (via ancien plan Phase 1 — fontLoader + FontSelector + designKnowledge) |
| EP-3 | Overlay Components | Frontend | 6-8h | ✅ FAIT |
| EP-4 | Template System (3 core) | Frontend | 5-7h | ✅ FAIT |
| EP-5 | Film Effects | Frontend | 3-4h | ✅ FAIT (intégré dans sceneRenderer) |
| EP-6 | Export Integration | Integration | 4-6h | ⚠️ PARTIEL — buildExportScene existe mais pas encore branché dans exportWebCodecs.ts |
| EP-7 | UI — Template picker + preview | Frontend | 4-5h | ❌ À FAIRE |
| EP-8 | LUTs cinématiques (WebGL) | Frontend | 6-8h | ❌ À FAIRE |

### Aussi récupéré de l'ancien plan (Phase 1-2) :
| Élément | Status |
|---------|--------|
| designKnowledge.ts (338 lignes — fonts, palettes, safe zones, règles) | ✅ En place |
| fontLoader.ts (chargement on-demand Google Fonts) | ✅ En place |
| FontSelector.tsx (sélecteur par catégories avec preview) | ✅ En place |
| drawOverlays.ts enrichi (animations + effets texte) | ✅ En place |
| videoThemes.ts (8 thèmes prédéfinis) | ✅ En place |
| ThemePanel.tsx (sélecteur de thèmes) | ✅ En place |
| useCanvasPreview.ts (preview Canvas HQ) | ✅ En place |
| useUndoRedo.ts (50 snapshots) | ✅ En place |

---

## Milestone EP-0 : Foundation — Scene Graph & Animation Engine

**Type :** Frontend
**Priorité :** Critical
**Temps estimé :** 6-8h
**Dépendances :** Aucune

### Objectif
Créer l'architecture de base : un système déclaratif de scène avec des propriétés
animées sur une timeline, remplaçant les appels drawTextOverlays/drawSubtitles statiques.

### Deliverables
- [ ] Type `SceneGraph` avec layers typés (video, text, shape, subtitle, overlay, effect)
- [ ] Type `AnimatedProperty` avec valeur, durée, easing, delay
- [ ] 10 fonctions d'easing (linear, easeOut, easeIn, easeInOut, easeOutBack, easeOutBounce, easeOutElastic, spring, snap, smooth)
- [ ] `renderScene(ctx, scene, time, w, h)` — traverse le graph, dessine chaque layer
- [ ] `resolveAnimation(prop, time)` — retourne la valeur interpolée à `t`

### Approche technique
```typescript
interface SceneLayer {
  type: 'video' | 'text' | 'shape' | 'subtitle' | 'overlay' | 'effect';
  startTime: number;
  endTime: number;
  zIndex: number;
  position: { x: number; y: number }; // ratio 0-1
  animations: Animation[];
}

interface Animation {
  property: 'opacity' | 'x' | 'y' | 'scale' | 'rotation' | 'blur';
  from: number;
  to: number;
  startTime: number;  // relatif au layer
  duration: number;
  easing: EasingType;
}
```

### Definition of Done
- [ ] `renderScene()` dessine correctement tous les types de layers
- [ ] Animations frame-par-frame (compatible seek-based export Mediabunny)
- [ ] Export vidéo 5s avec 1 layer texte animé → MP4 valide
- [ ] Types stricts, pas de `any`

### Fichiers
```
📄 NEW:
- lib/editor/sceneGraph.ts
- lib/editor/animationEngine.ts
- lib/editor/sceneRenderer.ts

✏️ MODIFY:
- lib/utils/exportWebCodecs.ts (intégration renderScene)
```

---

## Milestone EP-1 : Subtitle Engine Pro

**Type :** Frontend
**Priorité :** Critical
**Temps estimé :** 10-12h
**Dépendances :** EP-0

### Objectif
Remplacer drawSubtitles (3 styles statiques) par un moteur de sous-titres animés
avec 3 familles de styles, des segments typés, et un positionnement variable.

### La grande différence avec le plan précédent
Basé sur l'analyse d'Élodie Da Silva, le subtitle engine ne doit PAS être
uniquement du "karaoke mot par mot". Il doit supporter :

1. **Segments typés** — chaque segment a un `displayType` :
   - `narration` : texte blanc bold, affiché par chunk de phrase
   - `highlight` : mot-clé sur pill colorée (choix éditorial)
   - `citation` : bulle blanche avec texte noir
   - `karaoke` : mot actif change de couleur (style classique)

2. **Position par segment** — pas une position globale :
   - `top-left`, `top-center`, `top-right`
   - `center-left`, `center`, `center-right`
   - `bottom-left`, `bottom-center`, `bottom-right`
   - La position peut changer entre les segments

3. **Pills colorées sur mots spécifiques** :
   - Un mot dans un segment peut être marqué comme `highlighted`
   - Il reçoit un fond coloré (configurable : magenta, doré, terracotta, etc.)
   - C'est un choix éditorial, pas automatique

### Deliverables

- [ ] Type `SubtitleSegmentPro` étendant l'existant :
```typescript
interface SubtitleSegmentPro extends SubtitleSegment {
  displayType: 'narration' | 'highlight' | 'citation' | 'karaoke';
  position: SubtitlePosition;
  highlightedWords?: { wordIndex: number; color: string }[];
  fontFamily?: string;
  fontSize?: number; // en ratio, pas en px
  animation?: 'fade' | 'slide-left' | 'slide-up' | 'pop' | 'none';
}
```

- [ ] **Famille 1 — Narratif contextuel (style Élodie)** :
  - Texte par chunks de phrase (utilise le segment text, pas les mots individuels)
  - Font bold blanche, grande, sans outline
  - Position variable par segment
  - Mots-clés sur pill colorée (fond arrondi semi-transparent)
  - Bulle de citation blanche pour `displayType: 'citation'`
  - Animation d'entrée : fade ou slide-left (0.2s)
  - Animation de sortie : fade-out rapide (0.15s)

- [ ] **Famille 2 — Bold highlight (style Hormozi)** :
  - Texte blanc ultra bold avec outline noir épaisse (strokeText + fillText)
  - 2-3 mots à la fois, centrés
  - UN mot-clé en couleur accent (jaune ou configurable)
  - Position fixe center
  - Animation : scale-pop (0→1.1→1) sur chaque chunk

- [ ] **Famille 3 — Minimal bien-être** :
  - Texte serif ou sans-serif élégant, blanc, pas d'outline
  - Karaoke doux : mot actif change de couleur subtilement (pas de scale)
  - Position fixe bottom-center
  - Animation : fade douce (0.3s)
  - Pill semi-transparent optionnelle derrière la ligne entière

- [ ] Sélecteur de famille + style dans le UI de l'éditeur
- [ ] Preview en temps réel des sous-titres dans le player

### Approche technique pour le timing
Le moteur utilise les `SubtitleWord` existants (timing Whisper mot par mot).
Pour les styles "chunk de phrase" (Élodie), on affiche le segment.text complet
pendant toute la durée du segment, avec animation d'entrée au segment.startTime.
Pour les styles "karaoke", on anime par mot en utilisant word.start/word.end.

### UI pour Judith
Judith NE DOIT PAS avoir besoin de configurer la position de chaque segment
manuellement. Le système propose :
1. Choisir une famille de sous-titres (3 boutons)
2. Le système place automatiquement (bottom-center par défaut)
3. Option avancée : taper sur un segment dans la timeline pour changer sa position
4. Option avancée : marquer un mot comme "highlight" (long press sur un mot)

### Definition of Done
- [ ] Les 3 familles rendues correctement dans le preview ET l'export
- [ ] Le timing mot par mot (Whisper) est utilisé pour le karaoke
- [ ] Les chunks de phrase fonctionnent pour le style narratif
- [ ] Les pills colorées sur mots spécifiques fonctionnent
- [ ] La bulle de citation fonctionne
- [ ] Export vidéo avec sous-titres animés → visuellement pro

### Fichiers
```
📄 NEW:
- lib/editor/subtitleEngine.ts (moteur principal)
- lib/editor/subtitleStyles/narratif.ts
- lib/editor/subtitleStyles/boldHighlight.ts
- lib/editor/subtitleStyles/minimalWellness.ts
- lib/editor/subtitleStyles/citationBubble.ts

✏️ MODIFY:
- lib/types/editor.ts (SubtitleSegmentPro, SubtitlePosition, etc.)
- lib/utils/drawSubtitles.ts (remplacer par appel au nouveau moteur)
- components/editor/SubtitlePanel.tsx (nouveau sélecteur)

🔄 REFACTOR:
- lib/types/editor.ts (SubtitleStyle union → SubtitleFamily + SubtitleDisplayType)
```

---

## Milestone EP-1b : Fix Whisper français (apostrophes)

**Type :** Backend
**Priorité :** High
**Temps estimé :** 2-3h
**Dépendances :** Aucune (parallèle à EP-0)

### Objectif
Corriger le prompt Whisper qui produit des fautes de français, notamment
l'omission des apostrophes ("l acupuncture" → "l'acupuncture").

### Deliverables
- [ ] Améliorer le prompt de transcription Whisper avec instructions françaises explicites
- [ ] Post-processing regex pour corriger les patterns connus :
  - `l ` → `l'` (devant voyelle)
  - `d ` → `d'` (devant voyelle)
  - `s ` → `s'` (devant voyelle, contexte réflexif)
  - `n ` → `n'` (négation)
  - `j ` → `j'` (devant voyelle)
  - `qu ` → `qu'` (devant voyelle)
  - `c est` → `c'est`
  - `jusqu ` → `jusqu'`
- [ ] Tests avec 5 phrases types de Judith

### Fichiers
```
✏️ MODIFY:
- Le fichier qui appelle l'API Whisper (identifier dans le codebase)
- Ajouter lib/utils/frenchPostProcess.ts (regex corrections)
```

---

## Milestone EP-2 : Font System — 15 Google Fonts

**Type :** Frontend
**Priorité :** High
**Temps estimé :** 3-4h
**Dépendances :** Aucune (parallèle)

### Objectif
Charger 15 Google Fonts et offrir un sélecteur avec preview.

### Deliverables
- [ ] 15 fonts via `@font-face` + `document.fonts.load()` :
  - **Serif :** Playfair Display, Cormorant Garamond, Libre Baskerville, DM Serif Display, Lora
  - **Sans-serif :** Montserrat, Poppins, Inter (déjà là), Raleway, Work Sans
  - **Display :** Bebas Neue, Oswald, Anton
  - **Script :** Dancing Script, Caveat
- [ ] Sélecteur avec preview dans TextPanel
- [ ] `ensureFontLoaded(fontFamily)` — attend le chargement avant render
- [ ] Chargement on-demand

### Fichiers
```
📄 NEW:
- lib/editor/fontSystem.ts

✏️ MODIFY:
- components/editor/TextPanel.tsx
- app/layout.tsx ou globals.css
```

---

## Milestone EP-3 : Overlay Components

**Type :** Frontend
**Priorité :** High
**Temps estimé :** 6-8h
**Dépendances :** EP-0

### Objectif
Composants overlay réutilisables identifiés dans le lookbook.

### Deliverables
- [ ] `PillOverlay` — bloc arrondi semi-transparent + texte
- [ ] `NumberedStep` — cercle numéroté + texte + sous-texte (style Aider)
- [ ] `QuoteBlock` — guillemets + texte serif italic (style Connecter)
- [ ] `BrandingBar` — bandeau "MON ACUPUNCTRICE" avec letterspacing
- [ ] `AccentLine` — ligne décorative horizontale
- [ ] `CTAButton` — bouton arrondi bas d'écran
- [ ] Tous compatibles SceneGraph + animations EP-0

### Fichiers
```
📄 NEW:
- lib/editor/overlays/pillOverlay.ts
- lib/editor/overlays/numberedStep.ts
- lib/editor/overlays/quoteBlock.ts
- lib/editor/overlays/brandingBar.ts
- lib/editor/overlays/accentLine.ts
- lib/editor/overlays/ctaButton.ts
- lib/editor/overlays/index.ts
```

---

## Milestone EP-4 : Template System — 3 templates core

**Type :** Frontend
**Priorité :** High
**Temps estimé :** 5-7h
**Dépendances :** EP-1, EP-2, EP-3

### Objectif
3 templates pré-configurés combinant overlays + sous-titres + thème.

### Deliverables
- [ ] Template **Enseigner** : sage/crème/doré, Playfair+Inter, pills numérotées, sous-titres narratif
- [ ] Template **Connecter** (+ variante Inspirer) : rose/beige, Libre Baskerville+Inter, citation pill, sous-titres minimal
- [ ] Template **Aider** : terracotta/vert, Montserrat+Inter, étapes bold, sous-titres bold highlight
- [ ] `applyTemplate(template, contentData)` → SceneGraph complet
- [ ] Placeholders remplaçables

### Fichiers
```
📄 NEW:
- lib/editor/templates/enseigner.ts
- lib/editor/templates/connecter.ts
- lib/editor/templates/aider.ts
- lib/editor/templates/index.ts
- lib/editor/themes.ts
```

---

## Milestone EP-5 : Film Effects

**Type :** Frontend
**Priorité :** Medium
**Temps estimé :** 3-4h
**Dépendances :** EP-0

### Deliverables
- [ ] `filmGrain` — particules aléatoires (intensité configurable)
- [ ] `gradientOverlay` — gradient haut/bas
- [ ] `vignette` — assombrissement radial
- [ ] `warmFilter` — teinte chaude via compositing
- [ ] Tous comme SceneLayer type `effect`

### Fichiers
```
📄 NEW:
- lib/editor/effects/filmGrain.ts
- lib/editor/effects/gradientOverlay.ts
- lib/editor/effects/vignette.ts
- lib/editor/effects/warmFilter.ts
- lib/editor/effects/index.ts
```

---

## Milestone EP-6 : Export Integration

**Type :** Integration
**Priorité :** Critical
**Temps estimé :** 4-6h
**Dépendances :** EP-0, EP-1

### Deliverables
- [ ] `buildExportScene()` — construit le SceneGraph pour l'export
- [ ] Remplacement de drawTextOverlays/drawSubtitles par renderScene
- [ ] Bitrate : 3.5 → 8 Mbps
- [ ] Keyframe interval : 1s → 2s
- [ ] Backward compatible (sans template = rendu actuel)
- [ ] Fonctionne sur Safari iOS

### Fichiers
```
📄 NEW:
- lib/editor/buildExportScene.ts

✏️ MODIFY:
- lib/utils/exportWebCodecs.ts
```

---

## Milestone EP-7 : UI — Template picker + preview

**Type :** Frontend
**Priorité :** High
**Temps estimé :** 4-5h
**Dépendances :** EP-4

### Deliverables
- [ ] `TemplatePicker` — grille de 3 cards avec thumbnail
- [ ] Panel de personnalisation (titre, points, citation, CTA)
- [ ] Preview temps réel (renderScene dans le canvas)
- [ ] Bouton "Appliquer" / "Retirer template"
- [ ] Fonctionne sur mobile (iPhone de Judith)

### Fichiers
```
📄 NEW:
- components/editor/TemplatePicker.tsx
- components/editor/TemplateCustomizer.tsx

✏️ MODIFY:
- components/editor/EditorPage.tsx
- components/editor/VideoPreview.tsx
```

---

## Ordre d'exécution

```
SEMAINE 1 :
  EP-0 (Foundation)              ← COMMENCER ICI
  EP-1b (Fix Whisper)            ← EN PARALLÈLE
  EP-2 (Fonts)                   ← EN PARALLÈLE

SEMAINE 2 :
  EP-1 (Subtitle Engine Pro)     ← PRIORITÉ ABSOLUE
  EP-6 (Export integration)      ← Dès que EP-0+EP-1 sont faits

  → PREMIER LIVRABLE VISIBLE : sous-titres pro dans l'export ←

SEMAINE 3 :
  EP-3 (Overlays)
  EP-5 (Film effects)

SEMAINE 4 :
  EP-4 (Templates)
  EP-7 (UI)

  → LIVRABLE COMPLET : éditeur pro avec templates ←
```

---

## Notes pour Claude Code

### Ce qui existe déjà (branche feature/editor-pro)
- Agent DA dans `skills/directeur-artistique/SKILL.md` — garder comme référence
- `designKnowledge.ts` et `videoThemes.ts` — garder, fusionner dans le nouveau système
- Recherche complétée dans `project-docs/03_RESEARCH/` (10 thèmes)
- Architecture doc dans `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md`
- Le plan original (4 phases, 28 prompts) est remplacé par CE document

### Références visuelles obligatoires
- Regarder les images dans `project-docs/04_LOOKBOOK/` AVANT de coder
- Les frames d'Élodie dans `project-docs/04_LOOKBOOK/frames_elodie/` montrent le style cible pour les sous-titres

### Contraintes techniques
- Pipeline Mediabunny CanvasSource = sortie finale non-négociable
- Tout doit être dessinable sur un Canvas 2D
- Les SubtitleWord avec timing mot par mot (Whisper) sont déjà en place
- Compatible Safari iOS (iPhone 12 de Judith)
- Tester chaque milestone en exportant une vidéo et en la regardant sur un téléphone
- 0 console.log, composants < 150 lignes, TypeScript strict

### Palettes validées (du lookbook)
```
Enseigner : #8A9A8A (sage), #3E5F4E (forêt), #F5F1E8 (crème), #C6A769 (doré)
Connecter : #E8CFCF (rose), #F5E6E0 (beige), #6B4F4F (brun), #FAF9F6 (blanc cassé)
Aider     : #C47A5A (terracotta), #3E5F4E (vert), #FF6B35 (orange), #FFFFFF
Inspirer  : #C6A769 (doré), #FAF9F6 (crème), #2F2F2F (noir doux)
Highlight : #E91E8C (magenta, style Élodie) — configurable par l'utilisatrice
```

### Fonts validées (pairings)
```
Enseigner : Playfair Display (titre) + Inter (corps)
Connecter : Libre Baskerville (titre) + Inter (corps)
Aider     : Montserrat (titre, bold) + Inter (corps)
Inspirer  : Cormorant Garamond (titre) + Inter (corps)
```

---

## Milestone EP-8 : LUTs cinématiques (WebGL)

**Type :** Frontend
**Priorité :** Medium
**Temps estimé :** 6-8h
**Dépendances :** EP-6 (export integration complété)

### Objectif
Ajouter des LUTs cinématiques (color grading) pour donner un look film
professionnel aux vidéos de Judith. Les LUTs transforment les couleurs
de la vidéo source pour créer des ambiances spécifiques (warm cinema,
cold teal, vintage, etc.) — c'est ce qui différencie visuellement une
vidéo iPhone brute d'un contenu color-gradé pro.

### Recherche validée (EDITOR_PRO_RESEARCH.md)
- `glfx.js` (~20KB, MIT) — filtres WebGL rapides, fonctionne sur Safari iOS
- `webgl-lut-filter` (npm, MIT) — applique des LUTs 3D via WebGL
- Safari iOS supporte WebGL 2.0 depuis iOS 15+
- Les fichiers `.cube` sont le format standard pour les LUTs 3D

### Deliverables
- [ ] Parser de fichiers `.cube` (`lib/editor/lutParser.ts`)
  - Parse les fichiers LUT 3D au format .cube (standard industrie)
  - Convertit en texture 3D utilisable par WebGL
- [ ] Renderer WebGL pour les LUTs (`lib/editor/lutRenderer.ts`)
  - Prend un canvas 2D frame, applique la LUT via WebGL, retourne le résultat
  - Utilise `glfx.js` ou implémentation WebGL custom (shader GLSL)
  - Fallback : si WebGL non disponible, applique une approximation CSS
- [ ] 6-8 LUTs pré-packagées (`lib/data/luts/`)  :
  - `warm-cinema.cube` — tons chauds dorés (idéal pour Enseigner/Inspirer)
  - `soft-wellness.cube` — tons doux désaturés (idéal pour bien-être)
  - `cold-teal.cube` — teintes bleu-vert (contenu plus sérieux/médical)
  - `vintage-film.cube` — aspect film pellicule (Connecter nostalgique)
  - `bright-clean.cube` — couleurs vives nettoyées (Aider dynamique)
  - `golden-hour.cube` — lumière dorée fin de journée
- [ ] Intégration dans le SceneGraph comme `EffectLayer` type `lut`
- [ ] Sélecteur de LUT dans le UI (thumbnail preview de chaque LUT)
- [ ] Intégration dans le pipeline d'export (appliqué sur chaque frame)

### Approche technique
Le LUT est appliqué comme étape dans le pipeline de rendering :
```
video frame → drawImage sur canvas 2D → [LUT via WebGL] → overlays/sous-titres → encode
```

L'application WebGL se fait sur un canvas WebGL séparé :
1. Copier la frame du canvas 2D vers une texture WebGL
2. Appliquer le shader LUT (lookup dans la texture 3D)
3. Copier le résultat vers le canvas 2D principal
4. Continuer avec les overlays et sous-titres

Cette approche garde le pipeline Canvas 2D intact — le WebGL est
utilisé uniquement pour le color grading, pas pour le rendering général.

### Contraintes
- Doit fonctionner sur Safari iOS (WebGL 2.0)
- Le pipeline frame-by-frame seek-based doit rester intact
- Les LUTs doivent être légères (< 500KB chacune)
- Ne pas dégrader significativement les performances d'export
- Les fichiers .cube peuvent être trouvés gratuitement (Creative Commons)
  ou générés via DaVinci Resolve / Photoshop

### Definition of Done
- [ ] Le parser .cube fonctionne avec les fichiers standard
- [ ] Au moins 6 LUTs pré-packagées avec des noms descriptifs
- [ ] Le sélecteur montre une preview de chaque LUT (thumbnail)
- [ ] L'export vidéo avec LUT appliquée → vidéo color-gradée visuellement pro
- [ ] Fonctionne sur Safari iOS
- [ ] Fallback gracieux si WebGL non disponible

### Fichiers
```
📄 NEW:
- lib/editor/lutParser.ts (parser .cube)
- lib/editor/lutRenderer.ts (application WebGL)
- lib/data/luts/ (dossier avec 6-8 fichiers .cube)
- components/editor/panels/LutPanel.tsx (sélecteur UI)

✏️ MODIFY:
- lib/editor/sceneRenderer.ts (ajouter le support EffectLayer type 'lut')
- lib/editor/sceneGraph.ts (ajouter 'lut' aux types d'effets)
- lib/utils/exportWebCodecs.ts (intégrer le LUT dans la boucle de frames)
```
