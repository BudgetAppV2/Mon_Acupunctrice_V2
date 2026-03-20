# Milestone 03 — Calendrier Éditorial (Vue & Scheduling)

## Objectif
Créer une vue de calendrier éditorial mensuel permettant de visualiser les contenus planifiés et d'assigner des dates de publication aux contenus "prêts".

## User stories couvertes
- **US-14** : Voir un calendrier mensuel avec les contenus et leur statut.
- **US-15** : Assigner un contenu "prêt" à une date.
- **US-16** : Cliquer sur un item pour voir son détail et ses actions.
- **US-17** : Voir les "trous" dans le planning.

## Dépendances
- **Milestone 01** : Structure du projet & Auth.
- **Milestone 02** : CRUD des `contentItems` pour avoir des données à afficher.

## Livrables précis

- **Page :**
    - `/app/(app)/calendrier/page.tsx` : Remplacer le placeholder par le vrai calendrier.

- **Composants :**
    - `/components/features/calendar/CalendarView.tsx` : Composant principal qui génère et affiche la grille du mois.
    - `/components/features/calendar/CalendarDay.tsx` : Cellule pour un jour du calendrier, affichant des "dots" ou thumbnails pour les contenus planifiés.
    - `/components/features/calendar/CalendarHeader.tsx` : Entête du calendrier avec le nom du mois et les flèches de navigation.
    - `/components/features/calendar/ScheduleSheet.tsx` : Bottom sheet qui s'ouvre au clic sur une date, pour assigner un contenu "prêt".
    - `/components/features/calendar/ItemDetailSheet.tsx` : Bottom sheet qui s'ouvre au clic sur un item, affichant les détails et les actions.
    - `/components/features/calendar/DashboardBar.tsx` : Barre en haut du calendrier affichant les statistiques (`X publiés`, `X planifiés`, etc.).

- **Hooks :**
    - `/lib/hooks/useCalendar.ts` : Hook pour gérer la logique du calendrier (mois courant, navigation, récupération des données).

## Spécifications techniques détaillées

- **Grille Mensuelle Custom :**
    - **Ne pas utiliser de librairie externe** comme `react-calendar`. La grille doit être construite manuellement avec des `div` et du CSS Grid pour un contrôle total.
    - Le `CalendarView` générera les 42 cellules (6 semaines * 7 jours) nécessaires pour afficher n'importe quel mois.
    - L'interaction de swipe horizontal pour changer de mois sera gérée avec `framer-motion`.

- **Affichage des Items :**
    - Chaque `CalendarDay` reçoit les `contentItems` prévus pour ce jour.
    - Si un seul item est prévu, un "dot" coloré (selon le statut) s'affiche.
    - Si plusieurs items, afficher jusqu'à 3 dots.
    - Si un item a une `thumbnailUrl`, afficher une miniature à la place des dots.

- **Dashboard :**
    - Le `DashboardBar` utilisera le hook `useContentItems` (du MS-02) sans filtre pour compter le nombre d'items par `workflowState` et `distributionStatus` en temps réel.

- **Interactions :**
    - **Tap sur une date vide** : Ouvre `ScheduleSheet`, qui liste tous les items avec le statut `ready`. Sélectionner un item l'assigne à cette date (met à jour `scheduledAt` et `distributionStatus` à `scheduled`).
    - **Tap sur un item (dot/thumbnail)** : Ouvre `ItemDetailSheet`, affichant un résumé du contenu (thumbnail, statut, caption) et des boutons d'action.
    - **Actions dans `ItemDetailSheet`** :
        - `Modifier` : Redirige vers `/editeur/[id]`.
        - `Publier maintenant` : Déclenche la fonction de publication (du futur MS-07).
        - `Déprogrammer` : Remet le statut à `ready` et efface `scheduledAt`.

## Contraintes
- **PAS de librairie de calendrier externe.** C'est une contrainte forte pour garder le bundle léger et le design 100% custom.
- **PAS de drag-and-drop.** Le scheduling se fait uniquement par "tap and select".
- La vue doit être parfaitement responsive et optimisée pour un écran de 375px.

