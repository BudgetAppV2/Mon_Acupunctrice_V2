# Plan éditorial SEO/GEO — acupuncturejudith.ca v2

**Projet** : Migration Wix → Vercel / Next.js (Mon Acupunctrice Hub V2)
**Phase** : 1 — Stratégie éditoriale
**Version** : 0.3 (post-scouting — 4 piliers, intégration des découvertes terrain, Phase 0 infra, architecture technique validée)
**Date** : 13 avril 2026
**Auteur** : Benoit + Claude (session de planification)

---

## Comment lire ce document

Ce document est le **plan fondateur** de la migration du site de Judith. Il est structuré pour être :

1. **Exécutable** sur les sections où on a déjà assez d'information pour décider
2. **Ouvert** sur les sections marquées `[MISSION CC]` qui nécessitent un travail de recherche ou d'inventaire par Claude Code
3. **Itératif** — il sera mis à jour au fur et à mesure que les missions reviennent avec des données

Les sections `[MISSION CC]` sont des briefs prêts à copier-coller dans Claude Code. Chaque mission a un objectif clair, des livrables précis, et les sources à consulter.

---

## 1. Contexte & objectifs

### 1.1 Situation actuelle

Judith Dufour-Savard opère un cabinet d'acupuncture à Rosemont (Montréal) via la clinique La Source en Soi. Son site actuel `acupuncturejudith.ca` est hébergé sur Wix et compte **27 URLs indexables** : 8 pages statiques, 11 articles de blog (co-écrits avec Claire Thomas, rédactrice web spécialisée en périnatalité), 6 FAQ dynamiques, et 2 pages utilitaires. Le site est fonctionnel mais :

- Coûte cher pour ce qu'il offre (~25-35 $/mois)
- Offre un contrôle SEO limité
- **Rend son contenu 100 % côté client** (Wix Thunderbolt) — le HTML initial ne contient pas le contenu, ce qui pénalise lourdement l'indexation. La migration vers Next.js SSG/SSR est un **gain SEO technique immédiat** avant même toute amélioration éditoriale
- N'est pas intégré au reste de l'écosystème numérique de Judith
- **N'a quasi aucun historique SEO à préserver** : une seule position organique notable (article nausées de grossesse en position ~6 sur une requête nationale sans géolocalisation). D'où la décision de traiter cette migration comme **une création de site neuf** plutôt qu'une migration avec enjeu de préservation SEO

**Un atout caché existe toutefois** : un backlink autoritaire depuis `lasourceensoi.com/equipe/judith-dufour-savard/` pointe actuellement vers le site Wix. Ce lien **doit être préservé** lors de la migration (ou mis à jour vers la nouvelle URL le jour du switch).

### 1.2 Écosystème numérique existant

- **Mon Acupunctrice Hub V2** : application Next.js 15 / Firebase / Vercel qui pilote déjà la création de contenu, la publication multi-plateforme (Instagram, Facebook, YouTube), l'éditeur vidéo, l'éditeur d'image Fabric.js, l'intégration blog Wix
- **Go Rendez-Vous** : système de prise de rendez-vous externe — `gorendezvous.com/lasourceensoi` (Judith employeeId 7556837)
- **Réseaux sociaux** : Instagram `@mon_acupunctrice`, Facebook, YouTube — alimentés par le Hub
- **Google Business Profile** : Judith n'a pas de fiche GBP en propre. La clinique **La Source en Soi** possède une fiche GBP **exceptionnelle : 4,9/5 avec ~1 215 avis Google**. Pour contexte, le leader SEO montréalais (Synergek) a ~425 avis. C'est un actif de réputation massif — la stratégie d'emprunt de réputation est non seulement validée, elle est amplifiée par cette découverte
- **Backlink existant** : `lasourceensoi.com/equipe/judith-dufour-savard/` — lien autoritaire depuis le domaine de la clinique vers le site de Judith, à préserver absolument
- **Lumino Health (Sun Life)** : fiche existante avec seulement 3 avis — actif faible, ne sera pas exploité comme source principale de social proof
- **DNS** : confirmé hébergé chez Wix (`ns8.wixdns.net`, `ns9.wixdns.net`) — transfert vers un registrar externe (Cloudflare) à planifier en **Phase 0** avant toute migration du site
- **Contenu SEO déjà produit** : 6 FAQ + 5 pages piliers locales rédigées et validées dans `scripts/seo-geo/` du repo Hub V2 — accélérateur majeur pour le lancement

### 1.3 Objectifs de la migration

**Objectif principal** : Augmenter et optimiser le SEO et le référencement local (GEO) pour générer un flux constant de nouvelles patientes via recherche organique, avec conversion vers la prise de rendez-vous sur Go Rendez-Vous.

**Objectifs secondaires** :

1. Réduire les coûts d'hébergement (économie estimée ~300-400 $/an)
2. Unifier l'écosystème numérique dans un seul stack contrôlé par Benoit
3. Permettre à Judith de gérer le contenu FAQ et ressources directement depuis l'admin du Hub
4. Automatiser la fraîcheur du contenu via cron Vercel pour maintenir le classement SEO dans le temps
5. Intégrer le rôle d'influenceuse de Judith (créatrice de contenu, voix publique) au parcours de conversion
6. Mettre en avant le positionnement différenciant d'**acupuncture sociale** comme angle éditorial unique sur le marché montréalais — le scouting concurrentiel confirme que **personne à Montréal ne combine spécialisation fertilité/grossesse + tarification solidaire**
7. Exploiter l'ouverture en **acupuncture pédiatrique** à Montréal — 3 articles existants, niche concurrentielle quasi-vide, PAA actives sur Google, positionnement Judith + La Source en Soi idéal

### 1.4 Principes directeurs

- **Mobile-first** : la majorité des recherches locales se font sur mobile
- **Contenu avant forme** : la qualité éditoriale prime sur les fioritures visuelles
- **Conversion contextuelle** : chaque page a un CTA vers Go Rendez-Vous adapté à son contexte
- **Autorité par l'expertise** : positionner Judith comme référence sur ses trois piliers
- **Accessibilité réelle** : le positionnement d'acupuncture sociale doit se refléter dans le ton, pas juste dans une mention tarifaire

---

## 2. Positionnement & proposition de valeur

### 2.1 Qui est Judith (narratif de marque)

Judith est acupunctrice à Rosemont avec une triple identité professionnelle qui doit transpirer dans le site :

1. **Praticienne experte** sur trois piliers — fertilité, grossesse et périnatalité, acupuncture sociale
2. **Voix publique et éducatrice** sur Instagram, Facebook, YouTube — partage des connaissances, démystifie l'acupuncture, rend la pratique accessible
3. **Militante de l'accessibilité au soin** — pratique une tarification solidaire où le/la patient·e choisit le montant qu'il/elle peut payer, dans une logique de démocratisation de l'accès à l'acupuncture

Cette triple identité est un **atout différenciant majeur**. La plupart des acupuncteurs montréalais se positionnent uniquement comme praticiens. Judith a une dimension éducative publique ET une dimension sociale engagée — deux angles qui peuvent nourrir le SEO et la confiance des prospects.

### 2.1b Ancrage dans une clinique spécialisée

À ces trois dimensions s'ajoute un **quatrième ancrage** qui doit être mis en avant sur le site : Judith exerce à **La Source en Soi**, clinique spécialisée en fertilité et périnatalité à Rosemont. Cet ancrage est stratégique pour plusieurs raisons :

- **Crédibilité par association** : être membre d'une clinique spécialisée renforce le positionnement expert sur les piliers 1 (fertilité) et 2 (grossesse & périnatalité)
- **Réputation empruntée** : La Source en Soi a déjà une fiche Google Business Profile bien établie avec de bons avis. Plutôt que de partir de zéro avec une fiche GBP pour Judith, on capitalise sur celle existante de la clinique
- **Cohérence NAP** : éviter de fragmenter le signal local avec deux fiches géographiquement identiques qui se concurrenceraient
- **Réassurance funnel** : la friction de Go Rendez-Vous (qui atterrit sur la page de la clinique, où il faut sélectionner Judith manuellement) se transforme en signal de confiance si la relation site / clinique est bien expliquée

Conséquence éditoriale : toutes les pages du site doivent **nommer explicitement** "La Source en Soi" dans leur contenu et leurs balises. Ce n'est pas un détail, c'est à la fois un levier SEO et un levier de conversion.

### 2.2 Personas cibles

Personas provisoires — à valider et raffiner avec données réelles :

**Persona A — "Clara, en parcours fertilité"**
- 30-38 ans, en couple, cherche à concevoir depuis 6-18 mois
- Possiblement suivie en clinique de fertilité, cherche des approches complémentaires
- Recherches types : *"acupuncture fertilité Montréal"*, *"acupuncture FIV"*, *"préparer corps conception"*
- Attentes : expertise démontrée, tonalité rassurante, science + ouverture

**Persona B — "Émilie, enceinte"**
- 28-40 ans, enceinte (trimestre variable) ou post-partum
- Symptômes : nausées, douleurs lombaires, fatigue, anxiété
- Recherches : *"acupuncture grossesse Montréal"*, *"nausées premier trimestre naturel"*, *"déclenchement acupuncture"*
- Attentes : sécurité, expérience avec femmes enceintes, proximité géographique

