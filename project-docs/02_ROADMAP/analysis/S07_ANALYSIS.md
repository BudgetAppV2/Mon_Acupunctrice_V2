# Analyse S07 — Encouragement & progression

## Complexite reelle : Moyen

La logique de calcul des series et jalons est la partie complexe. L'UI est relativement simple.

## Fichiers a modifier — Analyse detaillee

### app/(app)/profil/page.tsx (actuellement 128 lignes)
- **Ce qui existe :** Header utilisateur, grille stats (3 cartes), boutons plateforme, categories custom, publications recentes, bouton deconnexion.
- **Ce qui change :** Ajouter une section "Jalons" entre les categories et les publications. ~15 lignes de JSX.
- **Risque de depasser 150 lignes :** Possible (128 + 15 = ~143). OK mais serré.
- **Plan si depasse :** Extraire la section "Dernieres publications" dans un composant RecentPublications.tsx.

### components/features/calendar/DashboardBar.tsx (actuellement 37 lignes, post-S02 ~87 lignes)
- **Ce qui existe (post-S02) :** Resume de la semaine (X/Y slots completes).
- **Ce qui change :** Ajouter le cercle de progression SVG (Apple Watch style) et le badge de serie. Le cercle est un composant separe importe.
- **Risque de depasser 150 lignes :** Non si le cercle est un composant separe (~87 + 10 import/placement = ~97).

### lib/hooks/usePublish.ts (actuellement 76 lignes)
- **Ce qui existe :** `publish()` et `schedule()`.
- **Ce qui change :** Apres une publication reussie, appeler `updateProgression()` pour incrementer `totalPublished` et verifier les jalons.
- **Risque de depasser 150 lignes :** Non (76 + ~10 = ~86).

### app/api/cron/publish/route.ts (post-S03/S04 : ~110 lignes)
- **Ce qui existe :** Publie les items schedules.
- **Ce qui change :** Apres publication reussie, incrementer `progressData.totalPublished` sur le user doc. ~5 lignes.
- **Risque de depasser 150 lignes :** ~115. OK.

## Fichiers a creer

### components/features/calendar/ProgressionCircle.tsx
- **Role :** Cercle SVG animé (style Apple Watch). Props: `completed` et `total`. Couleur: gris → sage → vert.
- **Estimation lignes :** ~45 lignes.

### components/features/profile/MilestonesList.tsx
- **Role :** Grille/liste des jalons avec icones. Jalons debloques en couleur, verrouilles en gris.
- **Estimation lignes :** ~50 lignes.

### lib/hooks/useProgression.ts
- **Role :** Hook central pour la progression.
  - Lit `progressData` depuis le user doc (onSnapshot)
  - `updateProgression()` : incremente totalPublished, calcule la serie, verifie les jalons
  - `checkMilestones()` : compare totalPublished, currentStreak, etc. avec les seuils
  - Retourne `{ streak, totalPublished, milestones, newMilestone }` (newMilestone pour le toast)
- **Pattern a suivre :** useUserProfile (onSnapshot sur users/{uid}).
- **Estimation lignes :** ~90 lignes.

### lib/data/milestones.ts
- **Role :** Definition statique des jalons avec seuils et labels.
- **Estimation lignes :** ~30 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
export interface ProgressData {
  currentStreak: number;
  longestStreak: number;
  totalPublished: number;
  milestonesUnlocked: string[];
  lastActiveWeek: string; // "2026-W15" format ISO
}

export interface MilestoneDefinition {
  id: string;
  label: string;
  description: string;
  check: (data: ProgressData) => boolean;
}
```

### Nouveaux index Firestore
- Aucun (progressData est un sous-objet du user doc, pas une collection).

### Nouvelles security rules
- Aucune (users/{uid} est deja accessible en read/write par le proprietaire).

## Decisions architecturales a prendre

1. **Calcul de la serie — ou :**
   - Option A : Cote client dans useProgression (apres chaque publication via usePublish)
   - Option B : Cote serveur dans le cron (plus fiable pour les publications automatiques)
   - **Recommandation : Les deux.** Le cron met a jour `totalPublished` et `lastActiveWeek`. Le hook client verifie les jalons et affiche les toasts. Le calcul de `currentStreak` se fait a la lecture (comparer `lastActiveWeek` avec la semaine courante et les semaines precedentes).

2. **Format de semaine ISO :**
   - Utiliser `YYYY-WXX` (ex: "2026-W15") pour `lastActiveWeek`.
   - Attention aux fuseaux horaires : calculer la semaine en `America/Toronto`.
   - **Implementation :** `new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })` pour le jour, puis calculer le numero de semaine ISO.

3. **Toast de jalons — quand l'afficher :**
   - Si la publication est via le cron (automatique), Judith ne voit pas le toast en direct.
   - **Recommandation :** Stocker une liste `pendingMilestoneToasts: string[]` dans le user doc. Le hook client affiche les toasts et vide la liste. Comme ca, les jalons du cron apparaissent a la prochaine ouverture de l'app.

## Risques et bloqueurs potentiels

- **Race condition cron/client :** Si Judith publie manuellement ET le cron publie un slot auto en meme temps, `totalPublished` peut etre mal incremente. **Mitigation :** Utiliser `FieldValue.increment(1)` dans Firestore (atomic).
- **Calcul de la serie :** Determiner si une semaine est "active" necessite de savoir si AU MOINS 1 publication a ete faite dans cette semaine. Le champ `lastActiveWeek` suffit pour les semaines consecutives, mais pour le calcul initial il faudrait scanner l'historique. **Mitigation :** Le streak repart a 0 au lancement de S07. Le premier jalon "Premiere semaine" se debloque immediatement.

## Impact sur les autres milestones
- Depend de S02 (les slots pour calculer X/Y de la semaine)
- Le toast de progression enrichit l'experience globale du calendrier
- Pas de dependance vers les autres milestones
