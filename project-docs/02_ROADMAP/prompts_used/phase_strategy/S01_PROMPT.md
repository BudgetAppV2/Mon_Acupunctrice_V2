# Milestone S01 — Categorisation par style

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00 (refactoring) est complete. Le fichier types/index.ts a de l'espace libre.
On ajoute le concept de **style de contenu** (Enseigner/Connecter/Aider/Inspirer)
aux idees de Judith. C'est la brique de base pour toute la Phase Strategie.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/types/index.ts` → Types ContentItem (post-S00, ~110 lignes)
- `components/features/ideas/IdeaInfoSection.tsx` → 97 lignes, section editable d'une idee
- `components/features/ideas/CreateIdeaSheet.tsx` → 139 lignes, formulaire creation
- `components/features/ideas/ContentCard.tsx` → 82 lignes, carte dans la banque d'idees
- `components/features/calendar/CalendarDay.tsx` → 72 lignes, cellule calendrier
- `lib/utils/categories.ts` → pattern pour getCategoryLabel (14 lignes)

---

## Livrable 1 — Types et utilitaires

### Modifier `lib/types/index.ts`

Ajouter le type `ContentStyle` et le champ sur ContentItem :
```typescript
export type ContentStyle = 'enseigner' | 'connecter' | 'aider' | 'inspirer';

// Ajouter dans l'interface ContentItem :
contentStyle?: ContentStyle;
```

### Creer `lib/utils/contentStyles.ts`

```typescript
import type { ContentStyle } from '@/lib/types';

export const CONTENT_STYLES: { value: ContentStyle; label: string; color: string }[] = [
  { value: 'enseigner', label: 'Enseigner', color: '#3B82F6' },  // blue-500
  { value: 'connecter', label: 'Connecter', color: '#22C55E' },  // green-500
  { value: 'aider', label: 'Aider', color: '#EAB308' },          // yellow-500
  { value: 'inspirer', label: 'Inspirer', color: '#A855F7' },     // purple-500
];

export function getStyleLabel(style?: ContentStyle): string {
  return CONTENT_STYLES.find(s => s.value === style)?.label ?? '';
}

export function getStyleColor(style?: ContentStyle): string {
  return CONTENT_STYLES.find(s => s.value === style)?.color ?? '#9CA3AF';
}
```

---

## Livrable 2 — Composant ContentStyleSelector

### Creer `components/features/ideas/ContentStyleSelector.tsx`

4 boutons colorés inline. Reutilisable dans CreateIdeaSheet et IdeaInfoSection.

```typescript
interface Props {
  value?: ContentStyle;
  onChange: (style: ContentStyle) => void;
}
```

- Afficher 4 boutons en ligne (flex gap-2)
- Chaque bouton : fond colore si selectionne, outline sinon
- Label court : "Enseigner", "Connecter", "Aider", "Inspirer"
- Selection optionnelle — Judith peut laisser vide
- ~30 lignes

---

## Livrable 3 — Integrer dans les idees

### Modifier `components/features/ideas/IdeaInfoSection.tsx` (97 lignes → ~117)

Ajouter le ContentStyleSelector SOUS le selecteur de categorie.
Auto-save quand le style change (meme pattern que le titre et la categorie — `updateItem(item.id, { contentStyle: style })`).

### Modifier `components/features/ideas/CreateIdeaSheet.tsx` (139 lignes → ~145)

Ajouter le ContentStyleSelector entre la categorie et les notes.
Stocker dans un state local `const [style, setStyle] = useState<ContentStyle | undefined>()`.
Passer `contentStyle: style` dans l'appel `createItem()`.

### Modifier `components/features/ideas/ContentCard.tsx` (82 lignes → ~87)

Si `item.contentStyle` existe, afficher une petite pastille coloree (6x6px)
a cote du badge de categorie. Utiliser `getStyleColor(item.contentStyle)`.

---

## Livrable 4 — Indicateur dans le calendrier

### Modifier `components/features/calendar/CalendarDay.tsx` (72 lignes → ~80)

Si un contentItem a un `contentStyle`, utiliser la couleur du style
pour le dot indicateur au lieu de la couleur du workflowState.
Logique : `const dotColor = item.contentStyle ? getStyleColor(item.contentStyle) : workflowStateColor`.

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
- Le style est OPTIONNEL — on peut sauvegarder un item sans style

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Le type `ContentStyle` existe dans `lib/types/index.ts`
- [ ] Le champ `contentStyle` est optionnel sur ContentItem
- [ ] `contentStyles.ts` exporte `CONTENT_STYLES`, `getStyleLabel`, `getStyleColor`
- [ ] `ContentStyleSelector` affiche 4 boutons colores
- [ ] IdeaInfoSection affiche le selecteur de style et sauvegarde au clic
- [ ] CreateIdeaSheet inclut le selecteur de style dans le formulaire
- [ ] ContentCard affiche une pastille coloree si le style est defini
- [ ] CalendarDay utilise la couleur du style pour le dot (si defini)
- [ ] Le style est optionnel — sauvegarder sans style fonctionne
