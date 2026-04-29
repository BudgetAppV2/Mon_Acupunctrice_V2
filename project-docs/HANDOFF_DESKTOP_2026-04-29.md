# Handoff Claude Desktop — 29 avril 2026 (mis à jour fin de session)

## Projet : Mon Acupunctrice Hub V2 — Migration Wix + Stratégie SEO/GEO

### Repo
`/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2`
Branche active : `feature/site-public-migration`
GitHub : `BudgetAppV2/Mon_Acupunctrice_V2`

---

## État du projet — Vue d'ensemble

Le site public est CONSTRUIT (68 pages, Lighthouse 96/100/100) mais PAS LIVE.
Le DNS n'est PAS encore switché — en attente du feedback final de Judith.
La recherche SEO est COMPLÉTÉE (30 seeds, 150+ mots-clés, 4 sources).
Le CMS est CONSTRUIT (FAQ, Ressources, Blog, Workflow validation Judith).
Le pipeline de contenu est OPÉRATIONNEL (inject/audit/retire — testé avec la ressource ménopause).
La première ressource (ménopause, 22K/mois) est INJECTÉE en statut "pending" dans Firestore.

---

## LIRE EN PREMIER

| Document | Emplacement | Contenu |
|----------|-------------|---------|
| CLAUDE.md | `./CLAUDE.md` | Point d'entrée — référence tous les docs, décisions R1-R8, sprints complétés, 2 cliniques, pipeline contenu, CMS |
| LAUNCH_PLAN v4 | `project-docs/02_ROADMAP/LAUNCH_PLAN.md` | 626 lignes — 6 phases, backlog 34 pièces contenu, 5 sprints techniques, contacts, métriques |
| KEYWORD_BACKLOG | `project-docs/02_ROADMAP/content-strategy/KEYWORD_BACKLOG.md` | 767 lignes — 150+ mots-clés, Ubersuggest + ATP croisés |
| Content README | `content/README.md` | Workflow complet du pipeline d'injection de contenu |

---

## Décisions prises (R1-R8)

| # | Décision | Choix |
|---|----------|-------|
| R1 | Couper Wix | OUI |
| R2 | Auth admin | Hardcoder UID Benoit |
| R3 | Analytics | Plausible Cloud 9$/mois (script `pa-aZzfsJ6lLBfrRf7qnpB1w.js`) |
| R4 | Éditeur CMS | Textarea markdown + preview |
| R5 | Bilingue | NON pour l'instant |
| R6 | GBP | UN SEUL praticien multi-site, adresse principale LSSI |
| R7 | Avis Google | Zone grise OAQ — courriel rédigé (3 questions), en attente d'envoi par Judith |
| R8 | Domaines | Garder 3, expirer judithdufoursavardacu.com (8 juil 2026) |

---

## Deux cliniques

| | La Source en Soi | Éden Yoga Pilates |
|---|---|---|
| Adresse | 2554 Beaubien E, Rosemont, MTL H1Y 1G3 | 121 Boul. Industriel #225, Repentigny |
| Horaire Judith | Lun-Mar-Jeu-Ven | Mercredi 9h-15h (dernier patient 14h) |
| Services | Classique + sociale | Classique seulement |
| GRV companyId | 104074 | 141296 |
| GRV eids | 175708 | 192390 |
| GRV stype | — | Acupuncture |
| Site partenaire | lasourceensoi.com | edenyogapilates.ca |

---

## GBP de Judith — Optimisé le 29 avril

- Géré par : jdufoursavard@gmail.com
- Catégorie : Acupuncturist ✅
- Website : acupuncturejudith.ca ✅ (changé de grossesseacupuncture.ca)
- Description : mise à jour avec 2 cliniques + spécialités + OAQ ✅
- Services : ajoutés (fertilité, grossesse, pédiatrie, stress, sociale, ménopause) ✅

---

## Sprints CC complétés

| Sprint | Commits | Contenu |
|--------|---------|---------|
| GRV public | `8afa91f` | 18 liens GRV → eids=175708 sur le site public |
| GRV Hub | `e0ce162` | rdvUrl.ts centralisé (CHERRY-PICKABLE sur main) |
| Eden | `ad1fe45` | 18 fichiers, /reserver 2 cartes, /contact 2 maps, Schema.org 2 locations |
| Corrections Judith | `b2af0c4` | 53 corrections (tarifs, terminologie, formulations miracle/honnête) |
| Ingrid + photo | `c40cde3` | Faux témoignage retiré, photo sociale corrigée |
| Sprint 1 MW-F3a | `0eaac76` | Plausible Analytics (script + 4 goal events + TrackedLink) |
| Sprint 1 MW-E3 | `7289858` | Blog publish → Firestore (-157 lignes Wix, ISR revalidation) |
| Sprint 2 MW-E1/E2/E4 | `76b2a92` | CMS FAQ + Ressources + Workflow validation (20 fichiers, +1175 lignes) |
| Template ressource | `2bc94ad` | Ordre sections (approche avant science) + citations + maillage |

