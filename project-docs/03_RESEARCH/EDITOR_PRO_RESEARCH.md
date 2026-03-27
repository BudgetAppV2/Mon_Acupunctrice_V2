# Recherche — Editeur video pro pour Mon Acupunctrice Hub

Date : 26 mars 2026

---

## Theme 1 — Fonts et typographie stylisee

### Resume
Canvas 2D supporte nativement `fillText()`, `strokeText()`, les ombres (`shadowColor/Blur/Offset`), et les gradients (`createLinearGradient`). On peut creer des contours en appelant `strokeText()` avec un `lineWidth` epais AVANT `fillText()`. Les fonts doivent etre chargees via `document.fonts.load()` ou `@font-face` avant le rendu Canvas.

### Fonts les plus populaires pour les Reels/TikTok
1. **Montserrat** (Google Font) — propre, moderne, tres lisible
2. **Poppins** — geometrique, populaire sur IG
3. **Bebas Neue** — bold condensee, parfait pour les titres
4. **Playfair Display** — serif elegant, style editorial
5. **Dancing Script** — cursive manuscrite
6. **Lobster** — display fun et arrondi
7. **Oswald** — condensee bold, style magazine
8. **Raleway** — thin elegant, style chic
9. **Permanent Marker** — manuscrit marker, style authentique
10. **Pacifico** — script casual, style plage/relaxe
11. **Abril Fatface** — serif display, titres impactants
12. **Inter** — UI clean (deja dans le projet)
13. **Space Grotesk** — geometrique moderne
14. **DM Serif Display** — serif elegant, bien pour sante/bien-etre
15. **Caveat** — manuscrit naturel, authentique

### Librairies
- **Google Fonts API** — gratuit, CDN rapide, toutes les fonts ci-dessus. Licence : OFL.
- **opentype.js** — 150KB, parse les fichiers de font, acces aux glyphes individuels. Utile pour les effets avances (path text, letter spacing custom). Licence : MIT.
- **Canvas API native** — `ctx.font`, `ctx.fillText`, `ctx.strokeText`, `ctx.shadowColor/Blur`. Aucune dependance.

### Recommandation
Charger 15-20 fonts Google Fonts via `@font-face` + `document.fonts.load()`. Utiliser Canvas 2D natif pour le rendu (strokeText pour les contours, shadow* pour les ombres). Pas besoin d'opentype.js pour l'instant — Canvas 2D suffit pour les effets de Judith.

### Effort : Simple | Impact : Eleve (variete visuelle immediate)

---

## Theme 2 — Effets visuels et filtres

### Resume
Les filtres CSS (`filter: brightness() contrast() saturate()`) fonctionnent sur Canvas via `ctx.filter`. Pour les LUTs cinematiques et les effets avances (grain, vignette, glow), il faut WebGL. Safari iOS supporte WebGL 1.0 (iOS 8+) et WebGL 2.0 (iOS 15+).

### Librairies
- **glfx.js** — ~20KB, filtres WebGL rapides (brightness, contrast, curves, vignette, denoise). Licence : MIT. Fonctionne sur Safari iOS.
- **WebGLImageFilter** — ~15KB, pipeline de filtres chainables. Licence : MIT.
- **webgl-lut-filter** — npm, applique des LUTs 3D sur des images/video via WebGL. Licence : MIT.
- **CSS `filter`** — 0KB, deja dans le projet. Limite a brightness/contrast/saturate/blur/hue-rotate.

### Recommandation
Phase 1 : Enrichir les filtres CSS actuels avec plus de presets (cinema warm, cinema cold, vintage, noir & blanc, soft light). Phase 2 : Migrer vers WebGL pour les LUTs cinematiques et le grain/vignette. `glfx.js` ou `WebGLImageFilter` sont les meilleurs candidats.

### Effort : Moyen (CSS = simple, WebGL = moyen) | Impact : Moyen

---

## Theme 3 — Transitions entre clips

### Resume
Les transitions Canvas 2D se font en blendant les frames de deux clips pendant la duree de la transition. Pour un dissolve : dessiner frame A avec opacity decroissante et frame B avec opacity croissante. Pour un slide : dessiner les deux frames avec un offset horizontal. Pour un zoom : dessiner frame A avec un scale croissant et frame B par-dessus.

### Implementation dans le seek-based export
```
Pour chaque frame de transition (ex: 15 frames = 0.5s) :
  - Calculer le ratio t = frameIndex / totalTransitionFrames (0→1)
  - Lire frame du clip A (derniere portion)
  - Lire frame du clip B (premiere portion)
  - Blender sur le canvas selon le type de transition
  - Encoder la frame blendee
```

