# Milestone MW-A3 : Guide de ton (analyse corpus + entretien Judith)

**Type** : Prep
**Vague** : 1
**Priorité** : High
**Temps estimé Claude Code** : 2-3h (analyse corpus) + Manuel 30min (entretien Judith par Benoit)
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Produire un guide de ton documenté qui capture la voix authentique de Judith, avec des few-shot examples exploitables dans les prompts de génération de contenu pour les FAQ, ressources et pages services.

---

## Contexte minimal

Le plan stratégique v0.3 (§5.4) identifie trois voix distinctes dans le corpus de Judith : intime (blog nausées), co-écrite (articles Claire Thomas), et SEO (FAQ dans `scripts/seo-geo/`). La décision est prise : vouvoiement + "je" de Judith comme signature. Ce milestone formalise cette décision en un document de référence injectible dans les sessions Claude Code de production de contenu.

---

## Livrables

- [ ] **`docs/migration-wix/01-strategie/GUIDE_DE_TON.md`** — document de référence complet contenant :
  - Rappel des 3 voix identifiées et de la décision vouvoiement + "je"
  - Analyse stylistique détaillée (vocabulaire récurrent, tournures, longueur de phrases, formalité par contexte)
  - 3-5 paragraphes réels de Judith (voix intime) comme few-shot examples
  - Glossaire québécois dosé (3-5 expressions par texte max)
  - Règles tutoiement/vouvoiement par contexte (site vs Instagram)
  - Exemples positifs et négatifs par type de contenu (FAQ, page service, article blog, caption IG)
  - Section "Ce qui sonne faux" — pièges LLM à éviter
- [ ] **Répertoire d'anecdotes validées par Judith** — section du guide contenant les anecdotes personnelles que Judith autorise à réutiliser dans le contenu (grossesses, patientes anonymisées, moments marquants), collectées via entretien

---

## Approche technique

**Phase 1 — Analyse corpus (Claude Code)** :
1. Lire les 11 articles blog Wix (exportés en MW-A1 ou directement via l'API si MW-A1 n'est pas encore fait — les articles sont aussi accessibles via le site Wix)
2. Lire les 6 FAQ existantes dans `scripts/seo-geo/source/`
3. Lire les 5 pages piliers dans `scripts/seo-geo/source-resources/`
4. Lire la page À propos Wix (export ou crawl)
5. Extraire les patterns : vocabulaire récurrent, tournures caractéristiques, registre émotionnel, marqueurs québécois, structure des phrases
6. Identifier les exemples les plus "Judith" pour les few-shot

**Phase 2 — Entretien Judith (Benoit)** :
- Benoit conduit un entretien de ~30 min avec Judith pour collecter :
  - 5-10 anecdotes personnelles réutilisables (anonymisées si patient·es impliqué·es)
  - Validation du ton "vouvoiement + je"
  - Expressions favorites et expressions qu'elle n'aime pas
  - Ce qui l'agace dans les sites d'acupuncture concurrents (tone-wise)

**Phase 3 — Rédaction (Claude Code)** :
- Synthèse des deux phases en un document structuré et injectible

---

## Fichiers impactés

```
📄 NEW (livrable principal) :
- docs/migration-wix/01-strategie/GUIDE_DE_TON.md

📄 READ (sources d'analyse) :
- scripts/seo-geo/source/*.md (6 FAQ)
- scripts/seo-geo/source-resources/*.md (5 pages piliers)
- Articles blog Wix (via API ou exports MW-A1)
```

---

## Definition of Done

- [ ] Le guide de ton contient au moins 3 few-shot examples exploitables directement dans un prompt Claude
- [ ] La section "Ce qui sonne faux" liste au moins 5 pièges concrets (français de France, pseudo-intimité, jargon médical non vulgarisé, références scientifiques vagues, ton commercial)
- [ ] Le glossaire québécois contient 10-15 expressions dosées avec contexte d'usage
- [ ] Le répertoire d'anecdotes contient au moins 5 anecdotes validées par Judith
- [ ] Les règles de tutoiement/vouvoiement sont claires par contexte (site, Instagram, page À propos)
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Critères de validation du livrable

- **Test d'injection** : un prompt Claude utilisant les few-shot examples du guide produit un texte qui "sonne comme Judith" (validation subjective par Benoit)
- **Couverture** : tous les types de contenu sont couverts (FAQ, page service, article blog, caption IG)
- **Distinction claire** : la voix Judith site (vouvoiement) vs voix Judith Instagram (tutoiement) est explicitement documentée

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Ne pas modifier le plan éditorial v0.3
- Le répertoire d'anecdotes nécessite l'entretien avec Judith — marquer cette section comme `[EN ATTENTE ENTRETIEN]` si Judith n'est pas disponible au moment de l'exécution
- Respecter la co-paternité de Claire Thomas sur les articles : ne pas présenter sa voix comme celle de Judith
- Ne pas inventer d'anecdotes — uniquement du matériel validé par Judith

---

## Références

- Plan stratégique §5.4 (tonalité et format — guide de ton), Mission 3 (§10)
- CLAUDE.md migration — section "Les invariants" (vouvoiement, "je" de Judith)
- Corpus existant dans `scripts/seo-geo/source/` et `scripts/seo-geo/source-resources/`
- Plan stratégique §2.1 (narratif de marque Judith), §5.4 (formules-signature)

---

## Notes de planification

- Ce milestone peut démarrer en parallèle de MW-A1 car les sources textuelles principales (scripts/seo-geo/) sont déjà dans le repo. Les articles blog Wix peuvent être lus directement sur le site si l'export n'est pas encore fait.
- L'entretien avec Judith est un bloqueur pour la section anecdotes mais pas pour le reste du guide. Proposer un flow en deux passes : guide v1 sans anecdotes → entretien → guide v1.1 avec anecdotes.
- Le guide de ton sera injecté dans le prompt système de toutes les sessions de génération de contenu (FAQ, ressources, pages services). Sa qualité impacte directement la qualité de tout le contenu produit.
- Point à valider avec Benoit : est-ce que Judith a des "sujets tabous" qu'elle ne veut pas voir évoqués dans le contenu du site ?
