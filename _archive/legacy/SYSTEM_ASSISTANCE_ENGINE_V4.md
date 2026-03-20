# SYSTEM_ASSISTANCE_ENGINE_V4.md
# Moteur de guidance éditoriale — Version 4
# Résilient dans le monde réel imparfait
*Version 4.0 — Mars 2026*

---

## Réponse à la question finale de V3

> Si le système fait 1 erreur sur 10, est-ce acceptable?

Non. Pour Judith, 1 erreur sur 10 = perte de confiance en 3 semaines.
Un système consulté quotidiennement doit viser < 1 erreur sur 50.

Ce qui garantit ce seuil :
1. Les données douteuses ne déclenchent rien (HIGH/MEDIUM/LOW confidence)
2. L'activité récente de Judith annule les rappels inutiles
3. L'attribution est prudente (corrélation ≠ causalité)
4. La baseline empêche la dérive adaptive
5. Le silence est visible, pas inquiétant
6. Le mode dégradé protège contre les pannes
7. Le système ne punit jamais un blocage technique
8. L'escalade est lente, non agressive

---

## AXE 1 — Niveaux de confiance opérationnels

### Trois comportements distincts (pas un score décoratif)

```js
const CONFIDENCE_LEVELS = {
  HIGH:   { threshold: 0.85, behavior: 'full_system' },
  MEDIUM: { threshold: 0.65, behavior: 'degraded' },
  LOW:    { threshold: 0,    behavior: 'safe_mode' },
}

function selectBehavior(dataQuality) {
  if (dataQuality >= 0.85) return 'full_system'
  if (dataQuality >= 0.65) return 'degraded'
  return 'safe_mode'
}

const BEHAVIOR_RULES = {
  full_system: {
    // Toutes les règles autorisées
    allowedRules: ['gap_critical', 'gap_warning', 'ready_not_scheduled',
                   'shot_not_edited', 'ideas_backlog', 'good_cadence'],
    maxPriority: 6,
  },
  degraded: {
    // Seulement les règles informationnelles, pas les critiques
    allowedRules: ['shot_not_edited', 'ideas_backlog'],
    maxPriority: 4,
    note: 'données partiellement fiables — rappels non-urgents seulement',
  },
  safe_mode: {
    // Silence total sauf alerte absolue (ex: publication échouée)
    allowedRules: ['publish_failed'],
    maxPriority: 1,
    note: 'données non fiables — silence, log interne uniquement',
  },
}
```

### Comportement safe_mode
```
safe_mode déclenché → aucun rappel envoyé à Judith
                   → log interne: "dataQuality={x}, safe_mode activé"
                   → dashboard affiche: "Synchronisation en cours..."
                   → jamais d'erreur visible côté Judith
```

---

## AXE 2 — recentUserActivityGuard

### Problème
Judith vient de publier → le système envoie quand même un rappel.
Résultat : irritation immédiate, perte de confiance.

### Solution : cooldown comportemental global

```js
async function recentUserActivityGuard(userId) {
  const recentActions = await getUserActions(userId, 6) // 6 dernières heures

  // Qu'est-ce qui compte comme "activité récente"?
  const significantActions = recentActions.filter(a =>
    ['published', 'scheduled', 'exported', 'opened_editor'].includes(a.type)
  )

  if (significantActions.length === 0) return { active: false }

  const lastAction = significantActions[0]
  const hoursAgo = hoursSince(lastAction.timestamp)

  return {
    active: true,
    hoursAgo,
    // Règles supprimées selon le type d'action récente
    suppressRules: getSuppressedRules(lastAction.type, hoursAgo),
  }
}

function getSuppressedRules(actionType, hoursAgo) {
  if (actionType === 'published' && hoursAgo < 6) {
    // Judith vient de publier → supprimer tout sauf critique absolu
    return ['gap_warning', 'ready_not_scheduled', 'shot_not_edited', 'ideas_backlog']
  }
  if (actionType === 'scheduled' && hoursAgo < 3) {
    // Judith vient de planifier → supprimer rappels de planification
    return ['gap_warning', 'ready_not_scheduled']
  }
  if (actionType === 'opened_editor' && hoursAgo < 2) {
    // Judith est dans l'éditeur → ne pas interrompre
    return ['gap_warning', 'shot_not_edited', 'ideas_backlog']
  }
  return []
}
```

---

## AXE 3 — Attribution avec niveau de certitude

### Problème
Corrélation ≠ causalité.
Judith aurait peut-être publié sans le rappel.

### Solution : confidenceAttribution