### Types realisables en Canvas 2D
1. **Dissolve/fade** — `globalAlpha` sur les deux draws. Simple.
2. **Slide left/right** — `drawImage` avec offset X. Simple.
3. **Wipe** — clip path rectangulaire qui progresse. Moyen.
4. **Zoom** — `drawImage` avec scale progressif. Simple.
5. **Blur** — `ctx.filter = blur(${t * 10}px)` sur le clip sortant. Simple.

### Librairies
- **Aucune necessaire** — Canvas 2D natif suffit pour les 5 transitions de base.
- **gl-transitions** — 100+ transitions WebGL (shaders GLSL). Impressionnant mais overkill et necessite WebGL.

### Recommandation
Implementer 5 transitions de base en Canvas 2D pur. C'est suffisant pour des Reels. Les transitions avancees (morph, particles) viendraient plus tard avec WebGL.

### Effort : Moyen | Impact : Eleve (pro look entre les clips)

---

## Theme 4 — Templates et presets

### Resume
CapCut stocke ses projets dans un `draft_content.json` qui contient la timeline, les clips, les effets, les textes et les transitions. Ce format est proprietaire et non-documente. Pour notre cas, un format JSON custom est la meilleure approche.

### Schema recommande pour un template
```json
{
  "id": "template_enseigner_3points",
  "name": "3 Points Cles",
  "style": "enseigner",
  "duration": 30,
  "clips": [{ "placeholder": true, "duration": 30 }],
  "overlays": [
    { "type": "title", "text": "[TITRE]", "startTime": 0, "endTime": 3, "style": "bold_center", "animation": "slide_up" },
    { "type": "point", "text": "[POINT 1]", "startTime": 4, "endTime": 10, "style": "pill_left", "animation": "fade" },
    { "type": "point", "text": "[POINT 2]", "startTime": 11, "endTime": 17, "style": "pill_left", "animation": "fade" },
    { "type": "point", "text": "[POINT 3]", "startTime": 18, "endTime": 24, "style": "pill_left", "animation": "fade" },
    { "type": "cta", "text": "Enregistre pour plus tard", "startTime": 25, "endTime": 30, "style": "cta_bottom", "animation": "bounce" }
  ]
}
```

### Recommandation
Creer 8-12 templates couvrant les 4 styles (2-3 par style). Stocker comme fichiers statiques dans `lib/data/videoTemplates.ts`. L'utilisatrice choisit un template, la timeline se pre-remplit, elle remplace les placeholders par son contenu.

### Effort : Moyen | Impact : Tres eleve (structure immediatement)

---

## Theme 5 — Animations de texte

### Resume
Dans un export seek-based, les animations sont calculees mathematiquement pour chaque frame. Le temps `t` de l'animation est derive de `(currentTime - overlay.startTime) / animationDuration`. Une fonction d'easing transforme `t` en une courbe (ease-in, ease-out, bounce, elastic).

### Animations realisables en Canvas 2D
1. **Fade in/out** — `globalAlpha = t`. Deja implemente.
2. **Slide up/down/left/right** — `translateY = (1-t) * offset`. Deja implemente (slide_up, slide_left).
3. **Bounce** — easing bounce sur le scale. Deja implemente.
4. **Typewriter** — afficher `text.slice(0, Math.floor(t * text.length))`. Nouveau.
5. **Word-by-word** — afficher un mot a la fois. Nouveau.
6. **Scale pop** — scale de 0 a 1 avec overshoot. Nouveau.
7. **Rotate in** — rotation de -90deg a 0. Nouveau.
8. **Blur in** — `ctx.filter = blur(${(1-t)*10}px)`. Nouveau.
9. **Glitch** — decalage RGB rapide. Avance.
10. **Wave** — chaque lettre a un offset vertical sinusoidal. Avance.

### Fonctions d'easing (sans librairie)
```typescript
const ease = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  bounce: (t: number) => { /* ... math formule standard */ },
  elastic: (t: number) => Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
};
```

### Recommandation
Ajouter 5-6 nouvelles animations (typewriter, word-by-word, scale pop, rotate, blur in) au systeme existant. Pas besoin de GSAP/anime.js — les fonctions d'easing sont 10 lignes de math chacune.

### Effort : Simple | Impact : Eleve

---

## Theme 6 — Qualite d'export et codec

### Resume
Instagram re-encode TOUTES les videos uploadees. Le codec optimal pour minimiser la perte de double-encodage est H.264 High Profile avec un bitrate genereux.

