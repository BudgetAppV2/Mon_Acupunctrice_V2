# Plan éditorial SEO/GEO — acupuncturejudith.ca v2

**Projet** : Migration Wix → Vercel / Next.js (Mon Acupunctrice Hub V2)
**Phase** : 1 — Stratégie éditoriale
**Version** : 0.2 (stratégie GEO capitalisant sur La Source en Soi + maillage interne)
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

Judith Dufour-Savard opère un cabinet d'acupuncture à Rosemont (Montréal) via la clinique La Source en Soi. Son site actuel `acupuncturejudith.ca` est hébergé sur Wix, avec environ 10 articles de blog. Le site est fonctionnel mais :

- Coûte cher pour ce qu'il offre (~25-35 $/mois)
- Offre un contrôle SEO limité
- A une performance Core Web Vitals moyenne (typique Wix)
- N'est pas intégré au reste de l'écosystème numérique de Judith (Mon Acupunctrice Hub V2, réseaux sociaux, automatisations)
- A une présence organique très faible — d'où la décision de traiter cette migration comme **une création de site neuf** plutôt qu'une migration avec enjeu de préservation SEO

### 1.2 Écosystème numérique existant

- **Mon Acupunctrice Hub V2** : application Next.js 15 / Firebase / Vercel qui pilote déjà la création de contenu, la publication multi-plateforme (Instagram, Facebook, YouTube), l'éditeur vidéo, l'éditeur d'image Fabric.js, l'intégration blog Wix
- **Go Rendez-Vous** : système de prise de rendez-vous externe — `gorendezvous.com/lasourceensoi` (Judith employeeId 7556837)
- **Réseaux sociaux** : Instagram `@mon_acupunctrice`, Facebook, YouTube — alimentés par le Hub
- **Google Business Profile** : Judith n'a pas de fiche GBP en propre. La clinique **La Source en Soi** possède une fiche GBP bien établie avec de bons avis — stratégie : capitaliser sur cette réputation plutôt que créer une fiche concurrente. Voir section 8.
- **Lumino Health (Sun Life)** : Judith a une fiche professionnelle sur `luminohealth.sunlife.ca` qui contient potentiellement des avis vérifiés (source de social proof à récupérer)

### 1.3 Objectifs de la migration

**Objectif principal** : Augmenter et optimiser le SEO et le référencement local (GEO) pour générer un flux constant de nouvelles patientes via recherche organique, avec conversion vers la prise de rendez-vous sur Go Rendez-Vous.

**Objectifs secondaires** :

1. Réduire les coûts d'hébergement (économie estimée ~300-400 $/an)
2. Unifier l'écosystème numérique dans un seul stack contrôlé par Benoit
3. Permettre à Judith de gérer le contenu FAQ et ressources directement depuis l'admin du Hub
4. Automatiser la fraîcheur du contenu via cron Vercel pour maintenir le classement SEO dans le temps
5. Intégrer le rôle d'influenceuse de Judith (créatrice de contenu, voix publique) au parcours de conversion
6. Mettre en avant le positionnement différenciant d'**acupuncture sociale** comme angle éditorial unique sur le marché montréalais

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

### 3.1 Structure des trois piliers

Les trois piliers stratégiques du site sont :

**Pilier 1 — Fertilité**
Sous-thèmes provisoires :
- Acupuncture et fertilité naturelle
- Acupuncture et FIV / PMA
- Préparation préconceptionnelle (homme et femme)
- Troubles spécifiques : SOPK, endométriose, aménorrhée, qualité ovocytaire
- Cycle et phases

**Pilier 2 — Grossesse & périnatalité**
Sous-thèmes provisoires :
- Premier trimestre : nausées, fatigue, stabilisation
- Deuxième trimestre : énergie, confort
- Troisième trimestre : positionnement bébé, préparation accouchement, déclenchement
- Post-partum : récupération, allaitement, baby blues, fatigue
- Pédiatrie légère — coliques, sommeil nourrisson *(à confirmer si Judith pratique)*

**Pilier 3 — Acupuncture sociale**
Sous-thèmes provisoires :
- Qu'est-ce que l'acupuncture sociale ? (manifeste)
- Comment fonctionne la tarification solidaire
- Pour qui ? (démystifier, enlever la honte de choisir un tarif bas)
- Acupuncture communautaire vs individuelle
- Engagement dans les organismes / quartier

