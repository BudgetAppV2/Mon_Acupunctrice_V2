# API DESIGN — Cloud Functions et API Routes
*Version 2.0 — Mars 2026 (mis à jour pour M08-M13)*

---

## Vue d'ensemble

```
Client (Next.js)
    ↓
API Routes Next.js (/app/api/)   ← proxys, wrappers, OAuth callbacks
    ↓
Firebase Cloud Functions          ← logique métier lourde
    ↓
Services externes (Instagram, Facebook, YouTube, OpenAI, Anthropic, Jamendo)
```

---

## Secrets Firebase requis

### Secrets originaux (M01-M07)
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY    # Claude caption generation
firebase functions:secrets:set OPENAI_API_KEY        # Whisper transcription
firebase functions:secrets:set JAMENDO_CLIENT_ID     # Jamendo music library
```

### Secrets ajoutés (M09-M11)
```bash
firebase functions:secrets:set META_APP_ID           # Meta App ID (OAuth)
firebase functions:secrets:set META_APP_SECRET        # Meta App Secret (OAuth)
firebase functions:secrets:set GOOGLE_CLIENT_ID       # Google OAuth (YouTube)
firebase functions:secrets:set GOOGLE_CLIENT_SECRET    # Google OAuth (YouTube)
```

### Secrets retirés (après M09)
```
META_USER_TOKEN     → remplacé par token Firestore dynamique (OAuth)
META_IG_ACCOUNT_ID  → récupéré pendant le flow OAuth, stocké dans Firestore
```

---

## Cloud Functions — Existantes (M01-M07)

### 1. generateCaption
**Fichier :** `functions/src/index.ts`
**Secret :** `ANTHROPIC_API_KEY`
**Trigger :** HTTPS callable

```typescript
// Input (M07 — original)
{ title: string, category: string, notes?: string }

// Input (M10+ — multi-plateforme)
{ title: string, category: string, notes?: string, platform?: 'instagram' | 'facebook' | 'youtube', wixUrl?: string }

// Output
{ caption: string }

// Différences par plateforme :
// - instagram : CTA "lien en bio", pas de lien cliquable, max 3 hashtags
// - facebook  : URL Wix cliquable directement dans le texte
// - youtube   : URL Wix cliquable + #Shorts + description enrichie
// - Si wixUrl fourni : inclut les paramètres UTM automatiquement (M13)
```

### 2. publishToInstagram
**Fichier :** `functions/src/instagram.ts`
**Trigger :** HTTPS callable

```typescript
// Input
{
  videoUrl: string,      // URL publique Firebase Storage
  caption: string,
  itemId: string,
  userId: string,        // Pour récupérer le token Meta depuis Firestore
  coverOption: 'frame' | 'custom',
  thumbOffset?: number,
  coverUrl?: string,
}

// Output
{ mediaId: string, status: 'published' | 'failed' }

// Flux interne (après M09 — token dynamique) :
// 1. Lire le token Meta depuis Firestore: users/{userId} → metaAccessToken
// 2. Lire le IG Account ID depuis Firestore: users/{userId} → metaInstagramId
// 3. POST /v25.0/{igAccountId}/media (media_type=REELS, video_url, caption)
// 4. Poll status_code jusqu'à FINISHED (max 60s, poll every 5s)
// 5. POST /v25.0/{igAccountId}/media_publish
// 6. Mise à jour Firestore: instagramStatus='published', instagramMediaId
```

### 3. schedulePublisher
**Fichier :** `functions/src/scheduler.ts`
**Trigger :** Cloud Scheduler — every 15 minutes

```typescript
// Flux multi-plateforme (après M10-M11) :
//
// Toutes les 15 minutes :
//   1. Query Firestore: distributionStatus === 'scheduled' ET scheduledAt <= now
//   2. Pour chaque item :
//      a. Lire item.platforms[] (ex: ['instagram', 'facebook'])
//      b. Lire le token Meta et YouTube depuis users/{userId}
//      c. Pour chaque plateforme :
//         - 'instagram' → publishToInstagram(item)
//         - 'facebook'  → publishToFacebook(item)
//         - 'youtube'   → publishToYouTube(item)
//      d. Chaque plateforme est indépendante : un échec YouTube
//         n'empêche pas la publication Instagram
//   3. Mise à jour Firestore :
//      - Si TOUTES les plateformes OK → distributionStatus='published'
//      - Si AU MOINS UNE échoue → distributionStatus='partial' ou 'failed'
//      - Chaque plateforme a son propre champ de statut
```

### 4. transcribeAudio
**Fichier :** `functions/src/transcribe.ts`
**Secret :** `OPENAI_API_KEY`
**Trigger :** HTTPS callable

```typescript
// Input
{ storagePath: string, cleanup?: boolean }

