# ARCHITECTURE
*Stack technique et décisions d'architecture*

---

## Stack

| Couche | Technologie | Raison |
|--------|-------------|--------|
| Frontend | Next.js 15 App Router | Claude Code maîtrise, Vercel natif, API routes intégrées |
| Styling | Tailwind CSS | Rapid prototyping, mobile first |
| State | Zustand | Simple, pas de boilerplate Redux |
| Auth | Firebase Auth (Google) | Gratuit, simple, session persistante |
| Database | Firebase Firestore | Gratuit, temps réel, pas de serveur |
| Storage | Firebase Storage | Gratuit, vidéos et images |
| Functions | Firebase Cloud Functions | Whisper, caption IA, publication IG |
| Deployment | Vercel | Next.js natif, zero cold start, preview deploys |
| Language | TypeScript | Erreurs détectées tôt, Claude Code génère mieux |

---

## Pourquoi Next.js App Router (pas React + Vite)

- Server Components par défaut → meilleures performances
- API routes intégrées → plus de serveur Express séparé
- Vercel = déploiement 30 secondes
- Claude Code a des templates et agents spécialisés Next.js

---

## Pourquoi Vercel (pas Render)

- Fait par l'équipe Next.js — intégration native
- Zero cold start sur free tier
- Preview deploys automatiques par PR
- Domaine custom gratuit
- Render avait 30s de cold start → friction pour Judith

---

## Pourquoi Firebase (pas Supabase)

- Proof of concept déjà bâti dessus — on réutilise la config
- Cloud Functions = Whisper API déjà intégrée
- Free tier généreux (50k reads/jour Firestore)
- Google Auth natif

---

## Architecture applicative

```
Vercel (Next.js)
│
├── /app — Pages et layouts (App Router)
│   ├── (auth)/login — Login Google
│   ├── (app)/layout — Layout protégé
│   ├── (app)/calendrier — Vue calendrier
│   ├── (app)/idees — Banque d'idées
│   ├── (app)/editeur/[id] — Éditeur vidéo
│   └── (app)/blitz — Sessions de tournage
│
├── /components
│   ├── /ui — Boutons, inputs, modals génériques
│   └── /features — Editor, Calendar, IdeaCard...
│
├── /lib
│   ├── firebase.ts — Config Firebase client
│   ├── firebase-admin.ts — Config Firebase admin (API routes)
│   └── utils.ts — Helpers
│
└── /store
    ├── useAuthStore.ts
    ├── useEditorStore.ts
    └── useContentStore.ts

Firebase
│
├── Firestore
│   ├── users/{userId} — Profil utilisateur
│   └── contentItems/{id} — Idées et contenus
│
├── Storage
│   ├── videos/{userId}/{filename}
│   └── thumbnails/{userId}/{filename}
│
└── Cloud Functions
    ├── transcribeAudio — Whisper API
    ├── generateCaption — Claude API
    ├── publishToInstagram — Graph API
    └── schedulePublisher — Cron publication
```

---

## Décisions importantes

### Auth : session persistante
Firebase Auth persiste la session automatiquement.
Judith se connecte 1 fois. Jamais de re-login.

### Pas de serveur Express
Next.js API routes remplacent Express.
Les proxys média (COEP/CORS) sont des API routes Next.js.

### TypeScript strict
`tsconfig.json` avec `strict: true`.
Meilleure expérience Claude Code, moins de bugs.

### Mobile first
Toutes les pages doivent fonctionner à 375px (iPhone SE).
