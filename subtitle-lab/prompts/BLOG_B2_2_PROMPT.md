# B2.2 — Captions auto pour les reels de sequence blog

## Finalite
Chaque article de blog genere 4 publications. Les 2 reels (J+1 resume, J+3 conseil)
sont les plus visibles sur Instagram et Facebook. Des captions bien redigees avec
le CTA GoRendezVous maximisent la conversion. Ce milestone automatise la generation
de ces captions a partir du contenu du blog.

## Contexte
Actuellement, les slots reel_resume et reel_pratique de la sequence blog n'ont
PAS de caption pre-generee. Judith doit les ecrire manuellement. Le Hub a deja
`generate-captions/route.ts` qui genere 3 captions (IG/FB/YT) a partir d'une
transcription. On peut reutiliser ce endpoint en passant le contenu du blog
a la place de la transcription.

## Stack
Next.js 15 App Router, TypeScript, Anthropic Claude API, Firebase Firestore.

## Fichiers a lire AVANT de commencer
- `app/api/generate-captions/route.ts` → endpoint existant (3 captions avec transcription)
- `lib/hooks/useBlogSequence.ts` → hook qui cree les 4 slots
- `components/features/calendar/CreateSequenceSheet.tsx` → UI qui declenche la creation
- `app/api/scrape-og/route.ts` → scrape les metadonnees OG d'une URL de blog

## Livrable 1 — Route /api/generate-blog-captions

Creer `app/api/generate-blog-captions/route.ts` :
- POST — body : `{ blogTitle, blogContent, blogUrl, role: 'reel_resume' | 'reel_pratique' }`
- Appelle Claude avec un SYSTEM prompt adapte au blog :

```
Tu es un assistant pour Judith, acupunctrice quebecoise a Montreal.
Tu rediges des captions pour des Reels qui promeuvent un article de blog.
Ecris en francais quebecois naturel. Ton chaleureux et professionnel.
IMPORTANT : N'utilise JAMAIS d'emojis. Zero emoji. Texte uniquement.

Contexte : Judith a publie un article de blog. Elle cree des Reels pour
promouvoir l'article sur les reseaux sociaux.

{role === 'reel_resume' ?
  "Ce Reel RESUME les points cles de l'article. La caption doit donner
   envie de lire l'article complet." :
  "Ce Reel donne un CONSEIL PRATIQUE tire de l'article. La caption doit
   etre actionnable et utile."}

Retourne un JSON avec 3 cles : instagram, facebook, youtube.

Regles Instagram :
- Hook percutant + resume du conseil
- CTA : Lien dans ma bio pour prendre rendez-vous
- 3-5 hashtags pertinents

Regles Facebook :
- Ton conversationnel
- Lien vers l'article : {blogUrl}
- Lien rendez-vous : https://gorendezvous.com/lasourceensoi

Regles YouTube :
- Titre SEO en premiere ligne
- Lien rendez-vous dans les 2 premieres lignes : https://gorendezvous.com/lasourceensoi
- Lien vers l'article : {blogUrl}

Retourne UNIQUEMENT du JSON valide.
```

- Retourner : `{ instagram: "...", facebook: "...", youtube: "..." }`

## Livrable 2 — Generer les captions lors de la creation de sequence

Dans `lib/hooks/useBlogSequence.ts`, modifier `createSequence()` :
- Apres avoir cree les 4 slots, appeler `/api/generate-blog-captions` 2 fois :
  - Une fois avec `role: 'reel_resume'` pour le slot J+1
  - Une fois avec `role: 'reel_pratique'` pour le slot J+3
- Stocker les captions generees sur les slots dans Firestore :
  - Champ `generatedCaptions: { instagram: string, facebook: string, youtube: string }`
- La generation est async — ne pas bloquer la creation des slots
  - Les slots sont crees immediatement (comme maintenant)
  - Les captions sont generees en background et stockees quand pretes
- Si la generation echoue, les slots restent sans captions (Judith les ecrit manuellement)

## Livrable 3 — Afficher les captions pre-generees dans le PublishSheet

Quand l'utilisateur ouvre un slot de sequence (reel_resume ou reel_pratique) pour
publier, le `PublishSheet` doit verifier si des `generatedCaptions` existent sur le slot.
Si oui, pre-remplir les captions par plateforme avec les valeurs generees.

Verifier comment le PublishSheet charge les captions actuellement et ou injecter
les captions pre-generees. Le flow existant :
1. L'utilisateur clique "Publier" sur un slot
2. Le PublishSheet s'ouvre avec les captions (vides ou existantes)
3. L'utilisateur peut editer avant de publier

Modification : si le slot a `generatedCaptions`, les utiliser comme valeurs initiales.

## Contraintes
- Le lien GoRendezVous DOIT etre dans chaque caption FB et YT
- Le lien vers l'article DOIT etre dans les captions FB et YT
- Instagram : "Lien dans ma bio" uniquement (pas de lien)
- 0 console.log en production
- Ne PAS modifier generate-captions/route.ts (c'est le flow principal video)
- Ne PAS modifier le cron publish
- La generation de captions ne doit PAS bloquer la creation des slots

## Definition of Done
- [ ] Creer une sequence blog → les captions des 2 reels sont generees automatiquement
- [ ] Les captions contiennent le lien GoRendezVous (FB, YT)
- [ ] Les captions contiennent le lien vers l'article (FB, YT)
- [ ] Les captions Instagram ont "Lien dans ma bio"
- [ ] Ouvrir le PublishSheet sur un slot de sequence → les captions pre-generees sont affichees
- [ ] Si la generation echoue, les slots fonctionnent quand meme (pas de blocage)
- [ ] npm run build passe
