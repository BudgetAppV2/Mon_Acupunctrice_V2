# Audit AEO / GEO / SEO local — acupuncturejudith.ca

Date d'audit : 2026-05-06  
Site audité : https://www.acupuncturejudith.ca/  
Repo : `/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2`

## Méthode et limites

- Crawl live du sitemap public : 29 URLs déclarées dans `https://www.acupuncturejudith.ca/sitemap.xml`.
- Vérification HTTP : redirections, codes statut, titles, descriptions, canoniques, H1/H2/H3, JSON-LD, liens internes, robots.
- Inspection repo : Next.js App Router, Firestore CMS, `next.config.mjs`, `app/sitemap.ts`, `public/robots.txt`, pages publiques, scripts `llms.txt`.
- Inspection Firestore : `publicBlog`, `faqs`, `ressources` publiés.
- Vérification externe publique : La Source en Soi, Lumino, HealthDoc, annuaires locaux. Je n'ai pas accès à Google Business Profile, Search Console ni Analytics.
- PageSpeed Insights a retourné un 429 quota exceeded. Je n'utilise donc pas de score Lighthouse officiel. Mesures réseau brutes : TTFB live environ 77-95 ms sur home, service fertilité et ressource fertilité.

Sources principales :
- Site : https://www.acupuncturejudith.ca/
- Sitemap : https://www.acupuncturejudith.ca/sitemap.xml
- Robots : https://www.acupuncturejudith.ca/robots.txt
- Fertilité : https://www.acupuncturejudith.ca/services/fertilite
- Grossesse : https://www.acupuncturejudith.ca/services/grossesse
- Ressource fertilité : https://www.acupuncturejudith.ca/ressources/acupuncture-fertilite-montreal
- Ressource grossesse : https://www.acupuncturejudith.ca/ressources/acupuncture-grossesse-montreal
- La Source en Soi équipe : https://lasourceensoi.com/notre-equipe/
- Lumino Judith : https://luminosante.sunlife.ca/fr/profil-du-professionnel-de-la-sante/acupuncteur/la-source-en-soi/judith-dufour-savard-1007631-714482/
- HealthDoc Judith : https://www.healthdoc.ca/listing/judith-dufour-savard-03d6c9
- La Source en Soi annuaire local : https://www.cybo.com/CA-biz/la-source-en-soi-%7C-centre-de-soins

## A. Résumé exécutif

Score global AEO : 74 / 100  
Score SEO local : 66 / 100  
Score Entity Clarity : 78 / 100  
Score AI Citation Readiness : 72 / 100

Le site a une base AEO nettement meilleure qu'un site local classique : pages services dédiées, ressources longues, FAQ, JSON-LD présent, `llms.txt` et `llms-full.txt`, contenu médical sourcé, signaux OAQ, bio claire, positionnement Rosemont + Repentigny. Le blocage principal n'est pas l'absence de contenu, mais la cohérence machine : domaine canonique inversé, sitemap avec 404, pages importantes sans H1, schema fragmenté, slugs accentués cassés, maillage hérité `/post`, et entité Judith parfois mélangée à l'entité La Source en Soi.

Pour être recommandée spontanément sur "meilleure acupunctrice fertilité Rosemont", "acupuncture FIV Montréal" ou "acupuncture grossesse Montréal", Judith doit devenir une entité locale et médicale parfaitement stable : même nom, même URL canonique, mêmes lieux, mêmes spécialités, mêmes preuves, mêmes sources, mêmes liens externes. Aujourd'hui, le contenu dit beaucoup de bonnes choses, mais les signaux techniques les distribuent de manière inégale.

## B. Les 10 problèmes les plus importants

1. Domaine canonique incohérent : le serveur force `https://www.acupuncturejudith.ca/`, mais `metadataBase`, canonicals, sitemap, robots et JSON-LD pointent vers `https://acupuncturejudith.ca`.  
   Où : `app/(public)/layout.tsx:28`, `app/sitemap.ts:4`, `public/robots.txt:26`, schemas hardcodés.  
   Changement : choisir `www` partout ou rediriger `www` vers non-www. Vu les 308 actuels, le plus rapide est de passer tout en `https://www.acupuncturejudith.ca`.  
   Impact : consolidation des signaux, moins de canonical-to-redirect, meilleure attribution des citations IA.

