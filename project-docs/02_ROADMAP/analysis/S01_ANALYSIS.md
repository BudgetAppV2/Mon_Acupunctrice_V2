# Analyse S01 — Categorisation par style

## Complexite reelle : Petit

## Fichiers a modifier — Analyse detaillee

### lib/types/index.ts (actuellement 152 lignes)
- **Ce qui existe :** Types ContentItem, WorkflowState, DistributionStatus, enums editeur. Le fichier est DEJA a 152 lignes — au-dessus de 150.
- **Ce qui change :** Ajouter `ContentStyle` type + champ `contentStyle?` sur ContentItem + helper `STYLE_LABELS` + `STYLE_COLORS`.
- **Risque de depasser 150 lignes :** Deja depasse. Il faut ~10 lignes de plus.
- **Plan de decoupage :** Extraire les types editeur (TextOverlayItem, SubtitleSegment, etc.) dans `lib/types/editor.ts`. L'index re-exporte tout. Ca libere ~40 lignes.

### components/features/ideas/IdeaDetailSheet.tsx (actuellement 41 lignes)
- **Ce qui existe :** Assembler simple : IdeaInfoSection + preview + IdeaCaptionSection + IdeaActions dans un BottomSheet.
- **Ce qui change :** Rien directement. Le selecteur de style va dans IdeaInfoSection.
- **Risque de depasser 150 lignes :** Non (41 lignes).

### components/features/ideas/IdeaInfoSection.tsx (actuellement 97 lignes)
- **Ce qui existe :** Titre editable, selecteur categorie (dropdown), notes textarea. Auto-save on blur.
- **Ce qui change :** Ajouter 4 boutons de style colores sous la categorie. ~20 lignes de JSX + handler updateItem.
- **Risque de depasser 150 lignes :** Non (97 + 20 = ~117).
- **Pattern existant a reutiliser :** Meme pattern que le dropdown categorie — un groupe de boutons radio avec `onClick={() => updateItem(...)`.

### components/features/ideas/CreateIdeaSheet.tsx (actuellement 139 lignes)
- **Ce qui existe :** Formulaire : titre + VoiceRecordButton, dropdown categorie (avec custom), notes, bouton submit.
- **Ce qui change :** Ajouter les 4 boutons de style. ~15 lignes.
- **Risque de depasser 150 lignes :** OUI (139 + 15 = ~154).
- **Plan de decoupage :** Extraire le selecteur de style dans `components/features/ideas/StyleSelector.tsx` (composant reutilisable ~25 lignes). Les deux sheets l'importent. Net: CreateIdeaSheet ajoute ~5 lignes (import + placement).

### components/features/calendar/CalendarDay.tsx (actuellement 72 lignes)
- **Ce qui existe :** Rendu d'une cellule : dot colore par workflowState OU badge compteur OU miniature.
- **Ce qui change :** Si contentItem a un `contentStyle`, le dot prend la couleur du style au lieu du workflowState. ~8 lignes de logique conditionnelle.
- **Risque de depasser 150 lignes :** Non (72 + 8 = ~80).

### components/features/ideas/ContentCard.tsx (actuellement 82 lignes)
- **Ce qui existe :** Carte swipeable avec titre, badge categorie, badge status.
- **Ce qui change :** Ajouter un petit indicateur de style (pastille coloree) a cote du badge categorie. ~5 lignes.
- **Risque de depasser 150 lignes :** Non (82 + 5 = ~87).

## Fichiers a creer

### components/features/ideas/ContentStyleSelector.tsx
- **Role :** 4 boutons colores (Enseigner/Connecter/Aider/Inspirer) reutilisable dans CreateIdeaSheet et IdeaInfoSection.
- **Pattern a suivre :** Similaire a AnimationSelector dans l'editeur (boutons radio inline).
- **Estimation lignes :** ~30 lignes.

### lib/utils/contentStyles.ts
- **Role :** `getStyleLabel()`, `getStyleColor()`, constantes `CONTENT_STYLES`.
- **Pattern a suivre :** Meme pattern que `lib/utils/categories.ts`.
- **Estimation lignes :** ~25 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript (a ajouter dans lib/types/index.ts)
```typescript
export type ContentStyle = 'enseigner' | 'connecter' | 'aider' | 'inspirer';

// Ajouter sur ContentItem :
contentStyle?: ContentStyle;
```

### Nouveaux index Firestore
- Aucun requis. Le filtrage par style se fait cote client.

### Nouvelles security rules
- Aucune. Les rules existantes couvrent deja contentItems.

## Decisions architecturales a prendre
- **Decoupage types/index.ts :** Extraire les types editeur maintenant (152 lignes deja au-dessus de 150) ou attendre? **Recommandation : faire maintenant** car S02/S03/S04 vont tous ajouter des types.
- **Style dans ContentCard :** Afficher ou non dans la banque d'idees? **Recommandation : oui**, petite pastille coloree a cote de la categorie — aide Judith a voir l'equilibre.

## Risques et bloqueurs potentiels
- **Retrocompatibilite :** Les items existants n'ont pas de `contentStyle`. Toute la UI doit gerer `undefined` gracieusement (ne pas afficher de pastille). Risque faible.
- **CreateIdeaSheet a 139 lignes :** Doit etre decoupe AVANT d'ajouter le style pour eviter de depasser. Bloqueur mineur.

## Impact sur les autres milestones
- S02 utilise ContentStyle pour typer les slots → doit etre fait avant S02
- S06 filtre les templates par style → doit etre fait avant S06
- S08 utilise les couleurs de style dans le calendrier → doit etre fait avant S08
- S05 utilise le style pour les CTA rotatifs → doit etre fait avant S05
