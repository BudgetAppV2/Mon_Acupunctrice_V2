# HACK1 — FAQ auto-générées pour chaque article de blog

## Finalité
Chaque article publié sur le blog Wix doit inclure 3 FAQ pertinentes
en bas d'article. Ces FAQ ciblent les questions "People Also Ask" de
Google. Si Google reprend ces FAQ dans ses résultats, Judith apparaît
AVANT les résultats organiques — trafic gratuit → rendez-vous GoRendezVous.

## Contexte
Le Hub publie des articles sur Wix via POST /api/blog/publish.
Le contenu est converti en Ricos JSON par lib/utils/ricosConverter.ts.
On doit ajouter une étape : générer 3 FAQ avec Claude puis les injecter
dans le Ricos JSON avant publication.

## Stack
Next.js 15 App Router, TypeScript, Anthropic Claude API.

## Fichiers à lire AVANT de commencer
- `app/api/blog/publish/route.ts` — route de publication
- `lib/utils/ricosConverter.ts` — conversion texte → Ricos JSON
- `app/api/generate-captions/route.ts` — pattern d'appel Claude existant

## Livrable 1 — Route /api/generate-blog-faq

Créer `app/api/generate-blog-faq/route.ts` :
- POST — body : `{ title, content }`
- Appelle Claude avec ce SYSTEM prompt :

```
Tu es un expert SEO pour une acupunctrice québécoise à Montréal.
À partir du titre et du contenu d'un article de blog, génère exactement
3 questions-réponses FAQ qui ciblent les "People Also Ask" de Google.

Règles :
- Les questions doivent être celles qu'un patient potentiel poserait
- Les questions doivent commencer par "Est-ce que", "Combien", "Comment",
  "Pourquoi", "À quel âge", etc.
- Les réponses doivent être concises (40-60 mots maximum)
- Les réponses doivent mentionner "acupuncture" et le sujet de l'article
- Écris en français québécois naturel
- N'utilise JAMAIS d'emojis
- La dernière phrase de chaque réponse doit orienter vers la prise
  de rendez-vous : "N'hésitez pas à consulter pour en savoir plus."

Retourne UNIQUEMENT du JSON valide :
{
  "faqs": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}
```

- Parse la réponse JSON
- Retourne `{ faqs: [{ question, answer }] }`

## Livrable 2 — Injecter les FAQ dans le Ricos JSON

Modifier `lib/utils/ricosConverter.ts` :
- Ajouter une fonction `faqNodes(faqs: {question: string, answer: string}[]): RicosNode[]`
- Génère les noeuds Ricos suivants pour chaque FAQ :
  - Un HEADING H3 avec la question (en bold)
  - Un PARAGRAPH avec la réponse
- Ajouter un HEADING H2 "Questions fréquentes" avant les FAQ

Modifier `textToRicos()` ou créer `textToRicosWithFaq()` :
- Accepte un paramètre optionnel `faqs?: {question: string, answer: string}[]`
- Si faqs est fourni, les insérer AVANT le CTA GoRendezVous
- Structure finale de l'article :
  1. Contenu de l'article (paragraphes, titres, listes)
  2. Section "Questions fréquentes" (H2)
  3. FAQ 1 : question (H3) + réponse (paragraphe)
  4. FAQ 2 : question (H3) + réponse (paragraphe)
  5. FAQ 3 : question (H3) + réponse (paragraphe)
  6. Séparateur vide
  7. CTA GoRendezVous (lien cliquable)

## Livrable 3 — Connecter dans la route publish

Modifier `app/api/blog/publish/route.ts` :
- Après avoir reçu le titre et le contenu, appeler `/api/generate-blog-faq`
  pour obtenir les 3 FAQ
- Passer les FAQ à textToRicos() (ou textToRicosWithFaq())
- Le reste du flow (create draft → publish) reste identique
- Si la génération de FAQ échoue, publier quand même sans FAQ
  (ne pas bloquer la publication)

## Livrable 4 — Aperçu FAQ dans le BlogEditor

Modifier `components/features/blog/BlogEditor.tsx` :
- Dans le mode "Aperçu", afficher les FAQ générées en preview
- Ajouter un bouton "Générer FAQ" qui appelle /api/generate-blog-faq
- Afficher les 3 questions/réponses sous le contenu
- Judith peut voir les FAQ avant de publier et les modifier si nécessaire
- Stocker les FAQ dans le state du composant
- Passer les FAQ au hook usePublishBlog() qui les transmet à la route

## Contraintes
- Le lien GoRendezVous reste TOUJOURS en dernier dans l'article
- Les FAQ ne bloquent PAS la publication si la génération échoue
- 0 console.log en production
- 0 emoji dans les FAQ
- Les FAQ doivent être en français québécois naturel
- Ne PAS modifier le cron publish
- Ne PAS modifier les autres routes existantes

## Definition of Done
- [ ] Écrire un article → cliquer "Générer FAQ" → 3 FAQ apparaissent en preview
- [ ] Publier → l'article sur Wix contient les FAQ avec H2 "Questions fréquentes"
- [ ] Chaque FAQ : question en H3 + réponse en paragraphe
- [ ] Le CTA GoRendezVous est toujours en fin d'article (après les FAQ)
- [ ] Si la génération échoue, l'article se publie quand même sans FAQ
- [ ] npm run build passe
