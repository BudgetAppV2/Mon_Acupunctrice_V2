# PROOF GRAPH BACKLOG — Signaux Externes & Autorité d'Entité

**Date** : 6 mai 2026
**Source** : Audit Codex AEO 2026-05-06 + userMemories + investigation
**Objectif** : Renforcer l'**autorité de Judith comme entité distincte** (pas juste comme partie de La Source en Soi) auprès des LLMs et moteurs de recherche locaux.

---

## 🎯 Pourquoi le proof graph est critique

**Insight Codex** : *"Les LLMs ne recommandent pas seulement le site parce qu'il parle bien de lui-même. Ils aiment la corroboration externe."*

Concrètement, quand un LLM doit choisir qui recommander pour "acupuncture FIV Montréal", il évalue :

1. ✅ **Cohérence** : le site dit-il la même chose que les annuaires externes ?
2. ✅ **Multiplicité** : combien de sources externes mentionnent cette personne ?
3. ✅ **Qualité** : les sources sont-elles fiables (OAQ, Sun Life, sites santé) ?
4. ✅ **Récence** : les profils sont-ils à jour ?
5. ✅ **Identité unique** : est-ce une entité distincte ou un nom parmi d'autres ?

Si Judith **n'apparaît que sur son propre site**, elle ne sera pas recommandée. Si elle apparaît cohérente sur 8-10 sources externes de qualité, elle deviendra une entité forte.

---

## 📊 État actuel du proof graph (audit Codex)

### ✅ Signaux déjà actifs

| Signal | URL | État |
|---|---|---|
| **OAQ** (numéro A-008-24) | À confirmer présence sur annuaire OAQ public | À vérifier |
| **La Source en Soi** | https://lasourceensoi.com/notre-equipe/ | Profil Judith présent |
| **Lumino Santé (Sun Life)** | https://luminosante.sunlife.ca/.../judith-dufour-savard-1007631-714482/ | Profil + 39 évaluations ✅ |
| **HealthDoc** | https://www.healthdoc.ca/listing/judith-dufour-savard-03d6c9 | Profil + licence OAQ visible ✅ |
| **GoRendezVous** | https://www.gorendezvous.com/lasourceensoi (employeeId=7556837 / eids=175708) | Profil booking actif ✅ |
| **Wikidata** | https://www.wikidata.org/wiki/Q139677208 | Item créé ✅ |
| **Cybo (annuaire local)** | https://www.cybo.com/CA-biz/la-source-en-soi-... | Listing LSSI (pas Judith directement) |
| **Instagram** | @mon_acupunctrice | Actif |
| **YouTube** | @JudithDufourSavard | Actif |
| **Facebook** | id=61562614934143 | Actif |
| **LinkedIn** | judith-dufour-savard-acu | Actif |

### ⚠️ Problèmes identifiés (audit Codex)

1. **Incohérence NAP critique** :
   - Lumino (FR) : code postal `H2G 1K8` ❌
   - Lumino (EN) : code postal `H2G 1K8` ❌
   - Site Judith : `H1Y 1G3` ✅
   - HealthDoc : à vérifier
   - **Action urgente** : harmoniser tous les annuaires sur `H1Y 1G3`

2. **Domaine canonique incohérent** entre `acupuncturejudith.ca` et `www.acupuncturejudith.ca`
   - **Status** : ✅ Corrigé en code (commits AEO Phase 1-3 cette nuit)
   - À propager dans tous les annuaires externes

3. **Identité mélangée Judith ↔ La Source en Soi** :
   - Plusieurs sources renvoient à LSSI sans distinction
   - **Action** : créer plus de signaux qui pointent **directement** sur Judith

### ❌ Signaux manquants ou faibles

