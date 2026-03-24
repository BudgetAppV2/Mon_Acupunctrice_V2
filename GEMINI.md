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

### Milestones complétés ✅

| # | Milestone | Contenu |
|---|-----------|---------|
| M01 | Auth + PWA | Login Google, session persistante, PWA standalone, Bottom Tab Bar |
| M02 | Banque d'idées | CRUD Firestore, Bottom Sheet iOS, filtres, swipe-to-delete |
| M03 | Calendrier | Grille mensuelle, dashboard bar, scheduling, ItemDetailSheet |
| M04 | Éditeur fondation | Webcam 9:16, timeline dynamique, trim, export WebCodecs+FFmpeg |
| M05 | Filtres + Texte | 9 filtres CSS, 30 polices, 7 styles, 6 animations fade in/out |
| M06 | Sous-titres + Audio | Whisper, 3 styles subs, Jamendo, trim audio, fade, volumes |
| M07 | Publication + Profil | PublishSheet 3 étapes, CoverPicker, Caption IA, Page /profil |
| M08 | Deploy Vercel | Production sur mon-acupunctrice-v2.vercel.app |
| M09 | OAuth Instagram | Business Login, token long-lived, Meta App ID 823305796703895 |
| M10 | Facebook Reels | OAuth Facebook Page, publication Reels via Graph API |
| M11 | YouTube Shorts | OAuth Google, resumable upload, publication Shorts |
| M12 | Stats & Analytics | Instagram Insights, recharts, cron quotidien fetch-insights |
| R | Refinements UX | 9 fixes en 3 one-shots (IdeaDetailSheet, catégories, captions) |
| R2 | Transcription vocale | Whisper + Claude, idées dictées vocalement |
| R3 | Éditeur multi-blocs | Narration, duplication, timeline texte |
| SCHEDULER | Cron Vercel | Publication automatique planifiée |

### Phase actuelle : STRATÉGIE

On est passés de "construire l'outil" à "construire le système qui guide
Judith à créer du contenu régulier et efficace".

**Roadmap Phase Stratégie :** `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md`

| ID | Nom | Description courte |
|----|-----|--------------------|
| S01 | Catégorisation par style | Enseigner/Connecter/Aider/Inspirer sur chaque contenu |
| S02 | Calendrier-cadre | Slots hebdomadaires typés avec gradation progressive |
| S03 | Stories Instagram API | Publication Stories via media_type=STORIES |
| S04 | Séquences blogue | Pipeline article → stories auto + slots Reels |
| S05 | Optimisation plateforme | Captions adaptées par plateforme, CTA rotatifs |
| S06 | Banque de templates | Hooks et structures de captions comme référence |
| S07 | Encouragement & progression | Cercle progression, séries, jalons |
| S08 | Calendrier visuel enrichi | Code couleur, séquences visuelles, résumé mensuel |

### Cloud Functions déployées
- `generateCaption` (Claude/Anthropic)
- `publishToInstagram` (Meta Graph API v25.0)
- `transcribeAudio` (Whisper OpenAI)
- `searchJamendo` (Jamendo API)

### Cron Vercel (vercel.json)
- `/api/cron/publish` — 1x/jour à midi UTC (8h Montréal)
- `/api/cron/fetch-insights` — 1x/jour à 10h UTC (6h Montréal)
Note : plan Hobby = 1 exécution/jour/route max

### Ce qui fonctionne
- App complète de l'idéation à la publication multi-plateforme
- Éditeur vidéo avec filtres, texte, sous-titres, musique
- Export MP4 9:16 via WebCodecs + FFmpeg.wasm
- Publication Instagram + Facebook + YouTube
- Scheduler automatique (cron quotidien)
- Caption IA (Claude)
- Stats Instagram Insights
- Transcription vocale d'idées

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
Deployment : Vercel (mon-acupunctrice-v2.vercel.app)
PWA        : next-pwa (manifest + service worker)
Charts     : recharts (M12)
```

---

## Structure de la codebase

```
app/
  (app)/                     → Pages protégées (auth required)
    calendrier/page.tsx      → Vue calendrier mensuel
    idees/page.tsx           → Banque d'idées
    editeur/page.tsx         → Éditeur vidéo
    profil/page.tsx          → Profil + stats résumé
    stats/page.tsx           → Stats détaillées
    blitz/page.tsx           → Page vide (placeholder)
    layout.tsx               → Layout avec BottomTabBar
  (auth)/                    → Pages auth (login)
  api/
    cron/publish/route.ts    → Cron publication multi-plateforme
    cron/fetch-insights/     → Cron stats Instagram
    generate-caption/        → Génération caption IA
    publish/                 → Publication Instagram manuelle
    publish-facebook/        → Publication Facebook manuelle
    publish-youtube/         → Publication YouTube manuelle
    voice-idea/              → Transcription vocale d'idées
    transcribe/              → Transcription sous-titres
    search-music/            → Recherche Jamendo
    auth/                    → OAuth callbacks (Meta, Google)

