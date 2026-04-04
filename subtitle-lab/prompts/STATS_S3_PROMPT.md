# S3 — Vue detail publication

## Contexte
La liste des publications (S2) est en place. Quand l'utilisateur tap sur une PublicationCard, on affiche une vue detail avec toutes les metriques, le statut par plateforme, et des liens vers les posts.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `app/(app)/stats/page.tsx` → page a etendre avec la vue detail
- `components/features/stats/PublicationCard.tsx` → le onTap a connecter
- `lib/types/index.ts` → ContentItem (instagramPostId, facebookPostId, youtubeVideoId, facebookStatus, youtubeStatus, insights)

## Livrable 1 — Creer PublicationDetail.tsx

Creer `components/features/stats/PublicationDetail.tsx` :
- Props : `{ item: ContentItem; onBack: () => void }`
- Layout vertical mobile-first :
  - Header : bouton retour (ArrowLeftIcon) + "Detail publication"
  - Thumbnail grande (aspect-ratio 9/16, rounded-xl, max-h-48, object-cover, centree)
  - Titre de la publication (text-sm font-semibold)
  - Date de publication formatee ("Publie le 2 avril 2026")
  - Section "Plateformes" : badges avec statut
    - Instagram : dot bleu + "Instagram" + check vert si `instagramPostId` existe
    - Facebook : dot bleu fonce + "Facebook" + check vert si `facebookPostId` existe, croix rouge sinon
    - YouTube : dot rouge + "YouTube" + check vert si `youtubeVideoId` existe, croix rouge sinon
  - Grid 3x2 de metric cards : Vues, Likes, Commentaires, Partages, Enregistrements, Portee
    - Chaque card : valeur grande (text-lg font-bold), label petit (text-[10px] text-gray-500), background bg-white rounded-xl
  - Liens externes :
    - "Voir sur Instagram" (si instagramPostId) → `https://www.instagram.com/reel/{instagramPostId}/`
    - "Voir sur Facebook" (si facebookPostId) → `https://www.facebook.com/{facebookPostId}`
    - Chaque lien : ArrowTopRightOnSquareIcon, text-sage, target _blank

## Livrable 2 — Integrer dans stats/page.tsx

- State local `selectedItem: ContentItem | null`, defaut null
- Quand `selectedItem` est non-null, afficher `PublicationDetail` au lieu du dashboard
- Connecter `onTap` dans `PublicationCard` : `onTap={() => setSelectedItem(item)}`
- Connecter `onBack` dans `PublicationDetail` : `onBack={() => setSelectedItem(null)}`

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Mobile first 375px
- Ne PAS utiliser de route separee — la vue detail est conditionnelle dans la meme page
- Ne PAS modifier les types ContentItem
- Pas de BottomSheet — la vue detail remplace le contenu de la page

## Definition of Done
- [ ] Tap sur une PublicationCard → vue detail s'affiche
- [ ] 6 metriques en grid 3x2 (Vues, Likes, Commentaires, Partages, Saved, Reach)
- [ ] Badges plateforme avec statut (publie / non publie)
- [ ] Lien "Voir sur Instagram" ouvre le post dans un nouvel onglet
- [ ] Bouton retour revient a la liste
- [ ] Thumbnail grande affichee
- [ ] Mobile 375px
- [ ] npm run build passe
