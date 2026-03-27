# GEMINI.md — Mon Acupunctrice Hub V2
# Chargé automatiquement par Gemini CLI à chaque prompt

---

## Ton rôle dans ce projet

Tu es un architecte produit et développeur senior.
Tu travailles sur "Mon Acupunctrice Hub V2" pour Judith, acupunctrice solo à Montréal.

Tu as accès à toute la codebase dans ce dossier.
Le projet est un repo Next.js 15 fonctionnel et déployé en production.

---

## Règle absolue

> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.
> Toute décision doit servir cet objectif.

---

## État actuel du projet — Mars 2026

### Phase actuelle : ÉDITEUR PRO

On est passés de "construire l'outil" → "construire la stratégie" → "construire un éditeur pro".
L'app est stable et fonctionnelle. Judith publie du contenu. L'objectif maintenant
est de transformer l'éditeur de base en un éditeur de qualité professionnelle
(CapCut-level) pour que le contenu de Judith accroche davantage.

**Branche active :** `feature/editor-pro`

### Milestones complétés ✅

| # | Milestone | Contenu |
|---|-----------|---------|
| M01-M12 | App complète | Auth, idées, calendrier, éditeur, publication multi-plateforme, stats |
| S01-S08 | Phase Stratégie | Styles de contenu, calendrier-cadre, séquences blog, templates |
| E01 | Éditeur améliorations | Divider draggable, trim handles, drag blocs, anti-swipe Safari |
| Multi-clip M1 | Store refactoré | `clips: VideoClip[]` remplace `videoFile: File`, rétrocompat legacy |

### Travaux récents (Mars 24-26, 2026)

**Éditeur :**
- Trim handles avec feedback jaune (ambre) pendant le trim
- Drag-and-drop des blocs texte/sous-titres avec feedback visuel
- Anti-swipe Safari iOS (overscroll-behavior-x, data-timeline)
- Preview noire hors-trim (visibility hidden)
- Persistance editorData dans Firestore (sous-titres, overlays, trim)
- Persistance vidéo source dans Storage + état 'filmée' après import
- Cover picker avant l'export (dans l'éditeur, pas dans PublishSheet)
- Store multi-clip M1 (clips[], activeClipId, syncLegacyFields)

**Export :**
- Seek-based loop (3-6x plus rapide que temps réel)
- H.264 High Profile 8 Mbps (optimisé pour re-encode Instagram)
- Audio via Web Audio API fallback (Safari iOS — FFmpeg.wasm ne charge pas)
- Keyframe chaque 1s, latencyMode quality

**Publication :**
- Instagram Reels ✅ via Cloud Function
- Facebook Reels ✅ via API route
- YouTube Shorts ✅ via API route
- Stories → Web Share API (navigator.share files) remplace API Graph
  - Judith partage vers Instagram via la share sheet iOS native
  - Elle peut ajouter le sticker mention @lasourceensoi dans l'app Instagram
  - Le flow blog (cron) continue de publier les stories images via API Graph
- Captions multi-plateformes (IG/FB/YT) générées depuis la transcription

**Profil :**
- Liens rapides vers Instagram, Facebook, YouTube Studio, Wix
- Filtre par style (enseigner/connecter/aider/inspirer) remplace catégories

### Multi-clip — Backlog prêt

