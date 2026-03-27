# S00 — Refactoring preparatoire Phase Strategie

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
Avant de commencer la Phase Strategie (S01-S08), on nettoie 2 fichiers
qui depassent la limite de 150 lignes et qui seront touches par les milestones a venir.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/types/index.ts` → 152 lignes, types editeur video melangees avec types metier
- `app/api/cron/publish/route.ts` → 171 lignes, helpers de publication inline

---

## Livrable 1 — Extraire les types editeur

Creer `lib/types/editor.ts` et y deplacer les types lies a l'editeur video.
Re-exporter depuis `lib/types/index.ts` pour ne rien casser.

**Deplacer vers `lib/types/editor.ts` :**
- `TextStylePreset`
- `TextAnimation`
- `TextOverlayItem`
- `SubtitleWord`
- `SubtitleSegment`
- `SubtitleStyle`
- `JamendoTrack`

**Garder dans `lib/types/index.ts` :**
- `FirebaseUser`
- `ContentCategory`, `WorkflowState`, `DistributionStatus`
- `ContentItem`
- `DEFAULT_CATEGORIES`, `CATEGORY_LABELS`, `WORKFLOW_LABELS`

**Dans `lib/types/index.ts`, ajouter en bas :**
```typescript
// Re-export des types editeur pour backward compat
export type { TextOverlayItem, SubtitleSegment, SubtitleStyle, TextStylePreset, TextAnimation } from './editor';
export type { JamendoTrack, SubtitleWord } from './editor';
```

Verifier que tous les imports existants continuent de fonctionner.

---

## Livrable 2 — Extraire les helpers de publication du cron

Creer `lib/utils/publishHelpers.ts` et y deplacer les 3 fonctions de publication
actuellement inline dans le cron.

**Deplacer vers `lib/utils/publishHelpers.ts` :**
- `publishInstagram(item)` — appelle la Cloud Function
- `publishFacebook(item, pageId, pageToken)` — 3 etapes Reels
- `publishYouTube(item, refreshToken)` — refresh token + resumable upload

**Le cron garde uniquement :** la logique d'orchestration (auth, query Firestore,
boucle sur les items, updates de status). Il importe les helpers.

Objectif : le cron passe de ~171 lignes a ~80 lignes.

---

## Contraintes
- Ne PAS changer de comportement — meme fonctionnalite exacte avant et apres
- Ne PAS modifier les Cloud Functions existantes
- Heroicons uniquement, 0 console.log en production
- TypeScript strict
- `npm run build` doit passer sans erreur

## Definition of Done
- [ ] `lib/types/editor.ts` existe avec les types editeur
- [ ] `lib/types/index.ts` re-exporte les types editeur (backward compat)
- [ ] `lib/types/index.ts` est sous 120 lignes
- [ ] `lib/utils/publishHelpers.ts` existe avec les 3 fonctions de publication
- [ ] `app/api/cron/publish/route.ts` est sous 100 lignes
- [ ] `npm run build` passe sans erreur
- [ ] Aucun import casse dans la codebase
