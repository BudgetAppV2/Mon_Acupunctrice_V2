# Analyse S03 — Stories Instagram API

## Complexite reelle : Moyen

Le plus gros risque est la Cloud Function existante. Si elle ne supporte pas `media_type=STORIES`, on doit soit la modifier soit reimplementer la publication IG inline dans Next.js.

## Fichiers a modifier — Analyse detaillee

### app/api/publish/route.ts (actuellement 32 lignes)
- **Ce qui existe :** Proxy simple vers la Cloud Function `publishToInstagram`. Passe `{ videoUrl, caption, itemId, coverOption, thumbOffset, coverUrl }`.
- **Ce qui change :** Ajouter `mediaType: 'REELS' | 'STORIES'` au payload. Si la CF ne le supporte pas, creer une route alternative `/api/publish-story/route.ts` qui appelle l'API Graph directement (meme pattern que publish-facebook).
- **Risque de depasser 150 lignes :** Non (32 lignes, meme avec ajouts).

### app/api/cron/publish/route.ts (actuellement 171 lignes)
- **Ce qui existe :** Publie les items schedules sur IG/FB/YT. IG passe par la CF.
- **Ce qui change :** Ajouter la detection de `format === 'story'` (depuis le CalendarSlot lie). Si story → appeler l'API Graph directement avec `media_type=STORIES` au lieu de passer par la CF.
- **Risque de depasser 150 lignes :** Deja a 171. Il faut extraire les helpers de publication dans un fichier utilitaire.
- **Plan de decoupage :** Extraire `publishInstagram()`, `publishFacebook()`, `publishYouTube()` dans `lib/utils/publishHelpers.ts`. Le cron n'a plus que l'orchestration (~80 lignes).

### components/features/publish/PublishSheet.tsx (actuellement 149 lignes)
- **Ce qui existe :** Wizard 3 etapes + toggles plateformes.
- **Ce qui change :** Ajouter "Story Instagram" comme option. Quand story selectionnee : masquer la caption (pas de caption pour les stories), ajuster le flow.
- **Risque de depasser 150 lignes :** OUI (deja a 149).
- **Plan de decoupage :** Extraire la logique `handlePublish` dans un hook `useMultiPlatformPublish()`. PublishSheet ne garde que l'UI.

### components/features/publish/PlatformToggles.tsx (actuellement 47 lignes)
- **Ce qui existe :** Toggles Facebook + YouTube.
- **Ce qui change :** Ajouter toggle "Story Instagram" (si IG connecte). ~15 lignes.
- **Risque de depasser 150 lignes :** Non (47 + 15 = ~62).

### lib/types/index.ts
- **Ce qui change :** Ajouter `storyStatus?: 'pending' | 'published' | 'failed'` et `storyMediaId?: string` sur ContentItem.

## Fichiers a creer

### app/api/publish-story/route.ts
- **Role :** Publication Stories Instagram via API Graph directe (pas la CF). Meme pattern que publish-facebook.
- **Flow :** 1) POST /{ig-user-id}/media avec media_type=STORIES + image_url ou video_url 2) POST /{ig-user-id}/media_publish avec creation_id.
- **Pattern a suivre :** `app/api/publish-facebook/route.ts`.
- **Estimation lignes :** ~70 lignes.

### lib/utils/storyImageGenerator.ts
- **Role :** Genere une image 1080x1920 pour les stories automatiques (S04). Fond colore + titre en gros + CTA. Utilise Canvas API cote client ou `@vercel/og` (Satori) cote serveur.
- **Estimation lignes :** ~50 lignes.

### lib/utils/publishHelpers.ts
- **Role :** Fonctions `publishInstagram()`, `publishFacebook()`, `publishYouTube()` extraites du cron. Reutilisables par le cron ET par les routes individuelles.
- **Estimation lignes :** ~120 lignes (les 3 fonctions combinees).

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
// Sur ContentItem — ajouter :
storyStatus?: 'pending' | 'published' | 'failed';
storyMediaId?: string;
mediaType?: 'reel' | 'story';  // distinguer le type de publication IG
```

### Nouveaux index Firestore
- Aucun requis.

### Nouvelles security rules
- Aucune.

## Decisions architecturales a prendre

1. **CF publishToInstagram vs API Graph directe :**
   - Option A : Modifier la Cloud Function pour accepter `media_type`
   - Option B : Appeler l'API Graph directement depuis une API route Next.js (comme FB/YT)
   - **Recommandation : Option B** — on a deja le pattern pour FB et YT, et ca evite de toucher aux Cloud Functions. Le token Meta est deja dans Firestore (Admin SDK). Il faut juste lire le `metaAccessToken` et appeler `graph.facebook.com/v25.0/{ig-user-id}/media`.

2. **Stories dans PublishSheet — flow separe ou toggle :**
   - Option A : Toggle dans PlatformToggles (comme FB/YT)
   - Option B : Un flow de publication Story separe
   - **Recommandation : Option A pour les stories manuelles**, Option B pour les stories auto (S04). Le toggle "Story IG" dans PlatformToggles permet de publier une story en plus du Reel.

## Risques et bloqueurs potentiels

- **Token Meta pour les Stories :** L'API Instagram Stories utilise le meme token que les Reels (`metaAccessToken`). Pas de nouveau token requis. Mais il faut le scope `instagram_business_content_publish` qui est DEJA present (M09).
- **Stories images :** Pour S04 (stories auto), on genere des images. Sur Vercel Hobby, la limite de taille de reponse est 4.5MB et le timeout est 60s. Une image 1080x1920 JPEG fait ~200KB → OK.
- **Stories video :** Max 60 secondes. Les Reels de Judith font generalement < 60s → OK.

## Impact sur les autres milestones
- S04 depend directement de S03 pour publier les stories automatiques
- Le cron doit etre refactorise (extraction publishHelpers) — beneficie aussi au code existant
- PlatformToggles evolue pour supporter un 3e toggle
