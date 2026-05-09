# Handoff — Finalisation refactor entity-canonical.mjs

**Date** : 2026-05-07 (après-midi)
**Contexte** : refactor architectural pour extraire les constantes identité/NAP/bios vers un module partagé. Travail commencé par Claude (chat web) ce matin, transféré à Claude Code pour finalisation.

---

## 🎯 Mission

Finaliser le refactor commencé : **3 fichiers nouveaux + 3 fichiers modifiés** sont sur le disque mais pas encore commités. Il faut :

1. Mettre à jour le SOT v1.7 (acter le refactor)
2. Vérifier que `next build` passe sans erreur (CRITIQUE — ne pas casser la prod)
3. Commit propre + push

---

## 📦 État actuel du repo

### Fichiers nouveaux (untracked) — à ajouter au commit

- `lib/entity-canonical.mjs` (210 lignes) — module canonique JS ESM
- `lib/entity-canonical.d.ts` (128 lignes) — types TypeScript
- `scripts/generate-llms.mjs` (159 lignes) — nouveau script bilingue

### Fichiers modifiés (staged-able) — à ajouter au commit

- `app/(public)/_components/GlobalJsonLd.tsx` — importe désormais ENTITY/NAP/CONTACT/SAMEAS/PILIERS depuis le module canonique
- `lib/utils/rdvUrl.ts` — importe NAP/CONTACT depuis le module canonique, conserve les champs métier locaux
- `scripts/generate-llms-full.mjs` — importe ENTITY/NAP/CONTACT/PILIERS/PRICING depuis le module canonique
- `public/llms-full.txt` — régénéré avec les valeurs canoniques (10130 chars, ~1936 tokens)
- `public/llms.txt` — régénéré par le nouveau script (5143 chars, ~793 tokens)

### Fichiers modifiés à NE PAS committer (work-in-progress non lié)

- `lib/animations/constants.ts`
- `lib/animations/setup.ts`

### Fichiers untracked à NE PAS committer (cleanup repo séparé)

- `components/features/cms/ContentReviewCard 2.tsx` (doublon macOS)
- `components/features/cms/MarkdownField 2.tsx` (doublon macOS)
- `components/features/cms/StatusBadge 2.tsx` (doublon macOS)
- `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.2 2.md`
- `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3 2.md`
- `public/sw 2.js`
- `project-docs/PROMPT_CC_UNPUBLISH.md`

---

## ✅ Ce qui a déjà été fait et VÉRIFIÉ ce matin

1. **`entity-canonical.mjs`** créé avec ENTITY, PAST_AFFILIATIONS, PILIERS, EMERGING_SPECIALTIES, NAP, CONTACT, SAMEAS, PRICING, BIOS
2. **`entity-canonical.d.ts`** créé avec interfaces strictes pour tous les exports
3. **`GlobalJsonLd.tsx`** migré — tout vient maintenant du module canonique sauf `aggregateRating` (snapshot LSSI Google Reviews) et `medicalSpecialty` (enum schema.org en anglais), tous deux gardés hardcodés avec commentaires explicatifs
4. **`generate-llms-full.mjs`** migré + testé — `node scripts/generate-llms-full.mjs` retourne `✅ llms-full.txt généré (10130 chars, ~1936 tokens)`
5. **`rdvUrl.ts`** migré — l'objet `CLINICS` consomme NAP et CONTACT depuis le module, les champs métier (grvSlug, services, hasSociale, mapsQuery) restent dérivés ou locaux. Le `as const` a été retiré (incompatible avec valeurs computed) ; vérifier qu'aucun consommateur ne casse côté types.
6. **`generate-llms.mjs`** créé + testé — `node scripts/generate-llms.mjs` retourne `✅ llms.txt généré (5143 chars, ~793 tokens)`. Format bilingue FR principal + résumé EN.
7. **Divergence géo LSSI résolue** — la valeur 45.5501/-73.5832 (anciennement dans rdvUrl.ts) a été corrigée vers 45.5408/-73.5823 (cohérent avec SOT et la rue Beaubien Est). Documenté en commentaire dans `entity-canonical.mjs`.

---

## 📋 Étapes restantes

### Étape 1 — Update SOT v1.7