2. Trois articles dans le sitemap retournent 404 : `/blog/bébé-siège-acupuncture`, `/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communauté`, `/blog/préparation-accouchement-induction-acupuncture`.  
   Où : sitemap live et Firestore `publicBlog`; le build génère des fichiers accentués mais Next sert 404 en local et en prod.  
   Changement : renommer les slugs Firestore en ASCII (`bebe-siege-acupuncture`, `acupuncture-sociale-communaute`, `preparation-accouchement-induction-acupuncture`) et ajouter des 301 spécifiques depuis les anciennes URLs Wix et les URLs accentuées.  
   Impact : récupère des sujets grossesse locaux très AEO : bébé en siège, moxibustion, préparation accouchement.

3. Pages importantes sans H1 : `/services`, `/ressources`, `/blog`, `/a-propos`, `/tarifs`, `/reserver`, `/contact`, `/faq`.  
   Où : `SectionHeading` force toujours `<h2>` dans `app/(public)/_components/SectionHeading.tsx:23`.  
   Changement : ajouter un prop `as="h1"` ou créer `PageHeroHeading`; convertir le titre hero de chaque page index/transactionnelle en H1.  
   Impact : meilleure compréhension page-level par Google et par découpage LLM.

4. H1 services trop poétiques et trop peu requête : fertilité = "Votre parcours fertilité, accompagné"; grossesse = "Votre grossesse, accompagnée en douceur"; sociale = "La santé est un droit".  
   Où : sections hero des services.  
   Changement : H1 directs : "Acupuncture fertilité à Rosemont et Montréal", "Acupuncture grossesse et périnatalité à Montréal", "Acupuncture sociale à Rosemont". Garder la phrase sensible en sous-titre.  
   Impact : aligne les pages avec les requêtes exactes sans perdre le ton.

5. Schema.org fragmenté et parfois risqué : `MedicalBusiness` seulement sur contact/tarifs/réserver, `Person` seulement home/about, pas de `@graph` central, pas de `availableService`, pas de `hasCredential`, image schema 404, aggregateRating de La Source associé à Judith.  
   Où : `app/(public)/contact/page.tsx:24-78`, home, services. Image 404 : `judith-portrait-01.jpg` au lieu de `.webp`.  
   Changement : créer un graphe stable `Person + MedicalBusiness + WebSite + WebPage + MedicalService`, avec `@id` constants et `www`. Mettre les avis clinic uniquement sur l'entité clinic si affichés et vérifiés.  
   Impact : entity clarity et admissibilité aux réponses génératives.

6. Entité Judith vs La Source en Soi ambiguë. Le site présente Judith comme praticienne indépendante, mais les avis, le téléphone et une partie du NAP appartiennent à la clinique.  
   Où : home, contact, schemas, footer.  
   Changement : formuler partout "Judith Dufour-Savard, Ac., acupunctrice indépendante pratiquant à La Source en Soi..." et créer des propriétés `affiliation` / `worksFor` / `workLocation` cohérentes.  
   Impact : évite qu'un LLM recommande seulement La Source en Soi ou dilue Judith parmi les autres acupunctrices.

7. Les ressources sont fortes mais pas toutes schema-rich. Seule la ressource fertilité a `FAQPage`; grossesse, pédiatrie, anxiété et sociale ont 0 FAQ structurée. Les citations existent dans le texte, mais pas dans un champ `citation` JSON-LD structuré.  
   Où : Firestore `ressources`; `app/(public)/ressources/[slug]/page.tsx`.  
   Changement : importer les `faqEntries` et `citations` pour chaque ressource; ajouter `citation` sur `MedicalWebPage`.  
   Impact : meilleure citation par Perplexity, ChatGPT Search, Google AI Overviews.

8. `llms-full.txt` est incomplet/stale : il ne reprend pas le contenu live complet de Firestore; il inclut des pages ménopause du dossier `content/ressources` alors que la page ménopause n'est pas dans le sitemap, et le contenu fertilité/pédiatrie/sociale/anxiété live n'y est qu'en résumé.  
   Où : `scripts/generate-llms-full.mjs:64-88`, `public/llms-full.txt`.  
   Changement : générer `llms-full.txt` depuis Firestore publié ou depuis `scripts/seo-geo/source-resources`, pas depuis `content/ressources` seulement.  
   Impact : réduit le risque qu'un LLM cite une page non publiée ou ignore les meilleurs contenus.

