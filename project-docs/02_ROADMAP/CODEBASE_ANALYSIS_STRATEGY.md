# GEMINI TASK — Analyse de faisabilité Phase Stratégie (S01-S08)

Ce document contient l'analyse de faisabilité détaillée pour les 8 milestones de la Phase Stratégie de "Mon Acupunctrice Hub V2", basée sur l'état actuel de la codebase (Mars 2026).

---

## S01 — Catégorisation par style

### Complexité estimée : Petit

### Fichiers à MODIFIER
- `lib/types/index.ts` → Ajouter le type `ContentStyle` (`'enseigner' | 'connecter' | 'aider' | 'inspirer'`) et la propriété optionnelle `contentStyle?: ContentStyle` à l'interface `ContentItem`.
- `project-docs/03_TECH/DATA_MODEL.md` → Documenter le nouveau champ `contentStyle` sur `ContentItem`.
- `components/features/ideas/IdeaDetailSheet.tsx` → Ajouter l'interface utilisateur (4 boutons de style colorés) pour sélectionner et sauvegarder le style d'un contenu existant.
- `components/features/ideas/CreateIdeaSheet.tsx` → Ajouter les 4 boutons de style au flow de création rapide d'une idée.
- `components/features/calendar/CalendarDay.tsx` → Ajouter l'affichage conditionnel d'un petit point de couleur si l'item possède un `contentStyle`.

### Fichiers à CRÉER
- (Aucun fichier à créer, modifications uniquement).

### Impacts sur le data model
- Ajout du champ `contentStyle` (chaîne de caractères) sur les documents de la collection `contentItems`. Pas de nouvel index requis dans l'immédiat, car on filtrera généralement côté client dans le calendrier ou la banque d'idées.

### Impacts sur les security rules
- Aucun. Les règles actuelles pour `contentItems` permettent déjà de lire/écrire ce nouveau champ librement pour le propriétaire.

### Risques techniques
- **Rétrocompatibilité :** Les centaines d'idées existantes n'auront pas ce champ. L'UI doit gérer gracieusement l'absence de `contentStyle` (ex: ne pas afficher de point coloré dans le calendrier).

### Dépendances
- Aucune. Peut être fait en premier.

### Questions ouvertes
- Faut-il afficher le style visuellement aussi dans la banque d'idées (`ContentCard.tsx`) ou seulement dans le calendrier ?

---

## S02 — Calendrier-cadre

### Complexité estimée : Moyen

### Fichiers à MODIFIER
- `lib/types/index.ts` → Ajouter les interfaces `CalendarSlot`, `SlotFormat`, `SlotStatus`, `PlanPhase`, et `WeekPattern`.
- `project-docs/03_TECH/DATA_MODEL.md` → Documenter la nouvelle collection `calendarSlots`.
- `firestore.rules` → Ajouter la règle d'accès pour la collection `calendarSlots`.
- `lib/hooks/useCalendar.ts` → Modifier le hook pour faire une 2ème query sur `calendarSlots` en parallèle de `contentItems`, et fusionner les deux listes dans `itemsByDay` (ou un nouveau `slotsByDay`).
- `components/features/calendar/CalendarView.tsx` → Passer les slots au composant `CalendarDay`. Intégrer l'appel à la fonction génératrice de slots.
- `components/features/calendar/CalendarDay.tsx` → Adapter le rendu pour afficher soit un slot fantôme (pointillé), soit un slot rempli, soit un contentItem classique, en fonction des données reçues. Gérer le tap sur un slot vide.
- `components/features/calendar/DashboardBar.tsx` → Changer la logique pour afficher le résumé de la semaine courante (ex: "Semaine 12 — 2 emplacements") et la progression, plutôt qu'uniquement des infos génériques.

### Fichiers à CRÉER
- `lib/utils/calendarSlots.ts` → Contiendra la logique `generateWeekSlots(startDate, phase)` pour créer les slots manquants dans Firestore.
- `components/features/calendar/FillSlotSheet.tsx` → Nouveau composant BottomSheet qui s'ouvre au tap sur un slot fantôme, proposant de "Choisir une idée", "Créer une idée", ou "Passer".

