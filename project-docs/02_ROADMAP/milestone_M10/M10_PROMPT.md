# Milestone M10 — Facebook Reels Publication

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 déployée sur Vercel.
Instagram fonctionne (M09). Facebook Reels utilise la même Meta App
mais nécessite un flow OAuth séparé via Facebook Login (pas Instagram Login)
pour obtenir les permissions Page.

Meta App ID : 823305796703895
Meta App Secret (Instagram) : dans .env.local META_APP_SECRET
L'app est en mode Development — pas besoin d'App Review pour les admins.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Auth/Firestore,
Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `app/api/auth/instagram/route.ts` → flow OAuth Instagram (pattern à suivre)
- `app/api/auth/instagram/callback/route.ts` → callback Instagram
- `app/api/publish/route.ts` → publication Instagram actuelle
- `lib/firebase-admin.ts` → Admin SDK init
- `lib/utils/oauth-state.ts` → signState/verifyState
- `lib/hooks/useUserProfile.ts` → profil utilisateur
- `components/features/profile/InstagramConnectButton.tsx` → pattern UI connexion
- `components/features/publish/PublishSheet.tsx` → sheet publication
- `firestore.rules` → rules actuelles

## Architecture Facebook Reels API

### Différence clé avec Instagram
Instagram utilise Instagram Business Login (`instagram.com/oauth/authorize`)
avec l'Instagram App ID (1224688753149053).

Facebook utilise Facebook Login (`facebook.com/v25.0/dialog/oauth`)
avec le Meta App ID (823305796703895) et les scopes Facebook Pages.

### Flow OAuth Facebook
1. Redirect vers `https://www.facebook.com/v25.0/dialog/oauth`
   avec client_id=823305796703895, scope=pages_manage_posts,pages_read_engagement,pages_show_list
2. Callback reçoit un code → échange pour user access token
3. Échange user token → long-lived user token (60 jours)
4. GET /me/accounts → liste des Pages Facebook → récupérer le Page Access Token
5. Le Page Access Token est long-lived par défaut quand il vient d'un long-lived user token
6. Stocker dans Firestore : facebookPageAccessToken, facebookPageId, facebookPageName

### Publication Facebook Reels (3 étapes)
1. **Init upload :** POST /{page-id}/video_reels
   body: upload_phase=start, access_token={page_access_token}
   → retourne video_id et upload_url

2. **Upload vidéo :** POST {upload_url}
   headers: Authorization=OAuth {page_access_token}, file_url={video_url_firebase}
   → retourne success=true

3. **Publish :** POST /{page-id}/video_reels
   body: upload_phase=finish, video_id={video_id}, description={caption},
   access_token={page_access_token}
   → retourne success=true, id du post

### Permissions requises
- `pages_manage_posts` — publier du contenu sur la Page
- `pages_read_engagement` — lire les stats de la Page
- `pages_show_list` — lister les Pages de l'utilisateur

En mode Development, l'admin de l'app peut utiliser ces permissions
sans passer par App Review.

## Livrables

### 1. API Route — OAuth Facebook initiation
- [ ] `app/api/auth/facebook/route.ts`
```
GET /api/auth/facebook?uid=xxx
1. Signer le state avec signState(uid)
2. Redirect vers :
   https://www.facebook.com/v25.0/dialog/oauth
   ?client_id=823305796703895
   &redirect_uri=https://mon-acupunctrice-v2.vercel.app/api/auth/facebook/callback
   &scope=pages_manage_posts,pages_read_engagement,pages_show_list
   &response_type=code
   &state={signedState}
```

### 2. API Route — OAuth Facebook callback
- [ ] `app/api/auth/facebook/callback/route.ts`
```
GET /api/auth/facebook/callback?code=xxx&state=xxx
1. Vérifier le state → extraire uid
2. Échanger code → short-lived user token :
   POST https://graph.facebook.com/v25.0/oauth/access_token
   body: client_id, client_secret (META_APP_SECRET), redirect_uri, code
3. Échanger short → long-lived user token :
   GET https://graph.facebook.com/v25.0/oauth/access_token
   ?grant_type=fb_exchange_token&client_id=xxx&client_secret=xxx&fb_exchange_token=xxx
4. GET /me/accounts?access_token={long_lived_user_token}
   → récupérer la première Page : id, name, access_token (page token)
5. Écrire dans Firestore (Admin SDK) :
   - users/{uid}/private/tokens → ajouter facebookPageAccessToken
   - users/{uid} → facebookPageId, facebookPageName, facebookStatus: 'connected'
6. Redirect vers /profil?connected=facebook
```