9. Maillage interne hérité : plusieurs articles live contiennent des liens `/post/...` et `/contactez-moi`; le footer public pointe vers `/calendrier`, route admin bloquée par robots.  
   Où : contenus Firestore blog; `SiteFooter.tsx:125-131`; redirection wildcard `next.config.mjs:41-42`.  
   Changement : remplacer les liens internes en `/blog/...` et `/contact`; retirer le lien admin public ou ajouter `rel="nofollow"` + masquage auth.  
   Impact : moins de crawl waste, moins de liens vers routes bloquées.

10. Topical authority encore trop généraliste pour FIV/IUI/SOPK/endométriose/local Rosemont. Les piliers existent, mais il manque des satellites transactionnels et conditionnels.  
    Où : architecture actuelle `/services/*`, `/ressources/*`, blog.  
    Changement : créer des pages satellites ciblées listées en section G.  
    Impact : capte les requêtes longues que les IA utilisent pour choisir un professionnel.

## C. Quick wins en moins de 2 heures

- Passer `BASE_URL`, `metadataBase`, robots sitemap et tous les `@id` schema en `https://www.acupuncturejudith.ca`.
- Corriger `image` schema contact de `.jpg` vers `.webp`.
- Ajouter 301 spécifiques pour les 3 articles 404, puis retirer les URLs 404 du sitemap tant que les pages ne répondent pas 200.
- Modifier `SectionHeading` pour accepter `as="h1"` et corriger H1 sur services, ressources, blog, à-propos, tarifs, réserver, contact, FAQ.
- Retirer le lien footer `Espace admin` vers `/calendrier`.
- Remplacer dans les contenus blog les liens `/post/*` et `/contactez-moi`.
- Ajouter une phrase citation-ready en haut de chaque page service : "Judith Dufour-Savard, Ac., accompagne [intention] à La Source en Soi, Rosemont, Montréal."
- Régénérer `llms-full.txt` depuis les contenus publiés et supprimer les doublons ménopause.

## D. Améliorations techniques à faire dans le code

- `app/(public)/layout.tsx` : `metadataBase: new URL('https://www.acupuncturejudith.ca')`; canonicals absolus `www`; ajouter éventuellement `<link rel="alternate" type="text/plain" href="/llms.txt">`.
- `app/sitemap.ts` : `BASE_URL = 'https://www.acupuncturejudith.ca'`; normaliser/encoder les slugs; exclure toute URL dont la route ne répond pas 200.
- `public/robots.txt` : `Sitemap: https://www.acupuncturejudith.ca/sitemap.xml`; garder les bots IA autorisés; ne pas lier publiquement les routes admin.
- `next.config.mjs` : remplacer le redirect wildcard `/post/:slug*` par une matrice 301 explicite pour les 11 anciens articles Wix, surtout ceux dont le nouveau slug diffère.
- `app/(public)/blog/[slug]/page.tsx` : décoder/normaliser `params.slug`, mais surtout migrer les slugs vers ASCII; corriger `CtaButton` sans `href` en bas d'article.
- `app/(public)/_components/SectionHeading.tsx` : prop `as?: 'h1' | 'h2' | 'h3'`.
- `app/(public)/contact/page.tsx` : corriger image 404; centraliser le graphe schema.
- `app/(public)/services/*/page.tsx` : ajouter `MedicalService` / `Service` avec `provider`, `areaServed`, `serviceType`, `availableChannel`, `offers`.
- `app/(public)/faq/page.tsx` : ne pas couper le JSON-LD FAQ à 500 caractères au milieu d'une phrase; produire une réponse courte dédiée, 80-160 mots.
- `scripts/generate-llms-full.mjs` : lire Firestore publié ou la même source que les pages live; ne pas inclure `_TEMPLATE`, doublons ou brouillons.

## E. Améliorations de contenu manuelles

- Clarifier l'entité en une phrase répétable : "Judith Dufour-Savard, Ac., est acupunctrice membre de l'OAQ, spécialisée en fertilité, grossesse et périnatalité, pratiquant à La Source en Soi dans Rosemont, Montréal."
- Ajouter si validé : numéro OAQ `A-008-24` visible sur À propos et footer. HealthDoc l'affiche publiquement, mais il faut confirmer avant publication.
- Ajouter un bloc "Limites de pratique" sur fertilité/grossesse : ne remplace pas un suivi médical, sage-femme, gynécologue ou clinique de fertilité; complément.
- Ajouter un bloc "Collaboration" plus concret : examens à apporter, quand référer, comment l'acupuncture s'insère dans FIV/IUI/grossesse.
- Ajouter des mini-réponses AEO en tête de chaque section : réponse directe d'abord, nuance ensuite.
- Ajouter des preuves locales : jours à Rosemont, métro Beaubien, quartier Rosemont-La Petite-Patrie, clinique La Source en Soi, accès, stationnement.
- Ajouter une section "Avis et témoignages" avec attribution claire : avis Judith uniquement si possible; avis La Source en Soi séparés et étiquetés comme avis de la clinique.
- Ajouter CTA avis : lien "laisser un avis Google" uniquement si vous avez un lien GBP/Place ID valide.

