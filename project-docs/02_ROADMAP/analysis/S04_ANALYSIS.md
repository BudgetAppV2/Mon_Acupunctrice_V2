# Analyse S04 — Sequences blogue

## Complexite reelle : Gros

Le plus complexe de la phase. Touche au data model (nouvelle collection), au calendrier, au cron, et ajoute le scraping + generation d'images.

## Fichiers a modifier — Analyse detaillee

### app/api/cron/publish/route.ts (apres refactoring S03 : ~80 lignes)
- **Ce qui existe (post-S03) :** Orchestrateur leger qui appelle les helpers.
- **Ce qui change :** Ajouter une 2e query : `calendarSlots` avec `autoPublish === true && status === 'open' && scheduledDate <= now`. Pour chaque slot auto, generer l'image story et publier via `publishStory()`.
- **Risque de depasser 150 lignes :** Si le cron est deja refactorise (S03), ~80 + ~30 = ~110. OK.

### components/features/calendar/CalendarView.tsx (actuellement 120 lignes, post-S02 ~145)
- **Ce qui existe (post-S02) :** Grille + 3 bottom sheets + generation de slots.
- **Ce qui change :** Ajouter un bouton "Nouvelle sequence" (dans le header ou via FAB). Ouvrir CreateSequenceSheet.
- **Risque de depasser 150 lignes :** Tres juste. Le bouton est ~5 lignes, mais si post-S02 on est a 145, ca fait 150.
- **Plan :** Mettre le bouton dans CalendarHeader plutot que CalendarView.

### components/features/calendar/CalendarDay.tsx (post-S02 ~112 lignes)
- **Ce qui existe (post-S02) :** Rendu items + slots fantomes.
- **Ce qui change :** Les slots de sequence ont un badge "1/4", "2/4" etc. Ajouter un rendu conditionnel si `slot.sequenceRole` existe. ~10 lignes.
- **Risque de depasser 150 lignes :** Non (112 + 10 = ~122).

### components/features/calendar/CalendarHeader.tsx (actuellement 31 lignes)
- **Ce qui existe :** Mois/annee + boutons prev/next.
- **Ce qui change :** Ajouter un petit bouton "+" ou menu pour "Nouvelle sequence". ~10 lignes.
- **Risque de depasser 150 lignes :** Non (31 + 10 = ~41).

## Fichiers a creer

### app/api/scrape-og/route.ts
- **Role :** Endpoint serverless qui fetch une URL et extrait les meta OG (title, image, description). Evite CORS cote client.
- **Pattern a suivre :** Meme pattern que les autres API routes (NextRequest/NextResponse).
- **Estimation lignes :** ~40 lignes.

### components/features/calendar/CreateSequenceSheet.tsx
- **Role :** BottomSheet ou on colle un lien de blogue. Affiche l'apercu (titre + image OG) + la sequence prevue (4 elements avec dates). Bouton "Creer la sequence".
- **Pattern a suivre :** PublishSheet (wizard simple).
- **Estimation lignes :** ~100 lignes.

### lib/hooks/useBlogSequence.ts
- **Role :** Hook qui orchestre : 1) appel scrape-og 2) batch write Firestore (1 BlogSequence + 4 CalendarSlots lies).
- **Pattern a suivre :** useCreateContentItem (batch write).
- **Estimation lignes :** ~70 lignes.

### lib/utils/storyImageGenerator.ts (si pas cree en S03)
- **Role :** Genere l'image de story promo (titre article + CTA) en 1080x1920.
- **Estimation lignes :** ~50 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
export interface BlogSequence {
  id: string;
  userId: string;
  blogUrl: string;
  blogTitle: string;
  blogImageUrl?: string;
  startDate: Timestamp;
  status: 'active' | 'completed';
  slotIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Champs deja prevus sur CalendarSlot (S02) :
// sequenceId?: string
// sequenceRole?: 'story_promo' | 'reel_resume' | 'reel_pratique' | 'story_rappel'
// autoPublish?: boolean
// promptTitle?: string
// promptDescription?: string
```

### Nouveaux index Firestore
```json
{
  "collectionGroup": "blogSequences",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

### Nouvelles security rules
```javascript
match /blogSequences/{seqId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
}
```

## Decisions architecturales a prendre

1. **Generation d'images stories — ou :**
   - Option A : Cote client (Canvas API) avant upload vers Storage → cron lit l'image
   - Option B : Cote serveur dans le cron (Satori/@vercel/og)
   - Option C : Pre-generer au moment de la creation de la sequence, stocker dans Storage
   - **Recommandation : Option C** — generer l'image dans `useBlogSequence.ts` au moment de la creation, l'uploader vers Firebase Storage, et stocker l'URL sur le CalendarSlot. Le cron n'a plus qu'a publier l'URL.

2. **Calcul des dates de sequence :**
   - J+0 : story promo (auto)
   - J+1 : slot reel resume
   - J+3 : slot reel pratique
   - J+7 : story rappel (auto)
   - Les jours tombent-ils sur les "bons" jours du plan-cadre ou on les insere librement? **Recommandation : inserer librement** — les sequences sont independantes du plan-cadre. Si un slot de sequence tombe le meme jour qu'un slot du plan-cadre, les deux s'affichent.

3. **Sequence "completed" — quand :**
   - Quand les 4 slots sont tous `completed` ou `skipped`. Verifier dans le cron ou dans un hook cote client.
   - **Recommandation :** Verifier cote client dans `useBlogSequence` quand un slot change de status.

## Risques et bloqueurs potentiels

- **Scraping OG tags :** Les sites Wix rendent les meta OG cote serveur (SSR), donc le scraping devrait fonctionner. Mais certains sites Wix ont des meta OG vides. **Mitigation :** Permettre a Judith d'editer le titre manuellement si le scraping echoue.
- **Timing du cron :** Le cron publie 1x/jour a midi UTC. Si Judith cree une sequence a 9h pour un article publie "aujourd'hui", la story promo partira a 8h le lendemain (pas le jour meme). **Mitigation :** Ajouter un bouton "Publier la story maintenant" dans le detail du slot auto.
- **Generation d'image :** Canvas API cote client fonctionne bien pour du texte simple sur fond colore. Mais les polices custom peuvent poser probleme. **Mitigation :** Utiliser Inter (deja dans le projet) comme police par defaut.

## Impact sur les autres milestones
- Depend de S02 (CalendarSlot) et S03 (publishStory)
- S08 doit afficher le lien visuel entre les slots de sequence
- Le cron est modifie — verifier que ca ne casse pas le publish existant
