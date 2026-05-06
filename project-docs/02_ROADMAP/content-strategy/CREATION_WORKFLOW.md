# CREATION WORKFLOW — Production de Contenu acupuncturejudith.ca

**Date** : 4 mai 2026 (J+1 launch)
**Auteur** : Benoit + Claude (session strategique)
**Objectif** : Pipeline reproductible pour produire ressources hub + FAQ + articles blog en mode batch, en mode `pending` Firestore, pour validation Judith via Hub.

**Emplacement repo** : `project-docs/02_ROADMAP/content-strategy/CREATION_WORKFLOW.md`

---

## Principe directeur

**Production massive maintenant + drip-feed via Hub.** On charge le buffer Firestore avec 6 mois de contenu en statut `pending`. Judith approuve a son rythme via `/contenu`. Chaque approbation declenche ISR -> contenu live en quelques secondes.

**Ce qu'on optimise** : SEO local Quebec/FR + GEO (citations LLMs) + autorite topique (clusters thematiques).

**Ce qu'on n'optimise pas** : volume brut de keywords. La qualite et le clustering battent la quantite.

---

## 1. Methodologie (5 leviers)

### Levier 1 — Topic Clustering (le plus impactant)

Plutot que : 1 keyword -> 1 ressource isolee.
On fait : 1 ressource hub + 4-6 FAQ satellites + 1 article blog -> mini-cluster thematique.

```
RESSOURCE HUB (~3000 mots, 6+ citations PubMed, 5 FAQ embarquees)
  ├── FAQ satellite 1 (~200 mots)
  ├── FAQ satellite 2 (~200 mots)
  ├── FAQ satellite 3 (~200 mots)
  ├── FAQ satellite 4 (~200 mots)
  ├── FAQ satellite 5 (~200 mots)
  └── ARTICLE BLOG (~800 mots, accroche personnelle Judith)
```

Effet SEO : Google voit un site **autorite** sur le sujet (vs articles isoles). Ranking +50% par rapport a articles isoles.

### Levier 2 — SERP Mining > Keyword Volume

Avant de produire, **toujours** valider la SERP cible :
- Tape le keyword principal dans Google
- Note les 3 premiers resultats (DA, structure, longueur)
- Note les "People Also Ask" (PAA) -> questions a integrer en FAQ
- Note les "Related Searches" -> keywords adjacents

Cibler UNIQUEMENT les keywords ou :
- Top 3 a des sites DA<40 (gagnable en 6 mois)
- PAA visible (= opportunite Featured Snippet)
- Pas de Reddit/Quora dans top 5 (sinon SERP sature en UGC)

### Levier 3 — Optimiser pour LLM citations (GEO)

Dans chaque ressource :
- **shortAnswer 2-3 phrases citables** au debut (ce que ChatGPT/Perplexity extraira)
- **Chiffres precis** dans le texte (60-80% des LLMs preferent les sources avec chiffres)
- **Citations [Auteur, Annee]** inline dans le texte (pas juste en fin)
- **Bloc TL;DR ou bullets** en debut de section longue

### Levier 4 — Local SEO + Topic Authority

Chaque ressource doit mentionner naturellement :
- LSSI Rosemont (avec adresse complete au moins 1×)
- Eden Repentigny
- Numero OAQ A-008-24

Les ressources hub doivent avoir un **paragraphe local** dans `judithApproach`.

### Levier 5 — Refresh trimestriel

Tous les 3-6 mois :
- Mettre a jour `lastResearchedAt` + ajouter 1-2 nouvelles citations
- Le script `audit-freshness.mjs` deja en place automatise la detection
- Re-injecter -> ISR rafraichit -> Google re-crawle -> boost SEO

**1 ressource refreshee tous les 6 mois > 1 nouvelle ressource publiee puis oubliee.**

---

## 2. Workflow technique (de A a Z)

### Etape 1 — Choisir le sujet (depuis KEYWORD_BACKLOG.md)

**Critere ressource VS FAQ** :
- **Ressource** = sujet large, 2500+ mots possibles, 6+ angles distincts -> guide complet
- **FAQ** = question precise et courte, 100-300 mots, 1 reponse directe
- **Article blog** = accroche personnelle, news, actualite -> ton Judith chaleureux

### Etape 2 — Recherche scientifique (PubMed)

Checklist 30 min par cluster :
- 3-6 meta-analyses recentes (2020+)
- Privilegier : Cochrane Reviews, systematic reviews, network meta-analyses
- Source : pubmed.ncbi.nlm.nih.gov + frontiersin.org + pmc.ncbi.nlm.nih.gov