**Persona C — "Marie-Pier, communauté ciblée par l'acupuncture sociale"**
- Profil plus hétérogène : personnes à revenu limité, étudiant·es, travailleur·ses précaires, aîné·es, personnes en marge du système de santé privé
- Découvre probablement Judith via bouche-à-oreille, réseaux sociaux, ou organismes communautaires
- Recherches : *"acupuncture pas cher Montréal"*, *"acupuncture solidaire"*, *"tarif social acupuncture"*
- Attentes : pas de jugement, accessibilité financière explicite, accueil chaleureux

**Persona D — "Sophie, en quête de bien-être"** *(persona secondaire)*
- 25-55 ans, stress, fatigue, douleurs chroniques
- Rejoint l'un des trois piliers tangentiellement ou arrive via contenu éducatif général
- Recherches plus variées, moins ciblées — capture via blog et ressources

> `[MISSION CC]` — Valider et raffiner ces personas avec données réelles. Voir section 10.

### 2.3 Différenciateurs vs concurrence

> `[MISSION CC]` — Analyse concurrentielle nécessaire. Voir section 10.

Hypothèses de différenciation à valider :

- **Approche tarifaire solidaire** (probablement unique ou très rare à Montréal)
- **Expertise fertilité + grossesse** combinée (commun mais positionnement possible)
- **Présence de contenu éducatif** actif et de qualité (Reels, blog)
- **Localisation Rosemont** (bassin de clientèle spécifique, moins saturé que Plateau/Mile-End)

---

## 3. Piliers de contenu & mots-clés

### 3.1 Structure des quatre piliers

Les quatre piliers stratégiques du site sont :

**Pilier 1 — Fertilité**
Sous-thèmes provisoires :
- Acupuncture et fertilité naturelle
- Acupuncture et FIV / PMA
- Préparation préconceptionnelle (homme et femme)
- Troubles spécifiques : SOPK, endométriose, aménorrhée, qualité ovocytaire
- Cycle et phases

Positionnement concurrentiel : pilier difficile (Clinique Synergek domine le SEO sur "acupuncture fertilité Montréal", Sino-Santé sur "FIV"). Stratégie : viser les long-tail et le créneau "fertilité + Rosemont + tarif solidaire" qui est inoccupé.

**Pilier 2 — Grossesse & périnatalité**
Sous-thèmes provisoires :
- Premier trimestre : nausées, fatigue, stabilisation
- Deuxième trimestre : énergie, confort
- Troisième trimestre : positionnement bébé, préparation accouchement, déclenchement
- Post-partum : récupération, allaitement, baby blues, fatigue

Positionnement concurrentiel : La Source en Soi apparaît déjà dans le top 1 sur "acupuncture grossesse Rosemont" — la stratégie d'emprunt de réputation a un ancrage naturel dans les SERPs.

**Pilier 3 — Acupuncture sociale**
Sous-thèmes provisoires :
- Qu'est-ce que l'acupuncture sociale ? (manifeste)
- Comment fonctionne la tarification solidaire (échelle, logique, pour qui)
- Démystification (enlever la honte de choisir un tarif bas)
- Acupuncture sociale chez une praticienne spécialisée vs centre communautaire
- Engagement dans les organismes / quartier

Positionnement concurrentiel : terme confirmé comme réellement recherché au Québec (Radio-Canada a publié un article de fond). Concurrents : Acupuncture Sociale Hochelaga, AcuPop Montréal, SLAB Rosemont — tous sont des centres communautaires, pas des praticiennes spécialisées. **La niche "praticienne spécialisée fertilité/périnatalité qui pratique aussi le tarif solidaire" est unique.**

**Pilier 4 — Acupuncture pédiatrique** *(nouveau — confirmé post-scouting)*
Sous-thèmes provisoires :
- Coliques et troubles digestifs du nourrisson
- Sommeil du bébé et du jeune enfant
- Stress, anxiété et troubles émotionnels chez l'enfant
- Immunité et santé générale pédiatrique
- Sécurité et confort : comment se passe une séance avec un enfant

Positionnement concurrentiel : **niche quasi-vide à Montréal** selon le scouting (R3). Quelques mentions génériques chez des praticiens mais aucune page dédiée optimisée, aucun contenu FAQ structuré. Le contenu existant (3 articles blog : coliques, stress enfant, pédiatrie générale) donne une longueur d'avance immédiate. Les PAA Google sur ces sujets sont actives et inexploitées localement.

**Pilier transversal — Autorité locale Montréal / Rosemont**
Ce n'est pas un pilier de contenu à part entière mais une dimension à tisser dans tous les contenus : mentions géographiques, références aux quartiers, ancrage local, mention systématique de La Source en Soi et de ses 1 215 avis Google.

### 3.2 Stratégie mots-clés

> **Post-scouting (R2)** : les hypothèses initiales de mots-clés sont globalement validées. Judith est absente du top 10 pour 6/8 des requêtes testées (confirmation "création SEO pas migration"). Le terme "acupuncture sociale" est réellement recherché au Québec (Radio-Canada a couvert le sujet). Un outil SEO payant (Ubersuggest Pro, ~30 $ pour 1 mois) sera utilisé en Phase 0 pour obtenir les volumes réels.

Typologie de mots-clés à cibler :

**Head terms** (forte concurrence, gros volume)
- *acupuncture Montréal*
- *acupuncture Rosemont*
- *acupuncture fertilité*
- *acupuncture grossesse*

**Long-tail informationnels** (faible concurrence, intentions précises)
- *acupuncture pour nausées de grossesse est-ce efficace*
- *combien de séances d'acupuncture pour tomber enceinte*
- *acupuncture avant transfert embryon*
- *acupuncture déclenchement accouchement 41 semaines*
- *acupuncture coliques nourrisson*
- *acupuncture stress enfant école*

**Long-tail locaux** (sweet spot SEO/GEO)
- *acupuncture fertilité Rosemont*
- *acupunctrice femme enceinte Montréal est*
- *clinique acupuncture tarif social Montréal*
- *acupuncture pédiatrique Montréal* (niche ouverte)

**Keywords "acupuncture sociale"** — terrain partiellement occupé mais différenciation forte
- *acupuncture tarif solidaire Montréal*
- *acupuncture accessible Montréal*
- *acupuncture pas cher Montréal* (requête transactionnelle directe)
- *acupuncture communautaire Rosemont*

**Keywords pédiatriques** — niche ouverte post-scouting
- *acupuncture bébé coliques*
- *acupuncture enfant stress Montréal*
- *acupuncture nourrisson sommeil*
- *acupuncture pédiatrique Rosemont*

**Keywords de marque** (défensifs)
- *Judith Dufour-Savard*
- *acupuncture Judith*
- *Mon Acupunctrice*
- *La Source en Soi acupuncture*

**Keywords "combien coûte"** — requêtes transactionnelles à capter via la page `/tarifs`
- *combien coûte acupuncture Montréal*
- *prix séance acupuncture Rosemont*
- *tarif acupuncture solidaire*

Les PAA (People Also Ask) identifiées lors du scouting représentent **10+ articles potentiels** que personne ne couvre localement de manière structurée (schema.org FAQPage) — c'est la veine principale de contenu à exploiter.

### 3.3 Intention de recherche par pilier

Pour chaque pilier, le contenu doit couvrir les 4 intentions classiques :

1. **Informationnel** — "Qu'est-ce que…", "Comment…" → articles de blog, FAQ
2. **Navigationnel** — "Judith acupuncture Rosemont" → page À propos, page contact
3. **Commercial** — "Meilleur…", "Avis sur…" → témoignages, page service
4. **Transactionnel** — "Prendre RDV…", "Prix…" → CTAs Go Rendez-Vous, page tarifs

---

## 4. Arborescence du site

### 4.1 Structure proposée

```
/                                    (Homepage — v4 portée)
│
├── /a-propos                        (Bio Judith + approche + formation + mention La Source en Soi)
│
├── /services                        (Vue d'ensemble des 4 piliers)
│   ├── /services/fertilite          (Landing SEO fertilité)
│   ├── /services/grossesse          (Landing SEO grossesse & périnatalité)
│   ├── /services/pediatrie          (Landing SEO pédiatrique — 4e pilier)
│   └── /services/acupuncture-sociale (Landing SEO + manifeste)
│
├── /blog                            (Liste articles)
│   └── /blog/[slug]                 (Article individuel)
│
├── /faq                             (Vue d'ensemble FAQ)
│   ├── /faq/fertilite
│   ├── /faq/grossesse
│   ├── /faq/pediatrie
│   ├── /faq/acupuncture-sociale
│   └── /faq/seance                  (À quoi s'attendre, logistique)
│
├── /ressources                      (Guides, check-lists, téléchargeables)
│   └── /ressources/[slug]
│
├── /tarifs                          (Transparence tarifaire + explicitation modèle solidaire + cible SEO "combien coûte")
│
├── /contact                         (Coordonnées, plan, horaires)
│
└── /reserver                        (Landing de confiance → CTA Go Rendez-Vous, mentionne 4,9/5 · 1 200+ avis)
```

**Pages secondaires à considérer** :
- `/dans-les-medias` ou `/communaute` — pour le rôle d'influenceuse (voir section 7)
- `/temoignages` — social proof (alimenté par les avis Google La Source en Soi)
- `/mentions-legales`, `/politique-confidentialite` — obligatoires

**Décision sur `/bienfaits` (page existante sur Wix)** : le contenu est structuré en format FAQ. **Recommandation : démanteler cette page** et redistribuer son contenu dans les FAQ par pilier (`/faq/fertilite`, `/faq/grossesse`, etc.). Cela évite une page "grab-all" non thématisée et renforce les clusters par pilier.

