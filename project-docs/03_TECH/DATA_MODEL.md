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
  distributionStatus: DistributionStatus  // voir enum ci-dessous
  scheduledAt?: Timestamp
  publishedAt?: Timestamp
  instagramPostId?: string
  caption?: string

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

  // Instagram connection
  instagramAccessToken?: string  // Stocké encrypté
  instagramUserId?: string

  // Preferences
  defaultCategory?: ContentCategory
  timezone: string               // ex: 'America/Toronto'

  createdAt: Timestamp
  lastLoginAt: Timestamp
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
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

---

## Index Firestore requis

```
contentItems: userId ASC + createdAt DESC
contentItems: userId ASC + workflowState ASC
contentItems: userId ASC + scheduledAt ASC + distributionStatus ASC
```
