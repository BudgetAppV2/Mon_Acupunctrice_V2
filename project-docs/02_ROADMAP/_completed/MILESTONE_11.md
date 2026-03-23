# Milestone 11 — YouTube Shorts & Google OAuth

## Objectif
Ajouter YouTube Shorts comme plateforme de distribution. Les Shorts profitent d'un excellent référencement Google Search et permettent de doubler la portée du contenu sans travail supplémentaire pour Judith.

## Phase
DISTRIBUER

## Dépendances
- **M08** : App déployée sur Vercel (URL stable pour redirect OAuth Google).
- **M09** : Pattern OAuth en place (connect buttons, stockage token).

## User stories couvertes
- En tant que Judith, je veux que mes vidéos soient publiées comme YouTube Shorts.
- En tant que Judith, je veux profiter du SEO Google pour mes vidéos d'acupuncture.

## Livrables précis

- **Google Cloud Setup :**
    - Activation de YouTube Data API v3 dans le projet Google Cloud.
- **UI & Frontend :**
    - `/app/(app)/profil/page.tsx` : Ajout de `YouTubeConnectButton`.
    - `components/features/publish/PublishSheet.tsx` : Ajout d'un toggle "Publier sur YouTube Shorts".
- **Backend (Cloud Functions & API Routes) :**
    - `/app/api/auth/youtube/` : Routes d'initiation et de callback OAuth Google.
    - `functions/src/youtube.ts` : Nouvelle Cloud Function `publishToYouTube`.
    - `functions/src/scheduler.ts` : Mise à jour pour inclure YouTube dans le flow.
- **Sécurité & Storage :**
    - Stockage du `youtubeRefreshToken` dans Firestore (secret).

## Spécifications techniques détaillées

### YouTube Data API v3
Utilisation de l'endpoint `POST /videos/insert`.
Les vidéos sont automatiquement classées Shorts si elles font moins de 60s et sont en 9:16.
Metadata YouTube :
- `title` : Titre de l'idée.
- `description` : Caption générée + hashtags (#Shorts) + URL Wix cliquable.
- `categoryId` : 26 (Howto & Style).

### OAuth Google
Scopes requis : `https://www.googleapis.com/auth/youtube.upload`.
Contrairement à Meta, Google fournit un `refresh_token` permanent qui ne nécessite pas de refresh automatique hebdomadaire.

### Quota YouTube
L'upload coûte environ 1600 units sur un quota quotidien de 10 000.
C'est suffisant pour Judith (3 vidéos/semaine). Si elle dépasse, la publication sera reportée au lendemain.

## Data model changes
- **Collection `contentItems`** :
    - `youtubeStatus`: 'pending' | 'published' | 'failed'
    - `youtubeVideoId`: string
- **Collection `users`** :
    - `youtubeRefreshToken`: string (secret)
    - `youtubeChannelId`: string
    - `youtubeChannelName`: string

## Cloud Functions
- **`publishToYouTube` (Nouvelle)** : Gère l'upload vers YouTube.
- **`schedulePublisher` (Modifiée)** : Support multi-plateforme complet (IG + FB + YT).

## Definition of Done
- [ ] Le bouton "Connecter YouTube" est présent dans le profil.
- [ ] Le flow OAuth Google fonctionne (redirect -> callback -> token stocké).
- [ ] La Cloud Function `publishToYouTube` est déployée.
- [ ] Le toggle YouTube est présent dans le `PublishSheet`.
- [ ] Une vidéo est publiée avec succès comme YouTube Short (format 9:16, < 60s).
- [ ] La description YouTube contient l'URL Wix cliquable.

## Prompt one shot pour Claude Code

```markdown
# Milestone 11 — YouTube Shorts Integration

## Contexte
Mon Acupunctrice Hub publie sur Instagram (M07) et Facebook (M10).
YouTube Shorts est une nouvelle plateforme — même fichier MP4 9:16,
mais OAuth Google séparé (pas Meta). Les Shorts apparaissent dans
Google Search → SEO long terme pour Judith.

## Fichiers à lire AVANT de commencer
- `components/features/profile/InstagramConnectButton.tsx` → pattern OAuth UI (réutiliser)
- `app/api/auth/instagram/` → pattern OAuth routes (adapter pour Google)
- `functions/src/facebook.ts` → pattern Cloud Function publication
- `functions/src/scheduler.ts` → scheduler multi-plateforme (M10)
- `components/features/publish/PublishSheet.tsx` → toggles plateformes
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` → stratégie YouTube (description, tags, quota)

## Livrables
- [ ] `app/api/auth/youtube/route.ts` — redirect OAuth Google :
      Scopes: youtube.upload, youtube.readonly
      access_type=offline (pour obtenir refresh_token permanent)
      prompt=consent
- [ ] `app/api/auth/youtube/callback/route.ts` — callback :
      1. Échange code → access_token + refresh_token
      2. GET youtube/v3/channels?part=snippet&mine=true → channelId, channelName
      3. Stocke refresh_token dans users/{userId}/private/tokens
      4. Stocke channelId, channelName sur users/{userId}
      5. Redirect vers /profil?connected=youtube
- [ ] `components/features/profile/YouTubeConnectButton.tsx` — même pattern que Instagram :
      - Déconnecté : bouton "Connecter YouTube"
      - Connecté : "Chaîne: [nom]" (pas d'expiration — refresh_token permanent)
- [ ] `functions/src/youtube.ts` — Cloud Function `publishToYouTube` :
      1. Lire refresh_token depuis users/{userId}/private/tokens
      2. Obtenir access_token frais via Google OAuth refresh
      3. Télécharger vidéo depuis Firebase Storage
      4. Resumable upload vers YouTube Data API v3
      5. Metadata: title, description (caption + URL Wix + #Shorts),
         tags, categoryId='26', privacyStatus='public', madeForKids=false
      6. Update Firestore: youtubeStatus, youtubeVideoId
      Dépendance: `googleapis` npm package dans functions/
- [ ] Modifier `PublishSheet.tsx` — toggle YouTube (même pattern que Facebook)
- [ ] Modifier `scheduler.ts` — support 3 plateformes (IG + FB + YT)
- [ ] `app/api/publish-youtube/route.ts` — wrapper Cloud Function
- [ ] Secrets Firebase: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

## Quota YouTube à documenter
10 000 units/jour. 1 upload ≈ 1600 units → max ~6/jour.
Judith (3/semaine) = largement suffisant.
Si quota dépassé → youtubeStatus='quota_exceeded', retry lendemain.

## Contraintes
- Google refresh_token est permanent (pas de refresh cron nécessaire)
- Description YouTube doit inclure URL Wix cliquable (pas "lien en bio")
- Heroicons, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] Flow OAuth Google fonctionne
- [ ] Vidéo publiée comme YouTube Short (< 60s, 9:16)
- [ ] Description contient URL Wix cliquable + #Shorts
- [ ] Scheduler gère les 3 plateformes indépendamment
```
