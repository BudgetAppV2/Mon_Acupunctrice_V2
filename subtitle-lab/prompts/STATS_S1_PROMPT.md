# S1 — Dashboard Summary Cards + Selecteur de periode

## Contexte
La page Stats actuelle affiche 3 graphiques basiques (bar chart, area chart, top list). On la remplace par un dashboard mobile-first avec des summary cards et un selecteur de periode.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Firestore, Heroicons, recharts.

## Fichiers a lire AVANT de commencer
- `app/(app)/stats/page.tsx` → page actuelle a remplacer
- `lib/hooks/useAnalytics.ts` → hooks existants (useInsightsSummary, useDailyAnalytics, useTopReels)
- `lib/types/index.ts` → ContentItem avec insights (plays, reach, likes, comments, shares, saved)
- `components/features/stats/ReachChart.tsx` → composant existant a supprimer
- `components/features/stats/ReelsBarChart.tsx` → composant existant a supprimer
- `components/features/stats/TopReelsList.tsx` → composant existant a supprimer

## Livrable 1 — Modifier useInsightsSummary pour accepter une periode

Dans `lib/hooks/useAnalytics.ts`, modifier `useInsightsSummary()` :
- Accepter un parametre `days: number` (7, 30, ou 90)
- Filtrer les items publies dans les `days` derniers jours (comparer `publishedAt` avec `Date.now() - days * 86400 * 1000`)
- Calculer la tendance : comparer la somme de la periode actuelle avec la somme de la periode precedente (ex: 7j actuels vs 7j precedents) et retourner le % de changement
- Retourner : `totalPlays, totalReach, totalLikes, totalComments, totalShares, totalSaved, totalEngagement, publishCount, trends: { plays, reach, engagement }` (chaque trend est un nombre entre -100 et +inf representant le % de changement)

## Livrable 2 — Creer SummaryCard.tsx

Creer `components/features/stats/SummaryCard.tsx` :
- Props : `{ label: string; value: number; trend?: number; icon: React.ComponentType }`
- Affiche la valeur formatee (1.2K pour 1200, etc.)
- Si `trend` est defini, affiche une fleche (ArrowTrendingUpIcon / ArrowTrendingDownIcon) avec le % en vert (positif) ou rouge (negatif)
- Background blanc, rounded-xl, padding compact
- Le label en bas en text-[10px] text-gray-500

## Livrable 3 — Reecrire stats/page.tsx

Remplacer le contenu de `app/(app)/stats/page.tsx` :
- Header : "Statistiques" avec lien retour vers /profil
- Selecteur de periode : 3 boutons "7j", "30j", "90j" dans un toggle group (bg-white rounded-lg, bouton actif en bg-sage text-white)
- State local `period` (7 | 30 | 90), defaut 30
- 5 SummaryCards dans un grid responsive : Vues (EyeIcon), Likes (HeartIcon), Commentaires (ChatBubbleLeftIcon), Partages (ShareIcon), Engagement (ChartBarIcon)
- Sous les cards : ligne Followers avec le compteur + gain sur la periode (depuis useDailyAnalytics)
- Empty state si `publishCount === 0`

## Livrable 4 — Supprimer les anciens composants

Supprimer :
- `components/features/stats/ReachChart.tsx`
- `components/features/stats/ReelsBarChart.tsx`
- `components/features/stats/TopReelsList.tsx`

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Mobile first 375px
- App Router ONLY
- Ne PAS modifier le cron fetch-insights
- Ne PAS modifier les types ContentItem

## Definition of Done
- [ ] 5 summary cards visibles avec les bonnes valeurs
- [ ] Toggle 7j/30j/90j change les valeurs des cards
- [ ] Tendance affichee (fleche + %) en vert ou rouge
- [ ] Compteur followers avec gain sur la periode
- [ ] Empty state si aucune publication
- [ ] Mobile 375px — les cards wrap en grid 2 colonnes
- [ ] npm run build passe
- [ ] Les 3 anciens composants sont supprimes
