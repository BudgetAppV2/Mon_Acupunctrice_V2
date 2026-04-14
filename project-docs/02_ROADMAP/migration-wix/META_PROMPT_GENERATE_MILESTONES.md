# META-PROMPT : Génération des MILESTONE.md en batch

**À copier-coller dans Claude Code (session dédiée avec `--dangerously-skip-permissions`).**

**Contexte** : on sort d'une session de reverse planning intensive. 25 milestones MVP identifiés pour la migration Wix → Vercel d'acupuncturejudith.ca. La structure de dossiers est en place. Il faut maintenant écrire les `MILESTONE.md` détaillés pour chacun des 25 milestones, en batch, en suivant les skills déjà présents dans le repo.

---

## Mission

Tu vas écrire 25 fichiers `MILESTONE.md`, un par milestone, en respectant strictement les conventions du repo et la vision du projet.

**Tu n'écris PAS les `PROMPT.md` associés** — ceux-là seront générés un par un par Claude Desktop quand Benoit sera prêt à lancer un milestone spécifique. Ton travail ici est uniquement de rédiger les **plans détaillés** de chaque milestone sous forme `MILESTONE.md`.

---

## Setup

1. **Branche** : tu travailles sur `feature/site-public-migration`. Vérifie avec `git branch --show-current`. Si tu n'y es pas, switch.

2. **Ne fais aucun commit** — laisse Benoit reviewer et commiter lui-même à la fin.

3. **Ne modifie rien d'autre** que les fichiers dans `project-docs/02_ROADMAP/migration-wix/MW-*/`. Ni le plan stratégique, ni le CLAUDE.md, ni le README des milestones, ni le code du Hub.

---

## Lecture obligatoire AVANT d'écrire quoi que ce soit

Lis ces 6 documents dans cet ordre complet. Ne saute rien.

1. **`CLAUDE.md`** (racine du repo) — conventions générales du projet, phase active, stack
2. **`docs/migration-wix/CLAUDE.md`** — invariants de la migration, design system, contraintes, où chercher quoi
3. **`docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md`** — plan stratégique complet. **Lire en priorité les amendements A1-A5 en tête du document** (session du 14 avril), puis la section 4.5 (architecture technique), 4.6 (UI guidelines), 5 (plan FAQ), 6 (plan ressources), 8 (stratégie GEO), 9 (funnel), 10 (missions)
4. **`project-docs/02_ROADMAP/migration-wix/README.md`** — index des 25 milestones avec la table complète, les dépendances, le mapping vers les missions du plan
5. **`skills/oneshot-prompt-writer/SKILL.md`** — pour comprendre le contrat entre MILESTONE.md (ton travail) et PROMPT.md (écrit plus tard)
6. **`project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md`** — playbook de Benoit sur les one-shots et la granularité

Si quelque chose est ambigu, arrête et demande. N'invente pas.

---


## Structure à créer (25 dossiers)

Pour chaque milestone listé dans le README, crée le dossier `project-docs/02_ROADMAP/migration-wix/MW-XX_nom-court/` et dedans, crée uniquement le fichier `MILESTONE.md`. Ne crée pas encore `PROMPT.md`, `NOTES.md` ou `artefacts/` (ils seront créés au moment où le milestone est lancé).

Les 25 dossiers à créer, avec leur nom court pour slug :

| ID | Nom court (slug du dossier) |
|----|---|
| MW-A1 | `MW-A1_inventaire-wix` |
| MW-A2 | `MW-A2_mots-cles-ubersuggest` |
| MW-A3 | `MW-A3_guide-de-ton` |
| MW-A4 | `MW-A4_audit-geo-clinique` |
| MW-B1 | `MW-B1_route-group-public` |
| MW-B2 | `MW-B2_firestore-schemas-rules` |
| MW-B3 | `MW-B3_composants-base` |
| MW-B4 | `MW-B4_parser-ricos-import` |
| MW-C1 | `MW-C1_homepage` |
| MW-C2 | `MW-C2_page-a-propos` |
| MW-C3 | `MW-C3_pages-services` |
| MW-C4 | `MW-C4_page-tarifs` |
| MW-C5 | `MW-C5_page-reserver` |
| MW-C6 | `MW-C6_page-contact` |
| MW-D1 | `MW-D1_import-blog` |
| MW-D2 | `MW-D2_pages-blog` |
| MW-D3 | `MW-D3_import-faq-existantes` |
| MW-D4 | `MW-D4_pages-faq` |
| MW-D5 | `MW-D5_pages-ressources` |
| MW-D6 | `MW-D6_maillage-interne` |
| MW-E1 | `MW-E1_admin-faq` |
| MW-E2 | `MW-E2_admin-ressources` |
| MW-E3 | `MW-E3_blog-publish-double` |
| MW-E4 | `MW-E4_workflow-review` |
| MW-F1 | `MW-F1_recent-posts` |
| MW-F2 | `MW-F2_cron-refresh-content` |
| MW-F3 | `MW-F3_plausible-analytics` |
| MW-G1 | `MW-G1_pre-flight-checklist` |
| MW-G2 | `MW-G2_switch-dns-lancement` |

