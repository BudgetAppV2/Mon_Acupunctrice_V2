# SYSTEM_VALUE_CYCLE.md
# Boucle de valeur complète — Du feedback à la mémoire
*Version 1.0 — Mars 2026*

---

## Le problème du système linéaire

Le système actuel est :
```
idée → production → publication
```

Il manque le retour. Sans feedback, le système ne peut pas s'améliorer
et Judith ne peut pas apprendre de son historique.

---

## La boucle complète

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  1. INPUT          2. TRANSFORMATION              │
│  (Idées)           (Production)                   │
│     │                   │                         │
│     ▼                   ▼                         │
│  Banque d'idées    Éditeur vidéo                  │
│  Blitz sessions    Sous-titres                    │
│  Inspiration       Export                         │
│                         │                         │
│                    3. OUTPUT                      │
│                    (Publication)                   │
│                         │                         │
│                         ▼                         │
│                    Instagram Post                  │
│                         │                         │
│                    4. FEEDBACK                    │
│                    (Résultats)                     │
│                         │                         │
│           ┌─────────────┴──────────────┐          │
│           │                            │          │
│     Métriques IG                Comportement      │
│     (vues, likes,               (Judith a-t-elle  │
│      saves, reach)              publié? à temps?) │
│           │                            │          │
│           └─────────────┬──────────────┘          │
│                         │                         │
│                    5. RÉINJECTION                 │
│                    (Mémoire + Guidance)            │
│                         │                         │
│           ┌─────────────┴──────────────┐          │
│           │                            │          │
│     Mémoire                      Rappels          │
│     (historique,                 (guidance,       │
│      patterns,                    coaching,       │
│      reuseScore)                  suggestions)    │
│           │                            │          │
│           └─────────────┬──────────────┘          │
│                         │                         │
│                         ▼                         │
│                    Retour à 1. INPUT               │
│                    (idées mieux ciblées)           │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Phase 1 — Feedback comportemental (maintenant)

Pas besoin d'API Instagram pour commencer.
On observe le comportement de Judith directement.

```js
// Métriques internes disponibles dès maintenant
const behavioralFeedback = {
  publishedOnTime: scheduledAt && publishedAt <= scheduledAt + 1h,
  timeFromShotToEdit: editedAt - shotAt,
  timeFromEditToPublish: publishedAt - editedAt,
  weeklyFrequency: publishedThisWeek.length,
}
```

Ces données alimentent directement la mémoire comportementale
et ajustent les rappels (fréquence, ton, timing).

---

## Phase 2 — Feedback Instagram (futur, API Graph)

Une fois l'API Instagram Insights connectée :

```js
const instagramFeedback = {
  views: post.impressions,
  saves: post.saved,
  shares: post.shares,
  profileVisits: post.profile_visits,
  websiteClicks: post.website_clicks, // clics vers Wix
}
```

Ces données alimentent le `reuseScore` et les suggestions
de contenu à recycler.

---

## Phase 3 — Réinjection dans les idées

```js
// Quand Judith ouvre la banque d'idées,
// le système peut suggérer :

"Ton contenu sur la fertilité génère 3x plus de saves.
Tu as 2 idées sur ce sujet en attente."

"Tu n'as pas publié sur la grossesse depuis 3 semaines.
Tu as 4 idées dans cette catégorie."
```

Ces suggestions sont affichées, jamais imposées.
Judith reste l'autrice de ses décisions.

---

## Implémentation progressive

### Maintenant (Phase M1 + M2)
- Feedback comportemental via timestamps Firestore
- Mémoire basique (lastPublishedAt, publishCount)
- Rappels basés sur l'état du pipeline

### Court terme (Phase M2 complète)
- Dashboard de santé éditoriale
- Fréquence de publication visible
- Items bloqués identifiés

### Moyen terme (Phase M3+)
- API Instagram Insights pour les métriques
- reuseScore calculé automatiquement
- Suggestions de recyclage

### Long terme (Phase M4)
- Patterns détectés (quels sujets performent)
- Suggestions contextuelles basées sur l'historique
- Coach de cadence intelligent

---

## Critère de DONE (Phase 1)
- [ ] Judith peut voir sa fréquence de publication dans le dashboard
- [ ] Le système identifie les items bloqués depuis trop longtemps
- [ ] Un rappel utile est envoyé au moins 1x par semaine

## Critère de STOP
> Ne pas connecter l'API Instagram Insights avant que
> le feedback comportemental interne soit validé.