Fichier : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`

Ajouter une nouvelle ligne dans le tableau de versioning (après la 1.6) :

```markdown
| 1.7 | 2026-05-07 | Benoit + Claude | Refactor architectural majeur : extraction des constantes identité/NAP/bios/spécialités vers le module canonique exécutable `lib/entity-canonical.mjs` + types `lib/entity-canonical.d.ts`. Quatre consommateurs migrés : `GlobalJsonLd.tsx`, `rdvUrl.ts`, `generate-llms-full.mjs`, et nouveau `generate-llms.mjs` (régénère `public/llms.txt`). Divergence géo LSSI tranchée définitivement à 45.5408/-73.5823 (la valeur 45.5501/-73.5832 anciennement dans rdvUrl.ts était trop au nord pour la rue Beaubien Est). Le SOT reste la documentation primaire ; le module est la version exécutable. |
```

Aussi, mettre à jour la section §3 du SOT (NAP LSSI) pour retirer le flag de divergence géo qu'on avait ajouté en v1.5. Le commentaire ressemble à :

```yaml
# ⚠️ DIVERGENCE À RÉSOUDRE : `lib/utils/rdvUrl.ts` indique 45.5501, -73.5832 pour la même adresse.
# Vérifier sur Google Maps quelle est la coordonnée précise de 2554 rue Beaubien Est, Montréal,
# puis aligner les 3 sources : ce fichier, `GlobalJsonLd.tsx` et `rdvUrl.ts`.
```

À remplacer par :

```yaml
# ✅ Géolocalisation tranchée v1.7 : la valeur 45.5501/-73.5832 anciennement
# dans rdvUrl.ts a été corrigée vers 45.5408/-73.5823. Les 4 consommateurs
# (entity-canonical.mjs, rdvUrl.ts, GlobalJsonLd.tsx, scripts llms*) sont alignés.
```

Et mettre à jour les Cross-refs internes pour mentionner `lib/entity-canonical.mjs` et `.d.ts` comme source canonique runtime (et le SOT comme doc primaire).

### Étape 2 — Vérification build (CRITIQUE)

Avant de commiter, lancer :

```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run build
# OU
npx next build
```

Confirmer que :
- TypeScript compile sans erreur (le `.d.ts` est bien trouvé)
- L'import `@/lib/entity-canonical.mjs` résout correctement
- Aucun consommateur de `rdvUrl.ts` ne casse à cause du retrait du `as const`

Si le build casse, investiguer avant de commiter. Cas probables :
- Path alias mal résolu → vérifier `tsconfig.json` (path `@/*` → `./*` confirmé ce matin)
- Type narrowing perdu sur CLINICS → ajouter `as const` au bon endroit ou typer explicitement
- Consommateur de `rdvUrl.ts` qui dépendait d'un littéral type → adapter

### Étape 3 — Commit + push

Stager UNIQUEMENT les 8 fichiers du refactor (pas les modifs animations, pas les doublons macOS) :

```bash
git add lib/entity-canonical.mjs lib/entity-canonical.d.ts \
        scripts/generate-llms.mjs scripts/generate-llms-full.mjs \
        app/\(public\)/_components/GlobalJsonLd.tsx \
        lib/utils/rdvUrl.ts \
        public/llms.txt public/llms-full.txt \
        project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md
```

Vérifier le diff avant de commit :

```bash
git status --short
git diff --cached --stat
```

Commit message proposé :

```
refactor(content-strategy): extract canonical entity to shared module (SOT v1.7)

Major architectural refactor consolidating all identity / NAP / bios /
specialty constants into a single shared module, eliminating divergence
risk between code consumers.

NEW
- lib/entity-canonical.mjs : runtime ESM module exporting ENTITY,
  PAST_AFFILIATIONS, PILIERS, EMERGING_SPECIALTIES, NAP, CONTACT,
  SAMEAS, PRICING, BIOS. Single source of truth for everything
  identity-related at runtime.
- lib/entity-canonical.d.ts : strict TypeScript interfaces for all
  exports, consumed automatically by .ts/.tsx imports.
- scripts/generate-llms.mjs : new generator for public/llms.txt
  (short bilingual FR/EN index, llmstxt.org spec). Mirror of the
  existing generate-llms-full.mjs but for the index file.

MIGRATED
- app/(public)/_components/GlobalJsonLd.tsx : all hardcoded values
  replaced by imports from entity-canonical. aggregateRating
  (LSSI Google Reviews snapshot) and medicalSpecialty (schema.org
  enum) kept hardcoded with explanatory comments.
- lib/utils/rdvUrl.ts : CLINICS object now consumes NAP/CONTACT
  from the canonical module. Domain-specific fields (grvSlug,
  services, hasSociale, mapsQuery) remain local. `as const`
  removed (incompatible with computed values from imports).
- scripts/generate-llms-full.mjs : header / pricing / cliniques /
  credentials / "Comment citer" sections now interpolate from the
  canonical module. Service narrative descriptions kept hardcoded
  (marketing copy, not identity).

REGENERATED
- public/llms.txt : 5143 chars, ~793 tokens
- public/llms-full.txt : 10130 chars, ~1936 tokens

GEO DIVERGENCE RESOLVED
- LSSI coordinates 45.5501/-73.5832 (formerly in rdvUrl.ts) were too
  far north for rue Beaubien Est. Tranched to 45.5408/-73.5823
  across all 4 consumers. Documented in SOT v1.7.

DOCUMENTATION
- ENTITY_SOURCE_OF_TRUTH.md updated to v1.7 :
  * Documents the architectural extraction
  * Removes the geo divergence flag from §3 (resolved)
  * Cross-refs extended to entity-canonical.mjs and .d.ts
  * SOT remains the primary documentation ; the module is the
    executable version
```

Puis :

```bash
git push origin main
```

### Étape 4 — Vérification post-déploiement

Une fois pushé, attendre que Vercel rebuild (~3-5 min) puis vérifier :

1. `https://www.acupuncturejudith.ca/llms.txt` charge correctement
2. `https://www.acupuncturejudith.ca/llms-full.txt` charge correctement
3. Inspecter le JSON-LD de la homepage (View Source → chercher `application/ld+json`) — confirmer que :
   - `identifier.value` = "A-008-24"
   - `name` du Person = "Judith Dufour-Savard"
   - Adresse Éden contient "121 boulevard Industriel, local 225" + "J6A 7K4"
   - `sameAs` du MedicalBusiness contient "share.google/ncO1Alzja10AmsUfR"
   - `geo` du LSSI = `{ latitude: 45.5408, longitude: -73.5823 }`

Si tout OK, le refactor est complet.

---

## 🚨 Pièges à éviter

1. **NE PAS committer** `lib/animations/constants.ts` ni `lib/animations/setup.ts` — c'est du WIP de Benoit non lié.

2. **NE PAS committer** les fichiers " 2." (doublons macOS Finder) — cleanup séparé éventuel via `find . -name "* 2.*" -delete` (à exécuter prudemment et hors scope ici).

3. **NE PAS committer** `project-docs/PROMPT_CC_UNPUBLISH.md` — fichier non lié à cette session.

4. **VÉRIFIER LE BUILD avant push** — un build qui casse va déployer une version cassée et les pages publiques tomberont. La matinée a déjà gobé du temps avec un build Vercel cassé (commit `23866ed` pour le résoudre), ne pas re-rentrer dans le même cycle.

5. **Si le build TS casse** sur le retrait de `as const` dans `rdvUrl.ts`, voici les options dans l'ordre :
   - Option A : ajouter `as const` à la fin de l'expression de `CLINICS` (après l'objet construit). TypeScript inférera depuis les valeurs.
   - Option B : typer explicitement avec `Record<Clinic, ClinicData>` et un type `ClinicData` exporté.
   - Option C : si un consommateur attendait un littéral type précis, le typer explicitement à l'usage.

---

## 📚 Contexte session matinale

5 commits déjà déployés ce matin sur `main` :
- `05b2869` Chantier 1.1 — ENTITY_SOURCE_OF_TRUTH créé
- `85f0809` Alignement SOT v1.5 (JSON-LD + llms.txt + AAQ)
- `23866ed` Fix build Vercel (excludes EPS)
- `9a3a7be` Wildcard redirect /blog/categories/* legacy Wix
- `0a7a4ae` SOT v1.6 — llms-full.txt aligné, lien GBP review intégré

Ce refactor (commit #6) clôt définitivement le Chantier 1 côté cohérence interne. Le Chantier 2 (acquisition d'avis Google) est débloqué grâce au lien `https://g.page/r/CQt_EeseQ8U_EBM/review` documenté dans SAMEAS.gbpReviewLink.

Bonne fin de session !
