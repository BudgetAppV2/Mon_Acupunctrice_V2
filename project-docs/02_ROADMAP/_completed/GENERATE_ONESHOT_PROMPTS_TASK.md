# TÂCHE — Rédiger les prompts one-shot pour la Phase Stratégie

## Contexte

Tu as produit les 9 documents d'analyse dans `project-docs/02_ROADMAP/analysis/`.
Tu dois maintenant transformer chaque analyse en un **prompt one-shot** prêt à
être exécuté par Claude Code dans une session séparée.

## Skill à utiliser

Lis et suis **strictement** le format défini dans :
`skills/oneshot-prompt-writer/SKILL.md`

C'est le format qui a produit les milestones M08-M13 avec succès.
Chaque prompt doit être autonome — Claude Code doit pouvoir implémenter
SANS poser de questions.

## Documents de référence

Lis dans cet ordre :
1. `skills/oneshot-prompt-writer/SKILL.md` → Le format obligatoire
2. `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md` → La roadmap complète
3. `project-docs/02_ROADMAP/analysis/CROSS_CUTTING_CONCERNS.md` → Les impacts croisés
4. L'analyse spécifique du milestone (`project-docs/02_ROADMAP/analysis/S[XX]_ANALYSIS.md`)
5. Pour des exemples de bons prompts passés, consulte :
   - `project-docs/02_ROADMAP/_completed/MILESTONE_12.md` (prompt en bas du fichier)
   - `project-docs/02_ROADMAP/MILESTONE_13.md` (prompt en bas du fichier)

## Ce que tu dois produire

### 9 fichiers dans `project-docs/02_ROADMAP/prompts_used/phase_strategy/` :

```
S00_REFACTORING_PROMPT.md   → Refactoring préalable (types + cron)
S01_PROMPT.md               → Catégorisation par style
S02_PROMPT.md               → Calendrier-cadre
S03_PROMPT.md               → Stories Instagram API
S04_PROMPT.md               → Séquences blogue
S05_PROMPT.md               → Optimisation par plateforme
S06_PROMPT.md               → Banque de templates
S07_PROMPT.md               → Encouragement & progression
S08_PROMPT.md               → Calendrier visuel enrichi
```

### S00 — Refactoring préalable (Sprint 0)

Ce prompt prépare la codebase pour les S-series. Il doit :
1. Extraire les types éditeur de `lib/types/index.ts` vers `lib/types/editor.ts`
   (re-exporter depuis index.ts pour ne rien casser)
2. Extraire les helpers de publication de `app/api/cron/publish/route.ts`
   vers `lib/utils/publishHelpers.ts`
3. Vérifier que rien n'est cassé après le refactoring

C'est un prompt petit et rapide — pas de feature, juste du nettoyage.

## Règles pour chaque prompt

### Structure obligatoire (de la skill)
```
# Milestone S[XX] — [Nom]

## Contexte
## Stack
## Fichiers à lire AVANT de commencer
## Livrable N — [Nom]
## Contraintes
## Definition of Done
```

### Règles spécifiques pour cette phase

1. **Inclure les décisions architecturales déjà prises.**
   Les analyses contiennent des recommandations (ex: "slotsByDay séparé").
   Le prompt doit les intégrer comme des INSTRUCTIONS, pas des questions.

2. **Inclure les interfaces TypeScript exactes.**
   Chaque prompt qui modifie le data model doit contenir le code exact
   des types à ajouter. Ne pas dire "ajouter le type CalendarSlot" —
   donner l'interface complète.

3. **Inclure les index Firestore et security rules.**
   Si le milestone ajoute une collection, le prompt doit contenir le
   JSON exact pour firestore.indexes.json et le code exact pour firestore.rules.

4. **Respecter les comptages de lignes.**
   Si l'analyse dit "CalendarDay.tsx est à 72 lignes, +30 = 102, OK",
   inclure cette info dans le prompt pour que Claude Code sache la marge.

5. **Référencer les patterns existants.**
   Si l'analyse dit "même pattern que ScheduleSheet", le prompt doit dire
   "Lis ScheduleSheet.tsx comme modèle pour ce composant".

6. **Intégrer les impacts cross-cutting.**
   Le flow slot → contentItem → publication (section 5 du CROSS_CUTTING)
   doit être reflété dans les prompts S02, S04, et S07.

7. **Cron Vercel — rappeler la contrainte.**
   Dans S03 et S04, rappeler : plan Hobby = 1x/jour max par route,
   précision ±59 min, timeout 60 sec.

8. **Un prompt = un scope clair.**
   Si un prompt touche plus de 8 fichiers ou a plus de 10 DoD items,
   c'est trop gros. Découper en 2 prompts (ex: S04a et S04b).
   Signaux de la skill : >3 livrables → considérer un split.

### Contraintes à inclure dans CHAQUE prompt
```
## Contraintes
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes (vérifier le comptage)
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Sauvegarder via les hooks existants (useUpdateContentItem, etc.)
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS ajouter de features non mentionnées dans ce prompt
```

## Vérification finale

Avant de sauvegarder chaque prompt, vérifie :
- [ ] Le prompt suit la structure de la skill
- [ ] Les fichiers à lire sont des chemins EXACTS dans la codebase
- [ ] Les interfaces TypeScript sont complètes (pas de "...")
- [ ] La DoD a des items testables en 10 secondes
- [ ] Le prompt ne dépasse pas le scope du milestone
- [ ] Les décisions de CROSS_CUTTING_CONCERNS sont intégrées

## Note sur le séquençage

Les prompts seront exécutés dans cet ordre :
```
S00 → S01 → S03 → S02 → S05 → S04 → S06 → S07 → S08
```
Chaque prompt doit mentionner dans sa section "Contexte" quels milestones
précédents sont déjà complétés pour que Claude Code comprenne l'état
de la codebase au moment de l'exécution.
