# CREATION WORKFLOW v2 — Production de Contenu acupuncturejudith.ca

**Date** : 6 mai 2026 (révisé suite audit Codex et feedback stratégique)
**Version** : 2.0
**Objectif** : Pipeline reproductible pour produire ressources hub + FAQ + articles blog + **pages décisionnelles**, en mode `pending` Firestore, pour validation Judith via Hub.

---

## 🎯 Objectif global stratégique

**Faire recommander Judith par les LLMs (ChatGPT, Perplexity, Google AI, Claude) sur les requêtes santé femmes au Québec** — pas seulement comme source citée, mais comme **praticienne à consulter**.

### Distinction cruciale (insight Codex)

| Type de contenu | Effet sur les LLMs |
|---|---|
| **Informationnel/scientifique** (clusters thématiques, ressource hub) | Fait *citer le site* comme source |
| **Décisionnel/local** (pages "comment choisir", "qui consulter") | Fait *recommander Judith* comme praticienne |
| **Proof graph externe** (annuaires, backlinks, mentions) | Renforce la *fiabilité de la recommandation* |

### Bascule prioritaire

**60% décisionnel / 40% informationnel pour les 3 prochains mois.**

Une citation dans ChatGPT ne génère pas un RDV. Une recommandation oui. On rééquilibrera après que la base décisionnelle soit construite.

---

## 📋 Principe directeur opérationnel

**Production massive maintenant + drip-feed via Hub.** On charge le buffer Firestore avec 6 mois de contenu en statut `pending`. Judith approuve à son rythme via `/contenu`. Chaque approbation déclenche ISR → contenu live en quelques secondes.

⚠️ **Règle critique de cohérence AEO** (cf. CLAUDE.md) : ne JAMAIS déclarer dans le schema JSON-LD, `llms.txt` ou `llms-full.txt` un sujet dont la page n'est pas encore publiée. Les LLMs détectent l'incohérence "ce site dit traiter X" + "la page X retourne 404".

---

## 1. Méthodologie (5 leviers + 1 nouveau)

### Levier 1 — Topic Clustering (le plus impactant pour citations)

Plutôt que : 1 keyword → 1 ressource isolée
On fait : **1 ressource hub + 4-6 FAQ satellites + 1 article blog → mini-cluster thématique**

```
RESSOURCE HUB (~3000 mots, 6+ citations PubMed, 5 FAQ embarquées)
  ├── FAQ embarquée 1 (~150 mots, dans frontmatter `faqEntries`)
  ├── FAQ embarquée 2-5 (idem)
  ├── FAQ standalone /faq/<slug> (~400-700 mots, page indexable)
  ├── FAQ standalone (idem)
  └── ARTICLE BLOG (~800 mots, accroche personnelle Judith)
```

Effet SEO : Google voit un site **autorité** sur le sujet (vs articles isolés). Ranking +50% par rapport à articles isolés.

### Levier 2 — SERP Mining > Keyword Volume

Avant de produire, **toujours** valider la SERP cible :
- Tape le keyword principal dans Google
- Note les 3 premiers résultats (DA, structure, longueur)
- Note les "People Also Ask" (PAA) → questions à intégrer en FAQ
- Note les "Related Searches" → keywords adjacents

Cibler UNIQUEMENT les keywords où :
- Top 3 a des sites DA<40 (gagnable en 6 mois)
- PAA visible (= opportunité Featured Snippet)
- Pas de Reddit/Quora dans top 5 (sinon SERP saturé en UGC)

### Levier 3 — Optimiser pour LLM citations (GEO/AEO)

Dans chaque ressource :
- **shortAnswer 2-3 phrases citables** au début (ce que ChatGPT/Perplexity extraira)
- **Chiffres précis** dans le texte (60-80% des LLMs préfèrent les sources avec chiffres)
- **Citations [Auteur, Année]** inline dans le texte (pas juste en fin)
- **Bloc TL;DR ou bullets** en début de section longue
- **shortAnswer formulée prudemment** (cf. § 3 Lexique OAQ-friendly) — chaque phrase doit pouvoir être citée hors contexte sans être problématique