**Pilier transversal — Autorité locale Montréal / Rosemont**
Ce n'est pas un pilier de contenu à part entière mais une dimension à tisser dans tous les contenus : mentions géographiques, références aux quartiers, ancrage local.

### 3.2 Stratégie mots-clés

> `[MISSION CC]` — Recherche de mots-clés réels nécessaire. Voir section 10.

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

**Long-tail locaux** (sweet spot SEO/GEO)
- *acupuncture fertilité Rosemont*
- *acupunctrice femme enceinte Montréal est*
- *clinique acupuncture tarif social Montréal*

**Keywords "acupuncture sociale"** — terrain probablement vierge
- *acupuncture tarif solidaire Montréal*
- *acupuncture accessible Montréal*
- *acupuncture communautaire Rosemont*

**Keywords de marque** (défensifs)
- *Judith Dufour-Savard*
- *acupuncture Judith*
- *Mon Acupunctrice*
- *La Source en Soi acupuncture*

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
├── /a-propos                        (Bio Judith + approche + formation)
│
├── /services                        (Vue d'ensemble des 3 piliers)
│   ├── /services/fertilite          (Landing SEO fertilité)
│   ├── /services/grossesse          (Landing SEO grossesse & périnatalité)
│   └── /services/acupuncture-sociale (Landing SEO + manifeste)
│
├── /blog                            (Liste articles)
│   └── /blog/[slug]                 (Article individuel)
│
├── /faq                             (Vue d'ensemble FAQ)
│   ├── /faq/fertilite
│   ├── /faq/grossesse
│   ├── /faq/acupuncture-sociale
│   └── /faq/seance                  (À quoi s'attendre, logistique)
│
├── /ressources                      (Guides, check-lists, téléchargeables)
│   └── /ressources/[slug]
│
├── /tarifs                          (Transparence tarifaire + explicitation modèle solidaire)
│
├── /contact                         (Coordonnées, plan, horaires)
│
└── /reserver                        (Page pont → CTA Go Rendez-Vous)
```

**Pages secondaires à considérer** :
- `/dans-les-medias` ou `/communaute` — pour le rôle d'influenceuse (voir section 7)
- `/temoignages` — social proof
- `/mentions-legales`, `/politique-confidentialite` — obligatoires

### 4.2 Logique de navigation

- **Header principal** : À propos, Services (mega-menu 3 piliers), Blog, FAQ, Ressources, **Réserver** (bouton distinct, couleur accent)
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
- **Pilier Acupuncture sociale** : 8-12 questions (plus concentré)
- **Séance & logistique** : 10-15 questions (transversal, utile pour conversion)

**Total cible au lancement : ~55-70 FAQ**. C'est suffisant pour avoir un vrai impact SEO sans que ce soit écrasant à produire.

### 5.4 Tonalité et format

- **Voix de Judith** à la première personne ("Lors de votre première séance, je…")
- **50-300 mots** par réponse — assez long pour Google, pas trop pour le lecteur
- **Ton chaleureux, pédagogique, sans jargon** — cohérent avec le positionnement accessible
- **CTA naturel** en fin de réponse quand pertinent ("Si vous souhaitez explorer cela, vous pouvez réserver une séance…")
- **Liens internes** vers pages services ou blog pertinents

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

Judith n'a pas de Google Business Profile en propre. La clinique **La Source en Soi** possède une fiche GBP bien établie avec de bons avis. La stratégie gagnante ici n'est **pas** de créer une fiche GBP séparée pour Judith (qui serait au même lieu physique et fragmenterait le signal local), mais de :

1. **Tisser le site de Judith à la clinique** via le contenu et le schema.org
2. **Renforcer la fiche GBP existante** de La Source en Soi pour que Judith y soit visible
3. **Récupérer les avis externes** (Lumino Health Sun Life) comme social proof sur le site
4. **Optimiser les landing pages locales** pour que Judith apparaisse dans les SERPs géolocalisées même sans fiche GBP propre

Cette approche est moins courante mais plus défendable sur le plan du signal NAP et plus efficace à court terme.

### 8.2 Leviers GEO à activer

**Schema.org — approche Person + MedicalClinic**

Plutôt qu'un `LocalBusiness` autonome pour Judith (qui concurrencerait la fiche clinique), on utilise une structure imbriquée :

- Schema `Person` pour Judith : nom, image, `jobTitle` "Acupunctrice", `medicalSpecialty` (fertilité, obstétrique, acupuncture), `alumniOf` (formation), `memberOf` (ordre des acupuncteurs)
- Schema `MedicalClinic` pour La Source en Soi : nom, adresse, téléphone, coordonnées géo, horaires, `areaServed`, `priceRange`
- Relation : `Person.worksFor → MedicalClinic`
- Sur les pages services, ajouter un schema `MedicalTherapy` ou `Service` qui pointe vers la Person ET la MedicalClinic

Cette structure permet à Google de comprendre : "Judith est une praticienne spécialisée qui exerce dans cette clinique spécifique" sans créer un doublon de fiche locale.

**Google Business Profile La Source en Soi**

> `[MISSION CC]` — Audit complet de la fiche GBP La Source en Soi, voir Mission 4 section 10.

Actions potentielles (à valider selon l'accès / la coopération) :
- Vérifier que Judith est listée comme praticienne dans la fiche
- Ajouter des photos de Judith si possible
- Stratégie de posts GBP mentionnant Judith pour certains thèmes (fertilité, grossesse)
- Stratégie de réponses aux avis qui mentionnent spécifiquement Judith
- Encourager les patientes satisfaites à laisser un avis GBP en mentionnant Judith dans le texte

Ces actions demandent la coopération de la clinique — à discuter avec la direction de La Source en Soi. Le site de Judith devient un actif complémentaire qui renvoie du trafic qualifié à la clinique, argument de négociation fort.

**Avis Lumino Health (Sun Life)**

Fiche existante : `luminohealth.sunlife.ca/en/health-care-provider-profile/acupuncturist/la-source-en-soi/judith-dufour-savard-1007631-714482/`

Cette fiche contient potentiellement des avis vérifiés sur Judith qui ne sont pas visibles publiquement sans authentification Sun Life. Ces avis sont un actif de social proof à récupérer pour le site — en particulier pour la page `/reserver` et les pages services.

> `[MISSION CC]` — Vérifier l'accès aux avis Lumino Health et élaborer une stratégie de récupération et d'affichage (avec attribution source claire), voir Mission 4 étendue section 10.

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

## 10. Missions de recherche pour Claude Code

Cette section regroupe tous les `[MISSION CC]` du document. Chaque mission est un brief autonome, prêt à copier dans Claude Code.

### Mission 1 — Inventaire complet du Wix actuel

**Objectif** : Savoir exactement ce qu'on a sur le site Wix actuel avant de décider ce qu'on migre, ce qu'on améliore, ce qu'on jette.

**À livrer** :
1. Liste complète des URLs du site Wix (toutes les pages, tous les articles de blog, toutes les pages de services)
2. Pour chaque page : titre, meta description, H1, longueur approximative du contenu, mots-clés apparents
3. Pour chaque article de blog : titre, date de publication, longueur, catégorie, statut SEO, images utilisées
4. Liste des images hébergées (avec URLs originales si possible pour téléchargement)
5. Recensement des éléments spécifiques au thème Wix (widgets, embeds, formulaires) qui devront être recréés
6. Fichier de sortie : `02-recherche/inventaire-wix-actuel.md` + JSON brut exploitable

**Sources** :
- Crawl du site `acupuncturejudith.ca`
- API Wix Blog (utiliser les credentials déjà configurés dans Hub V2)
- Sitemap.xml du site Wix
- Google Search Console si accessible

**Livrable attendu** : un fichier markdown structuré + un JSON brut utilisable pour le script d'import.

---

### Mission 2 — Recherche de mots-clés réels

**Objectif** : Remplacer les hypothèses de mots-clés de la section 3.2 par des données réelles avec volumes et difficulté.

**À livrer** :
1. Pour chaque pilier (fertilité, grossesse, acupuncture sociale), une liste de 30-50 mots-clés réels avec :
   - Volume de recherche mensuel estimé (Canada / Québec)
   - Difficulté concurrentielle estimée
   - Intention de recherche (info / commercial / transactionnel)
   - Top 3 résultats actuels sur Google Canada
2. Collection des "People Also Ask" de Google sur les 10 requêtes les plus importantes par pilier
3. Analyse des recherches Reddit FR (r/Quebec, r/montreal, r/enceinteQC, r/fertilityQC si existe) sur les thèmes des piliers
4. Top 10 questions fréquentes observées dans les forums francophones (Mamanpourlavie, forums Doctissimo FR, etc.)
5. Fichier de sortie : `02-recherche/mots-cles.md`

**Sources à utiliser** :
- Exa Search pour les SERPs et contenu web
- Google Trends (disponibilité Canada)
- Reddit (via recherche Exa ciblée)
- Forums via recherche web
- Outils gratuits : Answer The Public, Ubersuggest version gratuite
- Google Search direct pour les "People Also Ask"

**Note** : ne pas utiliser d'outils SEO payants (Ahrefs, SEMrush) — si les données précises manquent, estimer via heuristiques et noter comme "à valider".

---

### Mission 3 — Analyse concurrentielle Montréal

**Objectif** : Comprendre le paysage concurrentiel réel pour affiner le positionnement et identifier les opportunités.

**À livrer** :
1. Liste des 10-15 principaux concurrents (acupuncteurs Montréal, focus Rosemont/Plateau/Est)
2. Pour chaque concurrent :
   - URL du site, plateforme utilisée (Wix, WordPress, custom)
   - Spécialités affichées
   - Positionnement prix (affiché ou inféré)
   - Structure du site (nombre de pages, présence de blog, FAQ, ressources)
   - Qualité perçue SEO (meta, H1, schema, vitesse)
   - Présence réseaux sociaux
   - Forces et faiblesses
3. Identification des concurrents qui pratiquent une tarification solidaire ou une approche sociale similaire (probablement rares)
4. Identification des "trous" dans le marché que Judith peut exploiter
5. Fichier de sortie : `02-recherche/concurrence.md`

**Sources** :
- Recherches Google Canada : "acupuncture Montréal", "acupuncture Rosemont", "acupuncture fertilité Montréal", etc.
- Pages Jaunes
- Ordre des acupuncteurs du Québec (annuaire)
- Google Maps pour la concentration géographique

---

### Mission 4 — Audit GEO local : clinique La Source en Soi + avis externes

**Objectif** : Comprendre l'état de la réputation locale dont Judith peut hériter, et identifier les social proofs externes à récupérer pour le site.

**À livrer** :
1. **Audit de la fiche Google Business Profile de La Source en Soi** (pas de Judith en propre) :
   - État actuel (vérifiée, complète, active)
   - Nombre d'avis et note moyenne
   - Catégories affichées
   - Qualité des photos
   - Présence de posts réguliers
   - Judith est-elle listée comme praticienne dans la fiche ?
   - Opportunités d'optimisation qui demandent la coopération de la clinique
2. **Récupération des avis Lumino Health** sur `luminohealth.sunlife.ca/en/health-care-provider-profile/acupuncturist/la-source-en-soi/judith-dufour-savard-1007631-714482/` :
   - Nombre d'avis accessibles
   - Note moyenne
   - Extraits citables (avec attribution source)
   - Stratégie de récupération (API Sun Life ? scraping autorisé ? capture manuelle ?)
3. **Inventaire des mentions de Judith sur le web** avec NAP :
   - Pages Jaunes
   - Yelp (si existe)
   - Ordre des acupuncteurs du Québec
   - Facebook (perso et pro)
   - Annuaires santé divers
   - Site de La Source en Soi (page équipe ?)
   - Autres mentions trouvées
4. **Incohérences NAP détectées** entre les différentes mentions
5. **Recommandations d'actions prioritaires** divisées en trois groupes :
   - Actions que Benoit/Judith peuvent faire seuls
   - Actions qui demandent la coopération de La Source en Soi
   - Actions qui demandent la coopération de tiers (annuaires)
6. Fichier de sortie : `02-recherche/audit-geo-local.md`

**Sources** :
- Recherche "La Source en Soi" + "acupuncture Rosemont"
- Recherche "Judith Dufour-Savard acupuncture" + variantes
- Google Maps
- Fiche Lumino Health pointée ci-dessus
- Annuaires cités

---

### Mission 5 — Valider les paramètres Go Rendez-Vous

**Objectif** : Maximiser le contexte passé à Go Rendez-Vous lors de la redirection pour améliorer la conversion et le tracking.

**À livrer** :
1. Liste complète des paramètres URL acceptés par Go Rendez-Vous (company, employee, service, date, etc.)
2. Exemple d'URLs contextualisées par service si possible
3. Possibilité d'iframe vs nouvel onglet
4. Capacité de tracking (UTM params, events)
5. Fichier de sortie : `02-recherche/go-rendezvous-params.md`

**Sources** :
- Documentation Go Rendez-Vous (si existante)
- Inspection de l'URL et des comportements sur la page de réservation actuelle
- Tests avec différents paramètres

---

### Mission 6 — Extraction de la voix de Judith

**Objectif** : Capturer la voix éditoriale de Judith pour que Claude puisse générer du contenu (FAQ, ressources) qui sonne authentiquement comme elle.

**À livrer** :
1. Corpus de 10-20 textes écrits par Judith (articles de blog existants, captions Instagram, site actuel)
2. Analyse stylistique : vocabulaire récurrent, tournures préférées, ton, niveau de formalité, usage du "je" vs "nous", mots-clés émotionnels
3. "Voice guide" : 2-3 pages synthétisant sa voix pour guider la génération de contenu futur
4. Exemples de "à faire" et "à ne pas faire"
5. Fichier de sortie : `02-recherche/voix-judith.md`

**Sources** :
- Blog Wix actuel
- Posts Instagram récents (via API déjà intégrée au Hub)
- Captions de Reels publiés

---

### Mission 7 — Consolidation des handles et présences sociales

**Objectif** : Avoir une source de vérité unique sur les comptes actifs de Judith pour l'intégration dans le site.

**À livrer** :
1. Liste de tous les comptes sociaux actifs (Instagram, Facebook, YouTube, TikTok si existant, LinkedIn)
2. URLs canoniques et handles
3. Distinction perso vs pro si pertinent
4. Fréquence de publication observée
5. Contenu phare récent (top Reels, top posts) pour potentielle mise en avant sur le site
6. Fichier de sortie : `02-recherche/handles-sociaux.md`

---

## 11. Prochaines étapes

### 11.1 Immédiat (cette semaine)

1. **Valider ce document avec Benoit** — ajuster les sections qui ne cadrent pas avec la vision
2. **Créer la structure de dossier** `Documents/migration-wix/` avec les sous-dossiers
3. **Lancer Mission 1** (inventaire Wix) — c'est le bloqueur principal pour avancer
4. **Lancer Mission 6** (voix de Judith) en parallèle — peut se faire sans dépendance

### 11.2 Court terme (2-3 prochaines semaines)

1. Compléter Missions 2, 3, 4, 5, 7
2. Étoffer ce document avec les données des missions
3. Produire la version 1.0 du plan éditorial
4. Passer à la Phase 2 : architecture technique (schéma Firestore définitif, routes, specs de composants)

### 11.3 Moyen terme

1. Phase 3 : build sur staging
2. Phase 4 : premier batch de contenu FAQ + ressources
3. Phase 5 : lancement
4. Phase 6 : cron de fraîcheur et itérations

---

## 12. Questions ouvertes à trancher

À garder en tête et à résoudre au fil des phases :

1. **Blog : on garde les ~10 articles existants ou on les réécrit pour la v2 ?** — Dépend de la qualité SEO actuelle. À décider après Mission 1.
2. **Lead magnet oui/non** (section 6.4) — provisoirement non, à re-trancher après 3-6 mois de données.
3. **Page "Témoignages" séparée ou intégrée ?** — dépend du volume de témoignages disponibles.
4. **Langue : 100% français ou version anglaise ?** — provisoirement 100% français (marché cible francophone Montréal), mais à considérer pour plus tard.
5. **Module de réservation en iframe vs redirection** — dépend de Mission 5.
6. **Gestion du contenu pédiatrique** (coliques, sommeil nourrisson) — est-ce dans le pilier Grossesse/périnatalité ou à part ? À clarifier avec Judith.
7. **Tracking analytics** : GA4, Plausible, ou les deux ? — Plausible est plus respectueux de la vie privée, cohérent avec le positionnement.
8. **Politique cookies** : minimale (Plausible n'en nécessite pas) ou complète (GA4 exige consentement) ?

---

## 13. Changelog

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 0.1 | 13 avril 2026 | Benoit + Claude | Draft initial |
| 0.2 | 13 avril 2026 | Benoit + Claude | Ajout section 2.1b (Ancrage clinique), ajout section 4.4 (Maillage interne hub-and-spoke), réécriture section 8 (stratégie GEO capitalisant sur La Source en Soi, schema Person+MedicalClinic au lieu de LocalBusiness autonome), réécriture section 9.1 (page /reserver comme landing de confiance qui transforme la friction en signal), réécriture section 9.3 (paramètres Go Rendez-Vous), extension Mission 4 (audit GBP clinique + avis Lumino Health) |

---

*Fin du document version 0.1*
