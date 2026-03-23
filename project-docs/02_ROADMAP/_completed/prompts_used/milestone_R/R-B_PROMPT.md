# Milestone R-B — UI principale : Filtres + IdeaDetailSheet + Captions assistées

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 pour Judith, acupunctrice solo.
Le milestone R-A est complété : le statut des idées est maintenant automatique
(deriveWorkflowState), les catégories sont dynamiques (useUserProfile + customCategories),
et le swipe-to-delete est fixé. On attaque maintenant l'UI principale :
filtres simplifiés, carte d'idée cliquable avec un detail sheet complet,
et le système de captions assistées.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Auth/Firestore,
Zustand, Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `lib/utils/deriveWorkflowState.ts` → state machine (R-A)
- `lib/utils/categories.ts` → catégories dynamiques (R-A)
- `lib/hooks/useUserProfile.ts` → custom categories (R-A)
- `lib/hooks/useUpdateContentItem.ts` → hook mise à jour
- `lib/types/index.ts` → types mis à jour (R-A)
- `components/features/ideas/ContentCard.tsx` → carte actuelle
- `components/features/ideas/IdeaFilters.tsx` → filtres actuels (pills scrollables)
- `components/features/ideas/IdeaList.tsx` → liste actuelle
- `components/features/publish/CaptionEditor.tsx` → éditeur de caption actuel
- `components/ui/BottomSheet.tsx` → composant bottom sheet réutilisable
- `app/(app)/idees/page.tsx` → page idées actuelle
- `project-docs/02_ROADMAP/MILESTONE_R_REFINEMENTS.md` → specs R01, R04, R09

## Livrable 1 — Filtres bottom sheet (R04)

Créer `components/features/ideas/FilterSheet.tsx` :
- Bottom sheet réutilisable pour les filtres
- Props : `title: string`, `options: {value: string, label: string}[]`, `selected: string | undefined`, `onSelect: (value?: string) => void`
- Liste de radio buttons, option "Tous/Toutes" en premier
- Quand on sélectionne → auto-ferme le sheet
- Style : label en texte normal, option sélectionnée avec check icon (Heroicon check)

Réécrire `components/features/ideas/IdeaFilters.tsx` :
- Remplacer les 2 rangées de pills par 2 boutons côte à côte
- Chaque bouton affiche le filtre actif ou "Tous statuts" / "Toute catégorie"
- Tap → ouvre FilterSheet avec les options appropriées
- Bouton statut : options = les WorkflowState + affichage intelligent
  (combiner workflowState + distributionStatus pour les labels affichés)
- Bouton catégorie : options = getAllCategories(customCategories) via useUserProfile
- Style quand filtre actif : fond sage/10, texte sage, petit dot ● à côté du label

## Livrable 2 — IdeaDetailSheet (R01)

Créer `components/features/ideas/IdeaDetailSheet.tsx` :
- Bottom sheet ouvert quand on clique sur une ContentCard
- Props : `isOpen: boolean`, `onClose: () => void`, `item: ContentItem | null`

**Section info (toujours visible) :**
- Titre — éditable (input text, sauvegarde on blur ou on enter)
- Catégorie — dropdown dynamique (mêmes catégories que CreateIdeaSheet, incluant "Autre...")
- Notes — textarea éditable (sauvegarde on blur)
- Badge statut — lecture seule, calculé automatiquement (deriveWorkflowState + distributionStatus)
- Date de création — texte discret

**Section vidéo (conditionnelle : si item.videoUrl existe) :**
- Thumbnail si item.thumbnailUrl existe
- Sinon : placeholder avec icône VideoCameraIcon

**Section caption (R09 intégré ici) :**
- Textarea pour écrire la caption (bind sur captionDraft)
- Bouton "Optimiser" (Heroicon: SparklesIcon) :
  - Si captionDraft non vide → appelle `/api/generate-caption` avec :
    `{ title: item.title, category: item.category, notes: item.notes, captionDraft: item.captionDraft, platform: 'instagram' }`
  - Le résultat remplace `caption` (le texte enrichi)
  - captionDraft est préservé
  - Si captionDraft vide → génère une caption complète (fallback comportement actuel)
- Bouton "Repartir de mon texte" (visible seulement si caption !== captionDraft)
  → remet caption = captionDraft
