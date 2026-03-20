# SYSTEM_MEMORY.md
# Mémoire du système — Composant actif
*Version 1.0 — Mars 2026*

---

## Vue d'ensemble

La mémoire n'est pas un champ de base de données.
C'est un **composant actif** qui influence les rappels,
les suggestions et la priorisation.

---

## Types de mémoire

### 1. Mémoire historique (ce qui a été publié)
```
Source: contentItems où distribution.instagram.status === 'published'
Utilisation:
  - Éviter de suggérer un sujet récemment traité
  - Identifier les sujets jamais couverts
  - Calculer la cadence réelle
```

### 2. Mémoire comportementale (ce que Judith fait réellement)
```
Source: calculé à partir des timestamps de contentItems
Champs dérivés:
  - averageTimeShotToEdit    // combien de temps entre filmer et monter
  - averageTimeEditToPublish // combien de temps entre monter et publier
  - preferredPublishDays     // quels jours elle publie le plus
  - preferredCategories      // quelles catégories elle produit le plus
```

### 3. Mémoire décisionnelle (ce que le système a déjà suggéré)
```
Source: Firestore collection reminderLog/{userId}
Champs:
  lastReminderType: string
  lastReminderAt: timestamp
  reminderHistory: [{ type, sentAt, dismissed }]
```

---

## Mise à jour de la mémoire

### Événements déclencheurs

```
Publication réussie
  → met à jour: memory.publishCount, memory.lastPublishedAt
  → recalcule: publishFrequency

Changement de workflowState
  → enregistre: transitions avec timestamp
  → alimente: averageTimeShotToEdit, etc.

Rappel envoyé
  → enregistre: dans reminderLog
  → met à jour: lastSuggestedAt sur les items concernés

Rappel ignoré (non-action après 48h)
  → enregistre: dismissed: true
  → augmente: cooldown pour ce type de rappel
```

---

## Utilisation de la mémoire

### Dans les rappels
```js
// Ne pas suggérer un sujet déjà publié récemment
function filterRecentTopics(suggestions, history) {
  const recentTopics = history
    .filter(h => ageInDays(h.publishedAt) < 30)
    .map(h => h.topic)

  return suggestions.filter(s => !recentTopics.includes(s.topic))
}

// Adapter la fréquence selon le comportement réel
function adjustReminderFrequency(behavioralMemory) {
  if (behavioralMemory.averagePublishGap > 7) {
    // Judith publie lentement → rappels plus doux, moins fréquents
    return 'gentle'
  }
  return 'normal'
}
```

### Dans les suggestions de priorité
```js
// Suggérer les items bloqués à l'étape la plus longue
function suggestNextAction(items, behavioralMemory) {
  const bottleneck = findBottleneck(items, behavioralMemory)

  if (bottleneck === 'editing') {
    return "Tu as tendance à laisser les vidéos filmées attendre. " +
           "Monte-en une aujourd'hui?"
  }
}
```

---

## Évitement de répétition

```
Règle 1: Ne jamais suggérer le même item deux fois en 72h
Règle 2: Ne jamais utiliser le même type de rappel deux fois en 48h
Règle 3: Si un rappel est ignoré 3 fois → augmenter le cooldown x2
Règle 4: Si un item reste bloqué > 30 jours → le signaler une seule fois
          puis le laisser (ne pas harceler)
```

---

## Champ memory sur ContentItem

```js
memory: {
  lastSuggestedAt: timestamp,  // dernière fois qu'on a mentionné cet item
  suggestCount: number,         // combien de fois suggéré
  dismissed: boolean,           // Judith a explicitement ignoré
  reuseScore: number,           // 0-1, basé sur performance future
  tags: string[],               // classification automatique par topic
}
```

---

## Critère de DONE
- [ ] La mémoire est mise à jour à chaque publication
- [ ] Le système ne répète pas le même rappel deux fois de suite
- [ ] Les sujets récents sont exclus des suggestions

## Critère de STOP
> Pas de scoring complexe ni de ML tant que la mémoire basique
> (historique + cooldown) n'est pas validée en production.
