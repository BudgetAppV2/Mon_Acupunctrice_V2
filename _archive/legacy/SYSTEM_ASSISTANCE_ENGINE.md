# SYSTEM_ASSISTANCE_ENGINE.md
# Moteur de guidance éditoriale — Spécification système
*Version 1.0 — Mars 2026*

---

## Vue d'ensemble

Le système d'assistance n'est pas une liste de features.
C'est un **moteur de guidance** qui observe le pipeline de Judith
et intervient au bon moment, avec le bon message, sur le bon canal.

---

## 1. Source de vérité

### Données utilisées
```
Firestore collection: contentItems
Champs lus:
  - production.workflowState     → où en est chaque pièce
  - distribution.instagram.status → est-ce publié?
  - distribution.instagram.scheduledAt → quand?
  - idea.createdAt               → depuis combien de temps?
  - asset.videoUrl               → est-ce monté?
  - memory.lastSuggestedAt       → a-t-on déjà suggéré ça?
```

### Calculs dérivés (générés à la volée)
```js
// Fonction principale du moteur
async function computePipelineState(userId) {
  const items = await getContentItems(userId)
  const now = new Date()

  return {
    // Combien de jours jusqu'au prochain contenu planifié
    daysUntilNextPost: computeDaysUntilNext(items),

    // Items bloqués depuis trop longtemps à chaque étape
    stuckItems: {
      ideas:    items.filter(i => i.workflowState === 'idea' && ageInDays(i) > 14),
      shot:     items.filter(i => i.workflowState === 'shot' && ageInDays(i) > 7),
      ready:    items.filter(i => i.workflowState === 'ready' && ageInDays(i) > 3),
    },

    // Cadence réelle des 30 derniers jours
    publishFrequency: computePublishFrequency(items, 30),

    // Trou dans le calendrier
    nextGap: findNextCalendarGap(items, 5), // jours sans contenu planifié
  }
}
```

---

## 2. Moteur de décision

### Approche : règles heuristiques pures (pas d'IA)
L'IA n'est pas nécessaire ici. Les règles sont simples et prévisibles.
Judith doit pouvoir **comprendre pourquoi** elle reçoit un rappel.

### Règles (par priorité)

```js
const REMINDER_RULES = [

  // CRITIQUE — Vide de publication imminent
  {
    id: 'gap_critical',
    priority: 1,
    condition: (state) => state.daysUntilNextPost <= 1,
    message: "Aucun contenu planifié pour demain. Tu as {readyCount} vidéos prêtes.",
    cooldown: '12h',
  },

  // IMPORTANT — Trou dans 3 jours
  {
    id: 'gap_warning',
    priority: 2,
    condition: (state) => state.daysUntilNextPost <= 3,
    message: "Tu n'as rien de planifié pour les 3 prochains jours.",
    cooldown: '24h',
  },

  // IMPORTANT — Vidéo montée non planifiée
  {
    id: 'ready_not_scheduled',
    priority: 3,
    condition: (state) => state.stuckItems.ready.length > 0,
    message: "{count} vidéo(s) montée(s) attendent d'être planifiées.",
    cooldown: '48h',
  },

  // INFO — Vidéos filmées non montées
  {
    id: 'shot_not_edited',
    priority: 4,
    condition: (state) => state.stuckItems.shot.length >= 2,
    message: "Tu as {count} vidéos filmées qui attendent d'être montées.",
    cooldown: '72h',
  },

  // INFO — Idées en attente
  {
    id: 'ideas_backlog',
    priority: 5,
    condition: (state) => state.stuckItems.ideas.length >= 5,
    message: "Tu as {count} idées en attente depuis plus de 2 semaines.",
    cooldown: '7d',
  },

  // POSITIF — Bonne cadence
  {
    id: 'good_cadence',
    priority: 6,
    condition: (state) => state.publishFrequency >= 3, // 3+ posts/semaine
    message: "Belle semaine — tu as publié {count} fois cette semaine! 🎉",
    cooldown: '7d',
  },
]
```

---

## 3. Fréquence de déclenchement

```
Cloud Scheduler: toutes les 24h à 9h00 (heure de Montréal)

Logique:
  1. Calculer l'état du pipeline (computePipelineState)
  2. Évaluer chaque règle par ordre de priorité
  3. Sélectionner MAX 1 rappel par run (le plus prioritaire)
  4. Vérifier cooldown (ne pas répéter dans la fenêtre)
  5. Envoyer si applicable
```

---

## 4. Anti-spam / Gestion de la fatigue

### Règles absolues
```
- MAX 1 rappel par jour
- MAX 3 rappels par semaine
- JAMAIS deux rappels du même type dans la même semaine
- JAMAIS un rappel positif + un rappel d'alerte le même jour
```

### Cooldown par type
```
gap_critical:      12h  (urgent — peut répéter)
gap_warning:       24h
ready_not_scheduled: 48h
shot_not_edited:   72h
ideas_backlog:     7j
good_cadence:      7j
```

### Stockage du cooldown
```
Firestore collection: reminderLog/{userId}
Champs:
  lastReminderType: string
  lastReminderAt: timestamp
  reminderHistory: [{ type, sentAt }]  // 30 derniers
```

---

## 5. Hiérarchisation

```
CRITIQUE (envoyer immédiatement)
  → gap_critical : Judith va manquer une publication demain

IMPORTANT (envoyer si pas de rappel récent)
  → gap_warning, ready_not_scheduled

INFO (envoyer seulement si silence depuis 3+ jours)
  → shot_not_edited, ideas_backlog

POSITIF (envoyer seulement si bonne nouvelle)
  → good_cadence
```

---

## 6. Canaux (par ordre d'implémentation)

### Phase 1 — Email (maintenant)
Via Firebase Extensions "Trigger Email" ou Resend API.
Simple, fiable, aucune infra supplémentaire.

### Phase 2 — In-app notification
Badge dans le header de l'app + banner dismissable.
Visible au prochain login.

### Phase 3 — Push notification (futur)
Via Firebase Cloud Messaging.
Nécessite PWA installée sur mobile.

### Phase 4 — SMS (très futur, si demandé)
Via Twilio. À évaluer selon l'usage réel.

---

## Critères de DONE

- [ ] Au moins 1 rappel envoyé et reçu par Judith
- [ ] Judith trouve le rappel utile (feedback verbal)
- [ ] Pas de spam — max 1 rappel/jour respecté
- [ ] Le cooldown fonctionne (pas de doublons)

## Critère de STOP

> Ne pas ajouter de règles supplémentaires avant d'avoir
> validé que les 6 règles de base sont utiles.