- Indicateur de loading pendant l'appel API

**Actions contextuelles (boutons en bas, varient selon le statut) :**
Utiliser deriveWorkflowState + distributionStatus pour déterminer les boutons.

Bouton principal (pleine largeur, bg-sage) :
- idea → "Créer le contenu" (navigate vers /editeur/{id})
- shot → "Monter la vidéo" (navigate vers /editeur/{id})
- editing → "Continuer le montage" (navigate vers /editeur/{id})
- ready + draft → "Planifier la publication" (ouvrir un date picker)
- ready + scheduled → "Voir le calendrier" (navigate vers /calendrier)
- ready + published → "Voir les stats" (navigate vers /stats)

Boutons secondaires (outlined, plus petits) :
- "Modifier dans l'éditeur" (si vidéo existe et pas publié)
- "Supprimer" (danger, en rouge, avec confirmation)
- "Déprogrammer" (si scheduled)
- "Voir sur Instagram" (si published + instagramPostId)

Modifier `components/features/ideas/ContentCard.tsx` :
- Ajouter `onClick: () => void` aux props
- Le tap sur la carte appelle onClick (pas juste le swipe)
- Le tap ne doit PAS trigger quand on est en train de swiper (offset !== 0)

Modifier `components/features/ideas/IdeaList.tsx` :
- Passer `onSelect: (item: ContentItem) => void` aux props
- Passer onSelect à chaque ContentCard

Modifier `app/(app)/idees/page.tsx` :
- Ajouter le state pour IdeaDetailSheet (selectedItem, isDetailOpen)
- Brancher le tout

## Livrable 3 — Captions assistées backend (R09)

Modifier `/app/api/generate-caption/route.ts` :
- Accepter le nouveau champ `captionDraft?: string` dans le body
- Si captionDraft fourni → utiliser le prompt d'enrichissement
- Si captionDraft absent → utiliser le prompt de génération actuel (fallback)

Le prompt d'enrichissement :
```
Tu es l'assistante de Judith Tremblay, acupunctrice à Montréal.
Judith a écrit ce texte pour accompagner son Reel :

"{captionDraft}"

Catégorie : {category}
Plateforme : {platform}

ENRICHIS ce texte en respectant ces règles :
1. GARDE le message et le ton de Judith — ne réécris pas son contenu
2. Reformule la première ligne en hook percutant (question ou fait surprenant)
3. Insère naturellement des mots-clés SEO que ses patients chercheraient
   (ex: "acupuncture Montréal", "fertilité naturelle", "douleurs menstruelles")
4. Ajoute un CTA clair à la fin avec "lien en bio"
5. Ajoute max 3 hashtags ultra-ciblés à la fin
6. Français québécois authentique
7. 150-200 mots maximum
```

Modifier `functions/src/index.ts` (generateCaption Cloud Function) :
- Accepter `captionDraft?: string` dans l'input
- Brancher sur le bon prompt selon sa présence

## Contraintes
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes (IdeaDetailSheet va être le plus gros — découper
  en sous-composants si nécessaire : IdeaInfoSection, IdeaCaptionSection, IdeaActions)
- TypeScript strict
- Toutes les sauvegardes Firestore passent par useUpdateContentItem
  (qui appelle deriveWorkflowState automatiquement)
- Ne PAS modifier l'éditeur, le calendrier, ou la publication
- Le bottom sheet existant (BottomSheet.tsx) est réutilisé pour FilterSheet et IdeaDetailSheet

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Cliquer sur une carte d'idée ouvre le IdeaDetailSheet
- [ ] Modifier le titre/catégorie/notes dans le sheet sauvegarde dans Firestore
- [ ] Le badge statut reflète l'état automatique (deriveWorkflowState)
- [ ] Les boutons d'action changent selon le statut
- [ ] "Créer le contenu" navigue vers l'éditeur
- [ ] Les filtres sont 2 boutons qui ouvrent des bottom sheets
- [ ] Filtre catégorie montre les catégories custom
- [ ] Écrire une caption + "Optimiser" enrichit le texte
- [ ] "Repartir de mon texte" restaure le captionDraft
- [ ] Caption vide + "Optimiser" génère une caption complète (fallback)
