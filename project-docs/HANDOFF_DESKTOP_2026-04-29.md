# Handoff Claude Desktop — 29 avril 2026

## Projet : Mon Acupunctrice Hub V2 — Migration Wix + Stratégie SEO/GEO

### Repo
`/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2`
Branche active : `feature/site-public-migration`
GitHub : `BudgetAppV2/Mon_Acupunctrice_V2`

---

## État du projet — Vue d'ensemble

Le site public est CONSTRUIT (76 pages, Lighthouse 96/100/100) mais PAS LIVE.
Le DNS n'est PAS encore switché — en attente du feedback de Judith sur le preview Vercel.
La recherche SEO est COMPLÉTÉE. Le plan de lancement est DOCUMENTÉ.

---

## Documents stratégiques — LIRE EN PREMIER

| Document | Emplacement | Contenu |
|----------|-------------|---------|
| CLAUDE.md | `./CLAUDE.md` | Point d'entrée — référence tous les docs |
| LAUNCH_PLAN v3 | `project-docs/02_ROADMAP/LAUNCH_PLAN.md` | Plan pré-lancement/lancement en 6 phases, 2 cliniques, GBP, contacts |
| KEYWORD_BACKLOG | `project-docs/02_ROADMAP/content-strategy/KEYWORD_BACKLOG.md` | 767 lignes, 150+ mots-clés, données Ubersuggest + ATP croisées |
| ARCHITECTURE.md | `project-docs/02_ROADMAP/content-strategy/ARCHITECTURE.md` | 533 lignes, audit CC, 7 modules, 24-29h estimées |
| VISION.md | `project-docs/02_ROADMAP/content-strategy/VISION.md` | Vision pipeline 5 modules |
| PLAN_EDITORIAL v0.3 | `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` | Plan fondateur SEO/GEO, 4 piliers, guide de ton |
| Prep rencontre LSSI | `~/Desktop/PREP_RENCONTRE_SEO_LSSI.md` | Préparation rencontre responsable SEO La Source en Soi |
| Prompt CC GRV audit | `project-docs/PROMPT_CC_GRV_AUDIT.md` | Mission CC déjà exécutée (commit e0ce162) |

### Données brutes de recherche

| Fichier | Source |
|---------|--------|
| `content-strategy/UBERSUGGEST_COMPETITOR_RAW.md` | Ubersuggest competitor analysis |
| `content-strategy/ATP_RAW_DATA_R2.md` | AnswerThePublic Round 1 (3 seeds) |
| `content-strategy/ATP_RAW_DATA_R3.md` | AnswerThePublic Round 2 (7 seeds) |
| `content-strategy/backlinks-lasourceensoi-raw.csv` | 225 backlinks CSV |

---

## Décisions prises

| # | Décision | Choix |
|---|----------|-------|
| R1 | Couper Wix | OUI — dès que DNS switché |
| R2 | Auth admin Hub | Hardcoder UID Benoit |
| R3 | Analytics | Plausible Cloud 9$/mois |
| R4 | Éditeur CMS | Textarea markdown + preview (pas Tiptap) |
| R5 | Bilingue FR/EN | NON pour l'instant — décision data-driven après 2-3 mois |
| R6 | GBP praticien | UN SEUL GBP pour Judith (multi-site), adresse principale LSSI |
| R7 | Avis Google | Prudence — zone grise déontologique OAQ, courriel à envoyer pour clarifier |
| R8 | Domaines | Garder acupuncturejudith.ca + grossesseacupuncture.ca + mon-acupunctrice.ca, laisser expirer judithdufoursavardacu.com (8 juil 2026) |

---

## Deux cliniques

| | La Source en Soi | Éden Yoga Pilates |
|---|---|---|
| Lieu | 2554 Beaubien E, Rosemont, MTL H1Y 1G3 | 121 Boul. Industriel #225, Repentigny |
| Horaire | Lun-Ven (sauf mercredi) | Mercredi 9h-15h (dernier patient 14h) |
| Services | Classique + sociale | Classique seulement (PAS de sociale) |
| GRV | eids=175708 | eids=?????? (EN ATTENTE — Émilie) |
| GBP | LSSI a un GBP (DA 26) | Eden a un GBP (à vérifier) |
| Site | lasourceensoi.com (12K backlinks) | edenyogapilates.ca |

---

## GBP de Judith — État actuel (modifié aujourd'hui)

