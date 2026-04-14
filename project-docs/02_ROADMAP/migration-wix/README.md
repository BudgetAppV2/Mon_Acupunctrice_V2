# Migration Wix → Vercel — Index des milestones

**Phase** : MIGRATION WIX
**Branche** : `feature/site-public-migration`
**Plan stratégique** : [`docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md`](../../../docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md) (v0.3.1 avec amendements A1-A5)
**CLAUDE.md migration** : [`docs/migration-wix/CLAUDE.md`](../../../docs/migration-wix/CLAUDE.md)

---

## Statut global

🟡 **En cours — MW-B1 complété le 14 avril 2026**

29 milestones MW-XX identifiés pour le MVP, répartis en 7 vagues d'exécution avec parallélisation maximale. 4 milestones post-MVP documentés pour la Phase 6.

**Dernière action** : MW-B1 complété (commit `61b7a38`). Route group `(public)/` + layout + fonts + tokens v4 en place. Prochain : MW-B2 (Firestore schemas) ou MW-B3 (composants base) selon la stratégie de parallélisation.

---

## Légende

**Statuts** : 🔴 Not started · 🟡 In progress · 🟢 Done · ⏸ Blocked · ⏭ Skipped

**Types** :
- 📋 **Prep** — recherche/analyse, pas de code
- 🏗️ **Infra** — fondations techniques
- 🎨 **UI** — pages et composants visibles
- 📦 **Content** — import et structuration de contenu
- 🔧 **Admin** — outillage admin Hub
- ⚙️ **Automation** — crons, dynamique, intégrations
- 🚀 **Launch** — pré-lancement et switch

---

## Vue d'ensemble : 7 vagues d'exécution

La migration est découpée en **7 vagues** qui peuvent largement se chevaucher. L'ordre strict est dicté par les dépendances techniques, pas par le temps calendaire.