---

## Pipeline de contenu — OPÉRATIONNEL

### Architecture
```
content/
├── ressources/
│   ├── _TEMPLATE.md          ← Format frontmatter YAML + sections ##
│   └── acupuncture-menopause.md  ← Première ressource (pending dans Firestore)
├── faq/
├── blog/
├── scripts/
│   ├── inject.mjs            ← Parse markdown → upsert Firestore (dry-run supporté)
│   ├── audit-freshness.mjs   ← Vérifie fraîcheur sources (>12 mois, >2 ans)
│   └── retire.mjs            ← Archive (draft) ou supprime une ressource
└── README.md
```

### Workflow testé et validé
```
Produire markdown → inject.mjs --dry-run → inject.mjs (status pending)
→ Judith voit dans Hub onglet "Contenu" → Approuver / Commenter
→ status "published" → ISR rafraîchit le site
```

### Commandes
```bash
# Injecter (dry-run)
node content/scripts/inject.mjs content/ressources/fichier.md --dry-run

# Injecter pour vrai (statut pending par défaut)
node content/scripts/inject.mjs content/ressources/fichier.md

# Audit fraîcheur
node content/scripts/audit-freshness.mjs

# Retirer du site (passe en draft)
node content/scripts/retire.mjs ressources <slug>

# Supprimer de Firestore
node content/scripts/retire.mjs ressources <slug> --delete
```

### Ressource ménopause (première ressource produite)
- Slug : `acupuncture-menopause-montreal`
- 7 sections, 6 citations PubMed (méta-analyses 2024-2026), 5 FAQ Schema.org
- 3 stades : périménopause, ménopause active, post-ménopause
- Statut : **pending** (en attente validation Judith dans le Hub)
- Mot-clé cible : "ménopause" (22 200 recherches/mois)

---

## CMS dans le Hub

