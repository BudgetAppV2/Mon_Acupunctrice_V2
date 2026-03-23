# Milestone 10 — Facebook Reels & Distribution étendue Meta

## Objectif
Étendre la distribution du contenu aux Reels Facebook en utilisant le même token Meta et la même API, permettant à Judith de doubler sa visibilité sur l'écosystème Meta en un clic.

## Phase
DISTRIBUER

## Dépendances
- **M09** : OAuth Meta fonctionnel et token long-lived stocké dans Firestore.

## User stories couvertes
- En tant que Judith, je veux que mes vidéos soient aussi publiées sur ma page Facebook professionnelle.
- En tant que Judith, je veux pouvoir inclure des liens cliquables dans mes captions Facebook.

## Livrables précis

- **UI & Frontend :**
    - `components/features/publish/PublishSheet.tsx` : Ajout d'un toggle "Publier aussi sur Facebook".
    - `app/(app)/profil/page.tsx` : Affichage de l'état de connexion à la page Facebook.
- **Backend (Cloud Functions & API Routes) :**
    - `functions/src/facebook.ts` : Nouvelle Cloud Function `publishToFacebook`.
    - `functions/src/scheduler.ts` : Mise à jour pour inclure la publication Facebook si l'option est activée.
    - `functions/src/generateCaption.ts` : Adaptation du prompt pour les spécificités de Facebook (liens cliquables).
- **Data Model :**
    - Mise à jour de `ContentItem` pour tracker le statut Facebook.

## Spécifications techniques détaillées

### Permissions Meta
Le token OAuth obtenu au M09 doit inclure les permissions `pages_manage_posts` et `pages_read_engagement` pour publier sur une Page Facebook. Si ces permissions manquent, Judith devra ré-autoriser l'app via le bouton dans le profil.

### Publication Facebook Reels
Endpoint : `POST /{page-id}/video_reels`.
Le processus est similaire à Instagram : Upload URL -> Poll status -> Publish.
Les limites techniques sont les mêmes que pour Instagram Reels (MP4, 9:16, < 60s recommandés).

### Caption Adaptée
Contrairement à Instagram, Facebook supporte les liens cliquables.
Le prompt de `generateCaption` doit insérer directement l'URL du site Wix de Judith dans le texte de la publication Facebook, au lieu de dire "Lien en bio".

### Scheduler
`schedulePublisher` bouclera sur `platforms[]`. Si `platforms` contient 'facebook', elle appelle `publishToFacebook` après (ou en parallèle de) `publishToInstagram`.

## Data model changes
- **Collection `contentItems`** :
    - `platforms`: string[] (ex: `['instagram', 'facebook']`)
    - `facebookStatus`: 'pending' | 'published' | 'failed'
    - `facebookPostId`: string
- **Collection `users`** :
    - `facebookPageId`: string
    - `facebookPageName`: string

## Cloud Functions
- **`publishToFacebook` (Nouvelle)** : Gère l'upload et la publication sur la Page Facebook.
- **`schedulePublisher` (Modifiée)** : Support multi-plateforme.

## Definition of Done
- [ ] Le toggle Facebook est présent dans le `PublishSheet`.
- [ ] La Cloud Function `publishToFacebook` est déployée.
- [ ] La caption générée pour Facebook contient des liens cliquables.
- [ ] La publication simultanée Instagram + Facebook fonctionne.
- [ ] Le statut Facebook est correctement mis à jour dans Firestore.
- [ ] Un test de publication réelle sur la page Facebook de Judith est réussi.

## Prompt one shot pour Claude Code

```markdown
# Milestone 10 — Distribution Facebook Reels

## Contexte
Mon Acupunctrice Hub publie déjà sur Instagram via Meta Graph API.
Le token Meta est stocké dans Firestore (M09 — OAuth). Facebook Reels
utilise la même API et le même token — c'est le milestone le plus léger.

## Fichiers à lire AVANT de commencer
- `functions/src/instagram.ts` → pattern de publication Instagram (réutiliser)
- `functions/src/scheduler.ts` → scheduler actuel (ajouter Facebook)
- `functions/src/index.ts` → generateCaption actuel (ajouter param platform)
- `components/features/publish/PublishSheet.tsx` → UI de publication (ajouter toggle)
- `project-docs/03_TECH/API_DESIGN.md` → détail publishToFacebook
- `project-docs/03_TECH/DATA_MODEL.md` → nouveaux champs contentItem

## Livrables
- [ ] `functions/src/facebook.ts` — Cloud Function `publishToFacebook` :
      1. Lire facebookPageId + metaAccessToken depuis Firestore
      2. POST /{page-id}/video_reels (source=videoUrl, description=caption)
      3. Poll status jusqu'à ready (max 120s)
      4. POST /{page-id}/video_reels?action=PUBLISH&video_id={id}
      5. Update Firestore: facebookStatus='published', facebookPostId
- [ ] Modifier `PublishSheet.tsx` — ajouter toggle "Facebook" :
      - Checkbox désactivée par défaut
      - Si facebookPageId absent dans user → "Connecte Facebook dans Profil"
      - Si activé → ajouter 'facebook' à item.platforms[]
- [ ] Modifier `generateCaption` — nouveau param `platform?: string` :
      - instagram: "lien en bio" + URL (non cliquable)
      - facebook: URL Wix directement dans le texte (cliquable)
- [ ] Modifier `scheduler.ts` — boucler sur item.platforms[] :
      - Chaque plateforme est indépendante (un échec FB ≠ échec IG)
      - distributionStatus='published' seulement si TOUTES les plateformes OK
- [ ] Ajouter `app/api/publish-facebook/route.ts` — wrapper Cloud Function
- [ ] Ajouter champs Firestore sur contentItem : platforms[], facebookStatus, facebookPostId

## Contraintes
- Token lu depuis `users/{userId}/private/tokens` (Admin SDK, jamais client)
- Erreurs Facebook indépendantes d'Instagram
- Heroicons, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] Toggle Facebook visible dans PublishSheet
- [ ] Publication Facebook réussie sur la page de Judith
- [ ] Scheduler publie sur les deux plateformes si demandé
- [ ] Caption Facebook contient l'URL Wix cliquable
```
