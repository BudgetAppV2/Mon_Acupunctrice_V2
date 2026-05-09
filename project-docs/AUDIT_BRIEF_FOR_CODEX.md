# Brief d'audit — Chantier 1 AEO acupuncturejudith.ca

**Date** : 2026-05-07
**Demandé à** : Codex (audit indépendant)
**Demandé par** : Benoit Archambault (technique) pour Judith Dufour-Savard (acupunctrice)
**Auteur du brief** : Claude (chat web)
**Statut** : 6 commits déployés, prod live

---

## 1. Contexte business

**Judith Dufour-Savard, Ac.** (numéro OAQ A-008-24) est une acupunctrice au Québec. Elle pratique principalement à La Source en Soi (Rosemont, Montréal) du lundi au vendredi sauf le mercredi, et à Éden Yoga Pilates (Repentigny) le mercredi. Spécialités : fertilité, grossesse & périnatalité, pédiatrie, acupuncture sociale.

Site : `https://www.acupuncturejudith.ca` (Next.js 15 / Vercel, migré depuis Wix début 2026).
Repo : `github.com/BudgetAppV2/Mon_Acupunctrice_V2`.

**Enjeu** : faire monter la visibilité de Judith dans (a) Google SEO local Montréal/Rosemont, (b) AEO — citations dans les réponses des LLM (ChatGPT, Claude, Perplexity, Google AI Overviews) pour des requêtes type *"acupunctrice fertilité Montréal"*, *"acupuncture FIV Rosemont"*, etc.

**Contraintes déontologiques** : l'OAQ encadre la pratique professionnelle. Vocabulaire à risque : *"améliore"*, *"soulage"*, *"guérit"*, *"toutes les conditions"*, *"spécialiste de"* (titre régulé). Vocabulaire préféré : *"accompagne"*, *"peut soutenir"*, *"en complément du suivi médical"*.

## 2. Intention du Chantier 1

**Hypothèse de travail** : pour qu'un LLM cite Judith de façon fiable et constante, il faut qu'il rencontre les mêmes informations vérifiables sur **plusieurs sources convergentes** (le site officiel + Wikidata + GBP + LSSI + LinkedIn + AAQ + …). Ce qu'on appelle un *proof graph* d'entité.

**Le travail s'organise en 3 chantiers** :

- **Chantier 1 — Cohérence interne du proof graph** *(quasi-livré aujourd'hui)*. Aligner toutes les sources que Benoit contrôle (le site et ses fichiers techniques) sur une seule version de vérité de l'identité de Judith. Aligner ensuite les sources externes contrôlables (LinkedIn, Wikidata, profils sociaux, page équipe LSSI) avec les bios canoniques.

- **Chantier 2 — Acquisition d'avis Google sur la fiche GBP de Judith** *(débloqué aujourd'hui, pas démarré)*. Objectif 20-25 avis spécifiques à Judith en 90 jours, via affiche QR code dans le cabinet (sollicitation passive). Email de demande d'avis individuel suspendu en attente de clarification déontologique de l'OAQ.

- **Chantier 3 — Pages décisionnelles de longue traîne** *(à venir)*. Créer des pages spécialisées type `/services/acupuncture-fiv-montreal` qui captent des intentions précises confirmées par GSC (ex: "acupuncture grossesse" 21 impressions, "acupuncture fertilité" seulement 2 impressions sur 3 mois → trou à combler).

**Source of Truth (SOT)** : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md` est le document de référence éditorial humain (markdown, versionné v1.7). Il contient l'identité canonique, les NAP, les bios à 3 longueurs, les piliers, le vocabulaire OAQ-friendly, et le tableau de version.

**Règle critique de cohérence AEO** : ne jamais déclarer dans le schema JSON-LD, `llms.txt`, `llms-full.txt`, ou les bios une spécialité dont la page n'est pas publiée. Les LLMs détectent l'incohérence "ce site dit traiter X" + "la page X retourne 404" et ça fait perdre la crédibilité de toutes les autres affirmations. Spécifiquement : la **ménopause** est une spécialité émergente que Judith pratique mais dont la page n'est pas créée — interdiction de la mentionner dans les sources externes.

## 3. Architecture finale du système (après refactor du jour)

```
┌────────────────────────────────────────────────────────────────────┐
│  SOT (humain, éditorial)                                           │
│  project-docs/02_ROADMAP/content-strategy/                         │
│  ENTITY_SOURCE_OF_TRUTH.md  (v1.7)                                 │
│                                                                    │
│  → Documentation primaire en markdown YAML.                        │
│  → Versionné, avec tableau de changelog.                           │
│  → Lu par les humains et les agents IA pour comprendre l'identité. │
└─────────────────────────┬──────────────────────────────────────────┘
                          │ (synchronisation manuelle)
                          ▼