### Parametres optimaux par plateforme
| Parametre | Instagram Reels | YouTube Shorts | Facebook Reels |
|-----------|----------------|----------------|----------------|
| Codec | H.264 High | H.264 High | H.264 High |
| Resolution | 1080x1920 | 1080x1920 | 1080x1920 |
| Bitrate | 6-12 Mbps | 10-15 Mbps | 6-12 Mbps |
| FPS | 30 | 30 | 30 |
| Keyframe | Toutes les 2s | Toutes les 2s | Toutes les 2s |
| Audio | AAC 128kbps | AAC 192kbps | AAC 128kbps |
| Color | BT.709 | BT.709 | BT.709 |

### WebCodecs support
- H.264 : supporte sur tous les navigateurs
- H.265/HEVC : supporte sur Safari (hardware), Chrome (partial)
- VP9/AV1 : supporte sur Chrome, PAS Safari iOS
- **Verdict :** H.264 est le seul codec universellement compatible ET accepte par toutes les plateformes

### Recommandation
Augmenter le bitrate de 3.5 Mbps a 6-8 Mbps (actuellement trop bas — Instagram re-encode et ca degrade). Ajouter le keyframe interval a 2s (actuellement 1s = trop de keyframes, taille fichier inutilement grande).

### Effort : Simple (changement de 2 constantes) | Impact : Moyen (meilleure qualite apres re-encodage IG)

---

## Theme 7 — Server-side rendering

### Resume
Remotion (React → video) est le leader pour le rendering cote serveur. Il peut tourner sur AWS Lambda (Remotion Lambda) pour ~$0.001 par video de 30s. Firebase Cloud Run est aussi une option pour FFmpeg serveur.

### Options
| Solution | Cout/video | Latence | Effort integration |
|----------|-----------|---------|-------------------|
| **Client WebCodecs (actuel)** | $0 | 15-45s | Deja en place |
| **Remotion Lambda** | ~$0.01 | 5-15s | Complexe (AWS) |
| **Cloud Run + FFmpeg** | ~$0.005 | 10-30s | Moyen |
| **Shotstack API** | ~$0.05 | 15-60s | Simple (API) |
| **Creatomate API** | ~$0.10 | 10-30s | Simple (API) |

### Recommandation
Garder le client-side WebCodecs comme pipeline principal (gratuit, rapide). Ajouter un fallback Cloud Run + FFmpeg pour les gros fichiers (> 2 min) qui echouent cote client. Remotion est overkill pour notre cas — on n'a pas besoin de React pour le rendu.

### Effort : Moyen | Impact : Faible (le client-side fonctionne bien)

---

## Theme 8 — Stickers et overlays graphiques

### Resume
Lottie (Airbnb) peut etre rendu frame-par-frame dans un Canvas 2D via `goToAndStop(frame)`. La librairie `lottie-web` (250KB) supporte le renderer Canvas 2D. Pour l'export seek-based, on appelle `anim.goToAndStop(frameNumber, true)` puis on dessine le canvas du lottie sur le canvas d'export.

### Librairies
- **lottie-web** — 250KB, Canvas 2D renderer, frame-par-frame. Licence : Apache 2.0. Compatible Safari iOS.
- **LottieFiles** — marketplace de 100K+ animations gratuites/payantes. Categories : reactions, health, wellness, social.
- **Rive** — alternative a Lottie, plus petit (150KB), animations interactives. Canvas 2D renderer.

### Recommandation
Integrer `lottie-web` pour les stickers animes. Utiliser LottieFiles pour une bibliotheque de stickers. Les stickers "sante/bien-etre" de LottieFiles correspondent parfaitement au contenu de Judith.

### Effort : Moyen | Impact : Moyen

---

## Theme 9 — Audio avance

### Resume
Web Audio API supporte nativement le DynamicsCompressorNode (normalisation volume), GainNode (volume), et l'analyse de frequences (AnalyserNode). L'audio ducking peut etre implemente en detectant la voix via VAD (Voice Activity Detection) puis en baissant le GainNode de la musique.

### Librairies
- **Silero VAD (@ricky0123/vad)** — detection de voix en temps reel, modele ONNX, 1.5MB. Licence : MIT.
- **Web Audio API native** — DynamicsCompressorNode, GainNode, BiquadFilterNode (EQ). 0KB.

### Implementation audio ducking
1. Analyser la piste voix avec VAD : detecter les segments speech/silence
2. Pendant les segments speech : `musicGain.gain.value = 0.15`
3. Pendant les segments silence : `musicGain.gain.value = 0.3`
4. Appliquer un smooth ramp (200ms) pour eviter les "cuts" brusques