### 3. API Route — Publication Facebook Reels
- [ ] `app/api/publish-facebook/route.ts`
```
POST /api/publish-facebook
body: { itemId }
1. Lire le contentItem depuis Firestore → videoUrl, caption
2. Lire le token depuis users/{uid}/private/tokens → facebookPageAccessToken
3. Lire facebookPageId depuis users/{uid}
4. 3 étapes de publication :
   a. POST /{pageId}/video_reels (upload_phase=start)
   b. POST {upload_url} avec file_url=videoUrl
   c. POST /{pageId}/video_reels (upload_phase=finish, description=caption)
5. Update contentItem : facebookStatus='published', facebookPostId
```
Note : le token Facebook est lu par l'Admin SDK depuis private/tokens,
pas par le client. L'API route reçoit l'itemId et le uid du caller.

### 4. Composant UI — FacebookConnectButton
- [ ] `components/features/profile/FacebookConnectButton.tsx`
Même pattern que InstagramConnectButton mais pour Facebook.
3 états : déconnecté, connecté (badge + nom de la Page), erreur.
onClick → window.location.href = `/api/auth/facebook?uid=${user.uid}`

### 5. Modifier PublishSheet — toggle Facebook
- [ ] Modifier `components/features/publish/PublishSheet.tsx`
Ajouter un toggle "Publier aussi sur Facebook" :
- Si facebookPageId absent → texte "Connecte Facebook dans Profil" en gris
- Si facebookPageId présent → toggle activable
- Si toggle activé et publication lancée → appeler /api/publish-facebook en parallèle

### 6. Intégrer dans /profil
- [ ] Modifier `app/(app)/profil/page.tsx`
Ajouter FacebookConnectButton sous InstagramConnectButton.

### 7. Étendre useUserProfile
- [ ] Modifier `lib/hooks/useUserProfile.ts`
Exposer : facebookStatus, facebookPageId, facebookPageName

### 8. Data model — nouveaux champs
Sur `contentItems` :
- `platforms`: string[] (ex: ['instagram', 'facebook'])
- `facebookStatus`: 'pending' | 'published' | 'failed'
- `facebookPostId`: string

Sur `users/{uid}` :
- `facebookPageId`: string
- `facebookPageName`: string
- `facebookStatus`: 'connected' | 'disconnected'

Sur `users/{uid}/private/tokens` :
- `facebookPageAccessToken`: string (ajouté au doc existant)

### 9. Redirect URI Meta
**ÉTAPE MANUELLE** — Ajouter dans Meta Developer Dashboard :
Facebook Login → Settings → Valid OAuth Redirect URIs :
`https://mon-acupunctrice-v2.vercel.app/api/auth/facebook/callback`

## Contraintes
- Le facebookPageAccessToken ne doit JAMAIS être exposé côté client
- Toutes les opérations avec le token passent par l'Admin SDK côté serveur
- Pour le callback Facebook OAuth, utiliser `META_FB_APP_SECRET` (variable déjà dans .env.local).
  C'est le Meta App Secret (Settings → Basic), PAS la clé secrète Instagram.
  `META_APP_SECRET` = clé secrète Instagram (pour le flow Instagram M09).
  `META_FB_APP_SECRET` = App Secret Facebook (pour le flow Facebook M10).
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes

## Definition of Done
- [ ] npm run build passe sans erreur
- [ ] Bouton "Connecter Facebook" visible dans /profil
- [ ] Flow OAuth Facebook → callback → redirect /profil?connected=facebook
- [ ] Page Facebook ID et token stockés dans Firestore
- [ ] Toggle "Facebook" visible dans PublishSheet
- [ ] Publication Facebook Reels réussie sur la page de Judith
- [ ] Les erreurs Facebook sont indépendantes d'Instagram
