# Milestone R-A — Fondations : Statut automatique + Catégories custom + Fix swipe

## Contexte
Mon Acupunctrice Hub est une PWA Next.js 15 pour Judith, acupunctrice solo.
L'app a 7 milestones complétés (auth, idées, calendrier, éditeur vidéo, publication IG).
Avant de déployer, on corrige les fondations UX : le statut des idées ne change jamais
automatiquement, les catégories sont hardcodées, et le bouton supprimer dépasse visuellement.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Auth/Firestore,
Zustand, Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `lib/types/index.ts` → types ContentItem, WorkflowState, ContentCategory
- `lib/hooks/useUpdateContentItem.ts` → hook de mise à jour Firestore
- `lib/hooks/useCreateContentItem.ts` → hook de création
- `components/features/ideas/ContentCard.tsx` → carte avec swipe-to-delete
- `components/features/ideas/CreateIdeaSheet.tsx` → formulaire de création
- `components/features/editor/ExportButton.tsx` → logique d'export (écrit videoUrl)
- `project-docs/02_ROADMAP/MILESTONE_R_REFINEMENTS.md` → specs complètes R02, R03, R05

## Livrable 1 — Statut automatique (R03)

Créer `lib/utils/deriveWorkflowState.ts` — fonction pure :

```typescript
import type { ContentItem, WorkflowState } from '@/lib/types';

export function deriveWorkflowState(item: Partial<ContentItem>): WorkflowState {
  // Règles évaluées de haut en bas, premier match gagne :
  
  // 1. Publié ou en cours → ready
  if (item.distributionStatus === 'published' || 
      item.distributionStatus === 'publishing' ||
      item.distributionStatus === 'failed') return 'ready';
  
  // 2. Planifié avec date → ready
  if (item.distributionStatus === 'scheduled') return 'ready';
  
  // 3. Vidéo exportée (exportedAt existe) → ready
  if (item.videoUrl && item.exportedAt) return 'ready';
  
  // 4. Vidéo importée + éditeur touché → editing
  if (item.videoUrl && item.editorTouchedAt) return 'editing';
  
  // 5. Vidéo importée mais pas touchée → shot
  if (item.videoUrl) return 'shot';
  
  // 6. Date planifiée sans vidéo → planned
  if (item.scheduledAt) return 'planned';
  
  // 7. Défaut → idea
  return 'idea';
}
```

Modifier `lib/hooks/useUpdateContentItem.ts` :
- Avant chaque `updateDoc()`, appeler `deriveWorkflowState()` avec les champs mis à jour
  fusionnés avec l'item existant
- Inclure `workflowState` dans le payload de `updateDoc()`

Ajouter à `lib/types/index.ts` les nouveaux champs sur ContentItem :
```typescript
editorTouchedAt?: Timestamp   // premier changement dans l'éditeur
exportedAt?: Timestamp        // fin d'export vidéo
captionDraft?: string         // texte original de Judith (R09, préparé ici)
```

Modifier `components/features/editor/ExportButton.tsx` :
- Après un export réussi, écrire `exportedAt: serverTimestamp()` en plus de `videoUrl`

Vérifier le store éditeur (Zustand) :
- Quand Judith modifie un filtre, texte, sous-titre, audio, ou trim pour la première fois
  après ouverture de l'éditeur → écrire `editorTouchedAt: serverTimestamp()` dans Firestore
  (si pas déjà set pour cette session d'édition)

## Livrable 2 — Catégories custom (R05)

Modifier `lib/types/index.ts` :
- `ContentItem.category` passe de `ContentCategory` (union type) à `string`
- Garder `ContentCategory` comme type pour les catégories par défaut
- Garder `CATEGORY_LABELS` pour les catégories par défaut
- Ajouter :
```typescript
export const DEFAULT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'fertilite', label: 'Fertilité' },
  { value: 'grossesse', label: 'Grossesse' },
  { value: 'bien_etre', label: 'Bien-être' },
  { value: 'mtc', label: 'MTC' },
  { value: 'autre', label: 'Autre' },
];
```

Créer `lib/hooks/useUserProfile.ts` :
- Lit le document `users/{userId}` en temps réel (onSnapshot)
- Expose `customCategories: string[]` et `updateCustomCategories(cats: string[])`
- Les catégories finales = DEFAULT_CATEGORIES + customCategories

Créer `lib/utils/categories.ts` :
```typescript
export function getAllCategories(customCategories: string[]): { value: string; label: string }[] {
  const defaults = [...DEFAULT_CATEGORIES];
  const custom = customCategories.map(c => ({ value: c, label: c }));
  return [...defaults, ...custom];
}

export function getCategoryLabel(value: string): string {
  const found = DEFAULT_CATEGORIES.find(c => c.value === value);
  return found ? found.label : value; // Custom categories = leur propre label
}
```

Modifier `components/features/ideas/CreateIdeaSheet.tsx` :
- Remplacer le `<select>` statique par un dropdown utilisant `getAllCategories()`
- Ajouter une option "Autre..." à la fin
- Si "Autre..." sélectionné → afficher un champ texte pour taper la nouvelle catégorie
- À la soumission : si nouvelle catégorie, l'ajouter à `customCategories` via `useUserProfile`

## Livrable 3 — Fix swipe-to-delete (R02)

Modifier `components/features/ideas/ContentCard.tsx` :
- Le conteneur rouge (fond + TrashIcon) doit être invisible au repos
- Approche : ajouter `overflow-hidden` sur le wrapper parent ET `opacity` dynamique
  sur le div rouge basé sur `Math.abs(offsetX) > 0`
- Le fond rouge apparaît progressivement pendant le swipe :
  `opacity: Math.min(1, Math.abs(offsetX) / 80)`

## Contraintes
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Ne PAS modifier les composants calendrier, éditeur, ou publication
- Ne PAS ajouter de nouvelles pages ou routes
- Garder la rétrocompatibilité Firestore (les items existants sans editorTouchedAt doivent fonctionner)

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Créer une nouvelle idée → workflowState = 'idea' automatiquement
- [ ] Importer une vidéo dans l'éditeur → workflowState passe à 'shot'
- [ ] Modifier un filtre/texte dans l'éditeur → workflowState passe à 'editing'
- [ ] Exporter la vidéo → workflowState passe à 'ready'
- [ ] Catégorie "Autre..." ouvre un champ texte, la nouvelle catégorie est sauvegardée
- [ ] Le bouton supprimer rouge n'est plus visible au repos
- [ ] Les items existants sans les nouveaux champs ne crashent pas
