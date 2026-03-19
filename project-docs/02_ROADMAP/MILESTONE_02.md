# Milestone 02 — Banque d'idées (CRUD) & Vue Blitz

## Objectif
Implémenter le CRUD (Create, Read, Update, Delete) complet pour la banque d'idées, et créer la vue "Blitz" pour les sessions de tournage focus.

## User stories couvertes
- **US-01** : Capturer une idée rapidement.
- **US-02** : Voir les idées organisées par statut.
- **US-03** : Filtrer les idées par catégorie.
- **US-04** : Voir les idées prêtes à filmer en mode "Blitz".

## Dépendances
- **Milestone 01** : Structure du projet, Auth, et configuration de base.

## Livrables précis

- **Pages :**
    - `/app/(app)/idees/page.tsx` : Page principale affichant la liste des idées, avec des filtres.
    - `/app/(app)/blitz/page.tsx` : Page de la session de tournage "Blitz".

- **Composants :**
    - `/components/features/ideas/IdeaList.tsx` : Affiche la liste des `ContentCard`. Gère les états (loading, empty, error).
    - `/components/features/ideas/ContentCard.tsx` : Carte individuelle pour une idée, affichant titre, catégorie, et un badge de statut coloré. Gère le swipe-to-delete.
    - `/components/features/ideas/CreateIdeaSheet.tsx` : Bottom sheet (ou modal sur desktop) pour la création d'une nouvelle idée.
    - `/components/features/ideas/IdeaFilters.tsx` : Barre de filtres pour la liste d'idées (par statut et catégorie).
    - `/components/features/blitz/BlitzSession.tsx` : Composant principal de la vue Blitz, affichant une idée à la fois.

- **Hooks :**
    - `/lib/hooks/useContentItems.ts` : Hook pour lire les `contentItems` depuis Firestore avec des filtres (temps réel).
    - `/lib/hooks/useCreateContentItem.ts` : Hook pour créer un nouvel `contentItem` dans Firestore.
    - `/lib/hooks/useUpdateContentItem.ts` : Hook pour mettre à jour un `contentItem`.
    - `/lib/hooks/useDeleteContentItem.ts` : Hook pour supprimer un `contentItem`.

- **Types :**
    - `/lib/types/index.ts` : Mettre à jour avec les types `ContentItem`, `ContentCategory`, et `WorkflowState` depuis `DATA_MODEL.md`.

## Spécifications techniques détaillées

- **Schéma Firestore :**
    - Utiliser la collection `contentItems` comme défini dans `project-docs/03_TECH/DATA_MODEL.md`.
    - Les hooks Firestore utiliseront la librairie `firebase/firestore` pour les opérations `onSnapshot` (temps réel), `addDoc`, `updateDoc`, et `deleteDoc`.

- **Page `/idees` :**
    - La liste des idées doit se mettre à jour en temps réel.
    - Un bouton flottant "+" en bas à droite ouvrira le `CreateIdeaSheet`.
    - Les filtres (multi-sélection pour les catégories, sélection unique pour le statut) doivent être appliqués à la query Firestore.
    - **État `empty`** : Si la liste est vide, afficher un message encourageant comme : "Votre prochaine idée brillante commence ici. Appuyez sur + pour la capturer !".

- **Composant `ContentCard` :**
    - Doit afficher `title` et `category`.
    - Un badge coloré (basé sur la palette Tailwind) indiquera le `workflowState`.
    - **Interaction mobile** : Implémenter le "swipe to delete" à l'aide d'une librairie comme `framer-motion`.

- **Composant `CreateIdeaSheet` :**
    - Doit apparaître en "bottom sheet" sur mobile.
    - Contient un formulaire avec : `title` (requis), `category` (select), `notes` (textarea).
    - La soumission utilise le hook `useCreateContentItem`.

- **Page `/blitz` :**
    - La page récupère tous les items avec le statut `ready_to_shoot`.
    - Elle les affiche un par un dans le composant `BlitzSession`, dans un style "focus mode".
    - Des boutons "✅ Filmé ! Suivante →" (met à jour le statut à `shot`) et " Passer" permettent de naviguer.
    - Une barre de progression indique le nombre d'idées filmées / total.

