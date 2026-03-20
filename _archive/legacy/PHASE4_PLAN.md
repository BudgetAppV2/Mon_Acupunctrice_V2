# Phase 4 — Éditeur Pro : Plan & Références
*Session de planning — 17 mars 2026*

---

## Vision

Transformer l'éditeur en un vrai outil de création de contenu pro, comparable à CapCut/Instagram mais adapté aux créateurs de santé/bien-être. L'objectif : Judith filme, choisit un look en 30 secondes, et publie quelque chose de professionnel.

---

## 4A — Filtres Vidéo (type Instagram)

### Approche recommandée : CSS Filters (MVP) + WebGL (v2)

**MVP — CSS Filters sur `<video>` :**
Aucune dépendance supplémentaire. Appliqué via un style inline sur l'élément vidéo.

```js
// Presets Instagram-style
const FILTERS = {
  normal:    'none',
  lumineux:  'brightness(1.2) contrast(1.1) saturate(1.3)',
  chaud:     'saturate(1.4) hue-rotate(-15deg) brightness(1.1) contrast(1.05)',
  froid:     'saturate(0.8) hue-rotate(15deg) brightness(1.05)',
  vintage:   'sepia(0.5) contrast(1.1) brightness(1.05) saturate(0.9)',
  noir_blanc:'grayscale(1) contrast(1.3)',
  doux:      'brightness(1.1) saturate(0.9) contrast(0.95)',
  vif:       'saturate(1.6) contrast(1.15)',
  sombre:    'brightness(0.75) contrast(1.3) saturate(1.1)',
}
```

UI : grille horizontale scrollable de 9 presets avec nom + miniature preview.
Le filtre CSS est appliqué au `<video>` pour le preview ET recalculé lors de l'export (canvas drawImage + CSS filter polyfill ou re-apply sur canvas 2D).

**V2 — WebGL via glfx-es6 :**
- `glfx-es6` (npm) — port ES6 de glfx.js, 1.1K downloads/semaine
- Effets additionnels : vignette, flou gaussien, sharpen, chromatic aberration
- Passe la source vidéo dans un `<canvas>` WebGL pour preview temps réel
- LUTs (Look-Up Tables) pour effets cinématographiques

**Lib alternatives :**
- `mini-gl` (GitHub xdadda) — WebGL2 léger, MIT, 2025
- `VFX-JS` (Codrops 2025) — effets WebGL sur éléments HTML

---

## 4B — Typographie Pro

### Google Fonts picker intégré

**API gratuite, pas de clé requise.**

```js
// Fetch la liste complète
const res = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIza...')
// OU utiliser la liste statique @remotion/google-fonts (1500+ fonts)
import { getAvailableFonts } from '@remotion/google-fonts'
```

