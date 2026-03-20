# SYSTEM_ASSISTANCE_ENGINE_V3.md
# Moteur de guidance éditoriale — Version 3
# Résilient, adaptatif, digne de confiance
*Version 3.0 — Mars 2026*

---

## Changements V3

V1 : liste de features
V2 : système avec règles
V3 : système résilient, adaptatif, qui mérite la confiance de Judith

---

## Principe de confiance (AXE 8)

> Préférer le silence à un rappel douteux.
> Un mauvais rappel coûte plus qu'un rappel manqué.

Cette règle traverse tout le système.
Elle s'applique à chaque décision : validation, déclenchement, message.

---

## 1. Validation des données (AXE 1)

### Problème
Le moteur suppose des données cohérentes.
En réalité : migration partielle, champs manquants, états contradictoires.

### Solution : validatePipelineState()

```js
function validateItem(item) {
  const issues = []

  // Incohérences détectées
  if (item.workflowState === 'ready' && !item.videoUrl) {
    issues.push('ready_sans_video')
  }
  if (item.distributionStatus === 'published' && !item.publishedAt) {
    issues.push('published_sans_timestamp')
  }
  if (item.scheduledAt && item.distributionStatus !== 'scheduled') {
    issues.push('date_sans_statut_scheduled')
  }
  if (!item.userId) {
    issues.push('migration_incomplete')
  }

  return {
    valid: issues.length === 0,
    issues,
    // Niveau de confiance : 0 = invalide, 1 = parfait
    confidence: Math.max(0, 1 - issues.length * 0.3),
  }
}

function validatePipelineState(items) {
  const validated = items.map(item => ({
    ...item,
    _validation: validateItem(item),
  }))

  return {
    // Seulement les items fiables pour les décisions
    reliable: validated.filter(i => i._validation.confidence >= 0.7),
    // Items suspects → exclus silencieusement OU signalés
    suspect: validated.filter(i => i._validation.confidence < 0.7),
    // Taux de fiabilité global
    dataQuality: validated.filter(i => i._validation.valid).length / validated.length,
  }
}
```

### Comportement selon la qualité des données

```
dataQuality >= 0.9 → système normal
dataQuality 0.6-0.9 → rappels critiques seulement
dataQuality < 0.6 → silence total + log interne
```

> **Règle de confiance :** si les données sont douteuses,
> ne rien envoyer. Judith ne doit jamais recevoir un rappel
> basé sur une incohérence invisible.

---

## 2. Logique de dominance entre règles (AXE 2)

### Problème
Plusieurs règles vraies simultanément.
La priorité seule ne suffit pas.

### Solution : dominance conditionnelle

```js
function resolveRules(triggeredRules, state) {

  // Règle 1 : dominance absolue du critique
  if (triggeredRules.includes('gap_critical')) {
    // Toutes les autres règles sont supprimées
    // Message enrichi avec l'action disponible
    const readyCount = state.stuckItems.ready.length
    return [{
      id: 'gap_critical',
      message: readyCount > 0
        ? `Aucun contenu planifié pour demain. Tu as ${readyCount} vidéo(s) prête(s) à planifier.`
        : `Aucun contenu planifié pour demain.`,
    }]
  }

  // Règle 2 : fusion des règles compatibles
  // ready_not_scheduled + gap_warning → 1 seul message combiné
  if (triggeredRules.includes('gap_warning') &&
      triggeredRules.includes('ready_not_scheduled')) {
    return [{
      id: 'gap_warning_with_ready',
      message: `Tu n'as rien de planifié pour 3 jours, mais tu as des vidéos prêtes. C'est le moment!`,
    }]
  }

  // Règle 3 : suppression des règles redondantes
  // Si ready_not_scheduled → ne pas aussi envoyer shot_not_edited
  if (triggeredRules.includes('ready_not_scheduled')) {
    return triggeredRules
      .filter(r => r !== 'shot_not_edited')
      .slice(0, 1) // MAX 1
      .map(id => REMINDER_RULES.find(r => r.id === id))
  }

  // Cas normal : règle la plus prioritaire
  return [triggeredRules[0]]
    .map(id => REMINDER_RULES.find(r => r.id === id))
}
```