Le multi-clip M2-M4 est planifié mais déféré (Judith n'en a pas besoin maintenant).
Prompts + reviews sont prêts dans le backlog :

| Milestone | Status | Fichiers |
|-----------|--------|----------|
| M1 Store | ✅ Livré | `lib/store/useEditorStore.ts` |
| M2 Timeline + Preview | 📋 Prompt prêt + review | `prompts_used/multiclip_M2_timeline/` |
| M3 Interactions | 📋 Prompt prêt + review | `prompts_used/multiclip_M3_interactions/` |
| M4 Export | 📋 Prompt prêt + review | `prompts_used/multiclip_M4_export/` |
| Review M2-M4 | ✅ Fait | `analysis/MULTICLIP_M2M3M4_REVIEW.md` |

### Éditeur Pro — Phase active

3 rapports de recherche complétés + document d'architecture :

| Document | Contenu |
|----------|---------|
| `03_RESEARCH/EDITOR_PRO_RESEARCH.md` | Recherche initiale : librairies, quick wins |
| `03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` | Recherche approfondie : 30 fonts, 7 effets texte, 22 animations, LUTs, transitions |
| `03_RESEARCH/EDITOR_ARCHITECTURE_RESEARCH.md` | Architecture : rendering pipelines, SDKs, Remotion, WebGL |
| `03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` | Document d'architecture final : rendering pipeline, effect stack, plan 4 phases |

**Décisions clés :**
- BUILD tout (pas de SDK externe) sauf lottie-web pour les stickers
- Canvas 2D natif pour le rendering (pas WebGL, pas PixiJS, pas Fabric.js)
- Preview CSS/DOM (rapide) + Export Canvas 2D frame-by-frame (qualité max)
- Effect stack chainable (filter → LUT → grain → vignette)
- 28 prompts sur 4 phases (~4-6 mois)

**Plan en 4 phases :**
- Phase 1 (Mois 1) : Fonts 30, effets texte 8, animations 11, filtres 10, sous-titres 10 styles
- Phase 2 (Mois 2) : LUTs cinématiques, grain/vignette, transitions, templates V1
- Phase 3 (Mois 3) : Stickers Lottie, audio ducking, export Worker
- Phase 4 (Mois 4-6) : WebGL preview, undo/redo, polish, WebGPU

---

## Stack technique

```
Frontend   : Next.js 15 App Router + TypeScript
Styling    : Tailwind CSS + Heroicons (zéro emoji dans l'UI)
State      : Zustand (store multi-clip avec syncLegacyFields)
Auth       : Firebase Auth (Google Sign-In)
Database   : Firebase Firestore
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions (Gen 2)
Video      : WebCodecs (seek-based export) — PAS FFmpeg.wasm (Safari iOS)
Audio      : Web Audio API (extraction, décodage)
Muxing     : mp4-muxer (in-browser MP4)
Deployment : Vercel (mon-acupunctrice-v2.vercel.app)
PWA        : next-pwa (manifest + service worker)
Charts     : recharts
```

---

## Structure de la codebase

```
app/
  (app)/                     → Pages protégées
    calendrier/page.tsx      → Vue calendrier (semaine + mois)
    idees/page.tsx           → Banque d'idées (filtre par style)
    editeur/[id]/page.tsx    → Éditeur vidéo
    profil/page.tsx          → Profil + liens plateformes
    stats/page.tsx           → Stats Instagram
    blitz/page.tsx           → Mode Blitz
    inspiration/page.tsx     → Templates et hooks
  api/
    cron/publish/            → Cron publication multi-plateforme
    generate-captions/       → 3 captions (IG/FB/YT) depuis transcription
    generate-caption-v2/     → Caption unique par plateforme (fallback)
    publish/                 → Publication Instagram
    publish-facebook/        → Publication Facebook
    publish-youtube/         → Publication YouTube
    publish-story/           → Story API Graph (inactif — remplacé par Web Share)
    transcribe/              → Transcription Whisper
    scrape-og/               → Scraping Open Graph pour séquences blog

components/features/
  editor/
    EditorLayout.tsx         → Layout éditeur (preview + timeline + panels)
    VideoPreview.tsx         → Preview vidéo avec overlays
    ImportModal.tsx          → Import vidéo (webcam, fichier, écran)
    ExportButton.tsx         → Export + upload
    ResizeDivider.tsx        → Divider draggable (3 presets)
    timeline/
      Timeline.tsx           → Container timeline avec playhead
      Track.tsx              → Piste vidéo (trim handles)
      TextTrack.tsx          → Piste texte (blocs draggables)
      SubtitleTrack.tsx      → Piste sous-titres (blocs draggables)
      AudioTrackTimeline.tsx → Piste audio
      TrimHandle.tsx         → Handle de trim (feedback ambre)
    panels/
      TrimPanel.tsx          → Panel trim
      FilterPanel.tsx        → Panel filtres
      TextPanel.tsx          → Panel texte (ajout/édition overlays)
      SubtitlePanel.tsx      → Panel sous-titres
      AudioPanel.tsx         → Panel audio (Jamendo, volumes)
      CoverPanel.tsx         → Panel cover (sélection frame/custom)
    text/
      TextOverlay.tsx        → Overlays texte interactifs (drag, resize)
    subtitles/
      SubtitlePreview.tsx    → Preview sous-titres temps réel
  publish/
    PublishSheet.tsx          → Flow publication (captions → toggles → publier)
    CaptionEditor.tsx        → 3 tabs IG/FB/YT, génération depuis transcription
    PlatformToggles.tsx      → Toggles Facebook + YouTube
  calendar/                  → Calendrier, slots, séquences blog
  ideas/                     → Banque d'idées, filtres, actions
  profile/                   → Connexion Instagram/Facebook/YouTube

lib/
  store/useEditorStore.ts    → Store Zustand multi-clip (clips[], syncLegacyFields)
  types/editor.ts            → VideoClip, TextOverlayItem, SubtitleSegment, etc.
  utils/
    exportWebCodecs.ts       → Export seek-based (H.264 8Mbps, Canvas 2D)
    drawOverlays.ts          → Rendu texte Canvas pour l'export
    drawSubtitles.ts         → Rendu sous-titres Canvas pour l'export
    filters.ts               → Presets de filtres CSS
    publishHelpers.ts        → Helpers publication (IG, FB, YT, Story)
    platformOptimization.ts  → STYLE_CTAS, durées idéales par plateforme
    fontLoader.ts            → Chargement Google Fonts pour Canvas
    storyImageGenerator.ts   → Génération images Story pour séquences blog
    deriveWorkflowState.ts   → Dérivation de l'état workflow
  hooks/
    useVideoExport.ts        → Orchestrateur export (audio + vidéo + upload)
    useTranscription.ts      → Whisper + Web Audio API fallback
    useEditorPersistence.ts  → Auto-save editorData dans Firestore
    useVideoSourceUpload.ts  → Upload vidéo source en arrière-plan
    usePublish.ts            → Publication Instagram via CF
    useMultiPlatformPublish.ts → Orchestration Facebook + YouTube
    useBlogSequence.ts       → Séquences blog (J+0 story, J+1 reel, etc.)
```

---

## Documents de référence — Priorité

**Recherche éditeur pro (à lire pour la phase actuelle) :**
- `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` → Architecture finale
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` → Effets, fonts, Canvas
- `project-docs/03_RESEARCH/EDITOR_ARCHITECTURE_RESEARCH.md` → Rendering pipelines

**Backlog multi-clip :**
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md` → Plan M1-M4
- `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M1_REVIEW.md` → Review M1
- `project-docs/04_DEV_SYSTEM/analysis/MULTICLIP_M2M3M4_REVIEW.md` → Review M2-M4

**Prompts prêts :**
- `project-docs/02_ROADMAP/prompts_used/` → Tous les prompts Claude Code

---

## Profil de Judith

- Acupunctrice solo à La Source en Soi (Rosemont, Montréal)
- À l'aise devant la caméra, publie ~2x/semaine
- N'aime PAS les suggestions de contenu par IA — veut une STRUCTURE
- Les 4 styles : Enseigner / Connecter / Aider / Inspirer
- Site Wix : acupuncturejudith.ca (redirige depuis mon-acupunctrice.ca)
- Go Rendez-Vous : lasourceensoi, employeeId 7556837
- Utilise le Hub depuis son iPhone (Safari iOS PWA)

---

## Canaux de distribution

| Canal | Status | Méthode |
|-------|--------|---------|
| Instagram Reels | ✅ | CF publishToInstagram + cron |
| Instagram Stories | ✅ | Web Share API (share sheet iOS → Instagram app) |
| Facebook Reels | ✅ | API route + cron |
| YouTube Shorts | ✅ | API route + cron |
| Stories blog auto | ✅ | Cron + API Graph (images, sans mention) |

---

## Contraintes non-négociables

- **Heroicons UNIQUEMENT** — zéro emoji dans l'UI
- **0 console.log** en production (sauf [EXPORT], [PUBLISH] pour debug)
- **Composants < 150 lignes** (sinon découper)
- **TypeScript strict**
- **Mobile first 375px** (iPhone SE minimum)
- **App Router ONLY**
- **Safari iOS compatible** — FFmpeg.wasm ne charge pas, utiliser Web Audio API
- **PWA standalone** — plein écran
- **Canvas 2D natif** pour l'export (pas WebGL, pas PixiJS, pas Fabric.js)
- **1 seule dépendance externe** autorisée : lottie-web (Phase 3)

---

## Ce qu'on ne build PAS (pour l'instant)

- TikTok (API trop complexe)
- Multi-utilisateurs / collaboration
- Génération automatique de contenu (Judith ne veut pas)
- WebGL rendering (Canvas 2D suffit pour 90% des effets)
- SDK externe (img.ly, PixiJS, Fabric.js)
- Remotion server-side (pas nécessaire pour des Reels 30-90s)
- WebGPU (iOS 26 pas encore majoritaire)

Voir `project-docs/05_LATER/BACKLOG_LATER.md`
