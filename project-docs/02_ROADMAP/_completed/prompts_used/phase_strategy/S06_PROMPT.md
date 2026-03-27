# Milestone S06 — Banque de templates (hooks & captions)

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00-S05 et S02/S04 sont completes. Les ContentStyle existent et sont utilises
partout. On ajoute une **bibliotheque de reference** de hooks et structures de
captions que Judith peut consulter quand elle cherche l'inspiration.
C'est du contenu statique — pas de Firestore, pas de backend.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Heroicons.

## Fichiers a lire AVANT de commencer
- `app/(app)/layout.tsx` → 82 lignes, BottomTabBar avec 4 onglets (Idees, Calendrier, Stats, Profil)
- `app/(app)/idees/page.tsx` → pattern page avec filtres + liste
- `components/features/ideas/IdeaFilters.tsx` → 62 lignes, pattern filtres par onglets
- `lib/utils/contentStyles.ts` → CONTENT_STYLES, getStyleColor (post-S01)
- `components/features/calendar/FillSlotSheet.tsx` → BottomSheet slots (post-S02)

---

## Livrable 1 — Donnees statiques

### Creer `lib/data/templates.ts`

Contient les hooks et structures de captions, tagues par ContentStyle.

```typescript
import type { ContentStyle } from '@/lib/types';

export interface HookTemplate {
  id: string;
  style: ContentStyle;
  text: string;
  category: 'hook' | 'caption_structure';
}

export const TEMPLATES: HookTemplate[] = [
  // ENSEIGNER — Hooks
  { id: 'e1', style: 'enseigner', text: 'Savais-tu que [fait surprenant]?', category: 'hook' },
  { id: 'e2', style: 'enseigner', text: '3 choses que tu ne sais pas sur [sujet]', category: 'hook' },
  { id: 'e3', style: 'enseigner', text: 'Arrete de [habitude] si tu veux [resultat]', category: 'hook' },
  { id: 'e4', style: 'enseigner', text: 'La verite sur [mythe courant]', category: 'hook' },
  { id: 'e5', style: 'enseigner', text: 'Ce que la science dit sur [sujet]', category: 'hook' },

  // CONNECTER — Hooks
  { id: 'c1', style: 'connecter', text: 'POV : une journee d\'acupunctrice', category: 'hook' },
  { id: 'c2', style: 'connecter', text: 'Ce que tu ne vois jamais dans une clinique', category: 'hook' },
  { id: 'c3', style: 'connecter', text: 'Ce que [X] annees de pratique m\'ont appris', category: 'hook' },
  { id: 'c4', style: 'connecter', text: 'Ma routine du [jour] a la clinique', category: 'hook' },
  { id: 'c5', style: 'connecter', text: 'La question qu\'on me pose le plus souvent', category: 'hook' },

  // AIDER — Hooks
  { id: 'a1', style: 'aider', text: 'Essaie ce point d\'acupression ce soir', category: 'hook' },
  { id: 'a2', style: 'aider', text: 'Si tu as [symptome], regarde ceci', category: 'hook' },
  { id: 'a3', style: 'aider', text: 'Le point que tout le monde devrait connaitre', category: 'hook' },
  { id: 'a4', style: 'aider', text: 'Testez ca pendant 7 jours', category: 'hook' },
  { id: 'a5', style: 'aider', text: '1 minute pour soulager [symptome]', category: 'hook' },

  // INSPIRER — Hooks
  { id: 'i1', style: 'inspirer', text: 'Une patiente m\'a dit [citation]', category: 'hook' },
  { id: 'i2', style: 'inspirer', text: '[Nombre] seances plus tard, elle [resultat]', category: 'hook' },
  { id: 'i3', style: 'inspirer', text: 'Ce qui me touche le plus dans mon metier', category: 'hook' },
  { id: 'i4', style: 'inspirer', text: 'Pourquoi je fais de l\'acupuncture solidaire', category: 'hook' },
  { id: 'i5', style: 'inspirer', text: 'Le moment ou j\'ai su que c\'etait ma vocation', category: 'hook' },

  // STRUCTURES DE CAPTIONS
  { id: 'cs1', style: 'enseigner', text: 'Stat surprenante → 3 points cles → CTA "Enregistre"', category: 'caption_structure' },
  { id: 'cs2', style: 'inspirer', text: 'Citation patiente → Contexte → Resultat → CTA RDV', category: 'caption_structure' },
  { id: 'cs3', style: 'aider', text: 'Question frequente → Reponse courte → Detail → CTA "Essaie"', category: 'caption_structure' },
  { id: 'cs4', style: 'connecter', text: 'Moment vecu → Ce qu\'on ne sait pas → Question ouverte', category: 'caption_structure' },
];
```

---

## Livrable 2 — Page Inspiration

### Creer `app/(app)/inspiration/page.tsx`

Page avec header + filtres par style + liste de templates.

- Header : "Inspiration" avec icone SparklesIcon
- 5 onglets de filtre : Tous, Enseigner, Connecter, Aider, Inspirer (colores)
- 2 sections : "Hooks" et "Structures de captions"
- Chaque template a un bouton "Copier" (navigator.clipboard.writeText)

Estimation : ~55 lignes.

### Creer `components/features/inspiration/TemplateList.tsx`

Liste filtrable de templates. Recoit `templates`, `selectedStyle`, `onCopy`.

Estimation : ~50 lignes.

### Creer `components/features/inspiration/TemplateCard.tsx`

Carte individuelle : pastille de style + texte + bouton copier (DocumentDuplicateIcon).

Estimation : ~35 lignes.

---

## Livrable 3 — Navigation

### Modifier `app/(app)/layout.tsx` (82 → ~85 lignes)

Remplacer l'onglet "Stats" par "Inspiration" dans le TABS array :

```typescript
// Remplacer :
{ href: '/stats', label: 'Stats', outline: ChartBarSquareIcon, solid: ChartBarSquareIconSolid },
// Par :
{ href: '/inspiration', label: 'Inspiration', outline: SparklesIcon, solid: SparklesIconSolid },
```

Importer SparklesIcon de `@heroicons/react/24/outline` et `@heroicons/react/24/solid`.

Note : la page /stats reste accessible via le lien dans /profil ("Voir toutes les stats").

---

## Livrable 4 — Lien contextuel depuis FillSlotSheet

### Modifier `components/features/calendar/FillSlotSheet.tsx` (~90 → ~100 lignes)

Ajouter un lien sous les boutons : "Voir des idees de hooks →"
qui navigue vers `/inspiration?style={slot.contentStyle}`.
Utiliser `router.push()` ou un `<Link>`.

### Modifier `app/(app)/inspiration/page.tsx`

Lire le query param `?style=X` avec `useSearchParams()` et pre-filtrer
la liste par ce style au chargement.

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Ne PAS creer de collection Firestore (donnees statiques uniquement)
- Ne PAS modifier les Cloud Functions existantes
- La page /stats reste accessible via /profil

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] `lib/data/templates.ts` contient 20+ hooks et 4 structures de captions
- [ ] La page /inspiration affiche les templates par style
- [ ] Les templates sont filtrables par les 4 styles + "Tous"
- [ ] Le bouton "Copier" copie le texte dans le presse-papier
- [ ] L'onglet "Inspiration" remplace "Stats" dans la navigation
- [ ] /stats reste accessible via le lien dans /profil
- [ ] FillSlotSheet a un lien "Voir des idees de hooks" vers /inspiration
- [ ] Le query param ?style=X pre-filtre la page Inspiration
