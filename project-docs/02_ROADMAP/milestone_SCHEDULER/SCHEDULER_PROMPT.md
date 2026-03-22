# Milestone SCHEDULER — Publication automatique planifiée (Vercel Cron)

## Objectif
Quand Judith planifie une publication (scheduledAt dans Firestore),
le scheduler publie automatiquement sur les plateformes activées
à l'heure prévue. Sans cette feature, "Planifier" est juste un
rappel visuel dans le calendrier.

## Stack
Next.js 15 App Router, Vercel Cron Jobs, Firebase Admin SDK,
API routes existantes pour la publication.

## Fichiers à lire AVANT de commencer
- `app/api/publish/route.ts` → publication Instagram
- `app/api/publish-facebook/route.ts` → publication Facebook
- `app/api/publish-youtube/route.ts` → publication YouTube
- `lib/firebase-admin.ts` → Firebase Admin SDK
- `lib/types/index.ts` → ContentItem type (scheduledAt, distributionStatus)
- `lib/hooks/usePublish.ts` → ce que schedule() sauvegarde dans Firestore

## Architecture

```
Vercel Cron (toutes les 5 minutes)
  → GET /api/cron/publish
  → Query Firestore : distributionStatus === 'scheduled' AND scheduledAt <= now
  → Pour chaque item trouvé :
    1. Marquer distributionStatus = 'publishing'
    2. Publier sur Instagram (toujours)
    3. Si facebookPageId → publier sur Facebook
    4. Si youtubeChannelId → publier sur YouTube
    5. Marquer distributionStatus = 'published' ou 'failed'
```

## Livrables

### 1. vercel.json — Configuration Cron
- [ ] Créer `vercel.json` à la racine du projet :
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "0 * * * *"
    }
  ]
}
```
Toutes les heures (plan Hobby Vercel). Judith planifie à l'heure près.
Le cron publie les items dont scheduledAt est dans la dernière heure.

### 2. API Route Cron — /api/cron/publish
- [ ] `app/api/cron/publish/route.ts`

**Sécurité :** Vérifier que la requête vient de Vercel :
```typescript
export async function GET(request: NextRequest) {
  // Sécurité : vérifier le header User-Agent ou CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

**Logique :**
```typescript
1. Query Firestore (Admin SDK) :
   contentItems WHERE distributionStatus == 'scheduled'
                AND scheduledAt <= Timestamp.now()
   LIMIT 10 (batch de 10 max par exécution)

2. Pour chaque item :
   a. Lire le user doc (userId) pour obtenir les tokens et connexions
   b. Lire les tokens depuis users/{userId}/private/tokens

   c. Marquer distributionStatus = 'publishing'

   d. INSTAGRAM (toujours) :
      - Appeler la même logique que /api/publish (POST interne)
      - OU dupliquer la logique inline (plus fiable pour un cron)
      - Params : { videoUrl, caption, coverOption, thumbOffset, coverUrl }
      Note : l'API Instagram Publication nécessite le token Meta
      
   e. FACEBOOK (si user.facebookPageId existe) :
      - Lire facebookPageAccessToken depuis tokens
      - Appeler la logique de /api/publish-facebook inline
      - Init upload → upload vidéo → publish
      
   f. YOUTUBE (si user.youtubeChannelId existe) :
      - Lire youtubeRefreshToken depuis tokens
      - Refresh access_token
      - Resumable upload vers YouTube
      
   g. Mettre à jour le contentItem :
      - distributionStatus = 'published' (si au moins Instagram OK)
      - publishedAt = serverTimestamp()
      - instagramPostId (si success)
      - facebookStatus = 'published'/'failed'
      - youtubeStatus = 'published'/'failed'

3. Retourner un résumé :
   { processed: 3, published: 2, failed: 1 }
```

**Important — la publication Instagram :**
Actuellement `/api/publish` fait le proxy vers la Cloud Function.
Le cron doit faire la MÊME chose. Soit :
- Appeler `/api/publish` via fetch interne (simple mais ajoute un hop)
- Dupliquer la logique de publication Instagram inline (plus fiable)

L'option 2 est recommandée : dupliquer la logique inline.
Lire le code de `/api/publish/route.ts` pour comprendre le flow Instagram :
1. Upload vidéo via Container API ou Direct Publish
2. Attendre le processing
3. Publier le container

### 3. Variable d'environnement CRON_SECRET
- [ ] Générer un secret aléatoire : `openssl rand -hex 32`
- [ ] Ajouter dans `.env.local` : `CRON_SECRET=...`
- [ ] Ajouter dans Vercel : Settings → Environment Variables → `CRON_SECRET`
- [ ] Vercel envoie automatiquement le CRON_SECRET en Bearer token

### 4. Modifier le PublishSheet/schedule
- [ ] Vérifier dans `lib/hooks/usePublish.ts` que `schedule()` sauvegarde
  les infos nécessaires pour le cron :
  - `distributionStatus: 'scheduled'`
  - `scheduledAt: Timestamp`
  - `caption: string`
  - `coverOption, thumbOffset, coverUrl`
  - `videoUrl` (déjà sur l'item après l'export)
  
  Le cron a besoin de TOUTES ces infos pour publier sans intervention.

### 5. Modifier le ContentItem type (si nécessaire)
- [ ] Vérifier que `publishedAt` existe dans le type
- [ ] Ajouter `publishPlatforms?: string[]` si on veut stocker
  sur quelles plateformes publier (sinon le cron publie partout)

### 6. Optionnel — Sélection de plateformes à la planification
Actuellement quand Judith planifie, elle ne choisit pas les plateformes.
Le cron publierait sur TOUTES les plateformes connectées.
Option : ajouter les toggles de plateforme dans le SchedulePicker
et sauvegarder `scheduledPlatforms: ['instagram', 'facebook', 'youtube']`
dans le contentItem. Le cron vérifie ce champ.

## Gestion des erreurs
- Si Instagram échoue → distributionStatus = 'failed', ne pas tenter les autres
- Si Facebook/YouTube échoue → marquer leur status comme 'failed' mais
  garder distributionStatus = 'published' (Instagram a réussi)
- Log les erreurs dans la réponse du cron (Vercel Logs)
- Pas de retry automatique — Judith voit le status 'failed' et peut republier

## Contraintes
- Vercel Hobby plan : cron toutes les heures minimum (0 * * * *)
  Le cron publie les items dont scheduledAt <= maintenant
- Max 10 items par exécution (éviter les timeouts)
- Timeout Vercel serverless : 60 secondes (hobby) / 300 secondes (pro)
- NE PAS utiliser de Cloud Functions — tout en API routes Next.js
- Heroicons uniquement, 0 console.log en production
- Composants < 150 lignes

## Definition of Done
- [ ] npm run build passe
- [ ] vercel.json avec le cron configuré
- [ ] /api/cron/publish sécurisé avec CRON_SECRET
- [ ] Les items schedulés sont publiés automatiquement
- [ ] Publication multi-plateforme (IG + FB + YT selon connexions)
- [ ] distributionStatus mis à jour correctement
- [ ] Erreurs gérées sans crash