### Impacts sur le data model
- Nouvelle collection racine `calendarSlots`. Index requis potentiellement sur `userId ASC + scheduledDate ASC` pour pouvoir requêter un mois donné rapidement.

### Impacts sur les security rules
- Ajouter :
  ```javascript
  match /calendarSlots/{slotId} {
    allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  }
  ```

### Risques techniques
- **Génération asynchrone :** Gérer correctement le moment où `generateWeekSlots` est appelé (ex: au scroll/swipe vers un mois futur) pour éviter de spammer Firestore ou de générer des doublons de slots si la fonction est appelée plusieurs fois en même temps.

### Dépendances
- S01 (Les slots doivent utiliser les styles `ContentStyle`).

### Questions ouvertes
- Est-ce qu'on génère les slots côté client (batch Firestore) quand l'utilisateur navigue ? Oui, c'est le plus simple, mais nécessite un check pour vérifier si les slots de la semaine existent déjà.

---

## S03 — Stories Instagram API

### Complexité estimée : Moyen

### Fichiers à MODIFIER
- `app/api/publish/route.ts` ou la Cloud Function associée → L'API actuelle appelle une Cloud Function `publishToInstagram`. Pour publier une Story, il faut passer le paramètre `media_type: 'STORIES'` à l'API Meta. Si la logique est dans la Cloud Function, il faudra potentiellement ajouter le support dans le backend Cloud Functions, OU faire l'appel direct dans Next.js (comme c'est fait pour Facebook/YouTube dans `app/api/cron/publish/route.ts`).
- `lib/types/index.ts` → Ajouter `'story'` aux formats supportés dans la distribution.
- `components/features/publish/PlatformToggles.tsx` → Ajouter "Story Instagram".
- `components/features/publish/PublishSheet.tsx` → Masquer le champ `caption` si "Story Instagram" est sélectionné (les Stories n'ont pas de caption via l'API).

### Fichiers à CRÉER
- `components/features/editor/StoryTemplatePreview.tsx` (Optionnel) → Pour prévisualiser les templates de Stories avant publication.

### Impacts sur le data model
- Aucun impact majeur, on utilise les champs existants de `ContentItem`, mais on précise que la cible est une Story.

### Impacts sur les security rules
- Aucun.

### Risques techniques
- L'API Instagram Graph pour les Stories a des limites strictes (ratio d'aspect 9:16 exact souvent requis, limite de 60s pour la vidéo, et pas de stickers interactifs).
- Si la Cloud Function existante `publishToInstagram` ne gère pas le paramètre `media_type: 'STORIES'`, on devra recréer la logique de publication Graph API IG directement dans le code Next.js ou modifier la Cloud Function.

### Dépendances
- Aucune.

### Questions ouvertes
- La Cloud Function `publishToInstagram` peut-elle accepter `media_type: 'STORIES'` ou doit-on écrire la requête Graph API depuis `app/api/publish/route.ts` (comme on le fait pour Facebook) ?

---

## S04 — Séquences blogue

### Complexité estimée : Gros

### Fichiers à MODIFIER
- `components/features/calendar/CalendarView.tsx` → Ajouter l'UI (ex: bouton dans le header) pour "Nouvelle séquence blogue".
- `components/features/calendar/CalendarDay.tsx` → Gérer le lien visuel (badge 1/4, 2/4) pour les éléments de séquence.
- `app/api/cron/publish/route.ts` → Modifier le cron pour détecter les slots ayant `autoPublish: true` et générer/publier l'image de Story automatiquement.
- `project-docs/03_TECH/DATA_MODEL.md` → Documenter la collection `blogSequences`.

### Fichiers à CRÉER
- `components/features/calendar/CreateSequenceSheet.tsx` → BottomSheet pour coller le lien du blogue, avec un aperçu de la séquence.
- `app/api/scrape-og/route.ts` (ou un Server Action) → Endpoint pour scraper les meta tags (titre, image) du lien Wix fourni, évitant les problèmes de CORS côté client.
- `lib/hooks/useBlogSequence.ts` → Hook pour appeler l'endpoint de scraping et faire le batch d'écriture Firestore (1 doc sequence + 4 slots).
- `lib/utils/storyImageGenerator.ts` → Logique pour générer l'image 1080x1920 (ex: via `@vercel/og` ou Canvas API) pour les stories auto.