```js
function computeAttributionConfidence(reminder, action) {
  const delayMinutes = minutesBetween(reminder.sentAt, action.takenAt)

  // Corrélation forte → rapide et direct
  if (delayMinutes <= 30) return {
    level: 'HIGH',
    score: 1.0,
    note: 'action immédiate — probablement causée par le rappel',
  }

  // Corrélation probable
  if (delayMinutes <= 360) return { // 6h
    level: 'MEDIUM',
    score: 0.5,
    note: 'action dans les 6h — peut-être influencée',
  }

  // Corrélation faible
  return {
    level: 'LOW',
    score: 0.1,
    note: 'action tardive — probablement indépendante',
  }
}

// Règle d'adaptation conservatrice
function updateRuleWeight(ruleId, attribution) {
  // NE JAMAIS adapter agressivement sur LOW
  if (attribution.level === 'LOW') return // aucun changement

  // Adaptation prudente sur MEDIUM (très légère)
  if (attribution.level === 'MEDIUM') {
    adjustWeight(ruleId, +0.05) // +5% seulement
    return
  }

  // Adaptation normale sur HIGH
  if (attribution.level === 'HIGH') {
    adjustWeight(ruleId, +0.15) // +15%
  }
}
```

---

## AXE 4 — Adaptation limitée par baseline

### Problème
Le système adaptatif peut dériver :
- trop silencieux si Judith a une bonne période
- trop permissif si elle traverse une mauvaise période

### Solution : baseline + delta adaptatif

```js
const BASELINE_THRESHOLDS = {
  gap_critical:  1,   // jours — ne jamais aller en dessous
  gap_warning:   3,   // jours
  stuck_shot:    7,   // jours
  stuck_idea:    14,  // jours
  max_silence:   5,   // jours — ne jamais rester silencieux plus longtemps
}

function computeAdaptiveThreshold(ruleId, cadenceProfile) {
  const baseline = BASELINE_THRESHOLDS[ruleId]
  const adaptive = cadenceProfile.thresholds[ruleId]

  // Formule : 70% baseline + 30% adaptatif
  // Garantit que le système ne dérive jamais complètement
  return Math.round(baseline * 0.7 + adaptive * 0.3)
}

// Exemple concret
// Baseline gap_warning = 3 jours
// Judith publie tous les 7 jours → adaptive = 5.6 jours
// Final = 3 * 0.7 + 5.6 * 0.3 = 2.1 + 1.68 = 3.78 → arrondi à 4 jours
// Le système ne va jamais jusqu'à 5.6 — il reste ancré près du baseline
```

---

## AXE 5 — Silence visible

### Problème
Judith ne sait pas si le système fonctionne ou est mort.

### Solution : silence explicite dans le dashboard

```jsx
// Composant DashboardHealthStatus
function PipelineStatus({ engineResult }) {

  if (engineResult.state === 'no_action_needed') {
    return (
      <div className="pipeline-status pipeline-status--healthy">
        <span className="icon">✅</span>
        <span>Tout est en ordre</span>
        <span className="detail">
          Prochain contenu planifié dans {engineResult.daysUntilNext} jours
        </span>
      </div>
    )
  }

  if (engineResult.state === 'safe_mode') {
    return (
      <div className="pipeline-status pipeline-status--syncing">
        <span className="icon">🔄</span>
        <span>Synchronisation en cours...</span>
        {/* Ne jamais montrer "erreur" ou "problème" à Judith */}
      </div>
    )
  }

  if (engineResult.state === 'degraded') {
    return (
      <div className="pipeline-status pipeline-status--normal">
        {/* Rien de visible — mode dégradé silencieux */}
      </div>
    )
  }

  // Rappel actif
  return <ReminderBanner reminder={engineResult.reminder} />
}
```

---

## AXE 6 — État de santé système

### systemHealthState

```js
async function checkSystemHealth() {
  const checks = await Promise.allSettled([
    checkFirestoreLatency(),     // < 2s = OK
    checkSchedulerLastRun(),     // < 30min = OK
    checkCloudFunctionsStatus(), // all deployed = OK
    checkDataCompleteness(),     // > 80% items avec userId = OK
  ])

  const failures = checks.filter(c => c.status === 'rejected').length
  const latency = checks[0].value?.latencyMs || 0

  if (failures === 0 && latency < 2000) return 'OK'
  if (failures <= 1 || latency < 5000) return 'DEGRADED'
  return 'UNRELIABLE'
}

// Dans le moteur principal
async function runAssistanceEngine(userId) {
  const health = await checkSystemHealth()

  if (health === 'UNRELIABLE') {
    // Silence total — log interne uniquement
    await logInternal('engine_skipped', { reason: 'UNRELIABLE', userId })
    return null
  }

  if (health === 'DEGRADED') {
    // Seulement les alertes critiques de publication
    return runDegradedMode(userId)
  }

  // Mode normal
  return runFullEngine(userId)
}
```

---

## AXE 7 — Ne jamais punir un blocage système

### Problème
Export échoue → Judith ne peut pas passer "ready"
→ le système envoie "ready_not_scheduled" → injuste