### 4.2 Logique de navigation

- **Header principal** : À propos, Services (mega-menu 4 piliers), Blog, FAQ, Ressources, **Réserver** (bouton distinct, couleur accent)
- **Footer** : colonnes Services / Contenu (blog, FAQ, ressources) / Contact (NAP, horaires, map) / Réseaux sociaux
- **CTA sticky mobile** : bouton "Réserver" toujours visible en bas d'écran sur mobile

### 4.3 Stratégie URL

- URLs en français, hyphen-separated, lowercase
- Pas d'accents (ASCII only) pour éviter les problèmes d'encodage
- Structure : `/category/slug` plutôt que `/slug` plat, pour la lisibilité et le contexte SEO
- Exceptions : pages uniques comme `/a-propos`, `/contact`, `/reserver` restent à la racine

### 4.4 Stratégie de maillage interne

Le maillage interne est un des leviers SEO les plus sous-estimés et les plus rentables. Il sert à :

- **Distribuer l'autorité** (PageRank interne) des pages fortes vers les pages faibles
- **Guider les robots Google** vers tout le contenu de manière efficace
- **Guider les humains** dans un parcours de découverte qui augmente le temps passé sur le site
- **Thématiser les clusters** pour que Google comprenne quelle page est la référence sur quel sujet

#### 4.4.1 Architecture hub-and-spoke par pilier

Chaque pilier fonctionne comme un **cluster thématique** avec une structure hub-and-spoke :

```
                    /services/fertilite  (HUB)
                            ▲
            ┌───────────────┼───────────────┐
            │               │               │
    /blog/[fertilité]   /faq/fertilite   /ressources/[fertilité]
       (spokes)            (spokes)          (spokes)
```

- **Le HUB** (page service) est la page la plus complète sur le thème. Elle pointe vers tous ses spokes.
- **Les SPOKES** (articles de blog, entrées FAQ, ressources) pointent tous vers le HUB avec une ancre descriptive.
- **Les SPOKES peuvent se pointer entre eux** quand ils sont complémentaires (article fertilité ↔ article FIV, par exemple).

Cette structure fait que Google identifie clairement `/services/fertilite` comme la page de référence sur le sujet et lui attribue l'autorité du cluster entier.

#### 4.4.2 Types de liens à implémenter

**Liens structurels** (automatiques, générés par les composants)
- Breadcrumb sur toutes les pages (avec schema.org `BreadcrumbList`)
- Header / footer avec liens vers les hubs
- Section "Articles liés" en bas de chaque article de blog
- Section "Questions fréquentes" en bas de chaque page service (extrait depuis `faqs` filtré par pilier)
- Section "Ressources" en bas de chaque page service

**Liens contextuels** (manuels, dans le corps du contenu)
- Dans les articles de blog : mentions `[lien vers page service]` quand on parle d'un service
- Dans les réponses FAQ : mentions `[lien vers article approfondi]` quand la réponse renvoie à un traitement long
- Dans les pages services : mentions `[lien vers témoignage]` ou `[lien vers ressource]`
- Dans les ressources : mentions `[lien vers FAQ]` pour les questions rapides

**Liens de cross-pilier** (stratégiques, limités)
- Exemple : un article sur "Nausées premier trimestre" (pilier Grossesse) peut pointer vers "Préparer son corps à la conception" (pilier Fertilité) pour le parcours narratif
- Règle : pas plus de 1-2 liens cross-pilier par article pour ne pas diluer le cluster

#### 4.4.3 Règles de linking

- **3-8 liens sortants contextuels** par page de contenu (hors liens structurels)
- **Ancres descriptives**, jamais génériques : ✅ "notre approche en acupuncture fertilité" / ❌ "cliquez ici"
- **Pas de liens en doublon** sur la même page (premier lien prime pour Google)
- **Liens vers CTAs** (Réserver, Contact) : autant que pertinent, pas de limite
- **Liens externes** : acceptés quand ils citent une source ou une autorité (ordre des acupuncteurs, études scientifiques), `rel="noopener"` systématique

#### 4.4.4 Implémentation technique

- Le schéma Firestore des FAQ et ressources contient déjà les champs `relatedServices`, `relatedArticles`, `relatedFaqs` (voir section 5.2)
- Les articles de blog auront un champ équivalent lors de la migration
- Un composant React `<RelatedContent />` partagé génère les sections "Articles liés / FAQ liées / Ressources liées" à partir de ces relations
- Un composant `<ContextualLink />` permet d'insérer facilement des liens internes dans le markdown des articles avec ancres SEO-friendly
- Un script de build vérifie qu'aucune page n'a 0 lien entrant (page orpheline = signal faible SEO)

> `[MISSION CC]` — Planifier en Phase 3 la création d'un script de vérification du graphe de liens internes qui détecte les pages orphelines et les liens cassés.

### 4.5 Architecture technique — Cohabitation avec le Hub V2

> **Post-scouting (R6)** : le repo Hub V2 est prêt à accueillir des routes publiques sans modification de l'existant. Les éléments clés sont validés ci-dessous.

**Pattern de cohabitation : Route Group `(public)`**

Le repo actuel utilise la structure suivante :

```
app/
  (app)/          → Routes protégées (calendrier, idées, blogue, editeur, stats, profil, inspiration, blitz)
  (auth)/         → Login (Google Sign-In)
  api/            → Routes API (cron, blog, publish, generate-caption, voice-idea)
  politique-de-confidentialite/
  layout.tsx      → Root layout (PWA, fonts)
```

L'auth est **100% client-side** via `useAuth()` dans `(app)/layout.tsx`. Pas de `middleware.ts`. Les Firestore rules bloquent côté serveur. Ce choix délibéré pour une app single-user simplifie énormément l'ajout de pages publiques.

**Solution retenue** : créer un nouveau route group `(public)/` au même niveau que `(app)/` et `(auth)/`, avec son propre layout (header public, footer, CTA sticky) **sans auth check**. C'est le pattern standard Next.js 15 App Router — zéro modification de l'existant, zéro risque de régression sur le Hub.

```
app/
  (app)/          → existant, intact
  (auth)/         → existant, intact
  (public)/       → NOUVEAU
    layout.tsx    → Header/footer public
    page.tsx      → Homepage (port de v4)
    a-propos/
    services/
      fertilite/
      grossesse/
      pediatrie/
      acupuncture-sociale/
    blog/
      page.tsx
      [slug]/
    faq/
      page.tsx
      [category]/
    ressources/
      page.tsx
      [slug]/
    tarifs/
    contact/
    reserver/
  api/            → étendu avec nouvelles routes (import, sitemap, etc.)
```

**Design tokens**

Le repo n'a pas de système de tokens formel. Les couleurs sont dans `tailwind.config.ts` :
- `sage: '#5C7A5F'` (primaire)
- `sand: '#F5F1E9'` (fond)
- Status colors (idea, planned, shot, editing, ready, published)

Le site public réutilise `sage` et `sand` comme base, avec des tokens additionnels à définir en Phase 2 pour le site vitrine (accent CTA, couleurs pour les 4 piliers si différenciation visuelle souhaitée, etc.).

**Schéma Firestore — nouvelles collections**

Aucun conflit avec les collections existantes (`contentItems`, `users`, `calendarSlots`, `blogSequences`, `analytics`). Les nouvelles collections seront :

```
faqs/              (CMS FAQ — lecture publique)
ressources/        (CMS ressources — lecture publique)
servicePages/      (contenu des 4 pages services — lecture publique)
publicBlog/        (blog migré depuis Wix — lecture publique)
siteConfig/        (config globale : textes, NAP, social links — lecture publique)
```

**Règles de sécurité à ajouter** dans `firestore.rules` :

```
match /faqs/{faqId} { allow read: if true; allow write: if isAdmin(); }
match /ressources/{resId} { allow read: if true; allow write: if isAdmin(); }
match /servicePages/{pageId} { allow read: if true; allow write: if isAdmin(); }
match /publicBlog/{postId} { allow read: if true; allow write: if isAdmin(); }
match /siteConfig/{configId} { allow read: if true; allow write: if isAdmin(); }
```

L'écriture sera réservée à l'admin Judith via un panneau dans le Hub V2 (à concevoir en Phase 3), ou à Benoit via Cloud Functions pour les opérations batch (imports, migrations, regénérations).

**Stratégie de rendu**

- **SSG + ISR** pour les pages publiques (régénération toutes les X heures via cron)
- **Metadata dynamique** via `generateMetadata` pour meta tags optimisés par page
- **Sitemap dynamique** via `app/sitemap.ts`
- **Robots.txt** via `app/robots.ts`

