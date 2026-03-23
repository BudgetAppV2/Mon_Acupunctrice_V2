# Milestone 12 — Stats & Analytics Dashboard

## Objectif
Donner à Judith une visibilité sur l'impact de son contenu via un dashboard
motivant. Les métriques Instagram sont récupérées via l'API Insights et
stockées dans Firestore pour historique.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Admin SDK,
Instagram Graph API (Insights), recharts.

## Fichiers à lire AVANT de commencer
- `app/(app)/profil/page.tsx` → page profil (ajouter StatsSummary)
- `app/(app)/stats/page.tsx` → page stats existante (vide)
- `app/api/cron/publish/route.ts` → pattern API route cron sécurisée
- `lib/hooks/useUserProfile.ts` → hook profil (pattern onSnapshot)
- `lib/hooks/useContentItems.ts` → hook items (pattern query)
- `lib/firebase-admin.ts` → Firebase Admin SDK
- `lib/types/index.ts` → ContentItem type

## Architecture

### Flow de récupération des stats
```
Vercel Cron (1x/jour, 6h AM UTC)
  → GET /api/cron/fetch-insights
  → Query Firestore : users avec metaStatus === 'connected'
  → Pour chaque user :
    1. Lire metaAccessToken depuis users/{uid}/private/tokens
    2. Query contentItems publiés (instagramPostId existe) < 30 jours
    3. Pour chaque item :
       GET /{instagramMediaId}/insights?metric=plays,reach,likes,comments,shares,saved
       → Update contentItem.insights
    4. GET /{metaInstagramId}/insights?metric=follower_count,reach&period=day
       → Écrire dans analytics/{userId}/daily/{YYYY-MM-DD}
```

### Data model
```typescript
// Sur ContentItem (ajouté)
insights?: {
  plays: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  fetchedAt: Timestamp;
}

// Nouvelle sous-collection analytics/{userId}/daily/{YYYY-MM-DD}
{
  followerCount: number;
  reach: number;
  impressions: number;
  date: string;        // 'YYYY-MM-DD'
  fetchedAt: Timestamp;
}
```

## Livrables

### 1. Cron Job — Fetch Insights
- [ ] `app/api/cron/fetch-insights/route.ts`
Sécurisé par CRON_SECRET (même pattern que `/api/cron/publish`).

```typescript
export async function GET(request: NextRequest) {
  // Vérifier CRON_SECRET
  // Query users avec metaStatus === 'connected'
  // Pour chaque user : fetchUserInsights(uid, tokens, items)
  // Retourner { processed, errors }
}
```

**Logique fetchUserInsights :**
```
1. Lire tokens depuis users/{uid}/private/tokens
   → metaAccessToken (long-lived Instagram token)
   → metaInstagramId (depuis users/{uid})

2. Query contentItems du user avec instagramPostId != null
   Limiter aux 30 derniers jours (publishedAt > 30j ago)

3. Pour chaque item avec instagramPostId :
   GET https://graph.facebook.com/v25.0/{instagramPostId}/insights
     ?metric=plays,reach,likes,comments,shares,saved
     &access_token={metaAccessToken}
   → Parse la réponse (format: data[].values[0].value)
   → Update contentItem.insights dans Firestore

4. Stats globales du compte :
   GET https://graph.facebook.com/v25.0/{metaInstagramId}/insights
     ?metric=follower_count,reach
     &period=day
     &since={yesterday_unix}
     &until={today_unix}
     &access_token={metaAccessToken}
   → Écrire dans analytics/{userId}/daily/{date}

5. Rate limit : max 200 API calls par user par heure
   Si erreur 429 → log et skip
```

- [ ] Ajouter le cron dans `vercel.json` :
```json
{
  "crons": [
    { "path": "/api/cron/publish", "schedule": "0 * * * *" },
    { "path": "/api/cron/fetch-insights", "schedule": "0 10 * * *" }
  ]
}
```
Note : 10h UTC = 6h AM Montréal (été) / 5h AM (hiver).
Plan Hobby : max 2 crons.

### 2. Hook — useAnalytics
- [ ] `lib/hooks/useAnalytics.ts`