### Solution : détection des blocages techniques

```js
// Dans validateItem()
function detectTechnicalBlocker(item) {
  return {
    // Export en cours ou récemment échoué
    exportBlocked: item.lastExportError &&
                   hoursSince(item.lastExportError.timestamp) < 24,

    // Upload Firebase Storage échoué
    uploadBlocked: item.lastUploadError &&
                   hoursSince(item.lastUploadError.timestamp) < 12,

    // Publication échouée récemment
    publishBlocked: item.distributionStatus === 'failed' &&
                    hoursSince(item.lastPublishAttempt) < 48,
  }
}

// Dans les règles — filtrer les items techniquement bloqués
function evaluateRule_readyNotScheduled(items) {
  const eligible = items.filter(item => {
    const blocker = detectTechnicalBlocker(item)
    // Ne jamais inclure un item techniquement bloqué
    return !blocker.exportBlocked &&
           !blocker.uploadBlocked &&
           item.workflowState === 'ready'
  })

  return eligible.length > 0
}
```

---

## AXE 8 — Stratégie d'escalade

### Principe
Pas plus fréquent. Mais plus pertinent.

```js
const ESCALATION_STRATEGY = {
  // Judith n'a pas publié depuis longtemps
  no_recent_publication: [
    {
      trigger: 3,  // jours depuis dernière publication
      rule: 'gap_warning',
      tone: 'gentle',
      message: "Tu n'as rien planifié pour les prochains jours.",
    },
    {
      trigger: 7,
      rule: 'gap_significant',
      tone: 'clear',
      message: "Ça fait une semaine sans publication. Tu as des vidéos prêtes?",
    },
    {
      trigger: 14,
      rule: 'gap_critical_long',
      tone: 'different',
      // Changement de ton — pas de rappel répété, question ouverte
      message: "Ça fait 2 semaines. Est-ce que quelque chose te bloque?",
      // Après ce message → silence pendant 7 jours, quelle que soit la réponse
      cooldownAfter: '7d',
    },
  ],
}

// Règle absolue de l'escalade
// → jamais plus d'un rappel par palier
// → après le palier 14j → silence forcé 7 jours
// → le système ne harcèle jamais
```

---

## Pipeline complet V4

```js
async function runAssistanceEngine(userId) {

  // 0. Santé du système
  const health = await checkSystemHealth()
  if (health === 'UNRELIABLE') return null

  // 1. Données brutes
  const rawItems = await getContentItems(userId)
  const memory = await getMemory(userId)
  const cadenceProfile = await computeCadenceProfile(userId)

  // 2. Validation
  const { reliable, dataQuality } = validatePipelineState(rawItems)
  const behavior = selectBehavior(dataQuality)

  // 3. Activité récente (AXE 2)
  const activityGuard = await recentUserActivityGuard(userId)

  // 4. État du pipeline
  const state = computePipelineState(reliable)

  // 5. Enrichissement mémoire EN AMONT
  const enriched = enrichWithMemory(state, memory, cadenceProfile)

  // 6. Évaluation des règles
  let triggeredRules = evaluateRules(enriched, behavior)

  // 7. Suppression selon activité récente
  if (activityGuard.active) {
    triggeredRules = triggeredRules.filter(r =>
      !activityGuard.suppressRules.includes(r.id)
    )
  }

  // 8. Vérification escalade
  triggeredRules = applyEscalationStrategy(triggeredRules, memory)

  // 9. Résolution des conflits
  const resolved = resolveRules(triggeredRules, enriched)

  // 10. Résultat final
  if (resolved.length === 0) {
    return { state: 'no_action_needed', daysUntilNext: state.daysUntilNextPost }
  }

  return { state: 'reminder', reminder: resolved[0] }
}
```

---

## Tableau de garanties

| Risque | Mécanisme de protection |
|--------|------------------------|
| Données incohérentes | validatePipelineState + confidence levels |
| Rappel après action de Judith | recentUserActivityGuard |
| Fausse attribution | confidenceAttribution (LOW = aucun ajustement) |
| Dérive adaptive | baseline 70% + adaptive 30% |
| Silence inquiétant | état no_action_needed visible dans dashboard |
| Panne Firestore | systemHealthState → safe_mode |
| Blocage technique punissant | detectTechnicalBlocker → exclusion |
| Harcèlement | escalade lente + cooldown forcé après J+14 |

---

## Réponse finale

> Qu'est-ce qui garantit < 1 erreur sur 50?

Le tableau ci-dessus.
Chaque point de défaillance possible a un mécanisme de protection explicite.

Ce n'est pas un système parfait.
Mais c'est un système qui **échoue gracieusement** :
- il se tait plutôt que de mal parler
- il s'adapte lentement plutôt que de dériver vite
- il protège la confiance de Judith comme ressource non renouvelable
