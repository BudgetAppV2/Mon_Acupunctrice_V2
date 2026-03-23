# Milestone 09 — Token Meta long-lived & OAuth Instagram

## Objectif
Remplacer le token Instagram hardcodé par un flux OAuth sécurisé permettant à Judith de connecter son compte directement depuis l'application, avec un renouvellement automatique du token long-lived (60 jours).

## Phase
DISTRIBUER

## Dépendances
- **M08** : Application déployée sur Vercel avec une URL stable pour le redirect OAuth.

## User stories couvertes
- En tant que Judith, je veux connecter mon compte Instagram à l'app sans intervention technique.
- En tant que Judith, je veux que la publication automatique ne s'arrête jamais à cause d'un token expiré.

## Livrables précis

- **Meta App Configuration :**
    - Configuration de la redirection OAuth vers `[domaine-vercel]/api/auth/instagram/callback`.
- **UI & Frontend :**
    - `/app/(app)/profil/page.tsx` : Ajout d'une section "Connexions" avec `InstagramConnectButton`.
    - `components/features/profile/InstagramConnectButton.tsx` : Gère l'état (Connecté/Déconnecté) et lance le flow OAuth.
- **Backend (Cloud Functions & API Routes) :**
    - `/app/api/auth/instagram/route.ts` : Route d'initiation (redirect vers Meta).
    - `/app/api/auth/instagram/callback/route.ts` : Route de callback (échange de code -> short token -> long token).
    - `functions/src/instagram.ts` : `refreshMetaToken` (Cloud Function schedulée pour renouveler le token).
- **Sécurité & Storage :**
    - Stockage du token dans `users/{userId}/tokens/meta` (Firestore).
    - Encryption optionnelle du token au repos.

## Spécifications techniques détaillées

### Flow OAuth
1. Judith clique sur "Connecter Instagram".
2. Redirection vers Meta avec les scopes : `instagram_business_basic`, `instagram_business_content_publish`.
3. Callback reçoit le `code`.
4. API Route échange le `code` contre un `short-lived token` (1h).
5. API Route échange le `short-lived token` contre un `long-lived token` (60 jours) via l'endpoint GET `/oauth/access_token?grant_type=fb_exchange_token`.
6. Le token est stocké dans Firestore sous `users/{userId}/private/tokens` (Admin SDK).
7. Les champs publics (metaStatus, metaInstagramId, metaTokenExpiresAt) sont écrits sur `users/{userId}`.

### Refresh Automatique
Une Cloud Function `refreshMetaToken` s'exécute chaque semaine. Elle vérifie les tokens arrivant à expiration (< 15 jours) et utilise l'endpoint de refresh de Meta pour obtenir un nouveau token de 60 jours sans action de Judith.

### Migration
Les fonctions `publishToInstagram` et `schedulePublisher` doivent être modifiées pour lire le token depuis Firestore au lieu des secrets Firebase.

## Data model changes

**Document public `users/{userId}` :**
- `metaInstagramId`: string (ID du compte business)
- `metaStatus`: 'connected' | 'expired' | 'disconnected'
- `metaTokenExpiresAt`: Timestamp (pour afficher la date d'expiration dans l'UI)
- `facebookPageId`: string
- `facebookPageName`: string

**Document privé `users/{userId}/private/tokens` (Cloud Functions only) :**
- `metaAccessToken`: string (le token long-lived — JAMAIS exposé côté client)

Voir `DATA_MODEL.md` pour les security rules. Le sous-document `private/tokens`
est inaccessible côté client (rules: `allow read, write: if false`). Seules les
Cloud Functions via Admin SDK peuvent y accéder.

## Cloud Functions
- **`refreshMetaToken` (Nouvelle)** : Schedulée (cron weekly). Lit le token depuis `users/{userId}/private/tokens`, le renouvelle via Meta API, met à jour Firestore.
- **`publishToInstagram` (Modifiée)** : Lit le token depuis `users/{userId}/private/tokens` (Admin SDK) au lieu des secrets Firebase.

## Definition of Done
- [ ] Le bouton "Connecter Instagram" est présent dans le profil.
- [ ] Le flow OAuth redirige correctement et revient sur l'app.
- [ ] Le token long-lived est stocké dans Firestore.
- [ ] La publication Instagram fonctionne avec le token dynamique.
- [ ] La fonction de refresh automatique est déployée et testée (via appel manuel).
- [ ] Les secrets META_USER_TOKEN hardcodés sont supprimés.

