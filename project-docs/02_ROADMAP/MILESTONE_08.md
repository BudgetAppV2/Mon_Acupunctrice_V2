# Milestone 08 — Déploiement Vercel

## Objectif
Mettre l'application en production sur Vercel avec une configuration stable, des variables d'environnement sécurisées et une validation complète du flux PWA et de l'export vidéo en conditions réelles.

## Phase
LANCER

## Dépendances
- **M01-M07** : Application fonctionnelle localement (Auth, Idées, Calendrier, Éditeur, Publication).

## User stories couvertes
- Accès universel à l'app depuis n'importe quel appareil.
- Persistance de la session en production.
- Export vidéo fonctionnel sur infrastructure cloud (SharedArrayBuffer).

## Livrables précis

- **Configuration Vercel :**
    - Projet créé sur Vercel lié au repo GitHub.
    - Framework preset : Next.js.
    - Region : `iad1` (US East, proche de Firebase `us-central1`).
- **Variables d'environnement :**
    - Report de toutes les clés Firebase (API Key, Auth Domain, etc.).
    - `FIREBASE_FUNCTIONS_URL`.
    - `NEXT_PUBLIC_WIX_URL`.
- **`next.config.mjs` :**
    - Validation des headers COOP/COEP pour FFmpeg.wasm en production.
- **PWA Production :**
    - `public/manifest.json` valide.
    - Icônes et Splash screens iOS.
- **Sécurité Firebase :**
    - Déploiement des `firestore.rules`.
    - Déploiement des `storage.rules` (accès public pour `/videos/`).

## Spécifications techniques détaillées

### Configuration Vercel
L'app doit être configurée avec les variables d'environnement listées dans `.env.local.example`.
La build command est `npm run build`.
L'output directory est `.next`.

### Headers COOP/COEP
Il est CRUCIAL que les headers suivants soient présents sur toutes les routes pour que `SharedArrayBuffer` fonctionne (requis pour FFmpeg.wasm) :
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### PWA & iOS
- Le manifest doit pointer vers les icônes dans `public/icons/`.
- Ajouter les meta tags `apple-mobile-web-app-capable` et `apple-mobile-web-app-status-bar-style` dans `layout.tsx`.
- Tester l'installation "Sur l'écran d'accueil" sur un iPhone réel.

### Firebase Storage
Les vidéos exportées doivent être accessibles via une URL publique Google Storage (sans token `?alt=media&token=...`) pour que l'API Instagram puisse les télécharger.
Structure URL : `https://storage.googleapis.com/[BUCKET]/videos/[USER_ID]/[ITEM_ID].mp4`.

## Data model changes
Aucun changement majeur. Vérifier que `distributionStatus` est correctement mis à jour lors des tests.

## Cloud Functions
Vérifier que les fonctions existantes pointent vers les bons secrets en production (ANTHROPIC_API_KEY, etc.).

## Definition of Done
- [ ] App accessible sur l'URL `*.vercel.app`.
- [ ] Variables d'environnement configurées dans le dashboard Vercel.
- [ ] Login Google fonctionne en production (URL Vercel ajoutée aux domaines autorisés dans Firebase Auth).
- [ ] Export vidéo fonctionne (FFmpeg.wasm avec SharedArrayBuffer ne crash pas).
- [ ] Publication Instagram fonctionne depuis l'URL de production.
- [ ] PWA installable sur iPhone (standalone mode).
- [ ] Firestore security rules et index déployés.

## Prompt one shot pour Claude Code

```markdown
# Milestone 08 — Déploiement Vercel & Production

## Contexte
Mon Acupunctrice Hub est une PWA Next.js 15 pour Judith, acupunctrice solo.
L'app est complète localement (7 milestones : auth, idées, calendrier, éditeur vidéo,
publication Instagram). On doit la mettre en production sur Vercel.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Auth/Firestore/Storage/Functions,
FFmpeg.wasm (nécessite SharedArrayBuffer → headers COOP/COEP obligatoires).

## Fichiers à lire AVANT de commencer
- `next.config.mjs` → headers COOP/COEP actuels
- `app/layout.tsx` → meta tags PWA actuels
- `.env.local` → liste complète des variables d'environnement
- `firebase.json` → config Firebase actuelle
- `public/manifest.json` → manifest PWA
- `project-docs/03_TECH/SECURITY.md` → security rules

## Livrables
- [ ] `DEPLOY.md` (nouveau) — guide complet de déploiement Vercel :
      - Liste de TOUTES les variables d'environnement avec description
      - Étapes pour ajouter l'URL Vercel aux domaines autorisés dans Firebase Auth
      - Commandes Firebase pour déployer rules et index
- [ ] `next.config.mjs` — valider que les headers COOP/COEP couvrent TOUTES les routes
      y compris les API routes (sinon FFmpeg.wasm crash en production)
- [ ] `app/layout.tsx` — meta tags iOS complets :
      ```html
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      ```
- [ ] `firestore.rules` — security rules limitant les accès au userId :
      contentItems: read/write si auth.uid == resource.data.userId
      users: read/write si auth.uid == userId
- [ ] `storage.rules` — lecture publique pour `/videos/` (requis par Instagram Graph API),
      lecture privée pour tout le reste
- [ ] Vérifier que `public/manifest.json` a les bonnes icônes (192x192 et 512x512),
      display: standalone, orientation: portrait, start_url: /calendrier

## Contraintes
- AUCUN changement de logique métier — config et docs uniquement
- 0 console.log
- Ne pas toucher aux composants ou au store
- Les variables d'environnement dans DEPLOY.md doivent correspondre EXACTEMENT à .env.local

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] DEPLOY.md est complet et utilisable par quelqu'un qui ne connaît pas le projet
- [ ] Les security rules sont cohérentes avec DATA_MODEL.md
- [ ] Les icônes PWA existent dans public/icons/ (ou public/)
```
