# INDEX — Stratégie de Contenu acupuncturejudith.ca

**Dernière mise à jour** : 6 mai 2026
**But de ce document** : carte de navigation pour tous les documents stratégiques de production de contenu. Si tu cherches quelque chose, commence ici.

---

## 🔥 État actuel — Day 4 (6 mai 2026, soir)

### ✅ Pipeline cover generation : LIVE & validé
Le pipeline `/api/cover/generate` est opérationnel sur `main` (commits `e416344`, `5130968`, `b782fa9`, `542ee21`). Génère cover 1920×1080 + story 1080×1920 en 2-7s avec upload Firebase Storage. Bouton CTA story aligné avec linkSticker instagrapi pour les liens cliquables invisibles. Banque hybride 7 SVG vectoriels + 38 JPG chroma key.

🎯 **Voir `HANDOFF.md` pour l'état des lieux complet** (specs validées, phases restantes, démarrage prochaine session).

### 🤔 2 directions au choix pour prochaine session

**Direction A — Suite pipeline cover** (Phase 2-5)
- Phase 2 : anti-répétition `usedInArticles[]` (1-2h)
- Phase 3 : Modal Hub `/contenu` 4 propositions (3-4h)
- Phase 4 : Bridge ressource → séquence sociale 4 slots avec ctaMode (2-3h)
- Phase 5 : `JUDITH_PUBLICATION_GUIDE.md` (1h)
- **Quand** : pour mettre l'outil dans les mains de Judith

**Direction B — Stratégie autorité (Plan opérationnel 90j)**
🎯 **Voir `PROOF_GRAPH_OPERATIONAL_PLAN.md` Chantier 1**

À faire prioritairement (Chantier 1 = pré-requis pour tous les autres) :

1. 🔥 **Créer `ENTITY_SOURCE_OF_TRUTH.md`** avec NAP canonique + 3 bios (courte 300 / moyenne 800 / longue 1500 caractères)
2. 🔥 **Corriger NAP** sur Lumino FR + EN : `H2G 1K8` → `H1Y 1G3`
3. 🔥 **Vérifier + harmoniser** HealthDoc, GoRendezVous, OAQ, La Source en Soi, GBP, LinkedIn
4. 🔥 **Préparer lien Google Reviews** + liste segmentée 30 patientes (Chantier 2)
5. 📊 **Test baseline citations LLMs** — 10 prompts, mesurer combien mentionnent Judith aujourd'hui

⚠️ **Règle d'or** : NE PAS lancer Chantier 4 (pages décisionnelles comme P1 FIV) tant que Chantier 1 (NAP cohérent) n'est pas complet. Une page décisionnelle qui annonce Rosemont H1Y 1G3 alors que Lumino dit encore H2G 1K8 = signal incohérent pour les LLMs.

### Les 2 directions sont indépendantes
Tu peux faire l'une, l'autre, ou les deux en parallèle. Le pipeline cover ne dépend pas du NAP, et le NAP ne dépend pas du pipeline.

---

## 🎯 Objectif global

**Faire recommander Judith Dufour-Savard par les LLMs (ChatGPT, Perplexity, Google AI, Claude) sur les requêtes santé femmes au Québec** — pas seulement comme source citée, mais comme praticienne à consulter.

Pour ça, on optimise sur **deux axes complémentaires** :

1. **Contenu informationnel/scientifique** (clusters thématiques) → fait *citer le site comme source*
2. **Contenu décisionnel/local + signaux externes** (proof graph) → fait *recommander Judith comme praticienne*

**Bascule actuelle** : 60% décisionnel / 40% informationnel pour les 3 prochains mois.

---

## 🚀 Ordre de lecture par contexte

### Si tu reprends le projet après plusieurs jours/semaines
Lis dans cet ordre, ~30-45 min total :

1. **`HANDOFF.md`** (15 min) — état des lieux complet, décisions récentes
2. **Cet INDEX** (5 min) — pour situer les autres docs
3. **`CREATION_WORKFLOW.md`** (10 min) — le pipeline en mode opérationnel
4. **`../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`** (15 min) — l'audit Codex (référence pour AEO/GEO/SEO local)

