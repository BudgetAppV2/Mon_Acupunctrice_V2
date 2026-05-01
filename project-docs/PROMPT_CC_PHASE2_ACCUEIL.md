# Mission CC : Phase 2 — Accueil (Hero blur-to-focus + sections)

## Contexte

Phases 1 + finitions terminees (commit `ba8fcd6`). Les 4 pages services sont totalement animees.

Cette mission anime la **page Accueil** (`app/(public)/page.tsx` + ses sections). L'accueil est la page la plus indexee par Google — son LCP est critique pour le SEO global du site.

**Decision strategique cle** : le Hero Accueil utilise **fade-in orchestre simple**, PAS clip-path rideau. Pourquoi : le clip-path masque visuellement les elements et peut deteriorer le LCP detectable par Lighthouse meme avec opacity 0.01 trick. Sur l'Accueil, on prend zero risque.

## Sections a animer

```
app/(public)/_sections/HeroSection.tsx          (Hero principal)
app/(public)/_sections/PiliersSection.tsx       (Cards des 4 piliers : fertilite, grossesse, pediatrie, sociale)
app/(public)/_sections/ApprocheSection.tsx      (Texte editorial sur l'approche)
app/(public)/_sections/AboutSection.tsx         (Mini-bio Judith)
app/(public)/_sections/SocialSection.tsx        (Mention acupuncture sociale)
app/(public)/_sections/TemoignagesSection.tsx   (Carrousel/grid de temoignages)
app/(public)/_sections/BlogPreviewSection.tsx   (Cards d'articles preview)
app/(public)/_sections/CtaFinalSection.tsx      (CTA bottom de page)
```

8 sections au total.

## Decisions Judith (respecter strictement, comme Phase 1)

- ❌ **PAS de CountUp** nulle part (meme sur "1215 avis Google" ou autres chiffres)
- ❌ **PAS de RevealWords** sur AboutSection (ni ailleurs)
- ❌ **PAS de ligne horizontale** qui se trace
- ❌ **PAS de ScrollHighlightText**
- ❌ **PAS de clip-path rideau** sur le hero (LCP critique)
- ✅ **MagneticButton** sur CTAs principaux
- ✅ **HoverLift** sur cards
- ✅ **StaggerChildren** sur grids

## Pattern Hero Accueil (specifique)

Le hero accueil n'a PAS de photo Judith centrale (contrairement aux pages services). Il a :
- Un kicker en pill (`Acupunctrice · Membre OAQ · Rosemont`)
- Un H1 "Venez comme vous **etes**." (le mot souligne par underline Tailwind)
- Un paragraphe descriptif
- Des CTAs
- Un SVG decoratif en filigrane (pregnant-woman.svg)

**Pattern recommande** : timeline GSAP unifiee qui orchestre l'apparition des 4 elements en cascade, sans toucher au SVG decoratif :

```tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import GrainOverlay from '../_components/GrainOverlay';
import WatermarkText from '../_components/WatermarkText';
import CtaButton from '../_components/CtaButton';
import MagneticButton from '../_components/animations/MagneticButton';

export default function HeroSection() {
  const kickerRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!h1Ref.current) return;

    if (prefersReduced) {
      gsap.set([kickerRef.current, h1Ref.current, paragraphRef.current, ctasRef.current],
        { opacity: 1, y: 0 });
      return;
    }

    // Etats initiaux : opacity 0.01 (LCP-friendly trick)
    gsap.set([kickerRef.current, h1Ref.current, paragraphRef.current, ctasRef.current],
      { opacity: 0.01, y: 28 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(kickerRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0);
    tl.to(h1Ref.current, { opacity: 1, y: 0, duration: 0.9 }, 0.2);
    tl.to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.5);
    tl.to(ctasRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.7);
  }, { dependencies: [prefersReduced] });

  return (
    /* JSX original avec refs sur les elements + style opacity: 0.01 inline */
    /* CTAs wrappes dans MagneticButton */
  );
}
```

**LCP critique** : le H1 "Venez comme vous etes" demarre a `opacity: 0.01` inline (PAS 0). Chrome le detecte comme visible des le first paint et mesure le LCP correctement.

## Pattern par section

| Section | Pattern |
|---------|---------|
| Hero | Timeline GSAP unifiee + MagneticButton sur CTAs (voir code ci-dessus) |
| Piliers | StaggerChildren scale=0.92 y=28 stagger=0.12 + HoverLift sur les 4 cards piliers |
| Approche | Reveal scaleFrom={0.7} sur SectionNumber + Reveal sur heading + Reveal delay={0.15} sur paragraphes |
| About (mini-bio) | Reveal sur SectionNumber + Reveal sur heading + Reveal delay sur bloc texte (PAS de RevealWords) |
| Social | Reveal sur heading + Reveal delay sur paragraphes |
| Temoignages | StaggerChildren sur la grid de temoignages + HoverLift sur chaque card |
| BlogPreview | StaggerChildren sur la grid d'articles + HoverLift sur chaque card |
| CtaFinal | Pattern CTA Fertilite (Reveal y=56 + FloatingDeco sur botanical SVG + MagneticButton sur primary + shimmer-cta + cta-bg-shift) |