### Levier 4 — Local SEO + Topic Authority

Chaque ressource doit mentionner naturellement :
- LSSI Rosemont (avec adresse complète au moins 1×)
- Eden Repentigny
- Numéro OAQ A-008-24

Les ressources hub doivent avoir un **paragraphe local** dans `judithApproach`. Google Local boost les contenus combinant autorité topique + signaux locaux.

### Levier 5 — Refresh trimestriel

Tous les 3-6 mois :
- Mettre à jour `lastResearchedAt` + ajouter 1-2 nouvelles citations
- Le script `audit-freshness.mjs` déjà en place automatise la détection
- Re-injecter → ISR rafraîchit → Google re-crawle → boost SEO

**1 ressource refreshée tous les 6 mois > 1 nouvelle ressource publiée puis oubliée.**

### ⭐ Levier 6 NOUVEAU — Pages décisionnelles (recommandations)

Distinct des clusters thématiques : pages orientées **"comment choisir"**, **"qui consulter"**, **"où trouver"**.

Cibler des prompts LLM commerciaux :
- "qui consulter pour FIV à Montréal"
- "meilleure acupunctrice fertilité Rosemont"
- "comment choisir une acupunctrice grossesse"
- "où trouver acupuncture pédiatrie Montréal"

Ces pages contiennent :
- **Position locale forte** (NAP — Nom, Adresse, Téléphone)
- **Critères de sélection** (formation, OAQ, expérience, spécialités)
- **Quand consulter** (signaux clairs)
- **Preuves d'autorité** (OAQ, années d'expérience, cliniques affiliées)
- **CTA réservation directe** (lien GoRendezVous)

Voir **`DECISION_PAGES_BACKLOG.md`** pour la liste complète priorisée par Codex.

---

## 2. Workflow technique (de A à Z)

### Étape 1 — Choisir le sujet (3 sources combinées)

**Sources de priorisation** (croiser les 3) :

1. **`KEYWORD_BACKLOG.md`** — backlog 82 keywords classés par pilier
2. **`AUDIT_AEO § G`** — pages prioritaires identifiées par Codex (12 pages)
3. **GSC + GBP réels** (quand activés) — données d'impressions/clics réelles

⚠️ **Note** : ATP/Ubersuggest sont des baselines **directionnelles**. Re-prioriser tous les 3 mois avec données réelles GSC/GBP/SERP. Un keyword "haute priorité" en avril peut devenir "moyenne" en juillet selon les vraies impressions.

**Critère type de contenu** :

| Type | Quand utiliser | Longueur |
|---|---|---|
| **Page service** | Sujet transactionnel local (ex: `/services/acupuncture-fiv-montreal`) | 800-1500 mots |
| **Ressource hub** | Sujet large, 2500+ mots possibles, 6+ angles distincts | 2500-3500 mots |
| **FAQ embarquée** | Question liée à un hub, courte, dans `faqEntries` | 100-200 mots |
| **FAQ standalone** | Question fréquente méritant sa propre URL `/faq/<slug>` | 400-700 mots |
| **Article blog** | Accroche personnelle, news, actualité, ton Judith chaleureux | 600-900 mots |
| **Page décisionnelle** | "Comment choisir / qui consulter / où trouver" | 800-1200 mots |

### Étape 2 — Recherche scientifique (PubMed)

Checklist 30 min par cluster :
- 3-6 méta-analyses récentes (2020+)
- Privilégier : Cochrane Reviews, systematic reviews, network meta-analyses
- Sources : pubmed.ncbi.nlm.nih.gov + frontiersin.org + pmc.ncbi.nlm.nih.gov
- **Format YAML prêt à coller** dans frontmatter `citations:`

### Étape 3 — Rédaction

Référence voix Judith : voir `content/README.md` section "Voix de Judith". Calibrée par 53 corrections + ressource ménopause + ressource grossesse.