### Si tu veux PRODUIRE du contenu maintenant
1. **`CREATION_WORKFLOW.md`** — méthodologie et template de processus
2. **`KEYWORD_BACKLOG.md`** — 82 keywords classés par pilier, choisir un sujet
3. **`../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md` § G** — la liste prioritaire des nouvelles pages (Codex)
4. **`content/README.md`** (à la racine du projet) — doc technique du pipeline d'injection
5. **`content/ressources/_TEMPLATE.md`** — template de ressource

### Si tu veux PUBLIER une cover/visuel
1. **`STYLE_GUIDE_VISUEL.md`** — palette officielle, ESQ, contraintes
2. **`CURATION_GUIDE.md`** — termes Freepik si tu ajoutes des assets
3. **`HANDOFF.md` § Cover Generation** — état du POC Satori
4. **`CC_PROMPT_PIPELINE.md`** — prompt pour Claude Code (pipeline production)

### Si tu veux comprendre la STRATÉGIE de fond
1. **`VISION.md`** — vision long-terme, positionnement
2. **`ARCHITECTURE.md`** — architecture technique du contenu (collections Firestore, schemas)
3. **`../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`** — audit complet Codex (scores AEO/SEO/Entity/AI Citation)
4. **`UBERSUGGEST_COMPETITOR_RAW.md`** — analyse concurrentielle

### Si tu veux briefer Claude Code
1. **`CC_PROMPT_PIPELINE.md`** — prompt structuré pour Phase 1 cover generation
2. **`HANDOFF.md`** — contexte général à donner avant tout prompt CC

---

## 📚 Inventaire complet des documents

### 🎯 Stratégie & vision (le "pourquoi")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| `VISION.md` | 193 | 2026-05-01 | Vision long-terme, positionnement, audience cible |
| `ARCHITECTURE.md` | 533 | 2026-05-01 | Architecture technique du contenu (collections Firestore, schemas) |
| `../../01_PRODUCT/CONTENT_STRATEGY.md` | 182 | 2026-03-22 | Stratégie content product-level (plus ancien, à consolider) |

### 🔑 Recherche keyword & marché (le "quoi cibler")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`KEYWORD_BACKLOG.md`** ⭐ | 767 | 2026-05-01 | Backlog 82 keywords par pilier, volume Ubersuggest, difficulty, intent, priorité |
| `ATP_RAW_DATA_R2.md` | 468 | 2026-05-01 | Données AnswerThePublic round 2 (questions par pilier) |
| `ATP_RAW_DATA_R3.md` | 604 | 2026-05-01 | Données ATP round 3 (questions raffinées) |
| `UBERSUGGEST_COMPETITOR_RAW.md` | 395 | 2026-05-01 | Analyse concurrentielle (Synergek, Sino-Santé, etc.) |
| `backlinks-lasourceensoi-raw.csv` | — | 2026-05-01 | Backlinks bruts LSSI |

### 🛠️ Workflow & production (le "comment faire")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`CREATION_WORKFLOW.md`** ⭐ | 280 | 2026-05-05 | Pipeline complet de création (méthodologie + 6 clusters + calendrier) |
| `../../../content/README.md` ⭐ | 430 | 2026-05-01 | Doc technique du pipeline content (template, voix Judith, déontologie OAQ, scripts inject.mjs/audit-freshness.mjs/retire.mjs) |
| `../../../content/ressources/_TEMPLATE.md` | 73 | 2026-05-01 | Template ressource avec 8 sections |
| `../../../content/faq/_TEMPLATE.md` | 46 | 2026-05-01 | Template FAQ |
| `../../PROMPT_CC_TEMPLATE_RESSOURCE.md` | — | 2026-04 | Prompt CC pour template (legacy) |

### 🎨 Visual & branding (le "visuellement")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`STYLE_GUIDE_VISUEL.md`** ⭐ | 431 | 2026-05-05 | Audit 11 covers + ESQ + palette officielle + approche banque Freepik |
| `CURATION_GUIDE.md` | 276 | 2026-05-05 | Termes Freepik par pilier + workflow curation |
| `../../01_PRODUCT/STRATEGIE/CANVA_TEMPLATES_GUIDE.md` | — | — | Guide Canva (legacy, avant Freepik+Satori) |