### Etape 3 — Redaction

Reference voix Judith : voir `content/README.md` section "Voix de Judith". Calibree par 53 corrections + ressource menopause.

**Structure ressource** (8 sections) :
```
1. shortAnswer       (2-3 phrases citables)
2. introSection      (~300 mots, contexte)
3. judithApproach    (~300 mots, voix personnelle + 2 cliniques)
4. whatToExpect      (~200 mots, deroulement seance)
5. protocolSection   (~200 mots, frequence, phases)
6. scienceSection    (~500 mots, citations inline)
7. mechanismSection  (~300 mots, mecanismes biologiques)
8. testimonial       (vide ou anonymise approuve OAQ)
```

**Structure FAQ** : 1 section `## reponse` (100-300 mots, formattage rich autorise).

### Etape 4 — Injection

```bash
# Toujours dry-run d'abord
node content/scripts/inject.mjs content/ressources/<slug>.md --dry-run

# Si OK, injecter pour de vrai (status: pending par defaut)
node content/scripts/inject.mjs content/ressources/<slug>.md

# Batch FAQ
node content/scripts/inject.mjs content/faq/*.md --collection=faqs
```

### Etape 5 — Validation Judith

Hub `/contenu` -> liste tout le contenu pending -> bouton "Approuver" -> status `published` -> ISR revalidate.

### Etape 6 — Post-publication (15 min)

- Verifier rendu : `https://acupuncturejudith.ca/ressources/<slug>`
- Verifier maillage (relatedServices, relatedFaqs au bas)
- Soumettre URL a Google Search Console (Inspection URL -> Demander indexation)
- Verifier rich results : `https://search.google.com/test/rich-results?url=...`

---

## 3. Contraintes deontologiques OAQ (mandatory)

**A FAIRE**
- Affirmation directe en premiere phrase (oui / non / depend)
- Justifier scientifiquement (meta-analyses, ECR)
- Personnel : "dans ma pratique", "plusieurs de mes patientes"
- Concret : chiffres, frequences ("1 a 2 seances/semaine pendant 6 semaines")
- Mentionner les 2 cliniques quand pertinent
- Pedagogique : expliquer mecanismes sans jargon
- Caveat medical a la fin : "consultez aussi votre medecin"

**A NE PAS FAIRE**
- ❌ Promettre une guerison ou un resultat (art. 5 OAQ)
- ❌ Mots type "miracle", "magique", "toujours efficace"
- ❌ Temoignages inventes ou non sources
- ❌ Comparaisons commerciales hostiles avec d'autres pratiques
- ❌ Affirmations non sourcees presentees comme scientifiques
- ❌ Suggerer d'arreter un traitement medical en cours

---

## 4. Calendrier 90 jours — 6 clusters thematiques

Strategie : produire les 6 clusters en mode batch maintenant, charger le buffer Firestore en `pending`, puis Judith approuve au rythme de 1 cluster/2 semaines pour publication etalee.

### Ordre de production (par impact SEO descendant)

| # | Cluster | Pilier | Volume estime | Concurrence | Status |
|---|---|---|---|---|---|
| 1 | **Grossesse & version siege** | grossesse | ~400/mois | Faible | EN COURS |
| 2 | Fertilite & FIV | fertilite | ~600/mois | Moyenne | A faire |
| 3 | Acupuncture pediatrique | pediatrie | ~300/mois | Tres faible | A faire |
| 4 | Anxiete & sommeil | transversal | ~500/mois | Elevee | A faire |
| 5 | Menopause & sante femmes | transversal | ~250/mois | Moyenne | Existante (a enrichir) |
| 6 | Acupuncture sociale | acupuncture-sociale | ~50/mois | Aucune | A faire |

### Composition standard cluster

- 1 ressource hub (~3000 mots, 6 citations, 5 FAQ embarquees)
- 4-5 FAQ satellites (~200 mots)
- 1 article blog (~800 mots)

**Total final** : ~37-42 nouveaux contenus en mode `pending`.

### Calendrier publication suggere

| Mois | Cluster a approuver |
|---|---|
| Mai 2026 | Cluster 1 (Grossesse) |
| Juin | Cluster 2 (Fertilite) |
| Juillet | Cluster 3 (Pediatrie) |
| Aout | Cluster 4 (Anxiete & sommeil) |
| Septembre | Cluster 5 (Menopause refresh) |
| Octobre | Cluster 6 (Acupuncture sociale) |
| Nov+ | Refresh clusters 1-3 via audit-freshness.mjs |

