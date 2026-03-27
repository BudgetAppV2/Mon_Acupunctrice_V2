# Recherche architecture — Éditeurs vidéo web pro : comment ils sont construits

## Mission
Tu es un architecte logiciel senior spécialisé en édition vidéo. Ta mission est de
comprendre comment les éditeurs vidéo web professionnels (CapCut Web, Canva Video,
Kapwing, Descript, Runway, VEED.io, InVideo, Clipchamp) sont architecturés en interne.

On ne cherche PAS des librairies individuelles — on cherche à comprendre le
**rendering pipeline**, le **layer composition model**, le **effect stack**, et
le **export pipeline** de ces outils pour pouvoir concevoir notre propre architecture.

Utilise Exa (web_search_exa et get_code_context_exa) extensivement.

## Axe 1 — Architecture des éditeurs vidéo web

### 1A — Rendering pipeline
Recherche :
- "web video editor architecture rendering pipeline Canvas WebGL 2024 2025"
- "how CapCut web editor works internally rendering engine"
- "browser video editor compositor layer rendering architecture"
- "Canvas 2D vs WebGL video compositing performance comparison"
- "video editor render loop requestAnimationFrame vs seek-based"
- "fabric.js vs konva.js vs pixi.js video editing comparison"

Questions :
- Est-ce que les éditeurs pro utilisent Canvas 2D, WebGL, ou un mix?
- Comment fonctionne le compositor (layer stacking, blend modes)?
- Comment ils gèrent le rendu temps réel (preview) vs offline (export)?
- Fabric.js, Konva.js, PixiJS — lequel est le plus adapté pour un éditeur vidéo?

### 1B — Layer/composition model
Recherche :
- "video editor layer model composition tree data structure"
- "non-linear video editor timeline data model JSON"
- "video composition graph scene tree rendering order"
- "how After Effects composition model works simplified web"
- "Remotion composition model React video structure"

Questions :
- Comment structurer un arbre de composition (vidéo + texte + effets + audio)?
- Comment les layers interagissent (blend modes, masques, opacité)?
- Quel modèle de données pour supporter undo/redo efficacement?
- Comment Remotion structure ses compositions?

### 1C — Effect stack / filter pipeline
Recherche :
- "video effect pipeline chain Canvas WebGL architecture"
- "image processing pipeline browser JavaScript shader chain"
- "WebGL fragment shader chain video effects real-time"
- "color correction pipeline LUT curve levels brightness Canvas"
- "post-processing pipeline three.js EffectComposer web video"

Questions :
- Comment chaîner les effets (filtre + LUT + grain + vignette)?
- WebGL shader pipeline vs Canvas 2D getImageData — performance?
- Comment Three.js EffectComposer/post-processing fonctionne et peut-on l'adapter?
- Est-ce qu'on peut avoir un pipeline d'effets configurable (JSON → shader chain)?

## Axe 2 — SDKs et frameworks d'édition vidéo existants

### 2A — SDKs open-source complets
Recherche :
- "open source web video editor SDK 2024 2025 GitHub"
- "browser video editing library JavaScript TypeScript SDK"
- "video editor SDK React Next.js integration"
- "openshot video editor web version JavaScript"
- "MoviePy equivalent JavaScript browser video editing"
- "editly node.js video editor programmatic API"

Questions :
- Existe-t-il un SDK d'édition vidéo web complet qu'on pourrait intégrer?
- Quels projets open-source sont les plus matures?
- Peut-on utiliser Remotion comme moteur de rendu pour notre éditeur?

### 2B — SDKs commerciaux et APIs
Recherche :
- "video editor SDK commercial white-label API pricing 2025"
- "Creatomate API video rendering template pricing"
- "Shotstack video editing API cloud rendering"
- "Banuba video editor SDK web mobile"
- "img.ly video editor SDK web React"
- "FLAVOR video editor white label"
- "Pexels Video Editor API SDK"

Questions :
- Quel SDK commercial offre le meilleur rapport qualité/prix?
- img.ly (PhotoEditor/VideoEditor SDK) — est-ce viable? Prix?
- Creatomate/Shotstack — API de rendering vs SDK d'édition?
- Peut-on avoir un hybride : notre UI + leur moteur de rendu?

