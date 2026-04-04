# STATS-BLOG — Ajouter les stats du blog Wix dans la page Stats du Hub

## Finalité
Judith doit voir la performance de ses articles de blog dans le même
dashboard que ses stats vidéo. Ça lui montre quel contenu attire le
plus de trafic → elle écrit plus de ce type de contenu → plus de
rendez-vous GoRendezVous.

## Contexte
La page Stats du Hub affiche déjà les métriques Instagram, Facebook
et YouTube. On veut ajouter une section "Blog" avec les vues, likes
et commentaires de chaque article Wix.

L'API Wix Blog Stats est confirmée fonctionnelle :
GET /blog/v3/posts/{postId}/metrics → { views, likes, comments }

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, recharts.

## Fichiers à lire AVANT de commencer
- `app/(app)/stats/page.tsx` — page stats existante
- `components/features/stats/SummaryCard.tsx` — cartes résumé
- `components/features/stats/PublicationCard.tsx` — cartes par publication
- `lib/hooks/useAnalytics.ts` — hooks stats existants
- `app/api/blog/list/route.ts` — liste les articles Wix
- `app/api/blog/carousel/route.ts` — pattern d'appel API Wix

## Livrable 1 — Route /api/blog/stats

Créer `app/api/blog/stats/route.ts` :
- GET — pour chaque article Wix, appeler GET /blog/v3/posts/{id}/metrics
- Retourner la liste des articles avec leurs métriques :
  `{ posts: [{ id, title, date, views, likes, comments, url, image }] }`
- Inclure aussi les totaux : `{ totals: { views, likes, comments, posts } }`
- Utiliser les headers WIX_API_KEY + WIX_SITE_ID
- Cacher la réponse 1h (Cache-Control)

## Livrable 2 — Section Blog dans la page Stats

Dans `app/(app)/stats/page.tsx` :
- Ajouter une nouvelle section "Blog" sous les stats existantes
- Afficher 3 SummaryCards en haut :
  - Total vues blog (icone EyeIcon)
  - Total likes (icone HeartIcon)
  - Nombre d'articles publiés (icone DocumentTextIcon)
- Afficher la liste des articles triée par vues (plus vues en premier)
- Chaque article : thumbnail, titre, date, vues, likes, commentaires
- Réutiliser le style des PublicationCard existantes

## Livrable 3 — Hook useBlogStats

Créer `lib/hooks/useBlogStats.ts` :
- `useBlogStats()` : fetch /api/blog/stats
- Retourne { posts, totals, loading, error }
- Utilisé par la page Stats

## Contraintes
- Réutiliser les composants existants (SummaryCard, etc.)
- Mobile first 375px
- 0 console.log en production
- Ne PAS modifier les stats Instagram/Facebook/YouTube existantes
- La section Blog est un ajout, pas un remplacement

## Definition of Done
- [ ] Section "Blog" visible dans la page Stats
- [ ] 3 cartes résumé (vues totales, likes totaux, nombre d'articles)
- [ ] Liste des articles triée par vues avec thumbnail
- [ ] Les métriques correspondent à celles de l'API Wix
- [ ] npm run build passe