## Definition of Done
- [ ] La grille du calendrier pour le mois en cours s'affiche correctement.
- [ ] Il est possible de naviguer entre les mois avec les flèches et le swipe.
- [ ] Les contenus planifiés apparaissent sur le calendrier (dots ou thumbnails).
- [ ] Le dashboard de statistiques en haut du calendrier est correct et se met à jour en temps réel.
- [ ] Cliquer sur une date vide permet d'assigner un contenu "prêt" à la publication.
- [ ] Cliquer sur un item du calendrier ouvre une bottom sheet avec ses détails.
- [ ] Les actions "Modifier" et "Déprogrammer" depuis la bottom sheet fonctionnent.

## Prompt one shot pour Claude Code

```
# Milestone 03 — Calendrier Éditorial

## Contexte
Le projet a déjà son système d'authentification et le CRUD pour les idées. Ce milestone consiste à construire l'interface du calendrier éditorial pour visualiser et planifier les contenus.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, Firebase (Firestore), Framer Motion.

## Objectif
Créer une vue de calendrier mensuel custom (sans librairie externe) qui affiche les contenus planifiés, permet de naviguer entre les mois, et d'assigner des dates de publication.

## Livrables à créer

1.  **`app/(app)/calendrier/page.tsx`** :
    - Remplacer le contenu placeholder par le nouveau `CalendarView`.

2.  **`lib/hooks/useCalendar.ts`** :
    - Gère l'état du mois et de l'année actuellement affichés (`currentDate`).
    - Expose des fonctions `goToNextMonth`, `goToPreviousMonth`.
    - Utilise `useContentItems` pour récupérer les items du mois affiché (query Firestore sur `scheduledAt`).

3.  **`components/features/calendar/CalendarView.tsx`** :
    - Utilise le `useCalendar` hook.
    - Génère une grille de 42 `div` pour les jours du mois.
    - Gère la navigation par swipe avec `framer-motion`.
    - Affiche `CalendarHeader` et `DashboardBar`.
    - Rend un `CalendarDay` pour chaque jour.

4.  **`components/features/calendar/CalendarDay.tsx`** :
    - Props : `date`, `items: ContentItem[]`, `isCurrentMonth: boolean`.
    - Affiche le numéro du jour.
    - Si `items` n'est pas vide, affiche des dots colorés ou des miniatures.
    - Le `onClick` doit gérer l'ouverture de `ScheduleSheet` (si date vide) ou `ItemDetailSheet` (si items présents).

5.  **`components/features/calendar/DashboardBar.tsx`** :
    - Affiche les statistiques calculées en temps réel : "X publiés · X planifiés · X prêts · X idées".

6.  **`components/features/calendar/ScheduleSheet.tsx`** :
    - Bottom sheet qui s'active au clic sur une date vide.
    - Affiche la liste des `contentItems` avec le statut `ready`.
    - Le clic sur un item met à jour son `scheduledAt` et son `distributionStatus` via `useUpdateContentItem`.

7.  **`components/features/calendar/ItemDetailSheet.tsx`** :
    - Bottom sheet qui s'active au clic sur un item dans le calendrier.
    - Affiche le thumbnail, le statut, la caption.
    - Propose les actions "Modifier", "Publier maintenant", "Déprogrammer".

## Contraintes
- **ABSOLUMENT AUCUNE LIBRAIRIE DE CALENDRIER EXTERNE.** Construire la grille manuellement.
- Le design doit être mobile-first (375px) et très épuré.

## Definition of Done
- La navigation mensuelle par swipe et boutons est fonctionnelle.
- Les données de Firestore sont correctement affichées dans les cellules du calendrier.
- Le flux de planification (clic sur date -> sélection item prêt -> mise à jour) est complet.
- La consultation des détails d'un item planifié fonctionne.
```