## F. JSON-LD recommandé

### Graphe global à réutiliser sur home/contact

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.acupuncturejudith.ca/#website",
      "url": "https://www.acupuncturejudith.ca/",
      "name": "Judith Dufour-Savard, Ac. — Acupunctrice",
      "inLanguage": "fr-CA",
      "publisher": { "@id": "https://www.acupuncturejudith.ca/#judith" }
    },
    {
      "@type": "Person",
      "@id": "https://www.acupuncturejudith.ca/#judith",
      "name": "Judith Dufour-Savard",
      "alternateName": ["Judith Dufour Savard", "Judith Dufour-Savard, Ac.", "Mon Acupunctrice"],
      "jobTitle": "Acupunctrice",
      "url": "https://www.acupuncturejudith.ca/",
      "image": "https://www.acupuncturejudith.ca/site/judith/judith-portrait-01.webp",
      "telephone": "+1-514-750-3735",
      "knowsLanguage": ["fr-CA", "en"],
      "memberOf": { "@type": "Organization", "name": "Ordre des acupuncteurs du Québec", "url": "https://o-a-q.org/" },
      "alumniOf": { "@type": "EducationalOrganization", "name": "Collège de Rosemont" },
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "DEC en acupuncture",
        "recognizedBy": { "@type": "Organization", "name": "Ordre des acupuncteurs du Québec" }
      },
      "knowsAbout": [
        "acupuncture fertilité", "acupuncture FIV", "insémination intra-utérine",
        "cycle menstruel", "SOPK", "endométriose", "acupuncture grossesse",
        "nausées de grossesse", "moxibustion bébé en siège",
        "préparation à l'accouchement", "post-partum", "acupuncture pédiatrique",
        "acupuncture sociale", "anxiété", "insomnie"
      ],
      "workLocation": [
        { "@id": "https://www.acupuncturejudith.ca/#place-rosemont" },
        { "@id": "https://www.acupuncturejudith.ca/#place-repentigny" }
      ],
      "sameAs": [
        "https://www.instagram.com/mon_acupunctrice/",
        "https://luminosante.sunlife.ca/fr/profil-du-professionnel-de-la-sante/acupuncteur/la-source-en-soi/judith-dufour-savard-1007631-714482/",
        "https://www.healthdoc.ca/listing/judith-dufour-savard-03d6c9"
      ]
    },
    {
      "@type": ["MedicalBusiness", "LocalBusiness"],
      "@id": "https://www.acupuncturejudith.ca/#business",
      "name": "Judith Dufour-Savard — Acupuncture",
      "url": "https://www.acupuncturejudith.ca/",
      "image": "https://www.acupuncturejudith.ca/site/judith/judith-portrait-01.webp",
      "telephone": "+1-514-750-3735",
      "email": "info@acupuncturejudith.ca",
      "priceRange": "$$",
      "paymentAccepted": "Cash, Credit Card, Debit Card, Interac",
      "medicalSpecialty": ["Acupuncture", "Reproductive Health", "Obstetrics", "Pediatrics"],
      "founder": { "@id": "https://www.acupuncturejudith.ca/#judith" },
      "areaServed": [
        { "@type": "City", "name": "Montréal" },
        { "@type": "AdministrativeArea", "name": "Rosemont-La Petite-Patrie" },
        { "@type": "City", "name": "Repentigny" }
      ],
      "location": [
        { "@id": "https://www.acupuncturejudith.ca/#place-rosemont" },
        { "@id": "https://www.acupuncturejudith.ca/#place-repentigny" }
      ],
      "availableService": [
        { "@id": "https://www.acupuncturejudith.ca/#service-fertilite" },
        { "@id": "https://www.acupuncturejudith.ca/#service-grossesse" },
        { "@id": "https://www.acupuncturejudith.ca/#service-sociale" }
      ]
    },
    {
      "@type": "Place",
      "@id": "https://www.acupuncturejudith.ca/#place-rosemont",
      "name": "La Source en Soi — Rosemont",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2554 rue Beaubien Est",
        "addressLocality": "Montréal",
        "addressRegion": "QC",
        "postalCode": "H1Y 1G3",
        "addressCountry": "CA"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 45.5501, "longitude": -73.5832 }
    },
    {
      "@type": "Place",
      "@id": "https://www.acupuncturejudith.ca/#place-repentigny",
      "name": "Éden Yoga Pilates — Repentigny",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "121 boul. Industriel #225",
        "addressLocality": "Repentigny",
        "addressRegion": "QC",
        "addressCountry": "CA"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 45.7422, "longitude": -73.4515 }
    }
  ]
}
```

### Service fertilité / FIV

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "@id": "https://www.acupuncturejudith.ca/services/fertilite#webpage",
  "url": "https://www.acupuncturejudith.ca/services/fertilite",
  "name": "Acupuncture fertilité à Rosemont et Montréal",
  "description": "Acupuncture pour fertilité naturelle, FIV, insémination, SOPK, endométriose et régulation du cycle à Rosemont, Montréal.",
  "inLanguage": "fr-CA",
  "isPartOf": { "@id": "https://www.acupuncturejudith.ca/#website" },
  "author": { "@id": "https://www.acupuncturejudith.ca/#judith" },
  "reviewedBy": { "@id": "https://www.acupuncturejudith.ca/#judith" },
  "about": [
    { "@type": "MedicalCondition", "name": "Infertilité" },
    { "@type": "MedicalCondition", "name": "SOPK" },
    { "@type": "MedicalCondition", "name": "Endométriose" }
  ],
  "mainEntity": {
    "@type": "MedicalTherapy",
    "@id": "https://www.acupuncturejudith.ca/#service-fertilite",
    "name": "Acupuncture pour la fertilité",
    "alternateName": ["acupuncture FIV", "acupuncture IUI", "acupuncture fertilité Rosemont"],
    "provider": { "@id": "https://www.acupuncturejudith.ca/#judith" },
    "relevantSpecialty": "Reproductive Medicine",
    "areaServed": [{ "@type": "City", "name": "Montréal" }, { "@type": "AdministrativeArea", "name": "Rosemont-La Petite-Patrie" }]
  }
}
```