| Signal | Priorité | Note |
|---|---|---|
| **Pages Jaunes** (fiche dédiée Judith) | Haute | Bloqué par numéro partagé avec LSSI (cf. userMemories) |
| **Yelp Canada** | Moyenne | Inscription complétée, vérification email pro requise |
| **Bing Places** | Moyenne | Reporté (besoin d'un téléphone distinct) |
| **Apple Maps** | Moyenne | Reporté (besoin d'un téléphone distinct) |
| **Medimap** | Basse | Reporté |
| **Backlinks blogs santé QC** | Haute | Aucun à ce jour |
| **Mentions sage-femmes / doulas / maisons de naissance** | Haute | Aucune à ce jour |
| **Article invité blog santé québécois** | Moyenne | Aucun à ce jour |
| **Interview podcast périnatalité QC** | Moyenne | Aucun à ce jour |
| **Présence sur annuaires sage-femmes** | Haute | À explorer |
| **Présence sur annuaires fertilité QC** | Haute | À explorer |

---

## 📋 Backlog d'actions priorisées

### 🔥 P0 — URGENT (à faire dans 7 jours)

#### ACT-01 : Harmoniser NAP sur Lumino
**Action** : Connectez-vous à Lumino Santé professionnel et corriger le code postal `H2G 1K8` → `H1Y 1G3`. Vérifier aussi version EN.
**Effort** : 15 min
**Impact** : Crucial — incohérence visible aux LLMs et Google Maps
**Status** : ⬜ À faire

#### ACT-02 : Vérifier code postal HealthDoc
**Action** : Confirmer que `H1Y 1G3` est bien affiché. Si non, demander correction.
**Effort** : 10 min
**Status** : ⬜ À faire

#### ACT-03 : Vérifier code postal GoRendezVous
**Action** : Idem. Cohérence NAP partout.
**Effort** : 10 min
**Status** : ⬜ À faire

#### ACT-04 : Harmoniser nom officiel partout
**Action** : Choisir un nom canonique unique (suggestion : "Judith Dufour-Savard, acupunctrice OAQ") et l'utiliser identiquement sur toutes les plateformes.
**Effort** : 20 min
**Status** : ⬜ À faire

### 🔴 P1 — HAUTE (à faire dans 30 jours)

#### ACT-05 : Compléter inscription Yelp Canada
**Action** : Finaliser vérification email pro (`judith@acupuncturejudith.ca` configuré via ImprovMX). Publier description 1480 caractères déjà rédigée.
**Effort** : 30 min
**Impact** : Présence locale + signal fiable
**Status** : ⏳ En cours (dépend vérification email)

#### ACT-06 : Soumettre demande d'indexation Search Console
**Action** : Une fois les fix techniques de la nuit poussés, soumettre les 12 pages prioritaires à Google Search Console.
**Effort** : 30 min
**Impact** : Indexation rapide des nouvelles pages décisionnelles
**Status** : ⬜ À faire après commit

#### ACT-07 : Mise à jour fiche annuaire OAQ
**Action** : Vérifier que la fiche publique OAQ de Judith est à jour : URL site, services, lieux de pratique. Demander correction si nécessaire.
**Effort** : 20 min + délai OAQ
**Impact** : OAQ = source d'autorité maximale en YMYL acupuncture
**Status** : ⬜ À faire

#### ACT-08 : Optimiser Google Business Profile (Phase 2 du plan GBP)
**Action** : Reprendre le PROMPT_CC_GBP_PHASE2_EXECUTION.md (déjà créé). Compléter les items reportés (photos, Q&A pré-publiées, etc.).
**Effort** : 1-2h
**Impact** : Très haut — GBP = signal local #1
**Status** : ⏳ Partiellement fait (cf. transcript jour 2)

#### ACT-09 : Compléter doublon GBP non vérifié
**Action** : Signaler/fermer la fiche GBP doublon (ID 14497141626806718562 avec mauvais code postal H1X 2G3).
**Effort** : 30 min + délai Google
**Impact** : Élimine confusion d'entité
**Status** : ⬜ À faire

#### ACT-10 : Demander 5-10 avis Google patientes
**Action** : Préparer un email/SMS personnalisé à envoyer à 10-15 patientes satisfaites. Lien direct vers fiche Google Reviews.
**Effort** : 30 min rédaction + envoi étalé
**Impact** : Très haut — avis = signal commercial #1 pour LLMs
**Status** : ⬜ À faire

### 🟡 P2 — MOYENNE (à faire dans 60 jours)

#### ACT-11 : Démarrer relation avec sage-femmes / maisons de naissance
**Action** : Identifier 5-10 maisons de naissance et sage-femmes au Grand Montréal. Email de présentation de Judith (ancienne accompagnante en maison de naissance) avec offre de collaboration / ressources éducatives.
**Effort** : 2h recherche + 2h emails
**Impact** : Haut — backlinks de sites périnatalité = autorité maximale
**Status** : ⬜ À faire

#### ACT-12 : Explorer annuaires fertilité Québec
**Action** : Identifier annuaires/communautés FIV/PMA québécois (Procrea Canada, OVO Fertilité, Cliniques de fertilité MTL). Voir si Judith peut être listée comme praticienne complémentaire.
**Effort** : 2h recherche
**Impact** : Très haut pour le Bloc Fertilité (P1-P5)
**Status** : ⬜ À faire

#### ACT-13 : Créer page LinkedIn enrichie
**Action** : LinkedIn actif mais sous-exploité. Publier 1-2 articles/mois (déclinaisons des ressources hub). Booste autorité professionnelle.
**Effort** : 1h/article × 2/mois
**Impact** : Moyen — backlink + signal pro
**Status** : ⬜ À planifier

#### ACT-14 : Soumettre site à annuaires AI-friendly
**Action** : Inscrire Judith sur :
- AI search directories émergents
- Annuaires acupuncture ICS/IVAS (international)
- Annuaires médecines complémentaires (Réseau de la santé alternatif Québec)
**Effort** : 1-2h
**Status** : ⬜ À explorer

#### ACT-15 : Évaluer éligibilité Wikipedia (à manipuler avec prudence)
**Action** : NE PAS créer de page Wikipedia spontanément. Une page créée et supprimée laisse une trace négative et n'aide pas le proof graph.

Étapes :
1. **Évaluer la notoriété indépendante réelle** selon Wikipedia:Notability (en) / Wikipédia:Notoriété des personnes (fr)
2. Critères à valider AVANT toute création :
   - Couverture significative dans plusieurs sources indépendantes et fiables (presse, ouvrages, etc.)
   - Pas seulement des annuaires/profils auto-déclarés
   - 39 évaluations Lumino + Wikidata + OAQ ne suffisent **pas** à eux seuls pour la notoriété Wikipedia
3. Si éligibilité incertaine : **ne pas créer**. Mieux vaut investir dans des backlinks éditoriaux (ACT-16, ACT-17) qui construisent la notoriété d'abord.
4. Si éligibilité claire dans 12-24 mois : envisager une création par éditeur Wikipedia neutre (pas auto-création).

**Effort** : 1h évaluation préalable obligatoire
**Impact** : Très haut **si page accepté et conservée**. Risque réel de suppression et de signaux négatifs si page rejetée.
**Status** : ⬜ À ne PAS prioriser tant que la notoriété indépendante n'est pas construite via ACT-16 et ACT-17 d'abord.
**Note importante** : Wikidata (Q139677208) est déjà actif et n'a pas les mêmes exigences que Wikipedia. Continuer à enrichir Wikidata, c'est un gain garanti sans risque.

### 🟢 P3 — STRATÉGIQUE (à faire dans 90 jours)

#### ACT-16 : Article invité sur blog santé québécois
**Action** : Identifier 3-5 blogs santé québécois (ex: Naître et Grandir, Yoopa, magazines périnatalité). Proposer article invité gratuit sur un sujet d'expertise (grossesse, FIV, etc.).
**Effort** : 4-6h (pitch + rédaction + révision)
**Impact** : Très haut — backlink éditorial de qualité
**Status** : ⬜ À planifier

#### ACT-17 : Interview podcast périnatalité
**Action** : Identifier podcasts QC périnatalité/santé femmes. Proposer interview sur sujet d'expertise.
**Effort** : 2h pitch + 1h enregistrement
**Impact** : Haut — backlink + audio = signal multimédia
**Status** : ⬜ À planifier

#### ACT-18 : Collaboration avec une doula / maison de naissance
**Action** : Si ACT-11 fonctionne, formaliser une collaboration : mentions croisées sur sites web, ressources partagées, références mutuelles.
**Effort** : Variable
**Impact** : Très haut — autorité périnatalité
**Status** : ⬜ Conditionnel à ACT-11

#### ACT-19 : Tester les réponses LLMs et tracker les citations
**Action** : Tous les mois, poser 5-10 prompts cibles dans ChatGPT, Perplexity, Google AI Overviews, Bing Copilot. Documenter si Judith est citée/recommandée.
**Effort** : 30 min/mois
**Impact** : Mesure ROI du proof graph
**Status** : ⬜ À démarrer (cycle mensuel)

**Prompts cibles à tester** :
- "Quelle acupunctrice consulter pour FIV à Montréal ?"
- "Acupuncture pendant la grossesse à Rosemont"
- "Acupunctrice expérimentée en SOPK Québec"
- "Où trouver acupuncture fertilité Montréal"
- "Meilleure acupuncture pour bébé en siège Montréal"

---

## 🚦 Tableau de suivi proof graph

### NAP cohérence (vise 100%)

| Source | Nom | Adresse | Code postal | Téléphone | URL site | Status |
|---|---|---|---|---|---|---|
| Site officiel | Judith Dufour-Savard | 2554 Beaubien Est | H1Y 1G3 | [tel] | acupuncturejudith.ca | ✅ |
| OAQ | À vérifier | À vérifier | À vérifier | À vérifier | À vérifier | ⬜ ACT-07 |
| Lumino FR | Judith Dufour-Savard | À vérifier | ❌ H2G 1K8 | À vérifier | À vérifier | ⬜ ACT-01 |
| Lumino EN | Judith Dufour-Savard | À vérifier | ❌ H2G 1K8 | À vérifier | À vérifier | ⬜ ACT-01 |
| HealthDoc | Judith Dufour-Savard | À vérifier | À vérifier | À vérifier | À vérifier | ⬜ ACT-02 |
| GoRendezVous | À vérifier | À vérifier | À vérifier | À vérifier | À vérifier | ⬜ ACT-03 |
| GBP Judith | À vérifier | À vérifier | À vérifier | À vérifier | À vérifier | ⏳ ACT-08 |
| GBP doublon | — | — | ❌ H1X 2G3 | — | — | À fermer ACT-09 |

### Présence par type de source (vise diversité)

| Type | Cible 90j | Actuel | Manque |
|---|---|---|---|
| Annuaires santé professionnels | 5+ | 3 (Lumino, HealthDoc, GBP) | Yelp + 1 autre |
| Annuaires locaux | 3+ | 1 (Cybo via LSSI) | Pages Jaunes (bloqué), Bing Places, Apple Maps |
| Backlinks éditoriaux | 3+ | 0 | Article invité, podcast, mention périnatalité |
| Réseaux sociaux | 4 | 4 (IG, FB, YT, LinkedIn) | ✅ Complet |
| Sources d'autorité (Wikipedia, OAQ) | 2 | 1 (Wikidata) | OAQ public + Wikipedia (si éligible) |
| Avis publics | 50+ | 39 (Lumino) | +11 minimum, viser Google Reviews |

---

## 📊 KPIs proof graph

Mesurer mensuellement :

1. **NAP consistency score** : % de plateformes externes avec NAP identique au site
   - Cible 30j : 90%
   - Cible 90j : 100%

2. **Number of authoritative mentions** : combien de sources externes de qualité mentionnent Judith
   - Actuel : ~7-8
   - Cible 90j : 15+

3. **AI citation rate** : sur 10 prompts cibles testés mensuellement, combien citent Judith
   - Baseline : à mesurer (Mois 1 = test initial)
   - Cible 90j : 4-6/10

4. **Google Reviews count** : nombre d'avis Google
   - Actuel : à vérifier
   - Cible 90j : 20+

5. **Backlinks count** (via Ahrefs gratuit ou Ubersuggest)
   - Actuel : à mesurer
   - Cible 90j : +5 nouveaux backlinks éditoriaux

---

## 🔗 Liens vers documents associés

- **Source de l'audit** : `../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`
- **Plan d'action 30/60/90** : `../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md § H`
- **Pages décisionnelles** : `DECISION_PAGES_BACKLOG.md` (complémentaire)
- **Workflow production** : `CREATION_WORKFLOW.md`
- **Index général** : `INDEX.md`

---

## 🎯 Note finale stratégique

**Le proof graph est un investissement de longue haleine.** Contrairement à la production de contenu (1 ressource = effet mesurable en 2-3 mois), le proof graph se construit par accumulation lente.

**Règle 80/20** : 20% des actions (ACT-01 à ACT-04 NAP harmonisation, ACT-08 GBP, ACT-10 avis Google) génèrent 80% de l'impact dans les 30 premiers jours.

**Long terme** : ACT-11 (sage-femmes), ACT-15 (Wikipedia), ACT-16 (articles invités), ACT-18 (collaborations) construisent l'autorité durable qui fera **recommander** Judith dans 6-12 mois.
