# HACK11 — UTM Tracking sur tous les liens GoRendezVous

## Finalité
On publie sur 4+ canaux (IG, FB, YT, Blog, Stories) mais on ne sait pas
lequel génère des rendez-vous. Ajouter des UTM params à chaque lien
GoRendezVous permet de tracker dans Google Analytics quelle source
convertit le mieux. Ça aide Judith à concentrer ses efforts sur ce
qui marche.

## Contexte
Le lien GoRendezVous est hardcodé à 6 endroits :
- app/api/generate-captions/route.ts (RDV_URL, captions vidéo)
- app/api/generate-caption-v2/route.ts (RDV_URL, captions v2)
- app/api/generate-blog-captions/route.ts (RDV_URL, captions séquence blog)
- app/api/blog/publish/route.ts (RDV_URL, CTA dans les articles Wix)
- lib/utils/platformOptimization.ts (STYLE_CTAS, FB et YT)
- lib/utils/storyImageGenerator.ts (texte dans l'image story)

## Stack
TypeScript, Next.js 15 App Router.

## Fichiers à lire AVANT de commencer
Les 6 fichiers listés ci-dessus.

## Livrable 1 — Utilitaire UTM centralisé

Créer `lib/utils/rdvUrl.ts` :
```typescript
const BASE_URL = 'https://gorendezvous.com/lasourceensoi';

type Platform = 'instagram' | 'facebook' | 'youtube' | 'blog' | 'story' | 'bio';
type Medium = 'reel' | 'caption' | 'article' | 'story' | 'description' | 'link';

export function getRdvUrl(opts?: {
  source?: Platform;
  medium?: Medium;
  campaign?: string;
}): string {
  if (!opts?.source) return BASE_URL;
  const params = new URLSearchParams();
  params.set('utm_source', opts.source);
  if (opts.medium) params.set('utm_medium', opts.medium);
  if (opts.campaign) params.set('utm_campaign', opts.campaign);
  return `${BASE_URL}?${params.toString()}`;
}

// Pour les stories (texte dans l'image, pas de lien cliquable)
// On garde l'URL courte sans UTM car c'est du texte dans une image
export const RDV_URL_SHORT = 'gorendezvous.com/lasourceensoi';
export const RDV_URL_BASE = BASE_URL;
```

## Livrable 2 — Remplacer tous les liens hardcodés

### generate-captions/route.ts
- Remplacer `const RDV_URL = 'https://gorendezvous.com/lasourceensoi'`
- Utiliser `getRdvUrl()` avec les bons params selon la plateforme
- Dans le SYSTEM prompt de Claude, passer les URLs par plateforme :
  - IG : getRdvUrl({ source: 'instagram', medium: 'reel' })
  - FB : getRdvUrl({ source: 'facebook', medium: 'caption' })
  - YT : getRdvUrl({ source: 'youtube', medium: 'description' })
- Le prompt doit inclure l'URL spécifique pour chaque plateforme

### generate-caption-v2/route.ts
- Même modification que generate-captions

### generate-blog-captions/route.ts
- URLs avec campaign = slug de l'article si disponible
  - IG : getRdvUrl({ source: 'instagram', medium: 'reel', campaign: 'blog_' + slugify(blogTitle) })
  - FB : getRdvUrl({ source: 'facebook', medium: 'caption', campaign: 'blog_' + slugify(blogTitle) })
  - YT : getRdvUrl({ source: 'youtube', medium: 'description', campaign: 'blog_' + slugify(blogTitle) })

### blog/publish/route.ts
- Le CTA dans l'article Wix :
  getRdvUrl({ source: 'blog', medium: 'article', campaign: slugify(title) })

### platformOptimization.ts
- STYLE_CTAS :
  - facebook : getRdvUrl({ source: 'facebook', medium: 'caption' })
  - youtube : getRdvUrl({ source: 'youtube', medium: 'description' })

### storyImageGenerator.ts
- Ne PAS changer le texte dans l'image — garder 'gorendezvous.com/lasourceensoi'
  car c'est du texte dans une image, pas un lien cliquable. Les UTM ne servent
  à rien ici car l'utilisateur devra taper l'URL manuellement.

## Contraintes
- Le lien dans les stories (image) reste SANS UTM (texte dans image)
- Les UTM dans les prompts Claude doivent être dans les instructions,
  pas dans le texte libre (Claude doit les inclure dans la caption)
- 0 console.log en production
- Ne PAS modifier le cron publish
- Ne PAS modifier les hooks React existants

## Definition of Done
- [ ] lib/utils/rdvUrl.ts créé avec getRdvUrl()
- [ ] Tous les liens GoRendezVous dans les captions utilisent getRdvUrl()
- [ ] Les captions Instagram ont utm_source=instagram
- [ ] Les captions Facebook ont utm_source=facebook
- [ ] Les captions YouTube ont utm_source=youtube
- [ ] Les articles Wix ont utm_source=blog
- [ ] Les stories gardent l'URL courte sans UTM
- [ ] npm run build passe