### FAQPage modèle

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.acupuncturejudith.ca/services/fertilite#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Combien de séances d'acupuncture avant une FIV ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un suivi de 2 à 3 cycles avant une FIV est souvent recommandé pour travailler la régularité du cycle, la circulation utérine, le stress et la préparation au transfert. Le plan doit toujours être adapté à votre protocole médical."
      }
    },
    {
      "@type": "Question",
      "name": "L'acupuncture est-elle sécuritaire pendant une FIV ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, l'acupuncture n'ajoute aucun médicament et ne remplace pas le suivi en clinique de fertilité. Elle peut accompagner le stress, les effets secondaires et la préparation corporelle, en complément du protocole médical."
      }
    }
  ]
}
```

## G. Nouvelles pages prioritaires à créer

| Priorité | Page | Title SEO | H1 | Intention | Mots-clés | Angle AEO | FAQ à inclure | Liens internes |
|---|---|---|---|---|---|---|---|---|
| Haute | `/services/acupuncture-fiv-montreal` | Acupuncture FIV Montréal Rosemont \| Judith Dufour-Savard | Acupuncture FIV à Montréal : soutien avant et pendant le transfert | Transactionnelle + rassurance | acupuncture FIV Montréal, acupuncture transfert embryon | Réponse directe sur quand consulter avant FIV | Combien de séances? Sécuritaire hormones? Jour du transfert? | Fertilité, ressource fertilité, réserver |
| Haute | `/services/acupuncture-fertilite-rosemont` | Acupuncture fertilité Rosemont \| Acupunctrice OAQ | Acupuncture fertilité à Rosemont | Locale transactionnelle | meilleure acupunctrice fertilité Rosemont | Pourquoi consulter localement à La Source en Soi | Où? prix? assurance? stationnement? | Fertilité, contact, tarifs |
| Haute | `/ressources/acupuncture-iui-insemination-montreal` | Acupuncture insémination IUI Montréal | Acupuncture et insémination : quand commencer ? | Informationnelle PMA | acupuncture IUI, insémination Montréal | Timeline claire cycle par cycle | Avant/après IUI? douleur? sécurité? | Fertilité, FIV |
| Haute | `/ressources/acupuncture-sopk-fertilite` | Acupuncture SOPK fertilité Montréal | Acupuncture, SOPK et fertilité | Conditionnelle | SOPK fertilité acupuncture | Expliquer cycle, ovulation, insulinorésistance avec limites | Est-ce que ça régule l'ovulation? | Fertilité, cycle |
| Haute | `/ressources/acupuncture-endometriose-fertilite` | Acupuncture endométriose fertilité Montréal | Acupuncture, endométriose et projet de grossesse | Conditionnelle | endométriose fertilité acupuncture | Douleur + inflammation + parcours FIV | Remplace-t-elle traitement médical? | Fertilité, FIV |
| Moyenne | `/ressources/cycle-menstruel-ovulation-acupuncture` | Acupuncture cycle menstruel ovulation Montréal | Régulariser le cycle et soutenir l'ovulation | Informationnelle | cycle irrégulier, ovulation acupuncture | Définir quand consulter selon cycle | Combien de cycles? spotting? douleurs? | Fertilité |
| Haute | Fix `/blog/bebe-siege-acupuncture` | Bébé en siège acupuncture Montréal | Bébé en siège : moxibustion et acupuncture | Intention urgente grossesse | bébé siège acupuncture, moxibustion | Fenêtre 33-36 semaines, réponse claire | Quand commencer? moxa maison? sécurité? | Grossesse, ressource grossesse |
| Haute | Fix `/blog/preparation-accouchement-acupuncture` | Préparation accouchement acupuncture Montréal | Préparation à l'accouchement par acupuncture | Grossesse fin de terme | acupuncture préparation accouchement | Fréquence à 36-37 semaines | Déclenchement? col? induction? | Grossesse, tarifs |
| Moyenne | `/ressources/acupuncture-postnatale-montreal` | Acupuncture postnatale Montréal | Acupuncture post-partum et récupération | Périnatalité | acupuncture postnatale, fatigue post-partum | Fatigue, sommeil, baby blues, limites | Quand consulter après naissance? | Grossesse, pédiatrie |
| Moyenne | `/ressources/anxiete-sommeil-stress-perinatal` | Acupuncture anxiété grossesse post-partum Montréal | Anxiété, sommeil et stress périnatal | AEO santé mentale périnatale | anxiété grossesse, insomnie grossesse | Corps + système nerveux + collaboration médicale | Quand référer? médication? | Grossesse, anxiété |
| Moyenne | `/services/acupuncteur-rosemont` | Acupunctrice Rosemont Montréal \| Beaubien Est | Acupunctrice à Rosemont, Montréal | Locale | acupunctrice Rosemont, acupuncture Beaubien | NAP + services + preuve locale | Adresse? stationnement? avis? | Contact, services |
| Basse | `/ressources/acupuncture-menopause-montreal` | Acupuncture ménopause Montréal | Acupuncture et ménopause à Montréal | Future topical expansion | acupuncture ménopause | Ne publier que si service confirmé | bouffées chaleur? sommeil? | À propos, services |

## H. Plan d'action

### 30 jours

- Corriger domaine canonique `www`, sitemap, robots, schemas.
- Fixer les 3 articles 404 et les redirections Wix.
- Ajouter H1 manquants et H1 orientés requête sur les services.
- Nettoyer liens `/post`, `/contactez-moi`, `/calendrier`.
- Corriger schema image 404 et créer graphe global.
- Régénérer `llms-full.txt` à partir du contenu publié.
- Soumettre sitemap dans Search Console et demander indexation des pages fertilité/grossesse/ressources.

### 60 jours

- Publier les pages FIV, fertilité Rosemont, IUI, SOPK, endométriose.
- Ajouter FAQPage + citations structurées sur toutes les ressources.
- Ajouter bloc credential + limites de pratique sur services et ressources.
- Aligner GBP : catégories, description, services, lien site, lien réservation, avis, photos, posts.
- Nettoyer annuaires : Lumino, HealthDoc, Cybo, Pages Jaunes, La Source en Soi, GoRendezVous.

### 90 jours

- Publier les satellites grossesse : bébé siège, préparation accouchement, postnatal, anxiété/sommeil périnatal.
- Obtenir 3-5 mentions externes locales : La Source en Soi, annuaires santé, articles périnatalité, collaborations.
- Suivre les requêtes dans GSC : impressions/clics sur FIV, fertilité Rosemont, grossesse Montréal, bébé siège, nausées.
- Tester les réponses génératives : ChatGPT, Perplexity, Google AI Overviews, Bing Copilot avec requêtes cibles.
- Rafraîchir les contenus scientifiques tous les 6 mois.

## I. Fichiers du code à modifier

- `app/(public)/layout.tsx` : `metadataBase`, canonicals, `openGraph.url`, liens LLM.
- `app/sitemap.ts` : `BASE_URL`, exclusion des 404, slugs ASCII.
- `public/robots.txt` : sitemap `www`.
- `next.config.mjs` : matrice de redirects 301 explicite.
- `app/(public)/blog/[slug]/page.tsx` : normalisation slug, CTA réservation, metadata canonical.
- `app/(public)/_components/SectionHeading.tsx` : prop H1/H2.
- `app/(public)/_components/SiteFooter.tsx` : retirer `/calendrier`, corriger liens sociaux précis.
- `app/(public)/contact/page.tsx` : schema image, graphe global, GBP/review link si disponible.
- `app/(public)/services/fertilite/page.tsx` : title/H1/schema/FAQ service.
- `app/(public)/services/grossesse/page.tsx` : title/H1/schema/FAQ service.
- `app/(public)/services/acupuncture-sociale/page.tsx` : title/H1/schema local/social.
- `app/(public)/ressources/[slug]/page.tsx` : `citation`, FAQPage pour toutes ressources, `reviewedBy`, `about`.
- `app/(public)/faq/page.tsx` : réponses schema non tronquées au milieu d'une phrase.
- `scripts/generate-llms-full.mjs` : source Firestore publié ou source-resources complète; filtre brouillons/doublons.
- Firestore `publicBlog` : slugs ASCII, liens internes `/blog`.
- Firestore `ressources` : ajouter `faqEntries`, `citations`, `relatedArticles`, `relatedResources`.

## Audit par dimension

### 1. Entity Clarity

Points forts :
- Judith est nommée, montrée, associée à OAQ, Collège de Rosemont, La Source en Soi, Éden Yoga Pilates.
- Les pages principales disent Rosemont, Montréal, Repentigny, fertilité, grossesse, pédiatrie, sociale.
- Les annuaires Lumino et HealthDoc confirment l'entité Judith, la profession et l'adresse.

Points faibles :
- Variantes de nom : "Judith Dufour-Savard", "Judith Dufour Savard", "Judith Dufour-Savard, Ac.", "mon_acupunctrice".
- Entité business : site personnel vs clinique La Source en Soi. Les avis 4,9/5 sont affichés comme avis de la clinique, pas nécessairement Judith.
- Schema `Person` ne porte pas toutes les spécialités, credentials et lieux.
- Le NAP externe a au moins une incohérence de code postal : Lumino affiche `H2G 1K8` sur une page, alors que le site et autres annuaires affichent `H1Y 1G3`.

Action exacte :
- Définir une ligne canonique : `Judith Dufour-Savard, Ac. — acupunctrice membre de l'OAQ à Rosemont, Montréal`.
- Ajouter `alternateName` dans schema.
- Afficher "praticienne indépendante pratiquant à La Source en Soi" sur home, à-propos, footer, contact.
- Harmoniser NAP sur Lumino, HealthDoc, GoRendezVous, La Source en Soi et annuaires.