```typescript
// Résumé 30 jours pour les cartes profil
export function useInsightsSummary(uid?: string) {
  // Query contentItems du user avec insights != null
  // Somme : totalPlays, totalReach, totalEngagement (likes+comments+shares+saved)
  // Retourne { totalPlays, totalReach, totalEngagement, publishCount }
}

// Données quotidiennes pour les graphiques
export function useDailyAnalytics(uid?: string, days = 30) {
  // Query analytics/{uid}/daily/ ordonnée par date DESC, limit days
  // Retourne tableau [{ date, followerCount, reach, impressions }]
}

// Top Reels par engagement
export function useTopReels(uid?: string, limit = 5) {
  // Query contentItems du user avec insights != null
  // Trier par engagement total (likes + comments + shares + saved)
  // Retourner les top N
}
```

### 3. Composant — StatsSummary (profil)
- [ ] `components/features/profile/StatsSummary.tsx`
4 cartes compactes affichées dans la page /profil :

```
┌──────────────┐ ┌──────────────┐
│  👁 Vues     │ │  ❤ Engage.   │
│  12.4K       │ │  847         │
│  30 derniers j│ │  30 derniers j│
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│  👥 Followers│ │  📊 Constance│
│  1,240  ↑12  │ │  2.3/sem     │
│  +12 cette sem│ │  4 sem       │
└──────────────┘ └──────────────┘
```

- Grid 2x2
- Icônes Heroicons (EyeIcon, HeartIcon, UserGroupIcon, ChartBarIcon)
- Nombres formatés (1.2K, 847, etc.)
- Couleur sage pour les tendances positives, gray pour neutre
- Si pas de données : "Publie ton premier Reel pour voir tes stats!"

### 4. Page — /stats
- [ ] `app/(app)/stats/page.tsx`
Page dédiée avec graphiques recharts :

**Section 1 : Performance des Reels**
- BarChart horizontal : top 5 Reels par vues
  - Barre sage, label = titre tronqué
  - Tap sur une barre → ouvre le detail sheet

**Section 2 : Reach quotidien**
- LineChart : reach des 30 derniers jours
  - Ligne sage, aire remplie sage/10
  - Axe X : dates (format "12 mar")

**Section 3 : Top Reels**
- Liste des 3 meilleurs Reels par engagement
  - Thumbnail + titre + vues + engagement
  - Style carte compacte

**Empty state :**
```
"Tes statistiques apparaîtront 24h après ta première publication.
 En attendant, prépare ton prochain Reel! 💪"
```

**Installer recharts :**
```bash
npm install recharts
```

### 5. Intégrer dans le profil
- [ ] Modifier `app/(app)/profil/page.tsx`
Ajouter `<StatsSummary />` après les compteurs existants (Publiées, Planifiées, Prêtes).
Ajouter un lien "Voir toutes les stats >" qui pointe vers /stats.

### 6. Types
- [ ] Modifier `lib/types/index.ts`
Ajouter le type `insights` sur ContentItem (voir data model ci-dessus).

## Instagram Insights API — Notes techniques

### Métriques média (par Reel)
```
GET /{media-id}/insights?metric=plays,reach,likes,comments,shares,saved
```
- Disponible uniquement 24h après la publication
- `plays` = nombre de lectures vidéo
- `reach` = comptes uniques atteints
- `saved` = nombre de sauvegardes (signal fort!)

### Métriques compte (globales)
```
GET /{ig-user-id}/insights?metric=follower_count,reach&period=day&since=X&until=Y
```
- `follower_count` = nombre total de followers (pas un delta)
- `reach` = comptes uniques atteints par tout le contenu

### Format de réponse
```json
{
  "data": [
    {
      "name": "plays",
      "values": [{ "value": 1234 }]
    }
  ]
}
```

## Contraintes
- Vercel Hobby : max 2 crons (publish + fetch-insights)
- Graphiques lisibles sur 375px (responsive, pas de scroll horizontal)
- recharts est ~50KB gzipped — acceptable
- Métriques disponibles 24h après publication seulement
- La page /stats est accessible via le lien dans /profil, PAS dans la bottom nav
- Instagram token peut être expiré → gérer gracieusement (skip user)
- NE PAS utiliser de Cloud Functions — tout en API routes Next.js
- Heroicons uniquement, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] npm run build passe
- [ ] Cron /api/cron/fetch-insights sécurisé avec CRON_SECRET
- [ ] Insights stockés sur les contentItems dans Firestore
- [ ] Analytics quotidiennes stockées dans analytics/{userId}/daily/
- [ ] StatsSummary visible dans /profil (4 cartes)
- [ ] Page /stats avec graphiques recharts
- [ ] Empty state encourageant si pas de données
- [ ] Token expiré géré gracieusement (pas de crash)