**Intégration Wix Blog (pour l'import)**

L'intégration existe déjà dans `app/api/blog/list/`, `app/api/blog/carousel/`, etc. — API REST directe sur `https://www.wixapis.com/blog/v3/`. Il faut ajouter :
- Un endpoint `/api/blog/import/[postId]` qui récupère le contenu complet Ricos JSON
- Un parser Ricos → markdown (ou Ricos → HTML), à écrire
- Un script de migration qui itère sur les 11 articles, convertit, et les pousse dans `publicBlog`
- Un téléchargement + re-upload des images vers Firebase Storage sous `/public/site/blog/[postId]/`

**Crons Vercel — plan Hobby conservé**

Le plan Hobby supporte jusqu'à 100 crons par projet (depuis janvier 2026), avec une contrainte : chaque cron ne peut s'exécuter qu'**une fois par jour** maximum, et Vercel peut déclencher dans n'importe quelle minute de l'heure spécifiée (imprécision horaire). Pour ce projet c'est largement suffisant :

- Cron 1 : revalidation ISR des pages publiques (1×/jour)
- Cron 2 : publication blog programmée (existant, conservé)
- Cron 3 : fetch-insights (existant, conservé)
- Cron 4 : check fraîcheur contenu + regénération sitemap (1×/jour)
- Cron 5+ : marge pour évolutions futures

Pas d'upgrade Pro nécessaire au lancement. Économie de ~20 $/mois maintenue.

---

## 5. Plan FAQ

### 5.1 Objectifs du CMS FAQ

- Générer des **rich snippets** Google via schema.org `FAQPage`
- Capturer des requêtes informationnelles à longue traîne
- Fournir des réponses rapides aux prospects avant conversion
- Alimenter des liens internes vers les pages services et articles de blog
- Permettre à Judith (ou Benoit) de publier et enrichir facilement depuis l'admin Hub V2

### 5.2 Structure d'une entrée FAQ

Schéma Firestore provisoire :

```
faqs/
  {id}:
    question: string (la question telle qu'un prospect la formulerait)
    reponse: string (markdown, 50-300 mots, voix de Judith)
    category: enum ('fertilite' | 'grossesse' | 'sociale' | 'seance')
    order: number (pour l'affichage)
    relatedServices: string[] (slugs des pages services liées)
    relatedArticles: string[] (slugs d'articles de blog liés)
    relatedFaqs: string[] (autres FAQ liées pour cross-linking)
    publishedAt: timestamp
    updatedAt: timestamp
    ctaVariant: enum ('reserver' | 'contact' | 'tarifs')
```

### 5.3 Volume cible

Proposition pour le lancement :

- **Pilier Fertilité** : 15-20 questions
- **Pilier Grossesse** : 20-25 questions (le plus volumineux, les femmes enceintes posent beaucoup de questions)
- **Pilier Pédiatrie** : 10-15 questions (parents qui hésitent à faire traiter leurs enfants — besoin de rassurance forte)
- **Pilier Acupuncture sociale** : 8-12 questions (plus concentré)
- **Séance & logistique** : 10-15 questions (transversal, utile pour conversion)

**Total cible au lancement : ~65-85 FAQ**. C'est suffisant pour avoir un vrai impact SEO sans que ce soit écrasant à produire, et cohérent avec la découverte du scouting que les PAA Google sur ces sujets sont actives et inexploitées localement.

**Note** : 6 FAQ sont déjà rédigées et validées dans `scripts/seo-geo/source/` (anxiété, FIV/traitement hormonal, nausées grossesse, séances avant FIV, bébé en siège/moxibustion, tomber enceinte naturellement). Elles sont à intégrer directement dans la collection `faqs` au lancement — accélérateur immédiat.

### 5.4 Tonalité et format — guide de ton

> **Post-scouting (R5)** : trois registres distincts coexistent dans le corpus actuel de Judith. Il faut trancher avant de produire du contenu à volume.

**Les trois voix identifiées**

1. **Judith intime** (blog nausées, page À propos) — chaleureux, maternel, humour, tutoiement, anecdotes personnelles. C'est la voix la plus reconnaissable comme "Judith". Formalité 3/10.
2. **Judith + Claire Thomas** (articles co-signés) — plus formel, structuré, informatif, vouvoiement implicite, "nous". Formalité 6-7/10. **Claire Thomas continue à co-écrire**, donc cette voix persiste sur le blog.
3. **Judith SEO** (FAQ et pages piliers dans `scripts/seo-geo/`) — rigoureux, empathique, scientifique, "je" + vouvoiement, avec références précises. Formalité 4-5/10.

**Décision tranchée : vouvoiement par défaut sur le site, "je" de Judith comme signature**

- **Vouvoiement** partout sur le site (FAQ, pages services, ressources, blog)
- **"Je" à la première personne** pour Judith dans les FAQ, les intros de pages services, et les passages où elle parle de sa pratique
- **Exception possible** : la page `/a-propos` peut garder des passages en tutoiement si Judith le souhaite, comme signature personnelle intime
- **Réseaux sociaux (Instagram)** : tutoiement maintenu (cohérence avec la communauté existante)

Ce choix équilibre le positionnement professionnel clinique (aligné avec La Source en Soi et ses 1 215 avis) et l'accessibilité. Le "je" de Judith garde la chaleur personnelle sans compromettre la crédibilité.

**Ton et structure des réponses FAQ**

- **50-300 mots** par réponse — assez long pour Google, pas trop pour le lecteur
- **Ton chaleureux, pédagogique, sans jargon** — cohérent avec le positionnement accessible
- **Marqueurs québécois dosés** : 2-3 expressions par texte maximum ("tannée", "ça paraît que", "sécuritaire" au sens québécois). Le LLM qui génère doit éviter de tomber dans le français de France OU d'abuser des québécismes
- **Références scientifiques** quand pertinent, avec rigueur (auteurs, journal, année) — aligner sur le standard des pages piliers SEO existantes, pas sur les références vagues du blog Wix
- **CTA naturel** en fin de réponse quand pertinent ("Si vous souhaitez explorer cela, vous pouvez réserver une séance…")
- **Liens internes** vers pages services ou blog pertinents

**Formules-signature à réutiliser**

Vocabulaire récurrent identifié dans la voix de Judith :
- Registre émotionnel : *accompagner, accompagnement, douceur, parcours, soutenir, bienveillant, écoute, bien-être, harmonie*
- Formules : *"Soyons honnêtes"*, *"ce n'est pas un remède miracle"*, *"en complément, pas en remplacement"*, *"la science le confirme"*

**Guide de ton à produire comme livrable séparé**

Un document distinct `docs/migration-wix/01-strategie/GUIDE_DE_TON.md` sera produit lors de la Mission 6 (voix de Judith) et contiendra :
- Exemples positifs / négatifs par type de contenu
- Few-shot examples à injecter dans le prompt système pour la génération Claude
- Répertoire d'anecdotes personnelles validées par Judith (grossesses, patientes, parcours)
- Glossaire québécois dosé
- Règles de tutoiement/vouvoiement par contexte

### 5.5 Génération assistée

Processus proposé :

1. Claude génère un batch de 10-20 questions/réponses pour un pilier donné, basé sur :
   - Recherches réelles des personas (via Answer The Public, Google "People Also Ask", recherches Reddit FR)
   - Ton et voix de Judith (à capturer via quelques exemples de textes existants)
   - Informations factuelles sur l'acupuncture
2. Judith review, corrige, valide en batch depuis l'admin du Hub
3. Publication immédiate ou programmée

> `[MISSION CC]` — Collecter les "People Also Ask" et questions Reddit/forums réelles pour alimenter ce processus. Voir section 10.

---

## 6. Plan ressources

### 6.1 Objectifs du CMS Ressources

Les ressources servent trois rôles complémentaires à la FAQ :

1. **Contenu long et référentiel** — guides approfondis qui positionnent Judith comme experte
2. **Lead magnets potentiels** — capture d'email pour nurturing (à décider, voir section 6.4)
3. **Partage social et autorité** — contenu téléchargeable = plus de backlinks et plus de crédibilité

### 6.2 Types de ressources envisagés

- **Guides PDF téléchargeables** : ex. "Préparer son corps à la conception — guide de 20 pages"
- **Check-lists pratiques** : ex. "Check-list premier trimestre de grossesse"
- **Articles de fond** (format long, hébergé sur le site, pas téléchargeable) : ex. "Comprendre l'acupuncture sociale"
- **Vidéos pédagogiques** : ex. "Qu'est-ce qu'une séance d'acupuncture" — intégration YouTube existante
- **Infographies** : ex. schéma du cycle menstruel et points d'acupuncture

### 6.3 Idées de ressources à produire en priorité

Provisoire — à valider avec Judith :

1. **Guide "Préparer son corps à la conception"** (Pilier Fertilité, lead magnet potentiel)
2. **Check-list "Votre premier rendez-vous en acupuncture"** (transversal, conversion-focused)
3. **Article de fond "Qu'est-ce que l'acupuncture sociale ? Manifeste"** (Pilier Social, différenciateur)
4. **Guide "Grossesse trimestre par trimestre avec l'acupuncture"** (Pilier Grossesse, lead magnet potentiel)
5. **Infographie "Les points d'acupuncture en fertilité"** (Pilier Fertilité, partageable)
6. **Guide "Post-partum : 40 jours pour récupérer"** (Pilier Grossesse)
7. **Article "L'acupuncture et la FIV : ce que dit la recherche"** (Pilier Fertilité, crédibilité scientifique)
8. **Check-list "Comment choisir votre tarif sur l'échelle solidaire"** (Pilier Social, enlever la barrière psychologique)

### 6.4 Question à trancher : lead magnet ou pas ?

Deux options :

**Option A — Lead magnet avec capture email**
- Avantages : liste email pour nurturing, communication directe
- Inconvénients : friction à l'accès, complexité technique (gestion RGPD, plateforme d'emailing, flux de nurturing à écrire), barrière idéologique avec le positionnement "acupuncture sociale / accessible"

**Option B — Accès libre**
- Avantages : cohérence totale avec le positionnement accessible, pas de friction, plus de partages
- Inconvénients : pas de capture directe, impact SEO moindre sur les signaux d'engagement