## Prompt one shot pour Claude Code

```markdown
# Milestone 09 — OAuth Meta & Token Long-Lived

## Contexte
Mon Acupunctrice Hub est une PWA Next.js 15 déployée sur Vercel.
Actuellement, le token Instagram est hardcodé dans Firebase Secrets (META_USER_TOKEN).
Ce milestone remplace ça par un flow OAuth dans /profil.
Meta App ID : 823305796703895. IG App ID : 1224688753149053.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Auth/Firestore/Functions,
Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `app/(app)/profil/page.tsx` → page profil actuelle
- `functions/src/instagram.ts` → publishToInstagram actuel (utilise process.env)
- `functions/src/scheduler.ts` → schedulePublisher actuel
- `lib/firebase.ts` → config Firebase
- `project-docs/03_TECH/API_DESIGN.md` → détail du flow OAuth et des endpoints
- `project-docs/03_TECH/DATA_MODEL.md` → structure users + private/tokens

## Architecture tokens
Les tokens secrets sont stockés dans un sous-document Firestore :
`users/{userId}/private/tokens` (inaccessible côté client, rules: allow if false)
Les champs publics (metaStatus, metaInstagramId) restent sur `users/{userId}`.

```typescript
// users/{userId}/private/tokens
interface UserTokens {
  metaAccessToken: string
  metaTokenExpiresAt: Timestamp
  youtubeRefreshToken?: string  // ajouté en M11
}

// users/{userId} (champs publics ajoutés)
interface UserMetaFields {
  metaInstagramId?: string
  metaStatus?: 'connected' | 'expired' | 'disconnected'
  metaTokenExpiresAt?: Timestamp  // dupliqué pour l'UI
  facebookPageId?: string
  facebookPageName?: string
}
```

## Livrables
- [ ] `app/api/auth/instagram/route.ts` — redirect vers Meta OAuth
      Scopes: instagram_business_basic, instagram_business_content_publish,
      pages_manage_posts, pages_read_engagement, instagram_manage_insights
      Redirect URI: `${VERCEL_URL}/api/auth/instagram/callback`
- [ ] `app/api/auth/instagram/callback/route.ts` — callback OAuth :
      1. Échange code → short-lived token (POST /oauth/access_token)
      2. Échange short → long-lived (GET /oauth/access_token?grant_type=fb_exchange_token)
      3. GET /me/accounts → facebookPageId
      4. GET /{pageId}?fields=instagram_business_account → metaInstagramId
      5. Stocke token dans users/{userId}/private/tokens (Admin SDK)
      6. Stocke champs publics sur users/{userId}
      7. Redirect vers /profil?connected=instagram
- [ ] `components/features/profile/InstagramConnectButton.tsx` — 3 états :
      - Déconnecté : bouton "Connecter Instagram" (Heroicon link)
      - Connecté : "@compte · Expire le DD/MM" (Heroicon check-circle)
      - Expiré : "Reconnecte Instagram" en rouge (Heroicon exclamation-triangle)
- [ ] `functions/src/meta-auth.ts` — Cloud Function `refreshMetaToken` :
      Trigger: scheduled cron weekly (dimanche 3h AM)
      Flux: query users avec metaTokenExpiresAt < now+15j → refresh → update Firestore
- [ ] Modifier `functions/src/instagram.ts` — publishToInstagram lit le token
      depuis `users/{userId}/private/tokens` via Admin SDK au lieu de process.env
- [ ] Modifier `functions/src/scheduler.ts` — même changement
- [ ] Mettre à jour `app/(app)/profil/page.tsx` pour intégrer InstagramConnectButton
- [ ] Nouveau secret Firebase: `firebase functions:secrets:set META_APP_SECRET`

## Contraintes
- Le token Meta ne doit JAMAIS transiter côté client après le callback
- Le callback route utilise Firebase Admin SDK (pas le client SDK)
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes

## Definition of Done
- [ ] Flow OAuth complet fonctionne (redirect → callback → token stocké)
- [ ] Publication Instagram fonctionne avec le token dynamique
- [ ] Scheduler fonctionne avec le token dynamique
- [ ] État de connexion visible dans /profil
- [ ] Le secret META_USER_TOKEN hardcodé peut être supprimé
```