**Total : 29 dossiers** (je me suis trompé dans le README qui dit 25 — le vrai compte est 29 : A×4, B×4, C×6, D×6, E×4, F×3, G×2 = 29).

---


## Template obligatoire `MILESTONE.md`

Chaque `MILESTONE.md` suit cette structure **exacte**. C'est un hybride entre le skill `milestone-planner` (format structuré avec DoD vérifiable) et les besoins spécifiques de ce projet.

```markdown
# Milestone MW-XX : [Nom complet]

**Type** : [Prep | Infra | UI | Content | Admin | Automation | Launch]
**Vague** : [0 | 1 | 2 | 3 | 4 | 5 | 6 | 7]
**Priorité** : [Critical | High | Medium | Low]
**Temps estimé Claude Code** : [X-Yh | Manuel Xh | Xh + monitoring]
**Dépendances** : [Liste des MW-XX requis avant ce milestone, ou "Aucune"]
**Status** : 🔴 Not started

---

## Objectif

Une seule phrase claire qui dit ce que ce milestone accomplit. Pas d'historique, pas de contexte — juste le résultat final attendu.

---

## Contexte minimal

2-3 phrases qui situent ce milestone dans la migration et expliquent pourquoi il vient maintenant. Ne pas répéter le plan éditorial — juste l'état pertinent pour ce milestone.

---

## Livrables

Liste concrète de ce qui doit exister à la fin du milestone. Pour les milestones de code, préciser les fichiers créés/modifiés. Pour les milestones manuels, préciser les artefacts produits.

- [ ] Livrable 1 — description précise
- [ ] Livrable 2 — description précise
- [ ] ...

**Contrainte de scope** : maximum 3-5 livrables principaux. Si plus, le milestone est trop gros et doit être découpé.

---

## Approche technique

Brève description du comment (pas trop détaillée — le PROMPT.md sera plus précis). Inclure :
- Décisions architecturales clés
- Structures de données (interfaces TypeScript si pertinent)
- Points d'intégration avec le code existant
- Décisions de design (renvoi à homepage-v4.html si UI)

Cette section aide Claude Desktop (plus tard) à écrire un PROMPT.md précis.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- path/to/new/file.tsx
- path/to/another/file.ts

✏️ MODIFY (fichiers existants à modifier) :
- path/to/existing.ts (ajouter X)

🔄 REFACTOR (restructuration) :
- path/to/refactored.ts (extraire Y dans Z)
```

Pour les milestones manuels, lister les documents/données produits au lieu de fichiers de code.

---

## Definition of Done

Checklist de critères **objectifs et vérifiables en 10 secondes chacun**. Pas de "ça marche bien" ou "le code est propre".

- [ ] Critère 1 — testable
- [ ] Critère 2 — testable
- [ ] `npm run build` passe sans erreur (pour les milestones de code)
- [ ] Lighthouse 95+ sur la page créée (pour les milestones UI)
- [ ] Schema.org validé via validator.schema.org (pour les milestones SEO)
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

Précision sur ce qu'il faut tester et comment. Pas "add tests" générique.

- **Unit** : fonctions précises à tester (si logique complexe)
- **Integration** : flows API/Firestore à valider
- **Visual** : comportement UI à 375px, 768px, 1024px
- **SEO** : meta tags, schema.org, sitemap (pour les milestones UI/content)

---

## Contraintes

Ce qu'il ne faut **pas** faire dans ce milestone pour éviter le scope creep. Toujours inclure :

- Ne pas modifier le code du Hub admin (`app/(app)/`, `app/(auth)/`) sauf pour les milestones E*
- Ne pas ajouter de framework UI externe (Tailwind + tokens v4 uniquement)
- Ne pas utiliser d'emojis dans l'UI (Heroicons uniquement)
- Ne pas laisser de console.log en production
- Composants React < 150 lignes
- Mobile-first 375px

