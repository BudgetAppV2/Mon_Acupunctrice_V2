# B1.1 — Config API Wix + Section Blogue dans le Hub

## Finalite
Chaque article de blog rapproche Judith d'un rendez-vous GoRendezVous.
Le blog est le contenu pilier qui convertit via le SEO Google.
Ce milestone permet a Judith d'ecrire et publier un article depuis le Hub.

## Contexte
Le Hub gere deja les videos, les stories et les sequences blog (4 publications).
Il manque la possibilite d'ecrire un article et de le publier directement sur
le blog Wix de Judith. L'API Wix Blog est configuree (API Key + Site ID dans .env.local).

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `components/features/calendar/CreateSequenceSheet.tsx` → pattern UI existant pour le blog
- `lib/hooks/useBlogSequence.ts` → hook qui cree les 4 slots de sequence
- `app/(app)/layout.tsx` → navigation (4 onglets: Idees, Calendrier, Inspiration, Profil)
- `.env.local` → WIX_API_KEY et WIX_SITE_ID deja configures

## Livrable 1 — Page Blogue dans le Hub

Creer `app/(app)/blogue/page.tsx` (nouvelle page) :
- Header : "Blogue" avec bouton retour vers calendrier
- Liste des articles existants sur Wix (fetch via API dans un useEffect)
- Bouton "Nouvel article" qui ouvre un formulaire
- Chaque article existant : titre, date, statut (brouillon/publie)

Modifier `app/(app)/layout.tsx` :
- Remplacer le lien `/inspiration` par `/blogue` dans les TABS. Garder la page inspiration accessible mais hors de la nav principale.
- Icone : `BookOpenIcon` (outline) / `BookOpenIcon` (solid)
- Label : "Blogue"

## Livrable 2 — Formulaire de creation d'article

Creer `components/features/blog/BlogEditor.tsx` :
- Props : `{ onPublish: (article: BlogArticle) => void; onCancel: () => void }`
- Champs : titre (input text), contenu (textarea avec scroll, min-h-48), categorie (select parmi les categories Wix)
- Preview du rendu (toggle "Editer" / "Apercu")
- Le contenu est du texte brut — la conversion en Ricos JSON se fait cote serveur (B1.2)
- Bouton "Publier sur Wix" qui appelle onPublish
- RAPPEL : chaque article DOIT inclure un CTA GoRendezVous. Ajouter un champ "CTA" pre-rempli avec "Prendre rendez-vous : https://gorendezvous.com/lasourceensoi"

## Livrable 3 — Hook useBlogArticles

Creer `lib/hooks/useBlogArticles.ts` :
- `useBlogArticles()` : fetch la liste des articles Wix via `/api/blog/list`
- `usePublishBlog()` : appelle `/api/blog/publish` avec le contenu (sera cree en B1.2)
- Pour l'instant, le hook prepare l'interface mais la route n'existe pas encore

## Livrable 4 — Route API pour lister les articles Wix

Creer `app/api/blog/list/route.ts` :
- GET — appelle l'API Wix `GET /blog/v3/posts` avec les headers API Key + Site ID
- Retourne la liste simplifiee : `{ id, title, published, firstPublishedDate, url }`
- Gerer le cas ou l'API Key n'est pas configuree

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Mobile first 375px
- Le CTA GoRendezVous doit etre visible dans le formulaire
- Ne PAS modifier les hooks existants (useBlogSequence, etc.)
- Ne PAS creer la route publish-blog (c'est B1.2)

## Definition of Done
- [ ] Onglet "Blogue" visible dans la navigation (remplace Inspiration)
- [ ] Liste des articles Wix existants affichee
- [ ] Formulaire de creation avec titre, contenu, categorie, CTA
- [ ] Le CTA GoRendezVous est pre-rempli dans le formulaire
- [ ] Toggle Editer/Apercu fonctionne
- [ ] Mobile 375px
- [ ] npm run build passe
