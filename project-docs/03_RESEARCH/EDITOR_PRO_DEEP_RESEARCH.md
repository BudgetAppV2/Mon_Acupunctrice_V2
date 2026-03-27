# Recherche approfondie — Effets visuels pro et rendu graphique avance

Date : 26 mars 2026

---

## A — Typographie cinematique et text rendering avance

### A1 — 30 fonts pro pour les Reels

**Titres impact (display bold) :**
1. Bebas Neue — condensee all-caps, la plus utilisee sur IG
2. Anton — ultra-bold, impact maximum
3. Staatliches — condensee geometrique, style sportif
4. Righteous — arrondie bold, style retro-moderne
5. Archivo Black — bold sans-serif, tres lisible
6. Oswald — condensee classique, style magazine
7. Barlow Condensed — propre et etroite
8. Bangers — comic-style, fun et energique

**Elegantes/serif :**
9. Playfair Display — serif editorial, luxe
10. Cormorant Garamond — serif fine, chic
11. DM Serif Display — serif moderne, sante/bien-etre
12. Lora — serif readable, feminite
13. Abril Fatface — serif display XXL

**Modernes/geometriques :**
14. Montserrat — la classique, propre
15. Poppins — geometrique arrondie
16. Inter — UI clean (deja dans le projet)
17. Space Grotesk — geometrique futuriste
18. Raleway — thin elegant
19. Work Sans — propre et versatile
20. Nunito — arrondie douce

**Cursives/handwritten :**
21. Dancing Script — cursive elegante
22. Pacifico — script casual
23. Caveat — manuscrit naturel
24. Shadows Into Light — manuscrit leger
25. Satisfy — script fluide
26. Sacramento — script fine

**Fun/decoratives :**
27. Lobster — display retro
28. Itim — amical et arrondi
29. Permanent Marker — marker authentique
30. Amatic SC — thin handwritten all-caps

**Toutes disponibles sur Google Fonts. Licence OFL (libre). Chargement via `@font-face` + `document.fonts.load()`.**