### 2C — Remotion en profondeur
Recherche :
- "Remotion video editing composition architecture deep dive"
- "Remotion custom component video overlay text animation"
- "Remotion Lambda Cloud Run pricing per render 2025"
- "Remotion vs FFmpeg server side video rendering comparison"
- "Remotion interactive editor preview React"
- "build video editor with Remotion React"

Questions :
- Remotion peut-il servir de moteur de rendu pour notre éditeur?
- Peut-on avoir un preview temps réel avec Remotion + export serveur?
- Architecture : client (preview Canvas) → serveur (Remotion export)?
- Coût de Remotion Lambda par vidéo de 60s?

## Axe 3 — Techniques de rendu avancées

### 3A — WebGL pour l'édition vidéo
Recherche :
- "WebGL video processing real-time effects Safari iOS support"
- "WebGL 2.0 Safari iOS compatibility 2025"
- "GLSL shader video filter effects browser tutorial"
- "WebGL texture video source real-time processing"
- "PixiJS video texture filters effects web"

Questions :
- WebGL 2.0 est-il supporté sur Safari iOS?
- Performance des shaders vidéo sur iPhone?
- PixiJS peut-il être utilisé comme rendering engine pour un éditeur vidéo?
- Comment alimenter un shader WebGL avec des frames vidéo?

### 3B — WebGPU (futur)
Recherche :
- "WebGPU Safari iOS support timeline 2025 2026"
- "WebGPU video processing compute shader browser"
- "WebGPU vs WebGL performance comparison video"

Questions :
- WebGPU est-il disponible sur Safari iOS?
- Est-ce une piste réaliste pour le futur?

### 3C — OffscreenCanvas et Workers
Recherche :
- "OffscreenCanvas Safari iOS support worker thread"
- "video rendering Web Worker OffscreenCanvas export"
- "background thread video processing browser JavaScript"

Questions :
- Peut-on déplacer le rendering dans un Worker pour ne pas bloquer l'UI?
- OffscreenCanvas fonctionne-t-il sur Safari iOS?

## Axe 4 — Inspiration : breakdown d'éditeurs existants

### 4A — Analyse technique d'éditeurs web
Recherche :
- "CapCut web editor technical analysis Chrome DevTools"
- "Canva video editor architecture blog post engineering"
- "Kapwing engineering blog video editor architecture"
- "Descript video editor web technology stack"
- "VEED.io technology stack how it works"
- "Clipchamp architecture Microsoft acquisition"

Questions :
- Quels frameworks/librairies ces éditeurs utilisent (visible dans le bundle)?
- Est-ce qu'ils utilisent WebAssembly, WebGL, Workers?
- Comment ils gèrent l'export (client-side, server-side, hybride)?

## Format du rapport

Génère dans `project-docs/03_RESEARCH/EDITOR_ARCHITECTURE_RESEARCH.md` avec :

Pour chaque axe :
1. **Découvertes clés** — Patterns architecturaux récurrents
2. **SDKs/outils évalués** — Tableau comparatif (nom, license, prix, Safari iOS, maturité)
3. **Code/exemples** — Snippets, repos GitHub, démos
4. **Recommandation** — Ce qu'on devrait utiliser et pourquoi

Synthèse finale :
- **Architecture recommandée** — Diagramme du rendering pipeline idéal
- **Build vs Buy** — Ce qu'on construit vs ce qu'on achète/intègre
- **Risques techniques** — Ce qui pourrait ne pas fonctionner sur Safari iOS
- **Roadmap technique** — Ordre d'implémentation sur 3-6 mois
- **Décision Remotion** — Oui/non et pourquoi

## Référence
- `CLAUDE.md`
- `project-docs/03_RESEARCH/EDITOR_PRO_RESEARCH.md` (première passe)
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (deuxième passe)
- `lib/utils/exportWebCodecs.ts` — pipeline d'export actuel
- `lib/utils/drawOverlays.ts` — rendu Canvas 2D actuel
