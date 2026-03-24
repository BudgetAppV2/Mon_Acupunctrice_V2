# Impacts croises — Phase Strategie

## 1. Coexistence calendarSlots + contentItems

### Le probleme
Le calendrier utilise actuellement `useCalendar` qui retourne `itemsByDay: Map<string, ContentItem[]>`. Les slots NE SONT PAS des ContentItem — ce sont des documents dans une collection differente avec une structure differente.

### Solution recommandee
Ajouter `slotsByDay: Map<string, CalendarSlot[]>` comme 2e retour du hook (ou un hook separe `useCalendarSlots`). CalendarDay recoit les deux en props separees. Pas de union type, pas de polymorphisme.

```typescript
// useCalendar.ts retourne :
{ itemsByDay, slotsByDay, days, month, year, goToPrev, goToNext }

// CalendarDay recoit :
<CalendarDay
  date={date}
  items={itemsByDay.get(dayKey(date)) || []}
  slots={slotsByDay.get(dayKey(date)) || []}
  onTapItem={...}
  onTapSlot={...}
/>
```

### Quand un slot est "rempli"
Quand Judith assigne une idee a un slot :
1. Le slot passe a `status: 'filled'` + `contentItemId: 'xxx'`
2. Le contentItem est schedule a la date du slot (`scheduledAt`)
3. Le jour affiche le contentItem (pas le slot) car il a un `scheduledAt`
4. Quand le contentItem est publie, le slot passe a `status: 'completed'`

Ce flow cree un **couplage** : la publication d'un contentItem doit aussi mettre a jour le slot lie. Ou mettre cette logique?
- **Dans usePublish.ts :** Apres publication reussie, si le contentItem a un `slotId` (nouveau champ), mettre a jour le slot.
- **Dans le cron :** Meme logique cote serveur.

### Nouveau champ requis sur ContentItem
```typescript
slotId?: string;  // Reference au CalendarSlot lie (si assigne via un slot)
```

## 2. Cron Vercel — Limites et strategie

### Limites verifiees (source : vercel.com/docs/cron-jobs/usage-and-pricing, mars 2026)

| | Nombre de crons/projet | Intervalle minimum | Precision |
|---|---|---|---|
| **Hobby** | 100 | **1x par jour** | Horaire (±59 min) |
| **Pro** | 100 | 1x par minute | Par minute |

**Contraintes Hobby critiques :**
1. **Execution 1x/jour uniquement.** Les expressions cron plus frequentes (horaire, toutes les 15 min) font ECHOUER le deploiement.
2. **Precision ±59 minutes.** Un cron configure a `0 12 * * *` (midi) peut se declencher entre 12h00 et 12h59 UTC.
3. **Timeout 60 secondes** par execution (limite Serverless Functions Hobby).

### Ce que ca veut dire pour nous

| Cron | Schedule | Role | OK Hobby? |
|------|----------|------|-----------|
| `/api/cron/publish` | `0 12 * * *` (midi UTC = 8h Montreal ±59min) | Publie les items + stories auto | ✅ Oui |
| `/api/cron/fetch-insights` | `0 10 * * *` (10h UTC = 6h Montreal ±59min) | Fetch stats Instagram | ✅ Oui |

**Impact sur S04 (stories auto) :** Le cron 1x/jour est suffisant — les stories sont planifiees a une date, le cron passe et publie tout ce qui est du. Si Judith cree une sequence a 10h pour un article publie "aujourd'hui", la story promo partira le jour meme (entre 8h et 9h Montreal, ±59min). C'est acceptable.

**Si un jour on a besoin de precision :** Passer au plan Pro (20$/mois) OU migrer les crons vers Firebase Scheduled Functions (gratuit, precision a la minute). Pas un bloqueur pour la Phase Strategie.

### Timeout et pre-generation
Vercel Hobby : 60 secondes max par execution. Avec max 10 items par run, c'est suffisant sauf si on doit generer des images story dans le cron. **Recommandation :** Pre-generer les images au moment de la creation de la sequence (S04), pas dans le cron. Le cron ne fait que publier une URL deja stockee dans Firebase Storage.

## 3. Cloud Functions — Modifications requises

### Analyse
Le projet utilise 2 Cloud Functions :
- `publishToInstagram` — appelee via `/api/publish/route.ts`
- `generateCaption` — appelee via `/api/generate-caption/route.ts`

### publishToInstagram
- **Pour S03 (Stories) :** La CF ne supporte probablement pas `media_type=STORIES`. **Recommandation :** Ne PAS modifier la CF. Creer une route `/api/publish-story` qui appelle l'API Graph IG directement (meme pattern que publish-facebook/publish-youtube). Le token Meta est deja dans Firestore.

### generateCaption
- **Pour S05 (Optimisation) :** La CF recoit `{ title, category, notes, captionDraft }`. Elle ne connait pas la plateforme ni le style. **Recommandation :** Creer `/api/generate-caption-v2` qui appelle Claude directement via l'API Anthropic (ANTHROPIC_API_KEY existe deja dans .env.local). Garder la CF existante pour le backward compat.

### Conclusion : 0 modification de Cloud Functions requise

## 4. Navigation — 4 onglets vs 5

### Etat actuel
```
[ Idees ] [ Calendrier ] [ Stats ] [ Profil ]
```

### Options pour S06 (Inspiration)

