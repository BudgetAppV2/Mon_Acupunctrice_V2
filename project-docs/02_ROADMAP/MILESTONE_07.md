# Milestone 07 — Publication & Finalisation

## Objectif
Mettre en place le système de publication sur Instagram, incluant la publication immédiate, la planification, la génération de caption par IA, et le choix de l'image de couverture.

## User stories couvertes
- **US-18** : Publier sur Instagram en 1 tap.
- **US-19** : Générer et éditer une caption par IA.
- **US-20** : Planifier une publication.
- **US-21** : Choisir une image de couverture.
- **US-22** : Voir l'historique des publications.

## Dépendances
- **Milestone 02** : CRUD de base pour mettre à jour le statut des items.
- **Milestone 04** : La vidéo doit être exportée et disponible sur Firebase Storage.
- `legacy/functions/` : Les Cloud Functions pour la publication et la génération de caption seront réutilisées.

## Livrables précis

- **Cloud Functions (adaptation du legacy) :**
    - `functions/src/instagram.ts` : Adaptation de la fonction `publishToInstagram`.
    - `functions/src/scheduler.ts` : Adaptation du cron job pour les publications planifiées.
    - `functions/src/index.ts` : Adaptation de la fonction `generateCaption`.

- **Composants :**
    - `/components/features/publish/PublishModal.tsx` : Modal en 3 étapes pour le processus de publication.
    - `/components/features/publish/CoverPicker.tsx` : Étape 1 du modal, pour choisir l'image de couverture (frame ou upload).
    - `/components/features/publish/CaptionEditor.tsx` : Étape 2, pour générer et éditer la caption.
    - `/components/features/publish/SchedulePicker.tsx` : Partie de l'étape 3, pour choisir une date/heure de publication.

- **API Routes & Hooks :**
    - `/app/api/publish/route.ts` : Wrapper pour la fonction `publishToInstagram`.
    - `/app/api/generate-caption/route.ts` : Wrapper pour la fonction `generateCaption`.
    - `/lib/hooks/usePublish.ts` : Hook qui gère l'état et la logique du `PublishModal`.

- **Page & UI :**
    - Un bouton "Publier" sera ajouté à l' `EditorToolbar` (après export) et dans le `ItemDetailSheet` du calendrier pour les items "prêts".
    - `/app/(app)/profil/page.tsx` : Page de profil affichant l'historique des 10 dernières publications.

## Spécifications techniques détaillées

- **Processus de Publication (F4.1) :**
    - Le `PublishModal` sera le point central. Il s'ouvre quand Judith clique sur "Publier".
    - **Étape 1 : Couverture (US-21)** : Le composant `CoverPicker` proposera 3 options :
        1. Frame automatique (par défaut, `thumb_offset=0`).
        2. Scrubber pour choisir une frame manuellement (`thumb_offset` dynamique).
        3. Upload d'une image custom (`cover_url`).
        - La sélection est stockée dans l'état local du `PublishModal`.
    - **Étape 2 : Caption (US-19)** : Le `CaptionEditor` aura un bouton "Générer avec l'IA" qui appelle `/api/generate-caption`. La caption générée est affichée dans un `textarea` pour être modifiée.
    - **Étape 3 : Confirmer/Planifier** :
        - Bouton "Publier maintenant" : Appelle `/api/publish` immédiatement.
        - Bouton "Planifier" : Ouvre un date/heure picker. Une fois la date choisie, met à jour le `ContentItem` dans Firestore avec `scheduledAt` et `distributionStatus: 'scheduled'`.

- **Planification (Scheduler) (F4.2) :**
    - La Cloud Function `schedulePublisher` (déclenchée par un cron job toutes les 15 minutes) cherchera dans Firestore les items avec `distributionStatus: 'scheduled'` et `scheduledAt <= now()`.
    - Pour chaque item trouvé, elle appellera la logique de `publishToInstagram`.
    - En cas de succès, elle met à jour le statut à `published`. En cas d'échec, à `failed` et envoie un email de notification.

- **Historique des publications (US-22) :**
    - La nouvelle page `/profil` utilisera `useContentItems` pour récupérer les 10 derniers items avec `distributionStatus: 'published'`, triés par `publishedAt`.
    - Elle affichera une liste simple avec thumbnail, titre et date de publication.

