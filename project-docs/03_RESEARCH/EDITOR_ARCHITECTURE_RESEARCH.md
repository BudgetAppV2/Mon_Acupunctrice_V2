# Recherche architecture — Editeurs video web pro

Date : 26 mars 2026

---

## Axe 1 — Architecture des editeurs video web

### 1A — Rendering pipeline

**Decouverte cle : les editeurs pro utilisent un pipeline a 2 niveaux**

1. **Preview (temps reel)** : Canvas 2D ou WebGL pour le rendu a ~30fps avec video texture + overlays + effets. CapCut Web utilise WebAssembly (C++ compile via Emscripten) pour le moteur de rendu. Les editeurs plus simples (Kapwing, VEED) utilisent Canvas 2D ou des overlays DOM.

2. **Export (offline)** : WebCodecs + seek-based loop (notre approche actuelle) OU server-side via Remotion/FFmpeg. CapCut Web utilise WebCodecs pour l'export client-side.

**Architecture CapCut Web (confirmee par web.dev case study) :**
- Moteur C++ compile en WebAssembly via Emscripten
- 1M+ templates transferes vers le web
- WebCodecs pour l'export
- PWA avec installation navigateur
- 83% d'amelioration du trafic SEO

**Notre pipeline actuel est dans la bonne direction** : Canvas 2D preview + WebCodecs seek-based export. L'upgrade serait d'ajouter WebGL pour les effets temps reel.

### 1B — Layer/composition model

**Pattern recurrent : scene graph / composition tree**

Les editeurs pro structurent le contenu en layers ordonnees :
```
Composition (root)
  ├── VideoTrack (clips sequentiels)
  ├── TextLayer (overlays avec timing)
  ├── SubtitleLayer (sous-titres avec timing)
  ├── AudioTrack (musique + voix)
  ├── StickerLayer (animations avec timing)
  └── EffectStack (filtres appliques globalement)
```

Chaque layer a un `startTime`, `endTime`, `zIndex`, et potentiellement des `blendModes`.

**Notre modele actuel (store Zustand plat)** est simple mais fonctionne. Pour les phases avancees, migrer vers un modele de composition serait ideal mais pas necessaire pour le MVP.

**Undo/redo :** Les editeurs pro utilisent un pattern Command (chaque action = un objet reversible). Zustand supporte un middleware `temporal` pour ca. Pas prioritaire pour Judith.

### 1C — Effect stack

**Pattern : pipeline chainable**

```
Frame source → Filter 1 → Filter 2 → LUT → Grain → Vignette → Output
```

En Canvas 2D : chaque effet modifie le canvas sequentiellement via `getImageData/putImageData` ou `ctx.filter`.

En WebGL : chaque effet est un fragment shader. Les shaders sont chaines via FBOs (Framebuffer Objects) — le output d'un shader devient le input du suivant. Beaucoup plus rapide.