Sources : [CreateThat CapCut Fonts](https://www.createthat.ai/blog/best-capcut-fonts), [TypeType CapCut](https://typetype.org/fonts/capcut/), [Studio2am Social Media Fonts](https://studio2am.co/blogs/news/18-stylish-fonts-for-social-media-graphics-and-reels)

### A2 — Effets texte avances en Canvas 2D

Tous realisables avec l'API Canvas 2D native :

**1. Double outline (contour blanc + ombre noire)**
```typescript
ctx.lineWidth = 8; ctx.strokeStyle = '#000'; ctx.strokeText(text, x, y);
ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeText(text, x, y);
ctx.fillStyle = '#fff'; ctx.fillText(text, x, y);
```

**2. Gradient fill**
```typescript
const grad = ctx.createLinearGradient(x, y - size, x, y);
grad.addColorStop(0, '#ff6b6b'); grad.addColorStop(1, '#feca57');
ctx.fillStyle = grad; ctx.fillText(text, x, y);
```

**3. Neon glow**
```typescript
ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 20;
ctx.fillStyle = '#00ff88'; ctx.fillText(text, x, y);
ctx.shadowBlur = 40; ctx.fillText(text, x, y); // double draw pour intensifier
ctx.shadowBlur = 0;
```

**4. Texte avec fond pill arrondi**
```typescript
const metrics = ctx.measureText(text);
const pad = 12;
roundRect(ctx, x - pad, y - size - pad/2, metrics.width + pad*2, size + pad, size/3);
ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
ctx.fillStyle = '#fff'; ctx.fillText(text, x, y);
```

**5. Texte 3D (ombres multiples decalees)**
```typescript
for (let i = 5; i > 0; i--) {
  ctx.fillStyle = `rgba(0,0,0,${0.1 * i})`;
  ctx.fillText(text, x + i*2, y + i*2);
}
ctx.fillStyle = '#fff'; ctx.fillText(text, x, y);
```

**6. Texte avec pattern/texture**
```typescript
const pattern = ctx.createPattern(textureImg, 'repeat');
ctx.fillStyle = pattern; ctx.fillText(text, x, y);
```

**Viabilite :** Tout est Canvas 2D natif. 0 dependance. Fonctionne sur Safari iOS.

Sources : [MDN strokeText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText), [web.dev Canvas Text Effects](https://web.dev/canvas-texteffects/), [JSFiddle Canvas Glow](https://jsfiddle.net/zeelux/4Ffxq/)

### A3 — Animations de texte frame-by-frame

**Catalogue complet (22 animations) :**

| # | Animation | Formule Canvas | Complexite |
|---|-----------|---------------|------------|
| 1 | Fade in | `globalAlpha = t` | Simple |
| 2 | Fade out | `globalAlpha = 1-t` | Simple |
| 3 | Slide up | `translateY = (1-t) * 60` | Simple |
| 4 | Slide down | `translateY = (t-1) * 60` | Simple |
| 5 | Slide left | `translateX = (1-t) * 60` | Simple |
| 6 | Slide right | `translateX = (t-1) * 60` | Simple |
| 7 | Scale pop | `scale = easeOutBack(t)` (overshoot) | Simple |
| 8 | Zoom in | `scale = t` | Simple |
| 9 | Zoom out | `scale = 2 - t` | Simple |
| 10 | Bounce | `scale = easeOutBounce(t)` | Moyen |
| 11 | Elastic | `scale = easeOutElastic(t)` | Moyen |
| 12 | Rotate in | `rotation = (1-t) * -90` | Simple |
| 13 | Blur in | `ctx.filter = blur(${(1-t)*10}px)` | Simple |
| 14 | Typewriter | `text.slice(0, floor(t * len))` | Moyen |
| 15 | Word-by-word | mot `i` visible si `t > i/wordCount` | Moyen |
| 16 | Wave | `y += sin(t * PI + i * 0.5) * 10` par lettre | Avance |
| 17 | Glitch | `offset.x = random() * 5 * (1-t)` | Avance |
| 18 | Shake | `x += sin(t * 50) * (1-t) * 5` | Moyen |
| 19 | Flip | `scaleX = cos(t * PI/2)` | Moyen |
| 20 | Ink print | opacity + scale rapide | Moyen |
| 21 | Flutter | chaque lettre a un delay different | Avance |
| 22 | Trail | texte + copie fantome decalee | Moyen |

**Fonctions d'easing (sans librairie) :**
```typescript
const easing = {
  linear: (t: number) => t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2,
  easeOutBack: (t: number) => { const c = 1.70158; return 1 + (c+1) * Math.pow(t-1, 3) + c * Math.pow(t-1, 2); },
  easeOutBounce: (t: number) => {
    if (t < 1/2.75) return 7.5625*t*t;
    if (t < 2/2.75) return 7.5625*(t-=1.5/2.75)*t+0.75;
    if (t < 2.5/2.75) return 7.5625*(t-=2.25/2.75)*t+0.9375;
    return 7.5625*(t-=2.625/2.75)*t+0.984375;
  },
  easeOutElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2,-10*t) * Math.sin((t-0.075)*(2*Math.PI)/0.3) + 1,
};
```

Sources : [Easings.net](https://easings.net/), [bezier-easing GitHub](https://github.com/gre/bezier-easing), [CapCut Text Animation](https://www.capcut.com/resource/text-animation-online)

---

## B — Color grading et filtres cinematiques

### B1 — LUTs et color grading

**Format .cube :** Fichier texte avec `LUT_3D_SIZE N` puis `N^3` lignes de `r g b` (0.0-1.0).

**Application pixel-par-pixel en Canvas 2D :**
```typescript
function applyLUT(ctx: CanvasRenderingContext2D, w: number, h: number, lut: Float32Array, size: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
    // Trilinear interpolation dans le cube LUT
    const ri = r * (size-1), gi = g * (size-1), bi = b * (size-1);
    const r0 = Math.floor(ri), g0 = Math.floor(gi), b0 = Math.floor(bi);
    // ... interpolation et lookup dans lut[r0+g0*size+b0*size*size]
    d[i] = newR * 255; d[i+1] = newG * 255; d[i+2] = newB * 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
```

**Performance :** Pour 1080x1920 = 2M pixels, `getImageData` + boucle prend ~50-100ms en Canvas 2D. Trop lent pour le temps reel mais OK pour l'export seek-based (une frame a la fois). Pour le preview temps reel, utiliser WebGL.

**LUTs recommandees pour Judith :**
- Warm Glow (chaleureux, accueillant — sante/bien-etre)
- Teal & Orange (cinematique, pro — YouTube)
- Soft Pastel (doux, feminin — Instagram)
- Clean Bright (propre, medical — educatif)
- Vintage Film (retro, authentique — storytelling)

**Librairies :**
- **apply-cube-lut** (npm) — parse .cube, applique. 5KB. MIT.
- **CamanJS LUT plugin** — plugin pour CamanJS. 3KB. MIT.
- **webgl-lut-filter** (npm) — WebGL performance. 10KB. MIT.

Sources : [LUTs Made Simple](https://blog.frost.kiwi/WebGL-LUTS-made-simple/), [apply-cube-lut GitHub](https://github.com/thibauts/apply-cube-lut), [CamanJS LUT](https://github.com/dorelljames/camanjs-lut-file)

### B2 — Grain film et effets de texture

**1. Film grain (bruit aleatoire)**
```typescript
function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity = 0.05) {
  const imageData = ctx.createImageData(w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() - 0.5) * 255 * intensity;
    d[i] = d[i+1] = d[i+2] = 128 + v; d[i+3] = 30; // semi-transparent
  }
  ctx.globalCompositeOperation = 'overlay';
  ctx.putImageData(imageData, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
```

**2. Vignette (assombrissement des bords)**
```typescript
function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 0.4) {
  const cx = w/2, cy = h/2, r = Math.max(cx, cy);
  const grad = ctx.createRadialGradient(cx, cy, r*0.5, cx, cy, r);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
}
```

**3. Light leaks (fuites de lumiere)**
```typescript
function drawLightLeak(ctx: CanvasRenderingContext2D, w: number, h: number, color = '#ff6b4410') {
  ctx.globalCompositeOperation = 'screen';
  const grad = ctx.createRadialGradient(w*0.8, h*0.2, 0, w*0.8, h*0.2, w*0.6);
  grad.addColorStop(0, color); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}
```

**4. Chromatic aberration**
```typescript
// Decaler les canaux R et B de quelques pixels
const imgData = ctx.getImageData(0, 0, w, h);
// Shift R channel +2px, B channel -2px
```

**Viabilite :** Tout en Canvas 2D natif. Grain + vignette = 5ms supplementaires par frame.

Sources : [CodePen Film Grain](https://codepen.io/sucka/pen/PwYqLbo), [DEV Cinematic HUD](https://dev.to/emrahg/building-cinematic-sci-fi-hud-overlays-with-canvas-2d-and-mediarecorder-api-1kk1)

---

## C — Transitions pro entre clips

### C1 — Catalogue de 12 transitions Canvas 2D

| # | Transition | Technique | Complexite |
|---|-----------|-----------|------------|
| 1 | Dissolve | `globalAlpha = 1-t` (A) + `globalAlpha = t` (B) | Simple |
| 2 | Slide left | `drawImage(A, -t*w, 0)` + `drawImage(B, (1-t)*w, 0)` | Simple |
| 3 | Slide right | Inverse de slide left | Simple |
| 4 | Slide up | `drawImage(A, 0, -t*h)` + `drawImage(B, 0, (1-t)*h)` | Simple |
| 5 | Wipe horizontal | `clip(rect(0,0,t*w,h))` pour B, sinon A | Moyen |
| 6 | Wipe vertical | `clip(rect(0,0,w,t*h))` pour B | Moyen |
| 7 | Zoom in | `scale(1+t)` sur A, B apparait par-dessous | Moyen |
| 8 | Circle reveal | `clip(arc(cx,cy,t*r))` pour B | Moyen |
| 9 | Blur | `ctx.filter = blur(${(1-abs(2t-1))*15}px)` | Simple |
| 10 | Fade through black | alpha A→0, noir, alpha B 0→1 | Simple |
| 11 | Spin | `rotate(t * PI)` sur A, B apparait | Avance |
| 12 | Glitch | Decouper A en bandes horizontales, decaler aleatoirement | Avance |

**Duree standard :** 10-15 frames (0.33-0.5s a 30fps).

### C2 — gl-transitions (WebGL avance)

**gl-transitions** est une collection open-source de 100+ transitions GLSL. Chaque transition est un shader qui prend 2 textures (`from`, `to`) et un `progress` (0→1).

- **Site :** https://gl-transitions.com/
- **GitHub :** https://github.com/gl-transitions/gl-transitions
- **Licence :** MIT
- **Taille :** Variable (chaque shader = ~20 lignes GLSL)

**Verdict :** Les 12 transitions Canvas 2D sont suffisantes pour les Reels de Judith. gl-transitions est un upgrade futur si on passe a WebGL.

Sources : [gl-transitions.com](https://gl-transitions.com/), [GitHub gl-transitions](https://github.com/gl-transitions/gl-transitions)

---

## D — Stickers et overlays graphiques

### D1 — Lottie frame-par-frame

**API confirmee :**
```typescript
import lottie from 'lottie-web';

const anim = lottie.loadAnimation({
  container: document.createElement('div'), // dummy
  renderer: 'canvas',
  rendererSettings: { context: ctx }, // Canvas 2D context
  animationData: stickerJson,
  autoplay: false,
});

// Pour chaque frame de l'export :
anim.goToAndStop(frameNumber, true); // true = frame-based
anim.render(); // dessine sur le canvas context
```

**Compatible Safari iOS.** `lottie-web` Canvas renderer fonctionne sans DOM visible.

### D2 — Sources de stickers

| Source | Type | Prix | API |
|--------|------|------|-----|
| LottieFiles | Lottie JSON | Gratuit + Premium | REST API |
| Flaticon | SVG anime | Gratuit + $10/mois | REST API |
| Giphy Stickers | GIF/WebP | Gratuit | REST API |
| Rive | Rive format | Gratuit + Premium | JS SDK |

**Recommandation :** LottieFiles a une categorie "Health & Wellness" avec des animations de coeur, meditation, plantes — parfait pour Judith.

Sources : [Lottie-web GitHub](https://github.com/airbnb/lottie-web), [LottieFiles](https://lottiefiles.com/)

---

## E — Sous-titres avances style CapCut

### E1 — 10 styles de sous-titres pro

| # | Style | Rendu Canvas | Popularite |
|---|-------|-------------|------------|
| 1 | Classic | fillText blanc + shadow noire | Tres haute |
| 2 | Bold outline | strokeText noir 6px + fillText blanc | Tres haute |
| 3 | Background pill | roundRect semi-transparent + fillText | Haute |
| 4 | Karaoke highlight | mot actif en couleur, autres en gris | Haute |
| 5 | Word pop | chaque mot scale-in sequentiellement | Haute |
| 6 | Neon glow | shadowBlur 30 + couleur vive | Moyenne |
| 7 | Gradient text | createLinearGradient fill | Moyenne |
| 8 | Stacked emphasis | ligne 1 grosse (28px) + ligne 2 petite (18px) | Moyenne |
| 9 | Minimal | petit texte 14px en bas, ombre legere | Moyenne |
| 10 | Handwritten | font Caveat/Dancing Script + animation write | Basse |

### E2 — Algorithme de groupement optimal

**Regles pour 9:16 vertical :**
- Max 5-7 mots par ligne (37 caracteres max)
- Max 2 lignes simultanees
- Couper aux pauses naturelles (virgules, points, silences > 300ms)
- Position : y = 85% de la hauteur (au-dessus du nom IG)
- Font size : 42-48px pour 1080x1920

**Algorithme ameliore :**
```typescript
function groupWordsOptimal(words: SubtitleWord[], maxChars = 37, maxWords = 5): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  let current: SubtitleWord[] = [];
  let charCount = 0;

  for (const word of words) {
    const wouldBe = charCount + word.word.length + (current.length > 0 ? 1 : 0);
    const hasLongPause = current.length > 0 && (word.start - current[current.length-1].end > 0.3);
    const isPunctuation = current.length > 0 && /[.,;!?]$/.test(current[current.length-1].word);

    if (wouldBe > maxChars || current.length >= maxWords || hasLongPause || isPunctuation) {
      if (current.length > 0) segments.push(makeSegment(current, segments.length));
      current = [word]; charCount = word.word.length;
    } else {
      current.push(word); charCount = wouldBe;
    }
  }
  if (current.length > 0) segments.push(makeSegment(current, segments.length));
  return segments;
}
```

Sources : [CapCut Caption Style Guide](https://www.capcut.com/resource/caption-style), [Nimdzi Vertical Video Subtitling](https://www.nimdzi.com/subtitling-vertical-videos-guidelines-where-art-thou/)

---

## F — Templates video et presets

### F1 — Schema JSON de template

```json
{
  "id": "hook_3points_enseigner",
  "name": "Hook + 3 Points",
  "style": "enseigner",
  "thumbnail": "preview.jpg",
  "sections": [
    {
      "type": "hook",
      "duration": [0, 3],
      "overlay": { "text": "[HOOK]", "position": "center", "animation": "scale_pop", "style": "bold_outline", "font": "Bebas Neue", "size": 64 }
    },
    {
      "type": "content",
      "duration": [3, 25],
      "subtitlesEnabled": true,
      "subtitleStyle": "background_pill"
    },
    {
      "type": "cta",
      "duration": [25, 30],
      "overlay": { "text": "[CTA]", "position": "bottom", "animation": "bounce", "style": "pill_background", "font": "Poppins", "size": 36 }
    }
  ],
  "filter": "warm_glow",
  "fontPair": { "title": "Bebas Neue", "body": "Poppins" },
  "colors": { "primary": "#87A878", "accent": "#E8D5B7", "text": "#FFFFFF" }
}
```

### F2 — 12 presets pour Judith

**Enseigner (3 presets) :**
1. "Hook + 3 Points" — titre impact, 3 points animes, CTA
2. "Question-Reponse" — question en gros, explication, CTA
3. "Fait surprenant" — stat choc, explication, CTA

**Connecter (3 presets) :**
4. "POV Clinique" — titre cursif, sous-titres minimal, ambiance chaleureuse
5. "Routine" — etapes numerotees, filtre warm
6. "Coulisses" — titre handwritten, sous-titres naturels

**Aider (3 presets) :**
7. "Tuto Acupression" — titre bold, sous-titres step-by-step, fleches
8. "Conseil du jour" — titre gradient, explication, CTA enregistrer
9. "DIY Bien-etre" — titre fun, etapes illustrees

**Inspirer (3 presets) :**
10. "Temoignage" — citation en italique, contexte, resultat
11. "Avant/Apres" — split screen text, transformation
12. "Pourquoi" — titre emotionnel, histoire, lien RDV

---

## G — Server-side rendering

### G1 — Remotion

- **Cloud Run :** En alpha, pas activement developpe. Lambda est mature.
- **Lambda :** ~$0.001/video de 30s. Parallelise le rendu.
- **Licence :** Gratuit pour les individus, $10/1000 renders pour les entreprises.
- **Architecture :** React composants → frames → video. Peut recevoir un JSON de template et generer la video.

### G2 — Pipeline hybride recommande

```
Client (Safari iOS) :
  1. Judith edite la video (trim, texte, sous-titres, filtre CSS)
  2. Export WebCodecs (H.264, 8 Mbps) — qualite "brute"
  3. Upload vers Storage

Serveur (optionnel, futur) :
  4. Cloud Run recoit le fichier + metadata JSON
  5. FFmpeg applique : LUT cinematique + grain + vignette + 2-pass encoding
  6. Upload la version "pro" vers Storage
```

**Verdict :** Le client-side est suffisant pour Judith actuellement. Le server-side serait un upgrade futur pour les LUTs et le 2-pass encoding.

---

## Stack graphique recommandee

### Phase 1 — Quick wins (0 dependances)
| Composant | Technique | Fichier a modifier |
|-----------|-----------|-------------------|
| 30 fonts | Google Fonts CDN | TextPanel, drawOverlays |
| 7 effets texte | Canvas 2D natif | drawOverlays.ts |
| 22 animations | Easing math | drawOverlays.ts |
| 10 styles sous-titres | Canvas 2D natif | drawSubtitles.ts |
| Grain + vignette | Canvas 2D natif | exportWebCodecs.ts |
| Bitrate 8 Mbps | Constante | exportWebCodecs.ts |
| 5 transitions | Canvas 2D natif | exportWebCodecs.ts (M4) |

### Phase 2 — Ajouts moyens (1-2 dependances)
| Composant | Librairie | Taille |
|-----------|-----------|--------|
| Stickers animes | lottie-web | 250KB |
| LUTs cinematiques | apply-cube-lut | 5KB |

### Phase 3 — Ambitieux (WebGL + serveur)
| Composant | Technique |
|-----------|-----------|
| Filtres avances | glfx.js (WebGL) |
| 100+ transitions | gl-transitions (GLSL) |
| Post-traitement | Cloud Run + FFmpeg |

---

## Catalogue complet des effets proposables

**Texte :** 7 effets visuels + 22 animations + 30 fonts = ~4600 combinaisons
**Sous-titres :** 10 styles × 30 fonts = 300 combinaisons
**Filtres :** 10 CSS actuels + 5 LUT + grain + vignette + light leak = 18 filtres
**Transitions :** 12 Canvas 2D + 100 gl-transitions (futur)
**Stickers :** 1000+ via LottieFiles
**Templates :** 12 presets × 4 styles × 30 fonts = 1440 variations

---

## Priorite d'implementation

1. **Bitrate 8 Mbps + keyframe 2s** — 5 min, impact qualite immediat
2. **6 nouvelles animations texte** — 1 prompt, impact visuel eleve
3. **5 nouveaux styles sous-titres** — 1 prompt, impact engagement
4. **15 fonts supplementaires** — 1 prompt, variete immédiate
5. **Grain + vignette** — 1 prompt, look cinematique
6. **7 effets texte avances** — 1 prompt, professionnalisme
7. **12 templates JSON** — 2 prompts, structure pour Judith
8. **5 transitions Canvas** — 2 prompts (apres M4 multi-clip)
9. **5 LUTs cinematiques** — 1 prompt + fichiers .cube
10. **Stickers Lottie** — 2 prompts (integration + bibliotheque)

Sources:
- [Easings.net Cheat Sheet](https://easings.net/)
- [gl-transitions.com](https://gl-transitions.com/)
- [CapCut Text Animation](https://www.capcut.com/resource/text-animation-online)
- [CapCut Caption Styles](https://www.capcut.com/resource/caption-style)
- [Lottie-web Wiki](https://github.com/airbnb/lottie-web/wiki/Usage)
- [LUTs Made Simple](https://blog.frost.kiwi/WebGL-LUTS-made-simple/)
- [Remotion Cloud Run](https://www.remotion.dev/docs/cloudrun)
- [Nimdzi Vertical Subtitling](https://www.nimdzi.com/subtitling-vertical-videos-guidelines-where-art-thou/)
- [web.dev Canvas Text Effects](https://web.dev/canvas-texteffects/)