### 2. AEO / LLM Chunk Audit

Home :
- Chunk 0-300 mots : bon contexte entité + services + Rosemont, mais H1 "Venez comme vous êtes" n'est pas citation-ready pour les requêtes fertilité.
- Chunks suivants : approche et bio solides; témoignages utiles, mais il manque une attribution vérifiable au niveau schema.

Services fertilité :
- 810 mots; le premier chunk est très bon pour LLM grâce au bloc réponse directe.
- Problème : H1 et title trop génériques; section FIV commence par expérience ("J'accompagne...") au lieu d'une réponse directe à "l'acupuncture augmente-t-elle les chances en FIV ?".
- Ajouter une phrase : "En FIV, l'acupuncture sert surtout à préparer le terrain, réduire le stress et accompagner le transfert; elle ne remplace pas le protocole de fertilité."

Services grossesse :
- 705 mots; bon bloc direct en haut; H2 en questions; très exploitable.
- Problème : la page n'a pas de sous-sections dédiées séparées pour nausées, bébé siège, préparation accouchement, post-partum avec URLs propres.

Ressources :
- 1700-2200 mots; excellente profondeur.
- Problème : plusieurs ressources n'ont pas FAQPage; `llms-full.txt` ne reflète pas le contenu live complet.
- Ajouter une "réponse courte" de 60-90 mots avant chaque H2 scientifique.

