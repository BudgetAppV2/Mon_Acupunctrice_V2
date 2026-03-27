# Milestone S08 — Calendrier visuel enrichi

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00-S07 sont completes. Les styles (S01), slots (S02), sequences (S04),
et progression (S07) fonctionnent. Dernier milestone de la Phase Strategie :
enrichir le calendrier avec des **indicateurs visuels** qui permettent a Judith
de voir l'equilibre de son contenu d'un coup d'oeil.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Heroicons.

## Fichiers a lire AVANT de commencer
- `components/features/calendar/CalendarDay.tsx` → ~122 lignes post-S04, rendu cellule
- `components/features/calendar/CalendarView.tsx` → ~148 lignes post-S04, orchestrateur
- `components/features/calendar/CalendarHeader.tsx` → ~50 lignes post-S04, header
- `components/features/calendar/DashboardBar.tsx` → ~100 lignes post-S07, progression
- `lib/utils/contentStyles.ts` → CONTENT_STYLES, getStyleColor
- `lib/types/index.ts` → CalendarSlot, SlotStatus, ContentStyle, BlogSequence

---

## Livrable 1 — Refactoring CalendarView

CalendarView est a ~148 lignes post-S04 — il FAUT le refactoriser avant d'ajouter
du code. Extraire la gestion des bottom sheets dans un hook.

### Creer `lib/hooks/useCalendarSheets.ts`

Extraire toute la logique des 3+ bottom sheets :
```typescript
export function useCalendarSheets() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showSequence, setShowSequence] = useState(false);

  return {
    selectedItem, selectedSlot, selectedDate,
    showSchedule, showSequence,
    onTapItem: (item) => setSelectedItem(item),
    onTapSlot: (slot) => setSelectedSlot(slot),
    onTapEmptyDay: (date) => { setSelectedDate(date); setShowSchedule(true); },
    closeAll: () => { setSelectedItem(null); setSelectedSlot(null); setShowSchedule(false); setShowSequence(false); },
    openSequenceSheet: () => setShowSequence(true),
  };
}
```

CalendarView post-refactoring : ~110 lignes (grille + imports + hooks).

---

## Livrable 2 — Multi-dots et etats de slots

### Creer `components/features/calendar/DayIndicators.tsx`

Composant qui gere le rendu de tous les indicateurs visuels dans une cellule.

```typescript
interface Props {
  items: ContentItem[];
  slots: CalendarSlot[];
}
```

**Rendu :**
- Si items ou slots : afficher des pastilles colorees (max 3) par style
- Si > 3 : pastilles + badge "+N"
- Pastille : 6x6px, rounded-full, couleur du style
- Si slot.status === 'open' : outline pointille (ring-1)
- Si slot.status === 'filled' : pastille pleine
- Si slot.status === 'completed' : pastille + mini checkmark
- Si slot.status === 'skipped' : grise, opacity-50
- Si slot.autoPublish : pastille avec SparklesIcon (4x4) au lieu de ronde
- Si slot.sequenceRole : petit badge "S" (pour sequence)

Estimation : ~45 lignes.

### Modifier `components/features/calendar/CalendarDay.tsx` (~122 → ~100 lignes)

Remplacer la logique de rendu actuelle (dot/badge/thumbnail) par `<DayIndicators />`.
Le composant devient plus simple car il delegue le rendu visuel.

---

## Livrable 3 — Resume mensuel

### Creer `components/features/calendar/MonthSummary.tsx`

4 pastilles avec compteurs montrant la repartition par style pour le mois.

```typescript
interface Props {
  items: ContentItem[];
  slots: CalendarSlot[];
}
```

**Rendu :**
- 4 pastilles en ligne (flex gap-3) : Enseigner (bleu), Connecter (vert), Aider (jaune), Inspirer (violet)
- Chaque pastille : cercle colore 20x20 + compteur
- Si un style represente > 60% : message discret "Essaie un [style le moins represente]?"
- Si pas de donnees : ne pas afficher

Estimation : ~45 lignes.

### Modifier `components/features/calendar/CalendarHeader.tsx` (~50 → ~60 lignes)

Ajouter `<MonthSummary />` sous le header mois/annee.
Passer les items et slots du mois courant comme props.

### Modifier `components/features/calendar/CalendarView.tsx` (~110 post-refactoring → ~120 lignes)

Calculer les totaux par style (useMemo) et les passer a CalendarHeader.

---

## Livrable 4 — Indicateur de sequence

### Modifier `components/features/calendar/DayIndicators.tsx`

Si un slot a `sequenceRole`, afficher un petit badge BookOpenIcon (4x4)
a cote de la pastille. Tous les slots de la meme sequence ont le meme badge.

Pas de lignes SVG entre les cellules — juste un badge commun.

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes (le refactoring de CalendarView est OBLIGATOIRE)
- TypeScript strict
- Mobile first 375px — les cellules font ~48x48px, max 3 pastilles + 1 badge
- App Router ONLY
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS ajouter de features non mentionnees
- Utiliser React.memo sur DayIndicators et CalendarDay (performance 42 cellules)

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] CalendarView est refactorise (sheets dans useCalendarSheets hook)
- [ ] CalendarView est sous 130 lignes
- [ ] DayIndicators affiche des pastilles colorees par style
- [ ] Max 3 pastilles + badge "+N" si > 3
- [ ] Les 5 etats de slot sont visuellement distincts (open/filled/completed/skipped/auto)
- [ ] MonthSummary affiche la repartition par style pour le mois
- [ ] Message doux si desequilibre > 60% d'un seul style
- [ ] Les slots de sequence ont un badge BookOpenIcon
- [ ] Le calendrier reste lisible sur mobile 375px
- [ ] CalendarDay et DayIndicators utilisent React.memo