```
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 0 — Prep (parallèle, zéro code)                           │
│ MW-A1 Inventaire Wix · MW-A2 Mots-clés · MW-A4 Audit GEO        │
└─────────────────────────────────────────────────────────────────┘
          ↓ (peuvent commencer en même temps)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 1 — Foundations techniques (parallèle)                    │
│ MW-B1 Route group · MW-B2 Firestore · MW-B3 Composants base     │
│ MW-A3 Guide de ton (parallèle, prep)                            │
└─────────────────────────────────────────────────────────────────┘
          ↓ (B2 obligatoire pour B4)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 2 — Import infrastructure                                 │
│ MW-B4 Parser Ricos + script import                              │
└─────────────────────────────────────────────────────────────────┘
          ↓ (B1+B3 obligatoires pour C)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 3 — Pages statiques & funnel (parallèle)                  │
│ MW-C1 Homepage · MW-C2 À propos · MW-C3 4 services              │
│ MW-C4 Tarifs · MW-C5 Reserver · MW-C6 Contact                   │
└─────────────────────────────────────────────────────────────────┘
          ↓ (B2+B4 obligatoires pour imports)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 4 — Contenu dynamique                                     │
│ MW-D1 Import blog · MW-D2 Blog pages · MW-D3 Import FAQ         │
│ MW-D4 FAQ pages · MW-D5 Ressources pages · MW-D6 Maillage       │
└─────────────────────────────────────────────────────────────────┘
          ↓ (peut commencer dès B2 en parallèle de C/D)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 5 — Admin Hub & workflows                                 │
│ MW-E1 Admin FAQ · MW-E2 Admin Ressources · MW-E3 Blog publish   │
│ MW-E4 Workflow review                                           │
└─────────────────────────────────────────────────────────────────┘
          ↓ (après C1 pour F1, après D pour F2)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 6 — Dynamique & automatisation                            │
│ MW-F1 RecentPosts · MW-F2 Cron refresh · MW-F3 Plausible        │
└─────────────────────────────────────────────────────────────────┘
          ↓ (après tout le reste)
┌─────────────────────────────────────────────────────────────────┐
│ VAGUE 7 — Lancement                                             │
│ MW-G1 Pré-flight · MW-G2 Switch DNS + sitemap GSC               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table complète des milestones MVP

### Vague 0 — Préparation (parallèle, zéro dépendance)

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-A1 | Inventaire Wix complet + rapatriement assets v4 | 📋 Prep | 3-4h | — | 🔴 |
| MW-A2 | Recherche mots-clés Ubersuggest Pro | 📋 Prep | Manuel 2h | — | 🔴 |
| MW-A4 | Audit GEO + plan d'action clinique La Source en Soi | 📋 Prep | 2-3h | — | 🔴 |

### Vague 1 — Fondations techniques (parallèle)

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-B1 | Route group `(public)/` + layout public + fonts + tokens v4 | 🏗️ Infra | 2-3h | — | 🟢 |
| MW-B2 | Schémas Firestore (FAQ/ressources/publicBlog/servicePages/siteConfig) + rules `status` + indexes | 🏗️ Infra | 2-3h | — | 🔴 |
| MW-B3 | Composants partagés de base (`SiteHeader`, `SiteFooter`, `CtaButton`, `ClinicBadge`, `SectionHeading`, `PilierCard`, `TestimonialCard`, textures) | 🏗️ Infra | 4-6h | MW-B1 | 🔴 |
| MW-A3 | Guide de ton (analyse corpus + entretien Judith) | 📋 Prep | 2-3h | — | 🔴 |

### Vague 2 — Import infrastructure

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-B4 | Parser Ricos JSON + endpoint `/api/blog/import/[postId]` + script migration Wix → Firestore avec images | 🏗️ Infra | 3-4h | MW-B2, MW-A1 | 🔴 |

### Vague 3 — Pages statiques & funnel (parallèle après B1+B3)

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-C1 | Homepage portée de `homepage-v4.html` → React/Next.js (statique) | 🎨 UI | 3-5h | MW-B1, MW-B3 | 🔴 |
| MW-C2 | Page `/a-propos` avec bloc "Ma clinique" + badge 4,9/5 | 🎨 UI | 2-3h | MW-B1, MW-B3 | 🔴 |
| MW-C3 | 4 pages services (`fertilite`, `grossesse`, `pediatrie`, `acupuncture-sociale`) — hub SEO | 🎨 UI | 4-6h | MW-B1, MW-B3 | 🔴 |
| MW-C4 | Page `/tarifs` optimisée SEO ("combien coûte l'acupuncture Montréal") | 🎨 UI | 2-3h | MW-B1, MW-B3 | 🔴 |
| MW-C5 | Page `/reserver` landing de confiance + section témoignages curatés | 🎨 UI | 2-3h | MW-B1, MW-B3 | 🔴 |
| MW-C6 | Page `/contact` | 🎨 UI | 1-2h | MW-B1, MW-B3 | 🔴 |

### Vague 4 — Contenu dynamique

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-D1 | Import des 11 articles blog Wix → `publicBlog` Firestore + Firebase Storage | 📦 Content | 1-2h | MW-B4 | 🔴 |
| MW-D2 | Pages `/blog` (liste) + `/blog/[slug]` (article individuel) | 🎨 UI | 2-4h | MW-B3, MW-D1 | 🔴 |
| MW-D3 | Import des 6 FAQ existantes + 5 pages piliers depuis `scripts/seo-geo/` → Firestore | 📦 Content | 1-2h | MW-B2 | 🔴 |
| MW-D4 | Pages `/faq` + `/faq/[category]` (layout discret, footer link) | 🎨 UI | 3-4h | MW-B3, MW-D3 | 🔴 |
| MW-D5 | Pages `/ressources` + `/ressources/[slug]` avec citations scientifiques externes | 🎨 UI | 3-4h | MW-B3 | 🔴 |
| MW-D6 | Maillage interne : composant `<RelatedContent />` + liens contextuels dans articles/FAQ/services | 🔧 Admin | 2-3h | MW-D2, MW-D4, MW-D5 | 🔴 |


### Vague 5 — Admin Hub & workflows

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-E1 | Admin Hub CRUD FAQ dans `(app)/site-public/faqs/` avec workflow `draft/pending/published` | 🔧 Admin | 3-4h | MW-B2 | 🔴 |
| MW-E2 | Admin Hub CRUD Ressources dans `(app)/site-public/ressources/` | 🔧 Admin | 3-4h | MW-B2 | 🔴 |
| MW-E3 | Extension `/api/blog/publish/` pour double push Wix + `publicBlog` Firestore | 🔧 Admin | 1-2h | MW-B2 | 🔴 |
| MW-E4 | UI de review `(app)/site-public/review/` (brouillons → pending → publié) | 🔧 Admin | 2-3h | MW-E1, MW-E2 | 🔴 |

### Vague 6 — Dynamique & automatisation

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-F1 | Composant `<RecentPosts />` dynamique (query `contentItems` pour carrousel social) | ⚙️ Automation | 2-3h | MW-C1 | 🔴 |
| MW-F2 | Cron `/api/cron/refresh-content` (1×/jour) + revalidation ISR | ⚙️ Automation | 2-3h | MW-E1, MW-E2 | 🔴 |
| MW-F3 | Intégration Plausible Analytics dans layout public | ⚙️ Automation | 1-2h | MW-B1 | 🔴 |

### Vague 7 — Lancement

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-G1 | Pré-flight checklist (Lighthouse 95+, schema validator, responsive 375px, links, SEO meta, accessibility) | 🚀 Launch | 2-3h | Tout le reste | 🔴 |
| MW-G2 | Switch DNS Wix → Vercel + soumission sitemap GSC + négociation backlink La Source en Soi + monitoring 2-4 semaines | 🚀 Launch | 1-2h + monitoring | MW-G1 | 🔴 |

---

## Total MVP : 29 milestones (MW-A1 à MW-G2)

**Répartition** : A×4 (Prep) + B×4 (Infra) + C×6 (Pages statiques) + D×6 (Contenu) + E×4 (Admin) + F×3 (Automation) + G×2 (Lancement) = **29**

**Estimation temps Claude Code cumulé** : ~65-95 heures d'exécution (hors supervision Benoit)

**Estimation calendrier** : 8-12 semaines à raison de 6-10 heures de travail effectif par semaine, avec bonne parallélisation des vagues.

---

## Post-MVP — Phase 6 (après lancement stable)

Ces milestones sont **documentés mais pas dans le scope MVP**. À activer quand le site est en production depuis 2-3 mois et qu'on a du trafic à analyser.

| ID | Nom | Type | Temps CC | Deps | Status |
|----|-----|------|----------|------|--------|
| MW-H1 | Dashboard stats SEO Plausible dans `(app)/site-stats/plausible/` | ⚙️ Automation | 3-4h | MW-F3 en prod | ⏭ Post-MVP |
| MW-H2 | Dashboard stats SEO Google Search Console (OAuth flow) | ⚙️ Automation | 5-6h | MW-H1 | ⏭ Post-MVP |
| MW-H3 | Génération automatique FAQ/ressources via Claude API (au-delà du refresh) | ⚙️ Automation | 4-6h | MW-F2 en prod | ⏭ Post-MVP |
| MW-H4 | Promotion FAQ/Ressources vers header principal (si esthétique validée) | 🎨 UI | 2-3h | Review visuelle post-MVP | ⏭ Post-MVP |

---

## Missions du plan v0.3 ↔ milestones MW

Mapping entre les 9 missions de haut niveau du plan éditorial et les milestones MW qui les implémentent :

| Mission (plan v0.3) | Milestones MW correspondants |
|---|---|
| Mission 1 — Inventaire Wix + extraction | MW-A1, MW-B4, MW-D1 |
| Mission 2 — Recherche mots-clés Ubersuggest | MW-A2 |
| Mission 3 — Guide de ton | MW-A3 |
| Mission 4 — Audit GEO + plan clinique | MW-A4 |
| Mission 5 — Transfert DNS Cloudflare | ⏭ Skipped (on garde Wix registrar, voir journal des décisions) |
| Mission 6 — Architecture Firestore + routes publiques | MW-B1, MW-B2, MW-B3 |
| Mission 7 — Build pages statiques & landing services | MW-C1, MW-C2, MW-C3, MW-C4, MW-C5, MW-C6 |
| Mission 8 — Build blog + FAQ + ressources + admin | MW-D1 à MW-D6, MW-E1 à MW-E4 |
| Mission 9 — Lancement & DNS switch | MW-F1, MW-F2, MW-F3, MW-G1, MW-G2 |

---

## Structure d'un dossier de milestone

Chaque milestone vit dans son propre dossier avec cette structure :

```
MW-XX_nom-court/
├── MILESTONE.md    # Plan détaillé (objectif, livrables, DoD, dépendances)
├── PROMPT.md       # One-shot prompt pour Claude Code (si mission de code)
├── NOTES.md        # Journal de progression, décisions, problèmes rencontrés
└── artefacts/      # Sorties produites (inventaires, scripts, rapports, exports)
```

Les milestones manuels (MW-A2 Ubersuggest, MW-G2 DNS switch) n'ont pas de `PROMPT.md`, mais ont un `CHECKLIST.md` à la place.

---

## Ordre d'attaque recommandé (séquence pragmatique)

Pour Benoit qui veut lancer les milestones un par un sur Claude Code, voici l'ordre pragmatique qui minimise les blocages :

### Semaine 1 — Démarrage
1. **MW-A1** (inventaire Wix) — débloque MW-B4 et MW-D1
2. **MW-B1** (route group) — en parallèle, débloque toute la vague 3
3. **MW-B2** (Firestore) — en parallèle, débloque B4/D3/E*

### Semaine 2 — Expansion
4. **MW-B3** (composants base) — besoin de B1 pour les importer correctement
5. **MW-A2** (mots-clés) — achat Ubersuggest, 1h de travail manuel
6. **MW-A4** (audit GEO) — en parallèle, peut-être même délégué à une session Desktop

### Semaine 3 — Import technique
7. **MW-B4** (parser Ricos + script import) — bloqueur pour D1
8. **MW-A3** (guide de ton) — quand Judith est dispo pour l'entretien
9. **MW-D3** (import FAQ existantes) — quick win, du contenu déjà dans Firestore

### Semaine 4-5 — Pages statiques
10. **MW-C1** (homepage) — vitrine visible rapidement, motivation
11. **MW-C3** (4 services) — hubs SEO essentiels
12. **MW-C2** (à propos), **MW-C4** (tarifs), **MW-C5** (reserver), **MW-C6** (contact) — peuvent se batcher

### Semaine 6-7 — Contenu dynamique & admin
13. **MW-D1** (import blog) puis **MW-D2** (pages blog)
14. **MW-D4** (pages FAQ), **MW-D5** (pages ressources)
15. **MW-E1** (admin FAQ), **MW-E2** (admin ressources), **MW-E3** (blog publish), **MW-E4** (review)

### Semaine 8 — Polish & automation
16. **MW-D6** (maillage interne)
17. **MW-F1** (RecentPosts), **MW-F2** (cron refresh), **MW-F3** (Plausible)

### Semaine 9 — Lancement
18. **MW-G1** (pré-flight)
19. **MW-G2** (switch DNS)

---

## Journal des décisions

| Date | Décision | Raison |
|------|----------|--------|
| 2026-04-14 | Milestones dans `project-docs/02_ROADMAP/migration-wix/`, plan stratégique reste dans `docs/migration-wix/` | Cohérence avec pattern existant du repo, CLAUDE.md racine pointe déjà vers `02_ROADMAP/` |
| 2026-04-14 | Naming `MW-XX` pour tous les milestones migration avec lettre de vague (MW-A1, MW-B2, etc.) | Préfixe explicite, évite confusion avec futurs milestones Hub ; lettre = vague pour lecture rapide |
| 2026-04-14 | Un dossier par milestone (pas un fichier unique) | Extensible pour artefacts, notes, journal |
| 2026-04-14 | DNS reste chez Wix pour l'instant (bouton Transférer Domaine Wix est destructif) | On modifiera juste les records DNS dans le dashboard Wix le jour du switch |
| 2026-04-14 | **MVP plutôt que scope complet au lancement** | Plan éditorial v0.3 prévoyait 65-85 FAQ et 8 ressources au lancement. Scope MVP réduit à ~20 FAQ (les 6 existantes + 14 prioritaires) et 2-3 ressources. Le reste est produit via le cron refresh-content post-lancement. |
| 2026-04-14 | **FAQ et Ressources discrets au lancement** (amendement A1) | Liens dans footer uniquement, pas dans le header principal. Possibilité de les promouvoir plus tard si l'esthétique est validée. |
| 2026-04-14 | **Workflow status draft/pending/published** (amendement A2) | Permet publication programmatique via cron + review Judith avant exposition publique |
| 2026-04-14 | **Double publication blog Wix + Firestore** pendant transition (amendement A3) | Sécurise la migration, permet lancement staging sans couper la prod |
| 2026-04-14 | **Dashboard stats SEO post-MVP** (amendement A5) | Pas bloquant pour lancement, à faire quand on a du trafic à analyser |

---

*Dernière mise à jour : 14 avril 2026 — reverse planning complet, 29 milestones MVP identifiés*
