# Milestone 12 — Stats & Analytics

## Objectif
Donner de la visibilité à Judith sur l'impact de son contenu via un dashboard de statistiques simple et motivant, intégrant les données d'Instagram Insights.

## Phase
MESURER

## Dépendances
- **M09** : OAuth Meta avec permissions Insights (`instagram_manage_insights`, `instagram_basic`).

## User stories couvertes
- En tant que Judith, je veux voir combien de vues mes vidéos ont généré.
- En tant que Judith, je veux savoir quel type de contenu (quelle catégorie) performe le mieux.
- En tant que Judith, je veux voir la croissance de mon nombre de followers.

## Livrables précis

- **Backend (Cloud Functions) :**
    - `functions/src/insights.ts` : Nouvelle Cloud Function `fetchInstagramInsights`.
    - Trigger cron quotidien (ex: 6h AM).
- **UI & Frontend :**
    - `/app/(app)/profil/page.tsx` : Cartes de résumé stats (Vues, Reach, Engagement).
    - `/app/(app)/stats/page.tsx` : Nouvelle page de statistiques détaillées avec graphiques.
- **Data Model :**
    - Nouvelle collection `analytics` pour stocker l'historique quotidien du compte.
    - Mise à jour de `ContentItem` pour stocker les insights du média.

## Spécifications techniques détaillées

### Instagram Insights API
Endpoint : `GET /{media-id}/insights?metric=plays,reach,likes,comments,shares,saved`.
Note : Les métriques ne sont disponibles que 24h après la publication.

### Cloud Function fetchInsights
La fonction boucle sur les 30 derniers jours de publications :
1. Pour chaque `published` item, appelle l'API Insights.
2. Met à jour le champ `insights` de l'item dans Firestore.
3. Récupère aussi les stats globales du compte : `GET /{ig-user-id}/insights?metric=follower_count,reach&period=day`.
4. Enregistre dans `analytics/{userId}/daily/{date}`.

### Dashboard UI
Utilisation d'une bibliothèque légère comme `recharts`.
Graphiques :
- Vues par Reel (bar chart).
- Reach quotidien (line chart, 30 jours).
- Top 3 des catégories les plus performantes (par engagement moyen).
- Meilleure heure de publication suggérée.

## Data model changes
- **Collection `contentItems`** :
    - `insights`: { plays: number, reach: number, likes: number, fetchedAt: Timestamp }
- **Nouvelle Collection `analytics`** :
    - `/{userId}/daily/{date}` : { followerCount, reach, impressions, date }

## Cloud Functions
- **`fetchInstagramInsights` (Nouvelle)** : Schedulée quotidiennement.

## Definition of Done
- [ ] La Cloud Function de récupération des stats est déployée et s'exécute sans erreur.
- [ ] Les métriques sont correctement stockées dans Firestore (items + historique quotidien).
- [ ] La page de profil affiche le résumé (Vues totales, Reach, Followers).
- [ ] La page `/stats` affiche des graphiques clairs et lisibles sur mobile.
- [ ] Les données sont rafraîchies chaque matin à 6h.

## Prompt one shot pour Claude Code

```markdown
# Milestone 12 — Stats & Analytics Dashboard

## Contexte
Mon Acupunctrice Hub publie sur Instagram, Facebook et YouTube.
Judith n'a aucune visibilité sur l'impact de son contenu.
Ce milestone ajoute un dashboard motivant basé sur Instagram Insights API.

## Fichiers à lire AVANT de commencer
- `app/(app)/profil/page.tsx` → page profil actuelle (ajouter les cartes stats)
- `project-docs/03_TECH/DATA_MODEL.md` → structure insights et collection analytics
- `project-docs/03_TECH/API_DESIGN.md` → détail fetchInsights
- `project-docs/01_PRODUCT/UX_UI_GUIDELINES.md` → style des cartes et empty states

## Architecture données
```typescript
// Sur contentItem (mis à jour par fetchInsights)
insights?: {
  plays: number, reach: number, likes: number,
  comments: number, shares: number, saved: number,
  fetchedAt: Timestamp
}

// Collection analytics/{userId}/daily/{YYYY-MM-DD}
{ followerCount: number, reach: number, impressions: number,
  date: string, fetchedAt: Timestamp }
```

## Livrables
- [ ] `functions/src/insights.ts` — Cloud Function `fetchInsights` :
      Trigger: scheduled quotidien (6h AM)
      1. Query users avec metaStatus==='connected'
      2. Pour chaque user :
         a. Query contentItems publiés < 30 jours
         b. GET /{instagramMediaId}/insights?metric=plays,reach,likes,comments,shares,saved
         c. Update contentItem.insights
         d. GET /{metaInstagramId}/insights?metric=follower_count,reach&period=day
         e. Écrire dans analytics/{userId}/daily/{date}
      Token lu depuis users/{userId}/private/tokens (Admin SDK)
      Rate limit: max 200 calls/user/hour
- [ ] `components/features/profile/StatsSummary.tsx` — 4 cartes dans /profil :
      - Vues totales (somme plays 30j) avec sparkline mini
      - Engagement (likes + comments + shares + saved)
      - Followers avec tendance (↑/↓ vs semaine précédente)
      - Constance (publications/semaine, sparkline 4 semaines)
      Heroicons pour les icônes, pas d'emoji.
- [ ] `app/(app)/stats/page.tsx` — page dédiée :
      - BarChart : vues par Reel (7 derniers)
      - LineChart : reach quotidien (30 jours)
      - Meilleure heure de publication (basé sur engagement)
      - Top 3 Reels par engagement
      Utiliser `recharts` (léger, React-friendly).
      `npm install recharts` dans le projet principal (pas functions/).
- [ ] `lib/hooks/useAnalytics.ts` — hook custom :
      - useInsightsSummary(userId) → totaux 30j
      - useDailyAnalytics(userId, days) → données graphiques
      - useTopReels(userId, limit) → meilleurs Reels
- [ ] Mettre à jour `app/(app)/profil/page.tsx` :
      - Intégrer StatsSummary
      - Lien "Voir toutes les stats →" vers /stats
- [ ] Empty states encourageants (style UX_UI_GUIDELINES) :
      - "Tes stats apparaîtront 24h après ta première publication"

## Contraintes
- Graphiques lisibles sur 375px (responsive, pas de scroll horizontal)
- Métriques disponibles 24h après publication seulement
- Pas de page /stats dans la bottom tab bar (lien depuis profil)
- Heroicons, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] Cloud Function s'exécute sans erreur et stocke les insights
- [ ] Cartes stats visibles dans /profil
- [ ] Page /stats avec graphiques fonctionnels
- [ ] Empty state si aucune donnée disponible
- [ ] Données rafraîchies chaque matin automatiquement
```
