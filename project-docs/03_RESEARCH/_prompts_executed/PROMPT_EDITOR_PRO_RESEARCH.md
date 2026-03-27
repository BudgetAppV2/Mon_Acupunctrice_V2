# Recherche — Éditeur vidéo pro pour Mon Acupunctrice Hub

## Mission
Tu es un chercheur technique senior. Ta mission est de faire une recherche exhaustive
pour identifier les meilleures librairies, techniques et outils disponibles pour
transformer notre éditeur vidéo web en un outil de qualité professionnelle
comparable à CapCut/InShot, optimisé pour le contenu d'une acupunctrice sur les réseaux sociaux.

## Contexte
Mon Acupunctrice Hub V2 — éditeur vidéo mobile-first (Next.js 15 + Zustand + Tailwind).
L'éditeur fonctionne entièrement dans le navigateur (Safari iOS PWA).
Export via WebCodecs API + mp4-muxer. H.264 High Profile, 3.5 Mbps, 30 fps.
Pas de FFmpeg.wasm (ne charge pas sur Safari iOS).

## Recherche à faire

Utilise Exa (web_search_exa et get_code_context_exa) pour chaque thème ci-dessous.
Pour chaque thème, fais au MINIMUM 2-3 recherches Exa avec des requêtes différentes.
Documente les résultats dans le rapport.

### Thème 1 — Fonts et typographie stylisée
Recherche :
- Google Fonts dynamiques les plus utilisées sur Instagram/TikTok/CapCut
- Librairies JS pour charger des fonts dynamiquement dans le navigateur
- Comment dessiner du texte stylisé (ombres, contours, gradients) sur un Canvas 2D
- Fonts cursives, display, handwritten populaires pour le social media
- Comment CapCut/InShot gèrent la typographie (presets, animations)

Questions à répondre :
- Quelles sont les 20 fonts les plus utilisées sur les Reels Instagram?
- Comment les charger dans un `<canvas>` (pas un DOM) pour l'export WebCodecs?
- Peut-on faire des contours/outlines de texte en Canvas 2D? Comment?
- Librairies pour text rendering avancé (opentype.js, fabric.js, etc.)

### Thème 2 — Effets visuels et filtres
Recherche :
- Filtres vidéo CSS vs Canvas vs WebGL pour mobile
- LUTs (Look-Up Tables) pour colorisation cinématique
- Librairies JS de filtres vidéo en temps réel (WebGL shaders)
- Effets populaires sur les Reels : grain film, vignette, color grading, glow
- Comment appliquer des LUTs sur un Canvas 2D ou WebGL

Questions à répondre :
- CSS filter est-il suffisant ou faut-il passer au WebGL?
- Quels effets sont réalisables en Canvas 2D vs nécessitent WebGL?
- Performance des shaders WebGL sur Safari iOS?
- Librairies existantes : gl-react, luma.gl, pixi.js — lesquelles sont viables?

### Thème 3 — Transitions entre clips
Recherche :
- Types de transitions utilisées sur CapCut/InShot (dissolve, slide, zoom, etc.)
- Comment implémenter des transitions entre clips avec WebCodecs/Canvas
- Librairies JS de transitions vidéo
- Transition rendering dans un seek-based export loop

Questions à répondre :
- Comment blender deux frames (clip A et clip B) pendant une transition?
- Quelles transitions sont faisables en Canvas 2D?
- Performance des transitions sur Safari iOS?
- Combien de frames de transition (15 frames = 0.5s?) est standard?

### Thème 4 — Templates et presets
Recherche :
- Comment CapCut/InShot gèrent les templates (structure de données, rendu)
- Templates de Reels Instagram populaires (structures, timings, styles)
- Systèmes de presets pour éditeurs vidéo web (JSON schema, rendu)
- Templates vidéo Canva, CapCut — format d'échange

Questions à répondre :
- Quel format JSON pour un template de Reel? (timing, textes, styles, transitions)
- Comment pré-remplir un template avec le contenu de Judith?
- Peut-on importer des templates CapCut ou faut-il les créer from scratch?
- Combien de templates faut-il pour couvrir les 4 styles (enseigner/connecter/aider/inspirer)?

### Thème 5 — Animations de texte
Recherche :
- Animations de texte CapCut-style (typewriter, slide-in, bounce, fade, etc.)
- Comment animer du texte frame-par-frame dans un Canvas 2D
- Librairies JS d'animation de texte (GSAP, anime.js, motion.dev)
- Animations par mot (karaoké-style, word-by-word reveal)

Questions à répondre :
- Comment rendre une animation de texte dans un export seek-based (pas en temps réel)?
- Quelle librairie d'easing/interpolation utiliser dans le Canvas?
- Performance des animations texte complexes sur Safari iOS?
- Peut-on pré-compiler les animations en keyframes pour l'export?