### Recommandation
Phase 1 : DynamicsCompressor pour normaliser le volume de la voix (2 lignes de code Web Audio). Phase 2 : Audio ducking automatique avec Silero VAD.

### Effort : Simple (compressor) / Complexe (ducking) | Impact : Moyen

---

## Theme 10 — Sous-titres avances

### Resume
CapCut offre 7+ styles de sous-titres : Glow, Trending, Word, Frame, Aesthetic, Monoline, Multiline. Le style le plus populaire est le "karaoke" (mot actif en surbrillance). Notre implementation actuelle a 3 styles (classic, tiktok, karaoke) mais le rendu est basique.

### Styles a implementer
1. **Karaoke highlight** — le mot actif a une couleur differente (deja en place, a ameliorer)
2. **Word pop** — chaque mot apparait avec un petit scale-up
3. **Background pill** — chaque ligne a un fond arrondi colore
4. **Glow** — texte avec shadow blur intense (neon effect)
5. **Outline bold** — contour epais noir avec fill blanc (tres lisible)
6. **Animated reveal** — les mots apparaissent de gauche a droite

### Parametres optimaux pour mobile 9:16
- 2-4 mots par ligne maximum
- Position : 85% du bas (au-dessus de la zone Instagram)
- Font size : 42-48px sur 1080x1920
- Font weight : 700+ (bold pour lisibilite)

### Recommandation
Ameliorer le drawSubtitles existant avec 3 nouveaux styles (background pill, outline bold, glow). Ajouter le word-pop animation. Notre groupeur actuel (4 mots par segment) est correct.

### Effort : Simple | Impact : Eleve

---

## Roadmap recommandee (impact/effort)

### Quick wins (1-2 prompts Claude Code)
1. **Fonts enrichies** — Ajouter 15 Google Fonts populaires + selecteur dans TextPanel
2. **Bitrate optimise** — 3.5→8 Mbps + keyframe 2s (2 constantes)
3. **Animations de texte** — 5 nouvelles animations (typewriter, pop, rotate, blur, wave)
4. **Styles de sous-titres** — 3 nouveaux styles (pill, outline, glow)

### Projets moyens (3-5 prompts)
5. **Filtres avances** — 10 presets CSS enrichis + vignette/grain via Canvas
6. **Transitions entre clips** — 5 transitions Canvas 2D (dissolve, slide, wipe, zoom, blur)
7. **Templates video** — 8-12 templates JSON par style de contenu
8. **Stickers Lottie** — Integration lottie-web + bibliotheque de stickers

### Projets ambitieux (10+ prompts)
9. **WebGL filtres/LUTs** — Migration vers glfx.js pour les LUTs cinematiques
10. **Audio ducking** — Detection voix + gain automatique
11. **Server-side fallback** — Cloud Run + FFmpeg pour les gros fichiers
12. **Templates interactifs** — Systeme de templates avec placeholders editables

---

## Stack technique finale

| Besoin | Librairie | Taille | Licence |
|--------|-----------|--------|---------|
| Fonts | Google Fonts CDN | 0 (CDN) | OFL |
| Filtres basiques | Canvas 2D `ctx.filter` | 0 | Natif |
| Filtres avances | glfx.js (futur) | ~20KB | MIT |
| Transitions | Canvas 2D natif | 0 | Natif |
| Stickers | lottie-web (futur) | ~250KB | Apache 2.0 |
| Audio ducking | Silero VAD (futur) | ~1.5MB | MIT |
| Export | WebCodecs + mp4-muxer | Deja installe | — |
| Sous-titres | Canvas 2D natif | 0 | Natif |
| Easing | 10 lignes de math | 0 | — |

**Dependances a ajouter immediatement : aucune.** Tous les quick wins utilisent des APIs natives.

Sources:
- [MDN Canvas strokeText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText)
- [Best Fonts for Instagram Reels](https://studio2am.co/blogs/news/18-stylish-fonts-for-social-media-graphics-and-reels)
- [glfx.js WebGL Filters](https://evanw.github.io/glfx.js/docs/)
- [WebGL LUTs](https://blog.frost.kiwi/WebGL-LUTS-made-simple/)
- [Remotion Lambda Pricing](https://www.remotion.dev/docs/lambda/cost-example)
- [Instagram Video Specs 2026](https://socialrails.com/blog/instagram-video-size-format-specifications-guide)
- [Lottie Web](https://github.com/airbnb/lottie-web)
- [Silero VAD](https://github.com/ricky0123/vad)
- [CapCut Subtitle Styles](https://www.capcut.com/resource/caption-style)
- [WebCodecs Best Practices](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs)