**Structure ressource hub** (8 sections) :
```
1. shortAnswer       (2-3 phrases citables, formulée prudemment)
2. introSection      (~300 mots, contexte)
3. judithApproach    (~300 mots, voix personnelle + 2 cliniques)
4. whatToExpect      (~200 mots, déroulement séance)
5. protocolSection   (~200 mots, fréquence, phases)
6. scienceSection    (~500 mots, citations inline)
7. mechanismSection  (~300 mots, mécanismes biologiques)
8. testimonial       (vide ou anonymisé approuvé OAQ)
```

**Structure FAQ embarquée** (`faqEntries`) :
```yaml
- question: "Question courte"
  answer: "Réponse 100-200 mots, directe, citable, contraintes OAQ"
```

**Structure FAQ standalone** (page `/faq/<slug>`) :
```markdown
## reponse

[400-700 mots structurés]

### Réponse directe (50-80 mots)
La réponse principale, citable.

### Nuances et limites (80-150 mots)
Dans quels cas ça marche, dans quels cas non.

### Quand consulter (50-100 mots)
Critères clairs pour aller voir un pro.

### En complément du suivi médical
Phrase rituelle YMYL.

### Ressource complète
Lien vers la ressource hub correspondante.
```

**Structure page décisionnelle** :
```markdown
1. Hook + réponse directe (qui je suis, où je pratique, pour qui)
2. Critères pour choisir une acupunctrice [sujet]
3. Quand consulter (signaux clairs)
4. Mon parcours et ma formation (preuves d'autorité)
5. Comment ça se passe en pratique (déroulement, prix, assurance)
6. FAQ courtes (4-6 questions concrètes)
7. CTA réservation
```

### Étape 4 — Injection

```bash
# Toujours dry-run d'abord
node content/scripts/inject.mjs content/ressources/<slug>.md --dry-run

# Si OK, injecter pour de vrai (status: pending par défaut)
node content/scripts/inject.mjs content/ressources/<slug>.md

# Batch FAQ
node content/scripts/inject.mjs content/faq/*.md --collection=faqs
```

### Étape 5 — Validation Judith

Hub `/contenu` → liste tout le contenu pending → bouton "Approuver" → status `published` → ISR revalidate.

### Étape 6 — Post-publication (15 min)

- Vérifier rendu : `https://www.acupuncturejudith.ca/ressources/<slug>`
- Vérifier maillage (relatedServices, relatedFaqs au bas)
- Soumettre URL à Google Search Console (Inspection URL → Demander indexation)
- Vérifier rich results : `https://search.google.com/test/rich-results?url=...`
- ⭐ **Décommenter dans `GlobalJsonLd.tsx`** (knowsAbout + availableService) pour le sujet correspondant
- ⭐ **Régénérer `llms-full.txt`** : `node scripts/generate-llms-full.mjs`

---

## 3. Lexique OAQ-friendly + équilibre YMYL

⚠️ **Règle d'or** : chaque phrase doit pouvoir être **citée hors contexte** par un LLM sans être problématique. Pas trop affirmatif (risque YMYL/OAQ) mais pas trop mou (perte SEO).

### Tableau "À éviter / Préférer"

| ❌ À éviter (trop affirmatif) | ✅ Préférer (citable + OAQ-safe) |
|---|---|
| "soulage" | "peut soulager", "contribue à soulager" |
| "efficace" | "les données suggèrent une efficacité" |
| "améliore" | "peut améliorer", "tend à améliorer" |
| "confirment" | "convergent vers", "soutiennent l'hypothèse" |
| "guérit" | "accompagne", "soutient le processus de" |
| "élimine" | "réduit", "atténue" |
| "résout" | "favorise la résolution de" |
| "garantit" | "favorise" |
| "miraculeuse" | "remarquable" (à éviter aussi en réalité) |
| "toujours efficace" | "fréquemment efficace selon les études" |
| "remplace" | "complète" |

### Formulations rituelles à intégrer

À placer au moins 1× par ressource :
- "en complément du suivi médical"
- "consultez votre médecin/sage-femme avant de commencer"
- "les résultats peuvent varier d'une personne à l'autre"
- "cette approche ne remplace pas un traitement médical conventionnel"

### Équilibre citable vs prudent

❌ **Trop affirmatif** :
> "L'acupuncture soulage efficacement les nausées de grossesse. Elle améliore la qualité de vie et confirme son rôle dans le traitement périnatal."