- **Dashboard (F4.4) :**
    - La barre de statistiques en haut du calendrier (`DashboardBar` du MS-03) compte déjà tous les statuts et est donc déjà conforme à cette feature. Aucune modification n'est nécessaire.

## Contraintes
- Le token d'API Instagram est hardcodé côté serveur (secret Firebase) en V1. Il devra être renouvelé manuellement s'il expire.
- Les notifications d'échec de publication se feront par email uniquement en V1.
- La publication est limitée à Instagram Reels.

## Definition of Done
- [ ] Le modal de publication s'ouvre depuis l'éditeur et le calendrier.
- [ ] Le choix de l'image de couverture (frame ou upload) fonctionne et le bon paramètre (`thumb_offset` ou `cover_url`) est envoyé à l'API.
- [ ] La génération de caption par IA fonctionne et la caption est éditable.
- [ ] Le bouton "Publier maintenant" déclenche la publication sur Instagram et met à jour le statut de l'item.
- [ ] La planification d'une publication met à jour l'item dans Firestore avec la date et le statut corrects.
- [ ] La Cloud Function de planification publie bien les contenus à l'heure dite.
- [ ] La page de profil affiche l'historique des publications.

## Prompt one shot pour Claude Code

```
# Milestone 07 — Publication Instagram & Finalisation

## Contexte
L'application est presque complète. Ce dernier milestone intègre la boucle finale : la publication du contenu sur Instagram, directement depuis l'application.

## Stack
- Next.js 15, TypeScript, Firebase (Cloud Functions, Firestore, Storage), Instagram Graph API.

## Objectif
Créer un flux de publication complet, incluant le choix de la couverture, la génération de caption, la publication immédiate et la planification.

## Livrables à créer

1.  **Cloud Functions (adaptation de `legacy/functions/`)** :
    - `functions/src/instagram.ts` (`publishToInstagram`) : Doit accepter les nouveaux paramètres `coverOption`, `thumbOffset`, et `coverUrl` et les ajouter à l'appel de l'API Graph.
    - `functions/src/scheduler.ts` (`schedulePublisher`) : S'assurer que le cron job est configuré et qu'il query correctement Firestore pour publier les items planifiés.
    - `functions/src/index.ts` (`generateCaption`) : Adapter le prompt de l'IA si nécessaire pour correspondre à la stratégie de contenu.

2.  **API Routes (wrappers)** :
    - `/app/api/publish/route.ts` : Appelle la fonction `publishToInstagram`.
    - `/app/api/generate-caption/route.ts` : Appelle la fonction `generateCaption`.

3.  **`components/features/publish/PublishModal.tsx`** :
    - Composant principal qui gère un état interne pour les 3 étapes (couverture, caption, confirmation).

4.  **`components/features/publish/CoverPicker.tsx`** :
    - Contient un scrubber de frames vidéo pour sélectionner `thumb_offset`.
    - Contient un input de type fichier pour uploader une image et obtenir une `cover_url`.

5.  **`components/features/publish/CaptionEditor.tsx`** :
    - Textarea pour la caption.
    - Bouton pour appeler `/api/generate-caption` et remplir le textarea.

6.  **Intégration des points d'entrée** :
    - Ajouter un bouton "Publier" dans l'éditeur (qui s'active après l'export).
    - Ajouter un bouton "Publier" dans `ItemDetailSheet` (du calendrier) pour les items avec le statut `ready`.

7.  **`app/(app)/profil/page.tsx`** :
    - Nouvelle page qui affiche l'historique des publications (`distributionStatus: 'published'`).

## Contraintes
- Le flux de publication doit être extrêmement simple et guidé pour Judith.
- La gestion des erreurs (échec de l'upload, échec de la publication Instagram) doit être claire, avec une option pour réessayer.
- La publication planifiée est une "fire-and-forget" : une fois planifiée, Judith n'a plus rien à faire.

## Definition of Done
- Le flux complet de publication (couverture -> caption -> publier/planifier) est fonctionnel.
- Les publications immédiates apparaissent sur Instagram.
- Les publications planifiées apparaissent sur Instagram à l'heure prévue.
- Le statut des `ContentItem` est correctement mis à jour dans Firestore tout au long du processus.
```
