# MILESTONE_03_EDITOR_PRO.md
# Éditeur Pro — Expérience créateur de contenu
*Après Milestone 02 complété — ou en parallèle si bandwidth*

---

## Objectif

Transformer l'éditeur en un outil de création qui donne envie à Judith
de l'utiliser plutôt que son téléphone. Simple, beau, rapide.

## Principe
> 30 secondes pour choisir un look. Pas 30 minutes.

## Critères de succès
- [ ] Judith peut appliquer un filtre + une police + publier en < 2 minutes
- [ ] L'éditeur ressemble à quelque chose qu'une vraie app ferait
- [ ] Les sous-titres sont lisibles et bien positionnés sur mobile
- [ ] L'export prend < 30 secondes pour une vidéo de 60 secondes

---

## Tâches

### M3.1 — Filtres vidéo (9 presets CSS)
Aucune dépendance externe. Appliqué via `filter` CSS sur `<video>`.

```js
const FILTERS = {
  normal:    'none',
  lumineux:  'brightness(1.2) contrast(1.1) saturate(1.3)',
  chaud:     'saturate(1.4) hue-rotate(-15deg) brightness(1.1)',
  froid:     'saturate(0.8) hue-rotate(15deg) brightness(1.05)',
  vintage:   'sepia(0.5) contrast(1.1) brightness(1.05)',
  noir_blanc:'grayscale(1) contrast(1.3)',
  doux:      'brightness(1.1) saturate(0.9) contrast(0.95)',
  vif:       'saturate(1.6) contrast(1.15)',
  sombre:    'brightness(0.75) contrast(1.3)',
}
```

UI : grille horizontale scrollable dans l'onglet "Trim" ou nouveau
     onglet "Style".

**Effort :** 0.5 session

### M3.2 — Google Fonts picker (30 polices curées)
API Google Fonts gratuite, pas de clé requise.

Sélection curée par catégorie :
- Bold/Impact : Montserrat Black, Bebas Neue, Anton, Black Han Sans
- Élégant : Playfair Display, Cormorant Garamond, Josefin Sans
- Moderne : DM Sans, Outfit, Plus Jakarta Sans
- Fun : Pacifico, Permanent Marker, Bangers
- Zen/Santé : Zen Kaku Gothic, Noto Serif

Chargement dynamique via FontFace API.

**Effort :** 1 session

### M3.3 — Styles de texte presets (via Konva.js)
7 presets visuels en 1 clic :

- Classic : blanc + contour noir (look TikTok)
- Neon : cyan + glow cyan
- Gold : doré + contour brun
- Shadow : blanc + ombre marquée
- Bubbly : rose + contour blanc épais
- Minimal : blanc semi-transparent
- Dark pill : fond sombre + texte blanc

**Effort :** 0.5 session

### M3.4 — Animations d'entrée/sortie
5 presets synchronisés avec la timeline :

- Fade in/out
- Slide from bottom
- Slide from left
- Bounce in
- Zoom in

Chaque overlay texte a `animIn` + `animOut` dans le store.

**Effort :** 1 session

### M3.5 — Stickers & Emojis (Twemoji)
Source : Twemoji (MIT) — SVG gratuits.

- Grille d'emojis par catégorie (sparkles, nature, santé, fire...)
- Formes basiques : rectangle, cercle, flèche
- Drag & drop sur la preview comme les textes
- Timeline : début/fin de visibilité

**Effort :** 1 session

### M3.6 — Templates quick-start
3 templates pour démarrer en 1 clic :

- Talking Head : filtre lumineux + sous-titres activés + musique calme
- Conseil Rapide : filtre vif + texte Bebas Neue + dark pill
- Éducatif : filtre normal + sous-titres TikTok + musique ambiant

**Effort :** 0.5 session

### M3.7 — Migration export WebCodecs + Mediabunny
Dette technique critique — FFmpeg.wasm trop lent sur mobile.

10-50x plus rapide via hardware acceleration.
Fallback FFmpeg.wasm pour Safari.

**Dépendances :** Aucune (crossOriginIsolated=true déjà actif)
**Effort :** 2 sessions (complexe)

---

## Ordre recommandé
1. M3.1 Filtres (impact visuel immédiat, effort minimal)
2. M3.2 Google Fonts
3. M3.3 Styles texte
4. M3.4 Animations
5. M3.5 Stickers
6. M3.6 Templates
7. M3.7 WebCodecs (séparément, complexe)

---

## Stack technique — 0$ de nouvelles dépendances

| Feature | Lib | Coût |
|---------|-----|------|
| Filtres | CSS natif | Gratuit |
| Fonts | Google Fonts API | Gratuit |
| Effets texte | Konva.js (déjà installé) | Gratuit |
| Animations | RAF + Konva | Gratuit |
| Stickers | Twemoji SVG | Gratuit (MIT) |
| Templates | JSON config | Gratuit |