**Recommandation provisoire** : **Option B — accès libre**, en cohérence avec la philosophie d'acupuncture sociale. La capture de prospects passe par Instagram + blog + FAQ + Google Business Profile, pas par email gating. À re-trancher si on voit que le funnel a besoin d'être renforcé.

---

## 7. Intégration du rôle d'influenceuse

Judith n'est pas juste une praticienne, elle est une **voix publique** active sur Instagram et autres plateformes. Le site public doit refléter cela sans dénaturer sa fonction de conversion.

### 7.1 Pourquoi c'est important

- **Autorité perçue** : un prospect qui voit Judith créer du contenu éducatif lui fait plus confiance
- **Social proof continu** : les Reels récents montrent que Judith est active et engagée
- **Synergie écosystème** : le site nourrit les réseaux et inversement, au lieu d'être silos
- **SEO indirect** : les signaux sociaux et les backlinks depuis les réseaux soutiennent le ranking

### 7.2 Manifestations possibles sur le site

**Option A — Section "Dans les médias / Sur Instagram" sur la homepage**
Déjà présente dans la v4 sous forme de card Instagram featured. À maintenir et étoffer.

**Option B — Page dédiée "Communauté" ou "Dans les médias"**
Agrège :
- Derniers Reels Instagram (embed ou rendu via API)
- Derniers articles de blog
- Témoignages
- Mentions presse si applicable
- Apparitions podcast, ateliers, etc.

**Option C — Bio "À propos" qui assume le double rôle**
La page `/a-propos` doit explicitement parler de Judith comme praticienne + éducatrice + militante, avec des liens vers ses réseaux. Pas juste un CV clinique.

**Option D — Intégration native dans le blog**
Chaque article est cross-linké avec le Reel correspondant quand il existe (tu publies déjà des Reels qui résument les articles via le Hub — on peut exploiter ce lien).

**Recommandation** : **combiner A + C + D** au lancement, garder B comme évolution possible si on voit que le contenu s'accumule au point de justifier une page dédiée.

### 7.3 Point à résoudre : quel Instagram mettre en avant ?

Tu mentionnes `@mon_acupunctrice` comme handle principal. Vérifier :
- Est-ce bien le handle actif et à jour ?
- Y a-t-il un second compte personnel vs professionnel ?
- Quel est le handle Facebook à mettre en avant ?

> `[MISSION CC]` — Vérifier et consolider les handles sociaux actifs de Judith. Voir section 10.

---

## 8. Stratégie GEO local (Montréal / Rosemont)

Le référencement local est **potentiellement le plus gros levier de cette migration**, parce que :

1. Les recherches "acupuncture + quartier" ont une intention transactionnelle très forte
2. La concurrence locale est souvent mal optimisée (sites vitrines basiques)
3. Judith peut **capitaliser sur la réputation existante de la clinique La Source en Soi** au lieu de partir de zéro

### 8.1 Principe directeur : emprunt de réputation, pas fragmentation

Judith n'a pas de Google Business Profile en propre. La clinique **La Source en Soi** possède une fiche GBP **exceptionnelle : 4,9/5 avec ~1 215 avis Google** (vérifié lors du scouting R4). Pour mettre ce chiffre en perspective : le leader SEO montréalais en acupuncture (Clinique Synergek) a ~425 avis. La Source en Soi a **presque trois fois plus**. C'est un actif de réputation massif, et non un simple avantage relatif.

La stratégie gagnante ici n'est **pas** de créer une fiche GBP séparée pour Judith (qui serait au même lieu physique et fragmenterait le signal local), mais de :

1. **Tisser le site de Judith à la clinique** via le contenu et le schema.org
2. **Afficher les 1 215 avis** comme argument de vente central sur le site (voir 8.1b ci-dessous)
3. **Renforcer la fiche GBP existante** de La Source en Soi pour que Judith y soit visible (encourager les patientes à mentionner Judith dans leurs avis)
4. **Préserver le backlink existant** depuis `lasourceensoi.com/equipe/judith-dufour-savard/` (découverte scouting R4)
5. **Optimiser les landing pages locales** pour que Judith apparaisse dans les SERPs géolocalisées même sans fiche GBP propre

Cette approche est moins courante mais plus défendable sur le plan du signal NAP et plus efficace à court terme.

### 8.1b Affichage stratégique des 1 215 avis sur le site

**Principe** : le chiffre "4,9/5 · 1 200+ avis Google" doit être visible sur **toutes les pages de conversion** du site. C'est le plus gros argument de confiance disponible, et il est spécifique à la clinique de Judith — impossible à reproduire par un concurrent sans avoir le même historique.

**Stratégie hybride (narratif + social proof concret)** :

**Homepage** — encart visible dans le premier écran (hero ou juste en dessous) :
> *« Judith exerce à la clinique La Source en Soi — ★ 4,9/5 · 1 200+ avis Google »*

Avec lien cliquable vers la fiche Google Maps de la clinique (ouverture nouvelle fenêtre).

**Pages services (4 piliers)** — mention narrative dans l'introduction :
> *« Judith reçoit ses patientes à la clinique La Source en Soi, clinique spécialisée en fertilité et périnatalité à Rosemont, notée 4,9/5 par plus de 1 200 patient·es sur Google. »*

**Page `/a-propos`** — bloc dédié "Ma clinique" :
> *Bloc avec photo de la clinique, note 4,9/5, nombre d'avis, catégorie "Clinique spécialisée en fertilité et périnatalité", lien vers Google Maps.*

**Page `/reserver`** — **point critique**, l'avis social renforce la décision finale :
> Section "Ce qu'en disent nos patientes" avec 3-5 avis récents sélectionnés manuellement depuis Google Maps (attribution : "Avis Google sur la clinique La Source en Soi, où exerce Judith"). **Pas de widget API** — sélection manuelle pour contrôle qualité et pertinence (avis mentionnant Judith en priorité si disponibles).

**Footer global** — petite mention discrète :
> *« En partenariat avec Clinique La Source en Soi ★ 4,9/5 »*

**Ce qu'on NE fait PAS** :
- Pas de badge clinquant "AS SEEN ON" — trop commercial, casse le positionnement accessible
- Pas de widget Google Reviews embarqué — dépendance technique, lent, et peut afficher des avis non contrôlés
- Pas d'invention de témoignages — seulement des vrais avis vérifiables avec attribution source

### 8.2 Leviers GEO à activer

**Schema.org — approche Person + MedicalClinic**

Plutôt qu'un `LocalBusiness` autonome pour Judith (qui concurrencerait la fiche clinique), on utilise une structure imbriquée :

- Schema `Person` pour Judith : nom, image, `jobTitle` "Acupunctrice", `medicalSpecialty` (fertilité, obstétrique, acupuncture), `alumniOf` (formation), `memberOf` (ordre des acupuncteurs)
- Schema `MedicalClinic` pour La Source en Soi : nom, adresse, téléphone, coordonnées géo, horaires, `areaServed`, `priceRange`
- Relation : `Person.worksFor → MedicalClinic`
- Sur les pages services, ajouter un schema `MedicalTherapy` ou `Service` qui pointe vers la Person ET la MedicalClinic

Cette structure permet à Google de comprendre : "Judith est une praticienne spécialisée qui exerce dans cette clinique spécifique" sans créer un doublon de fiche locale.

**Google Business Profile La Source en Soi**

> **Post-scouting (R4)** : fiche vérifiée, 4,9/5, ~1 215 avis, catégorie "Centre de bien-être / Clinique spécialisée", photos présentes. Judith n'est pas directement listée dans la fiche GBP mais apparaît sur la page équipe du site de la clinique.