### ⚙️ Pipeline production (le "comment générer une cover/story")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`HANDOFF.md`** ⭐⭐ | 333 | 2026-05-06 | État des lieux post-Phase 1 + migration SVG. Pipeline live sur main, specs validées, modes CTA, banque hybride 7 SVG + 38 JPG, integration instagrapi, decisions architecturales, 5 phases restantes, demarrage prochaine session. **À LIRE EN PREMIER** pour reprendre le pipeline cover. |
| `CC_PROMPT_PIPELINE.md` | 398 | 2026-05-05 | Brief structuré Claude Code (utilisé pour Phase 1, à actualiser pour Phase 2-5). Specs strictes par fichier, règle templates non-modifiables. |

### 🚀 Plans opérationnels (le "comment exécuter semaine par semaine")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`PROOF_GRAPH_OPERATIONAL_PLAN.md`** ⭐ | 491 | 2026-05-06 | Programme opérationnel 90 jours basé sur retour Codex. 4 chantiers (Cohérence d'entité, Avis Judith, Mentions/backlinks, Pages décisionnelles), planning détaillé semaine par semaine, scorecard mensuel, templates emails patientes + partenaires. Complète `PROOF_GRAPH_BACKLOG.md` qui reste le catalogue exhaustif. |

### 🤝 Reprise de session & briefs CC (le "où on en est")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`HANDOFF.md`** ⭐ | 283 | 2026-05-05 | État des lieux complet pour reprendre — décisions, prochaines étapes, état technique |
| **`CC_PROMPT_PIPELINE.md`** ⭐ | 398 | 2026-05-05 | Prompt structuré Claude Code pour Phase 1 cover generation |
| `../../HANDOFF_DESKTOP_2026-04-29.md` | — | 2026-04-29 | Handoff précédent (legacy) |
| `../../PROMPT_CC_*.md` (multiples) | — | — | Prompts Claude Code historiques (Phase 1 finitions, AEO Phases, etc.) |

### 🔍 Audits externes (les "regards critiques")

| Fichier | Lignes | Date | Contenu |
|---|---|---|---|
| **`../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`** ⭐ | 478 | 2026-05-06 | Audit Codex complet AEO/GEO/SEO local. **Scores audit initial** : AEO 74/100, SEO local 66/100, Entity Clarity 78/100, AI Citation 72/100. *Score live post-corrections AEO Phases 1-3 : estimé ~86/100 (à reconfirmer par re-audit).* **Section G = liste prioritaire des nouvelles pages à créer**. Section H = plan 30/60/90 jours. |
| `../../01_PRODUCT/STRATEGIE/SEO_AUDIT_ACUPUNCTUREJUDITH.md` | — | — | Audit SEO précédent (legacy, à comparer) |

---

## 🗺️ Carte des correspondances "Je cherche X, où aller ?"

| Tu cherches... | Va dans... |
|---|---|
| Un keyword pour un nouveau sujet | `KEYWORD_BACKLOG.md` (par pilier, scoré) |
| Une question fréquente d'utilisatrices | `ATP_RAW_DATA_R3.md` (round 3 = plus raffiné) |
| Une nouvelle page prioritaire à créer | `AUDIT_AEO § G` (Codex a déjà fait la liste, 12 pages priorisées) |
| Le calendrier de production des 6 clusters | `CREATION_WORKFLOW.md § 4` |
| La voix de Judith calibrée | `content/README.md § "Voix de Judith"` |
| Les contraintes déontologiques OAQ | `content/README.md § "Déontologie"` ET `CREATION_WORKFLOW.md § 3` |
| Le template d'une ressource | `content/ressources/_TEMPLATE.md` |
| Le template d'une FAQ | `content/faq/_TEMPLATE.md` |
| Comment injecter un markdown dans Firestore | `content/README.md § "Pipeline inject"` |
| Comment générer une cover visuelle | `HANDOFF.md § Cover Generation` puis `CC_PROMPT_PIPELINE.md` |
| La palette officielle de couleurs | `STYLE_GUIDE_VISUEL.md § "Palette officielle"` |
| Quels assets Freepik downloader | `CURATION_GUIDE.md § "Termes par pilier"` |
| Les scores AEO/SEO actuels du site | `AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md § A` |
| Le plan d'action 30/60/90 jours | `AUDIT_AEO § H` |
| L'analyse concurrentielle | `UBERSUGGEST_COMPETITOR_RAW.md` |
| Le plan opérationnel proof graph 90 jours | `PROOF_GRAPH_OPERATIONAL_PLAN.md` (par chantier 1-4) |
| L'état du pipeline cover/story (specs, phases) | `HANDOFF.md` (Day 4 état post-Phase 1) |
| Comment tester l'API cover en local | `HANDOFF.md` § "Comment tester en local" |
| Specs visuelles validées des 2 templates | `HANDOFF.md` § "Specs visuelles validees" |
| Templates emails patientes (avis Google) | `PROOF_GRAPH_OPERATIONAL_PLAN.md` § Chantier 2 |
| Templates emails partenaires (backlinks) | `PROOF_GRAPH_OPERATIONAL_PLAN.md` § Chantier 3 |
| L'historique des décisions de cette session | `HANDOFF.md § "Décisions architecturales"` |
| Un prompt pour briefer Claude Code | `CC_PROMPT_PIPELINE.md` |

