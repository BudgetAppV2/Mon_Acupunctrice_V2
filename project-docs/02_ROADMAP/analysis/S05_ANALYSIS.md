# Analyse S05 — Optimisation par plateforme

## Complexite reelle : Moyen

Principalement du prompt engineering + UI informative. Pas de nouveau data model.

## Fichiers a modifier — Analyse detaillee

### app/api/generate-caption/route.ts (actuellement 36 lignes)
- **Ce qui existe :** Proxy vers la Cloud Function `generateCaption`. Passe `{ title, category, notes, captionDraft }`.
- **Ce qui change :** Ajouter `platform` et `contentStyle` au payload envoye a la CF. La CF recoit ces params via le champ `data` — elle peut les ignorer si elle ne les gere pas, ou les passer au prompt Claude.
- **Risque de depasser 150 lignes :** Non (36 + ~5 = ~41).
- **Question critique :** La CF `generateCaption` est-elle modifiable? Si oui, enrichir le prompt. Si non, on peut passer `platform` et `contentStyle` dans le champ `notes` comme instructions supplementaires.

### components/features/publish/PublishSheet.tsx (actuellement 149 lignes, post-S03 refactorise ~120 lignes)
- **Ce qui existe (post-S03) :** Wizard 3 etapes avec handlePublish extrait dans un hook.
- **Ce qui change :** A l'etape 2 (caption), ajouter un selecteur de plateforme cible pour la generation IA. Afficher la checklist pre-publication a l'etape 3. ~15 lignes.
- **Risque de depasser 150 lignes :** Non si refactorise en S03 (~120 + 15 = ~135).

### components/features/publish/CaptionEditor.tsx (actuellement 57 lignes)
- **Ce qui existe :** Textarea + bouton "Generer avec IA" qui appelle `/api/generate-caption`.
- **Ce qui change :** Ajouter un selecteur de plateforme (3 boutons : IG/FB/YT) au-dessus du bouton "Generer". La plateforme selectionnee est passee dans le payload. ~20 lignes.
- **Risque de depasser 150 lignes :** Non (57 + 20 = ~77).

### components/features/editor/EditorLayout.tsx (actuellement ~125 lignes)
- **Ce qui existe :** Layout complet de l'editeur video (header + preview + toolbar + panels + timeline).
- **Ce qui change :** Ajouter un petit indicateur de duree dans le header : "28s - Ideal pour IG" avec couleur conditionnelle. ~8 lignes.
- **Risque de depasser 150 lignes :** ~133. OK.

## Fichiers a creer

### lib/utils/platformOptimization.ts
- **Role :** Constantes et helpers pour l'optimisation par plateforme.
  - `getPlatformRecommendations(platform)` → { idealDuration, captionMaxChars, hashtagCount, ctaExamples }
  - `getStyleCTA(style, platform)` → CTA string adapte
  - `getDurationFeedback(duration, platform)` → { message, color }
- **Pattern a suivre :** Meme pattern que `lib/utils/contentStyles.ts`.
- **Estimation lignes :** ~80 lignes.

### components/features/publish/PrePublishChecklist.tsx
- **Role :** Checklist de bonnes pratiques avant publication (hook dans les 3 premieres secondes, sous-titres actives, CTA clair, geolocalisation).
- **Estimation lignes :** ~40 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
// Aucun changement au data model Firestore.
// Types utilitaires locaux uniquement :

export type PublishPlatform = 'instagram' | 'facebook' | 'youtube';

export interface PlatformRecommendation {
  idealDuration: [number, number]; // [min, max] en secondes
  captionMaxChars: number;
  hashtagCount: number;
  ctaExamples: Record<ContentStyle, string>;
}
```

### Nouveaux index Firestore
- Aucun.

### Nouvelles security rules
- Aucune.

## Decisions architecturales a prendre

1. **Cloud Function generateCaption — modifier ou contourner :**
   - Option A : Modifier la CF pour accepter `platform` et `contentStyle` dans le prompt
   - Option B : Passer les instructions dans le champ `notes` existant (hack)
   - Option C : Appeler l'API Anthropic directement depuis la route Next.js (comme voice-idea)
   - **Recommandation : Option C** — on a deja `ANTHROPIC_API_KEY` dans les env vars (utilise par voice-idea). Creer une route `/api/generate-caption-v2` qui appelle Claude directement avec un prompt enrichi. La route existante reste pour le backward compat.

2. **Checklist pre-publication — bloquante ou informative :**
   - **Recommandation : Informative uniquement.** Pas de blocage. Judith peut publier meme si la checklist n'est pas toute verte. C'est un rappel, pas une gate.

## Risques et bloqueurs potentiels

- **Qualite des captions generees :** Le prompt doit etre bien calibre pour chaque plateforme. Necessaire de tester avec des vrais titres de Judith.
- **Cout API Anthropic :** Chaque generation de caption = 1 appel Claude. Si Judith genere pour 3 plateformes = 3 appels. Avec claude-sonnet-4-20250514 a ~$3/M input tokens et les captions courtes (~500 tokens), le cout est negligeable (~$0.002/generation).

## Impact sur les autres milestones
- Independant des autres milestones (peut etre fait en parallele)
- Beneficie de S01 (ContentStyle pour les CTA rotatifs)
- La route `/api/generate-caption-v2` peut etre reutilisee par S04 (prompts de Reels de sequence)
