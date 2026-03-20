# MILESTONE_02_ASSISTANCE.md
# Assistance opérationnelle — Soutenir la constance de Judith
*Après Milestone 01 complété*

---

## Objectif

Faire gagner du temps à Judith et l'aider à maintenir une cadence
de publication réaliste, sans lui retirer le contrôle créatif.

## Principe
> L'IA observe et recadre. Elle n'invente pas.

## Critères de succès
- [ ] Judith sait en 10 secondes où elle en est dans son pipeline
- [ ] Elle reçoit un rappel utile au moins 1x/semaine
- [ ] Elle peut publier directement depuis l'éditeur sans friction
- [ ] L'historique lui permet de voir ses patterns

---

## Tâches

### M2.1 — Bouton "Publier maintenant" dans l'éditeur (Phase 3D)
**Pourquoi :** Actuellement, publier = exporter + aller dans une autre section.
Ce devrait être 1 bouton dans l'éditeur.

Dans `EditorToolbar.jsx` :
1. Après sauvegarde dans le hub → bouton "📤 Publier sur Instagram"
2. Ouvre une modal : caption générée (éditable) + confirmation
3. Appelle `publishToInstagram` existante
4. Status → `published`

**Dépendances :** M1.1 (Auth)
**Effort :** 1 session Claude Code

### M2.2 — Publication programmée (Phase 3A)
**Pourquoi :** Judith veut planifier une semaine de contenu d'un coup.

Cloud Scheduler toutes les 15min :
- Query items : `workflowState == 'ready'` + `scheduledDate <= now`
- Appeler `publishToInstagram` + `generateCaption` si absent
- Status → `published` ou `failed`
- Notification email si échec

**Dépendances :** M2.1
**Effort :** 1 session Claude Code

### M2.3 — Dashboard de santé éditoriale
**Pourquoi :** Judith devrait voir son état en 5 secondes.

Nouvelle page `/dashboard` ou widget en haut du calendrier :
```
📊 Cette semaine
✅ 2 publiés  📅 1 planifié  🎬 3 prêts à monter  💡 8 idées

⚠️  Aucun contenu planifié pour les 5 prochains jours.
💡  Tu as 3 idées en attente depuis plus de 2 semaines.
```

**Effort :** 1 session Claude Code

### M2.4 — Rappels intelligents
**Pourquoi :** La constance est le défi #1 pour un créateur solo.

Cloud Function `sendReminders` (cron quotidien 9h) :
- Si aucun contenu planifié dans les 3 jours → email rappel
- Si 5+ idées en statut `idea` depuis > 2 semaines → email suggestion
- Si contenu `ready` non planifié depuis > 3 jours → email nudge

Email simple via Firebase Extensions (Trigger Email) ou Resend.

**Dépendances :** M1.1 (Auth pour l'email)
**Effort :** 1 session Claude Code

### M2.5 — Mémoire légère du pipeline
**Pourquoi :** Le système doit apprendre les préférences de Judith.

Champs à ajouter à `ContentItem.memory` :
- `lastSuggestedAt` — éviter de répéter les mêmes suggestions
- `reuseScore` — basé sur les vues Instagram (quand disponible)
- `tags` — catégorisation automatique par topic

Plus tard : suggestions de recyclage de contenu.

**Effort :** 1 session Claude Code

---

## Ordre recommandé
1. M2.1 — Publier maintenant (haute valeur, faible effort)
2. M2.2 — Scheduler publication
3. M2.3 — Dashboard santé
4. M2.4 — Rappels email
5. M2.5 — Mémoire (peut attendre)
