# Analyse S02 — Calendrier-cadre

## Complexite reelle : Gros

C'est le milestone le plus structurellement impactant. Il ajoute une 2e collection Firestore, un 2e flux de donnees dans le calendrier, et 3+ nouveaux composants.

## Fichiers a modifier — Analyse detaillee

### lib/hooks/useCalendar.ts (actuellement 97 lignes)
- **Ce qui existe :** Query `contentItems` par `scheduledAt` dans le range du mois. Retourne `itemsByDay: Map<string, ContentItem[]>` et `days: Date[]` (grille 6x7). Key format: `"YYYY-M-D"` (getMonth() 0-indexed).
- **Ce qui change :** Ajouter une 2e query parallele sur `calendarSlots` (meme range). Retourner un nouveau `slotsByDay: Map<string, CalendarSlot[]>` en plus de `itemsByDay`. NE PAS fusionner les deux dans une seule Map (types differents).
- **Risque de depasser 150 lignes :** Possible (97 + ~30 pour 2e query + slotsByDay = ~127). OK sous 150.
- **Decision critique :** `itemsByDay` vs `slotsByDay` separes OU un `dayData: Map<string, { items: ContentItem[], slots: CalendarSlot[] }>` unifie. **Recommandation : separes** — plus simple, pas de type union complexe.

### components/features/calendar/CalendarView.tsx (actuellement 120 lignes)
- **Ce qui existe :** Grille 6x7 avec swipe, DashboardBar en haut, 2 bottom sheets (ScheduleSheet + ItemDetailSheet).
- **Ce qui change :** Passer `slots` a CalendarDay. Ajouter un 3e bottom sheet (FillSlotSheet). Appeler `generateWeekSlots()` quand on navigue vers un mois futur.
- **Risque de depasser 150 lignes :** OUI (120 + ~25 = ~145). Tres juste.
- **Plan si depasse :** Extraire la logique de generation de slots dans un hook `useSlotGeneration()`.

### components/features/calendar/CalendarDay.tsx (actuellement 72 lignes)
- **Ce qui existe :** Rendu d'un seul jour. Affiche dot/badge/thumbnail selon items.
- **Ce qui change :** Recevoir `slots: CalendarSlot[]` en plus de `items`. Afficher les slots fantomes (outline pointille, couleur du style, icone +). Gerer le tap sur un slot (ouvre FillSlotSheet au lieu de ItemDetailSheet).
- **Risque de depasser 150 lignes :** Probable (72 + ~40 pour logique slots = ~112). OK.
- **Pattern :** Le slot fantome est un div avec `border-dashed border-2` et la couleur du style.

### components/features/calendar/DashboardBar.tsx (actuellement 37 lignes)
- **Ce qui existe :** 4 badges : publiees, planifiees, pretes, idees.
- **Ce qui change :** Remplacer par le resume de la semaine courante : "Semaine 12 — 2/2" avec des cercles de statut (ouvert/rempli/complete).
- **Risque de depasser 150 lignes :** Non (37 + ~50 = ~87). OK.

### components/features/calendar/ScheduleSheet.tsx (actuellement 79 lignes)
- **Ce qui existe :** Filtre les items schedulables, les groupe par workflowState, tap → schedule a 18h.
- **Ce qui change :** Rien directement. FillSlotSheet est un NOUVEAU composant (pas une modification de ScheduleSheet).
- **Pattern a reutiliser pour FillSlotSheet :** Le groupement et le rendu de la liste d'items.

## Fichiers a creer

### lib/hooks/useCalendarSlots.ts
- **Role :** Hook dedie pour query `calendarSlots` par mois. Separe de useCalendar pour clarte. Retourne `slotsByDay: Map<string, CalendarSlot[]>`.
- **Pattern a suivre :** Meme pattern que useCalendar (onSnapshot, range de dates).
- **Estimation lignes :** ~60 lignes.