| Option | Config | Impact 375px |
|--------|--------|--------------|
| Remplacer Stats | `[ Idees ] [ Calendrier ] [ Inspiration ] [ Profil ]` | Aucun impact. Stats accessible via /profil. |
| Ajouter 5e onglet | `[ Idees ] [ Calendrier ] [ Inspiration ] [ Stats ] [ Profil ]` | 75px par onglet — juste mais faisable avec des labels courts. |

### Recommandation : Remplacer Stats

Stats est deja accessible via le lien "Voir toutes les stats" dans /profil + le composant StatsSummary. L'inspiration est plus utile au quotidien dans la nav principale.

Le changement dans `layout.tsx` :
```typescript
const TABS = [
  { href: '/idees', label: 'Idees', ... },
  { href: '/calendrier', label: 'Calendrier', ... },
  { href: '/inspiration', label: 'Inspiration', outline: SparklesOutline, solid: SparklesSolid },
  { href: '/profil', label: 'Profil', ... },
];
```

### Impact sur le Blitz
La page `/blitz` n'est PAS dans la nav — elle est accessible via un lien dans CalendarView. Le remplacement de Stats par Inspiration ne l'affecte pas.

## 5. Chaine de donnees slot → contentItem → publication

### Flow complet

```
1. CREATION DU SLOT (S02)
   generateWeekSlots() cree un CalendarSlot avec :
   - status: 'open'
   - contentStyle: 'enseigner'
   - scheduledDate: mardi prochain
   - format: 'reel'

2. REMPLISSAGE (S02)
   Judith tap le slot → FillSlotSheet → choisit une idee existante
   - CalendarSlot.status → 'filled'
   - CalendarSlot.contentItemId → 'abc123'
   - ContentItem('abc123').scheduledAt → date du slot
   - ContentItem('abc123').slotId → slot.id (nouveau champ)

3. PUBLICATION (existant)
   Le cron query contentItems.scheduledAt <= now
   - Publie sur IG/FB/YT
   - ContentItem.distributionStatus → 'published'

4. COMPLETION DU SLOT (S07)
   Apres publication reussie :
   - CalendarSlot.status → 'completed'
   - ProgressData.totalPublished += 1

5. CAS SPECIAL — SLOT AUTO (S04)
   Les slots de sequence avec autoPublish=true :
   - Le cron query calendarSlots.autoPublish=true + scheduledDate <= now
   - Genere/publie la story directement (pas de contentItem intermediaire)
   - CalendarSlot.status → 'completed'
```

### Les IDs se lient ainsi :
```
CalendarSlot.contentItemId  ←→  ContentItem.slotId  (lien bidirectionnel)
CalendarSlot.sequenceId     →   BlogSequence.id      (lien vers la sequence)
BlogSequence.slotIds[]      →   CalendarSlot.id[]    (liste des slots)
```

## 6. Ordre d'implementation — Validation

### Ordre propose dans ROADMAP_STRATEGY.md
```
Sprint 1 : S01 + S03
Sprint 2 : S02 + S05
Sprint 3 : S04 + S06
Sprint 4 : S07 + S08
```

### Analyse des dependances reelles

```
S01 (styles) ← pas de dependance
S03 (stories) ← pas de dependance
S02 (slots) ← depend de S01
S05 (optimisation) ← beneficie de S01 mais pas strict
S04 (sequences) ← depend de S02 ET S03
S06 (templates) ← depend de S01
S07 (progression) ← depend de S02
S08 (visuel) ← depend de S01 + S02 + S04
```

### Validation
L'ordre propose est **correct** et respecte les dependances. Un seul ajustement mineur :

**Sprint 1 devrait inclure le refactoring :** Avant de commencer, refactoriser :
- `lib/types/index.ts` (extraire les types editeur) — libere de l'espace pour les types S01-S04
- `app/api/cron/publish/route.ts` (extraire les helpers) — prepare pour S03/S04

### Effort estime par sprint

| Sprint | Milestones | Effort | Fichiers touches |
|--------|-----------|--------|-----------------|
| 1 | S01 + S03 + refactoring | ~3-4 heures | ~15 fichiers |
| 2 | S02 + S05 | ~5-6 heures | ~12 fichiers |
| 3 | S04 + S06 | ~5-6 heures | ~10 fichiers |
| 4 | S07 + S08 | ~4-5 heures | ~10 fichiers |

## 7. Fichiers a la limite des 150 lignes — plan de decoupage

| Fichier | Lignes actuelles | Post-phase estimees | Action |
|---------|-----------------|---------------------|--------|
| lib/types/index.ts | 152 | ~200 | Extraire types editeur dans `lib/types/editor.ts` |
| CoverPicker.tsx | 183 | 183 | Deja au-dessus — a refactoriser (hors scope S-series) |
| PublishSheet.tsx | 149 | ~135 post-S03 | Extraire handlePublish dans hook |
| cron/publish/route.ts | 171 | ~110 post-S03 | Extraire helpers dans publishHelpers.ts |
| CreateIdeaSheet.tsx | 139 | ~145 post-S01 | Extraire StyleSelector composant |
| CalendarView.tsx | 120 | ~150 post-S04 | Extraire sheets dans useCalendarSheets hook |
| ItemDetailSheet.tsx | 132 | ~140 post-S08 | OK mais serré |
