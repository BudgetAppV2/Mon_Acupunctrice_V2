# HANDOFF — Session Troubleshooting Phase Stratégie
*Pour la prochaine instance Claude Desktop — Mars 2026*

## Ce qui vient d'être fait

Les 9 milestones de la Phase Stratégie (S00-S08) ont été intégrés sur `main`
et poussés sur GitHub. Tout compile (`tsc --noEmit` = 0 erreurs, `npm run build` = succès).

### Commits sur main (du plus ancien au plus récent)
```
6fae36d  S00 Refactoring (merge direct)
d1994bb  S01 Styles (merge direct)
0813307  S03 Stories IG (réimplémenté)
2d40f8f  S02 Calendrier-cadre (réimplémenté)
054a075  S05 Optimisation plateforme (réimplémenté)
a47b0cb  S04 Séquences blogue (réimplémenté)
46f36cb  S06 Templates/Inspiration (réimplémenté)
4b5ad67  S07 Progression/encouragement (réimplémenté)
8ecf9b1  S08 Visuel enrichi (réimplémenté)
```

## Ce qu'il faut faire maintenant

### 1. Déployer sur Vercel
Le webhook GitHub→Vercel est cassé depuis le 22 mars 2026.
Déployer via `npx vercel --prod` ou reconnecter le repo dans Vercel Settings → Git.

### 2. Troubleshooting et ajustements
Benoit veut tester les nouvelles features et corriger ce qui ne fonctionne pas.
Les features à tester :
- **Calendrier** : slots fantômes (mardi/vendredi), FillSlotSheet, résumé semaine
- **Styles** : sélecteur Enseigner/Connecter/Aider/Inspirer dans création d'idées
- **Stories** : publication Story IG via le nouveau toggle
- **Séquences blogue** : coller un lien → création des 4 slots
- **Templates** : page /inspiration avec filtres par style
- **Progression** : cercle hebdomadaire, compteur séries, jalons
- **Visuel** : pastilles de couleur par style, résumé mensuel

### 3. Firestore
Les nouvelles collections (`calendarSlots`, `blogSequences`) nécessitent :
- Déployer les security rules : `firebase deploy --only firestore:rules`
- Déployer les index : `firebase deploy --only firestore:indexes`

## Fichiers clés pour le contexte

| Fichier | Rôle |
|---------|------|
| `CLAUDE.md` | Règles du projet (à jour) |
| `project-docs/HANDOFF.md` | Résumé complet du projet |
| `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md` | Roadmap S01-S08 |
| `project-docs/02_ROADMAP/analysis/CROSS_CUTTING_CONCERNS.md` | Architecture, crons, flow données |
| `project-docs/02_ROADMAP/BRANCH_ANALYSIS_REPORT.md` | Analyse des branches |

## Repo et machines

- **Repo GitHub** : github.com/BudgetAppV2/Mon_Acupunctrice_V2 (privé)
- **MacBook** (machine actuelle) : `/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2`
- **iMac** (autre machine) : `/Users/benoitarchambault/Projects/Mon_Acupunctrice_V2`
- **Vercel** : mon-acupunctrice-v2.vercel.app
- **Firebase** : projet mon-acupunctrice-hub

## Cron Vercel — Rappel important
Plan Hobby : 100 crons max, mais chaque route = **1x/jour max**, précision ±59 min.
Deux crons existants dans vercel.json :
- `/api/cron/publish` à midi UTC (8h Montréal)
- `/api/cron/fetch-insights` à 10h UTC (6h Montréal)

## Décisions prises cette session
- Stories API : pas de link sticker via l'API officielle (limitation Meta). Workaround : texte "Lien dans ma bio". Option future via instagrapi (API privée Python) notée dans le backlog.
- Navigation : Stats remplacé par Inspiration dans la bottom tab bar. Stats reste accessible via /profil.
- Slots : `slotsByDay` séparé de `itemsByDay` (pas de union type).
- Cloud Functions : aucune modification. Tout via API routes Next.js.
- Canva : intégration future, notée dans le backlog.
- Timeline éditeur : améliorations (trim handles, drag-drop, snap) notées dans le backlog sous E01.
