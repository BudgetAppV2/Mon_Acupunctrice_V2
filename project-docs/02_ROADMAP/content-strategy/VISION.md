# Content Strategy Pipeline — Vision Document

**Date** : 16 avril 2026
**Auteur** : Benoit + Claude Desktop (session strategique)
**Objectif** : Transformer le site acupuncturejudith.ca en hub de contenu autoritaire pour le SEO + GEO, avec un pipeline d'injection programmatique depuis le Hub admin.

---

## Contexte

Le site public est construit (76 pages, Lighthouse 96/100/100, 15+ Schema.org).
Le Hub admin a un pipeline social complet (idees → calendrier → editeur → publication IG/FB/YT).
Mais il n'y a AUCUN pont entre les deux : pas de CMS pour le site public, pas d'analytics, pas de workflow de contenu structuré.

### Le gap strategique

Judith a un site SEO-optimisé mais statique. Pour que le site RANKE et soit CITÉ par les LLMs, il faut du contenu frais, structuré, avec citations scientifiques, publié regulierement. Ce contenu doit etre injectable de maniere programmatique par Benoit, sans toucher au code.

### La concurrence

Aucun acupuncteur a Montreal n'a un site avec :
- Des pages ressources de 2500 mots avec citations PubMed
- Du Schema.org FAQPage sur chaque page
- Du contenu structuré pour les LLMs (reponses directes, donnees chiffrees)
- Un pipeline de publication automatisé

C'est un avantage asymetrique si on l'exploite.

---

## Architecture cible — 5 modules

### Module 1 : CMS Admin (Blog + FAQ + Ressources)

**But** : Benoit peut creer/editer/publier du contenu sur le site public depuis le Hub admin.

**Ce qui existe** :
- BlogEditor (TiptapEditor) dans /blogue → publie vers Wix
- generate-blog-faq API (Claude API, genere 3 FAQ par article)
- Types Firestore : PublicBlog, FAQ, Ressource (avec PublicationStatus workflow)
- Helpers serveur : public-blog.ts, public-faq.ts, public-ressources.ts

**Ce qui manque** :
- Route admin pour creer/editer des FAQ (CRUD Firestore collection `faqs`)
- Route admin pour creer/editer des Ressources (CRUD Firestore collection `ressources`)
- Modifier blog/publish pour ecrire vers Firestore `publicBlog` au lieu de Wix
- Preview du contenu avant publication (rendu markdown en live)

