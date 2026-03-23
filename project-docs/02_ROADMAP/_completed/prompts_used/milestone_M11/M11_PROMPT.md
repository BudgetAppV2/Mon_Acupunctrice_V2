# Milestone 11 — YouTube Shorts & Google OAuth

## Contexte
Mon Acupunctrice Hub V2 publie sur Instagram (M07/M09) et Facebook (M10).
YouTube Shorts est la 3e plateforme — même MP4 9:16 < 60s.
Les Shorts apparaissent dans Google Search → SEO long terme pour Judith.

L'architecture utilise des **API routes Next.js** (pas Cloud Functions) pour
la publication. Les tokens sont stockés via Firebase Admin SDK dans
`users/{uid}/private/tokens`.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Admin SDK,
Google OAuth 2.0, YouTube Data API v3.

## Fichiers à lire AVANT de commencer
- `app/api/auth/facebook/route.ts` → pattern OAuth redirect (réutiliser pour Google)
- `app/api/auth/facebook/callback/route.ts` → pattern callback + Firestore tokens
- `app/api/publish-facebook/route.ts` → pattern publication API route
- `components/features/profile/FacebookConnectButton.tsx` → pattern UI connect button
- `components/features/publish/PublishSheet.tsx` → toggles plateformes (ajouter YouTube)
- `lib/hooks/useUserProfile.ts` → hook profil (ajouter champs YouTube)
- `lib/hooks/usePublish.ts` → hook publication
- `lib/firebase-admin.ts` → Firebase Admin SDK
- `lib/utils/oauth-state.ts` → signState/verifyState pour CSRF

## Prérequis — À configurer AVANT le code
Benoit doit aller dans Google Cloud Console (https://console.cloud.google.com)
et configurer le projet `mon-acupunctrice-hub` :
1. Activer YouTube Data API v3
2. Créer des credentials OAuth 2.0 (Web application)
3. Ajouter le redirect URI : `https://mon-acupunctrice-v2.vercel.app/api/auth/youtube/callback`
4. Copier Client ID et Client Secret
5. Ajouter dans .env.local et Vercel :
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`

## Livrables

### 1. OAuth Google — Redirect
- [ ] `app/api/auth/youtube/route.ts`
Même pattern que `app/api/auth/facebook/route.ts` mais pour Google :
```typescript
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

// Params: client_id, redirect_uri, scope, response_type=code,
// access_type=offline, prompt=consent, state=signState(uid)
```

### 2. OAuth Google — Callback
- [ ] `app/api/auth/youtube/callback/route.ts`
```
1. Valider state avec verifyState()
2. Échanger code → tokens via POST https://oauth2.googleapis.com/token
   body: { code, client_id, client_secret, redirect_uri, grant_type=authorization_code }
   → retourne { access_token, refresh_token, expires_in }
3. GET https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true
   Headers: Authorization: Bearer {access_token}
   → retourne channelId, channelTitle
4. Stocker dans Firestore :
   - users/{uid}/private/tokens → youtubeRefreshToken
   - users/{uid} → youtubeChannelId, youtubeChannelName, youtubeStatus: 'connected'
5. Redirect → /profil?connected=youtube
```

### 3. Connect Button
- [ ] `components/features/profile/YouTubeConnectButton.tsx`
Même pattern que `FacebookConnectButton.tsx` :
- Déconnecté : bouton rouge "Connecter YouTube"
- Connecté : "YouTube connecté" + "Chaîne : {nom}" + bouton Reconnecter
- Pas d'expiration — le refresh_token Google est permanent

### 4. API Route Publication
- [ ] `app/api/publish-youtube/route.ts`
Même pattern que `app/api/publish-facebook/route.ts` :
```
POST /api/publish-youtube
body: { itemId, uid }

1. Lire contentItem, user, tokens depuis Firestore (Admin SDK)
2. Refresh le access_token via POST https://oauth2.googleapis.com/token
   body: { refresh_token, client_id, client_secret, grant_type=refresh_token }
3. Télécharger la vidéo depuis videoUrl (Firebase Storage)
4. Upload vers YouTube via Resumable Upload :
   a. POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status
      Headers: Authorization, Content-Type: application/json
      Body: { snippet: { title, description, tags, categoryId:'26' },
              status: { privacyStatus:'public', selfDeclaredMadeForKids:false } }
      → retourne Location header avec upload URL
   b. PUT {upload_url} avec le blob vidéo
      Headers: Content-Type: video/mp4
4. Update Firestore : youtubeStatus='published', youtubeVideoId
```

**Description YouTube :**
```
{caption}

#Shorts #Acupuncture #SantéNaturelle

🔗 Prendre rendez-vous : https://judithtremblay.com
```

### 5. Modifier useUserProfile
- [ ] Ajouter dans `lib/hooks/useUserProfile.ts` :
- États : `youtubeStatus`, `youtubeChannelId`, `youtubeChannelName`
- Lire dans le onSnapshot

### 6. Modifier PublishSheet
- [ ] Ajouter toggle "Publier aussi sur YouTube" dans `PublishSheet.tsx`
Même pattern que le toggle Facebook :
- Visible seulement si `youtubeChannelId` existe
- Appel à `/api/publish-youtube` en parallèle du publish Instagram

### 7. Modifier ContentItem type
- [ ] Ajouter dans `lib/types/index.ts` :
```typescript
youtubeStatus?: 'pending' | 'published' | 'failed' | 'quota_exceeded';
youtubeVideoId?: string;
```

### 8. Modifier la page Profil
- [ ] Ajouter `YouTubeConnectButton` dans `app/(app)/profil/page.tsx`
Après le FacebookConnectButton, avant "Mon site Wix"

## Quota YouTube
- 10 000 units/jour
- 1 upload ≈ 1600 units → max ~6/jour
- Judith (3/semaine) = largement OK
- Si quota dépassé → youtubeStatus='quota_exceeded'
- Pas de retry automatique (Judith retente manuellement)

## Contraintes
- Google refresh_token est permanent — pas besoin de cron refresh
- NE PAS créer de Cloud Function — tout en API routes Next.js
- Description YouTube doit inclure URL Wix cliquable
- npm install googleapis UNIQUEMENT si nécessaire pour le resumable upload,
  sinon utiliser fetch() directement (plus léger)
- Heroicons uniquement
- 0 console.log en production
- Composants < 150 lignes

## Definition of Done
- [ ] npm run build passe
- [ ] Flow OAuth Google fonctionne (/profil?connected=youtube)
- [ ] YouTubeConnectButton affiche "Connecté" avec nom de chaîne
- [ ] Toggle YouTube dans PublishSheet
- [ ] Publication réussie comme YouTube Short
- [ ] Description contient URL Wix + #Shorts
- [ ] Types ContentItem mis à jour