FAQ :
- 2178 mots; très bon pour AEO.
- Problème : JSON-LD coupe les réponses à 500 caractères au milieu d'une phrase, ce qui peut réduire la qualité de rich results et la citation.

### 3. Topical Authority

Couvert :
- Acupuncture fertilité : service + ressource + blog + 3 FAQ.
- FIV : mentionnée dans service/ressource/FAQ, mais pas page dédiée.
- Grossesse : service + ressource + blog nausées + FAQ nausées et bébé siège.
- Bébé en siège : contenu existe mais route 404.
- Préparation accouchement : contenu existe mais route 404/mauvais redirect.
- Postnatal : blog fatigue + baby blues, mais pas ressource ou service.
- Anxiété/sommeil : ressource santé mentale et FAQ anxiété, pas périnatal.
- Rosemont/Montréal : mentions fréquentes, pas page locale dédiée.

Manquant ou trop mince :
- IUI / insémination.
- FIV transfert embryon.
- SOPK.
- Endométriose.
- Cycle menstruel / ovulation.
- Acupuncture fertilité Rosemont.
- Acupuncture grossesse Rosemont.
- Acupuncture postnatale.
- Stress/anxiété/sommeil périnatal.

### 4. EEAT

Points forts :
- OAQ, DEC Collège de Rosemont, expérience maison de naissance, mère de trois enfants, approche humaine, sources scientifiques inline.
- Lumino affiche 39 évaluations pour Judith; HealthDoc affiche licence OAQ `A-008-24`.

