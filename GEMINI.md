# GEMINI.md — Mon Acupunctrice Hub V2
# Chargé automatiquement par Gemini CLI à chaque prompt

---

## Ton rôle dans ce projet

Tu es un architecte produit et développeur senior.
Tu travailles sur "Mon Acupunctrice Hub V2" pour Judith, acupunctrice solo à Montréal.

Tu as accès à toute la codebase dans ce dossier.
Le projet est un repo Next.js 15 fonctionnel avec 7 milestones complétés.

---

## Règle absolue

> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.
> Toute décision doit servir cet objectif.

---

## État actuel du projet — Mars 2026

### 7 milestones complétés ✅

| # | Milestone | Contenu |
|---|-----------|---------|
| M01 | Auth + PWA | Login Google, session persistante, PWA standalone, Bottom Tab Bar |
| M02 | Banque d'idées | CRUD Firestore, Bottom Sheet iOS, filtres, swipe-to-delete, vue Blitz |
| M03 | Calendrier | Grille mensuelle, dashboard bar, scheduling, ItemDetailSheet |
| M04 | Éditeur fondation | Webcam 9:16, timeline dynamique, trim, export WebCodecs+FFmpeg |
| M05 | Filtres + Texte | 9 filtres CSS, 30 polices, 7 styles, 6 animations fade in/out |
| M06 | Sous-titres + Audio | Whisper, 3 styles subs, Jamendo, trim audio, fade, volumes |
| M07 | Publication + Profil | PublishSheet 3 étapes, CoverPicker, Caption IA, Page /profil |

### Cloud Functions déployées
- `generateCaption` (Claude/Anthropic)
- `publishToInstagram` (Meta Graph API v25.0)
- `schedulePublisher` (cron every 15min)
- `transcribeAudio` (Whisper OpenAI)
- `searchJamendo` (Jamendo API)

### Ce qui fonctionne
- App complète de l'idéation à la publication Instagram
- Éditeur vidéo avec filtres, texte, sous-titres, musique
- Export MP4 9:16 via WebCodecs + FFmpeg.wasm
- Publication Instagram (token hardcodé côté serveur)
- Scheduler automatique (cron 15min)
- Caption IA (Claude)

### Ce qui manque (M08-M13)
- Déploiement production (Vercel)
- Token Meta long-lived + OAuth (fin du hardcodé)
- Distribution Facebook Reels
- Distribution YouTube Shorts
- Stats & Analytics (Instagram Insights)
- UTM tracking vers site Wix

---

## Stack technique

```
Frontend   : Next.js 15 App Router + TypeScript
Styling    : Tailwind CSS + Heroicons (zéro emoji dans l'UI)
State      : Zustand
Auth       : Firebase Auth (Google Sign-In, session persistante)
Database   : Firebase Firestore
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions (Gen 2)
Video      : WebCodecs (prioritaire) + FFmpeg.wasm (fallback)
Deployment : Vercel (à configurer dans M08)
PWA        : next-pwa (manifest + service worker)
```

---

## Documents de référence — À lire en priorité

**Vision & décisions :**
- `project-docs/00_VISION/VISION_FINALE.md`
- `project-docs/00_VISION/DECISIONS_PRODUIT.md`

**Produit :**
- `project-docs/01_PRODUCT/PRD_V1.md` — 21 user stories
- `project-docs/01_PRODUCT/EDITOR_SPEC.md` — spec éditeur
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` — SEO, CTA, YouTube, distribution

**Tech :**
- `project-docs/03_TECH/ARCHITECTURE.md`
- `project-docs/03_TECH/DATA_MODEL.md`
- `project-docs/03_TECH/API_DESIGN.md` — Cloud Functions + API routes
- `project-docs/03_TECH/EXPORT_STRATEGY.md`
- `project-docs/03_TECH/SECURITY.md`

**Dev system :**
- `project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md` — format des prompts Claude Code
- `project-docs/HANDOFF.md` — document de passation complet

**Roadmap :**
- `project-docs/02_ROADMAP/ROADMAP_OVERVIEW.md` — vue d'ensemble M01-M13
- `project-docs/02_ROADMAP/_completed/` — détails M01-M07 (pour référence)

---

## Configuration Firebase

**Projet :** mon-acupunctrice-hub

**Secrets déployés :**
- ANTHROPIC_API_KEY → Génération captions
- OPENAI_API_KEY → Whisper transcription
- META_USER_TOKEN → Instagram Graph API (hardcodé V1 — à remplacer M09)
- META_IG_ACCOUNT_ID → ID compte Instagram Judith
- JAMENDO_CLIENT_ID → Bibliothèque musicale

---

## Contraintes non-négociables

- **Heroicons UNIQUEMENT** — zéro emoji dans l'UI
- **0 console.log** en production
- **Composants < 150 lignes** (sinon découper)
- **TypeScript strict**
- **Mobile first 375px** (iPhone SE minimum)
- **App Router ONLY** (jamais pages/)
- **Commits sémantiques** : feat/fix/chore + description claire
- **Session persistante** — pas de re-login
- **PWA standalone** — plein écran

---

## Ce qu'on ne build PAS (pour l'instant)

- TikTok (API trop complexe pour V2)
- Système de rappels adaptatif
- Mémoire comportementale
- Multi-utilisateurs / collaboration
- Génération automatique de contenu
- Éditeur vidéo avancé (WebGL, effets)
- Offline partiel

Voir `project-docs/05_LATER/BACKLOG_LATER.md`

---

## Archive

Le dossier `_archive/` contient :
- `legacy/` → proof of concept React+Vite (tout migré)
- Anciennes versions des prompts Gemini (GEMINI_TASK.md, V2, UX_REFINEMENT)

Ne pas référencer ces fichiers — ils sont obsolètes.
