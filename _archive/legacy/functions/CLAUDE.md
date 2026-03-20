# Mon Acupunctrice — Cloud Functions CLAUDE.md

## Projet Firebase
- ID: `mon-acupunctrice-hub`
- Region: `us-central1`
- CLI auth: `barchambault@grandsballets.com`
- Deploy: `firebase deploy --only functions --project mon-acupunctrice-hub`

## Functions existantes
- `generateCaption` — Génère 2 options de caption via Claude API

## À implémenter — Phase 3a

### `publishToInstagram` (functions/src/instagram.ts)

Créer une Cloud Function callable qui publie un Reel Instagram via Meta Graph API.

**Input :** `{ itemId: string }`

**Flow :**
1. Lire le document `content_items/{itemId}` de Firestore
2. Valider que `videoUrl` et `caption` existent
3. POST container Reel vers `https://graph.instagram.com/v25.0/{ig_account_id}/media`
4. Polling du status toutes les 5 sec (max 60 sec)
5. POST publish vers `https://graph.instagram.com/v25.0/{ig_account_id}/media_publish`
6. Update Firestore : `publishedDates.instagram`, `instagramMediaId`, `status: 'publié'`

**Secrets Firebase (defineSecret) :**
- `META_USER_TOKEN` — long-lived access token (60 jours)
- `META_IG_ACCOUNT_ID` — Instagram Business Account ID

**Config Cloud Function :**
- timeoutSeconds: 120
- memory: '256MiB'
- cors: true

**Gestion d'erreurs :**
- Si pas de videoUrl → HttpsError('failed-precondition', 'Vidéo requise')
- Si pas de caption → HttpsError('failed-precondition', 'Caption requise')
- Si container ERROR → HttpsError('internal', 'Erreur de traitement vidéo par Instagram')
- Si timeout polling → HttpsError('deadline-exceeded', 'Timeout traitement Instagram')

**N'utilise PAS de SDK Meta — utilise fetch() directement avec l'API REST.**

### Export dans index.ts
Ajouter `export { publishToInstagram } from './instagram'` dans `functions/src/index.ts`.

## Règles
- TypeScript strict
- Pas de `any` sauf casts nécessaires pour Firestore
- Les secrets ne sont JAMAIS hardcodés
- Utiliser firebase-admin pour Firestore (déjà initialisé automatiquement en Cloud Functions v2)
- Node.js 20
