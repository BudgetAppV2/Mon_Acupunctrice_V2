# Matrice de redirections 301 — acupuncturejudith.ca

**Date** : 14 avril 2026
**Source** : scouting Wix + export blog MW-A1a

## Pages statiques

| URL Wix | URL Next.js | Type | Notes |
|---------|-------------|------|-------|
| `/` | `/` | identique | Homepage |
| `/a-propos` | `/a-propos` | identique | |
| `/services` | `/services` | identique | |
| `/bienfaits` | `/faq` | 301 | Contenu redistribue dans les FAQ par pilier (plan §4.1) |
| `/acupuncture-sociale` | `/services/acupuncture-sociale` | 301 | Devient page service pilier |
| `/contactez-moi` | `/contact` | 301 | Slug simplifie |
| `/blog` | `/blog` | identique | |
| `/politique-de-confidentialite-et-cookies` | `/politique-de-confidentialite` | 301 | Slug simplifie |

## Articles de blog (11)

Slugs Wix reels extraits via l'API Blog v3. Slugs Next.js : accents retires, prefixe `/blog/`.

| URL Wix | URL Next.js | Type | Titre |
|---------|-------------|------|-------|
| `/post/acupuncture-nausees-grossesse` | `/blog/acupuncture-nausees-grossesse` | 301 | Acupuncture pour les nausees de grossesse |
| `/post/acupuncture-systeme-immunitaire` | `/blog/acupuncture-systeme-immunitaire` | 301 | Acupuncture et systeme immunitaire |
| `/post/acupuncture-coliques-nourrisson` | `/blog/acupuncture-coliques-nourrisson` | 301 | Coliques du nouveau-ne |
| `/post/stress-anxiete-enfant-bienfaits-acupuncture` | `/blog/stress-anxiete-enfant-bienfaits-acupuncture` | 301 | Stress et anxiete chez l'enfant |
| `/post/fatigue-post-natale-acupuncture` | `/blog/fatigue-post-natale-acupuncture` | 301 | Fatigue post-natale |
| `/post/acupuncture-pediatrique` | `/blog/acupuncture-pediatrique` | 301 | Acupuncture pediatrique |
| `/post/acupuncture-baby-blues-post-partum` | `/blog/acupuncture-baby-blues-post-partum` | 301 | Baby blues et post-partum |
| `/post/acupuncture-fertilite-montreal-preparer-conception` | `/blog/acupuncture-fertilite-montreal-preparer-conception` | 301 | Fertilite et conception |
| `/post/l-acupuncture-sociale-pratique-essentielle-pour-la-communaute` | `/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communaute` | 301 | Acupuncture sociale |
| `/post/preparation-accouchement-induction-acupuncture` | `/blog/preparation-accouchement-induction-acupuncture` | 301 | Preparation accouchement |
| `/post/bebe-siege-acupuncture` | `/blog/bebe-siege-acupuncture` | 301 | Bebe en siege |

**Note** : 2 slugs Wix contiennent des caracteres accentues (`communauté`, `préparation`, `bébé`, `siège`). Les slugs Next.js retirent les accents pour rester ASCII-safe (plan §4.3). Les redirections 301 doivent matcher les slugs Wix exacts (avec accents URL-encoded).

## Pages sans equivalent direct

| URL Wix | Action | Notes |
|---------|--------|-------|
| `/book-online` | 301 → `/reserver` | Go Rendez-Vous remplace Wix Bookings |
| `/plans-pricing` | 301 → `/tarifs` | Page prix obsolete (derniere modif sept. 2024) |

## Backlink critique

| Source | URL actuelle | URL future | Action |
|--------|-------------|------------|--------|
| `lasourceensoi.com/equipe/judith-dufour-savard/` | `acupuncturejudith.ca` (racine) | `acupuncturejudith.ca` (racine) | Aucune action DNS — meme URL, juste le serveur change (Wix → Vercel). Le backlink est preserve automatiquement. |

## Implementation

Les redirections seront implementees dans `next.config.ts` (fonction `redirects()`) ou dans `vercel.json`. A faire dans MW-G1 (pre-flight checklist) ou MW-G2 (switch DNS).

Format `next.config.ts` :
```typescript
async redirects() {
  return [
    { source: '/bienfaits', destination: '/faq', permanent: true },
    { source: '/acupuncture-sociale', destination: '/services/acupuncture-sociale', permanent: true },
    { source: '/contactez-moi', destination: '/contact', permanent: true },
    { source: '/politique-de-confidentialite-et-cookies', destination: '/politique-de-confidentialite', permanent: true },
    { source: '/post/:slug*', destination: '/blog/:slug*', permanent: true },
    { source: '/book-online', destination: '/reserver', permanent: true },
    { source: '/plans-pricing', destination: '/tarifs', permanent: true },
  ];
}
```

**Note sur les slugs accentues** : la redirection wildcard `/post/:slug*` → `/blog/:slug*` gere la plupart des cas. Les 2-3 slugs avec accents (`communauté`, `préparation`, `bébé-siège`) necessiteront peut-etre des redirections explicites si le slug URL-encoded ne matche pas le wildcard.