---

## 3. Mémoire en amont — modulateur du système (AXE 3)

### Problème
La mémoire filtre après la décision.
Elle doit guider avant.

### Solution : pipeline enrichWithMemory

```js
// Pipeline complet
async function runAssistanceEngine(userId) {

  // Étape 1 : données brutes
  const rawItems = await getContentItems(userId)
  const memory = await getMemory(userId)

  // Étape 2 : validation
  const { reliable, dataQuality } = validatePipelineState(rawItems)
  if (dataQuality < 0.6) return null // silence

  // Étape 3 : état du pipeline
  const state = computePipelineState(reliable)

  // Étape 4 : enrichissement par la mémoire (AVANT la décision)
  const enrichedState = enrichWithMemory(state, memory)

  // Étape 5 : décision
  const triggeredRules = evaluateRules(enrichedState)
  const resolved = resolveRules(triggeredRules, enrichedState)

  return resolved[0] || null // null = silence intentionnel
}

function enrichWithMemory(state, memory) {
  return {
    ...state,

    // Modifier les seuils selon le comportement réel
    effectiveGapThreshold: memory.averagePublishGap * 0.8,

    // Réduire priorité des règles souvent ignorées
    ruleWeights: {
      ideas_backlog: memory.ideasBacklogDismissed > 3 ? 0.3 : 1.0,
      ready_not_scheduled: memory.readyNotScheduledReacted ? 1.5 : 1.0,
    },

    // Mode doux si Judith publie rarement
    mode: memory.averagePublishGap > 10 ? 'gentle' : 'normal',
  }
}
```

---

## 4. Profil de cadence adaptatif (AXE 4)

### Problème
Les seuils hardcodés (3j, 7j, 14j) ne correspondent
pas à la réalité de Judith.

### Solution : cadenceProfile calculé

```js
async function computeCadenceProfile(userId) {
  const publishHistory = await getPublishHistory(userId, 60) // 60 jours

  const gaps = publishHistory
    .map((p, i) => i > 0
      ? daysBetween(p.publishedAt, publishHistory[i-1].publishedAt)
      : null)
    .filter(Boolean)

  const avgGap = gaps.length > 0
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length
    : 7 // défaut si pas d'historique

  return {
    avgGap,                           // ex: 3.5 jours
    targetGap: avgGap * 0.9,          // objectif légèrement plus ambitieux
    warningThreshold: avgGap * 1.2,   // alerte si on dépasse ce délai
    criticalThreshold: avgGap * 1.8,  // critique si on dépasse beaucoup

    // Seuils adaptés pour les règles
    thresholds: {
      gap_critical: Math.max(1, Math.round(avgGap * 0.5)),
      gap_warning:  Math.max(2, Math.round(avgGap * 0.8)),
      stuck_idea:   Math.round(avgGap * 4),    // idée bloquée = 4 cycles
      stuck_shot:   Math.round(avgGap * 2),    // filmé non monté = 2 cycles
    },
  }
}
```

---

## 5. Silence intelligent — no_action_needed (AXE 5)

### État explicite

```js
function evaluateRules(enrichedState) {

  // Conditions du silence intelligent
  const pipelineHealthy =
    enrichedState.daysUntilNextPost >= enrichedState.thresholds.gap_warning &&
    enrichedState.stuckItems.ready.length === 0 &&
    enrichedState.stuckItems.shot.length === 0 &&
    enrichedState.publishFrequency >= enrichedState.targetFrequency

  if (pipelineHealthy) {
    // Silence total — mais on log l'état positif
    return [{ id: 'no_action_needed', silent: true }]
  }

  // ... évaluation normale des règles
}
```

### Règle de silence
```
no_action_needed → rien n'est envoyé
                 → aucune notification
                 → aucun badge in-app
                 → Judith peut travailler sans distraction
```

