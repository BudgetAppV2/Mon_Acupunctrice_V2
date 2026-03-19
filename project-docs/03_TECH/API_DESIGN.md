# API DESIGN — Cloud Functions et API Routes
*Version 1.0 — Mars 2026*

---

## Vue d'ensemble

```
Client (Next.js)
    ↓
API Routes Next.js (/app/api/)   ← proxys et wrappers légers
    ↓
Firebase Cloud Functions          ← logique métier lourde
    ↓
Services externes (Instagram, OpenAI, Anthropic, Jamendo)
```

---

## Secrets Firebase requis

À setter une fois dans le projet Firebase V2 :
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY   # Claude caption generation
firebase functions:secrets:set OPENAI_API_KEY       # Whisper transcription
firebase functions:secrets:set META_USER_TOKEN      # Instagram Graph API token
firebase functions:secrets:set META_IG_ACCOUNT_ID  # Instagram account ID
firebase functions:secrets:set JAMENDO_CLIENT_ID    # Jamendo music library
```

---

## Cloud Functions (réutilisées du V1)

### 1. generateCaption
**Fichier :** `functions/src/index.ts`
**Secret :** `ANTHROPIC_API_KEY`
**Trigger :** HTTPS callable

```typescript
// Input
{ title: string, category: string, notes?: string }

// Output
{ caption: string }  // ~150 mots, français québécois, inclut CTA Wix
```

### 2. publishToInstagram
**Fichier :** `functions/src/instagram.ts`
**Secrets :** `META_USER_TOKEN`, `META_IG_ACCOUNT_ID`
**Trigger :** HTTPS callable

```typescript
// Input
{
  videoUrl: string,      // URL publique Firebase Storage
  caption: string,
  itemId: string,
  coverOption: 'frame' | 'custom',
  thumbOffset?: number,  // Millisecondes — si coverOption === 'frame'
  coverUrl?: string,     // URL publique — si coverOption === 'custom'
}

// Output
{ mediaId: string, status: 'published' | 'failed' }

// Flux interne
// 1. POST /v25.0/{igAccountId}/media
//    Params: media_type=REELS, video_url, caption
//    + thumb_offset (si frame sélectionnée)
//    OU cover_url (si image custom uploadée)
// 2. Poll status_code jusqu'à FINISHED (max 60s)
// 3. POST /v25.0/{igAccountId}/media_publish
// 4. Mise à jour Firestore automatique
```

**Paramètres Instagram Graph API pour la couverture :**
```
thumb_offset : Timecode en millisecondes de la frame voulue
               ex: 3500 = frame à 3.5 secondes
               Valeur par défaut: 0 (première frame)

cover_url    : URL publique d'une image JPG/PNG
               Dimensions recommandées: 1080×1920px (9:16)
               Instagram recompresse de toute façon
               ⚠️ Doit être accessible publiquement (pas de token signé)
```

### 3. schedulePublisher
**Fichier :** `functions/src/scheduler.ts`
**Secrets :** `META_USER_TOKEN`, `META_IG_ACCOUNT_ID`
**Trigger :** Cloud Scheduler — every 15 minutes

```
Flux de publication automatique :

Toutes les 15 minutes
    ↓
Query Firestore:
  distributionStatus === 'scheduled'
  ET scheduledAt <= maintenant
    ↓
Pour chaque item :
  → publishToInstagram(videoUrl, caption)
  → Success : distributionStatus = 'published' + publishedAt
  → Échec   : distributionStatus = 'failed' + lastPublishError
```

### 4. transcribeAudio
**Fichier :** `functions/src/transcribe.ts`
**Secrets :** `OPENAI_API_KEY`
**Trigger :** HTTPS callable

```typescript
// Input
{ storagePath: string, cleanup?: boolean }

// Output
{ subtitles: Array<{
    id: number,
    text: string,
    startTime: number,  // secondes
    endTime: number,
    words: Array<{ word: string, start: number, end: number }>
  }>
}

// Paramètres Whisper
// model: whisper-1
// language: fr
// timestamp_granularities: ['word']
// response_format: verbose_json
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
    id: string,
    name: string,
    artist: string,
    duration: number,
    audio: string,     // URL stream (passe par /api/proxy-audio)
    image: string,     // Pochette (passe par /api/proxy-image)
  }>
}
```

---

## API Routes Next.js (/app/api/)

Ces routes remplacent le serveur Express du V1 (server.js).

### GET /api/proxy-video
Proxy Firebase Storage vidéos avec headers COEP.
```typescript
// Query: ?url=encodedFirebaseStorageUrl
// Headers ajoutés:
//   Cross-Origin-Resource-Policy: cross-origin
//   Access-Control-Allow-Origin: *
// Support range requests (streaming)
```

### GET /api/proxy-image
Proxy Firebase Storage images avec headers COEP.
```typescript
// Query: ?url=encodedFirebaseStorageUrl
// Headers ajoutés:
//   Cross-Origin-Resource-Policy: cross-origin
//   Access-Control-Allow-Origin: *
```

### GET /api/proxy-audio
Proxy Jamendo audio avec headers COEP/CORS.
```typescript
// Query: ?url=encodedJamendoStreamUrl
// Headers ajoutés:
//   Cross-Origin-Resource-Policy: cross-origin
//   Access-Control-Allow-Origin: *
//   Accept-Ranges: bytes
```

### POST /api/transcribe
Wrapper vers Cloud Function transcribeAudio.
```typescript
// Body: { storagePath: string }
// Response: { subtitles: SubtitleSegment[] }
```

### POST /api/publish
Wrapper vers Cloud Function publishToInstagram.
```typescript
// Body: { videoUrl: string, caption: string, itemId: string }
// Response: { mediaId: string } | { error: string }
```

### POST /api/generate-caption
Wrapper vers Cloud Function generateCaption.
```typescript
// Body: { title: string, category: string, notes?: string }
// Response: { caption: string }
```

### GET /api/search-music
Wrapper vers Cloud Function searchJamendo.
```typescript
// Query: ?q=search&mood=relaxing&limit=20
// Response: { tracks: Track[] }
```

---

## Headers COOP/COEP (next.config.ts)

Requis pour FFmpeg.wasm (SharedArrayBuffer).

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
}
```

---

## Publication Instagram — Détail technique important

### URL publique requise
Instagram Graph API nécessite une URL vidéo **publiquement accessible**.

Firebase Storage génère des URLs signées temporaires par défaut.
Pour V2, configurer les vidéos exportées comme publiques :

```typescript
// Après upload dans Firebase Storage
const videoRef = ref(storage, `videos/${userId}/${itemId}.mp4`)
await uploadBytes(videoRef, blob)

// Rendre public
await updateMetadata(videoRef, {
  customMetadata: { 'access': 'public' }
})

// URL publique (pas de token, pas d'expiration)
const publicUrl = `https://storage.googleapis.com/${bucket}/videos/${userId}/${itemId}.mp4`
```

Les règles Firebase Storage doivent permettre la lecture publique
pour le dossier `/videos/` (les sous-titres et thumbnails restent privés).

### Durée de traitement Instagram
Instagram prend 10-60 secondes pour traiter une vidéo.
Le scheduler poll toutes les 5 secondes pendant max 60 secondes.
Si timeout → statut `failed`, Judith peut réessayer manuellement.