┌────────────────────────────────────────────────────────────────────┐
│  Module canonique runtime (machine, exécutable)                    │
│  lib/entity-canonical.mjs    + lib/entity-canonical.d.ts           │
│                                                                    │
│  Exporte : ENTITY, PAST_AFFILIATIONS, PILIERS,                     │
│            EMERGING_SPECIALTIES, NAP, CONTACT, SAMEAS,             │
│            PRICING, BIOS                                           │
│                                                                    │
│  → Source de vérité unique consommée par TOUT le code.             │
│  → JS ESM (.mjs) pour être lisible par .ts/.tsx ET par scripts     │
│    Node ESM purs.                                                  │
│  → Le .d.ts adjacent fournit le typing strict aux consommateurs    │
│    TypeScript.                                                     │
└─────────────┬──────────────────┬─────────────────┬─────────────────┘
              │                  │                 │
              ▼                  ▼                 ▼
┌─────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│ JSON-LD (Schema.org)│ │ rdvUrl.ts        │ │ Scripts générateurs  │
│ GlobalJsonLd.tsx    │ │ (URLs réservation│ │ generate-llms.mjs    │
│                     │ │  GoRendezVous)   │ │ generate-llms-full.  │
│ Person + Medical    │ │                  │ │   mjs                │
│ Business + 2 Place  │ │ Champs métier    │ │                      │
│ + WebSite           │ │ locaux conservés │ │ Produit :            │
│                     │ │ (services flags, │ │ public/llms.txt      │
│ aggregateRating et  │ │ grvSlug, etc.)   │ │ public/llms-full.txt │
│ medicalSpecialty    │ │                  │ │                      │
│ enum gardés en dur  │ │                  │ │                      │
│ avec commentaires.  │ │                  │ │                      │
└─────────────────────┘ └──────────────────┘ └──────────────────────┘
```

**Décisions architecturales clés** :

1. **`.mjs` plutôt que `.ts`** parce que les scripts Node (générateurs `llms.txt`/`llms-full.txt`) tournent hors Next.js et n'ont pas de transpileur TS disponible. Un `.mjs` pur est lisible par les 3 types de consommateurs (TSX, TS, ESM Node) sans build step.

2. **`.d.ts` voisin** plutôt que JSDoc inline : permet du typage strict (`readonly`, interfaces) avec un IDE TypeScript sans coût runtime ni build step.

3. **`as const` retiré de `rdvUrl.ts`** parce qu'il devient incompatible quand les valeurs sont importées depuis un module externe (TypeScript ne peut pas figer les littéraux à travers une frontière de module sans déclarer explicitement le type). L'objet `CLINICS` reste typé via les types du `.d.ts`. À auditer : est-ce que ça casse des consommateurs qui dépendaient du narrowing ?

4. **JSON-LD : aggregateRating gardé en dur**. Données externes (Google Reviews de la clinique LSSI globalement, pas de Judith). Snapshot 4.9/5 sur 1215 avis en mai 2026, à actualiser périodiquement ou retirer une fois que la fiche GBP de Judith elle-même atteindra 20+ avis.

5. **JSON-LD : `medicalSpecialty` en anglais** (`['Acupuncture', 'Integrative Medicine']`). Schema.org expose une enum `MedicalSpecialty` en anglais ; les libellés français vont dans `knowsAbout` et `availableService`.

6. **`PILIERS` vs `EMERGING_SPECIALTIES`**. Liste séparée pour formaliser la règle critique : seuls les piliers sont injectés dans schema.knowsAbout, schema.availableService, llms.txt et llms-full.txt. Les `EMERGING_SPECIALTIES` (ménopause aujourd'hui) sont volontairement exclus du build de tous les fichiers exposés. Quand une spécialité émerge, on déplace l'entrée d'une liste à l'autre.

## 4. Travail accompli aujourd'hui (6 commits)

| # | SHA | Quoi | Fichiers |
|---|-----|------|----------|
| 1 | `05b2869` | Création du SOT (Chantier 1.1) | `ENTITY_SOURCE_OF_TRUTH.md` |
| 2 | `85f0809` | Alignement SOT v1.5 (1ère passe sur les sources internes) | `GlobalJsonLd.tsx` (OAQ identifier, GBP sameAs, NAP Éden), `public/llms.txt` créé bilingue, paragraphe AAQ ajouté à `AboutParcoursSection.tsx` |
| 3 | `23866ed` | Fix build Vercel | `next.config.mjs` (`outputFileTracingExcludes` pour exclure 686 MB de sources EPS qui faisaient gonfler la fonction serverless `api/cover/generate` au-dessus de la limite 300 MB) |
| 4 | `9a3a7be` | Cleanup redirects legacy Wix | `next.config.mjs` (`/blog/categories/:slug*` → `/blog`) |
| 5 | `0a7a4ae` | Alignement `llms-full.txt` avec SOT v1.6 | `generate-llms-full.mjs` patché (mention ménopause retirée, OAQ ajouté, NAP canoniques, vocabulaire OAQ-friendly, "Mère de trois enfants" retiré pour ne pas pollue la fiche pro indexée) |
| 6 | `0b268b7` | Refactor architectural — module canonique partagé | `lib/entity-canonical.mjs` + `.d.ts` créés ; `GlobalJsonLd.tsx`, `rdvUrl.ts`, `generate-llms-full.mjs` migrés ; nouveau `generate-llms.mjs` ; les 2 fichiers `llms*.txt` régénérés ; SOT v1.7 |

**Divergence géo LSSI tranchée** : `rdvUrl.ts` indiquait `45.5501, -73.5832`, le SOT et JSON-LD `45.5408, -73.5823`. La latitude 45.5501 plaçait LSSI à environ 1 km au nord de la rue Beaubien Est (incohérent géographiquement). Tranché à `45.5408, -73.5823` partout.

**Page `/a-propos`** enrichie d'un paragraphe en 1ère personne sur l'engagement passé de Judith au CA de l'Association des Acupuncteurs du Québec (AAQ). L'AAQ apparaît comme expérience passée dans les bios mais n'est PAS dans `schema.memberOf` (mandat terminé).

**Page `public/llms.txt`** créée à partir de zéro (n'existait pas avant ce matin malgré une mention dans `CLAUDE.md`). Format conforme à la spec llmstxt.org : index Markdown court bilingue FR principal + résumé EN.

## 5. Baseline GSC (mesurée ce matin avant déploiement)

Trois mois glissants, propriété `https://www.acupuncturejudith.ca/` :
- 18 pages indexées / 9 non-indexées (8 fantômes Wix legacy redirects 308 + 1 vraie 404 sur catégorie blog Wix)
- 46 clics, 755 impressions, CTR 6.1%, position moyenne 20.2
- Top requête : `judith acupuncture` (37 impressions, 4 clics) — branding fonctionne
- Trou observé : `acupuncture fertilité` (2 impressions sur 3 mois) — confirme l'urgence du Chantier 3 (page décisionnelle FIV)
- Force : grossesse/accouchement domine 8+ requêtes top — cohérent avec le plan éditorial

