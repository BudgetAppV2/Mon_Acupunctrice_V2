# Milestone S05 — Optimisation par plateforme

## Contexte
Mon Acupunctrice Hub V2 — PWA Next.js 15 deployee sur Vercel.
S00, S01, S03, S02 sont completes. Les ContentStyle existent, les Stories IG
sont publiables, les slots du calendrier fonctionnent.
On rend chaque publication **optimale pour sa plateforme** : CTA adapte,
duree recommandee, lien RDV, hashtags cibles.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase, API Anthropic, Heroicons.

## Fichiers a lire AVANT de commencer
- `components/features/publish/CaptionEditor.tsx` → 57 lignes, textarea + bouton IA
- `app/api/generate-caption/route.ts` → 36 lignes, proxy vers CF generateCaption
- `app/api/voice-idea/route.ts` → pattern appel API Anthropic directe (ANTHROPIC_API_KEY)
- `components/features/publish/PublishSheet.tsx` → wizard 3 etapes
- `components/features/editor/EditorLayout.tsx` → ~125 lignes, layout editeur video
- `lib/utils/contentStyles.ts` → CONTENT_STYLES (post-S01)

---

## Livrable 1 — Route API generate-caption-v2

### Creer `app/api/generate-caption-v2/route.ts`

Appelle l'API Anthropic directement (meme pattern que `/api/voice-idea`).
Accepte des parametres enrichis.

```
POST /api/generate-caption-v2
body: { title, category, notes, captionDraft, platform, contentStyle }

1. Construire le prompt systeme selon la plateforme :
   - Instagram : "Hook ≤125 chars en premiere ligne, 3-5 hashtags, CTA adapte au style"
   - Facebook : "Caption plus longue, CTA communautaire, inclure lien RDV"
   - YouTube : "Titre SEO-first avec mots-cles, description avec lien RDV cliquable, pas de hashtags"
2. Integrer le CTA rotatif selon contentStyle (voir Livrable 2)
3. Appeler Claude (claude-sonnet-4-20250514, max_tokens 500)
4. Retourner { caption }
```

Le lien RDV : utiliser `process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca'`.

Estimation : ~80 lignes.

---

## Livrable 2 — Utilitaire platformOptimization

### Creer `lib/utils/platformOptimization.ts`

```typescript
import type { ContentStyle } from '@/lib/types';

export type PublishPlatform = 'instagram' | 'facebook' | 'youtube';

export const PLATFORM_RECOMMENDATIONS: Record<PublishPlatform, {
  idealDuration: [number, number];
  captionMaxChars: number;
  hashtagCount: number;
}> = {
  instagram: { idealDuration: [15, 30], captionMaxChars: 2200, hashtagCount: 4 },
  facebook: { idealDuration: [15, 60], captionMaxChars: 5000, hashtagCount: 0 },
  youtube: { idealDuration: [13, 60], captionMaxChars: 5000, hashtagCount: 0 },
};

export const STYLE_CTAS: Record<ContentStyle, Record<PublishPlatform, string>> = {
  enseigner: {
    instagram: 'Enregistre ce post pour plus tard',
    facebook: 'Partage si tu as appris quelque chose',
    youtube: 'Abonne-toi pour plus de conseils sante',
  },
  connecter: {
    instagram: 'Tu vis ca aussi? Dis-le en commentaire',
    facebook: 'Raconte-moi ton experience en commentaire',
    youtube: 'Dis-moi en commentaire si ca te parle',
  },
  aider: {
    instagram: 'Essaie et dis-moi comment ca s\'est passe',
    facebook: 'Essaie ce conseil et reviens me dire',
    youtube: 'Teste et partage ton experience',
  },
  inspirer: {
    instagram: 'Lien rendez-vous dans ma bio',
    facebook: 'Prends rendez-vous via le lien',
    youtube: 'Lien pour prendre rendez-vous dans la description',
  },
};

export function getDurationFeedback(durationSec: number, platform: PublishPlatform): { message: string; ok: boolean } {
  const rec = PLATFORM_RECOMMENDATIONS[platform];
  const [min, max] = rec.idealDuration;
  if (durationSec >= min && durationSec <= max) return { message: `${durationSec}s — Ideal pour ${platform}`, ok: true };
  if (durationSec < min) return { message: `${durationSec}s — Un peu court pour ${platform} (ideal: ${min}-${max}s)`, ok: false };
  return { message: `${durationSec}s — Un peu long pour ${platform} (ideal: ${min}-${max}s)`, ok: false };
}
```

Estimation : ~60 lignes.

---

## Livrable 3 — Selecteur plateforme dans CaptionEditor

### Modifier `components/features/publish/CaptionEditor.tsx` (57 → ~80 lignes)

Ajouter 3 boutons radio (IG / FB / YT) au-dessus du bouton "Generer avec IA".
La plateforme selectionnee est passee dans l'appel a `/api/generate-caption-v2`.
Passer aussi le `contentStyle` du contentItem comme prop.

---

## Livrable 4 — Indicateur de duree dans l'editeur

### Modifier `components/features/editor/EditorLayout.tsx` (~125 → ~135 lignes)

Dans le header, a cote du timer "00:28 / 01:00", ajouter un petit feedback :
- Icone CheckCircleIcon (vert) si duree OK pour IG
- Icone ExclamationTriangleIcon (jaune) sinon
- Tooltip ou texte discret avec le message de getDurationFeedback

Utiliser `getDurationFeedback(duration, 'instagram')` par defaut.

---

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Ne PAS modifier les Cloud Functions existantes
- Ne PAS modifier `/api/generate-caption/route.ts` (garder pour backward compat)
- Garder l'ancien bouton "Generer" fonctionnel si la V2 echoue (fallback)

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] `/api/generate-caption-v2` existe et appelle Claude directement
- [ ] Les captions generees different selon la plateforme (IG vs FB vs YT)
- [ ] Le CTA varie selon le ContentStyle du contenu
- [ ] Le lien RDV est inclus dans les captions FB et YT
- [ ] CaptionEditor affiche 3 boutons de plateforme
- [ ] L'indicateur de duree est visible dans le header de l'editeur
- [ ] L'indicateur est vert si duree OK, jaune sinon