### Impacts sur le data model
- Nouvelle collection `blogSequences`.
- Nouveaux champs sur `calendarSlots` : `sequenceId`, `sequenceRole`, `autoPublish` (boolean), `promptTitle`, `promptDescription`.

### Impacts sur les security rules
- Ajouter `match /blogSequences/{seqId}` avec des règles lecture/écriture pour le propriétaire.

### Risques techniques
- **Génération d'images Serverless :** Générer des images de Story (1080x1920) dans une API route Vercel (Cron) peut dépasser les limites de mémoire/taille du Hobby plan. L'utilisation de `@vercel/og` (Satori) est recommandée mais limitée à du HTML/CSS basique.
- **Timing du Cron :** Le cron actuel sur Vercel Hobby est limité à 1 exécution par jour (`0 12 * * *`, soit 8h Montréal). Cela signifie que les Stories automatiques ne seront publiées qu'à 8h du matin. Si Judith crée la séquence à 10h, la "Story de lancement (Jour J)" partira le lendemain à 8h. 

### Dépendances
- S02 (Slots), S03 (Stories API).

### Questions ouvertes
- La limitation d'une seule exécution par jour du Cron (à 8h heure locale) est-elle acceptable pour la publication des stories automatiques ? Sinon, il faudra migrer ce cron vers Firebase Scheduled Functions.

---

## S05 — Optimisation par plateforme

### Complexité estimée : Moyen

### Fichiers à MODIFIER
- `app/api/generate-caption/route.ts` → Ajouter le contexte de plateforme et de style à l'appel de la Cloud Function (ou modifier le payload pour injecter un prompt enrichi si la CF est générique).
- `components/features/publish/PublishSheet.tsx` → Injecter le lien Wix dynamiquement pour Facebook/YouTube, et afficher la checklist de publication.
- `components/features/editor/EditorLayout.tsx` (ou `VideoPreview.tsx`) → Ajouter un petit composant par-dessus l'aperçu vidéo pour indiquer la durée avec les recommandations ("✓ 28 sec — Idéal").

### Fichiers à CRÉER
- `lib/utils/platformOptimization.ts` → Un fichier utilitaire contenant la logique du "CTA rotatif" en fonction du style de contenu, et les recommandations de durées par plateforme.

### Impacts sur le data model
- Aucun.

### Impacts sur les security rules
- Aucun.

### Risques techniques
- L'enrichissement de `generateCaption` dépend de la façon dont la Cloud Function existante gère les requêtes. On peut envoyer des instructions supplémentaires via les `notes` ou ajuster le backend IA plus tard.

### Dépendances
- S01 (Les CTA rotatifs dépendent du style `ContentStyle`).

### Questions ouvertes
- Doit-on forcer la génération de plusieurs versions de la caption d'un seul coup (1 pour IG, 1 pour YT), ou bien laisse-t-on Judith générer spécifiquement pour la plateforme qu'elle a sélectionnée ?

---

## S06 — Banque de templates (hooks & captions)

### Complexité estimée : Petit

### Fichiers à MODIFIER
- `app/(app)/layout.tsx` → Mettre à jour la `BottomTabBar` (actuellement 4 onglets : Idées, Calendrier, Stats, Profil) pour inclure un onglet "Inspiration" (potentiellement en remplaçant la page `blitz` ou en ajoutant un 5e onglet).

### Fichiers à CRÉER
- `lib/data/templates.ts` → Contient les tableaux d'objets statiques (hooks et structures) catégorisés par style.
- `app/(app)/inspiration/page.tsx` → Nouvelle page racine.
- `components/features/inspiration/TemplateList.tsx` → Affiche la liste filtrable par style avec le bouton "Copier".

### Impacts sur le data model
- Aucun (données statiques).

### Impacts sur les security rules
- Aucun.

### Risques techniques
- **UI de navigation :** Ajouter un 5e onglet dans la barre de navigation sur un écran de 375px risque d'être à l'étroit (textes qui se chevauchent). Il faudra peut-être remplacer une fonctionnalité peu utilisée, ou grouper.

