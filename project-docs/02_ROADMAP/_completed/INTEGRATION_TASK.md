# Tâche — Intégration Phase Stratégie (from scratch avec références)

## Contexte
Les 9 milestones S00-S08 ont été implémentés sur des branches isolées.
L'analyse (BRANCH_ANALYSIS_REPORT.md) conclut : code de bonne qualité
mais trop de conflits inter-branches (~26) pour merger séquentiellement.

## Stratégie
1. Merger S00 + S01 directement (pas de conflit entre eux)
2. Réimplémenter S03 → S02 → S05 → S04 → S06 → S07 → S08 sur main,
   en utilisant les branches comme RÉFÉRENCE pour le code

## Branches de référence

| Ordre | Milestone | Branche | Action |
|-------|-----------|---------|--------|
| 1 | S00 | `origin/claude/gifted-poincare` | MERGE |
| 2 | S01 | `origin/claude/youthful-hermann` | MERGE |
| 3 | S03 | `origin/claude/jovial-dubinsky` | RÉIMPLÉMENTER |
| 4 | S02 | `origin/claude/agitated-shaw` | RÉIMPLÉMENTER |
| 5 | S05 | `origin/claude/objective-brown` | RÉIMPLÉMENTER |
| 6 | S04 | `origin/claude/lucid-pasteur` | RÉIMPLÉMENTER |
| 7 | S06 | `origin/claude/suspicious-kepler` | RÉIMPLÉMENTER |
| 8 | S07 | `origin/claude/quirky-lamarr` | RÉIMPLÉMENTER |
| 9 | S08 | `origin/claude/brave-bassi` | RÉIMPLÉMENTER |

## Phase 1 — Merger S00 + S01

```bash
git merge origin/claude/gifted-poincare -m "feat(S00): extraire types éditeur et helpers publication"
npx tsc --noEmit  # doit passer
git merge origin/claude/youthful-hermann -m "feat(S01): catégorisation par style de contenu"
npx tsc --noEmit  # doit passer
```

## Phase 2 — Réimplémenter S03 à S08

Pour chaque milestone dans l'ordre :

1. **Lire le prompt** dans `project-docs/02_ROADMAP/prompts_used/phase_strategy/`
2. **Consulter la branche** avec `git diff main..origin/BRANCHE` pour voir
   les solutions trouvées (nouveaux fichiers, logique, patterns)
3. **Implémenter sur main** en adaptant le code pour qu'il soit compatible
   avec tout ce qui est déjà sur main (types, imports, hooks)
4. **Vérifier** : `npx tsc --noEmit` doit passer
5. **Commit** avec message descriptif : `feat(SXX): description`
6. Passer au suivant

### Points critiques lors de la réimplémentation

**S03 (Stories)** — La branche a créé `publishHelpers.ts`. Comme S00 l'a
déjà fait (mergé à l'étape 1), adapter le code de S03 pour UTILISER les
helpers existants au lieu d'en recréer.

**S02 (Calendrier)** — La branche a redéfini `ContentStyle` et
`contentStyles.ts`. Comme S01 l'a déjà fait (mergé à l'étape 1),
UTILISER les types et utils existants.

**S04 (Séquences)** — La branche a son propre `CalendarSlot` avec
5 champs manquants par rapport au design. UTILISER la version complète
du type CalendarSlot défini dans S02 (qui sera sur main à ce point).

**S06 (Templates)** — La branche remplace Stats par Inspiration dans
la nav. Vérifier que le changement est compatible avec les ajouts de
S07 (progression dans DashboardBar).

**S08 (Visuel)** — La branche a refactorisé CalendarView. S'assurer
que les refactorings sont compatibles avec TOUT ce qui a été ajouté
par S02, S04, S07.

## Vérification finale

Après tous les commits :
```bash
npx tsc --noEmit        # 0 erreurs TypeScript
npm run build           # build Next.js réussit
```

## Documents de référence
- `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md`
- `project-docs/02_ROADMAP/analysis/CROSS_CUTTING_CONCERNS.md`
- `project-docs/02_ROADMAP/analysis/S[XX]_ANALYSIS.md`
- `project-docs/02_ROADMAP/BRANCH_ANALYSIS_REPORT.md`

## Contraintes
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Ne PAS modifier les Cloud Functions existantes
