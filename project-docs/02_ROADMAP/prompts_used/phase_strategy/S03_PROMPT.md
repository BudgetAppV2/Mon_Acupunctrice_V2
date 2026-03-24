# Milestone S03 — Stories Instagram API

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00 (refactoring) et S01 (styles) sont completes. Les helpers de publication
sont dans `lib/utils/publishHelpers.ts`. On ajoute la publication de
**Stories Instagram** via l'API Graph Meta (media_type=STORIES).
On ne modifie PAS la Cloud Function existante — on appelle l'API directement.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Admin SDK, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/utils/publishHelpers.ts` → helpers publication IG/FB/YT (post-S00)
- `app/api/cron/publish/route.ts` → cron publication (post-S00, ~80 lignes)
- `app/api/publish-facebook/route.ts` → pattern publication directe via API Graph
- `components/features/publish/PlatformToggles.tsx` → 47 lignes, toggles FB/YT
- `components/features/publish/PublishSheet.tsx` → 149 lignes, wizard publication
- `lib/hooks/usePublish.ts` → 76 lignes, hook publication
- `lib/firebase-admin.ts` → Firebase Admin SDK (lecture tokens)

---

## Livrable 1 — Route API publish-story

### Creer `app/api/publish-story/route.ts`

Publication Stories Instagram via l'API Graph directe (pas la Cloud Function).
Meme pattern que `publish-facebook/route.ts`.

**Flow :**
```
POST /api/publish-story
body: { itemId, uid }

1. Lire contentItem, user, tokens depuis Firestore (Admin SDK)
2. Lire metaAccessToken depuis users/{uid}/private/tokens
3. Lire metaInstagramId depuis users/{uid}
4. Determiner le type de media :
   - Si videoUrl existe → video_url + media_type=STORIES
   - Si coverImageUrl existe (story image) → image_url + media_type=STORIES
5. POST https://graph.facebook.com/v25.0/{igUserId}/media
   body: { media_type: 'STORIES', video_url (ou image_url), access_token }
   → retourne creation_id
6. POST https://graph.facebook.com/v25.0/{igUserId}/media_publish
   body: { creation_id, access_token }
   → retourne id
7. Update contentItem : storyStatus='published', storyMediaId
```

Estimation : ~75 lignes.

### Ajouter dans `lib/utils/publishHelpers.ts`

```typescript
export async function publishInstagramStory(
  item: Record<string, unknown>,
  igUserId: string,
  accessToken: string,
): Promise<string | null> {
  // Meme logique que la route, reutilisable par le cron
}
```

---

## Livrable 2 — Toggle Story dans PlatformToggles

### Modifier `components/features/publish/PlatformToggles.tsx` (47 → ~65 lignes)

Ajouter un 3e toggle "Story Instagram" entre le toggle Facebook et YouTube.
Visible seulement si Instagram est connecte (metaStatus === 'connected').

```typescript
interface Props {
  facebookPageId: string | null;
  youtubeChannelId: string | null;
  metaStatus: string | null;  // NOUVEAU
  alsoFacebook: boolean;
  alsoYoutube: boolean;
  alsoStory: boolean;          // NOUVEAU
  onToggleFacebook: () => void;
  onToggleYoutube: () => void;
  onToggleStory: () => void;   // NOUVEAU
}
```

---

## Livrable 3 — Integrer dans PublishSheet

### Modifier `components/features/publish/PublishSheet.tsx` (~149 lignes)

Ajouter l'etat `alsoStory` et le passer a PlatformToggles.
Dans `handlePublish` (ou le hook equivalent), si `alsoStory && uid` :
appeler `/api/publish-story` en parallele avec les autres plateformes
(meme pattern que Facebook/YouTube avec `publishToApi`).

Lire `metaStatus` depuis `useUserProfile()` (deja importe).

**Attention :** PublishSheet est a 149 lignes. L'ajout de `alsoStory` + state
represente ~5 lignes. Total ~154. Si ca depasse 150, extraire `handlePublish`
dans un hook `useMultiPlatformPublish()`.

---

## Livrable 4 — Support dans le cron

### Modifier `app/api/cron/publish/route.ts` (~80 lignes post-S00)

Dans la boucle de publication, ajouter :
```typescript
// Story IG (si connecte et item a un mediaType === 'story')
if (user.metaInstagramId && tokens.metaAccessToken && item.mediaType === 'story') {
  try {
    const storyId = await publishInstagramStory(item, user.metaInstagramId, tokens.metaAccessToken);
    updates.storyStatus = 'published';
    updates.storyMediaId = storyId;
  } catch { updates.storyStatus = 'failed'; }
}
```

**Rappel contrainte Vercel Hobby :** Le cron s'execute 1x/jour max, precision ±59 min, timeout 60 sec.

---

## Livrable 5 — Types

### Modifier `lib/types/index.ts`

Ajouter sur ContentItem :
```typescript
storyStatus?: 'pending' | 'published' | 'failed';
storyMediaId?: string;
mediaType?: 'reel' | 'story';
```

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes (verifier le comptage)
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS ajouter de features non mentionnees dans ce prompt
- Cron Vercel Hobby : 1x/jour max, ±59 min precision, 60s timeout

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] `/api/publish-story` existe et publie une Story IG via l'API Graph
- [ ] `publishInstagramStory` helper existe dans publishHelpers.ts
- [ ] PlatformToggles affiche le toggle "Story Instagram" si IG connecte
- [ ] PublishSheet passe `alsoStory` a PlatformToggles
- [ ] La publication Story est appelee en parallele des autres plateformes
- [ ] Le cron supporte la publication de stories (mediaType === 'story')
- [ ] Les types `storyStatus`, `storyMediaId`, `mediaType` existent sur ContentItem