---

## 5. Cluster 1 — Grossesse & version siege (en cours)

**Pilier Firestore** : `grossesse`
**Mots-cles cibles** : acupuncture grossesse Montreal, acupuncture grossesse Rosemont, acupuncture nausees grossesse, acupuncture mal de dos grossesse, version siege moxibustion, acupuncture preparation accouchement
**Volume mensuel estime** : 400+/mois (Quebec FR)
**Concurrence** : Faible (gap identifie dans Ubersuggest)

### Contenu produit

| Type | Slug | Statut |
|---|---|---|
| Ressource hub | `acupuncture-grossesse-montreal` | A produire |
| FAQ #1 | `nausees-grossesse-acupuncture` | A produire |
| FAQ #2 | `acupuncture-mal-dos-grossesse` | A produire |
| FAQ #3 | `acupuncture-preparation-accouchement` | A produire |
| FAQ #4 | `acupuncture-trimestre-grossesse-securite` | A produire |
| FAQ #5 | `quand-commencer-acupuncture-grossesse` | EXISTANTE |
| FAQ #6 | `acupuncture-moxibustion-bebe-siege` | EXISTANTE (publiee) |
| Article blog | `mon-experience-accompagnante-maison-naissance` | A produire |

### Citations PubMed validees pour ce cluster

Voir le fichier `acupuncture-grossesse-montreal.md` (frontmatter `citations`).

Sources validees :
1. Liu C et al. 2024 (24 ECR, 2390 femmes, nausees) — *Complementary Therapies in Medicine*
2. Wang Y et al. 2025 (38 ECR, 1164 patientes, network meta-analysis) — *Frontiers in Medicine*
3. Liu X et al. 2022 (10 etudes, 1040 femmes, douleur lombaire/pelvienne) — *BMJ Open*
4. Yang J et al. 2024 (12 ECR, 1641 femmes, douleur + reduction cesarienne) — *Acupuncture and Herbal Medicine*
5. Coyle ME et al. 2025 (Cochrane Review, version siege)
6. Liu W et al. 2023 (16 ECR, 1178 patientes, symptomes generaux grossesse) — *Frontiers in Public Health*

### Validation deontologique OAQ pour ce cluster

- ✅ Aucune promesse de guerison (formulations "peut soulager", "ameliore", "reduit")
- ✅ Citations scientifiques inline obligatoires
- ✅ Caveat medical : "consultez votre medecin/sage-femme avant de demarrer"
- ✅ Mention 2 cliniques (LSSI + Eden) dans `judithApproach`
- ✅ Pas de remplacement de soins medicaux conventionnels
- ✅ Pour version siege : preciser "en complement du suivi medical, pas en remplacement"

---

## 6. Tableau de suivi production

| Cluster | Hub | FAQ #1 | FAQ #2 | FAQ #3 | FAQ #4 | FAQ #5 | Article |
|---|---|---|---|---|---|---|---|
| 1 Grossesse | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ✅ existante | ⏳ |
| 2 Fertilite | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 Pediatrie | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 Anxiete-sommeil | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 Menopause refresh | ✅ existante | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 6 Acupuncture sociale | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Legende : ⬜ non commence | ⏳ en cours | ✅ produit+injecte

---

## 7. Documentation pour Judith (a transferer apres production)

Apres injection des 6 clusters en `pending`, creer `JUDITH_PUBLICATION_GUIDE.md` qui explique :

1. Comment se logger dans le Hub (URL, credentials)
2. Ou voir le contenu en attente (`/contenu`)
3. Comment approuver une ressource ou FAQ (screenshot + steps)
4. Comment commenter pour modifications (workflow review)
5. Comment retirer un contenu publie (bouton "Retirer du site")
6. Rythme de publication suggere (1 cluster / 2 semaines = 6 mois de buffer)
7. Ce qu'elle peut modifier elle-meme (la voix, exemples, ressenti)
8. Ce qu'elle ne devrait PAS modifier (citations PubMed, mecanismes, mentions OAQ)

---

## 8. Apres ce projet

Le pipeline est autosuffisant pour Judith :

- **Court terme (6 mois)** : Judith publie progressivement le buffer
- **Moyen terme (6-12 mois)** : Judith ajoute des articles blog spontanes via Tiptap dans `/blogue`
- **Long terme (1 an+)** : Refresh trimestriel via `audit-freshness.mjs`

Le but n'est PAS de produire infiniment. C'est de creer un noyau de contenu autoritaire que Google et les LLMs peuvent referencer pendant des annees.