Actions potentielles (à valider selon l'accès / la coopération de la direction) :
- Vérifier que Judith est listée comme praticienne dans la fiche (action : demander à la direction de l'ajouter)
- Ajouter des photos de Judith si possible
- Stratégie de posts GBP mentionnant Judith pour certains thèmes (fertilité, grossesse, pédiatrie)
- Stratégie de réponses aux avis qui mentionnent spécifiquement Judith
- **Encourager activement les patientes satisfaites** à laisser un avis GBP en mentionnant Judith dans le texte — ceci devient un KPI du site ("nombre d'avis mentionnant Judith")

Ces actions demandent la coopération de la clinique — à discuter avec la direction de La Source en Soi. Le site de Judith devient un actif complémentaire qui renvoie du trafic qualifié à la clinique, argument de négociation fort.

**Lumino Health (Sun Life)**

> **Post-scouting (R4)** : fiche existante mais seulement **3 avis** — actif beaucoup plus faible qu'anticipé. Tarif affiché : 70-90 $ (standard, pas le tarif solidaire).

Décision : **ne pas investir dans Lumino comme source de social proof**. Le contenu des 3 avis peut être récupéré pour la page témoignages, mais ce n'est pas une priorité. Les 1 215 avis Google de La Source en Soi remplacent largement ce besoin.

La fiche Lumino reste utile comme point de découverte secondaire (les patientes Sun Life y cherchent parfois leur praticien·ne) — à maintenir à jour avec le bon NAP et un lien vers le nouveau site.

**Pages landing locales**

Les pages services intègrent explicitement la double dimension locale + clinique :
- H1 type : "Acupuncture fertilité à Rosemont — Clinique La Source en Soi"
- Meta description mentionnant Rosemont, la clinique, et le service
- Corps de texte qui cite naturellement le quartier et la clinique
- Encart "Où exerce Judith" sur chaque page service avec adresse, map, lien vers la fiche GBP La Source en Soi

**Mentions de quartiers et repères**

Dans les textes, mentionner naturellement : Rosemont, Petite-Patrie, Plateau, Angus, Masson, Mont-Royal, les stations de métro proches, les points de repère. Sans bourrage, de manière contextuelle et humaine. Exemple : *"Judith reçoit ses patientes à la clinique La Source en Soi, à quelques pas du métro Rosemont, dans le quartier vivant de la Petite-Patrie."*

**Cohérence NAP sur tout le web**

Le NAP affiché partout doit être celui de La Source en Soi, pas une adresse séparée pour Judith. Un seul nom, une seule adresse, un seul téléphone — partout où Judith est mentionnée sur le web (site, annuaires, ordre professionnel, réseaux sociaux).

> `[MISSION CC]` — Vérifier la cohérence NAP actuelle de Judith sur le web et identifier les incohérences, voir Mission 4 section 10.

### 8.3 Backlinks locaux à viser

- **Site web de La Source en Soi** — backlink direct depuis la page équipe de la clinique vers le site de Judith (à négocier avec la direction)
- Ordre des acupuncteurs du Québec (fiche pro)
- Lumino Health / Sun Life (fiche existante — vérifier si elle peut pointer vers le site)
- Organismes communautaires Rosemont (partenariats acupuncture sociale — démarche à faire par Judith)
- Blogs locaux santé / périnatalité Montréal
- Sage-femmes, doulas, autres cliniques de fertilité (échanges de références)

### 8.4 Risques de l'approche emprunt de réputation

Par honnêteté intellectuelle, noter les risques :

- **Dépendance à la clinique** : si Judith quitte La Source en Soi un jour, une partie du travail GEO est à refaire
- **Négociation nécessaire** : certaines actions (posts GBP, réponses aux avis, backlink du site clinique) demandent l'accord de la direction
- **Moins de contrôle direct** : Judith n'a pas la main sur la fiche GBP, donc pas de pilotage direct
- **Ambiguïté de propriété** : certains prospects peuvent confondre Judith et la clinique dans leurs recherches

Ces risques sont acceptables au démarrage et compensés par le gain de réputation immédiat. À réévaluer après 12 mois — si le site de Judith accumule sa propre autorité, une fiche GBP séparée pourrait devenir intéressante plus tard.

---

## 9. Funnel & CTAs

### 9.1 Points de conversion par type de page

**Homepage** → multiple CTAs contextuels
- Hero : bouton primaire "Réserver une séance"
- Sections services : "En savoir plus" → page service → CTA réserver
- Section À propos : "Découvrir Judith" → page à propos
- Blog/ressources : "Lire l'article" → article → CTA en fin
- Card Instagram : "Me suivre" → Instagram (top of funnel)

**Pages services** → CTA principal direct
- Hero de la page : "Réserver une séance [fertilité / grossesse / …]"
- Milieu de page après explication : CTA secondaire
- Fin de page après FAQ : CTA final
- Sidebar sticky desktop : CTA persistant
- Bottom sticky mobile : CTA persistant

**Articles de blog** → CTA soft + CTA hard
- CTA soft en milieu d'article : "Cet article vous parle ? Explorez nos ressources fertilité"
- CTA hard en fin d'article : "Réserver une séance avec Judith"

**Pages FAQ** → CTA contextuel par catégorie
- Bloc CTA à la fin de chaque catégorie FAQ avec wording spécifique

**Page tarifs** → point critique
- Doit expliquer l'échelle solidaire sans gêne, avec pédagogie
- CTA direct après explication

**Page /reserver (landing de confiance — pas juste un bouton)** → transformer la friction en signal de confiance

Contexte : Go Rendez-Vous atterrit sur la page de la clinique La Source en Soi, où l'utilisateur doit sélectionner Judith manuellement dans la liste des praticien·nes. Au lieu de subir cette friction, on en fait un point fort du funnel.

Contenu de la page `/reserver` :
1. **H1 rassurant** : "Réserver une séance avec Judith"
2. **Court texte stratégique** (3-4 phrases) expliquant :
   - Judith exerce à la **clinique La Source en Soi**, clinique spécialisée en fertilité et périnatalité à Rosemont
   - Le bouton ci-dessous dirige vers le système de réservation de la clinique
   - **Instruction claire** : "Sélectionnez Judith Dufour-Savard dans la liste des praticien·nes pour voir ses disponibilités"
   - Bénéfice associé : "Vous bénéficiez ainsi de l'environnement complet d'une clinique spécialisée"
3. **Bouton primaire** : "Ouvrir le système de réservation →" (target="_blank", rel="noopener", event tracking)
4. **Encadré réassurance** : petit bloc "Besoin d'aide ?" avec le téléphone de la clinique et/ou un lien vers `/contact`
5. **Section "À quoi s'attendre lors de votre première séance"** : 3-4 points courts pour réduire l'anxiété pré-réservation
6. **Section "Témoignages"** (3-5 extraits courts, récupérés de Lumino Health si possible, avec attribution de source)

Cette page fait 4 choses simultanément :
- **Convertit** (c'est la fin du funnel)
- **Rassure** (elle explique la friction au lieu de la subir)
- **Renforce le positionnement** (elle mentionne clinique spécialisée, fertilité, périnatalité, Rosemont — SEO implicite)
- **Empile du social proof** (témoignages juste avant le clic final)

### 9.2 Wording des CTAs

À tester et itérer — quelques variantes à produire pour A/B testing plus tard :

- Neutre : "Réserver une séance"
- Contextualisé service : "Réserver une séance [fertilité / grossesse]"
- Action-oriented : "Prendre rendez-vous avec Judith"
- Chaleureux : "Commencer mon parcours"
- Accessibilité : "Réserver — tarif solidaire"

### 9.3 Paramètres à passer à Go Rendez-Vous

**Stratégie actuelle confirmée** : l'utilisateur atterrit sur la page de la clinique et doit sélectionner Judith manuellement. Les paramètres d'URL pour pré-sélection de praticien·ne ne semblent pas efficaces dans le flux actuel — d'où la décision stratégique de **transformer cette friction en élément de confiance** sur la page `/reserver` (voir 9.1).

Référence technique :
- `companyId=104074` (La Source en Soi)
- `employeeId=7556837` (Judith, pour référence future)
- URL utilisée : `https://gorendezvous.com/lasourceensoi`

Tracking (à implémenter en Phase 3) :
- Event Plausible/GA4 `reservation_click` déclenché au clic sur le bouton de la page `/reserver`
- Propriétés de l'event : page d'origine (homepage, service fertilité, etc.), position du CTA, variante du wording
- Permet de mesurer le taux de conversion par landing page sans dépendre de Go Rendez-Vous

### 9.4 KPIs à tracker post-lancement

- Sessions organiques / mois
- Positions moyennes sur mots-clés cibles
- Taux de clic sur CTAs "Réserver" par page
- Taux de rebond par landing page
- Conversions (clics vers Go Rendez-Vous) — tracking à mettre en place via GA4 ou Plausible + events
- Impressions Google Business Profile et appels directs
- Backlinks acquis

---

## 10. Missions de build pour Claude Code

> **Note post-scouting** : la phase de scouting est terminée (13 avril 2026). Les 6 rapports de scouting sont dans `docs/migration-wix/02-recherche/scouting/` et ont permis d'alimenter cette version 0.3 du plan. Cette section est maintenant orientée **missions de build** plutôt que missions de recherche exploratoire.

Cette section regroupe les missions concrètes à lancer en Phase 0 et Phase 1. Chaque mission est un brief autonome, prêt à copier dans Claude Code.

### Mission 1 — Inventaire Wix complet + extraction contenu

**Objectif** : récupérer tout le contenu exploitable du site Wix actuel pour alimenter la migration.

**À livrer** :
1. **Matrice de redirections 301** : chaque URL Wix vers sa nouvelle URL Next.js (même si le SEO à préserver est faible, on protège les ~5-10 URLs qui peuvent avoir des backlinks externes, dont `lasourceensoi.com/equipe/judith-dufour-savard/`)
2. **Export complet des 11 articles de blog** :
   - Contenu Ricos JSON récupéré via API Wix (`/blog/v3/posts/{postId}`)
   - Conversion Ricos → markdown via parser à écrire
   - Métadonnées : titre, date, catégorie, extrait, cover image, co-auteur
   - Images associées téléchargées en version originale
3. **Export des 8 pages statiques** : texte brut, structure des titres, images
4. **Export des 6 FAQ Wix dynamiques** : contenu + catégorie
5. **Inventaire des 30-60 images** : URLs originales, noms cohérents, classement par page/article
6. **Script de migration** qui pousse le contenu dans les collections Firestore (`publicBlog`, `faqs`, `servicePages`) et re-upload les images vers Firebase Storage sous `/public/site/`
7. Fichiers de sortie dans `docs/migration-wix/02-recherche/inventaire/`

**Sources** :
- API Wix Blog v3 (credentials déjà dans `.env.local`)
- Sitemap XML du site Wix
- Crawl des pages statiques pour le contenu non-blog

**Livrable attendu** : dossier complet avec contenu exploitable + script de migration testé en dry-run.

---

### Mission 2 — Recherche de mots-clés avec Ubersuggest Pro

**Objectif** : obtenir les volumes réels et la difficulté concurrentielle sur les mots-clés cibles pour affiner la stratégie.

**À livrer** :
1. Pour chaque pilier (fertilité, grossesse, pédiatrie, acupuncture sociale), une liste de 30-50 mots-clés réels avec :
   - Volume de recherche mensuel réel (Canada / Québec)
   - Difficulté concurrentielle chiffrée
   - Intention de recherche
   - Top 3 résultats actuels sur Google Canada
2. Priorisation en 3 tiers (quick wins / moyens / long terme)
3. Liste finale des 20-30 mots-clés à cibler en priorité au lancement
4. Fichier de sortie : `docs/migration-wix/02-recherche/mots-cles-reels.md`

**Budget** : ~30 $ pour 1 mois d'Ubersuggest Pro (annulation après). Benoit fournit l'accès.

**Contrainte** : mission à lancer en Phase 0, car les résultats alimentent la rédaction de contenu de Phase 1.

---

### Mission 3 — Guide de ton de Judith

**Objectif** : produire un document de référence pour la génération de contenu qui sonne authentiquement comme Judith.

**À livrer** : fichier `docs/migration-wix/01-strategie/GUIDE_DE_TON.md` contenant :
1. Rappel des trois voix identifiées et de la décision (vouvoiement + "je" signature)
2. Analyse stylistique détaillée (vocabulaire, tournures, longueur de phrases, formalité)
3. **Few-shot examples** : 3-5 paragraphes réels de Judith (voix intime) pour injection dans les prompts système
4. **Répertoire d'anecdotes validées** par Judith (grossesses, patientes anonymisées, moments marquants) — à collecter en entretien avec Judith
5. Glossaire québécois dosé (3-5 expressions par texte max)
6. Règles de tutoiement/vouvoiement par contexte
7. Exemples positifs et négatifs par type de contenu (FAQ, page service, article de blog, captions Instagram)
8. Section "Ce qui sonne faux" — pièges à éviter (français de France, pseudo-intimité, jargon, références scientifiques vagues)

**Sources** :
- Blog Wix actuel (articles co-écrits avec Claire Thomas)
- Page À propos Wix
- Corpus `scripts/seo-geo/source/` (voix SEO)
- **Entretien avec Judith** pour le répertoire d'anecdotes (nécessite ~30 min avec elle)

---

### Mission 4 — Audit GEO complet + plan d'action clinique

**Objectif** : consolider l'audit géolocalisé et produire un plan d'action concret pour maximiser le levier La Source en Soi.

**À livrer** :
1. **Vérification NAP approfondie** sur :
   - Pages Jaunes
   - Ordre des acupuncteurs du Québec
   - Yelp (si fiche existante)
   - Autres annuaires santé
   - Facebook personnel / professionnel
   - Correction des incohérences détectées
2. **Analyse des 50 avis récents de La Source en Soi** sur Google Maps :
   - Combien mentionnent Judith par son nom ?
   - Quels thèmes reviennent ?
   - Témoignages citables pour la page `/reserver`
3. **Plan d'action clinique** — document à présenter à la direction de La Source en Soi avec :
   - Argumentaire (pourquoi le site de Judith bénéficie à la clinique)
   - Actions demandées : backlink mis à jour, ajout de Judith dans la fiche GBP, posts GBP mentionnant Judith, encouragement aux avis mentionnant Judith
   - Livrables que Benoit/Judith apportent en échange (trafic qualifié, contenu SEO, visibilité)
4. **Kit "avis mentionnant Judith"** : texte modèle que Judith peut envoyer à ses patientes satisfaites pour demander un avis Google mentionnant son nom
5. Fichier de sortie : `docs/migration-wix/02-recherche/plan-action-geo.md`

---

### Mission 5 — Transfert DNS vers Cloudflare

**Objectif** : sortir `acupuncturejudith.ca` du contrôle Wix pour avoir la flexibilité de pointer vers Vercel le jour du lancement.

**À livrer** :
1. Création d'un compte Cloudflare (gratuit) si inexistant
2. Initiation du transfert de domaine depuis Wix vers Cloudflare
   - Vérifier si Wix permet le transfert de domaine (parfois le domaine est "loué" et non transférable)
   - Alternative si transfert bloqué : changer les nameservers Wix → Cloudflare sans transfert complet
3. **Avant la bascule** : noter tous les records DNS actuels chez Wix pour les reproduire chez Cloudflare
4. Configuration Cloudflare : DNS, SSL, DNSSEC
5. **Test** : vérifier que le site Wix reste accessible pendant et après le changement (on NE veut PAS casser le site en production tant que le nouveau n'est pas prêt)
6. Document de suivi : `docs/migration-wix/02-recherche/dns-transfer-log.md`

**Contrainte critique** : cette mission est une **Phase 0** — elle doit se faire avant tout le reste, mais **sans casser le site Wix actuel**. Objectif : préparer l'infrastructure DNS en amont pour que le jour du switch vers Vercel soit une simple modification de records, pas un transfert complet stressant.

**Risque** : si Wix bloque le transfert, il faut pouvoir revenir en arrière. Toujours avoir un plan B documenté.

---

### Mission 6 — Architecture Firestore + Routes publiques

**Objectif** : poser les fondations techniques pour le build de Phase 1.

**À livrer** :
1. **Schémas TypeScript** pour les nouvelles collections :
   - `types/faq.ts` — interface FAQ avec tous les champs (question, reponse, category, order, relatedServices, etc.)
   - `types/ressource.ts`
   - `types/servicePage.ts`
   - `types/publicBlog.ts`
   - `types/siteConfig.ts`
2. **Firestore rules** mises à jour dans `firestore.rules` avec les lectures publiques
3. **Route group `(public)/`** créé dans `app/` avec :
   - Layout public (header/footer/CTA sticky)
   - Page d'accueil placeholder
   - Structure de dossiers pour les 4 services, le blog, la FAQ, les ressources
4. **Design tokens étendus** dans `tailwind.config.ts` pour le site public (accent, couleurs par pilier si différenciation voulue)
5. **Composants partagés de base** :
   - `<RelatedContent />` pour le maillage interne
   - `<ContextualLink />` pour les liens internes avec ancres
   - `<CtaReserver />` avec variantes (hero, service, sticky mobile)
   - `<ClinicBadge />` affichant 4,9/5 · 1 200+ avis
6. **Routes API** pour la lecture publique depuis Firestore (avec cache ISR)

**Dépendances** : Missions 1, 2, 3 complétées (contenu, mots-clés, guide de ton) pour donner du sens aux structures.

---

### Mission 7 — Build Phase 1 : pages statiques & landing services

**Objectif** : produire la première version déployable du site public.

**À livrer** :
1. Homepage — port de la v4 existante avec vraies données Firestore
2. Page `/a-propos` avec bloc "Ma clinique" (4,9/5 · 1 215 avis)
3. Les 4 pages services (`/services/fertilite`, `/services/grossesse`, `/services/pediatrie`, `/services/acupuncture-sociale`)
4. Page `/tarifs` optimisée SEO (cible "combien coûte l'acupuncture Montréal")
5. Page `/contact`
6. Page `/reserver` comme landing de confiance complète (voir section 9.1)
7. Layout global avec header/footer/CTA sticky
8. Metadata dynamique `generateMetadata` par page
9. Schema.org `Person` + `MedicalClinic` + `Service`
10. Sitemap dynamique + robots.txt

**Dépendance** : Mission 6 complétée.

---

### Mission 8 — Build Phase 2 : blog + FAQ + ressources

**Objectif** : contenu dynamique servi par le CMS Firestore.

**À livrer** :
1. Import complet des 11 articles Wix vers `publicBlog` (via script de Mission 1)
2. Pages blog (liste + article individuel)
3. Import des 6 FAQ existantes + des 5 pages piliers de `scripts/seo-geo/` dans les collections
4. Pages FAQ (liste + catégories)
5. Pages ressources (liste + individuelle)
6. Sections "Articles liés / FAQ liées / Ressources liées" sur chaque page de contenu
7. Admin Firestore dans le Hub V2 pour Judith (CRUD FAQ et ressources)

**Dépendance** : Mission 7 complétée.

---

### Mission 9 — Lancement & DNS switch

**Objectif** : basculer la production de Wix vers Vercel.

**À livrer** :
1. Vérification finale du site staging (toutes pages, toutes images, tous liens, responsive, Lighthouse, schema validator)
2. Bascule des records DNS dans Cloudflare de Wix vers Vercel
3. Configuration du domaine `acupuncturejudith.ca` dans le projet Vercel (SSL auto)
4. Soumission du nouveau sitemap à Google Search Console
5. Demande de re-crawl des pages principales
6. **Négociation avec La Source en Soi** : mise à jour du backlink `/equipe/judith-dufour-savard/` vers la nouvelle URL
7. Mise à jour des profils externes pointant vers l'ancien site (ordre professionnel, Lumino, Facebook, LinkedIn)
8. Désactivation progressive du Wix (pas de suppression immédiate — garder 2-4 semaines en backup)
9. Monitoring quotidien des erreurs 404, crawl errors, positions pendant 2-4 semaines

## 11. Plan d'exécution par phases

### Phase 0 — Préparation infrastructure (avant tout le reste)

**Objectif** : débloquer les prérequis qui ne dépendent pas de la rédaction de contenu.

Actions parallélisables :

1. **Transfert DNS vers Cloudflare** (Mission 5) — **bloqueur ordre-0**. Sans ça, la bascule du site ne peut pas se faire proprement.
2. **Recherche de mots-clés Ubersuggest Pro** (Mission 2) — achat du mois, extraction des données, annulation après.
3. **Audit GEO + plan d'action clinique** (Mission 4) — analyse des avis, inventaire NAP, préparation du document pour la direction de La Source en Soi.
4. **Guide de ton** (Mission 3) — extraction de la voix de Judith + entretien avec elle pour les anecdotes.
5. **Entretien avec Judith** pour confirmer :
   - Fréquence réelle de la pratique pédiatrique
   - Disponibilité pour fournir anecdotes personnelles
   - Validation du ton (vouvoiement) et du positionnement pédiatrique

**Livrables** :
- Domaine sous contrôle Cloudflare
- Liste finale des mots-clés priorisés
- Plan d'action clinique prêt à présenter
- Guide de ton v1.0
- Validation pédiatrie

**Durée estimée** : 1-2 semaines.

### Phase 1 — Architecture & structure technique

**Objectif** : poser les fondations dans le repo Hub V2.

1. **Mission 6** — Architecture Firestore + routes publiques
2. Design de la couche CMS (admin FAQ / ressources dans le Hub)
3. Spécifications des composants partagés
4. Inventaire complet Wix (Mission 1) lancé en parallèle si capacité

**Durée estimée** : 1-2 semaines.

### Phase 2 — Build pages statiques & services

**Objectif** : produire le squelette navigable du site avec les pages critiques.

1. **Mission 7** — Build Phase 1 : homepage, À propos, 4 services, tarifs, contact, reserver
2. Schema.org complet
3. Metadata dynamique
4. Sitemap + robots.txt

**Durée estimée** : 2-3 semaines.

### Phase 3 — Build contenu dynamique

**Objectif** : blog + FAQ + ressources.

1. **Mission 8** — Build Phase 2 : blog migré, FAQ CMS, ressources CMS
2. Intégration du contenu existant de `scripts/seo-geo/` (6 FAQ + 5 pages piliers)
3. Admin Firestore pour Judith dans le Hub V2
4. Maillage interne automatisé

**Durée estimée** : 2-3 semaines.

### Phase 4 — Production de contenu au volume

**Objectif** : atteindre le volume cible FAQ et ressources pour un vrai impact SEO.

1. Génération assistée de 65-85 FAQ avec Claude + review Judith
2. Production des premières ressources (8 idées prioritaires dans section 6.3)
3. Écriture des articles PAA identifiés dans le scouting (10+ articles potentiels)
4. Optimisation SEO (metas, schema, H1, internal linking)

**Durée estimée** : 3-4 semaines (en parallèle possible avec Phase 5).

### Phase 5 — Lancement & migration DNS

**Objectif** : basculer la production.

1. **Mission 9** — Lancement : switch DNS, soumission sitemap, négociation backlink clinique, mise à jour profils externes
2. Monitoring quotidien 2-4 semaines post-lancement
3. Désactivation progressive du Wix

**Durée estimée** : 1 semaine de switch + 4 semaines de monitoring.

### Phase 6 — Cron de fraîcheur, automatisations, optimisations continues

**Objectif** : maintenir le classement dans le temps et itérer sur les données.

1. Crons Vercel pour fraîcheur de contenu (revalidation, sitemap, regénération)
2. Génération périodique assistée de FAQ (Claude propose, Judith valide)
3. Analytics et tracking Plausible
4. A/B testing des CTAs
5. Itérations basées sur Google Search Console

**Durée estimée** : ongoing.

### Estimation globale

**Du lancement de Phase 0 à la mise en production : 10-14 semaines** (2,5 à 3,5 mois).

C'est une estimation saine qui tient compte du temps que Benoit peut consacrer en parallèle de ses autres projets (Grands Ballets, budget CAD, Mon Acupunctrice Hub V2). À compresser possible si on priorise fortement et si on réutilise au maximum le contenu déjà produit dans `scripts/seo-geo/`.

---

## 12. Questions ouvertes à trancher

Les décisions prises en v0.3 sont notées ✅. Les points restants sont à résoudre au fil des phases.

1. ✅ **Blog : on garde les 11 articles existants ou on les réécrit ?** → **On les migre tel quel**. Le contenu est de qualité (co-écrit avec Claire Thomas, rédactrice spécialisée périnatalité). Claire continue à collaborer pour les nouveaux articles.
2. ✅ **Lead magnet oui/non** → **Non au lancement**, cohérent avec le positionnement solidaire. À re-trancher après 6 mois de données.
3. **Page Témoignages séparée ou intégrée ?** — à trancher en Phase 2 selon le volume de témoignages récupérés (Google Maps La Source en Soi + 3 avis Lumino).
4. ✅ **Langue : 100% français ou version anglaise ?** → **100% français** au lancement. Éventuellement version anglaise en Phase 6 si on voit du trafic anglophone organique.
5. ✅ **Module de réservation en iframe vs redirection** → **Redirection vers nouvel onglet**, la friction est transformée en signal de confiance sur la page `/reserver`.
6. ✅ **Gestion du contenu pédiatrique** → **4e pilier à part entière** (décidé post-scouting).
7. ✅ **Tracking analytics** → **Plausible** (respect vie privée, cohérent avec le positionnement, pas de consentement cookies requis).
8. ✅ **Politique cookies** → **Minimale** (Plausible n'en nécessite pas, zéro friction utilisateur).
9. ✅ **DNS** → **Transfert vers Cloudflare en Phase 0** (confirmé chez Wix, à sortir).
10. ✅ **Tu/vous** → **Vous par défaut, je de Judith comme signature**. Tutoiement maintenu sur Instagram pour cohérence communauté.
11. ✅ **Claire Thomas continue** → **Oui, collaboration préservée** pour les articles de fond. Claude + validation Judith pour le volume (FAQ, ressources).
12. ✅ **Upgrade Vercel Pro** → **Non, on reste Hobby**. 100 crons dispo (1×/jour chacun), largement suffisant.
13. ✅ **Outil SEO** → **Ubersuggest Pro ~30 $ pour 1 mois** en Phase 0.
14. ✅ **Contenu `scripts/seo-geo/`** → **Validé par Judith**, à intégrer directement au lancement.
15. **Page `/bienfaits` Wix** — recommandation : démanteler et redistribuer dans les FAQ par pilier. À confirmer quand on aura vu le contenu exact en Mission 1.
16. **Pédiatrie — pratique régulière ou occasionnelle ?** — à confirmer avec Judith en Phase 0 (entretien guide de ton). Le 4e pilier est décidé, mais le volume de contenu dépend de cette réponse.
17. **Pricing plan Wix (sept. 2024)** — probablement obsolète, à confirmer avec Judith et à retirer si non utilisé.
18. **Anecdotes personnelles pour le guide de ton** — Judith est-elle disponible pour ~30 min d'entretien pour en fournir 5-10 ?

---

## 13. Changelog

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 0.1 | 13 avril 2026 | Benoit + Claude | Draft initial |
| 0.2 | 13 avril 2026 | Benoit + Claude | Ajout section 2.1b (Ancrage clinique), ajout section 4.4 (Maillage interne hub-and-spoke), réécriture section 8 (stratégie GEO capitalisant sur La Source en Soi, schema Person+MedicalClinic au lieu de LocalBusiness autonome), réécriture section 9.1 (page /reserver comme landing de confiance qui transforme la friction en signal), réécriture section 9.3 (paramètres Go Rendez-Vous), extension Mission 4 (audit GBP clinique + avis Lumino Health) |
| 0.3 | 13 avril 2026 | Benoit + Claude (post-scouting) | Intégration des 7 rapports de scouting Claude Code. Passage de 3 à **4 piliers** (ajout Acupuncture pédiatrique). Section 1.1 enrichie avec données réelles (27 URLs, 11 articles, CSR Wix Thunderbolt). Section 1.2 avec GBP La Source en Soi confirmé à **4,9/5 · 1 215 avis**, backlink `lasourceensoi.com/equipe/judith-dufour-savard/` identifié comme actif à préserver, DNS confirmé chez Wix, contenu `scripts/seo-geo/` validé. Section 3 réécrite en 4 piliers avec positionnement concurrentiel par pilier. Section 3.2 mots-clés enrichie avec données scouting + catégories pédiatrique et "combien coûte". Section 4.1 arborescence avec `/services/pediatrie` et `/faq/pediatrie`, décision sur `/bienfaits` (démantèlement). **Nouvelle section 4.5** : Architecture technique cohabitation Hub V2 (route group `(public)`, schéma Firestore sans conflit, design tokens, crons Hobby 100×/jour suffisants, stratégie rendu SSG+ISR). Section 5.3 volume FAQ à 65-85. **Section 5.4 réécrite** : guide de ton avec 3 voix identifiées, décision vouvoiement + "je" signature. Section 8 amplifiée (1 215 avis comme levier central). **Nouvelle section 8.1b** : stratégie d'affichage des 1 215 avis sur homepage, services, À propos, /reserver, footer. Section 8.2 GBP avec données réelles, Lumino désinvesti. **Section 10 réécrite** en 9 missions de build concrètes (inventaire Wix, mots-clés Ubersuggest, guide de ton, audit GEO+plan clinique, transfert DNS Cloudflare, architecture Firestore+routes, build pages statiques, build contenu dynamique, lancement). **Section 11 réécrite** en 6 phases d'exécution avec Phase 0 infra (durée estimée 10-14 semaines). Section 12 mise à jour avec 14 décisions tranchées et 4 points restants. |

---

*Fin du document version 0.3*
