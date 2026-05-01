# Milestone MW-D5 : Pages `/ressources` + `/ressources/[slug]`

**Type** : UI
**Vague** : 4
**Priorité** : Medium
**Temps estimé Claude Code** : 3-4h
**Dépendances** : MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer les pages de ressources publiques — liste par type/pilier et page individuelle — avec citations scientifiques externes (PubMed, études) pour renforcer l'autorité SEO.

---

## Contexte minimal

Les ressources sont le contenu long et référentiel (guides, articles de fond) qui complètent les FAQ courtes. Elles servent de spoke dans l'architecture hub-and-spoke (plan §4.4.1) et incluent des citations scientifiques avec sources externes (amendement A1) pour renforcer la crédibilité.

**Bonne nouvelle du 14 avril** : **5 ressources existent déjà** dans `scripts/seo-geo/source-resources/` et seront importées dans Firestore par MW-D3 avec toutes leurs sections riches (scienceSection, mechanismSection, protocolSection, citations PubMed, FAQ embarquées). Ce milestone ne fait **que le rendu frontend** — le contenu existe déjà. Les 5 ressources disponibles au lancement :
- `/ressources/acupuncture-fertilite-montreal`
- `/ressources/acupuncture-grossesse-montreal`
- `/ressources/acupuncture-pediatrique-enfants-bebes`
- `/ressources/acupuncture-sante-mentale-anxiete`
- `/ressources/acupuncture-sociale-montreal`

Les liens vers `/ressources` sont discrets dans le footer (amendement A1). Voir `docs/migration-wix/DECISIONS_Q1-Q16.md` pour le contexte complet.

---

## Livrables

- [ ] **Page `app/(public)/ressources/page.tsx`** — liste des ressources publiées, filtrables par pilier et type, avec card par ressource
- [ ] **Page `app/(public)/ressources/[slug]/page.tsx`** — ressource individuelle avec rendu markdown, citations scientifiques, liens vers services/FAQ liés, CTA
- [ ] **Composant `<CitationBlock />`** — affichage structuré des citations scientifiques (auteurs, titre, journal, année, lien PubMed)
- [ ] **Metadata dynamique** via `generateMetadata`
- [ ] **Schema.org** `Article` ou `ScholarlyArticle`

---

## Dépendances

**Dépendance implicite forte : MW-D3** (import des ressources dans Firestore) doit être terminé avant que les pages `/ressources/*` puissent afficher du contenu réel. Si MW-D5 est lancé avant MW-D3, les pages fonctionnent mais affichent "Aucune ressource" — à éviter au lancement.

---

## Approche technique

**Page liste** (`/ressources/page.tsx`) :
- Server Component, query Firestore `ressources`, `status == 'published'`, `orderBy publishedAt DESC`
- Cards avec : titre (depuis `title`), extrait (depuis `shortAnswer`), catégorie (badge coloré par pilier : fertilité / grossesse / pédiatrie / sociale / transversal), heroImage (depuis `heroImageAlt` + photo Eric Bates correspondante)
- Filtrage par pilier possible (5 onglets ou tags cliquables) — au lancement, 5 ressources donc utile pour l'UX
- Pattern : hero court + liste 5 cards + CTA footer "Prendre rendez-vous"

**Page individuelle** (`/ressources/[slug]/page.tsx`) :
- Server Component, query par slug
- `generateStaticParams` pour SSG de toutes les ressources publiées
- **Rendu markdown des sections riches** : `shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `testimonial`. Utiliser un renderer markdown (ex. `react-markdown` avec plugins `remark-gfm`)
- **Section "Sources et références"** en fin d'article avec `<CitationBlock />` qui extrait les liens PubMed du contenu (ou d'un champ dédié `citations[]` si le schéma MW-B2 le prévoit)
- **Section FAQ embarquée** (champ `faqJson` parsed par MW-D3) avec schema.org `FAQPage` pour ranker sur les PAA
- **Section "En savoir plus"** avec liens vers :
  - La page service correspondante (`/services/fertilite` etc.) — conversion
  - Les ressources liées via `relatedResources` (autres guides piliers)
  - Les FAQ liées via `relatedFaqs` (si MW-D6 maillage est fait)
- **CTA contextuel** : "Prendre rendez-vous en [pilier]" → `/reserver` avec message pré-rempli si possible
- **Breadcrumb** : Accueil > Ressources > [Titre]

**Composant `<CitationBlock />`** :
- Props : `citations: Citation[]` (type défini en MW-B2)
- Affichage : numérotation, auteurs en italique, titre en guillemets, journal, année, lien cliquable vers PubMed/DOI
- Design sobre, académique, crédible

**Accès libre** : pas de lead magnet, pas de capture email, accès direct au contenu (décision plan §6.4).

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/ressources/page.tsx
- app/(public)/ressources/[slug]/page.tsx
- app/(public)/_components/CitationBlock.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page `/ressources` affiche les ressources publiées
- [ ] La page `/ressources/[slug]` affiche le contenu avec citations scientifiques
- [ ] Le composant `<CitationBlock />` affiche les citations avec auteurs, journal, année
- [ ] Les liens PubMed/DOI dans les citations sont cliquables
- [ ] Lighthouse 95+ sur les pages
- [ ] Schema.org validé
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px — page liste et page individuelle
- **SEO** : meta tags dynamiques, schema.org, breadcrumb
- **Contenu** : les citations scientifiques s'affichent correctement avec liens fonctionnels
- **Navigation** : filtrage par pilier, liens entre ressources et pages services

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Pas de lead magnet / capture email — accès libre (plan §6.4)
- Les citations scientifiques doivent être réelles et vérifiables — pas de références inventées
- Les liens vers `/ressources` sont dans le footer uniquement (amendement A1)
- Mobile-first 375px
- Pas d'emojis
- Composants < 150 lignes

---

## Références

- Plan stratégique §6 (plan ressources complet), §6.2 (types), §6.3 (idées prioritaires), §6.4 (accès libre)
- Amendement A1 (citations scientifiques externes, visibilité progressive)
- MW-B2 (schéma `Ressource` avec type `Citation`)
- MW-B3 (`<SectionHeading />`, `<CtaButton />`)

---

## Notes de planification

- Au lancement, 5 ressources seront disponibles (les 5 fichiers existants). C'est un vrai silo SEO pas une coquille vide.
- Le contenu vient de MW-D3 — ce milestone **ne crée pas de contenu**, juste l'affichage. Si MW-D3 n'est pas terminé au moment d'exécuter MW-D5, l'état "Aucune ressource pour l'instant" est affiché mais ça ne devrait arriver qu'en dev, pas en prod.
- **Rendu markdown** : vérifier si MW-D2 (pages blog) a déjà installé un renderer markdown (`react-markdown`, `remark-gfm`, etc.). Si oui, le réutiliser. Sinon, l'installer ici et le mutualiser.
- **Les citations scientifiques** sont déjà dans le corps du markdown des fichiers source (avec liens PubMed), donc le renderer les affiche naturellement. `<CitationBlock />` est une amélioration future si on veut les lister de manière structurée en fin d'article — pas bloquant pour le lancement.
- **Flag témoignages fictifs** : MW-D3 doit les avoir remplacés par des placeholders `[Témoignage à fournir par Judith]`. Vérifier que ces placeholders s'affichent correctement sans casser la mise en page.
- **Référence des décisions** : voir `docs/migration-wix/DECISIONS_Q1-Q16.md` pour le pattern hub-and-spoke et la résolution de Q14.
