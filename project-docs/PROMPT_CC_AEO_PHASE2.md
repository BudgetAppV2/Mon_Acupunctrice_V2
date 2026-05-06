# Mission CC : Phase 2 AEO — Corrections post-audit Codex

## Contexte
Audit Codex post-Phase 1 AEO. Score actuel estimé : 80/100.
Cette phase corrige les incohérences et bugs restants.
Branche : `main`. Le site est LIVE.

## ⚠️ ATTENTION : le site est en production. Chaque commit est déployé automatiquement.

---

## PRIORITÉ 1 — URLs 404 dans le sitemap

### 1A. Corriger le sitemap
Le sitemap (`app/sitemap.ts`) doit lister UNIQUEMENT les URLs qui retournent 200.
Vérifier que les 3 slugs accentués ne sont PAS dans le sitemap :
- ❌ `/blog/bébé-siège-acupuncture`
- ❌ `/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communauté`
- ❌ `/blog/préparation-accouchement-induction-acupuncture`

Les versions ASCII DOIVENT être dans le sitemap :
- ✅ `/blog/bebe-siege-acupuncture`
- ✅ `/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communaute`
- ✅ `/blog/preparation-accouchement-induction-acupuncture`

Vérifier que les slugs dans Firestore `publicBlog` correspondent aux versions ASCII.
Si les documents Firestore ont encore les slugs accentués, les migrer.

### 1B. Vérifier la ressource ménopause
La ressource `acupuncture-menopause-montreal` est en statut `pending` dans Firestore.
Elle ne doit PAS apparaître dans le sitemap tant qu'elle n'est pas `published`.
Vérifier que `app/sitemap.ts` filtre par `status === 'published'`.

---

## PRIORITÉ 2 — llms-full.txt propre

Modifier `scripts/generate-llms-full.mjs` pour :
1. Ne PAS inclure les ressources en statut `draft` ou `pending` (seulement `published`)
2. Lire le contenu réel depuis Firestore au lieu des fichiers markdown locaux
3. Ne pas inclure de doublons
4. Valider que chaque URL référencée retourne 200

OU plus simple : le script lit les fichiers markdown locaux mais vérifie le statut dans le frontmatter.
Ne générer que les entrées avec `status: "published"`.

Après modification, régénérer : `node scripts/generate-llms-full.mjs`

---

## PRIORITÉ 3 — Schema JSON-LD nettoyé

### 3A. Dédupliquer les schemas
Le GlobalJsonLd.tsx injecte un graphe global (WebSite, Person, MedicalBusiness).
Certaines pages ajoutent ENCORE leurs propres schemas hérités avec les mêmes types.
Résultat : doublons avec données incohérentes.

Vérifier chaque page publique :
- Homepage (`page.tsx`)
- Services (fertilité, grossesse, pédiatrie, sociale)
- Contact
- À propos
- Tarifs

Pour chaque page : retirer les schemas dupliqués avec le GlobalJsonLd.
Garder uniquement les schemas SPÉCIFIQUES à la page (BreadcrumbList, FAQPage, etc.).
Ne jamais avoir 2 MedicalBusiness ou 2 Organization sur la même page.

### 3B. Image .webp (pas .jpg)
Chercher toutes les occurrences de `judith-portrait-01.jpg` et remplacer par `judith-portrait-01.webp`.
```bash
grep -rn "\.jpg" app/(public)/ --include="*.tsx" | grep -v node_modules
```

### 3C. Profils sociaux cohérents
Le schema `sameAs` DOIT utiliser les URLs exactes des profils officiels :
- Instagram : `https://www.instagram.com/judith.acupuncture/`
- Facebook : `https://www.facebook.com/profile.php?id=61562614934143`
- LinkedIn : `https://www.linkedin.com/in/judith-dufour-savard-acu/`
- Wikidata : `https://www.wikidata.org/wiki/Q139677208`

Retirer tout lien générique vers `facebook.com` ou `youtube.com` sans profil spécifique.

