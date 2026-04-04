# Planification — Statistiques des publications (Stats V2)

## Contexte pour Claude Code — Mode planification milestones

### Objectif
Refondre la page statistiques pour offrir un tableau de bord complet de la performance
des publications sur les réseaux sociaux (Instagram, Facebook, YouTube). L'UI doit être
mobile-first, claire, et permettre de suivre la performance par publication et globalement.

### Ce que l'utilisateur veut voir
- Résumé global : total likes, commentaires, vues, par période
- Performance par publication : chaque post avec ses métriques
- Performance par plateforme : Instagram vs Facebook vs YouTube
- Croissance followers
- Taux d'engagement
- Comparaison entre publications
- Navigation facile sur mobile (cards, tabs, scroll)

---

## Infrastructure existante

### Backend — Cron fetch-insights (`/api/cron/fetch-insights`)
- Récupère les métriques Instagram via Graph API v25.0 pour les publications < 30 jours
- Métriques par media : `plays, reach, likes, comments, shares, saved`
- Métriques compte : `follower_count, reach` (quotidien)
- Stockage : `contentItems/{id}.insights` + `analytics/{uid}/daily/{date}`
- Limité à Instagram seulement (pas Facebook ni YouTube)
- Limité aux items avec `instagramPostId`

### Frontend — Page Stats actuelle (`app/(app)/stats/page.tsx`)
Hooks existants :
- `useInsightsSummary()` — totalPlays, totalReach, totalEngagement, publishCount
- `useDailyAnalytics(30)` — followerCount + reach par jour (30 derniers jours)
- `useTopReels(5)` — top 5 reels par engagement (likes+comments+shares+saved)

Composants existants :
- `ReelsBarChart` — bar chart horizontal (recharts), top reels par vues
- `ReachChart` — graphe de portée quotidienne (recharts)
- `TopReelsList` — liste des 3 meilleurs reels avec thumbnail + métriques

### Types existants (`lib/types`)
```ts
// Sur ContentItem
insights?: {
  plays: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  fetchedAt: Date;
}
```

### Plateformes connectées (stockées dans `users/{uid}`)
- **Instagram** : `metaStatus`, `metaInstagramId`, token dans `users/{uid}/private/tokens`
- **Facebook** : `facebookStatus`, `facebookPageId`, `facebookPageName`
- **YouTube** : `youtubeStatus`, `youtubeChannelId`, `youtubeChannelName`
- Le publish flow stocke `instagramPostId`, `facebookPostId`, `youtubeVideoId` sur chaque contentItem

### API Instagram Graph (v25.0) — Métriques disponibles
Métriques media existantes : `plays, reach, likes, comments, shares, saved`
Nouvelles métriques (décembre 2025) :
- `reels_skip_rate` — % de skip dans les 3 premières secondes
- Repost counts (par media et par compte)
- `crossposted_views` — vues Instagram + Facebook pour les Reels crosspostés
- `facebook_views` — vues Facebook seulement

### API Facebook — Métriques vidéo disponibles
- `/video_id/video_insights` : `total_video_views`, `total_video_impressions`
- `/page_id/insights` : page reach, engagement
- Nécessite le token Page (déjà stocké dans le flow publish)

### API YouTube Data v3 — Métriques disponibles
- `/videos?part=statistics&id=VIDEO_ID` : `viewCount`, `likeCount`, `commentCount`
- YouTube Analytics API pour des données plus détaillées (watch time, etc.)
- Nécessite le scope `youtube.readonly` (vérifier si déjà accordé)

---

## Design cible — UI mobile-first

### Vue principale — Dashboard
```
┌─────────────────────────────────┐
│  Statistiques        7j 30j 90j │ ← période sélectionnable
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 2.4K │ │  156 │ │  42  │    │
│  │ Vues │ │Likes │ │ Com. │    │
│  │ ↑12% │ │ ↑8%  │ │ ↑3%  │    │
│  └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐              │
│  │  89  │ │ 4.2% │              │
│  │Shares│ │Engage│              │
│  └──────┘ └──────┘              │
│                                  │
│  Followers: 1,234  ↑ 23 (7j)   │
│  ─────────────────────────────  │
│                                  │
│  Publications récentes           │
│  ┌──────────────────────────┐   │
│  │ 🖼 Titre du reel         │   │
│  │ IG • 2 avr • 1.2K vues  │   │
│  │ ❤️ 45  💬 12  🔗 8  📌 15│   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 🖼 Titre du reel 2       │   │
│  │ IG+FB • 1 avr • 890 vues│   │
│  │ ❤️ 32  💬 8   🔗 5  📌 10│   │
│  └──────────────────────────┘   │
│  ...                            │
└─────────────────────────────────┘
```

### Vue détail publication (tap sur une card)
```
┌─────────────────────────────────┐
│  ← Retour                       │
│                                  │
│  ┌──────────────────────────┐   │
│  │     [Thumbnail 9:16]     │   │
│  │                          │   │
│  └──────────────────────────┘   │
│  Titre de la publication         │
│  Publié le 2 avril 2026          │
│                                  │
│  Plateformes :                   │
│  IG ✅  FB ✅  YT ❌             │
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 1.2K │ │  45  │ │  12  │    │
│  │ Vues │ │Likes │ │ Com. │    │
│  └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │   8  │ │  15  │ │  890 │    │
│  │Shares│ │Saved │ │Reach │    │
│  └──────┘ └──────┘ └──────┘    │
│                                  │
│  [Voir sur Instagram →]          │
│  [Voir sur Facebook →]           │
└─────────────────────────────────┘
```

---

## Instructions pour Claude Code

**MODE : Planification milestones uniquement. NE PAS coder.**

En te basant sur ce contexte :
1. Analyse l'infrastructure existante (fichiers listés ci-dessus)
2. Identifie ce qui peut être réutilisé vs ce qui doit être créé
3. Propose 4-6 milestones progressifs, chacun livrable indépendamment
4. Pour chaque milestone, définis :
   - Objectif clair
   - Fichiers à créer/modifier
   - Dépendances (quel milestone dépend de quel autre)
   - Tests de validation
5. Après validation des milestones, écris un prompt oneshot par milestone

### Contraintes
- Mobile-first (iPhone Safari)
- Recharts pour les graphiques (déjà installé)
- Tailwind CSS (classes existantes dans le projet)
- Firestore pour le stockage (patterns existants dans le projet)
- Le cron fetch-insights tourne déjà — l'étendre, pas le remplacer
- Les composants stats existants peuvent être refactorisés ou remplacés
