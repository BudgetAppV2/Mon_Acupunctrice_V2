# Milestone M09 — OAuth Instagram + Token Long-Lived

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 déployée sur Vercel (mon-acupunctrice-v2.vercel.app).
Actuellement, le token Instagram est hardcodé dans Firebase Secrets (META_USER_TOKEN).
Ce milestone remplace ça par un flow OAuth dans /profil + refresh automatique.

Meta App ID : 823305796703895
IG App ID : 1224688753149053
Redirect URI configuré dans Meta : https://mon-acupunctrice-v2.vercel.app/api/auth/instagram/callback

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Auth/Firestore/Functions,
Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `app/(app)/profil/page.tsx` → page profil actuelle (y intégrer le bouton connect)
- `app/api/publish/route.ts` → proxy vers Cloud Function (pattern à réutiliser)
- `app/api/generate-caption/route.ts` → même pattern
- `lib/firebase.ts` → config Firebase client (PAS admin)
- `lib/hooks/useUserProfile.ts` → hook profil existant (customCategories)
- `firestore.rules` → rules actuelles (ajouter private/tokens)
- `project-docs/03_TECH/DATA_MODEL.md` → structure tokens recommandée

## Architecture critique — Lire attentivement

### Problème : Firebase Admin SDK dans Next.js API routes
Les API routes Next.js (app/api/) tournent côté serveur sur Vercel.
Pour écrire dans `users/{userId}/private/tokens` (protégé par rules `allow: if false`),
on a besoin du Firebase Admin SDK qui bypass les security rules.

### Solution : créer lib/firebase-admin.ts
Installer `firebase-admin` dans le projet principal (pas dans functions/).
Créer un fichier d'initialisation séparé du client SDK.
Le service account key est passé via variable d'environnement.

```typescript
// lib/firebase-admin.ts
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  
  // En production : GOOGLE_APPLICATION_CREDENTIALS ou FIREBASE_SERVICE_ACCOUNT
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  
  return initializeApp(
    serviceAccount ? { credential: cert(serviceAccount as ServiceAccount) } : {}
  );
}

export function getAdminFirestore() {
  getAdminApp();
  return getFirestore();
}
```

Variable d'environnement dans Vercel :
`FIREBASE_SERVICE_ACCOUNT` = le JSON du service account Firebase (stringifié)

### Problème : identifier l'utilisateur dans le callback OAuth
Le redirect Meta revient sur `/api/auth/instagram/callback?code=xxx`.
Cette API route serveur n'a pas accès au contexte auth Firebase client.

### Solution : passer le uid dans le state parameter
L'API route `/api/auth/instagram` reçoit le `uid` en query param,
le signe avec un HMAC (secret), et le passe dans le `state` param OAuth.
Le callback vérifie la signature et récupère le uid.

```typescript
// Signature du state
import { createHmac } from 'crypto';
const SECRET = process.env.OAUTH_STATE_SECRET || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function signState(uid: string): string {
  const sig = createHmac('sha256', SECRET).update(uid).digest('hex').slice(0, 16);
  return `${uid}.${sig}`;
}

function verifyState(state: string): string | null {
  const [uid, sig] = state.split('.');
  if (!uid || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(uid).digest('hex').slice(0, 16);
  return sig === expected ? uid : null;
}
```