Le FOOTER doit utiliser les mêmes URLs que le schema.
Vérifier `SiteFooter.tsx` : si les liens sociaux pointent vers `mon_acupunctrice` au lieu de `judith.acupuncture`, corriger.

---

## PRIORITÉ 4 — H1 orientés recherche

Remplacer les H1 poétiques par des H1 descriptifs avec géolocalisation.
Garder les phrases poétiques comme sous-titres visuels.

| Page | H1 actuel | Nouveau H1 |
|---|---|---|
| Homepage | "Venez comme vous êtes" | "Judith Dufour-Savard, acupunctrice à Rosemont" |
| Fertilité | "Votre parcours fertilité, accompagné" | "Acupuncture fertilité à Rosemont et Montréal" |
| Grossesse | "Votre grossesse, accompagnée en douceur" | "Acupuncture grossesse et périnatalité à Montréal" |
| Sociale | "La santé est un droit" | "Acupuncture sociale à Rosemont — tarif solidaire" |

L'ancien H1 devient un `<p>` stylé en sous-titre sous le nouveau H1.
Le nouveau H1 utilise `SectionHeading` avec `as="h1"`.

---

## PRIORITÉ 5 — Liens legacy

### 5A. Liens /post/ dans les articles blog
Chercher dans TOUT le site :
```bash
grep -rn "/post/" app/(public)/ --include="*.tsx"
```
Remplacer `/post/slug` par `/blog/slug`.

### 5B. Liens /contactez-moi
```bash
grep -rn "/contactez-moi" app/(public)/ --include="*.tsx"
```
Remplacer par `/contact`.

### 5C. Lien /calendrier dans le footer
Le lien "Espace admin" dans le footer est INTENTIONNEL (pont admin).
NE PAS le retirer. Mais ajouter `rel="nofollow"` pour que les crawlers l'ignorent :
```tsx
<a href="/calendrier" rel="nofollow" className="text-[10px] opacity-30 hover:opacity-60 transition-opacity">
  Espace admin
</a>
```

---

## PRIORITÉ 6 — FAQ schema complet

### 6A. Réponses FAQ non tronquées
Vérifier que les réponses dans le JSON-LD FAQPage ne sont pas coupées.
Si elles sont tronquées à 500 chars, augmenter la limite ou écrire des réponses schema dédiées de 80-160 mots.

### 6B. FAQPage sur toutes les ressources
Vérifier que chaque ressource publiée avec des `faqEntries` a un schema FAQPage.
Le template `app/(public)/ressources/[slug]/page.tsx` le fait déjà — vérifier que ça fonctionne.

---

## PRIORITÉ 7 — Articles blog Hn propres

Vérifier les 2 articles avec double H1 :
- `acupuncture-baby-blues-post-partum`
- `acupuncture-fertilite-montreal-preparer-conception`

Corriger pour qu'il n'y ait qu'UN SEUL H1 par page.
Vérifier aussi les H2 vides ou contenant du Markdown brut.

---

## Vérifications finales

```bash
# Aucun 404 dans le sitemap
curl -s https://www.acupuncturejudith.ca/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | while read url; do echo -n "$url — "; curl -sI "$url" | head -1; done

# Aucun .jpg dans les schemas
grep -rn "\.jpg" app/(public)/ --include="*.tsx" | grep -v node_modules

# Aucun /post/ ou /contactez-moi
grep -rn "/post/\|/contactez-moi" app/(public)/ --include="*.tsx"

# Un seul H1 par page (vérifier les pages blog)
# Build OK
npm run build
```

## Commit
"fix(aeo): Phase 2 — sitemap 404, schema cleanup, H1 SEO, liens legacy, llms-full.txt

Phase 2 audit AEO basé sur analyse Codex :
1. Sitemap : retire les URLs 404, filtre par status published
2. llms-full.txt : ne génère que le contenu published
3. Schema : dédupliqué, image .webp, profils sociaux cohérents
4. H1 : remplacés par des H1 orientés recherche avec géolocalisation
5. Liens legacy : /post/ → /blog/, /contactez-moi → /contact, nofollow sur /calendrier
6. FAQ schema : réponses non tronquées
7. Blog : double H1 corrigé"