### lib/utils/calendarSlots.ts
- **Role :** `generateWeekSlots(userId, weekStart, phase)` — cree les slots pour une semaine si ils n'existent pas encore. Check anti-doublons. Batch Firestore write.
- **Pattern a suivre :** Meme pattern que useCreateContentItem (batch write).
- **Estimation lignes :** ~50 lignes.

### components/features/calendar/FillSlotSheet.tsx
- **Role :** BottomSheet qui s'ouvre au tap sur un slot vide. Montre le style suggere + 3 boutons : "Choisir une idee" (filtre par style), "Creer une idee", "Passer".
- **Pattern a suivre :** ScheduleSheet (meme structure BottomSheet + liste d'items).
- **Estimation lignes :** ~80 lignes.

### components/features/calendar/SlotGhost.tsx
- **Role :** Rendu d'un slot fantome dans CalendarDay (outline pointille + couleur + icone).
- **Estimation lignes :** ~20 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
export type SlotFormat = 'reel' | 'story' | 'post';
export type SlotStatus = 'open' | 'filled' | 'completed' | 'skipped';

export interface CalendarSlot {
  id: string;
  userId: string;
  scheduledDate: Timestamp;
  dayOfWeek: number;
  contentStyle: ContentStyle;
  format: SlotFormat;
  contentItemId?: string;
  status: SlotStatus;
  sequenceId?: string;
  sequenceRole?: string;
  autoPublish?: boolean;
  promptTitle?: string;
  promptDescription?: string;
  weekNumber: number;
  planPhase: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PlanPhase {
  phase: number;
  label: string;
  reelsPerWeek: number;
  weekPattern: WeekPattern[];
}

export interface WeekPattern {
  dayOfWeek: number;
  contentStyle: ContentStyle;
  format: SlotFormat;
}
```

### Nouveaux index Firestore
```json
{
  "collectionGroup": "calendarSlots",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "scheduledDate", "order": "ASCENDING" }
  ]
}
```

### Nouvelles security rules
```javascript
match /calendarSlots/{slotId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
}
```

## Decisions architecturales a prendre

1. **slotsByDay separe vs fusionne dans itemsByDay :**
   - Option A : `slotsByDay` separe (2 Maps) → plus clair, pas de union type
   - Option B : fusionner dans `dayData: Map<string, { items, slots }>` → 1 seule lookup
   - **Recommandation : Option A** — CalendarDay recoit `items` et `slots` en props separees, evite le polymorphisme.

2. **Generation de slots — quand :**
   - Option A : a la demande quand l'utilisateur navigue (lazy)
   - Option B : batch de 4 semaines a l'avance
   - **Recommandation : Option A** — generer quand on navigue vers un mois qui n'a pas de slots. Check avec une query rapide `calendarSlots.where(userId, weekStart)`.

3. **Hardcode Phase 1 vs configurable :**
   - Pour ce milestone : hardcoder Phase 1 (mardi + vendredi, 2 reels/sem).
   - La configuration sera un milestone futur (post-S08).

## Risques et bloqueurs potentiels

- **Doublons de slots :** Si `generateWeekSlots` est appele 2x rapidement (React StrictMode, double-render), on cree des doublons. **Mitigation :** Check `calendarSlots.where(userId, scheduledDate).get()` AVANT de creer. Utiliser un flag `generating` local.
- **CalendarView a 120 lignes :** Tres peu de marge. L'ajout du 3e BottomSheet + generation va le pousser a la limite. **Mitigation :** Extraire la logique de generation dans un hook dedie.
- **Slots passes auto-skipped :** Quand Judith ouvre l'app, les slots du passe non remplis doivent devenir `skipped`. Ou mettre cette logique ? **Recommandation :** Dans `useCalendarSlots`, lors de la lecture, marquer les slots passes comme `skipped` si `status === 'open' && scheduledDate < today`.

## Impact sur les autres milestones
- S04 cree des slots de sequence → depend directement de CalendarSlot
- S07 calcule la progression depuis les slots → depend de SlotStatus
- S08 enrichit le visuel des slots → depend du rendu CalendarDay
- Le cron publish (S04) doit query calendarSlots avec autoPublish