`robots.txt` autorise explicitement `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `OAI-SearchBot`, `ChatGPT-User`. `app/sitemap.ts` est dynamique (Firestore-backed pour blog + ressources, pages statiques en dur, revalidate 3600s).

---

## 6. Questions ouvertes à challenger

Voici précisément les points sur lesquels j'aimerais un avis frais.

### 6.1 Le pattern `.mjs` + `.d.ts` est-il le bon ?

Alternatives considérées et rejetées :
- **TS pur** : impossible à importer depuis un script Node ESM sans build step
- **JSON pur** : pas de commentaires, pas de logique légère, pas de réutilisation de chaînes (impossible de définir `phoneInternational` à partir de `phoneLocal` par ex.)
- **`.mjs` avec JSDoc** : possible, mais `.d.ts` offre du typing plus strict pour les consommateurs TSX

Question : est-ce que cette friction (`.d.ts` à maintenir en parallèle du `.mjs`) vaut vraiment le coup vs. une approche TS pur où on accepterait que les scripts soient en `.ts` et qu'on les lance avec `tsx` ou `ts-node` ?

### 6.2 La discipline humaine SOT ↔ entity-canonical va-t-elle tenir ?

On a maintenant DEUX sources :
- `ENTITY_SOURCE_OF_TRUTH.md` (humain, doc primaire)
- `lib/entity-canonical.mjs` (machine, code primaire)

Les deux doivent rester synchronisés à la main. Risque de divergence à long terme. Faut-il :
- (a) Générer le `.mjs` à partir du SOT par un script de parsing (mais le SOT est en YAML+markdown narratif, pas trivial)
- (b) Inverser : faire du `.mjs` la source unique et générer le SOT en lecture seule (mais on perd la richesse narrative humaine)
- (c) Garder le statu quo et compter sur la discipline + des tests qui vérifient l'alignement (lesquels ?)

### 6.3 Schema.org JSON-LD — qualité du graphe ?

Le `GlobalJsonLd.tsx` produit 4 entités : `WebSite`, `Person`, `MedicalBusiness` (cumulé `LocalBusiness`), et 2 `Place` imbriqués. À auditer :

- Est-ce que le typage `MedicalBusiness` + `LocalBusiness` est correct sémantiquement ? Faut-il préférer `MedicalClinic` ?
- L'`employee` du business pointe vers Judith (via `@id`). Est-ce qu'on devrait inverser la relation et avoir `worksFor` sur Judith ?
- L'`aggregateRating` est attaché au `Place` LSSI globalement (4.9/5, 1215 avis) parce que les avis sont sur la clinique, pas sur Judith spécifiquement. Est-ce qu'un LLM va comprendre que ces avis ne reflètent pas Judith ? Ou faut-il retirer en attendant les avis Judith spécifiques (Chantier 2) ?
- `medicalSpecialty: ['Acupuncture', 'Integrative Medicine']` — sont-ce les bons termes de l'enum schema.org ? `Integrative Medicine` est-il reconnu ?
- Est-ce qu'on devrait ajouter `MedicalProcedure` ou `MedicalTherapy` plus richement structuré (avec `bodyLocation`, `relevantSpecialty`, etc.) au lieu d'une simple liste de noms ?
- Est-ce que `knowsAbout` + `availableService` + `medicalSpecialty` est redondant ? Ou complémentaire ?

Le fichier complet à lire : `app/(public)/_components/GlobalJsonLd.tsx`.

### 6.4 Vocabulaire OAQ-friendly — trop conservateur ?

Le SOT §8 et `generate-llms-full.mjs` utilisent un vocabulaire prudent : *"peut soutenir"*, *"accompagne"*, *"en complément du suivi médical"*. Bons points pour la déontologie, mais est-ce qu'on perd en pertinence SEO/AEO en évitant des verbes plus directs comme *"améliore"*, *"réduit"*, *"traite"* ?

À auditer : lire `public/llms-full.txt` (10 KB, ~1900 tokens) et juger si un LLM va vraiment retenir Judith comme experte forte vs. concurrents qui parlent en termes plus affirmatifs.

### 6.5 Couplage de `rdvUrl.ts` au module canonique

`rdvUrl.ts` consomme maintenant NAP/CONTACT depuis `entity-canonical.mjs`. Le retrait du `as const` et l'introduction d'un import a-t-il introduit des risques de :
- type narrowing perdu chez les consommateurs ?
- import cycle (si jamais entity-canonical importait quelque chose qui importait rdvUrl) ?
- bundle size augmenté côté client (les bios longues sont dans le module — sont-elles tree-shakable ?) ?

Le bundle Next.js après `npm run build` est passé sans warning, mais une analyse plus fine n'a pas été faite.

### 6.6 Stratégie AEO — angle aveugle ?

On a couvert : schema JSON-LD propre, `llms.txt` + `llms-full.txt`, NAP cohérent, robots.txt friendly aux LLMs, Wikidata présent, vocabulaire prudent. Qu'est-ce qu'on rate ?

Idées non implémentées sur lesquelles avoir un avis :
- **OpenGraph riche** + Twitter Card avec données structurées en plus du JSON-LD ?
- **`schema.org/Article` ou `MedicalWebPage`** sur les pages de ressources/blog ?
- **FAQ schema** sur la page FAQ (probablement déjà fait mais à vérifier) ?
- **`reviewRating` individuels** au lieu juste du `aggregateRating` ?
- **Markup Review/Rating dans les bios** (déconseillé par OAQ ?) ?
- **Hreflang** ? Pour l'instant le site est uniquement en français mais le `llms.txt` est bilingue. Cohérent ou bizarre ?

## 7. Fichiers clés à lire pour l'audit

Si Codex a 30 minutes, lire dans cet ordre :

1. **`project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`** — le SOT v1.7 (doc primaire, ~10 KB). Donne le contexte éditorial complet : identité, NAP, bios à 3 longueurs, 4 piliers, vocabulaire OAQ, profils externes, règle critique.

2. **`lib/entity-canonical.mjs`** + **`lib/entity-canonical.d.ts`** — module canonique runtime + types (~330 lignes au total).

3. **`app/(public)/_components/GlobalJsonLd.tsx`** — schema JSON-LD global injecté dans le layout public.

4. **`public/llms.txt`** (5 KB, ~800 tokens) — index pour LLMs, bilingue.

5. **`public/llms-full.txt`** (10 KB, ~1900 tokens) — contenu complet pour ingestion LLM.

6. **`scripts/generate-llms.mjs`** + **`scripts/generate-llms-full.mjs`** — générateurs.

7. **`lib/utils/rdvUrl.ts`** — adaptateur entre NAP canonique et URLs de réservation.

8. **`next.config.mjs`** — redirects (Wix legacy + canonicalisation www) + `outputFileTracingExcludes` pour le build.

9. **`public/robots.txt`** + **`app/sitemap.ts`** — config crawlers.

10. **`CLAUDE.md`** (racine du repo) — règles globales pour les agents IA travaillant sur ce repo.

---

## 8. Format de réponse souhaité

Idéalement Codex me retourne :

- **Verdict global** : 1 phrase (✅ Solide, 🟡 Acceptable mais X, 🔴 Refondre Y)
- **Top 3 forces** du système
- **Top 5 risques / faiblesses** par priorité
- **Recommandations concrètes** : pour chaque faiblesse, une action proposée avec effort estimé
- **Avis sur les questions ouvertes §6.1 à §6.6** spécifiquement
- **Quick wins** que Codex repère et qu'on aurait manqués

Pas besoin de complaisance — l'objectif est de durcir le système, pas de se rassurer.

---

## 9. Pour aller plus loin (contexte projet)

- Le repo héberge aussi un **Hub admin** privé (Next.js dans le même app, routes `/blogue`, `/editeur`, `/contenu`, `/login`, etc.) bloqué dans robots.txt. C'est une PWA pour Judith pour gérer ses contenus social media et le blog. Hors scope de l'audit AEO mais utile à savoir si Codex tombe sur ces fichiers.

- Le **Chantier 2** (acquisition d'avis Google) attend une clarification déontologique de l'OAQ avant l'envoi nominatif d'emails de demande d'avis. Plan B : affiche QR code dans le cabinet pointant vers `https://g.page/r/CQt_EeseQ8U_EBM/review` (sollicitation passive).

- Le **Chantier 3** (pages décisionnelles) attendra l'OAQ aussi parce que ça touche à du vocabulaire potentiellement à risque ("acupuncture FIV Montréal" — peut-on titrer ainsi ?). À discuter avec Judith avant de coder.

- Une **mise en relation avec Annie (propriétaire LSSI)** est en attente pour pouvoir mettre à jour la fiche Lumino de Judith (Sun Life), corriger la page équipe LSSI, et obtenir éventuellement le contact du référent SEO/web de la clinique.

Fin du brief.