Points faibles :
- Numéro de membre OAQ non visible sur le site.
- Peu de limites de pratique explicites sur les pages médicales.
- Sources scientifiques visibles mais pas centralisées dans `citation` schema.
- Témoignages mélangés avec avis clinic.
- Pas de page "mentions / médias / annuaires / profils professionnels".

Action :
- Ajouter une carte credential sur chaque page YMYL : OAQ, DEC, expérience, limites, dernière révision.
- Ajouter `reviewedBy` et `dateModified`.
- Créer une section "Sources scientifiques" structurée sur chaque ressource.

### 5. Local SEO / GBP

Points forts :
- Adresse Rosemont affichée : 2554 rue Beaubien Est, Montréal, H1Y 1G3.
- Téléphone cohérent majoritaire : 514 750-3735.
- Rosemont et Montréal présents dans les pages.
- Contact avec cartes Google intégrées.

Points faibles :
- Pas de lien direct vers GBP / avis Google.
- Pas de page locale "Acupunctrice Rosemont".
- Nom GBP probable : La Source en Soi, pas Judith; si Judith n'a pas GBP praticienne, les signaux locaux remontent à la clinique.
- Code postal incohérent sur Lumino anglais/français selon pages externes (`H2G 1K8` vs `H1Y 1G3`).

Action :
- Si Judith peut avoir un profil praticienne GBP : créer/optimiser "Judith Dufour-Savard, Ac." avec catégorie `Acupuncteur`.
- Sinon : aligner la page site autour de "Judith pratique à La Source en Soi" et obtenir une page équipe La Source plus détaillée avec lien vers acupuncturejudith.ca.
- Ajouter services GBP : fertilité, FIV, grossesse, moxibustion, pédiatrie, acupuncture sociale.

### 6. Technical SEO Quick Check

OK :
- HTTPS/HSTS, redirections HTTP -> HTTPS, sitemap accessible, robots permissif, pages principales indexables, TTFB très bon, build Next OK.
- `llms.txt` et `llms-full.txt` existent.

À corriger :
- Canonicals non-www alors que prod force www.
- 3 sitemap URLs 404.
- 8 pages sans H1.
- Metadata avec accents manquants (`fertilite`, `a`, `nausees`) à corriger pour qualité SERP.
- Schema image 404.
- Admin link public vers route bloquée.
- PageSpeed PSI non mesuré à cause du quota; à refaire dans Search Console/PSI.
- Build warning PWA : WASM 23,9 MB non précaché. Impact SEO public faible, mais à surveiller pour le service worker.

