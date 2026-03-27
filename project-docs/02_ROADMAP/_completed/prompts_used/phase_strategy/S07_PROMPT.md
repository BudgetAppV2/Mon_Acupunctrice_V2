# Milestone S07 — Encouragement & progression

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00-S06 sont completes. Les slots du calendrier (S02) fonctionnent, les
ContentStyle existent (S01). On ajoute un **systeme d'encouragement visuel** :
cercle de progression, compteur de series, jalons. Style fitness tracker,
pas gamification.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Firestore, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/hooks/usePublish.ts` → 76 lignes, hook publication (ou mettre le trigger progression)
- `lib/hooks/useCalendarSlots.ts` → hook slots (post-S02), pour calculer X/Y de la semaine
- `components/features/calendar/DashboardBar.tsx` → ~80 lignes post-S02, resume semaine
- `app/(app)/profil/page.tsx` → 128 lignes, page profil (ou mettre les jalons)
- `app/api/cron/publish/route.ts` → cron (ou mettre l'increment server-side)
- `lib/hooks/useUserProfile.ts` → hook user doc (pattern onSnapshot)

---

## Livrable 1 — Data model et definitions

### Modifier `lib/types/index.ts`

Ajouter :
```typescript
export interface ProgressData {
  currentStreak: number;
  longestStreak: number;
  totalPublished: number;
  milestonesUnlocked: string[];
  lastActiveWeek: string;  // "2026-W15" format ISO
  pendingMilestoneToasts: string[];  // Jalons non encore affiches
}
```

### Creer `lib/data/milestones.ts`

```typescript
export interface MilestoneDefinition {
  id: string;
  label: string;
  description: string;
  icon: 'fire' | 'star' | 'trophy' | 'rocket' | 'heart';
  check: (data: { totalPublished: number; currentStreak: number }) => boolean;
}

export const MILESTONES: MilestoneDefinition[] = [
  { id: 'first_pub', label: 'Premiere publication', description: 'Ta premiere publication via le Hub', icon: 'rocket', check: d => d.totalPublished >= 1 },
  { id: 'pub_10', label: '10 publications', description: '10 publications via le Hub', icon: 'star', check: d => d.totalPublished >= 10 },
  { id: 'pub_25', label: '25 publications', description: '25 publications!', icon: 'trophy', check: d => d.totalPublished >= 25 },
  { id: 'streak_4', label: '4 semaines', description: '4 semaines consecutives de publication', icon: 'fire', check: d => d.currentStreak >= 4 },
  { id: 'streak_8', label: '8 semaines', description: '8 semaines consecutives!', icon: 'fire', check: d => d.currentStreak >= 8 },
];
```

---

## Livrable 2 — Hook useProgression

### Creer `lib/hooks/useProgression.ts`

```typescript
export function useProgression() {
  // 1. Lire progressData depuis users/{uid} (onSnapshot, meme pattern que useUserProfile)
  // 2. updateProgression() :
  //    - FieldValue.increment(1) pour totalPublished
  //    - Calculer la semaine ISO courante (America/Toronto)
  //    - Si lastActiveWeek !== semaine courante → mettre a jour lastActiveWeek
  //    - Calculer currentStreak :
  //      Si lastActiveWeek === semaine precedente → currentStreak += 1
  //      Sinon si lastActiveWeek === semaine courante → pas de changement
  //      Sinon → currentStreak = 1 (nouvelle serie)
  //    - longestStreak = Math.max(longestStreak, currentStreak)
  //    - Verifier les jalons : pour chaque milestone non dans milestonesUnlocked,
  //      tester check(). Si debloque → ajouter a milestonesUnlocked + pendingMilestoneToasts
  // 3. consumeToast() : retire le premier element de pendingMilestoneToasts
  // Retourne { progressData, updateProgression, pendingToast, consumeToast, loading }
}
```

**Calcul semaine ISO (America/Toronto) :**
```typescript
function getCurrentWeek(): string {
  const now = new Date();
  // Convertir en timezone Montreal
  const mtl = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
  const jan1 = new Date(mtl.getFullYear(), 0, 1);
  const days = Math.floor((mtl.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${mtl.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

Estimation : ~90 lignes.

---

## Livrable 3 — Cercle de progression

### Creer `components/features/calendar/ProgressionCircle.tsx`

Cercle SVG anime (style Apple Watch).

Props : `completed: number`, `total: number`.
- SVG viewBox 36x36, stroke-dasharray pour le cercle
- Gris si 0%, sage si en cours, vert si 100%
- Texte "X/Y" au centre
- Animation CSS transition sur stroke-dashoffset

Estimation : ~45 lignes.

---

## Livrable 4 — Integrer dans le calendrier

### Modifier `components/features/calendar/DashboardBar.tsx` (~80 → ~100 lignes)

Ajouter le ProgressionCircle et le badge de serie.

Layout : `[ProgressionCircle] [Resume semaine] [Badge serie]`

Le badge serie : si `currentStreak > 0`, afficher un petit badge
avec FireIcon + nombre. Si streak === 0, ne rien afficher (pas de message negatif).

### Modifier `lib/hooks/usePublish.ts` (76 → ~86 lignes)

Apres `publish()` reussie, appeler `updateProgression()` depuis useProgression.
Import et appel a la fin du try block, apres updateItem.

### Modifier `app/api/cron/publish/route.ts`

Apres publication reussie dans la boucle, incrementer `progressData.totalPublished` :
```typescript
await db.doc(`users/${userId}`).update({
  'progressData.totalPublished': FieldValue.increment(1),
  'progressData.lastActiveWeek': getCurrentWeek(),
});
```

---

## Livrable 5 — Jalons dans le profil

### Creer `components/features/profile/MilestonesList.tsx`

Grille de jalons. Jalons debloques en couleur, verrouilles en gris.
Chaque jalon : icone + label + description.

Estimation : ~50 lignes.

### Modifier `app/(app)/profil/page.tsx` (128 → ~143 lignes)

Ajouter `<MilestonesList milestones={progressData?.milestonesUnlocked || []} />`
entre les categories custom et les publications recentes.

---

## Livrable 6 — Toast de jalons

Dans le layout principal `app/(app)/layout.tsx` ou dans DashboardBar :
si `pendingToast` existe, afficher un toast (3 sec, vert, avec le label du jalon).
Appeler `consumeToast()` apres affichage.

Les jalons declenches par le cron (publications auto) apparaissent a la
prochaine ouverture de l'app via `pendingMilestoneToasts`.

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Sauvegarder via FieldValue.increment (atomic) cote serveur
- AUCUN message negatif si Judith saute une semaine
- La serie repart a 1 silencieusement (pas "tu as perdu ta serie!")
- Ne PAS modifier les Cloud Functions existantes

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] ProgressData type existe dans types/index.ts
- [ ] useProgression hook lit et met a jour progressData
- [ ] Le cercle de progression affiche X/Y pour la semaine courante
- [ ] Le badge de serie affiche le nombre de semaines (si > 0)
- [ ] Un jalon debloque un toast a sa premiere occurrence
- [ ] Les jalons sont visibles dans le profil
- [ ] La publication manuelle incremente totalPublished
- [ ] Le cron incremente totalPublished cote serveur
- [ ] Aucun message negatif n'apparait si streak revient a 0
