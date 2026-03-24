# Milestone S02 — Calendrier-cadre

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00 (refactoring), S01 (styles), S03 (stories) sont completes.
Le type `ContentStyle` existe. On ajoute le concept de **slots** dans le calendrier :
des emplacements vides pre-positionnes aux bons jours, types par style,
que Judith remplit avec ses idees.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/types/index.ts` → Types ContentItem + ContentStyle (post-S01)
- `lib/hooks/useCalendar.ts` → 97 lignes, hook central calendrier. Retourne `itemsByDay: Map<string, ContentItem[]>`
- `components/features/calendar/CalendarView.tsx` → 120 lignes, grille 6x7 + bottom sheets
- `components/features/calendar/CalendarDay.tsx` → ~80 lignes post-S01, cellule calendrier
- `components/features/calendar/DashboardBar.tsx` → 37 lignes, barre resume
- `components/features/calendar/ScheduleSheet.tsx` → 79 lignes, pattern BottomSheet avec liste d'items
- `lib/utils/contentStyles.ts` → CONTENT_STYLES, getStyleColor (post-S01)
- `firestore.rules` → Rules actuelles (19 lignes)
- `firestore.indexes.json` → Index existants

---

## Livrable 1 — Data model et infrastructure

### Modifier `lib/types/index.ts`

Ajouter les types suivants :
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

export interface WeekPattern {
  dayOfWeek: number;
  contentStyle: ContentStyle;
  format: SlotFormat;
}
```

Ajouter sur ContentItem :
```typescript
slotId?: string;  // Reference au CalendarSlot lie (si assigne via un slot)
```

### Modifier `firestore.rules`

Ajouter apres le block `users/{userId}/private/{doc}` :
```javascript
match /calendarSlots/{slotId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
}
```

### Modifier `firestore.indexes.json`

Ajouter un index composite :
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

---

## Livrable 2 — Generateur de slots

### Creer `lib/utils/calendarSlots.ts`

Fonction `generateWeekSlots(userId, weekStartDate, phase)` :

1. **Verifier si les slots existent deja** pour cette semaine (query Firestore `calendarSlots.where(userId).where(scheduledDate >= weekStart).where(scheduledDate < weekEnd)`)
2. Si oui → ne rien faire (anti-doublons)
3. Si non → creer les slots selon la phase :

**Phase 1 (hardcodee pour l'instant) :**
```typescript
const PHASE_1_PATTERN: WeekPattern[] = [
  { dayOfWeek: 2, contentStyle: 'enseigner', format: 'reel' },  // Mardi
  { dayOfWeek: 5, contentStyle: 'connecter', format: 'reel' },  // Vendredi
];
```

4. Ecrire les slots via batch Firestore (`writeBatch`)
5. Retourner les slots crees

Les styles alternent semaine par semaine (semaine 1: enseigner+connecter, semaine 2: aider+inspirer, etc.). Utiliser le `weekNumber` pour varier.

Estimation : ~60 lignes.

---

## Livrable 3 — Hook useCalendarSlots

### Creer `lib/hooks/useCalendarSlots.ts`

Hook separe de useCalendar. Meme pattern (onSnapshot, range de dates).

```typescript
export function useCalendarSlots(month: number, year: number) {
  // Query calendarSlots par userId + scheduledDate dans le mois
  // Retourne slotsByDay: Map<string, CalendarSlot[]>
  // Meme format de cle que useCalendar : "YYYY-M-D"
  // Auto-skip les slots passes (status 'open' + scheduledDate < today → update to 'skipped')
}
```

Estimation : ~70 lignes.

---

## Livrable 4 — UI Calendrier

### Modifier `components/features/calendar/CalendarView.tsx` (120 → ~140 lignes)

1. Importer `useCalendarSlots` et appeler avec le meme mois/annee que `useCalendar`
2. Passer `slots` a chaque CalendarDay
3. Appeler `generateWeekSlots` quand on navigue vers un mois futur
   (dans un useEffect qui detecte le changement de mois)
4. Ajouter FillSlotSheet comme 3e bottom sheet (state: `selectedSlot`)

### Modifier `components/features/calendar/CalendarDay.tsx` (~80 → ~112 lignes)

Recevoir `slots: CalendarSlot[]` en plus de `items`.
Afficher les slots fantomes :
- Si slot.status === 'open' : div avec `border-2 border-dashed` + couleur du style + icone PlusIcon
- Si slot.status === 'filled' : afficher comme un item normal (le contentItem lie apparait dans items)
- Si slot.status === 'completed' : petit checkmark vert
- Si slot.status === 'skipped' : grise, discret
- Tap sur un slot open → callback `onTapSlot(slot)` (ouvre FillSlotSheet)

### Modifier `components/features/calendar/DashboardBar.tsx` (37 → ~80 lignes)

Remplacer le contenu par un resume de semaine :
- "Semaine [N]" + date range
- Cercles de statut pour chaque slot de la semaine (ouvert=outline, rempli=couleur, complete=check)
- Compteur "X/Y"

---

## Livrable 5 — FillSlotSheet

### Creer `components/features/calendar/FillSlotSheet.tsx`

BottomSheet qui s'ouvre au tap sur un slot vide. Pattern : ScheduleSheet.

**Contenu :**
- Titre : "Remplir cet emplacement"
- Badge du style (ex: "Enseigner" en bleu) + format ("Reel")
- Bouton "Choisir une idee" → filtre la banque d'idees par style → assigne
- Bouton "Creer une idee" → ouvre CreateIdeaSheet avec le style pre-selectionne
- Bouton "Passer" → met le slot en `status: 'skipped'`

**Quand une idee est choisie :**
1. Mettre a jour le slot : `status: 'filled'`, `contentItemId: item.id`
2. Mettre a jour le contentItem : `scheduledAt: slot.scheduledDate`, `slotId: slot.id`
3. Fermer le sheet

Estimation : ~90 lignes.

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes (verifier le comptage)
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Sauvegarder via les hooks existants (useUpdateContentItem, etc.)
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS ajouter de features non mentionnees dans ce prompt
- Phase 1 HARDCODEE : 2 slots/semaine (mardi + vendredi). Pas de config UI.

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Types CalendarSlot, SlotFormat, SlotStatus existent dans types/index.ts
- [ ] Security rules pour calendarSlots ajoutees dans firestore.rules
- [ ] Index Firestore pour calendarSlots ajoute dans firestore.indexes.json
- [ ] `generateWeekSlots()` cree 2 slots/semaine (mardi+vendredi) sans doublons
- [ ] Le calendrier affiche des slots fantomes (outline pointille + couleur)
- [ ] Taper un slot vide ouvre le FillSlotSheet
- [ ] "Choisir une idee" dans FillSlotSheet filtre par style et assigne
- [ ] Un slot rempli affiche le titre du contentItem lie
- [ ] Le resume de semaine montre la progression (X/Y)
- [ ] Les slots passes non remplis sont auto-marques "skipped"
- [ ] Le champ slotId sur ContentItem est set quand assigne via un slot