Plus les contraintes spécifiques au milestone (ex : "ne pas toucher aux articles blog existants dans Wix", "ne pas modifier les Firestore rules hors des nouvelles collections", etc.)

---

## Références

Documents à relire si besoin de contexte pendant l'exécution :

- Plan stratégique section X.Y
- CLAUDE.md migration section Z
- homepage-v4.html (si UI)
- Autres milestones liés (MW-XX prédécesseur)

---

## Notes de planification

Tout ce qui est utile pour Claude Desktop quand il écrira le PROMPT.md plus tard :
- Gotchas connus
- Décisions en attente
- Points à valider avec Benoit
- Alternatives considérées
```

---


## Règles de qualité pour chaque MILESTONE.md

1. **Ne pas copier-coller entre milestones** — chaque milestone doit être pensé pour son contexte propre. Les contraintes standard sont similaires, OK, mais la section "Approche technique" et "Livrables" doit être spécifique.

2. **Respecter les vagues** — un milestone de vague 3 ne doit pas dépendre de quelque chose de vague 5. Si tu trouves une dépendance inverse, arrête et signale.

3. **Calibrer la taille** — si un milestone a > 5 livrables principaux, tu dois **proposer un découpage** dans la section "Notes de planification" plutôt que de l'écrire tel quel. Exemple : MW-B3 (composants base) a beaucoup de composants — soit tu l'écris avec un scope resserré (juste les 6 composants critiques), soit tu proposes de le découper en MW-B3a et MW-B3b.

4. **Pas de code complet dans les MILESTONE.md** — juste les interfaces TypeScript essentielles et les signatures. Le code réel sera dans le PROMPT.md que Claude Desktop écrira plus tard.

5. **Ancrage dans le plan** — cite explicitement les sections du plan éditorial v0.3 (et les amendements A1-A5) pour justifier les décisions. Ça permet de retrouver le raisonnement.

6. **Cohérence avec le CLAUDE.md migration** — tous les invariants (vouvoiement + "je", La Source en Soi mentionnée partout, pas de GBP Judith séparée, design tokens v4 namespacés, etc.) doivent être respectés dans les livrables et contraintes.

---

## Précisions par type de milestone

### Milestones de Prep (MW-A*)

Ce sont des missions de **recherche ou contenu**, pas de code. Pour ces milestones :
- Le "Livrable" est un document, un dataset, ou un rapport
- Les "Tests requis" deviennent "Critères de validation du livrable"
- Les "Fichiers impactés" listent les artefacts produits dans `MW-XX_nom-court/artefacts/`
- Le PROMPT.md associé (s'il y en a un) sera un prompt pour Claude Desktop ou Claude Code selon le type de travail
- MW-A2 (Ubersuggest) et MW-A3 (entretien Judith) incluent du travail manuel Benoit — le préciser explicitement

### Milestones d'Infra (MW-B*)

Ce sont les fondations. Focus sur :
- Définition précise des schémas TypeScript et Firestore
- Décisions architecturales avec justification (renvoi au plan §4.5)
- Points d'intégration avec le Hub existant sans le casser
- Pour MW-B3 : ne PAS essayer de tout porter d'un coup. Cibler les 6-8 composants critiques pour la homepage et les pages services. Les autres composants (`<PaperTexture />`, `<BotanicalDeco />`, etc.) peuvent attendre MW-B3b ou être inclus naturellement dans les milestones UI qui en ont besoin.

### Milestones d'UI (MW-C*, MW-D2, MW-D4, MW-D5)

Ce sont les pages visibles. Focus sur :
- Référence explicite à `homepage-v4.html` pour le style
- Structure JSX (sections principales, pas le détail)
- Meta tags + schema.org requis par page (renvoi au plan §4.6, §8.1b)
- CTAs vers Go Rendez-Vous (renvoi au plan §9)
- Mention de La Source en Soi + badge 4,9/5 quand pertinent
- Tests responsive 375px/768px/1024px

### Milestones de Content (MW-D1, MW-D3)

Ce sont les imports. Focus sur :
- Source exacte (Wix API, fichiers `scripts/seo-geo/source/*`)
- Transformation requise (Ricos → markdown, etc.)
- Destination Firestore (collection, schema)
- Handling des images (téléchargement, upload Firebase Storage, URLs)
- Mode dry-run avant commit des écritures

### Milestones d'Admin (MW-E*)

Ce sont les interfaces admin dans le Hub. Focus sur :
- Cohabitation avec `(app)/` existant
- Respect du design system Hub (`sage`, `sand`) — **pas** les tokens v4 publics
- Workflow draft/pending/published (renvoi à l'amendement A2)
- Pas de régression sur les features existantes du Hub

### Milestones d'Automation (MW-F*)

Focus sur :
- Cohérence avec les crons existants (pattern `vercel.json`)
- Contrainte 1×/jour max sur Hobby
- Revalidation ISR via `revalidatePath` ou `revalidateTag`
- Gestion d'erreur et logging

### Milestones de Launch (MW-G*)

Ce sont les milestones critiques de fin. Focus sur :
- Checklist **exhaustive** et ordonnée pour MW-G1
- Procédure de rollback en cas de problème pour MW-G2
- Monitoring post-lancement avec KPIs précis
- Pour MW-G2 : **pas de PROMPT.md**, uniquement un `CHECKLIST.md` avec les étapes manuelles

---


## Ordre d'écriture recommandé

Écris les 29 MILESTONE.md dans cet ordre. Pourquoi cet ordre : on commence par les plus simples pour te calibrer, puis on monte en complexité. Chaque fichier est un livrable indépendant, tu peux les écrire séquentiellement ou par batch de 3-4.

### Batch 1 — Prep (faciles à définir)
1. MW-A1 Inventaire Wix
2. MW-A2 Mots-clés Ubersuggest
3. MW-A3 Guide de ton
4. MW-A4 Audit GEO

### Batch 2 — Infra (fondations)
5. MW-B1 Route group public
6. MW-B2 Firestore schemas + rules
7. MW-B3 Composants base
8. MW-B4 Parser Ricos

### Batch 3 — Pages statiques
9. MW-C1 Homepage
10. MW-C2 À propos
11. MW-C3 4 services
12. MW-C4 Tarifs
13. MW-C5 Reserver
14. MW-C6 Contact

### Batch 4 — Contenu dynamique
15. MW-D1 Import blog
16. MW-D2 Pages blog
17. MW-D3 Import FAQ existantes
18. MW-D4 Pages FAQ
19. MW-D5 Pages ressources
20. MW-D6 Maillage interne

### Batch 5 — Admin Hub
21. MW-E1 Admin FAQ
22. MW-E2 Admin ressources
23. MW-E3 Blog publish double
24. MW-E4 Workflow review

### Batch 6 — Automation
25. MW-F1 RecentPosts
26. MW-F2 Cron refresh content
27. MW-F3 Plausible

### Batch 7 — Launch
28. MW-G1 Pré-flight
29. MW-G2 Switch DNS (CHECKLIST.md au lieu de PROMPT.md)

---

## Quand tu as fini

1. **Ne commit pas** — laisse les changements en local pour review Benoit
2. **Mets à jour** `project-docs/02_ROADMAP/migration-wix/README.md` pour corriger le total de milestones à 29 (pas 25)
3. **Crée un fichier** `project-docs/02_ROADMAP/migration-wix/GENERATION_REPORT.md` qui résume :
   - Nombre de MILESTONE.md créés (29)
   - Milestones qui t'ont semblé trop gros et que tu proposes de découper (avec justification)
   - Milestones où tu as identifié des dépendances manquantes ou des problèmes
   - Questions ouvertes pour Benoit
4. **Affiche dans le terminal** un résumé en 5 lignes max de ce que tu as fait

---

## Contraintes absolues

- **Ne pas modifier** `PLAN_EDITORIAL_SEO_GEO_v0.3.md`
- **Ne pas modifier** `CLAUDE.md` (racine ou migration)
- **Ne pas modifier** le code du Hub V2 (`app/`, `components/`, `lib/`, etc.)
- **Ne pas créer de PROMPT.md** — seulement les MILESTONE.md
- **Ne pas commit ni push**
- **Poser une question plutôt que d'inventer** si quelque chose est ambigu

---

## Ressources

- Plan stratégique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md`
- CLAUDE.md migration : `docs/migration-wix/CLAUDE.md`
- Index des milestones : `project-docs/02_ROADMAP/migration-wix/README.md`
- Skill one-shot : `skills/oneshot-prompt-writer/SKILL.md`
- Playbook one-shot : `project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md`
- Maquette visuelle : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- Rapports de scouting : `docs/migration-wix/02-recherche/scouting/`

**Bon travail. Vise la qualité et la cohérence sur les 29 milestones, pas la vitesse. Benoit va reviewer tout ça avant de lancer le premier milestone en exécution.**