### Dépendances
- S01 (Les styles).

### Questions ouvertes
- Est-ce que "Inspiration" doit vraiment être un onglet de premier niveau dans la Tab Bar, ou plutôt une section accessible depuis le Profil ou la création d'idées ?

---

## S07 — Encouragement & progression

### Complexité estimée : Moyen

### Fichiers à MODIFIER
- `lib/types/index.ts` → Ajouter `progressData` (currentStreak, longestStreak, totalPublished, milestonesUnlocked, lastActiveWeek) à l'interface `User`.
- `project-docs/03_TECH/DATA_MODEL.md` → Documenter l'ajout sur `users`.
- `components/features/calendar/DashboardBar.tsx` → Intégrer le cercle de progression et le badge de série "X semaines 🔥".
- `app/(app)/profil/page.tsx` → Ajouter la section d'affichage des jalons débloqués.
- `app/api/cron/publish/route.ts` (ou hook de publication manuelle) → C'est au moment où un contenu est *publié* (ou un slot marqué completed) qu'on doit calculer la série et vérifier le déblocage des jalons. L'endroit idéal est une mise à jour lors de la publication.

### Fichiers à CRÉER
- `components/features/calendar/ProgressionCircle.tsx` → Composant SVG (Apple Watch style) pour la semaine courante.
- `components/features/profile/MilestonesList.tsx` → Composant de grille affichant les jalons.
- `lib/hooks/useProgression.ts` → Logique de vérification des jalons et mise à jour de la `progressData` dans Firestore.

### Impacts sur le data model
- Nouveau sous-objet `progressData` dans le document `users/{userId}`.

### Impacts sur les security rules
- Aucun (les users lisent/écrivent déjà leur propre document).

### Risques techniques
- **Calcul des semaines (Timezones) :** Le calcul de "série de semaines actives" doit être robuste face aux fuseaux horaires (Judith est en `America/Toronto`). L'utilisation de clés du type `YYYY-WW` (Année-Semaine) standard ISO est recommandée pour stocker `lastActiveWeek`.
- Les jalons doivent se débloquer une seule fois pour éviter d'afficher un toast de félicitations à chaque fois.

### Dépendances
- S02 (Le cercle affiche l'avancement des slots de la semaine).

### Questions ouvertes
- La publication étant souvent asynchrone (via Cron), Judith ne verra pas le "Toast de jalon" en direct si le jalon est validé par le cron. On devrait afficher les notifications de jalons non vus à sa prochaine ouverture de l'application.

---

## S08 — Calendrier visuel enrichi

### Complexité estimée : Moyen

### Fichiers à MODIFIER
- `components/features/calendar/CalendarDay.tsx` → Gérer l'affichage compact des multiples indicateurs (pastilles de couleur des styles, liens de séquences).
- `components/features/calendar/DashboardBar.tsx` (ou `CalendarHeader.tsx`) → Ajouter les compteurs mensuels (ex: 4 pastilles colorées avec les totaux d'Enseigner/Connecter/Aider/Inspirer pour le mois).

### Fichiers à CRÉER
- (Aucun nouveau fichier strict, enrichissement des composants existants).

### Impacts sur le data model
- Aucun.

### Impacts sur les security rules
- Aucun.

### Risques techniques
- **Complexité UI (Mobile) :** Sur 375px, les cellules du calendrier sont très petites (`min-h-[48px]`). Ajouter une ligne de connexion SVG d'une cellule à l'autre pour une séquence (surtout si la séquence passe à la ligne suivante d'une semaine) est très difficile à implémenter proprement en CSS/React et risque d'alourdir le rendu.
- **Alternative recommandée :** Au lieu de dessiner des lignes entre les jours pour lier une séquence, il est préférable de donner une même icône ou un petit "badge connecté" commun aux jours concernés (ex: le logo de la séquence ou un identifiant visuel "Seq 1").

### Dépendances
- S01 (Couleurs de style), S02 (États des slots).

### Questions ouvertes
- Quel est le design précis souhaité pour connecter visuellement une séquence s'étendant sur 3 semaines (parfois coupée à cause du saut de ligne dimanche→lundi) sur un petit écran ?

---
*Analyse générée par Gemini CLI.*