**Three.js EffectComposer** est un bon modele : pipeline de post-processing passes. Chaque pass est un shader. Mais Three.js est surdimensionne pour notre cas (on n'a pas de 3D).

**Recommandation :** Rester en Canvas 2D pour l'export (seek-based, pas de contrainte temps reel). Ajouter WebGL uniquement pour le preview temps reel si la performance Canvas 2D ne suffit pas.

---

## Axe 2 — SDKs et frameworks

### 2A — SDKs open-source

| Projet | Tech | Rendering | Export | Stars | Maturite |
|--------|------|-----------|--------|-------|----------|
| **Twick** | React + Canvas | Canvas 2D | WebCodecs | ~200 | Alpha |
| **OpenVideo** | React + PixiJS | WebGL (Pixi) | WebCodecs | ~500 | Alpha |
| **fabric-video-editor** | Next.js + Fabric.js | Canvas 2D | FFmpeg.wasm | ~800 | Beta |
| **react-video-editor** | React + Remotion | Remotion | Remotion Lambda | ~1.5K | Beta |
| **Remotion** | React | Headless Chrome | Lambda/Cloud Run | 21K | Production |

**OpenVideo est le plus pertinent** : React + PixiJS (WebGL) + WebCodecs. Architecture similaire a la notre mais avec PixiJS pour le rendu. Clone CapCut/Canva.

**Twick** est interessant : React SDK avec timeline Canvas, AI captions, export WebCodecs. Plus leger mais moins mature.

### 2B — SDKs commerciaux

| SDK | Type | Prix | Safari iOS | Maturite |
|-----|------|------|-----------|----------|
| **IMG.LY CreativeEditor** | White-label SDK | Custom (MAU-based) | Oui | Production |
| **Shotstack** | API rendering | $0.05/video | N/A (server) | Production |
| **Creatomate** | API rendering | $0.10/video | N/A (server) | Production |
| **Banuba** | SDK mobile/web | Custom | Oui | Production |

**IMG.LY** est le SDK commercial le plus complet (photo + video + design editor). White-label, React support, Web + Mobile. Mais prix non-transparent (contact sales).

**Verdict Build vs Buy :** Pour notre cas (1 utilisatrice, contenu specifique acupuncture), construire est plus viable que payer un SDK commercial. Nos besoins sont specifiques et le SDK actuel est deja fonctionnel.

### 2C — Remotion

**Architecture :**
- React components → frames renderees par Headless Chrome → video
- Composition = width + height + fps + durationInFrames
- Chaque composant React represente un element visuel (texte, image, video)
- Preview temps reel dans le navigateur (React rendering)
- Export via Lambda (~$0.001 par video de 30s)

**Avantages :**
- Export serveur rapide et parallele (5-15s au lieu de 30-45s)
- Qualite constante (pas de variation Safari/Chrome)
- React = meme tech que notre stack

**Inconvenients :**
- Necessite AWS Lambda ou Cloud Run
- Licence $10/1000 renders pour les entreprises
- Le preview client est un render React, pas un Canvas — plus lent
- Complexite d'integration significative

**Verdict Remotion : NON pour maintenant.** Notre pipeline WebCodecs client-side fonctionne pour les Reels de 30-90s de Judith. Remotion serait pertinent si on avait besoin de :
- Export serveur pour des videos > 3 min
- Generation automatique de videos (templates sans intervention humaine)
- Multi-utilisateurs avec rendering centralise

---

## Axe 3 — Techniques de rendu avancees

### 3A — WebGL pour l'edition video

**Support Safari iOS :**
- WebGL 1.0 : iOS 8+ (totalement stable)
- WebGL 2.0 : iOS 15+ (stable)
- Shaders GLSL : fonctionnent sur Safari iOS
- Video texture : `gl.texImage2D(gl.TEXTURE_2D, ..., videoElement)` fonctionne

**Performance :** WebGL shader sur video = ~1ms par frame sur iPhone recent. Canvas 2D getImageData = ~10-50ms par frame pour les memes effets. WebGL est 10-50x plus rapide pour les effets pixel.

**Librairies Canvas 2D vs WebGL :**

| Librairie | Renderer | Taille | Usage ideal |
|-----------|----------|--------|------------|
| **Canvas 2D natif** | CPU | 0KB | Dessin simple, texte, formes |
| **Fabric.js** | Canvas 2D | 300KB | Editeur de design (objets draggables) |
| **Konva.js** | Canvas 2D | 150KB | UI interactif, scene graph |
| **PixiJS** | WebGL | 400KB | Rendu haute-performance, filtres, sprites |
| **Three.js** | WebGL | 600KB | 3D (surdimensionne pour notre cas) |

**Recommandation :** Garder Canvas 2D natif pour l'export (seek-based, performance non-critique). Evaluer PixiJS pour le preview temps reel si on ajoute des effets WebGL (LUTs, grain, transitions).

### 3B — WebGPU

**GRANDE NOUVELLE : WebGPU est disponible sur Safari iOS 26 (septembre 2025).**

- Compute shaders pour le traitement video GPU-accelere
- Performance ~3ms par frame sur smartphone (vs ~10-50ms Canvas 2D)
- Supporte par TOUS les navigateurs majeurs maintenant (Chrome, Firefox, Safari)
- Apple a presente WebGPU a WWDC 2025

**Impact pour nous :**
- WebGPU permettrait un pipeline de rendering video entierement GPU
- LUTs, filtres, transitions, grain — tout en compute shaders
- Export accelere (~3x plus rapide que Canvas 2D)
- **Mais :** necessite iOS 26+ (pas tous les iPhones de Judith)

**Verdict :** Piste futuriste mais pas pour maintenant. WebGL 2.0 couvre nos besoins. WebGPU sera pertinent dans 1-2 ans quand iOS 26+ sera majoritaire.

### 3C — OffscreenCanvas et Workers

**Support Safari iOS :** OffscreenCanvas est supporte depuis iOS 16.5 (pleinement) et les ameliorations continuent dans Safari 26.4.

**Potentiel :**
- Deplacer le rendering d'export dans un Web Worker → ne bloque plus l'UI
- L'utilisatrice peut continuer a utiliser l'app pendant l'export
- `new OffscreenCanvas(1080, 1920)` dans un Worker + WebCodecs encoder

**Verdict :** Faisable et utile. A ajouter comme amelioration post-MVP pour un export non-bloquant.

---

## Axe 4 — Breakdown d'editeurs existants

### CapCut Web
- **Moteur :** C++ → WebAssembly (Emscripten). 1M+ templates.
- **Export :** WebCodecs client-side
- **UI :** React-like (custom framework ByteDance)
- **Performance :** PWA installable, 83% boost SEO

### Canva Video
- **Moteur :** WebGL (custom rendering engine)
- **Export :** Server-side rendering
- **UI :** React
- **Templates :** JSON schema avec placeholders

### Clipchamp (Microsoft)
- **Moteur :** WebAssembly + Canvas
- **Export :** Client-side (WebCodecs) + server fallback
- **UI :** Web Components

### VEED.io
- **Moteur :** FFmpeg.wasm + Canvas 2D
- **Export :** Client-side FFmpeg.wasm
- **UI :** React

---

## Synthese finale

### Architecture recommandee pour Mon Acupunctrice Hub

```
PREVIEW (temps reel) :
  Video <video> element → CSS filters (actuel)
  Texte/sous-titres → DOM overlay (actuel)
  Upgrade futur : PixiJS ou WebGL natif pour LUTs/grain en preview

EXPORT (offline, seek-based) :
  Canvas 2D (actuel) → dessin frame-by-frame
  + Effets Canvas 2D (grain, vignette, LUT pixel-par-pixel)
  + WebCodecs H.264 encoder → mp4-muxer
  Upgrade futur : OffscreenCanvas dans un Worker (non-bloquant)

RENDU SERVEUR (optionnel futur) :
  Cloud Run + FFmpeg pour post-traitement
  OU Remotion Lambda pour templates automatiques
```

### Build vs Buy

| Composant | Decision | Justification |
|-----------|----------|---------------|
| Rendering engine | BUILD | Canvas 2D natif suffit, pas besoin de Fabric/Konva/Pixi |
| Export pipeline | BUILD | WebCodecs fonctionne bien, notre implementation est solide |
| Text rendering | BUILD | Canvas 2D natif couvre tous les effets necessaires |
| Filtres/LUTs | BUILD | Canvas 2D pour export, CSS pour preview |
| Transitions | BUILD | Canvas 2D natif (12 transitions suffisent) |
| Stickers | BUY (lottie-web) | 250KB, API frame-by-frame confirmee |
| Audio processing | BUILD | Web Audio API native |
| Server rendering | DEFER | Pas necessaire pour le MVP de Judith |
| SDK commercial | SKIP | Surdimensionne et couteux pour 1 utilisatrice |

### Risques techniques Safari iOS

| Risque | Probabilite | Mitigation |
|--------|------------|------------|
| WebGL shader performance | Faible | WebGL 2.0 stable depuis iOS 15 |
| OffscreenCanvas bugs | Moyenne | Fallback main thread |
| Memoire OOM gros fichiers | Moyenne | Seuil 100MB, extraction audio MP3 |
| WebCodecs H.264 encoder | Faible | Stable sur Safari depuis iOS 15.4 |
| FFmpeg.wasm COEP | Haute | Deja gere (headers COOP/COEP sur /editeur) |

### Roadmap technique 3-6 mois

**Mois 1 (avril 2026) :**
- Quick wins effets visuels (fonts, animations, sous-titres, grain/vignette)
- Bitrate 8 Mbps
- Multi-clip M2+M3+M4

**Mois 2 (mai 2026) :**
- Templates video JSON
- Transitions entre clips
- LUTs cinematiques (Canvas 2D pixel-par-pixel)

**Mois 3 (juin 2026) :**
- Stickers Lottie
- Audio ducking (Silero VAD)
- OffscreenCanvas Worker export (non-bloquant)

**Mois 4-6 (juillet-sept 2026) :**
- WebGL preview (PixiJS ou natif) si performance Canvas insuffisante
- WebGPU exploration (iOS 26 sera plus repandu)
- Server-side post-processing (Cloud Run + FFmpeg) si demande

### Decision Remotion : NON

**Justification :**
1. Notre pipeline WebCodecs client-side fonctionne pour les Reels de 30-90s
2. Remotion necessite AWS Lambda (complexite infra supplementaire)
3. Le cout ($10/1000 renders) n'est pas justifie pour 1 utilisatrice
4. La qualite WebCodecs H.264 8Mbps est suffisante pour Instagram/YouTube
5. Si on a besoin de serveur, Cloud Run + FFmpeg est plus simple et moins cher
6. Remotion serait pertinent uniquement pour la generation automatique de videos templates — pas notre cas d'usage actuel

Sources :
- [CapCut Web Case Study (web.dev)](https://web.dev/case-studies/capcut)
- [IMG.LY Open Source SDKs Guide](https://img.ly/blog/open-source-design-editor-sdks-a-developers-guide-to-choosing-the-right-solution/)
- [OpenVideo GitHub](https://github.com/openvideodev/openvideo)
- [Twick SDK](https://github.com/ncounterspecialist/twick)
- [Canvas Engines Benchmark](https://benchmarks.slaylines.io/)
- [WebGPU in iOS 26](https://brandlens.io/blog/the-untold-revolution-beneath-ios-26-webgpu-is-coming-everywhere-and-it-changes-everything/)
- [OffscreenCanvas Support](https://caniuse.com/offscreencanvas)
- [Remotion Lambda Cost](https://www.remotion.dev/docs/lambda/cost-example)
- [gl-transitions](https://gl-transitions.com/)
- [Remotion Architecture](https://www.remotion.dev/)