## Contraintes
- **Pas de drag-and-drop** pour réorganiser les idées pour l'instant.
- Les interactions doivent être fluides et natives au toucher sur mobile.
- Gérer proprement tous les états de chargement (`loading`) et d'erreur (`error`) des appels Firestore.

## Definition of Done
- [ ] Il est possible de créer une nouvelle idée via le formulaire.
- [ ] La nouvelle idée apparaît instantanément dans la liste.
- [ ] La liste des idées peut être filtrée par statut et/ou catégorie.
- [ ] Supprimer une idée en la "swipant" sur mobile fonctionne.
- [ ] L'état vide de la liste d'idées est géré avec un message clair.
- [ ] La page `/blitz` affiche correctement les idées "prêtes à filmer".
- [ ] Cliquer sur "Filmé !" dans la vue Blitz met à jour le statut de l'item dans Firestore et passe à l'idée suivante.

## Prompt one shot pour Claude Code
```
# Milestone 02 — CRUD Idées & Vue Blitz

## Contexte
Le projet "Mon Acupunctrice Hub V2" a déjà sa structure de base et son système d'authentification (Milestone 01). Ce milestone se concentre sur la première feature métier : la banque d'idées.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, Firebase (Auth, Firestore), Zustand.

## Objectif
Implémenter un CRUD complet pour les `contentItems` (idées) dans Firestore, et construire la vue "Blitz" pour les sessions de tournage.

## Livrables à créer

1.  **`lib/types/index.ts`** :
    - Ajouter les types `ContentItem`, `ContentCategory`, et `WorkflowState` en se basant sur `project-docs/03_TECH/DATA_MODEL.md`.

2.  **`lib/hooks/useContentItems.ts`** :
    - Prend des filtres (statut, catégories) en arguments.
    - Utilise `onSnapshot` de Firestore pour écouter les changements en temps réel sur la collection `contentItems` pour l'utilisateur courant.
    - Gère les états `data`, `loading`, `error`.
    - Construit une query Firestore dynamique basée sur les filtres.

3.  **`lib/hooks/useCreateContentItem.ts`, `useUpdateContentItem.ts`, `useDeleteContentItem.ts`** :
    - Hooks simples qui encapsulent les fonctions `addDoc`, `updateDoc`, `deleteDoc` de Firestore. Ils doivent prendre l'ID de l'utilisateur pour s'assurer que les opérations sont sécurisées.

4.  **`components/features/ideas/ContentCard.tsx`** :
    - Props : `item: ContentItem`.
    - Affiche le titre et la catégorie.
    - Affiche un badge coloré correspondant au `workflowState` de l'item.
    - Implémente le "swipe to delete" avec `framer-motion`.

5.  **`components/features/ideas/CreateIdeaSheet.tsx`** :
    - Utilise un composant "bottom sheet" (par exemple, de `vaul`).
    - Contient un formulaire pour `title`, `category`, `notes`.
    - Appelle `useCreateContentItem` à la soumission.

6.  **`app/(app)/idees/page.tsx`** :
    - Utilise `useContentItems` pour récupérer les données.
    - Affiche `IdeaFilters` en haut.
    - Affiche `IdeaList` (qui rend les `ContentCard`).
    - Gère l'affichage des états `loading` (spinner) et `empty` (message d'accueil).
    - Affiche un bouton flottant "+" qui déclenche l'ouverture de `CreateIdeaSheet`.

7.  **`app/(app)/blitz/page.tsx`** :
    - Récupère les `contentItems` avec le statut `ready_to_shoot`.
    - Affiche le `BlitzSession` qui présente une idée à la fois, avec des boutons pour marquer comme "filmé" ou "passer".
    - Le bouton "filmé" utilise `useUpdateContentItem` pour changer le `workflowState` à `shot`.

## Definition of Done
- La création, lecture, mise à jour (statut), et suppression des idées fonctionne.
- Les changements dans Firestore sont reflétés en temps réel dans l'UI.
- Les états de chargement, d'erreur et de liste vide sont bien gérés visuellement.
- La vue Blitz permet de faire défiler les idées à filmer et de mettre à jour leur statut.
- Le code est propre, typé avec TypeScript, et suit les conventions de React.
```