## Regles d'engagement (NE PAS DEVIER)

1. **JAMAIS** introduire CountUp, RevealWords, ScrollHighlightText, ligne horizontale, clip-path masque sur hero accueil.
2. **JAMAIS** introduire de `sectionRef` non attache au JSX. Bug Phase 1 a eviter — utiliser ref attachee comme `h1Ref.current` ou `gridRef.current` pour la guard.
3. **TOUJOURS** preserver le contenu textuel original a 100%.
4. **TOUJOURS** mettre `opacity: 0.01` (LCP-friendly trick) sur les inline styles initiaux.
5. **NE PAS** toucher au SVG decoratif (pregnant-woman.svg) — il reste comme avant.
6. **NE PAS** toucher au schema.org JSON-LD dans page.tsx — c'est critique pour SEO.
7. **NE PAS** toucher a `revalidate = 3600`.
8. Le H1 "Venez comme vous **etes**" : garder l'underline Tailwind (`decoration-public-accent-warm decoration-2 underline-offset-8`). PAS de DrawUnderline anime — sur l'accueil, on garde simple.

## Verification LCP critique

Apres avoir tout fini :

```bash
npm run build
npx tsc --noEmit
```

Puis, dans un terminal :
```bash
pkill -f "next start" 2>&1; rm -rf .next; npm run build
nohup npx next start -p 3001 > /tmp/next_prod.log 2>&1 &
sleep 8
npx lighthouse http://localhost:3001 --output=json --output-path=/tmp/lh_home.json --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox" --quiet
```

Puis extraire les scores :
```bash
node -e "
const r = require('/tmp/lh_home.json');
console.log('Performance:', Math.round(r.categories.performance.score * 100));
console.log('LCP:', r.audits['largest-contentful-paint'].displayValue);
console.log('CLS:', r.audits['cumulative-layout-shift'].displayValue);
console.log('SEO:', Math.round(r.categories.seo.score * 100));
"
```

**Cibles obligatoires sur l'Accueil** :
- Performance >= 80 (target 85+)
- **LCP <= 3s** (CRITIQUE — page d'entree)
- CLS = 0
- SEO = 100

Si LCP > 3.5s, **ARRETER et investiguer** avant de commit. Causes possibles :
- H1 demarre a `opacity: 0` au lieu de `0.01`
- Animation hero trop longue (cascade qui depasse 1.5s)
- Lenis qui bloque le first paint (verifier dans LenisProvider que useLayoutEffect ne fait pas trop)
- Schema.org modifie par erreur

Tuer le serveur apres test :
```bash
pkill -f "next start"
```

## Tests visuels

Test manuel sur `localhost:3000/` :
- Hero : kicker -> H1 -> paragraphe -> CTAs en cascade orchestree (~1.5s)
- MagneticButton sur le CTA principal
- Cards piliers en stagger au scroll
- About mini-bio : juste Reveal subtil (pas de mots un par un)
- Temoignages et BlogPreview : cards en stagger + hover lift
- CtaFinal : feuilles flottantes + shimmer + magnetic + bg-shift
- prefers-reduced-motion : tout apparait instantanement, aucun mouvement

## Commit

```
feat(accueil): animations Phase 2 sur l'accueil avec hero LCP-friendly

Strategie LCP-friendly pour preserver le SEO de la page d'entree :
- Hero : timeline GSAP unifiee fade-in (PAS clip-path rideau)
- Tous les textes a opacity 0.01 (Chrome detecte comme visible au first paint)
- MagneticButton sur CTA principal

Sections animees :
- Piliers : StaggerChildren + HoverLift sur les 4 cards
- Approche : Reveal scaleFrom + Reveal heading + Reveal paragraphes
- About : Reveal simple (PAS de RevealWords)
- Social : Reveal heading + paragraphes
- Temoignages : StaggerChildren + HoverLift
- BlogPreview : StaggerChildren + HoverLift
- CtaFinal : pattern CTA Fertilite (FloatingDeco + Magnetic + shimmer + bg-shift)

Decisions Judith respectees :
- Pas de CountUp
- Pas de RevealWords
- Pas de ScrollHighlightText
- Pas de ligne horizontale qui se trace

Lighthouse Accueil : Performance >= 80, LCP <= 3s, SEO 100, CLS 0.
Schema.org JSON-LD et revalidate intacts.
```

PROMPTEOF
