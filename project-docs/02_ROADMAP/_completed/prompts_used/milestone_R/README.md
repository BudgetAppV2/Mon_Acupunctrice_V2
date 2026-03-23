# Milestone R — Vue d'ensemble
*Refinements UX pre-déploiement*

---

## Découpage en 3 one-shots

| One-shot | Contenu | Effort |
|----------|---------|--------|
| **R-A** | R03 (statut auto) + R05 (catégories custom) + R02 (fix swipe) | Moyen |
| **R-B** | R04 (filtres bottom sheet) + R01 (IdeaDetailSheet) + R09 (captions) | Gros |
| **R-C** | R06 (calendrier enrichi) + R07 (Blitz→Stats) + R08 (profil) | Moyen |

### Dépendances
```
R-A (fondations : statut + catégories)
 ↓
R-B (UI principale : detail sheet + filtres + captions)
 ↓
R-C (pages secondaires : calendrier + stats + profil)
```

R-A doit être fait en premier car R-B dépend du statut automatique
et des catégories dynamiques. R-C peut être fait en parallèle de R-B
si nécessaire mais c'est plus propre en séquence.

---

## Fichiers

- `R-A_PROMPT.md` — Prompt one-shot pour fondations
- `R-B_PROMPT.md` — Prompt one-shot pour UI principale
- `R-C_PROMPT.md` — Prompt one-shot pour pages secondaires

## Référence complète
- `project-docs/02_ROADMAP/MILESTONE_R_REFINEMENTS.md` — specs détaillées