> Le silence est un état actif, pas une absence de décision.

---

## 6. Attribution des actions (AXE 6)

### Problème
On envoie des rappels mais on ne sait pas s'ils fonctionnent.

### Solution : actionAttribution

```js
// Quand on envoie un rappel
async function sendReminder(userId, reminder) {
  const sentAt = new Date()

  await db.collection('reminderLog').add({
    userId,
    type: reminder.id,
    sentAt,
    actionExpected: getExpectedAction(reminder.id),
    // ex: 'schedule_content' pour ready_not_scheduled
  })
}

// Quand Judith fait une action (publication, planification...)
async function recordAction(userId, actionType) {
  const recentReminders = await getRecentReminders(userId, 48) // 48h

  const attributed = recentReminders.find(r =>
    r.actionExpected === actionType &&
    !r.actionTaken
  )

  if (attributed) {
    // Ce rappel a fonctionné!
    await updateReminder(attributed.id, {
      actionTaken: actionType,
      actionTakenAt: new Date(),
      reactionDelayHours: hoursBetween(attributed.sentAt, new Date()),
    })

    // Mettre à jour le poids de cette règle dans la mémoire
    await updateMemory(userId, {
      [`ruleEffectiveness.${attributed.type}`]: 'positive',
    })
  }
}
```

### Métriques d'efficacité (calculées après 4 semaines)
```
ruleEffectiveness: {
  gap_critical:        0.85,  // Judith réagit 85% du temps
  ready_not_scheduled: 0.60,
  ideas_backlog:       0.15,  // souvent ignoré → réduire fréquence
}
```

---

## 7. Fenêtre d'interaction préférée (AXE 7)

### Problème
Envoyer à 9h peut être le mauvais moment.

### Solution : preferredWindow

```js
async function computePreferredWindow(userId) {
  const actions = await getUserActions(userId, 30) // 30 jours

  // Quand Judith est active dans l'app ?
  const hourCounts = new Array(24).fill(0)
  actions.forEach(action => {
    const hour = new Date(action.timestamp).getHours()
    hourCounts[hour]++
  })

  // Trouver la fenêtre de 2h la plus active
  const bestHour = hourCounts.indexOf(Math.max(...hourCounts))

  return {
    preferredHour: bestHour,
    // Si pas assez de données → défaut 9h
    confidence: actions.length >= 10 ? 'high' : 'low',
  }
}

// Le scheduler s'adapte
// Au lieu de "tous les jours à 9h"
// → "tous les jours à l'heure préférée de Judith"
```

---

## Réponse à la question finale

> Si Judith utilise ce système pendant 6 mois,
> qu'est-ce qui garantit qu'elle lui fait encore confiance ?

**3 garanties concrètes :**

**1. Le système se trompe rarement**
Grâce à `validatePipelineState()` : si les données sont douteuses,
le système se tait plutôt que d'envoyer un rappel absurde.
Judith ne reçoit jamais un rappel pour une vidéo qui n'existe pas.

**2. Le système apprend et s'adapte**
Grâce à `actionAttribution` et `enrichWithMemory` :
Si Judith ignore toujours les rappels "ideas_backlog",
le système réduit automatiquement leur fréquence.
Si elle réagit vite aux rappels "ready_not_scheduled",
ils restent prioritaires.
Le système s'adapte à elle — pas l'inverse.

**3. Le système sait se taire**
L'état `no_action_needed` est explicite.
Quand tout va bien, Judith n'entend rien.
Pas de "belle semaine!" automatique. Pas de notification inutile.
Le silence est un signe de santé, pas d'indifférence.

---

## Ce que ce système N'est pas

Il n'est pas un coach qui juge.
Il n'est pas un algorithme qui optimise pour l'engagement.
Il n'est pas un bot qui génère du contenu.

Il est un système qui observe,
attend le bon moment,
dit la bonne chose une fois,
et se tait le reste du temps.
