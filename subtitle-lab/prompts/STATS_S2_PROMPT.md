# S2 — Liste des publications recentes avec tri

## Contexte
Le dashboard S1 affiche les metriques globales. On ajoute maintenant la liste des publications recentes sous les summary cards, avec les metriques par post et un tri par vues ou engagement.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `app/(app)/stats/page.tsx` → page S1 a etendre
- `lib/hooks/useAnalytics.ts` → hook useTopReels existant a adapter
- `lib/types/index.ts` → ContentItem (thumbnailUrl, title, publishedAt, insights, instagramPostId, facebookPostId, youtubeVideoId)

## Livrable 1 — Creer usePublishedItems hook

Dans `lib/hooks/useAnalytics.ts`, ajouter un nouveau hook `usePublishedItems(period, sortBy)` :
- `period: number` (7, 30, 90 jours)
- `sortBy: 'date' | 'views' | 'engagement'` (defaut 'date')
- Query les contentItems publies dans la periode, avec `distributionStatus == 'published'`
- Tri :
  - `'date'` → par `publishedAt` desc (plus recent en haut)
  - `'views'` → par `insights.plays` desc (plus de vues en haut)
  - `'engagement'` → par total engagement desc (likes + comments + shares + saved)
- Le tri par views/engagement se fait cote client apres le fetch (Firestore ne peut pas trier par un champ nested)
- Retourne `{ data: ContentItem[]; loading: boolean }`

## Livrable 2 — Creer PublicationCard.tsx

Creer `components/features/stats/PublicationCard.tsx` :
- Props : `{ item: ContentItem; onTap: () => void }`
- Layout horizontal compact :
  - Thumbnail (w-12 h-16, object-cover, rounded) a gauche
  - Bloc texte au milieu : titre (truncate), date relative ("il y a 3j"), badges plateforme
  - Metriques inline a droite : vues + engagement
- Badges plateforme : petits dots colores — bleu pour IG, bleu fonce pour FB, rouge pour YT
  - Afficher un dot si `instagramPostId` existe, un dot si `facebookPostId` existe, etc.
- Date relative : utiliser `Intl.RelativeTimeFormat` ou un calcul simple (jours depuis publishedAt)
- Tap sur la card → appelle `onTap()`
- Background blanc, rounded-xl, padding compact

## Livrable 3 — Integrer dans stats/page.tsx

Sous les summary cards et le compteur followers :
- Section "Publications" avec un header flex :
  - Titre "Publications" a gauche
  - Tri selector a droite : 3 boutons compacts "Recent", "Vues", "Engage" (toggle group, text-[10px])
- State local `sortBy: 'date' | 'views' | 'engagement'`, defaut 'date'
- Appeler `usePublishedItems(period, sortBy)`
- Mapper les items en `PublicationCard` components
- Le `onTap` ne fait rien pour l'instant (sera connecte en S3)
- Si aucun item, afficher "Aucune publication sur cette periode"

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Mobile first 375px
- Ne PAS modifier le cron
- Ne PAS modifier les types ContentItem
- Le tri par vues/engagement est client-side (pas de nouvel index Firestore)

## Definition of Done
- [ ] Section "Publications" visible sous les summary cards
- [ ] Les publications s'affichent avec thumbnail, titre, date, badges plateforme, metriques
- [ ] Toggle "Recent" / "Vues" / "Engage" change l'ordre de la liste
- [ ] La periode du toggle global (7j/30j/90j) filtre aussi les publications
- [ ] Scroll fluide sur mobile
- [ ] "Aucune publication" si liste vide
- [ ] npm run build passe
