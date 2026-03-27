# Milestone S04 — Sequences blogue

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00-S03, S02 et S05 sont completes. Les slots (calendarSlots) existent,
les Stories IG sont publiables, les captions sont optimisees par plateforme.
Quand Judith entre un lien d'article de blogue, le Hub cree automatiquement
une **sequence de contenus derives** : stories auto + slots de Reels.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Firestore/Storage, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/types/index.ts` → Types CalendarSlot, ContentStyle, SlotStatus (post-S02)
- `lib/utils/calendarSlots.ts` → generateWeekSlots pattern (post-S02)
- `lib/utils/publishHelpers.ts` → publishInstagramStory (post-S03)
- `app/api/cron/publish/route.ts` → cron publication (~80 lignes post-S00)
- `components/features/calendar/CalendarView.tsx` → ~140 lignes post-S02
- `components/features/calendar/CalendarHeader.tsx` → ~41 lignes post-S02
- `components/features/calendar/CalendarDay.tsx` → ~112 lignes post-S02
- `firestore.rules` → Rules actuelles (inclut calendarSlots)

---

## Livrable 1 — Data model et scraping

### Modifier `lib/types/index.ts`

Ajouter :
```typescript
export interface BlogSequence {
  id: string;
  userId: string;
  blogUrl: string;
  blogTitle: string;
  blogImageUrl?: string;
  storyImageUrl?: string;
  startDate: Timestamp;
  status: 'active' | 'completed';
  slotIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Modifier `firestore.rules`

Ajouter :
```javascript
match /blogSequences/{seqId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
}
```

### Creer `app/api/scrape-og/route.ts`

Endpoint serverless qui fetch une URL et extrait les meta OG tags.

```
GET /api/scrape-og?url=https://...
1. Fetch l'URL avec un User-Agent navigateur
2. Parser le HTML pour extraire og:title, og:image, og:description
3. Retourner { title, imageUrl, description }
4. Si echec → retourner { title: '', imageUrl: '', description: '' }
```

Estimation : ~45 lignes.

---

## Livrable 2 — Generateur d'image story

### Creer `lib/utils/storyImageGenerator.ts`

Genere une image 1080x1920 pour les stories automatiques.
Utilise Canvas API cote client (appele dans le hook, pas dans le cron).

```typescript
export async function generateStoryImage(
  title: string, type: 'promo' | 'rappel'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;

  // Fond sage (#87A878)
  ctx.fillStyle = '#87A878';
  ctx.fillRect(0, 0, 1080, 1920);

  // Titre en blanc, centre
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px Inter, sans-serif';
  ctx.textAlign = 'center';
  // Word wrap le titre sur plusieurs lignes
  wrapText(ctx, title, 540, 700, 900, 80);

  // CTA
  ctx.font = '40px Inter, sans-serif';
  const cta = type === 'promo'
    ? 'Nouvel article! Lien dans ma bio'
    : 'Tu as manque cet article?';
  ctx.fillText(cta, 540, 1300);

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9));
}
```

L'image est uploadee vers Firebase Storage (`stories/{userId}/{timestamp}.jpg`)
et l'URL est stockee sur le CalendarSlot (`storyImageUrl` — utiliser un champ
sur le slot ou sur la BlogSequence).

Estimation : ~50 lignes.

---

## Livrable 3 — Hook useBlogSequence

### Creer `lib/hooks/useBlogSequence.ts`

```typescript
export function useBlogSequence() {
  // scrapeOg(url) → appelle /api/scrape-og
  // createSequence(blogUrl, blogTitle, startDate) →
  //   1. Generer l'image story promo (Canvas)
  //   2. Uploader vers Storage
  //   3. Creer 4 CalendarSlots via batch write :
  //      - J+0 : story_promo, autoPublish=true, format='story'
  //      - J+1 : reel_resume, format='reel', promptTitle="Resume l'article en 30-60 sec"
  //      - J+3 : reel_pratique, format='reel', promptTitle="UN conseil concret de l'article"
  //      - J+7 : story_rappel, autoPublish=true, format='story'
  //   4. Creer le doc BlogSequence avec slotIds
  // Retourne { scrapeOg, createSequence, loading, error }
}
```

Les slots de sequence sont independants du plan-cadre (S02). Ils s'inserent
aux dates calculees, meme si un slot du plan existe deja le meme jour.

Estimation : ~80 lignes.

---

## Livrable 4 — UI CreateSequenceSheet

### Creer `components/features/calendar/CreateSequenceSheet.tsx`

BottomSheet accessible depuis un bouton dans CalendarHeader.

**Flow :**
1. Champ URL (paste un lien)
2. Bouton "Analyser" → appelle scrapeOg → affiche titre + image
3. Apercu de la sequence (4 lignes avec dates et roles)
4. Bouton "Creer la sequence" → appelle createSequence

Estimation : ~100 lignes.

### Modifier `components/features/calendar/CalendarHeader.tsx` (~41 → ~50 lignes)

Ajouter un petit bouton PlusIcon ou BookOpenIcon a droite qui ouvre
CreateSequenceSheet.

### Modifier `components/features/calendar/CalendarDay.tsx` (~112 → ~122 lignes)

Si un slot a `sequenceRole`, afficher un petit badge avec le numero dans
la sequence (ex: "1/4"). Utiliser la position dans BlogSequence.slotIds.

---

## Livrable 5 — Stories auto dans le cron

### Modifier `app/api/cron/publish/route.ts`

Ajouter une 2e query APRES la publication des contentItems :

```typescript
// Query les slots auto-publish
const autoSlots = await db.collection('calendarSlots')
  .where('autoPublish', '==', true)
  .where('status', '==', 'open')
  .where('scheduledDate', '<=', now)
  .limit(5)
  .get();

for (const slotDoc of autoSlots.docs) {
  const slot = slotDoc.data();
  // Lire le user + tokens
  // Publier la story via publishInstagramStory (image_url du slot)
  // Mettre a jour le slot : status → 'completed'
}
```

**Rappel contrainte Vercel Hobby :** 1x/jour max, ±59 min precision, 60 sec timeout.
Pre-generer les images au moment de la creation (pas dans le cron).

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS ajouter de features non mentionnees
- Les images story sont pre-generees (Canvas API client), pas dans le cron
- Cron Vercel Hobby : 1x/jour max, ±59 min precision, 60 sec timeout

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] BlogSequence type et rules Firestore existent
- [ ] `/api/scrape-og` extrait titre + image d'une URL
- [ ] `generateStoryImage` produit une image 1080x1920 avec titre + CTA
- [ ] `useBlogSequence` cree 4 slots lies a une sequence
- [ ] CreateSequenceSheet permet de coller un lien et creer la sequence
- [ ] Les 4 elements apparaissent dans le calendrier aux bonnes dates
- [ ] Les slots de sequence ont un badge "1/4", "2/4", etc.
- [ ] Le cron publie les stories auto (autoPublish=true) via l'API IG
- [ ] Les slots story auto passent a "completed" apres publication
