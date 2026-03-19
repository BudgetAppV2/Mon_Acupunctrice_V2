# GEMINI_TASK_V2.md
# Tâche V2 — Refaire les milestones avec éditeur pro comme feature core
# Usage: gemini puis coller ce contenu

---

La vision du produit est maintenant complète et validée.
Lis TOUS ces documents AVANT de générer quoi que ce soit :

**Vision & décisions :**
- `project-docs/00_VISION/VISION_FINALE.md`
- `project-docs/00_VISION/DECISIONS_PRODUIT.md`

**Produit :**
- `project-docs/01_PRODUCT/PRD_V1.md`
- `project-docs/01_PRODUCT/EDITOR_SPEC.md`
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md`
- `project-docs/01_PRODUCT/COVER_IMAGE_SPEC.md`

**Tech :**
- `project-docs/03_TECH/ARCHITECTURE.md`
- `project-docs/03_TECH/DATA_MODEL.md`
- `project-docs/03_TECH/API_DESIGN.md`
- `project-docs/03_TECH/EXPORT_STRATEGY.md`

**Dev system :**
- `project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md`

## Ce qui change vs. la version précédente

1. L'éditeur est aussi important que la banque d'idées et le calendrier
2. Les user stories sont maintenant définies (US-01 à US-21)
3. Le calendrier = vue + scheduling (pas juste voir)
4. Pas de drag-and-drop dans le calendrier
5. L'éditeur a 8 features détaillées (F2.1 à F2.8)

## Tâche

Supprimer et réécrire ces fichiers avec beaucoup plus de détail :

---

### project-docs/02_ROADMAP/MILESTONE_01.md
Auth Google + Structure Next.js + PWA

Inclure :
- Objectif en 1 phrase
- User stories couvertes : (aucune user story métier — c'est la fondation)
- Livrables précis (liste de TOUS les fichiers à créer avec leur rôle)
- Structure complète des dossiers Next.js à créer
- Configuration PWA (manifest.json, next-pwa, meta tags iOS)
- Configuration Firebase (firebase.ts, AuthContext, useAuth)
- Tailwind config avec palette sage/sand/statuts
- Heroicons comme seule bibliothèque d'icônes
- Contraintes (App Router only, TypeScript strict, mobile 375px)
- Definition of Done (checkboxes précises et vérifiables)
- Prompt one shot COMPLET et détaillé pour Claude Code

---

### project-docs/02_ROADMAP/MILESTONE_02.md
Banque d'idées — CRUD complet + Vue Blitz

User stories couvertes : US-01, US-02, US-03, US-04

Inclure pour chaque feature :
- Composants React à créer (nom exact + rôle)
- Schéma Firestore utilisé (depuis DATA_MODEL.md)
- États UI (loading, empty, error, success)
- Interactions mobiles (swipe, tap, long press)
- Empty state avec message encourageant

Livrables :
- Page /idees avec liste filtrable
- Formulaire création d'idée (bottom sheet)
- ContentCard composant avec badge statut
- Page /blitz (session de tournage)
- Hooks Firestore custom (useContentItems, useCreateItem)

---

### project-docs/02_ROADMAP/MILESTONE_03.md
Calendrier éditorial — Vue + Scheduling

User stories couvertes : US-14, US-15, US-16, US-17

Spécifications précises :
- Grille mensuelle custom (PAS de lib externe comme react-calendar)
- Chaque cellule : dot coloré ou thumbnail mini
- Navigation mois avec swipe horizontal
- Tap sur date vide → assigner un contenu "prêt"
- Tap sur item → bottom sheet détail (thumbnail + statut + actions)
- Actions depuis le détail : Modifier · Publier maintenant · Déprogrammer
- Barre dashboard en haut : "X publiés · X planifiés · X prêts · X idées"
- PAS de drag-and-drop

---

### project-docs/02_ROADMAP/MILESTONE_04.md
Éditeur — Fondation (import + trim + timeline + export)

User stories couvertes : US-05, US-06, US-07, US-12, US-13

C'est le milestone le plus complexe. Détailler précisément :

**Architecture éditeur :**
- Layout vertical : preview 9:16 en haut (40vh), contrôles en bas
- Navigation par onglets en bas : Trim · Filtres · Texte · Sous-titres · Audio
- Store Zustand : useEditorStore (currentTime, duration, trimStart,
  trimEnd, isPlaying, overlays, subtitles, audioUrl, filter, videoFile)

**Timeline multi-track :**
- Track vidéo (sage green)
- Track audio (purple)
- Track textes (blue)
- Track sous-titres (yellow)
- Playhead draggable (via Pointer Events, seekTo dans le store)
- Hauteur totale fixe 80px

**Import vidéo :**
- Depuis Photos iOS (input file accept="video/*")
- Webcam (MediaRecorder API)
- fix-webm-duration pour les fichiers WebM

**Headers COOP/COEP dans next.config.ts** (requis pour FFmpeg.wasm)

**Export :**
- FFmpeg.wasm @ffmpeg/ffmpeg
- Preset : H.265, CRF 23, ultrafast, 9:16
- Feedback de progression
- Upload Firebase Storage après export
- Mise à jour Firestore : videoUrl + thumbnailUrl + workflowState="ready"

**Proxys API routes Next.js** (remplacent Express server.js du legacy) :
- /api/proxy-video
- /api/proxy-image
- /api/proxy-audio

---

### project-docs/02_ROADMAP/MILESTONE_05.md
Éditeur — Filtres + Texte overlay + Polices

User stories couvertes : US-08, US-09

**F2.4 Filtres vidéo :**
- 9 presets CSS appliqués sur l'élément <video>
- Grid horizontale scrollable dans l'onglet Filtres
- Nom + preview miniature pour chaque filtre
- Intensité via slider (CSS filter opacity)
- Filtres stockés dans useEditorStore et appliqués à l'export FFmpeg

**F2.5 Texte overlay graphique :**
- Rendu via Konva.js (canvas) sur la preview vidéo
- 30+ polices Google Fonts chargées dynamiquement via FontFace API
- Organisées par catégorie : Bold · Élégant · Moderne · Fun · Zen
- 7 styles preset (Classic, Neon, Gold, Shadow, Bubbly, Minimal, Dark Pill)
- 5 animations d'entrée (Fade, Slide Up, Slide Left, Bounce, Zoom)
- Drag sur la preview pour repositionner
- Slider taille
- Timing sur la timeline (début/fin)
- Boutons Haut/Centre/Bas pour position rapide

---

### project-docs/02_ROADMAP/MILESTONE_06.md
Éditeur — Sous-titres + Audio

User stories couvertes : US-10, US-11

**F2.6 Sous-titres :**
- Cloud Function transcribeAudio → Whisper API
- Réutiliser legacy/functions/src/transcribe.ts
- timestamp_granularities: ['word'] pour timing précis
- Groupes de 3 mots via @remotion/captions createTikTokStyleCaptions
- 3 styles : Classique · TikTok (word highlight) · Karaoké
- Édition manuelle par segment dans le panneau
- Position + taille dans useEditorStore.subtitleConfig

**F2.7 Bibliothèque musicale Jamendo :**
- Cloud Function searchJamendo
- Réutiliser legacy/functions/src/jamendo.ts
- Onglet Bibliothèque : recherche + filtres mood
- Preview audio via /api/proxy-audio (headers CORP/CORS)
- Import → synchronisation avec la lecture vidéo via useVideoPlayer
- Volume musique vs. voix original (sliders indépendants)

---

### project-docs/02_ROADMAP/MILESTONE_07.md
Publication Instagram + Dashboard

User stories couvertes : US-18, US-19, US-20, US-21

**F4.1 Publier maintenant :**
- Bouton dans EditorToolbar et dans le détail calendrier
- Modal : thumbnail + caption éditable + confirmation
- Réutiliser legacy/functions/src/index.ts (publishToInstagram)
- Mise à jour statut → "published"

**F4.2 Scheduler :**
- Date + heure picker (UI iOS native)
- Cloud Function schedulePublisher (cron every 15min)
- Email notification si échec

**F4.3 Caption IA :**
- Réutiliser legacy/functions/src/index.ts (generateCaption)
- Prompt adapté : français québécois + CTA Wix + hashtags acupuncture

**F4.4 Dashboard :**
- 1 ligne en haut du calendrier
- Calculé depuis Firestore en temps réel

---

## Format exigé pour chaque milestone

Chaque document MILESTONE_XX.md doit contenir :

1. **Objectif** — 1 phrase claire
2. **User stories couvertes** — liste des US-XX
3. **Dépendances** — milestones précédents requis
4. **Livrables précis** — liste de tous les fichiers à créer/modifier
5. **Spécifications techniques détaillées** — par feature
6. **Contraintes** — ce qu'on ne fait PAS dans ce milestone
7. **Definition of Done** — checkboxes vérifiables
8. **Prompt one shot pour Claude Code** — complet, copy-paste ready

Le prompt one shot doit être suffisamment détaillé pour que
Claude Code puisse l'implémenter sans poser de questions.
Inclure les noms de fichiers exacts, les interfaces TypeScript,
les configurations importantes.

---

## Contraintes globales à respecter dans tous les milestones

- Next.js 15 App Router ONLY (jamais Pages Router)
- TypeScript strict
- Tailwind CSS + Heroicons uniquement
- Mobile first 375px
- PWA standalone
- Session Firebase persistante
- 0 console.log en production
- Composants < 150 lignes (sinon découper)
