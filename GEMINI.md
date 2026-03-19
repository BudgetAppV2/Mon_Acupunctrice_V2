# GEMINI.md — Mon Acupunctrice Hub V2
# Chargé automatiquement par Gemini CLI à chaque prompt

---

## Ton rôle dans ce projet

Tu es un architecte produit et développeur senior.
Tu travailles sur "Mon Acupunctrice Hub V2" pour Judith, acupunctrice solo à Montréal.

Tu as accès à toute la codebase dans ce dossier :
- `legacy/` → proof of concept existant (React + Vite + Firebase)
- `project-docs/` → documents fondateurs déjà créés

---

## Règle absolue

> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.
> Toute décision doit servir cet objectif.

---

## Documents à lire en priorité

Avant de répondre à quoi que ce soit, tu connais ces documents :

1. `project-docs/00_VISION/VISION_FINALE.md`
2. `project-docs/00_VISION/DECISIONS_PRODUIT.md`  ← décisions validées
3. `project-docs/01_PRODUCT/PRD_V1.md`
4. `project-docs/01_PRODUCT/EDITOR_SPEC.md`
5. `project-docs/01_PRODUCT/CONTENT_STRATEGY.md`  ← SEO, CTA, YouTube
6. `project-docs/02_ROADMAP/ROADMAP_OVERVIEW.md`
7. `project-docs/03_TECH/ARCHITECTURE.md`
8. `project-docs/03_TECH/DATA_MODEL.md`

---

## Stack cible (V2 — nouveau projet)

```
Frontend   : Next.js 15 App Router + TypeScript
Styling    : Tailwind CSS
State      : Zustand
Auth       : Firebase Auth (Google Sign-In uniquement, session persistante)
Database   : Firebase Firestore
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions
Deployment : Vercel
```

---

## Codebase legacy à analyser

Pour comprendre ce qui existe et peut être réutilisé :

```
legacy/hub/src/App.jsx                              → routing actuel
legacy/hub/src/editor/store/useEditorStore.js       → state éditeur
legacy/hub/src/editor/components/EditorPage.jsx     → composant éditeur
legacy/hub/src/editor/hooks/useVideoPlayer.js       → hook lecture vidéo
legacy/hub/src/editor/components/AudioPanel.jsx     → panneau audio
legacy/hub/src/editor/components/SubtitlePanel.jsx  → sous-titres
legacy/hub/server.js                                → proxys Express (COEP/CORS)
legacy/functions/src/index.ts                       → Cloud Functions
legacy/functions/src/transcribe.ts                  → Whisper API
legacy/functions/src/jamendo.ts                     → recherche musique
legacy/hub/tailwind.config.js                       → palette sage/sand
```

---

## Ce qu'on ne build PAS en V1

- Système de rappels adaptatif complexe
- Mémoire comportementale
- Analytics Instagram
- Multi-utilisateurs
- Génération automatique de contenu
- Éditeur vidéo avancé (WebGL, effets)

Voir `project-docs/05_LATER/BACKLOG_LATER.md` pour la liste complète.

---

## Contraintes importantes

- Mobile first — 375px minimum
- App Router ONLY — jamais Pages Router
- Session persistante — pas de re-login
- TypeScript strict
- 0 console.log en production