**Sélection curée pour créateurs de contenu (30 fonts max dans l'UI) :**

| Catégorie | Polices | Usage |
|-----------|---------|-------|
| **Bold/Impact** | Montserrat Black, Bebas Neue, Anton, Black Han Sans | Titres, accroches |
| **Élégant** | Playfair Display, Cormorant Garamond, Josefin Sans | Contenu wellness |
| **Moderne** | DM Sans, Outfit, Plus Jakarta Sans | Clean, professionnel |
| **Fun** | Pacifico, Permanent Marker, Bangers | Stories fun |
| **Zen/Santé** | Zen Kaku Gothic, Noto Serif, Libre Baskerville | Acupuncture, bien-être |

**Chargement dynamique via FontFace API :**
```js
const font = new FontFace('Bebas Neue', 'url(https://fonts.gstatic.com/...)')
await font.load()
document.fonts.add(font)
```

**Source — top polices TikTok 2026 (Blitzcut research) :**
Montserrat Bold est le #1 utilisé par les creators. Suivi de : Anton, Bebas Neue, DM Sans Bold, Poppins Bold.

---

## 4C — Effets de Texte

### Via Konva.js (déjà installé) — sans dépendance additionnelle

**Effets disponibles natifs Konva :**

```js
// 1. Stroke/Contour (look TikTok classique)
<Text
  stroke="#000000"
  strokeWidth={2}
  fill="#FFFFFF"
/>

// 2. Ombre portée
<Text
  shadowColor="rgba(0,0,0,0.8)"
  shadowBlur={8}
  shadowOffsetX={2}
  shadowOffsetY={2}
/>

// 3. Neon glow (multiple shadows)
<Text
  shadowColor="#00FFFF"
  shadowBlur={20}
  fill="#00FFFF"
/>

// 4. Background pill (rect + text groupés)
<Group>
  <Rect fill="rgba(0,0,0,0.6)" cornerRadius={8} />
  <Text fill="#FFFFFF" />
</Group>
```

**Presets de styles à exposer dans l'UI :**
```js
const TEXT_STYLES = {
  classic:   { fill: '#fff', stroke: '#000', strokeWidth: 2 },
  neon:      { fill: '#00FFFF', shadowColor: '#00FFFF', shadowBlur: 20 },
  gold:      { fill: '#FFD700', stroke: '#8B6914', strokeWidth: 1.5 },
  shadow:    { fill: '#fff', shadowColor: 'rgba(0,0,0,0.9)', shadowBlur: 12 },
  bubbly:    { fill: '#FF69B4', stroke: '#fff', strokeWidth: 3 },
  minimal:   { fill: '#fff', opacity: 0.95 },
  dark_pill: { fill: '#fff', background: 'rgba(0,0,0,0.65)' },
}
```

**Gradient de couleur via fillLinearGradientColorStops :**
```js
<Text
  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
  fillLinearGradientEndPoint={{ x: 200, y: 0 }}
  fillLinearGradientColorStops={[0, '#FF6B6B', 0.5, '#FFE66D', 1, '#4ECDC4']}
/>
```

---

## 4D — Animations d'Entrée/Sortie

### Approche : requestAnimationFrame sur Konva Stage

Pas besoin de Framer Motion sur le canvas Konva — les animations se font manuellement via RAF pour être sync avec la timeline vidéo.

**Presets d'animation (In/Out) :**
```js
const ANIMATIONS = {
  fade_in:     { from: { opacity: 0 }, to: { opacity: 1 }, duration: 0.3 },
  slide_up:    { from: { y: +50, opacity: 0 }, to: { y: 0, opacity: 1 }, duration: 0.4 },
  slide_left:  { from: { x: -100, opacity: 0 }, to: { x: 0, opacity: 1 }, duration: 0.4 },
  bounce:      { from: { scaleX: 0, scaleY: 0 }, to: { scaleX: 1, scaleY: 1 }, easing: 'bounce' },
  zoom_in:     { from: { scaleX: 1.5, scaleY: 1.5, opacity: 0 }, to: { scaleX: 1, scaleY: 1, opacity: 1 } },
  typewriter:  { chars: true, delay: 0.05 }, // character by character
}
```

Chaque overlay texte aurait : `animIn: 'slide_up'` + `animOut: 'fade'` dans le store.

---

## 4E — Stickers & Emojis

### Système d'éléments drag-and-drop

**Sources gratuites :**
- **Twemoji** (Twitter Emojis SVG) — gratuit, MIT
- **OpenMoji** — open source, 4000+ emojis SVG
- **Shapes custom** : cercles, rectangles, lignes, flèches via Konva `<Rect>`, `<Circle>`, `<Arrow>`

**Store étendu — nouveau type d'overlay :**
```js
// useEditorStore — ajout d'un layer "stickers"
stickers: [
  {
    id: 'sticker_1',
    type: 'emoji',    // ou 'shape', 'image'
    content: '✨',    // ou URL image SVG
    x: 0.5, y: 0.3,  // ratios
    scale: 1.2,
    rotation: -15,
    startTime: 0,
    endTime: 10,
    animIn: 'bounce',
  }
],
```

**UI — panneau Stickers :**
- Grille d'emojis par catégorie (✨💫🌿🔥❤️‍🔥🎯...)
- Formes géométriques (bandeau, cercle, flèche)
- Click pour ajouter au centre du canvas, puis drag pour repositionner

---

## 4F — Templates de Contenu

### 3 templates quick-start pour Judith

```js
const TEMPLATES = {
  talking_head: {
    name: 'Talking Head',
    description: 'Toi face caméra — simple et efficace',
    filter: 'lumineux',
    textStyle: 'classic',
    subtitlesEnabled: true,
    subtitlePosition: 'bas',
    musicMood: 'calme',
  },
  conseil_rapide: {
    name: 'Conseil Rapide',
    description: '15-30 secondes, texte bold, viral',
    filter: 'vif',
    textStyle: 'dark_pill',
    titleText: 'LE SAVIEZ-VOUS?',
    titleFont: 'Bebas Neue',
    subtitlesEnabled: false,
  },
  educatif: {
    name: 'Éducatif',
    description: 'Tutoriel clair avec sous-titres',
    filter: 'normal',
    textStyle: 'minimal',
    subtitlesEnabled: true,
    subtitleStyle: 'tiktok',
    musicMood: 'ambiant',
  },
}
```

---

## 4G — Publication Programmée (Phase 3A restante)

### Cloud Scheduler Firebase

```typescript
// functions/src/schedulePublisher.ts
// Déjà déployé mais scheduler pubsub non émulé en local
// À tester directement en prod avec firebase deploy

export const schedulePublisher = onSchedule('every 15 minutes', async () => {
  const now = new Date()
  const items = await db.collection('contentItems')
    .where('status', '==', 'schedulé')
    .where('scheduledDate', '<=', now)
    .where('videoUrl', '!=', null)
    .get()

  for (const doc of items.docs) {
    const item = doc.data()
    // 1. Générer caption si absent
    // 2. Appeler publishToInstagram
    // 3. Mettre à jour status → 'publié'
  }
})
```

### Bouton "Publier maintenant" (Phase 3D)

Dans `EditorToolbar.jsx` — après export + save :
```jsx
<button onClick={handlePublishNow}>
  📤 Publier sur Instagram
</button>

// handlePublishNow:
// 1. generateCaption() → preview éditable
// 2. publishToInstagram(videoUrl, caption)
// 3. status → 'publié'
```

---

## Ordre d'implémentation Phase 4

### Sprint 1 (1 session Claude Code)
- [ ] 4G : 3A + 3D — Publication programmée + "Publier maintenant"
- [ ] Nettoyage console.log de debug

### Sprint 2 (1 session)
- [ ] 4A : Filtres vidéo CSS presets (9 filtres)
- [ ] 4B : Google Fonts picker (30 fonts curées, chargement dynamique)

### Sprint 3 (1 session)
- [ ] 4C : Styles de texte presets (7 styles Konva)
- [ ] 4D : Animations d'entrée/sortie (5 presets)

### Sprint 4 (1 session)
- [ ] 4E : Stickers/Emojis (Twemoji + shapes)
- [ ] 4F : Templates (3 templates)

### Sprint 5 (1 session — optionnel)
- [ ] 4A v2 : WebGL filters (glfx-es6) pour effets avancés
- [ ] Palette de couleurs brand Judith

---

## Stack technique résumée Phase 4

| Feature | Lib | Coût | Complexité |
|---------|-----|------|------------|
| Filtres CSS | Natif CSS | Gratuit | Faible |
| Filtres WebGL | glfx-es6 | Gratuit | Moyenne |
| Google Fonts | API Google | Gratuit | Faible |
| Effets texte | Konva.js (déjà) | Gratuit | Faible |
| Animations | RAF + Konva | Gratuit | Moyenne |
| Stickers | Twemoji SVG | Gratuit | Moyenne |
| Templates | JSON config | Gratuit | Faible |
| Publication | Firebase CF | Déjà payé | Faible |

**Total : 0$ de nouvelles dépendances pour Phase 4 complète.**

---

## Références

- [Typewolf — 40 Best Google Fonts 2026](https://www.typewolf.com/google-fonts)
- [Blitzcut — TikTok Caption Fonts 2026](https://blitzcutai.com/blog/best-caption-fonts-tiktok)
- [OpusClip — Instagram Reels Best Practices 2026](https://www.opus.pro/blog/instagram-reels-caption-subtitle-best-practices)
- [CanvaSub — Karaoke Captions Guide](https://canvasub.com/blog/karaoke-style-captions-how-to-create)
- [glfx-es6 npm](https://www.npmjs.com/package/glfx-es6)
- [mini-gl WebGL2](https://github.com/xdadda/mini-gl)
- [VFX-JS Codrops](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/)
- [Konva.js Text API](https://konvajs.org/api/Konva.Text.html)
- [Remotion Google Fonts](https://www.remotion.dev/docs/google-fonts)
- [Twemoji](https://github.com/twitter/twemoji)
- [OpenMoji](https://openmoji.org/)
