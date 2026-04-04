# B1.2 — Route /api/publish-blog (publication sur Wix)

## Finalite
Chaque article publie sur Wix est indexe par Google et attire du trafic organique
vers le site de Judith. Le CTA GoRendezVous dans l'article convertit les lecteurs
en rendez-vous. Ce milestone est le pipeline de publication.

## Contexte
La page Blogue (B1.1) existe avec le formulaire. Il faut maintenant la route
serveur qui prend le texte brut, le convertit en format Ricos JSON, et le publie
sur le blog Wix de Judith via l'API REST.

## Stack
Next.js 15 App Router, TypeScript, API Wix Blog v3 REST.

## Fichiers a lire AVANT de commencer
- `app/api/blog/list/route.ts` → pattern d'appel API Wix (headers, auth)
- `components/features/blog/BlogEditor.tsx` → le formulaire qui envoie les donnees
- `lib/hooks/useBlogArticles.ts` → le hook qui appellera cette route
- `.env.local` → WIX_API_KEY, WIX_SITE_ID, WIX_MEMBER_ID

## Livrable 1 — Conversion texte brut → Ricos JSON

Creer `lib/utils/ricosConverter.ts` :
- Fonction `textToRicos(text: string, ctaUrl: string): RicosContent`
- Parse le texte brut en noeuds Ricos JSON :
  - Paragraphes separes par des lignes vides → type PARAGRAPH
  - Lignes commencant par # → type HEADING (H2)
  - Lignes commencant par - ou * → type BULLETED_LIST
  - Le CTA GoRendezVous est ajoute comme dernier paragraphe avec un lien cliquable
- Le format Ricos JSON de Wix utilise la structure :
```json
{
  "nodes": [
    {
      "type": "PARAGRAPH",
      "nodes": [{ "type": "TEXT", "textData": { "text": "contenu" } }]
    },
    {
      "type": "HEADING",
      "headingData": { "level": 2 },
      "nodes": [{ "type": "TEXT", "textData": { "text": "titre" } }]
    }
  ]
}
```

## Livrable 2 — Route /api/blog/publish

Creer `app/api/blog/publish/route.ts` :
- POST — body : `{ title, content, category, ctaUrl }`
- Etape 1 : Convertir le contenu en Ricos JSON via `textToRicos()`
- Etape 2 : Creer un brouillon via `POST https://www.wixapis.com/blog/v3/draft-posts`
  Headers : `Authorization: {WIX_API_KEY}`, `wix-site-id: {WIX_SITE_ID}`
  Body : `{ draftPost: { title, richContent: ricosJson, memberId: WIX_MEMBER_ID } }`
- Etape 3 : Publier le brouillon via `POST https://www.wixapis.com/blog/v3/draft-posts/{id}/publish`
- Retourner : `{ success: true, postId, postUrl }`
- Gerer les erreurs : API Key manquante, erreur Wix, etc.

## Livrable 3 — Connecter le hook usePublishBlog

Dans `lib/hooks/useBlogArticles.ts` :
- Implementer `usePublishBlog()` :
  - Appelle `POST /api/blog/publish` avec les donnees du formulaire
  - Retourne `{ publish, loading, error, result }`
  - Apres succes, rafraichir la liste des articles

## Livrable 4 — Connecter le formulaire

Dans `components/features/blog/BlogEditor.tsx` et `app/(app)/blogue/page.tsx` :
- Le bouton "Publier sur Wix" appelle `usePublishBlog().publish()`
- Afficher un loading pendant la publication
- Afficher un message de succes avec le lien vers l'article publie
- Revenir a la liste apres succes

## Contraintes
- Le CTA GoRendezVous (https://gorendezvous.com/lasourceensoi) DOIT etre dans chaque article
- 0 console.log en production
- Ne PAS modifier le cron publish
- Ne PAS modifier les hooks de sequence blog existants
- L'API Wix peut echouer — gerer gracieusement

## Definition of Done
- [ ] Ecrire un article dans le Hub → cliquer Publier → article visible sur le blog Wix
- [ ] Le CTA GoRendezVous est present dans l'article publie (lien cliquable)
- [ ] Les titres (H2) sont correctement formates dans le Ricos JSON
- [ ] Le message de succes affiche le lien vers l'article
- [ ] Erreur affichee si la publication echoue
- [ ] npm run build passe
