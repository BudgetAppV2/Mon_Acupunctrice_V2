# MON ACUPUNCTRICE HUB V2 — Document de passation
*Généré le 19 mars 2026 — Fin de session de développement*

---

## Contexte projet

**Qui :** Benoît Archambault, Directeur Technique aux Grands Ballets Canadiens
**Pour qui :** Judith Dufour Savard, acupunctrice solo à Montréal
**Quoi :** PWA mobile-first pour créer, monter et publier du contenu Instagram

**Critère de succès absolu :**
> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.

---

## Repo & Stack

**GitHub :** https://github.com/BudgetAppV2/Mon_Acupunctrice_V2
**Local :** /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2

**Stack :** Next.js 15 App Router + TypeScript + Tailwind + Heroicons + Firebase Auth/Firestore/Storage/Functions + Zustand + FFmpeg.wasm + WebCodecs + Vercel (pas encore déployé)

**Commandes dev :**
```bash
npm run dev          # Démarrer le serveur
npm run dev:clean    # Vider cache .next et redémarrer ← utiliser si page blanche
npm run build        # Build production
firebase deploy --only firestore:indexes
```

---

## 7 Milestones complétés ✅

| # | Milestone | Contenu |
|---|-----------|---------|
| M01 | Auth + PWA | Login Google, session persistante, PWA standalone, Bottom Tab Bar |
| M02 | Banque d'idées | CRUD Firestore, Bottom Sheet iOS, filtres, swipe-to-delete, vue Blitz |
| M03 | Calendrier | Grille mensuelle, dashboard bar, scheduling, ItemDetailSheet |
| M04 | Éditeur fondation | Webcam 9:16, timeline dynamique, trim, export WebCodecs+FFmpeg |
| M05 | Filtres + Texte | 9 filtres CSS, 30 polices, 7 styles, 6 animations fade in/out |
| M06 | Sous-titres + Audio | Whisper, 3 styles subs, Jamendo, trim audio, fade, volumes |
| M07 | Publication + Profil | PublishSheet 3 étapes, CoverPicker, Caption IA, Page /profil |

---

## Configuration Firebase

**Projet :** mon-acupunctrice-hub

**Secrets Firebase déployés :**
- ANTHROPIC_API_KEY → Génération captions (Claude)
- OPENAI_API_KEY → Whisper transcription
- META_USER_TOKEN → Instagram Graph API (hardcodé V1)
- META_IG_ACCOUNT_ID → ID compte Instagram Judith
- JAMENDO_CLIENT_ID → Bibliothèque musicale

**Variables .env.local (ne jamais committer) :**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_FUNCTIONS_URL=https://us-central1-mon-acupunctrice-hub.cloudfunctions.net
NEXT_PUBLIC_WIX_URL=https://[dashboard-wix-judith]
```

**Cloud Functions déployées :**
- generateCaption (Claude/Anthropic)
- publishToInstagram (Meta Graph API v25.0)
- schedulePublisher (cron every 15min → publie les items scheduledAt)
- transcribeAudio (Whisper OpenAI, timestamp_granularities: word)
- searchJamendo (Jamendo API)

**Index Firestore déployés :**
- userId + workflowState + createdAt
- userId + category + createdAt
- userId + distributionStatus + scheduledAt
- userId + createdAt
- userId + scheduledAt

---

## Architecture éditeur — Points importants

### Layout (EditorLayout.tsx)
```
Header 44px    : ← retour | timecode | [↑ Exporter] bouton compact
Preview vidéo  : flex-1 (tout l'espace disponible)
Zone contrôles : max-height 55vh (ne peut pas écraser la preview)
  ├── Toolbar onglets : Trim · Filtres · Texte · Sous-titres · Audio · Images
  ├── Panneau actif   : filtres=90px / autres=100-120px, overflow-y-auto
  └── Timeline        : hauteur dynamique = 20 + nb_tracks×26 px
```

### Export vidéo
- **WebCodecs** prioritaire (hardware H.264 iPhone, ~12s pour 60s vidéo)
- **FFmpeg.wasm** fallback (obligatoire si audio pour le mixage afade)
- Format sortie : MP4 H.264, 1080×1920 (9:16), CRF 23

### Filtres
- Appliqués en CSS sur la `<video>` en preview
- Traduits en `eq=` FFmpeg à l'export
- Miniatures capturées depuis la vraie vidéo DOM + filtre CSS appliqué

### Timeline
- Hauteur dynamique selon tracks actives (vidéo/texte/subs/audio)
- Marges 12px de chaque côté (PADDING constant)
- Drag playhead : RAF throttle + setPointerCapture + touch-none

---

## Bug connu
Cache `.next` stale après modifications Claude Code → utiliser `npm run dev:clean`
L'extension Chrome Kapture cause un warning d'hydratation (inoffensif, disparaît en prod)

---

## Prochaine session — Ce qui est planifié

### 1. Feedback Benoît (batch)
Benoît va explorer et tester l'app. Il donnera son feedback en une batch.
Axes probables : raffinements éditeur, bugs UX, tests flux complet.

### 2. Nouvelles features à milestoner (session Gemini d'abord)

**Distribution multi-plateforme**
- YouTube Shorts : YouTube Data API v3, OAuth Google, quota 10k units/jour
- Facebook Reels : même token Meta qu'Instagram, quasi gratuit à ajouter

**Stats & Analytics**
- Résumé dans /profil : vues Reels + trafic Wix (2 cartes simples)
- Page dédiée /stats : graphiques, meilleure heure, croissance followers
- Dashboard dans onglet Calendrier : résumé performances publications
- Technique requis : token Meta long-lived (60j) + Instagram Insights API
  - GET /{media-id}/insights?metric=plays,reach,likes
  - GET /{ig-user-id}/insights?metric=follower_count

**Stratégie trafic Wix**
- UTM params automatiques dans les liens des captions générées
- Mapping catégorie → URL spécifique du site Wix de Judith

**Déploiement Vercel**
- Variables d'environnement à configurer dans Vercel dashboard
- Domaine custom à brancher

### 3. Process pour la prochaine session
1. Lire ce HANDOFF.md + project-docs/
2. Session Gemini CLI pour écrire les milestones M08+
3. Claude Code one shot par milestone
4. Claude Desktop + Claude in Chrome pour troubleshoot

---

## Conventions établies (non-négociables)

- **Heroicons UNIQUEMENT** — zéro emoji dans l'UI
- **0 console.log** en production
- **Composants < 150 lignes**
- **TypeScript strict**
- **Mobile first 375px** (iPhone SE minimum)
- **App Router ONLY** (jamais pages/)
- **Commits sémantiques** : feat/fix/chore + description claire

---

## Product Bible complète

Tous les documents de référence :
`/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2/project-docs/`

Documents clés :
- `00_VISION/VISION_FINALE.md` — vision et workflow de Judith
- `00_VISION/DECISIONS_PRODUIT.md` — décisions validées (auth, Instagram, notifications...)
- `01_PRODUCT/PRD_V1.md` — 21 user stories
- `01_PRODUCT/EDITOR_SPEC.md` — spec complète éditeur
- `01_PRODUCT/CONTENT_STRATEGY.md` — SEO Instagram 2026, CTA, YouTube
- `03_TECH/API_DESIGN.md` — Cloud Functions et API routes
- `03_TECH/EXPORT_STRATEGY.md` — WebCodecs vs FFmpeg
- `05_LATER/BACKLOG_LATER.md` — features futures planifiées