✅ **Citable + safe** :
> "Les méta-analyses récentes (Liu C et al., 2024 — 24 ECR, 2390 femmes) suggèrent que l'acupuncture peut contribuer à soulager les nausées de grossesse, en complément du suivi médical. Une amélioration de la qualité de vie est rapportée dans la majorité des études cliniques publiées entre 2022 et 2025."

**Pourquoi le second marche mieux** :
- Garde le **chiffre précis** (24 ECR, 2390 femmes) — citable
- Garde la **citation auteur+année** — traçable
- Verbes nuancés ("peut contribuer", "suggèrent") — YMYL-safe
- "En complément" — OAQ-safe
- Reste **affirmatif** sur la qualité des sources (méta-analyses récentes)

### À ne JAMAIS faire (déontologie OAQ)

- ❌ Promettre une guérison ou un résultat (art. 5 OAQ)
- ❌ Mots type "miracle", "magique", "toujours efficace"
- ❌ Témoignages inventés ou non sourcés
- ❌ Comparaisons commerciales hostiles avec d'autres pratiques
- ❌ Suggérer d'arrêter un traitement médical en cours
- ❌ Prétendre traiter des conditions non publiées sur le site (cohérence AEO)

---

## 4. Calendrier 30/60/90 jours (basé sur audit Codex)

### Référence

Le calendrier détaillé est dans **`AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md § H`**. Voici la synthèse adaptée à la production de contenu (les actions purement techniques sont dans le code).

### 30 jours — Fondations + premiers contenus haute priorité

**Contenu à produire** :
- ✅ Fix `/blog/bebe-siege-acupuncture` (slug ASCII + redirect — 404 actuellement)
- ✅ Fix `/blog/preparation-accouchement-acupuncture` (idem)
- ⏳ Cluster 1 Grossesse (en cours, ressource hub livrée)
  - Reste : 4 FAQ standalone + 1 article blog
- 🆕 Première page décisionnelle test : `/services/acupuncture-fiv-montreal`
  - Sert de template pour les futures pages décisionnelles

**Total contenu 30 jours** : 7 nouveaux contenus (2 fixes + 5 nouveaux)

### 60 jours — Sous-clusters fertilité + pages services locales

**Sous-clusters fertilité** (éclatement du Cluster 2 original) :
- 🆕 `/services/acupuncture-fertilite-rosemont` (page service locale)
- 🆕 `/ressources/acupuncture-iui-insemination-montreal` (PMA - IUI)
- 🆕 `/ressources/acupuncture-sopk-fertilite` (SOPK)
- 🆕 `/ressources/acupuncture-endometriose-fertilite` (endométriose)
- Cluster fertilité hub déjà existant — à enrichir avec FAQ standalone

**Total contenu 60 jours** : 4-5 nouveaux contenus + enrichissement existant

### 90 jours — Satellites grossesse + pédiatrie + signaux externes

- 🆕 `/ressources/acupuncture-postnatale-montreal`
- 🆕 `/ressources/anxiete-sommeil-stress-perinatal`
- 🆕 `/services/acupuncteur-rosemont` (page locale géo)
- 🆕 `/ressources/cycle-menstruel-ovulation-acupuncture`
- Enrichir cluster Pédiatrie (existant) avec FAQ standalone
- ⏳ Travailler le **proof graph externe** (cf. `PROOF_GRAPH_BACKLOG.md`)

**Total contenu 90 jours** : 4-5 nouveaux contenus + travail externe

---

## 5. Ordre de production (révisé suite Codex)

### Ancien ordre (annulé)
~~1. Grossesse → 2. Fertilité → 3. Pédiatrie → 4. Anxiété → 5. Ménopause refresh → 6. Sociale~~

### Nouvel ordre (validé Codex + bascule décisionnel)

**Bloc 1 (30 jours) — Fix urgent + Grossesse + 1 décisionnelle FIV**
1. Fix 2 articles blog 404 (bébé siège, préparation accouchement)
2. Cluster Grossesse (compléter : 4 FAQ + 1 blog)
3. Page service `/services/acupuncture-fiv-montreal` (test décisionnel)