- 5e onglet "Contenu" dans la navigation (DocumentTextIcon)
- Dashboard unifié : blog + FAQ + ressources avec filtres type/statut
- Formulaires : /contenu/faq/new, /contenu/faq/[id], /contenu/ressources/new, /contenu/ressources/[id]
- API routes : /api/cms/list, /api/cms/approve, /api/cms/comment, /api/cms/submit, /api/cms/faq/*, /api/cms/ressources/*
- Composants : MarkdownField, StatusBadge, ContentReviewCard

### Pont admin ↔ site public
- Footer site public : lien "Espace admin" (opacity 30%) → /calendrier
- Hub layout : lien "Voir le site →" en haut à droite → ouvre site public dans nouvel onglet

---

## Commits cherry-pickables sur main

- **`e0ce162`** — fix(hub): centralise URL GRV dans rdvUrl.ts (LSSI + Eden, UTM tracking)
  `git checkout main && git cherry-pick e0ce162 && git push && git checkout feature/site-public-migration`

---

## ⚠️ BUGS / TÂCHES EN SUSPENS

### 1. Bouton "Dé-publier" manquant dans le Hub (PRIORITÉ)
Le CMS a "Approuver" et "Commenter" mais PAS de bouton pour retirer un contenu publié.
Actuellement, dé-publier requiert le terminal : `node content/scripts/retire.mjs <collection> <slug>`
**Action** : Ajouter un bouton "Retirer" dans le Hub CMS qui passe le status de "published" à "draft" et déclenche un revalidate ISR.
Créer une API route `/api/cms/unpublish` similaire à `/api/cms/approve` mais en sens inverse.

### 2. Dev server — lockfile parasite
Le fichier `~/package-lock.json` (racine du home directory) bloque le dev server Next.js.
**Solution** : le déplacer ou le supprimer : `mv ~/package-lock.json ~/package-lock.json.bak`

### 3. Plausible — pas de données avant switch DNS
Le script Plausible est installé mais ne collecte rien en dev local (configuré pour acupuncturejudith.ca uniquement).
Dashboard : plausible.io/acupuncturejudith.ca (compte créé)

---

## CE QUI EST EN ATTENTE

| # | Action | Bloqué par | Priorité |
|---|--------|-----------|----------|
| 1 | Judith valide le preview + approuve ressource ménopause | Judith | CRITIQUE |
| 2 | Judith envoie courriel OAQ (avis Google) | Judith | MOYENNE |
| 3 | Rencontre responsable SEO La Source en Soi | Annie fait l'intro | HAUTE |
| 4 | Cherry-pick e0ce162 sur main | Benoit | RAPIDE |
| 5 | Recherche Ubersuggest mots-clés Repentigny/rive-nord | Benoit | MOYENNE |

---

## CE QUI PEUT ÊTRE FAIT SANS ATTENDRE

| # | Action | Effort |
|---|--------|--------|
| 1 | Ajouter bouton "Dé-publier" dans le Hub | 1h CC |
| 2 | Produire 5 FAQ quick-win (SD < 5) | 1h |
| 3 | Produire ressource SOPK (pépite fertilité) | 3h |
| 4 | Produire ressource douleur chronique | 3h |
| 5 | Créer 12 fiches annuaires (brouillon) | 2h30 |
| 6 | Post GBP "Opening Soon" | 10 min |
| 7 | Recherche Ubersuggest Repentigny | 30 min |

---

## Outils et comptes

- **Ubersuggest** : compte payant actif
- **Plausible** : compte créé, script ID `pa-aZzfsJ6lLBfrRf7qnpB1w`
- **GBP** : géré par jdufoursavard@gmail.com
- **Firebase** : publicBlog (11), faqs (6), ressources (6 — 5 existantes + ménopause)
- **GRV LSSI** : companyId=104074, eids=175708
- **GRV Eden** : companyId=141296, eids=192390, stype=Acupuncture
- **Dev local** : supprimer `~/package-lock.json` (lockfile parasite) avant `npm run dev`

---

## Données de recherche SEO

| Fichier | Source |
|---------|--------|
| `content-strategy/KEYWORD_BACKLOG.md` | 767 lignes, synthèse 4 sources |
| `content-strategy/UBERSUGGEST_COMPETITOR_RAW.md` | Competitor analysis |
| `content-strategy/ATP_RAW_DATA_R2.md` | AnswerThePublic R1 (3 seeds) |
| `content-strategy/ATP_RAW_DATA_R3.md` | AnswerThePublic R2 (7 seeds) |
| `content-strategy/backlinks-lasourceensoi-raw.csv` | 225 backlinks |

---

## Documents sur le bureau de Benoit

| Fichier | Contenu |
|---------|---------|
| `~/Desktop/PREP_RENCONTRE_SEO_LSSI.md` | Préparation rencontre responsable SEO La Source en Soi |
| `~/Desktop/PROMPT_UBERSUGGEST.md` | Prompt Claude in Chrome — competitor analysis (FAIT) |
| `~/Desktop/PROMPT_ANSWERTHEPUBLIC.md` | Prompt Claude in Chrome — ATP 10 seeds (FAIT) |
| `~/Desktop/PROMPT_ATP_ROUND2.md` | Prompt Claude in Chrome — ATP 7 seeds restants (FAIT) |
| `~/Desktop/PROMPT_UBERSUGGEST_BACKLINKS.md` | Prompt Claude in Chrome — backlinks analysis (FAIT) |

---

## Déontologie OAQ — Recherche complète (29 avril)

**Résumé** : Le Code de déontologie des acupuncteurs (A-5.1, r.3, articles 48-59) N'A PAS d'article explicite interdisant les témoignages ou les avis Google, contrairement aux podiatres (art. 66), avocats (art. 145), et ingénieurs forestiers (art. 61) qui ont tous un article spécifique.

Articles pertinents : art. 5 (pas de garantie de guérison), art. 49 (pas de publicité trompeuse), art. 54 (pas cibler personnes vulnérables).

Courriel rédigé pour l'OAQ avec 3 questions spécifiques (témoignages site, QR code avis Google, distinction site vs plateforme tierce). En attente d'envoi par Judith.

---

## Commits récents (branche feature/site-public-migration)

```
b7c9682 fix(content): retrait mention LSSI/Eden redondante dans intro ménopause
2bc94ad feat(public): template ressource — ordre sections + citations + maillage
3042f15 fix: parser YAML inject.mjs — indentation 2 espaces
bf523ac feat: pont admin ↔ site public
2a22fbc content: ressource acupuncture et ménopause (6 citations, 5 FAQ)
a052933 docs: CLAUDE.md mis à jour — état complet pipeline contenu
611bad5 feat: infrastructure content pipeline — inject, audit, retire
5eb55a4 docs: prompt CC Sprint 2
76b2a92 feat(hub): MW-E1/E2/E4 — CMS FAQ + Ressources + Workflow validation
7289858 feat(hub): MW-E3 blog publish → Firestore
0eaac76 feat(public): MW-F3a Plausible Analytics
c40cde3 fix(public): retire faux témoignage Ingrid M. + photo sociale corrigée
b2af0c4 fix(public): intègre corrections Judith — 53 corrections
ad1fe45 feat(public): ajoute Eden Yoga Pilates comme deuxième clinique
8afa91f feat(public): lien direct GRV Judith (eids=175708)
e0ce162 fix(hub): centralise URL GRV (CHERRY-PICKABLE sur main)
035c173 docs(strategy): RECHERCHE COMPLÉTÉE — 30 seeds, 150+ mots-clés
9ab6ac0 docs(strategy): backlinks analysis + CSV 225 liens
```