### Cloud Functions — NE PAS les modifier dans ce milestone
Les Cloud Functions sont déployées séparément (legacy/functions/).
Pour l'instant, on garde le token hardcodé qui fonctionne dans les CF.
On migrera les CF pour lire le token Firestore dans un milestone séparé
(ou dans un fix dédié après que l'OAuth fonctionne).

Ce milestone se concentre sur :
1. Le flow OAuth (API routes Next.js)
2. Le stockage du token dans Firestore
3. L'UI dans /profil
4. La Cloud Function de refresh (nouveau fichier dans functions/)

## Livrables

### 1. Firebase Admin SDK setup
- [ ] `npm install firebase-admin`
- [ ] `lib/firebase-admin.ts` — initialisation Admin SDK (voir code ci-dessus)
- [ ] Ajouter `FIREBASE_SERVICE_ACCOUNT` à `.env.local` (le JSON stringifié)
- [ ] Ajouter à DEPLOY.md : nouvelle variable d'environnement à configurer dans Vercel

### 2. API Route — initiation OAuth
- [ ] `app/api/auth/instagram/route.ts`
```
GET /api/auth/instagram?uid=xxx
1. Vérifier que uid est fourni
2. Signer le state : signState(uid)
3. Redirect 302 vers :
   https://www.facebook.com/v25.0/dialog/oauth
   ?client_id=823305796703895
   &redirect_uri=https://mon-acupunctrice-v2.vercel.app/api/auth/instagram/callback
   &scope=instagram_business_basic,instagram_business_content_publish,pages_manage_posts,pages_read_engagement,instagram_manage_insights
   &response_type=code
   &state={signedState}
```

### 3. API Route — callback OAuth
- [ ] `app/api/auth/instagram/callback/route.ts`
```
GET /api/auth/instagram/callback?code=xxx&state=xxx
1. Vérifier le state (verifyState) → extraire uid
2. Si state invalide → redirect /profil?error=invalid_state
3. Échanger code → short-lived token :
   POST https://graph.facebook.com/v25.0/oauth/access_token
   body: client_id, client_secret (META_APP_SECRET), redirect_uri, code
4. Échanger short → long-lived token :
   GET https://graph.facebook.com/v25.0/oauth/access_token
   ?grant_type=fb_exchange_token&client_id=xxx&client_secret=xxx&fb_exchange_token=xxx
5. Récupérer les infos du compte :
   GET https://graph.facebook.com/v25.0/me/accounts?access_token=xxx
   → facebookPageId, facebookPageName
   GET https://graph.facebook.com/v25.0/{pageId}?fields=instagram_business_account&access_token=xxx
   → metaInstagramId
6. Écrire dans Firestore (Admin SDK) :
   - users/{uid}/private/tokens → { metaAccessToken, metaTokenExpiresAt }
   - users/{uid} → { metaInstagramId, metaStatus: 'connected', metaTokenExpiresAt, facebookPageId, facebookPageName }
7. Redirect vers /profil?connected=instagram
```

Variables d'environnement nécessaires :
- `META_APP_SECRET` (nouveau — le App Secret de la Meta App)
- `FIREBASE_SERVICE_ACCOUNT` (nouveau — JSON du service account)

### 4. Utilitaire OAuth state
- [ ] `lib/utils/oauth-state.ts` — signState() et verifyState()

### 5. Composant UI — InstagramConnectButton
- [ ] `components/features/profile/InstagramConnectButton.tsx`
3 états basés sur le champ `metaStatus` du user profile :

**Déconnecté (metaStatus absent ou 'disconnected') :**
- Bouton vert sage : "Connecter Instagram" avec LinkIcon
- onClick → window.location.href = `/api/auth/instagram?uid=${user.uid}`

**Connecté (metaStatus === 'connected') :**
- Badge vert : CheckCircleIcon + "Instagram connecté"
- Sous-texte : "Expire le {date}" (metaTokenExpiresAt formatté)
- Bouton discret "Reconnecter" pour renouveler manuellement

**Expiré (metaStatus === 'expired') :**
- Badge rouge : ExclamationTriangleIcon + "Connexion expirée"
- Bouton : "Reconnecter Instagram"

### 6. Intégration dans /profil
- [ ] Modifier `app/(app)/profil/page.tsx`
- Ajouter InstagramConnectButton entre les stats et "Mon site Wix"
- Lire metaStatus depuis useUserProfile (étendre le hook)
- Afficher un toast/message si `?connected=instagram` dans l'URL

### 7. Étendre useUserProfile
- [ ] Modifier `lib/hooks/useUserProfile.ts`
- Exposer : metaStatus, metaInstagramId, metaTokenExpiresAt
- Ces champs sont lus depuis le document users/{uid} (public, pas private/tokens)

### 8. Firestore rules — private/tokens
- [ ] Modifier `firestore.rules`
```javascript
match /users/{userId}/private/{doc} {
  allow read, write: if false;  // Admin SDK only
}
```

### 9. Handle ?connected= query param
- [ ] Dans profil page : si URL contient `?connected=instagram`
  - Afficher un message de succès temporaire (3 secondes)
  - "Instagram connecté avec succès"

## NE PAS faire dans ce milestone
- NE PAS modifier les Cloud Functions existantes (publishToInstagram, scheduler)
- NE PAS créer la Cloud Function refreshMetaToken (on le fera séparément)
- NE PAS toucher à l'éditeur, au calendrier, ou à la banque d'idées
- NE PAS implémenter Facebook ou YouTube OAuth

## Contraintes
- Le token Meta ne doit JAMAIS être exposé côté client
- Toutes les opérations avec le token passent par l'Admin SDK côté serveur
- META_APP_SECRET est une variable d'env serveur (pas NEXT_PUBLIC_)
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes

## Definition of Done
- [ ] npm run build passe sans erreur
- [ ] Bouton "Connecter Instagram" visible dans /profil
- [ ] Clic → redirect vers Meta OAuth → callback → redirect vers /profil?connected=instagram
- [ ] Token long-lived stocké dans users/{uid}/private/tokens (vérifiable dans Firebase Console)
- [ ] Champs publics (metaStatus, metaInstagramId) visibles sur users/{uid}
- [ ] État "Connecté" visible dans /profil avec date d'expiration
- [ ] Les security rules bloquent la lecture de private/tokens côté client
- [ ] Le flow de publication existant continue de fonctionner (on n'a pas touché aux CF)
