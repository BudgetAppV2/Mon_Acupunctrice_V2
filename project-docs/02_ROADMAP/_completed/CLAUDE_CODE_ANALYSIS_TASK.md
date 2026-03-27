# TÂCHE — Analyse profonde de faisabilité Phase Stratégie (S01-S08)

## Ta mission

Tu dois faire une **analyse profonde** de la codebase actuelle pour évaluer
la faisabilité de chaque milestone S01 à S08. L'objectif est d'identifier
les bloqueurs, les décisions architecturales à prendre, et les impacts
croisés entre milestones AVANT qu'on commence à coder.

**Ce n'est PAS un overview.** Tu dois :
1. LIRE chaque fichier impacté (pas deviner son contenu)
2. Compter les lignes des composants existants (règle des 150 lignes)
3. Identifier les patterns existants qu'on doit réutiliser
4. Trouver les incompatibilités concrètes
5. Proposer des solutions quand tu trouves un problème

---

## Documents à lire en premier

1. `CLAUDE.md` → Contraintes et état actuel
2. `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md` → La roadmap S01-S08 complète
3. `project-docs/02_ROADMAP/CODEBASE_ANALYSIS_STRATEGY.md` → Analyse Gemini (premier passage, à approfondir)

---

## Fichiers à analyser en profondeur

### Bloc 1 — Types et data model (impacte TOUT)
```
lib/types/index.ts                    → Tous les types. Où ajouter ContentStyle, CalendarSlot, etc.
project-docs/03_TECH/DATA_MODEL.md    → Schema documenté vs code réel — sont-ils synchro?
firestore.rules                       → Rules actuelles, quoi ajouter pour nouvelles collections
firestore.indexes.json                → Index existants, quels nouveaux sont requis
```

### Bloc 2 — Calendrier (S01, S02, S07, S08)
```
components/features/calendar/CalendarView.tsx  → Composant principal. Combien de lignes? Structure?
components/features/calendar/CalendarDay.tsx   → Rendu d'un jour. Comment ajouter slots fantômes?
components/features/calendar/DashboardBar.tsx  → Barre résumé. Comment ajouter progression semaine?
components/features/calendar/ItemDetailSheet.tsx → Detail au tap. Comment adapter pour les slots?
components/features/calendar/ScheduleSheet.tsx  → Assigner un item à un jour. Réutilisable pour FillSlotSheet?
components/features/calendar/CalendarHeader.tsx → Header. Où mettre le résumé mensuel (S08)?
lib/hooks/useCalendar.ts              → Hook central. Comment merger contentItems + calendarSlots?
```

**Questions spécifiques à résoudre :**
- useCalendar retourne `itemsByDay: Map<string, ContentItem[]>`. Comment ajouter les slots
  sans casser l'interface? Faut-il un `slotsByDay` séparé ou fusionner dans itemsByDay?
- CalendarDay reçoit `items: ContentItem[]`. Les slots ne sont PAS des ContentItem.
  Comment gérer le polymorphisme? Union type? Wrapper?
- ScheduleSheet montre les contentItems "schedulable". FillSlotSheet (S02) aura une
  logique similaire mais filtrée par style. Peut-on réutiliser le composant?

### Bloc 3 — Idées (S01, S06)
```
components/features/ideas/              → TOUS les fichiers. Lister et lire chacun.
lib/hooks/useContentItems.ts            → Comment on query les items
lib/hooks/useCreateContentItem.ts       → Comment on crée un item
lib/hooks/useUpdateContentItem.ts       → Comment on update un item
lib/utils/categories.ts                 → getCategoryLabel. Créer getStyleLabel similaire?
```

**Questions spécifiques :**
- IdeaDetailSheet : combien de lignes? Où placer le sélecteur de style sans dépasser 150?
- CreateIdeaSheet : même question
- ContentCard : affiche-t-il le style? Doit-il l'afficher?

### Bloc 4 — Publication (S03, S04, S05)
```
app/api/cron/publish/route.ts           → Le cron. 1x/jour. Comment gérer les stories auto?
app/api/publish/route.ts                → Proxy vers CF publishToInstagram. Supporte-t-il STORIES?
app/api/generate-caption/route.ts       → Proxy vers CF generateCaption. Quels params accepte-t-il?
lib/hooks/usePublish.ts                 → Hook publication. Faut-il un usePublishStory séparé?
components/features/publish/PublishSheet.tsx → Sheet de publication. Comment ajouter "Story IG"?
components/features/publish/             → TOUS les fichiers du dossier
```

**Questions spécifiques :**
- Le cron `/api/cron/publish` query `contentItems` avec `distributionStatus=='scheduled'`.
  Pour S04, il doit AUSSI query `calendarSlots` avec `autoPublish==true`.
  Comment fusionner les deux queries dans le même cron sans créer un monstre?
- Le cron est limité à 1x/jour (plan Hobby Vercel). Est-ce qu'on peut ajouter
  une 2e route de cron? Ou faut-il tout mettre dans le même endpoint?
  Vérifier la doc Vercel sur les limites du plan Hobby.
- La Cloud Function `publishToInstagram` accepte-t-elle `media_type`?
  Si non, il faut soit la modifier soit appeler l'API Graph directement
  depuis le cron (comme on fait déjà pour Facebook/YouTube).
