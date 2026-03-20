# Guide de deploiement — Mon Acu Hub

## 1. Variables d'environnement

Copier ces variables dans le dashboard Vercel (Settings > Environment Variables).
Toutes les valeurs sont dans `.env.local` localement.

### Firebase (NEXT_PUBLIC — exposees au client)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Cle API Firebase (Web app) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine Auth Firebase (`[project].firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket Storage (`[project].appspot.com`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID Firebase |

### Backend (server-side — NON exposees au client)

| Variable | Description |
|----------|-------------|
| `FIREBASE_FUNCTIONS_URL` | URL base des Cloud Functions (`https://us-central1-[PROJECT_ID].cloudfunctions.net`) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON stringifie du service account Firebase (pour Admin SDK) |
| `META_APP_SECRET` | App Secret de la Meta App (pour OAuth Instagram) |

### App

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WIX_URL` | URL du site Wix de Judith (ex: `https://judithtremblay.com`) |

## 2. Configuration Vercel

1. Creer un nouveau projet sur vercel.com
2. Lier au repo GitHub
3. **Framework Preset** : Next.js (auto-detecte)
4. **Build Command** : `npm run build`
5. **Output Directory** : `.next`
6. **Node.js Version** : 20.x
7. **Region** : `iad1` (US East — proche de Firebase `us-central1`)
8. Coller toutes les variables d'environnement

## 3. Firebase Auth — Domaines autorises

Pour que Google Sign-In fonctionne en production :

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Authentication > Settings > Authorized domains
3. Ajouter l'URL Vercel : `ton-projet.vercel.app`
4. Si domaine custom : ajouter aussi le domaine custom

## 4. Firebase Rules

Deployer les rules Firestore et Storage :

```bash
firebase login
firebase use [PROJECT_ID]
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only firestore:indexes
```

## 5. Headers COOP/COEP

Les headers sont configures dans `next.config.mjs` :
- Toutes les pages (sauf /login) : `COOP: same-origin` + `COEP: require-corp`
- Page /login : `COOP: same-origin-allow-popups` (pour Google OAuth popup)

Ces headers sont obligatoires pour que `SharedArrayBuffer` fonctionne (requis par FFmpeg.wasm).

**Vercel respecte automatiquement les headers definis dans next.config.mjs.**

## 6. PWA

L'app est installable en PWA sur iPhone :
1. Ouvrir l'URL dans Safari
2. Partager > "Sur l'ecran d'accueil"
3. L'app s'ouvre en mode standalone (sans barre Safari)

Les icones PWA sont dans `public/icons/` (192x192 et 512x512).

## 7. Verification post-deploiement

- [ ] Login Google fonctionne
- [ ] Les idees se chargent (Firestore)
- [ ] L'editeur s'ouvre (import video)
- [ ] L'export video fonctionne (FFmpeg.wasm — tester dans Chrome et Safari)
- [ ] La publication Instagram fonctionne
- [ ] L'app est installable en PWA
- [ ] Le profil affiche les stats

## 8. Cloud Functions

Les Cloud Functions sont deployees separement dans le projet Firebase :
- `generateCaption` — Generation de caption IA (Claude)
- `publishToInstagram` — Publication Reels via Meta Graph API
- `transcribeAudio` — Transcription Whisper + correction Claude
- `searchJamendo` — Recherche musique libre de droits
- `schedulePublisher` — Cron job publication planifiee (toutes les 15 min)

Pour les deployer :
```bash
cd functions
npm install
firebase deploy --only functions --project [PROJECT_ID]
```

Secrets requis (via `firebase functions:secrets:set`) :
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `META_USER_TOKEN`
- `META_IG_ACCOUNT_ID`
- `JAMENDO_CLIENT_ID`
