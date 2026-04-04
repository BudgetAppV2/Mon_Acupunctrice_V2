# S5 — Fetch metriques Facebook + YouTube dans le cron

## Contexte
Le cron fetch-insights ne recupere que les metriques Instagram. Les publications sont aussi postees sur Facebook et YouTube. On etend le cron pour recuperer les metriques de ces deux plateformes et les stocker dans Firestore.

## Stack
Next.js 15 App Router, TypeScript, Firebase Admin SDK, Graph API Facebook, YouTube Data API v3.

## Fichiers a lire AVANT de commencer
- `app/api/cron/fetch-insights/route.ts` → cron existant a etendre
- `lib/types/index.ts` → ContentItem (facebookPostId, youtubeVideoId, facebookStatus, youtubeStatus, insights)
- `app/api/publish-facebook/route.ts` → pour comprendre le pattern d'acces au token Facebook
- `app/api/publish-youtube/route.ts` → pour comprendre le pattern d'acces au token YouTube
- `components/features/stats/PublicationDetail.tsx` → vue detail qui affichera les metriques par plateforme

## Livrable 1 — Etendre le type insights

Dans `lib/types/index.ts`, etendre le type `insights` sur ContentItem :
```typescript
insights?: {
  plays: number;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  totalInteractions: number;
  // Facebook
  facebookViews?: number;
  // YouTube
  youtubeViews?: number;
  youtubeLikes?: number;
  youtubeComments?: number;
  fetchedAt: Timestamp;
};
```
Tous les nouveaux champs sont optionnels — retrocompatible.

## Livrable 2 — Ajouter fetchFacebookInsights dans le cron

Dans `app/api/cron/fetch-insights/route.ts`, ajouter une fonction :
```typescript
async function fetchFacebookInsights(
  videoId: string, pageToken: string,
): Promise<{ views: number }>
```
- Appeler `https://graph.facebook.com/v25.0/{videoId}?fields=views&access_token={pageToken}`
- Le token page Facebook est stocke dans `users/{uid}/private/tokens` champ `facebookPageAccessToken`
- Retourner `{ views }` ou `{ views: 0 }` si erreur
- Dans la boucle d'items, si `item.facebookPostId` existe, appeler cette fonction et stocker `facebookViews` dans insights

## Livrable 3 — Ajouter fetchYouTubeInsights dans le cron

Ajouter une fonction :
```typescript
async function fetchYouTubeInsights(
  videoId: string, accessToken: string,
): Promise<{ views: number; likes: number; comments: number }>
```
- Appeler `https://www.googleapis.com/youtube/v3/videos?part=statistics&id={videoId}&access_token={accessToken}`
- Le token YouTube est stocke dans `users/{uid}/private/tokens` champ `youtubeAccessToken`
- Parser la reponse : `items[0].statistics.viewCount`, `likeCount`, `commentCount`
- Retourner les valeurs parsees en number
- Dans la boucle d'items, si `item.youtubeVideoId` existe, appeler cette fonction et stocker `youtubeViews`, `youtubeLikes`, `youtubeComments` dans insights

## Livrable 4 — Integrer dans la boucle du cron

Modifier la boucle principale du cron :
- Apres le fetch Instagram, si `item.facebookPostId` existe, fetch Facebook
- Apres Facebook, si `item.youtubeVideoId` existe, fetch YouTube
- Merger les metriques dans un seul objet `insights` : les metriques IG sont la base, les metriques FB/YT sont ajoutees comme champs supplementaires
- Les tokens Facebook et YouTube sont lus depuis `users/{uid}/private/tokens` (deja lu pour Instagram)
- Ajouter des try/catch individuels pour chaque plateforme — un echec FB ne doit pas bloquer YT

## Livrable 5 — Afficher dans PublicationDetail

Dans `components/features/stats/PublicationDetail.tsx`, sous le grid 3x2 existant :
- Si `insights.facebookViews` existe, ajouter une ligne "Facebook" avec le nombre de vues
- Si `insights.youtubeViews` existe, ajouter une ligne "YouTube" avec vues, likes, commentaires
- Style : petites lignes text-[11px] avec l'icone de la plateforme

## Contraintes
- Le cron doit rester dans les limites de temps Vercel (60s pour Hobby)
- Ne PAS creer de nouveau cron — etendre le cron existant
- Les nouveaux champs insights sont OPTIONNELS — les items sans FB/YT ne sont pas impactes
- Les tokens FB/YT peuvent etre absents — ne pas crasher si l'utilisateur n'a pas connecte la plateforme
- 0 console.log en production (sauf les console.log de debug existants dans le cron)
- Ne PAS modifier les hooks useInsightsSummary ou usePublishedItems (ils lisent les champs existants)

## Definition of Done
- [ ] Le cron recupere les metriques Facebook pour les items avec facebookPostId
- [ ] Le cron recupere les metriques YouTube pour les items avec youtubeVideoId
- [ ] Les metriques sont stockees dans Firestore (facebookViews, youtubeViews, etc.)
- [ ] La vue detail affiche les metriques par plateforme quand disponibles
- [ ] Le cron ne crash pas si un item n'a qu'Instagram
- [ ] Le cron ne crash pas si les tokens FB/YT sont absents
- [ ] Le cron reste sous 60s d'execution
- [ ] npm run build passe