**Milestones** :
- MW-E3 : Blog publish → Firestore (rerouter l'existant)
- MW-E1 : Admin FAQ CRUD
- MW-E2 : Admin Ressources CRUD (le plus complexe, 7 sections markdown + citations + faqEntries)
- MW-E4 : Workflow review UI (draft → pending → published)

### Module 2 : Pipeline de recherche de contenu

**But** : Identifier les mots-clés et sujets a couvrir, planifier les sessions de recherche.

**Workflow type** :
1. Benoit ouvre une session Claude Desktop
2. Recherche PubMed + Google PAA (People Also Ask) pour un sujet (ex: "acupuncture endometriose")
3. Genere une ressource structurée de 2500 mots avec citations
4. Injecte le contenu via le CMS admin du Hub
5. Le site se rafraichit automatiquement (ISR 1h)

**Ce qu'on pourrait automatiser** :
- API route /api/research-topic qui :
  - Cherche PubMed via E-utilities API (gratuit)
  - Genere un brouillon de ressource via Claude API
  - Pre-remplit le formulaire CMS
- Mais la validation humaine reste obligatoire (Benoit review avant publish)

**Backlog de sujets** (recherche a faire) :
- Endometriose + acupuncture
- SOPK (syndrome ovaires polykystiques)
- Douleur chronique / fibromyalgie
- Sciatique grossesse
- Insomnie enfant
- Preparation accouchement / induction
- Post-FIV soutien
- Menopause
- Migraines
- Reflux gastrique bebe
- Allergie saisonniere
- Stress chronique / burnout
- Arret tabagique
- Douleur menstruelle (dysmenorrhee)
- Acupuncture et cancer (soins de support)

### Module 3 : Blog → Social pipeline

**But** : Chaque article de blog publie genere automatiquement du contenu social.

**Ce qui existe** :
- Pipeline social complet (idees → calendrier → editeur → publication)
- generate-caption API (Claude API)
- Cron publish vers IG/FB/YT

**Ce qui manque** :
- Webhook ou trigger quand un article blog est publié dans Firestore
- API route qui genere un post social (caption + image) a partir du blog post
- Lien entre contentItems (social) et publicBlog (site)

**Flux** :
1. Blog post publié dans Firestore `publicBlog`
2. Cloud Function ou API route detecte la publication
3. Genere une caption IG + cree un contentItem avec lien vers l'article
4. Le contentItem est planifie dans le calendrier social
5. Benoit valide et publie (ou auto-publish via cron)

### Module 4 : Analytics dashboard (Plausible + Hub)

**But** : Voir les metriques du site public dans le Hub admin.

**Ce qui manque** :
- Compte Plausible (gratuit self-hosted ou 9$/mois cloud)
- Script Plausible dans le layout public
- API Plausible → affichage dans le Hub (/stats ou nouvel onglet /site-stats)

**Metriques a suivre** :
- Visiteurs uniques / jour
- Top pages d'entree (quelles ressources performent)
- Sources de traffic (google organic, referral, social, AI/LLM)
- Taux de conversion vers /reserver (goal tracking)
- Mots-cles (via Google Search Console integration)

### Module 5 : Maillage interne automatique

**But** : Chaque nouveau contenu s'integre automatiquement dans le reseau de liens internes.

**Ce qui existe** :
- Cross-linking manuel (relatedServices, relatedArticles, relatedFaqs dans les types)
- Architecture hub-and-spoke (services → ressources → blog)

**Ce qui manque** :
- Logique automatique : quand une ressource est publiee, elle s'ajoute automatiquement aux "Related" des pages services correspondantes
- Composant RelatedContent dynamique (query Firestore par pilier, affiche les 3-4 contenus les plus pertinents)
- Actuellement c'est hardcode dans les pages services

---

## Prioritisation

### Phase 1 — Rendre le site vivant (semaine 1-2 post-launch)
1. **MW-F3** Plausible Analytics (~1h) — mesurer des le jour 1
2. **MW-E3** Blog publish → Firestore (~4-6h) — Benoit peut publier des articles
3. Google Business Profile pour Judith (manuel, 2h)
4. Google Search Console (soumettre sitemap)

### Phase 2 — CMS complet (semaine 3-4)
5. **MW-E1** Admin FAQ CRUD (~3h)
6. **MW-E2** Admin Ressources CRUD (~6h)
7. **MW-E4** Workflow review UI (~3h)

### Phase 3 — Injection de contenu (mois 2-3)
8. Sessions de recherche avec Claude Desktop (3-4h par session, 3-5 ressources par session)
9. Objectif : 20 ressources totales + 20 FAQ + 20 articles blog

### Phase 4 — Automatisation (mois 3-4)
10. Blog → Social pipeline (trigger + caption gen + contentItem creation)
11. Analytics dashboard dans le Hub
12. Maillage interne dynamique (RelatedContent component)

---

## Metriques de succes

| Metrique | Baseline (launch) | Objectif 3 mois | Objectif 6 mois |
|---|---|---|---|
| Pages indexees Google | 29 | 50+ | 80+ |
| Ressources publiees | 5 | 20 | 35 |
| FAQ publiees | 6 | 25 | 50 |
| Articles blog | 11 | 25 | 40 |
| Visiteurs/mois (Plausible) | 0 | 500 | 2000 |
| Rendez-vous/mois via site | 0 | 5 | 15 |
| Mots-cles rankant top 10 | 0 | 10 | 30 |

---

## Mission CC recommandee

Avant de coder quoi que ce soit, CC devrait faire un audit technique complet :

1. Lire ce document (VISION.md)
2. Auditer le BlogEditor actuel et le flow Wix
3. Auditer les types Firestore (PublicBlog, FAQ, Ressource) et les helpers serveur
4. Auditer le pipeline social existant (contentItems, cron publish, caption gen)
5. Proposer l'architecture technique des 5 modules
6. Estimer l'effort par module
7. Identifier les dependances et l'ordre d'execution

La sortie attendue : un document ARCHITECTURE.md avec les API routes, composants, et schemas Firestore necessaires pour chaque module.