- `generateCaption` reçoit `title, category, notes, captionDraft`.
  Pour S05, il faut ajouter `platform` et `contentStyle`. Est-ce que
  la CF peut recevoir des params supplémentaires sans modification,
  ou faut-il modifier la CF aussi?

### Bloc 5 — Profil et stats (S07)
```
app/(app)/profil/page.tsx               → Page profil. Combien de lignes? Où ajouter jalons?
components/features/profile/             → TOUS les fichiers. StatsSummary existe déjà?
app/(app)/stats/page.tsx                → Page stats. Séparée du profil.
```

### Bloc 6 — Navigation (S06)
```
app/(app)/layout.tsx                    → BottomTabBar avec 4 onglets (grid-cols-4)
app/(app)/blitz/page.tsx                → Page vide. Candidat remplacement par Inspiration.
```

**Question spécifique :**
- Remplacer `blitz` par `inspiration` : faut-il juste renommer le dossier et
  changer l'icône/label dans TABS, ou y a-t-il d'autres références à blitz?

### Bloc 7 — Vercel config
```
vercel.json                             → Crons. Combien de crons le plan Hobby supporte?
next.config.mjs                         → Config Next.js. Contraintes?
package.json                            → Dépendances actuelles. Quoi ajouter pour S03/S04?
```

---

## Ce que tu dois produire

Pour **chaque milestone** (S01 à S08), un document séparé dans
`project-docs/02_ROADMAP/analysis/` avec cette structure :

```
project-docs/02_ROADMAP/analysis/
  S01_ANALYSIS.md
  S02_ANALYSIS.md
  S03_ANALYSIS.md
  S04_ANALYSIS.md
  S05_ANALYSIS.md
  S06_ANALYSIS.md
  S07_ANALYSIS.md
  S08_ANALYSIS.md
  CROSS_CUTTING_CONCERNS.md  → Impacts croisés entre milestones
```

### Format de chaque S[XX]_ANALYSIS.md

```markdown
# Analyse S[XX] — [Nom]

## Complexité réelle : [Petit / Moyen / Gros]

## Fichiers à modifier — Analyse détaillée

### [path/to/file.ts] (actuellement XX lignes)
- **Ce qui existe :** [description précise du code actuel]
- **Ce qui change :** [modification précise]
- **Risque de dépasser 150 lignes :** [oui/non, si oui → plan de découpage]
- **Pattern existant à réutiliser :** [ex: même pattern que ScheduleSheet]

[Répéter pour chaque fichier]

## Fichiers à créer

### [path/to/new/file.ts]
- **Rôle :** [description]
- **Pattern à suivre :** [quel fichier existant sert de modèle]
- **Estimation lignes :** [XX lignes]

## Data model — Changements précis

### Nouveaux types TypeScript (à ajouter dans lib/types/index.ts)
```typescript
// Code exact des interfaces à ajouter
```

### Nouveaux index Firestore (à ajouter dans firestore.indexes.json)
```json
// Index exact
```

### Nouvelles security rules (à ajouter dans firestore.rules)
```javascript
// Rules exactes
```

## Décisions architecturales à prendre
- [Décision 1 : options A vs B, recommandation avec justification]
- [Décision 2 : ...]

## Risques et bloqueurs potentiels
- [Risque 1 : description + impact + mitigation]

## Impact sur les autres milestones
- [Comment ce milestone affecte S0X, S0Y...]
```

### Format de CROSS_CUTTING_CONCERNS.md

```markdown
# Impacts croisés — Phase Stratégie

## 1. Coexistence calendarSlots + contentItems
[Analyse détaillée de comment les deux collections cohabitent
dans useCalendar, CalendarView, CalendarDay]

## 2. Cron Vercel — Limites et stratégie
[Analyse de combien de crons le plan Hobby supporte,
comment gérer stories auto + publish normal + insights]

## 3. Cloud Functions — Modifications requises
[Est-ce que les CF existantes doivent être modifiées?
Ou peut-on tout faire côté Next.js API routes?]

## 4. Navigation — 4 onglets vs 5
[Comment intégrer Inspiration sans casser le layout 375px]

## 5. Chaîne de données slot → contentItem → publication
[Le flow complet : un slot est créé (S02), Judith assigne une idée,
l'idée devient un contentItem, le contentItem est publié.
Comment les IDs se lient? Quand le slot passe à "completed"?]

## 6. Ordre d'implémentation — Validation
[Confirmer ou ajuster l'ordre Sprint 1-4 basé sur les dépendances
techniques réelles trouvées dans l'analyse]
```

---

## Règles pour cette analyse

1. **LIS chaque fichier mentionné.** Ne devine pas le contenu.
2. **Compte les lignes.** Si un composant fait 130 lignes et qu'on ajoute
   20 lignes, il faut un plan de découpage.
3. **Montre le code exact** des types TypeScript, index, et rules à ajouter.
4. **Identifie les patterns.** Si useCalendar fait X, useSlots doit faire X pareil.
5. **Sois concret sur les risques.** Pas "pourrait être complexe" mais
   "CalendarDay.tsx fait 67 lignes, ajouter le rendu des slots fantômes
   ajoutera ~30 lignes, total 97 → OK sous 150".
6. **Vérifie la doc Vercel** sur les limites du plan Hobby pour les crons.

---

## Contraintes du projet (rappel)

- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
