# Mission CC : Audit et correction de tous les liens Go Rendez-Vous dans le Hub

## ⚠️ IMPORTANT — Contexte de branche

Tu es sur la branche `feature/site-public-migration`. Le Hub admin est LIVE sur `main`.

Les fichiers que tu vas modifier (BlogEditor, publishHelpers, imageEditorTemplates, generate-captions, etc.) sont des fichiers du Hub qui sont EN PRODUCTION sur `main`. 

**Approche recommandée :**
1. Fais les corrections sur la branche actuelle (`feature/site-public-migration`)
2. MAIS crée aussi un commit cherry-pickable — un seul commit propre avec UNIQUEMENT les corrections GRV du Hub (pas de fichiers du site public mélangés)
3. Nomme le commit clairement : `fix(hub): centralise URL GRV — lien direct Judith eids=175708`
4. Après le commit, mentionne dans ton output que ce commit peut être cherry-picked sur `main` immédiatement avec `git cherry-pick <hash>` si Benoit veut que les corrections soient live avant le merge de la branche migration

Ne touche PAS aux fichiers dans `app/(public)/` — ils sont déjà corrigés sur cette branche.

## Contexte

La responsable de La Source en Soi a fourni le code du bouton de réservation direct pour Judith.
L'URL correcte est maintenant :
```
https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708
```

Le `eids=175708` filtre directement sur le profil de Judith Dufour-Savard.
L'ancienne URL (`https://gorendezvous.com/lasourceensoi` ou `...?companyId=104074` sans eids) envoyait les gens sur la page générale de la clinique.

Le site public (app/(public)/) a DÉJÀ été corrigé (commit 8afa91f — 18 occurrences).
**Cette mission concerne uniquement le Hub admin et le pipeline social.**

## Ce qu'il faut faire

### 1. Recherche exhaustive

Cherche PARTOUT dans le codebase (sauf app/(public)/ qui est déjà corrigé) :

```bash
# URLs GRV hardcodées
grep -rn "gorendezvous" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" | grep -v "app/(public)/" | grep -v node_modules | grep -v .next

# Mentions de réservation dans les prompts Claude API
grep -rn "réserver\|rendez-vous\|rdv\|booking\|reserver\|book-online" --include="*.ts" --include="*.tsx" | grep -v "app/(public)/" | grep -v node_modules | grep -v .next

# Liens vers le site dans le pipeline social (captions, descriptions)
grep -rn "acupuncturejudith\|lasourceensoi\|lien en bio\|link in bio\|bio_link\|ctaUrl\|cta_url\|RDV_URL" --include="*.ts" --include="*.tsx" | grep -v "app/(public)/" | grep -v node_modules | grep -v .next
```

### 2. Fichiers à inspecter en priorité

Ces fichiers ont déjà été identifiés comme contenant des références GRV :

- `components/features/blog/BlogEditor.tsx` — ligne 13 : `const RDV_URL = 'https://gorendezvous.com/lasourceensoi';` → CORRIGER
- `lib/data/imageEditorTemplates.ts` — ligne 89-92 : texte "GORENDEZVOUS.COM/LASOURCEENSOI" sur les images → ÉVALUER si on ajoute le lien complet ou si on change le texte
- `lib/utils/publishHelpers.ts` — ligne 151 : `clinicUsername: 'lasourceensoi'` → vérifier le contexte d'utilisation
- `app/api/generate-captions/route.ts` — contient un system prompt qui mentionne "rendez-vous" → vérifier s'il génère des liens
- `app/api/generate-blog-faq/route.ts` — contient un system prompt qui mentionne "rendez-vous" → vérifier s'il génère des liens

### 3. Points à vérifier dans le pipeline social

Pour chaque point du pipeline, vérifier si un lien GRV est injecté et s'assurer qu'il utilise la bonne URL :

a) **Génération de captions Instagram** (generate-captions API) — est-ce que le prompt demande d'ajouter un lien de réservation ? Si oui, quel lien ?
b) **Génération de captions Facebook** — même question
c) **Descriptions YouTube** (publishHelpers.ts publishToYoutube) — est-ce qu'un lien est ajouté à la description ?
d) **Templates d'images** (imageEditorTemplates.ts) — texte "GORENDEZVOUS.COM/LASOURCEENSOI" visible sur les images sociales
e) **Stories Instagram** — est-ce que les stories incluent un lien "swipe up" ou un sticker lien ?
f) **Blog articles publiés** (BlogEditor) — le CTA URL en bas de l'article
g) **Content items** (contentItems Firestore) — est-ce que les items ont un champ URL/lien ?

### 4. Corrections à apporter

Pour CHAQUE occurrence trouvée, appliquer l'une de ces corrections :

**Si c'est une URL cliquable** (lien href, description YouTube, caption, CTA) :
→ Remplacer par `https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708`

**Si c'est du texte affiché sur une image** (imageEditorTemplates) :
→ Changer le texte en `ACUPUNCTUREJUDITH.CA/RESERVER` (redirige vers la page /reserver du site qui elle contient le bon lien GRV)

**Si c'est un prompt Claude API** (generate-captions, generate-blog-faq) :
→ S'assurer que le prompt inclut la bonne URL de réservation quand il demande d'ajouter un CTA

**Si c'est un username/paramètre API** (clinicUsername) :
→ Ne pas modifier sauf si le contexte montre qu'il est utilisé pour construire une URL

### 5. Constante centralisée (recommandation)

Créer une constante centralisée pour éviter ce problème à l'avenir :

```typescript
// lib/constants/urls.ts
export const BOOKING_URL = 'https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708';
export const SITE_URL = 'https://acupuncturejudith.ca';
export const BOOKING_PAGE_URL = 'https://acupuncturejudith.ca/reserver';
```

Puis remplacer toutes les occurrences hardcodées par cette constante.

### 6. Sortie attendue

- Liste de TOUS les fichiers modifiés avec avant/après
- Confirmation que le build passe (npm run build)
- Commit avec message descriptif

Ne touche PAS aux fichiers dans `app/(public)/` — ils sont déjà corrigés.
Ne touche PAS aux fichiers dans `docs/` — ce sont des documents stratégiques, pas du code.