- **Nom** : Judith Dufour-Savard Acupuncteure
- **Catégorie** : Acupuncturist ✅
- **Adresse** : 2554 Beaubien E, Rosemont ✅
- **Téléphone** : (514) 750-3735 ✅
- **Website** : acupuncturejudith.ca ✅ (changé aujourd'hui, était grossesseacupuncture.ca)
- **Services** : ajoutés aujourd'hui ✅
- **Description** : mise à jour avec 2 cliniques et spécialités ✅
- **Sociaux** : LinkedIn, Facebook, Instagram ✅
- **Géré par** : jdufoursavard@gmail.com

---

## Commits récents (branche feature/site-public-migration)

```
e791971 docs(strategy): LAUNCH_PLAN — GBP existe déjà, optimiser au lieu de créer
c5434c7 docs(strategy): LAUNCH_PLAN v3 — 2 cliniques, GBP guide, contacts complets
25ba5a7 docs(strategy): LAUNCH_PLAN v2 — plan de lancement structuré en 6 phases
d0a8803 docs(strategy): LAUNCH_PLAN.md — plan pré-lancement + lancement + contacts
035c173 docs(strategy): RECHERCHE COMPLÉTÉE — 30 seeds, 150+ mots-clés, plan contenu final
9ab6ac0 docs(strategy): backlinks analysis + CSV 225 liens + plan action
713f82c docs(strategy): KEYWORD_BACKLOG + données Ubersuggest Competitor Analysis
ad626d7 docs(strategy): KEYWORD_BACKLOG enrichi AnswerThePublic Round 2
1270e46 docs(strategy): KEYWORD_BACKLOG enrichi données AnswerThePublic
b1f95ac docs(strategy): KEYWORD_BACKLOG enrichi avec données Ubersuggest
854d8b5 docs(strategy): KEYWORD_BACKLOG.md — 82 mots-clés, 56 à créer, 4 piliers
5a9ee56 docs: CLAUDE.md référence le pipeline content-strategy
8afa91f feat(public): lien direct Go Rendez-Vous vers Judith (eids=175708)
e0ce162 fix(hub): centralise URL GRV — lien direct Judith eids=175708 (CHERRY-PICKABLE sur main)
```

---

## Commits CC non encore cherry-picked sur main

- **`e0ce162`** — fix(hub): centralise URL GRV dans lib/utils/rdvUrl.ts
  Cherry-pick : `git checkout main && git cherry-pick e0ce162 && git push`
  Impact : les publications sociales du Hub (IG, FB, YT, stories) utiliseront le bon lien GRV

---

## Ce qui est EN ATTENTE

| # | Action | Bloqué par | Priorité |
|---|--------|-----------|----------|
| 1 | Judith valide preview Vercel | Judith | CRITIQUE |
| 2 | Code GRV Éden Yoga Pilates (eids de Judith) | Rencontre Émilie | HAUTE |
| 3 | Rencontre responsable SEO La Source en Soi | Annie fait l'intro | HAUTE |
| 4 | Courriel OAQ sur avis Google | Rédaction | MOYENNE |
| 5 | Cherry-pick e0ce162 sur main | Benoit | RAPIDE |

---

## Ce qui peut être fait SANS attendre

| # | Action | Effort | Responsable |
|---|--------|--------|-------------|
| 1 | Créer compte Plausible Analytics | 10 min | Benoit |
| 2 | Sprint CC : MW-F3a (Plausible script) | 30 min | CC |
| 3 | Sprint CC : MW-E3 (Blog publish → Firestore) | 4-5h | CC |
| 4 | Produire ressource "Acupuncture et ménopause" | 3-4h | Benoit + Claude |
| 5 | Produire 5 FAQ quick-win (SD < 5) | 1h | Benoit + Claude |
| 6 | Produire ressource "Acupuncture et SOPK" | 2-3h | Benoit + Claude |
| 7 | Recherche Ubersuggest mots-clés Repentigny | 30 min | Claude in Chrome |
| 8 | Créer 12 fiches annuaires (brouillon) | 2h30 | Benoit |
| 9 | Post GBP "Opening Soon" | 10 min | Benoit |

---

## Recherche SEO — Résumé exécutif

- **30 seeds recherchés** sur 4 sources (Ubersuggest KW + Competitor + ATP R1 + ATP R2)
- **150+ mots-clés identifiés**, ~90 contenus à créer
- **4 concurrents sur 5 sans données SEO** = terrain ouvert
- **"menopause" = 22 200/mois** = nouveau pilier massif
- **"acupuncture pour fertilité" = 320/mois** = pilier #1 confirmé
- **SD ultra-bas (4-17)** sur tout le marché francophone = tout ce qu'on publie va ranker
- **Plan contenu final** : 7 ressources + 7 articles blog + 13 FAQ = 27 pièces
- **Backlinks** : 15 quick wins annuaires identifiés (DA 38-100)
- **Prompts LLM** : 26 prompts réels ciblant Montréal/Québec identifiés (cibles GEO)

---

## Outils et comptes

- **Ubersuggest** : compte payant actif (abonnement en cours)
- **AnswerThePublic** : essai Pro utilisé (peut être expiré)
- **GBP** : géré par jdufoursavard@gmail.com
- **Vercel** : preview déployé sur feature/site-public-migration
- **Firebase** : collections publicBlog (11), faqs (6), ressources (5)
- **GRV LSSI** : companyId=104074, eids=175708
- **GRV Eden** : eids EN ATTENTE

---

## Prompts prêts pour Claude in Chrome

| Fichier | Mission |
|---------|---------|
| `~/Desktop/PROMPT_UBERSUGGEST.md` | Competitor analysis + keyword gap (FAIT) |
| `~/Desktop/PROMPT_ANSWERTHEPUBLIC.md` | ATP 10 seeds sans "acupuncture" (FAIT) |
| `~/Desktop/PROMPT_ATP_ROUND2.md` | ATP 7 seeds restants (FAIT) |
| `~/Desktop/PROMPT_UBERSUGGEST_BACKLINKS.md` | Backlinks analysis (FAIT) |
| Nouveau prompt à créer | Ubersuggest mots-clés Repentigny/rive-nord |