### Thème 6 — Qualité d'export et codec
Recherche :
- Paramètres optimaux WebCodecs pour Instagram/TikTok/YouTube Shorts
- H.264 vs H.265 (HEVC) support dans WebCodecs
- Bitrate recommandé par plateforme (Instagram, Facebook, YouTube)
- Color space (BT.709 vs BT.601), HDR support
- mp4-muxer vs alternatives pour le muxing in-browser

Questions à répondre :
- Est-ce qu'Instagram re-encode notre vidéo? Si oui, quel codec utiliser pour minimiser la perte?
- Quel est le bitrate sweet spot pour chaque plateforme?
- WebCodecs supporte-t-il le H.265 sur Safari iOS?
- Peut-on exporter en VP9/AV1 pour de la meilleure qualité à même taille?

### Thème 7 — Server-side rendering et offloading
Recherche :
- Solutions de rendering vidéo côté serveur (Remotion, FFmpeg API, Shotstack, Creatomate)
- Cloud Functions pour le post-traitement vidéo
- Remotion (React → vidéo) — est-ce viable pour notre cas?
- APIs de rendering vidéo (Shotstack, Creatomate, Render.com)
- Comparaison coût/qualité : client-side WebCodecs vs server-side FFmpeg

Questions à répondre :
- Faut-il exporter côté client ET post-traiter côté serveur?
- Remotion peut-il tourner dans une Cloud Function?
- Quel est le coût d'un service comme Shotstack/Creatomate par vidéo?
- Peut-on utiliser FFmpeg dans une Cloud Function Firebase (Cloud Run)?
- Quelle est la latence acceptable pour un export serveur?

### Thème 8 — Stickers, emojis animés, et overlays graphiques
Recherche :
- Stickers animés (Lottie, GIF, APNG) dans un éditeur vidéo web
- Lottie animations rendues dans un Canvas 2D pour l'export
- Bibliothèques de stickers/emojis pour social media
- Comment Canva/CapCut gèrent les stickers dans l'éditeur

Questions à répondre :
- Lottie peut-il être rendu frame-par-frame dans un Canvas pour l'export?
- Quelles bibliothèques de stickers gratuits/payants sont disponibles?
- Performance de Lottie sur Safari iOS?
- Format de données pour les stickers (position, timing, scale, rotation)?

### Thème 9 — Audio avancé
Recherche :
- Bibliothèques de musique libre de droits pour social media (Jamendo, Pixabay, etc.)
- Audio ducking (baisser la musique quand Judith parle) — algorithme et implémentation
- Voice enhancement (noise removal, EQ, compression) dans le navigateur
- Web Audio API capabilities pour le post-traitement audio

Questions à répondre :
- Peut-on faire du noise removal en temps réel avec Web Audio API?
- Audio ducking : comment détecter la voix et baisser la musique automatiquement?
- Quelles bibliothèques de musique libre sont intégrables via API?
- Web Audio API : compresseur dynamique pour normaliser le volume de la voix?

### Thème 10 — Sous-titres avancés
Recherche :
- Styles de sous-titres CapCut (karaoké highlight, word-by-word, animated reveal)
- Comment rendre des sous-titres animés frame-par-frame dans Canvas
- Algorithmes de groupement de mots pour les sous-titres (combien de mots par ligne?)
- Fonts et styles de sous-titres les plus engageants sur Instagram

Questions à répondre :
- Comment implémenter le style "karaoké" (mot actif en surbrillance)?
- Combien de mots par ligne pour les sous-titres mobile (écran 9:16)?
- Quels sont les 5 styles de sous-titres les plus populaires sur CapCut?
- Comment animer la révélation des sous-titres mot par mot dans l'export?

## Format du rapport

Génère le rapport dans `project-docs/03_RESEARCH/EDITOR_PRO_RESEARCH.md` avec :

Pour chaque thème :
1. **Résumé** — Ce qui existe et ce qui est viable
2. **Librairies trouvées** — Nom, URL, license, taille, compatibilité Safari iOS
3. **Recommandation** — Ce qu'on devrait utiliser et pourquoi
4. **Effort estimé** — Simple / Moyen / Complexe
5. **Impact pour Judith** — Comment ça améliore son contenu

À la fin :
- **Roadmap recommandée** — Priorisation des thèmes par impact/effort
- **Stack technique finale** — Les librairies à installer
- **Quick wins** — Ce qu'on peut faire en 1-2 prompts Claude Code
- **Projets moyens** — Ce qui prend 3-5 prompts
- **Projets ambitieux** — Ce qui prend 10+ prompts

## Référence
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts` — pipeline d'export actuel
- `lib/utils/drawOverlays.ts` — rendu des overlays texte
- `lib/utils/drawSubtitles.ts` — rendu des sous-titres
- `lib/utils/filters.ts` — filtres CSS actuels
- `components/features/editor/VideoPreview.tsx` — preview vidéo
- `lib/hooks/useVideoExport.ts` — orchestrateur export