components/
  features/
    calendar/                → CalendarView, CalendarDay, CalendarHeader,
                               DashboardBar, ItemDetailSheet, ScheduleSheet
    ideas/                   → Composants banque d'idées
    editor/                  → Éditeur vidéo complet
    publish/                 → PublishSheet, CoverPicker
    profile/                 → Profil utilisateur
    stats/                   → Graphiques recharts
  ui/                        → Composants réutilisables (boutons, inputs, sheets)

lib/
  types/index.ts             → Tous les types TypeScript
  hooks/                     → useCalendar, useContentItems, usePublish, etc.
  store/                     → Zustand stores
  utils/                     → Utilitaires
  firebase.ts                → Config Firebase client
  firebase-admin.ts          → Config Firebase Admin (server-side)
```

---

## Documents de référence — À lire en priorité

**Vision & stratégie :**
- `project-docs/HANDOFF.md` → Résumé complet pour toute nouvelle session
- `project-docs/01_PRODUCT/STRATEGIE/CENTRE_NEVRALGIQUE.md` → Vision stratégique
- `project-docs/01_PRODUCT/CALENDRIER_CADRE.md` → Plan 6 mois
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` → SEO, CTA, conversion

**Roadmap :**
- `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md` → Phase actuelle (S01-S08)
- `project-docs/02_ROADMAP/ROADMAP_OVERVIEW.md` → Vue d'ensemble historique

**Tech :**
- `project-docs/03_TECH/DATA_MODEL.md` → Schema Firestore
- `project-docs/03_TECH/ARCHITECTURE.md` → Architecture technique
- `project-docs/03_TECH/API_DESIGN.md` → Cloud Functions + API routes

**Dev system :**
- `skills/oneshot-prompt-writer/SKILL.md` → Format des prompts Claude Code

---

## Profil de Judith (pour les décisions produit)

- Acupunctrice solo à La Source en Soi (Rosemont, Montréal)
- À l'aise devant la caméra
- Publie déjà ~2x/semaine
- Écrit ~1 article de blogue par mois
- N'aime PAS les suggestions de contenu par IA
- Veut une STRUCTURE, pas des suggestions
- Ses sujets : fertilité, grossesse, bien-être, MTC, acupuncture solidaire, et plus
- Les 4 styles qu'elle aime : Enseigner / Connecter / Aider / Inspirer
- Utilise Canva pour les images de son blogue
- Site Wix : acupuncturejudith.ca
- Go Rendez-Vous : lasourceensoi, employeeId 7556837

---

## Canaux de distribution

| Canal | Status | API route |
|-------|--------|-----------|
| Instagram Reels | ✅ Connecté | `/api/publish` + cron |
| Instagram Stories | ❌ À construire (S03) | — |
| Facebook Reels | ✅ Connecté | `/api/publish-facebook` + cron |
| YouTube Shorts | ✅ Connecté | `/api/publish-youtube` + cron |
| Site Wix | Externe | acupuncturejudith.ca |
| Go Rendez-Vous | Externe | gorendezvous.com/lasourceensoi |

---

## Configuration Firebase

**Projet :** mon-acupunctrice-hub

**Secrets déployés :**
- ANTHROPIC_API_KEY → Génération captions (Claude)
- OPENAI_API_KEY → Whisper transcription
- META_USER_TOKEN → Instagram Graph API
- META_IG_ACCOUNT_ID → ID compte Instagram Judith
- JAMENDO_CLIENT_ID → Bibliothèque musicale
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET → YouTube OAuth
- CRON_SECRET → Auth des crons Vercel

---

## Contraintes non-négociables

- **Heroicons UNIQUEMENT** — zéro emoji dans l'UI
- **0 console.log** en production
- **Composants < 150 lignes** (sinon découper)
- **TypeScript strict**
- **Mobile first 375px** (iPhone SE minimum)
- **App Router ONLY** (jamais pages/)
- **Session persistante** — pas de re-login
- **PWA standalone** — plein écran

---

## Ce qu'on ne build PAS (pour l'instant)

- TikTok (API trop complexe pour V2)
- Système de rappels adaptatif / notifications push
- Mémoire comportementale
- Multi-utilisateurs / collaboration
- Génération automatique de contenu (Judith ne veut pas)
- Éditeur vidéo avancé (WebGL, effets)
- Offline partiel
- Intégration Canva API (post-stratégie)

Voir `project-docs/05_LATER/BACKLOG_LATER.md`

---

## Tâche active

Voir `GEMINI_TASK_V3.md` pour la tâche en cours.
Nouveau : voir `project-docs/02_ROADMAP/GEMINI_TASK_STRATEGY.md` pour
l'analyse de faisabilité de la Phase Stratégie.

---

## Archive

Le dossier `_archive/` contient les anciennes versions.
Ne pas référencer ces fichiers — ils sont obsolètes.
