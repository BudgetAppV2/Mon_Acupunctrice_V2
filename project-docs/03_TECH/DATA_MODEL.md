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

## Collection : faqs (Migration Wix — MW-B2)

```typescript
type FaqCategory = 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'seance';
type PublicationStatus = 'draft' | 'pending' | 'published' | 'rejected';

interface FAQ {
  id: string;
  question: string;
  reponse: string;               // markdown
  category: FaqCategory;
  order: number;
  status: PublicationStatus;
  ctaVariant: 'reserver' | 'contact' | 'tarifs';
  relatedServices: string[];     // slugs pages services
  relatedArticles: string[];     // slugs articles publicBlog
  relatedFaqs: string[];         // IDs d'autres documents faqs
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  rejectionReason?: string;      // Q11 — raison du rejet
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

Lecture publique conditionnelle : `status == 'published'` uniquement.
Pages : `/faq`, `/faq/[category]`. Admin : `(app)/site-public/faqs/` (MW-E1).
Import initial : 6 FAQ depuis `scripts/seo-geo/source/` (MW-D3).

---

## Collection : ressources (Migration Wix — MW-B2)

```typescript
interface Ressource {
  id: string;
  title: string;
  slug: string;
  type: 'guide' | 'checklist' | 'article-fond' | 'infographie';
  pilier: 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'transversal';
  status: PublicationStatus;

  // Meta SEO
  metaTitle: string;
  metaDescription: string;
  heroImageUrl?: string;
  heroImageAlt: string;

  // Sections riches (markdown)
  shortAnswer: string;
  introSection: string;
  scienceSection: string;
  mechanismSection: string;
  judithApproach: string;
  whatToExpect: string;
  protocolSection: string;
  testimonial: string;

  // FAQ embarquée (schema.org FAQPage)
  faqEntries: { question: string; answer: string }[];

  // Citations scientifiques
  citations: { authors: string; title: string; journal: string; year: number; url?: string }[];

  // Relations (maillage)
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  relatedResources: string[];

  authorName: string;
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

Lecture publique conditionnelle : `status == 'published'`.
Pages : `/ressources`, `/ressources/[slug]`. Admin : `(app)/site-public/ressources/` (MW-E2).
Import initial : 5 ressources depuis `scripts/seo-geo/source-resources/` (MW-D3).
Les pages services (`/services/*`) extraient des sections de la ressource correspondante (hub-and-spoke).

---

## Collection : publicBlog (Migration Wix — MW-B2)

```typescript
interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;               // markdown (converti depuis Ricos)
  excerpt: string;
  coverImage: string;
  author: string;                // "Judith Dufour-Savard" ou co-auteur Claire Thomas
  category: string;
  tags: string[];
  status: PublicationStatus;
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  wixPostId?: string;            // double publication Wix/Firestore (amendement A3)
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

Lecture publique conditionnelle : `status == 'published'`.
Pages : `/blog`, `/blog/[slug]`. Import : 11 articles Wix via parser Ricos (MW-B4 + MW-D1).

---

## Collection : servicePages (Migration Wix — MW-B2)

```typescript
interface ServicePage {
  id: string;
  slug: 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale';
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  content: string;               // markdown — contenu court du hub
  status: PublicationStatus;
  updatedAt: Timestamp;
}
```

Lecture publique conditionnelle : `status == 'published'`.
Pages : `/services/[slug]`. Seulement 4 documents (un par pilier).
Le contenu court est extrait de la ressource correspondante.

---

## Collection : siteConfig (Migration Wix — MW-B2)

```typescript
// ATTENTION : lecture publique sans authentification.
// Ne JAMAIS stocker de données sensibles.
interface SiteConfig {
  id: string;        // 'general', 'nap', 'social', 'testimonials', 'contentRefresh'
  data: Record<string, unknown>;
  updatedAt: Timestamp;
}
```

Lecture publique sans condition (pas de filtre status).
Contient des données non sensibles : NAP clinique, liens sociaux, textes de footer, timestamps crons.

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

    // --- Site public (MW-B2) ---
    // Voir firestore.rules pour l'implémentation complète.
    // isAdmin() = allowlist emails vérifiés (Benoit + Judith)
    // faqs, ressources, publicBlog, servicePages : read si status=='published', write si isAdmin()
    // siteConfig : read public sans condition, write si isAdmin()
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

// Index ajoutés (MW-B2 — site public)
faqs: status ASC + category ASC + order ASC
ressources: status ASC + pilier ASC + publishedAt DESC
publicBlog: status ASC + publishedAt DESC
publicBlog: status ASC + category ASC + publishedAt DESC
```