---

## 📋 État de la production de contenu

### Contenu publié (sur le site live)
- 5 ressources existantes (fertilité, grossesse, pédiatrie, santé mentale, acupuncture sociale)
- 1 ressource template-conforme (`acupuncture-menopause.md`) — *non déclarée dans schema, status interne*
- 9 FAQ préparées
- Pages services : fertilité, grossesse, sociale, etc.
- 3 articles blog (slugs accents URL-encodés) : `bébé-siège-acupuncture`, `préparation-accouchement-induction-acupuncture`, `l-acupuncture-sociale-pratique-essentielle-pour-la-communauté` — tous accessibles en 200 via redirects 308 depuis slugs ASCII propres

### Contenu produit cette session (en attente d'injection)
- ⏳ **Refresh/refonte pending** de la ressource grossesse existante : `content/ressources/acupuncture-grossesse-montreal.md` (3000 mots, 6 PubMed citations) — version enrichie avec citations récentes 2024-2025, à injecter pour remplacer la version live actuelle (cf. workflow `pending → review Hub → published → ISR`)
- ⏳ Cluster 1 reste à produire : 4 FAQ standalone (400-700 mots) + 1 article blog
- ⬜ Clusters 2-6 : à produire (nouvel ordre Codex : FIV/SOPK/endo en priorité, cf. `CREATION_WORKFLOW.md § 5`)

### Contenu prioritaire identifié par Codex (à créer)
Voir `AUDIT_AEO § G` pour la liste complète. Top priorité haute :

1. `/services/acupuncture-fiv-montreal` (page service) ⬜
2. `/services/acupuncture-fertilite-rosemont` (page service locale) ⬜
3. `/ressources/acupuncture-iui-insemination-montreal` ⬜
4. `/ressources/acupuncture-sopk-fertilite` ⬜
5. `/ressources/acupuncture-endometriose-fertilite` ⬜
6. ~~Fix `/blog/bebe-siege-acupuncture`~~ ✅ Corrigé (redirect 308 actif vers slug existant)
7. ~~Fix `/blog/preparation-accouchement-acupuncture`~~ ✅ Corrigé (redirect 308 actif)
8. ~~Fix `/blog/acupuncture-sociale`~~ ✅ Corrigé (redirect 308 actif)

**Note** : les 3 blog fixes ont été résolus par les commits AEO Phases 1-3 de la nuit du 5-6 mai 2026 (redirects 308 depuis slugs ASCII vers les slugs originaux URL-encodés). Une refonte de contenu ultérieure de ces 3 articles reste possible mais non urgente.

---

## ✅ Documents finalisés cette session (6 mai 2026)