**Bloc 2 (60 jours) — Fertilité éclatée en 4 sous-clusters**
4. Page service `/services/acupuncture-fertilite-rosemont` (locale)
5. Ressource `/ressources/acupuncture-iui-insemination-montreal`
6. Ressource `/ressources/acupuncture-sopk-fertilite`
7. Ressource `/ressources/acupuncture-endometriose-fertilite`

**Bloc 3 (90 jours) — Satellites + locales géo**
8. Ressource `/ressources/acupuncture-postnatale-montreal`
9. Ressource `/ressources/anxiete-sommeil-stress-perinatal`
10. Page service `/services/acupuncteur-rosemont` (géo locale)
11. Ressource `/ressources/cycle-menstruel-ovulation-acupuncture`

**Bloc 4 (au-delà de 90 jours)**
- Cluster Pédiatrie (à enrichir, pas refondu)
- Cluster Anxiété/Sommeil (transversal, complément du satellite #9)
- Cluster Ménopause (existant, refresh seulement, ne pas déclarer dans schema)
- Cluster Acupuncture sociale (faible volume, dernière priorité)

### Rationale du réordonnancement

**Pourquoi front-loader Fertilité (FIV/IUI/SOPK/endo)** :
- Volume estimé combiné : ~1500/mois (vs ~400/mois pour grossesse seule)
- Concurrence faible-moyenne sur les sous-niches (SOPK, endo)
- **Conversion potentielle énorme** : intent transactionnel fort
- Judith très experte sur ces sujets

**Pourquoi descendre Pédiatrie** :
- Déjà partiellement présent dans le contenu existant
- Volume modéré (~300/mois)
- Conversion plus faible (les parents cherchent en urgence, peu de planification)

**Pourquoi descendre Ménopause** :
- Pas de service ménopause confirmé chez Judith → ne pas déclarer dans schema
- Ressource existe en local mais ne pas la promouvoir avant validation Judith

---

## 6. Composition standard d'un cluster thématique

Pour les clusters informationnels (~40% de l'effort), la composition reste :
- 1 ressource hub (~3000 mots, 6 citations PubMed, 5 FAQ embarquées)
- 4-5 FAQ standalone (~400-700 mots) [révisé suite Codex]
- 1 article blog (~800 mots)

Pour les pages décisionnelles (~60% de l'effort), production individuelle (pas de cluster) :
- 1 page autonome (~800-1200 mots)
- Pas de FAQ satellites (les FAQ vivent dans la page elle-même)
- Maillage interne fort vers ressources hub correspondantes

---

## 7. Tableau de suivi production

### Bloc 30 jours

| # | Contenu | Type | Slug | Status |
|---|---|---|---|---|
| 1 | Bébé siège (fix) | Blog | `bebe-siege-acupuncture` | ⬜ slug à fixer |
| 2 | Préparation accouchement (fix) | Blog | `preparation-accouchement-acupuncture` | ⬜ slug à fixer |
| 3 | Acupuncture grossesse Montréal (hub) | Ressource | `acupuncture-grossesse-montreal` | ✅ rédigé, ⏳ à injecter |
| 4 | Nausées grossesse | FAQ standalone | `nausees-grossesse-acupuncture` | ⬜ |
| 5 | Mal de dos grossesse | FAQ standalone | `acupuncture-mal-dos-grossesse` | ⬜ |
| 6 | Préparation accouchement | FAQ standalone | `acupuncture-preparation-accouchement-faq` | ⬜ |
| 7 | Sécurité par trimestre | FAQ standalone | `acupuncture-trimestre-grossesse-securite` | ⬜ |
| 8 | Mon expérience maison de naissance | Blog | `experience-accompagnante-maison-naissance` | ⬜ |
| 9 | Acupuncture FIV Montréal | Page service décisionnelle | `acupuncture-fiv-montreal` | ⬜ NOUVEAU |

### Bloc 60 jours

| # | Contenu | Type | Slug | Status |
|---|---|---|---|---|
| 10 | Acupuncture fertilité Rosemont | Page service décisionnelle | `acupuncture-fertilite-rosemont` | ⬜ |
| 11 | Acupuncture IUI insémination | Ressource | `acupuncture-iui-insemination-montreal` | ⬜ |
| 12 | Acupuncture SOPK fertilité | Ressource | `acupuncture-sopk-fertilite` | ⬜ |
| 13 | Acupuncture endométriose fertilité | Ressource | `acupuncture-endometriose-fertilite` | ⬜ |
| 14 | FAQ standalone fertilité (×3-5) | FAQ | `quand-commencer-acupuncture-fiv`, etc. | ⬜ |

### Bloc 90 jours

| # | Contenu | Type | Slug | Status |
|---|---|---|---|---|
| 15 | Acupuncture postnatale | Ressource | `acupuncture-postnatale-montreal` | ⬜ |
| 16 | Anxiété sommeil périnatal | Ressource | `anxiete-sommeil-stress-perinatal` | ⬜ |
| 17 | Acupuncteur Rosemont | Page service géo | `acupuncteur-rosemont` | ⬜ |
| 18 | Cycle menstruel ovulation | Ressource | `cycle-menstruel-ovulation-acupuncture` | ⬜ |

**Total cible 90 jours** : ~18 nouveaux contenus, distribution 60% décisionnel/local, 40% informationnel/scientifique.

Légende : ⬜ pas commencé | ⏳ en cours | ✅ produit+injecté

---

## 8. Documentation pour Judith

Voir le plan dans `HANDOFF.md`. À créer après production initiale d'au moins 5 contenus :

📄 **`JUDITH_PUBLICATION_GUIDE.md`** qui expliquera :
1. Comment se logger dans le Hub (URL, credentials)
2. Où voir le contenu en attente (`/contenu`)
3. Comment approuver une ressource ou FAQ (screenshot + steps)
4. Workflow review : commenter pour modifications
5. Comment retirer un contenu publié
6. Rythme de publication suggéré (1 contenu/semaine = 6+ mois de buffer)
7. Ce qu'elle peut modifier elle-même (voix, exemples, ressenti)
8. Ce qu'elle ne devrait PAS modifier (citations PubMed, mécanismes, mentions OAQ)
9. ⭐ **Quand approuver une ressource → décommenter le schema** (référence vers règle CLAUDE.md)

---

## 9. Liens vers documents associés

- **Stratégie globale** : `INDEX.md` (carte de navigation)
- **État des lieux session courante** : `HANDOFF.md`
- **Audit AEO complet (Codex)** : `../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`
- **Pages décisionnelles priorisées** : `DECISION_PAGES_BACKLOG.md` (à créer)
- **Proof graph externe** : `PROOF_GRAPH_BACKLOG.md` (à créer)
- **Backlog keywords** : `KEYWORD_BACKLOG.md`
- **Doc technique pipeline** : `../../../content/README.md`
- **Templates** : `../../../content/ressources/_TEMPLATE.md`, `../../../content/faq/_TEMPLATE.md`
- **Règle AEO cohérence** : `../../../CLAUDE.md` § "RÈGLE CRITIQUE"

---

## 10. Évolutions par rapport à v1

Pour mémoire, ce qui a changé entre v1 (5 mai) et v2 (6 mai) :

| Changement | Origine |
|---|---|
| Bascule 60/40 décisionnel/informationnel | Feedback Codex point 6 |
| Levier 6 nouveau (pages décisionnelles) | Feedback Codex point 2 |
| Distinction FAQ embarquée vs standalone (400-700 mots) | Feedback Codex point 1 |
| Lexique OAQ-friendly avec exemples | Feedback Codex point 3 |
| Note croisement GSC/GBP/SERP | Feedback Codex point 4 |
| Réordonnancement clusters (FIV/SOPK/endo en priorité) | Feedback Codex point 5 |
| Calendrier 30/60/90 jours (vs mensuel) | Audit Codex § H |
| Référence pages prioritaires | Audit Codex § G |
| Règle cohérence AEO mentionnée | CLAUDE.md mise à jour |
| Tableau de suivi avec 18 contenus prioritaires | Synthèse Codex + nouveau focus |