// Output
{ subtitles: Array<{
    id: number,
    text: string,
    startTime: number,
    endTime: number,
    words: Array<{ word: string, start: number, end: number }>
  }>
}

// Paramètres Whisper : model=whisper-1, language=fr,
// timestamp_granularities=['word'], response_format=verbose_json
```

### 5. searchJamendo
**Fichier :** `functions/src/jamendo.ts`
**Secret :** `JAMENDO_CLIENT_ID`
**Trigger :** HTTPS callable

```typescript
// Input
{ query?: string, mood?: string, limit?: number }

// Output
{ tracks: Array<{
    id: string, name: string, artist: string, duration: number,
    audio: string, image: string
  }>
}
```

---

## Cloud Functions — Nouvelles (M09-M12)

### 6. refreshMetaToken (M09)
**Fichier :** `functions/src/meta-auth.ts`
**Secrets :** `META_APP_ID`, `META_APP_SECRET`
**Trigger :** Cloud Scheduler — hebdomadaire (dimanche 3h AM)

```typescript
// Flux :
// 1. Query Firestore: tous les users avec metaTokenExpiresAt < now + 15 jours
// 2. Pour chaque user :
//    a. GET https://graph.facebook.com/v25.0/oauth/access_token
//       ?grant_type=fb_exchange_token
//       &client_id={META_APP_ID}
//       &client_secret={META_APP_SECRET}
//       &fb_exchange_token={currentToken}
//    b. Réponse : { access_token, token_type, expires_in }
//    c. Mettre à jour Firestore :
//       metaAccessToken = nouveau token
//       metaTokenExpiresAt = now + expires_in
//       metaStatus = 'connected'
// 3. Si échec :
//    metaStatus = 'expired'
//    (L'UI affichera "Reconnecte Instagram" dans /profil)
```

### 7. publishToFacebook (M10)
**Fichier :** `functions/src/facebook.ts`
**Trigger :** HTTPS callable

```typescript
// Input
{
  videoUrl: string,
  caption: string,       // Caption adaptée Facebook (liens cliquables)
  itemId: string,
  userId: string,
}

// Output
{ postId: string, status: 'published' | 'failed' }

// Flux :
// 1. Lire facebookPageId et metaAccessToken depuis users/{userId}
// 2. POST /{page-id}/video_reels
//    Params: source=videoUrl, description=caption
// 3. Poll status jusqu'à ready (max 120s)
// 4. POST /{page-id}/video_reels?action=PUBLISH&video_id={id}
// 5. Mise à jour Firestore: facebookStatus='published', facebookPostId
```

### 8. publishToYouTube (M11)
**Fichier :** `functions/src/youtube.ts`
**Secrets :** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
**Trigger :** HTTPS callable

```typescript
// Input
{
  videoUrl: string,       // Firebase Storage URL (la fonction télécharge d'abord)
  title: string,
  description: string,    // Caption YouTube avec URL Wix cliquable + #Shorts
  tags: string[],         // Max 500 chars total
  itemId: string,
  userId: string,
}

// Output
{ videoId: string, status: 'published' | 'failed' }