| Document | Description | Status |
|---|---|---|
| `INDEX.md` | Carte de navigation par contexte + glossaire AEO/GEO + Focus 7 jours | ✅ Livré |
| `CREATION_WORKFLOW.md` v2 | Refonte intégrant feedback Codex (60/40 décisionnel/info, FAQ embarquée vs standalone, lexique OAQ-friendly, réordonnancement clusters FIV/SOPK/endo, calendrier 30/60/90j) | ✅ Livré |
| `DECISION_PAGES_BACKLOG.md` | 12 pages priorisées (P1-P12) + templates page service décisionnelle / page ressource décisionnelle + lexique spécifique | ✅ Livré |
| `PROOF_GRAPH_BACKLOG.md` | Catalogue exhaustif 19 actions externes (ACT-01 à ACT-19) priorisées P0-P3 | ✅ Livré |
| `PROOF_GRAPH_OPERATIONAL_PLAN.md` | **NOUVEAU** Plan opérationnel 90j basé sur retour Codex : 4 chantiers, planning semaine/semaine, scorecard mensuel, templates emails | ✅ Livré |
| `acupuncture-grossesse-montreal.md` v2 | Audit YMYL : 15 formulations adoucies (passe le test "citation hors contexte LLM") | ✅ Livré |
| `HANDOFF.md` Day 4 (refonte) | État des lieux post-Phase 1 + migration SVG. Specs strictes, decisions architecturales, 5 phases restantes | ✅ Livré |
| `lib/cover-generator/` + API + 2 templates | Pipeline production cover 1920×1080 + story 1080×1920 (Phase 1 + 2 fixes critiques) | ✅ Live sur main |
| Migration SVG hybride (7 SVG / 38 JPG) | Script `convert-eps-to-svg.py` + filtrage automatique stroke-based | ✅ Livré |

## 🚧 Documents à créer prochainement

| Document | Description | Priorité |
|---|---|---|
| `ENTITY_SOURCE_OF_TRUTH.md` | NAP canonique + 3 bios (300/800/1500 caractères) — prérequis Chantier 1 du plan opérationnel | 🔥 Semaine 1 |
| Page pilote `/services/acupuncture-fiv-montreal` (P1) | Première page décisionnelle — démonstrateur du nouveau workflow | Semaines 2-4 (après Chantier 1) |
| `JUDITH_PUBLICATION_GUIDE.md` | Doc utilisatrice pour Judith (workflow Hub, approbation, schema decommenter) | Après production initiale |

---

## 📖 Glossaire utile

- **AEO** : Answer Engine Optimization — optimisation pour les moteurs de réponse IA (ChatGPT, Perplexity, Google AI Overviews)
- **GEO** : Generative Engine Optimization — synonyme d'AEO, terme alternatif
- **SEO local** : optimisation pour requêtes géolocalisées (ex : "acupunctrice Montréal")
- **Entity Clarity** : à quel point un moteur identifie clairement Judith comme entité distincte (vs confusion avec La Source en Soi)
- **Topic Cluster** : 1 ressource hub + N FAQ + 1 article blog sur un même sujet
- **Pillar / Pilier** : grand thème (grossesse, fertilité, pédiatrie, anxiété-sommeil, ménopause, acupuncture sociale)
- **shortAnswer** : champ de la ressource avec une réponse de 2-3 phrases citables par les LLMs
- **YMYL** : Your Money or Your Life — contenu santé/finance qui doit respecter standards Google E-E-A-T
- **Proof graph** : ensemble des signaux externes (annuaires, backlinks, mentions) qui valident l'autorité d'une entité
- **Pending → Published** : workflow de validation (markdown → inject status pending → Judith approuve → published → ISR)
- **OAQ** : Ordre des acupuncteurs du Québec (Judith : numéro A-008-24)

---

## 🚦 Conventions

- ⭐ = document de référence prioritaire (à lire en premier)
- ⏳ = en cours de production
- ⬜ = pas commencé
- ✅ = terminé
- **NOUVEAU** = créé suite au feedback Codex du 2026-05-06

---

## 🆘 En cas de doute

Si tu ne sais pas où chercher : commence par **`HANDOFF.md`**, c'est toujours la photo la plus récente de la situation.

Si tu veux discuter stratégie : ouvre une conversation Claude Desktop, charge ce INDEX + HANDOFF, et je peux t'orienter.

Si tu veux exécuter du code : utilise Claude Code avec un prompt qui charge `CC_PROMPT_PIPELINE.md` ou un autre prompt structuré.
