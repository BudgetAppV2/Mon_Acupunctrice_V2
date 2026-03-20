# DATA MODEL
*Structure Firestore — source de vérité*

---

## Collection : contentItems

```typescript
interface ContentItem {
  id: string                    // auto-generated

  // Ownership
  userId: string                // Firebase Auth UID

  // Idea
  title: string                 // ex: "L'acupuncture et la fertilité"
  category: ContentCategory     // voir enum ci-dessous
  notes?: string                // notes de tournage

  // Workflow
  workflowState: WorkflowState  // voir enum ci-dessous

  // Asset
  videoUrl?: string             // Firebase Storage URL
  thumbnailUrl?: string         // Firebase Storage URL

  // Distribution
  distributionStatus: DistributionStatus
  platforms: string[]           // ['instagram', 'facebook', 'youtube'] (M10-M11)
  instagramStatus?: 'pending' | 'published' | 'failed'
  facebookStatus?: 'pending' | 'published' | 'failed' (M10)
  youtubeStatus?: 'pending' | 'published' | 'failed' (M11)
  scheduledAt?: Timestamp
  publishedAt?: Timestamp
  instagramMediaId?: string
  facebookPostId?: string       // (M10)
  youtubeVideoId?: string       // (M11)
  caption?: string

  // Stats (M12)
  insights?: {
    plays: number
    reach: number
    likes: number
    comments: number
    shares: number
    saved: number
    fetchedAt: Timestamp
  }

  // Cover image Instagram
  coverOption?: 'frame' | 'custom'  // Méthode choisie par Judith
  thumbOffset?: number               // Millisecondes si coverOption='frame'
  coverImageUrl?: string             // URL Firebase Storage si coverOption='custom'

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

type ContentCategory =
  | 'fertilite'
  | 'grossesse'
  | 'bien_etre'
  | 'mtc'           // Médecine traditionnelle chinoise
  | 'autre'

type WorkflowState =
  | 'idea'           // Idée créée
  | 'planned'        // Date assignée
  | 'ready_to_shoot' // Préparée pour tournage
  | 'shot'           // Filmée, pas encore montée
  | 'editing'        // En cours de montage
  | 'ready'          // Montée, prête à publier

type DistributionStatus =
  | 'draft'          // Pas encore planifiée
  | 'scheduled'      // Planifiée avec date
  | 'publishing'     // En cours de publication
  | 'published'      // Publiée
  | 'failed'         // Échec de publication
```

---

## Collection : users

```typescript
interface User {
  uid: string                   // Firebase Auth UID
  email: string
  displayName: string
  photoURL?: string

  // Meta connection (M09-M10)
  metaInstagramId?: string
  metaAccessToken?: string       // Secret — NEVER expose client-side
  metaTokenExpiresAt?: Timestamp
  metaStatus?: 'connected' | 'expired' | 'disconnected'  // UI state
  facebookPageId?: string
  facebookPageName?: string

  // YouTube connection (M11)
  youtubeChannelId?: string
  youtubeChannelName?: string
  youtubeRefreshToken?: string   // Secret — NEVER expose client-side

  // Wix Configuration (M13)
  wixConfig?: {
    baseUrl: string
    categoryMapping: Record<string, string> // { 'fertilite': '/services/fertilite' }
  }

  // Preferences
  defaultCategory?: ContentCategory
  timezone: string               // ex: 'America/Toronto'

  createdAt: Timestamp
  lastLoginAt: Timestamp
}
```

---

## Collection : analytics (M12)

**Document ID :** `{userId}/daily/{YYYY-MM-DD}`

```typescript
{
  followerCount: number,
  reach: number,
  impressions: number,
  date: string,
  fetchedAt: Timestamp
}
```

---

## Règles de validation

```
contentItem.title       required, max 100 chars
contentItem.userId      required, must match auth.uid
contentItem.category    required, must be valid enum
contentItem.workflowState  required, default: 'idea'
contentItem.distributionStatus  required, default: 'draft'
```

---

## Transitions de statut valides

```
WorkflowState:
idea → planned → ready_to_shoot → shot → editing → ready

DistributionStatus:
draft → scheduled → publishing → published
                              ↓
                           failed → draft (retry)
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /contentItems/{itemId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    match /users/{userId} {
      // Lecture : autorisée pour le propriétaire
      // MAIS les champs sensibles (metaAccessToken, youtubeRefreshToken)
      // ne doivent JAMAIS être lus côté client.
      // → Utiliser Firestore field-level security ou un document séparé
      //   users/{userId}/private/tokens (Cloud Functions only)
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Tokens secrets — accessible uniquement par Cloud Functions
    match /users/{userId}/private/{doc} {
      allow read, write: if false;  // Cloud Functions bypass rules via Admin SDK
    }

    // Analytics — lecture seule pour le propriétaire (M12)
    match /analytics/{userId}/daily/{date} {
      allow read: if request.auth != null
        && request.auth.uid == userId;
      allow write: if false;  // Cloud Functions only
    }
  }
}
```

**Architecture recommandée pour les tokens sensibles (M09) :**
Pour ne jamais exposer les tokens côté client, stocker les secrets
dans un sous-document séparé : `users/{userId}/private/tokens`
```typescript
interface UserTokens {
  metaAccessToken: string
  metaTokenExpiresAt: Timestamp
  youtubeRefreshToken?: string
}
```
Les champs publics (metaStatus, metaInstagramId, youtubeChannelName...)
restent sur le document principal `users/{userId}` pour que l'UI puisse
afficher l'état de connexion sans accéder aux secrets.

---

## Index Firestore requis

```
// Index existants (M01-M07)
contentItems: userId ASC + createdAt DESC
contentItems: userId ASC + workflowState ASC
contentItems: userId ASC + scheduledAt ASC + distributionStatus ASC
contentItems: userId ASC + category ASC + createdAt DESC
contentItems: userId ASC + distributionStatus ASC + scheduledAt ASC

// Index ajoutés (M12 — pour fetchInsights)
contentItems: userId ASC + distributionStatus ASC + publishedAt DESC
```