// Flux :
// 1. Lire youtubeRefreshToken depuis users/{userId}
// 2. Obtenir un access_token frais via Google OAuth refresh
// 3. Télécharger la vidéo depuis Firebase Storage en mémoire/tmp
// 4. POST https://www.googleapis.com/upload/youtube/v3/videos
//    ?uploadType=resumable
//    &part=snippet,status
//    Body: {
//      snippet: { title, description, tags, categoryId: '26' },
//      status: { privacyStatus: 'public', madeForKids: false }
//    }
// 5. Upload binaire du fichier vidéo
// 6. Mise à jour Firestore: youtubeStatus='published', youtubeVideoId
//
// Note : timeout plus long que Instagram (YouTube traite en 1-2 min)
// Quota : ~1600 units par upload, 10 000 units/jour max
```

### 9. fetchInsights (M12)
**Fichier :** `functions/src/insights.ts`
**Trigger :** Cloud Scheduler — quotidien (6h AM)

```typescript
// Flux :
// 1. Query: tous les users avec metaStatus === 'connected'
// 2. Pour chaque user :
//    a. Query contentItems publiés dans les 30 derniers jours
//    b. Pour chaque item :
//       GET /{instagramMediaId}/insights
//         ?metric=plays,reach,likes,comments,shares,saved
//       → Mettre à jour contentItem.insights
//    c. Stats globales du compte :
//       GET /{metaInstagramId}/insights
//         ?metric=follower_count,reach
//         &period=day
//       → Écrire dans analytics/{userId}/daily/{YYYY-MM-DD}
// 3. Rate limit : max 200 calls/user/hour (largement suffisant)
// 4. Les métriques ne sont disponibles que 24h après publication
```

---

## API Routes Next.js (/app/api/)

### Routes existantes (M01-M07)

#### GET /api/proxy-video
Proxy Firebase Storage vidéos avec headers COEP.
```typescript
// Query: ?url=encodedFirebaseStorageUrl
// Headers: Cross-Origin-Resource-Policy: cross-origin, CORS, range requests
```

#### GET /api/proxy-image
Proxy Firebase Storage images avec headers COEP.

#### GET /api/proxy-audio
Proxy Jamendo audio avec headers COEP/CORS + range requests.

#### POST /api/transcribe
Wrapper vers Cloud Function transcribeAudio.

#### POST /api/publish
Wrapper vers Cloud Function publishToInstagram.
```typescript
// Body: { videoUrl, caption, itemId, coverOption, thumbOffset?, coverUrl? }
```

#### POST /api/generate-caption
Wrapper vers Cloud Function generateCaption.
```typescript
// Body (M13+): { title, category, notes?, platform?, wixUrl? }
```

#### GET /api/search-music
Wrapper vers Cloud Function searchJamendo.

### Routes nouvelles (M09-M11)

#### GET /api/auth/instagram (M09)
Initie le flow OAuth Meta pour Instagram.
```typescript
// Redirect vers :
// https://www.facebook.com/v25.0/dialog/oauth
//   ?client_id={META_APP_ID}
//   &redirect_uri={VERCEL_URL}/api/auth/instagram/callback
//   &scope=instagram_business_basic,instagram_business_content_publish,
//          pages_manage_posts,pages_read_engagement,instagram_manage_insights
//   &response_type=code
```

#### GET /api/auth/instagram/callback (M09)
Callback OAuth Meta.
```typescript
// Query: ?code=xxx
// Flux :
// 1. Échange code → short-lived token (1h)
// 2. Échange short-lived → long-lived token (60j)
// 3. GET /me/accounts → récupère facebookPageId
// 4. GET /{pageId}?fields=instagram_business_account → récupère metaInstagramId
// 5. Stocke dans Firestore: metaAccessToken, metaTokenExpiresAt,
//    metaInstagramId, metaStatus='connected', facebookPageId, facebookPageName
// 6. Redirect vers /profil?connected=instagram
```

#### GET /api/auth/youtube (M11)
Initie le flow OAuth Google pour YouTube.
```typescript
// Redirect vers :
// https://accounts.google.com/o/oauth2/v2/auth
//   ?client_id={GOOGLE_CLIENT_ID}
//   &redirect_uri={VERCEL_URL}/api/auth/youtube/callback
//   &scope=https://www.googleapis.com/auth/youtube.upload
//          https://www.googleapis.com/auth/youtube.readonly
//   &response_type=code
//   &access_type=offline    ← pour obtenir un refresh_token permanent
//   &prompt=consent
```

#### GET /api/auth/youtube/callback (M11)
Callback OAuth Google.
```typescript
// Query: ?code=xxx
// Flux :
// 1. Échange code → access_token + refresh_token
// 2. GET https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true
//    → récupère channelId, channelName
// 3. Stocke dans Firestore: youtubeRefreshToken, youtubeChannelId,
//    youtubeChannelName
// 4. Redirect vers /profil?connected=youtube
```

#### POST /api/publish-facebook (M10)
Wrapper vers Cloud Function publishToFacebook.
```typescript
// Body: { videoUrl, caption, itemId }
```

#### POST /api/publish-youtube (M11)
Wrapper vers Cloud Function publishToYouTube.
```typescript
// Body: { videoUrl, title, description, tags, itemId }
```

---

## Headers COOP/COEP (next.config.ts)

Requis pour FFmpeg.wasm (SharedArrayBuffer).

```typescript
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    }]
  },
}
```

---

## Publication Instagram — Détail technique important

### URL publique requise
Instagram Graph API nécessite une URL vidéo **publiquement accessible**.
URL publique : `https://storage.googleapis.com/{bucket}/videos/{userId}/{itemId}.mp4`
Les règles Firebase Storage permettent la lecture publique pour `/videos/`.

### Durée de traitement
Instagram : 10-60 secondes (poll every 5s, max 60s).
YouTube : 30-120 secondes (poll every 10s, max 180s).
Facebook : similaire à Instagram.
Si timeout → statut `failed`, Judith peut réessayer manuellement.
