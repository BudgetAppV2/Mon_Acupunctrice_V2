# Mission CC : Page laboratoire d'animations GSAP — `/lab/animations`

## Contexte

Le site Judith Dufour-Savard (acupunctrice à Rosemont/Repentigny) lance le 3 mai. Cette mission est **post-launch** mais le code est préparé maintenant pour exécution dès que le site est live et stable.

Objectif : ajouter des animations scroll-reveal et micro-interactions élégantes, sans casser le ton du site (calme, contemplatif, palette beige/taupe, typographie sérif).

**Exécution dans une page LABO isolée** : on clone la page Fertilité, on l'instrumente, on itère visuellement. Aucune modification des pages publiques originales tant que le labo n'est pas validé. Cette discipline est non-négociable.

## Décisions prises (ne pas remettre en question)

- **Lib animation** : GSAP 3.14.2 (déjà installé) + ScrollTrigger plugin (gratuit depuis 3.12) + `@gsap/react` (à installer pour l'hook `useGSAP`). **Pas de Framer Motion**.
- **Page labo** : `/lab/animations`, accessible uniquement par URL directe, pas de lien dans le menu, robots noindex.
- **Source de la page labo** : clonage de `services/fertilite` car cette page contient une variété de patterns (hero + bio + grid bénéfices + section dédiée homme + collaboration + témoignage + infos cards + CTA) représentative du reste du site.
- **Pages originales NON modifiées** dans cette mission. Aucun changement à `app/(public)/services/fertilite/page.tsx` ni aux sections `ServiceFertilite*.tsx`. Le clonage va dans `_sections/_lab/`.
- **Approche composants** : créer des wrappers client réutilisables (`<Reveal>`, `<StaggerChildren>`, `<HoverLift>`, etc.) pour qu'au moment de la propagation post-validation, on n'ait qu'à wrapper les sections existantes. Pas de logique animation inline.
- **Accessibilité non-négociable** : `prefers-reduced-motion: reduce` désactive intégralement les translate/scale, ne garde que opacity (instantané ou fade ≤ 200ms). Hook centralisé à respecter partout.
- **Zéro changement aux deps** sauf `@gsap/react`. Pas de Framer Motion, pas d'AOS, pas de motion-one.

## Note importante sur les couleurs Tailwind

Le projet utilise des **couleurs Tailwind directes** (config dans `tailwind.config.ts`) et non des CSS variables `--public-*` au runtime. Concrètement :

- Les classes utilitaires comme `bg-public-accent-warm` ou `text-public-text-dark` fonctionnent (compilées par Tailwind)
- `var(--public-accent-warm)` dans du CSS inline ou globals.css **ne fonctionnera pas**, la variable n'est pas définie au runtime

Donc dans `<DrawUnderline>`, ne pas utiliser `var(--public-accent-warm, #c9a47e)`. Utiliser directement la couleur hex `#c9a47e` comme valeur par défaut OU permettre à l'utilisateur de passer une classe Tailwind. Résoudre la couleur en hex directement :

```ts
// Default = couleur Tailwind 'public-accent-warm' resolu en hex
color = '#c9a47e',
```

(Récupérer la valeur hex exacte depuis `tailwind.config.ts` au moment de l'implémentation — chercher `accent-warm` dans les colors du theme.)

Même logique pour `cta-bg-shift` dans globals.css : utiliser les valeurs hex directes plutôt que `var(--public-accent-taupe)`. Récupérer les hex depuis `tailwind.config.ts`.

## À lire d'abord

- `CLAUDE.md` (racine)
- `app/(public)/services/fertilite/page.tsx` — page à cloner
- `app/(public)/_sections/ServiceFertiliteHeroSection.tsx` — pattern hero
- `app/(public)/_sections/ServiceFertiliteBenefitsSection.tsx` — pattern grid + cards (on s'en sert pour le stagger)
- `app/(public)/_sections/ServiceFertiliteCtaSection.tsx` — pattern CTA bas de page
- `app/(public)/_components/CtaBotanicalDeco.tsx` — décorations SVG botanical à animer
- `package.json` — vérifier que GSAP 3.14.2 est bien là avant d'installer `@gsap/react`

---

## Phase 0 — Setup technique

### 0.1 Installation

```bash
npm install @gsap/react
```

`@gsap/react` fournit le hook `useGSAP()` qui gère automatiquement le cleanup au unmount et le SSR de Next.js 15 (pas de leak, pas d'hydration mismatch). C'est le pattern officiel GSAP pour React.

### 0.2 Hook `useReducedMotion`

Créer `lib/hooks/useReducedMotion.ts` :

```ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Detecte si l'utilisateur a active prefers-reduced-motion.
 * SSR-safe : retourne false par defaut, ajuste apres mount.
 *
 * Usage :
 *   const prefersReduced = useReducedMotion();
 *   if (prefersReduced) {
 *     gsap.set(target, { opacity: 1, y: 0 }); // pas d'anim
 *   } else {
 *     gsap.from(target, { opacity: 0, y: 16, duration: 0.6 });
 *   }
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

### 0.3 Constants centralisées

Créer `lib/animations/constants.ts` :

```ts
/**
 * Constantes centralisees pour les animations du site Judith.
 * Modifier ICI plutot qu'inline pour garder une coherence globale.
 */
export const ANIMATION = {
  // Durees (en secondes pour GSAP)
  duration: {
    short: 0.4,   // hover, micro-interactions
    medium: 0.6,  // reveal standard
    long: 1.2,    // hero entrance
    breathe: 4.0, // botanical floating cycle
    bgShift: 12.0, // background gradient cycle
  },

  // Easings (GSAP eases natifs)
  ease: {
    out: 'power2.out',         // standard reveal
    smoothOut: 'power3.out',   // hero entrance
    inOut: 'sine.inOut',       // floating, breathing
  },

  // Distances de translation (en pixels)
  translate: {
    subtle: 8,    // micro elements (sectionNumber, etc.)
    standard: 16, // reveal standard
    pronounced: 32, // CTA section finale
  },

  // Stagger entre enfants (en secondes)
  stagger: {
    fast: 0.05,
    standard: 0.08,
    slow: 0.1,
  },

  // ScrollTrigger
  trigger: {
    start: 'top 85%',  // declenche quand le top de l'element est a 85% du viewport
    once: true,        // une seule fois, pas de re-trigger au scroll-up
  },
} as const;
```

### 0.4 Setup ScrollTrigger global

Créer `lib/animations/setup.ts` :

```ts
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Enregistre ScrollTrigger une seule fois cote client.
 * Appeler dans le top-level de la page labo (ou eventuellement layout public).
 */
export function setupGsap(): void {
  if (typeof window === 'undefined' || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}
```

---

## Phase 1 — Composants animation réutilisables

Créer un sous-dossier `app/(public)/_components/animations/` qui contient les wrappers client. Tous ces composants commencent par `'use client'`.

### 1.1 `<Reveal>` — wrapper scroll-reveal de base

`app/(public)/_components/animations/Reveal.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface RevealProps {
  children: ReactNode;
  /** Distance verticale en px (default: 16) */
  y?: number;
  /** Duree en secondes (default: 0.6) */
  duration?: number;
  /** Delai en secondes (default: 0) */
  delay?: number;
  /** Easing (default: power2.out) */
  ease?: string;
  /** className pour le wrapper div */
  className?: string;
  /** Si true, utilise un span au lieu d'un div (pour inline) */
  as?: 'div' | 'span' | 'section';
}

/**
 * Reveal au scroll : fade-in + translate-Y subtil quand l'element entre en viewport.
 * Respecte prefers-reduced-motion (pas de translate, fade instantane).
 *
 * Usage :
 *   <Reveal>
 *     <h2>Mon titre</h2>
 *     <p>Mon paragraphe</p>
 *   </Reveal>
 */
export default function Reveal({
  children,
  y = ANIMATION.translate.standard,
  duration = ANIMATION.duration.medium,
  delay = 0,
  ease = ANIMATION.ease.out,
  className,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReduced) {
        // Pas d'anim, juste assurer la visibilite
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start: ANIMATION.trigger.start,
            once: ANIMATION.trigger.once,
          },
        },
      );
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <Tag ref={ref as never} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </Tag>
  );
}
```

### 1.2 `<StaggerChildren>` — anime les enfants en cascade

`app/(public)/_components/animations/StaggerChildren.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface StaggerChildrenProps {
  children: ReactNode;
  /** Selector CSS pour cibler les enfants directs (default: '> *') */
  childSelector?: string;
  /** Decalage entre enfants en secondes (default: 0.08) */
  stagger?: number;
  /** Distance Y en px (default: 16) */
  y?: number;
  /** Scale de depart (default: 1, pas de scale) — passer 0.96 pour un effet "se pose" */
  scale?: number;
  /** Duree de chaque enfant (default: 0.6) */
  duration?: number;
  className?: string;
}

/**
 * Anime les enfants directs d'un container en cascade.
 * Idéal pour les grids de cards, listes, etc.
 *
 * Usage :
 *   <StaggerChildren scale={0.96}>
 *     <Card />
 *     <Card />
 *     <Card />
 *   </StaggerChildren>
 */
export default function StaggerChildren({
  children,
  childSelector = '> *',
  stagger = ANIMATION.stagger.standard,
  y = ANIMATION.translate.standard,
  scale = 1,
  duration = ANIMATION.duration.medium,
  className,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      const targets = ref.current.querySelectorAll(childSelector);
      if (!targets.length) return;

      if (prefersReduced) {
        gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y, scale },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: ANIMATION.ease.out,
          scrollTrigger: {
            trigger: ref.current,
            start: ANIMATION.trigger.start,
            once: ANIMATION.trigger.once,
          },
        },
      );
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

### 1.3 `<HoverLift>` — micro-interaction hover sur cards

`app/(public)/_components/animations/HoverLift.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  /** Distance vers le haut au hover en px (default: 2) */
  lift?: number;
}

/**
 * Card qui monte legerement et gagne une ombre plus marquee au hover.
 * Cleanup automatique sur mouseleave.
 */
export default function HoverLift({ children, className, lift = 2 }: HoverLiftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;
    const el = ref.current;

    const onEnter = () => {
      gsap.to(el, {
        y: -lift,
        boxShadow: '0 8px 24px -8px rgba(60, 50, 40, 0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        y: 0,
        boxShadow: '0 0px 0px 0px rgba(60, 50, 40, 0)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, { dependencies: [prefersReduced, lift] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
```

### 1.4 `<DrawUnderline>` — underline qui se trace

`app/(public)/_components/animations/DrawUnderline.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface DrawUnderlineProps {
  children: ReactNode;
  /** Couleur de l'underline (default: var(--public-accent-warm)) */
  color?: string;
  /** Epaisseur en px (default: 2) */
  thickness?: number;
  /** Delai avant le trace en s (default: 0.4) */
  delay?: number;
  /** Duree du trace en s (default: 0.8) */
  duration?: number;
}

/**
 * Mot/groupe avec un underline qui se trace de gauche a droite.
 * Compatible inline (utilise span).
 *
 * Usage :
 *   <h1>Votre grossesse, accompagnee en <DrawUnderline>douceur</DrawUnderline>.</h1>
 */
export default function DrawUnderline({
  children,
  color = 'var(--public-accent-warm, #c9a47e)',
  thickness = 2,
  delay = 0.4,
  duration = 0.8,
}: DrawUnderlineProps) {
  const lineRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!lineRef.current) return;

    if (prefersReduced) {
      gsap.set(lineRef.current, { scaleX: 1 });
      return;
    }

    gsap.fromTo(
      lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration,
        delay,
        ease: 'power2.inOut',
      },
    );
  }, { dependencies: [prefersReduced] });

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span
        ref={lineRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '0.05em',
          height: thickness,
          backgroundColor: color,
          transformOrigin: 'left center',
          willChange: 'transform',
        }}
      />
    </span>
  );
}
```

### 1.5 `<FloatingDeco>` — décoration flottante (cycle infini)

`app/(public)/_components/animations/FloatingDeco.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface FloatingDecoProps {
  children: ReactNode;
  className?: string;
  /** Amplitude verticale en px (default: 6) */
  amplitude?: number;
  /** Duree d'un cycle complet en s (default: 4) */
  duration?: number;
  /** Delai d'entree en cycle (utile pour decorations multiples) */
  delay?: number;
}

/**
 * Wrap un element decoratif qui flotte doucement de haut en bas en boucle.
 * S'arrete completement si prefers-reduced-motion.
 *
 * Usage :
 *   <FloatingDeco amplitude={8} duration={5}>
 *     <BotanicalSvg />
 *   </FloatingDeco>
 */
export default function FloatingDeco({
  children,
  className,
  amplitude = 6,
  duration = 4,
  delay = 0,
}: FloatingDecoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    gsap.to(ref.current, {
      y: amplitude,
      duration,
      delay,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, { dependencies: [prefersReduced, amplitude, duration, delay] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
```

### 1.6 `<HeroEntrance>` — entrée hero spéciale (mount)

`app/(public)/_components/animations/HeroEntrance.tsx` :

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface HeroEntranceProps {
  children: ReactNode;
  className?: string;
  /** Opacity de depart (default: 0.6 pour la photo, 0 pour texte) */
  fromOpacity?: number;
  /** Scale de depart (default: 1.02) */
  fromScale?: number;
  /** Duree (default: 1.2) */
  duration?: number;
  /** Delai (default: 0) */
  delay?: number;
}

/**
 * Animation au mount (pas scroll-trigger). Utiliser pour le hero qui apparait
 * a l'arrivee sur la page, sans attendre que l'utilisateur scroll.
 *
 * Pour la photo de Judith : opacity 0.6 -> 1 + scale 1.02 -> 1
 *   <HeroEntrance fromOpacity={0.6}>
 *     <picture>...</picture>
 *   </HeroEntrance>
 */
export default function HeroEntrance({
  children,
  className,
  fromOpacity = 0,
  fromScale = 1.02,
  duration = 1.2,
  delay = 0,
}: HeroEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current) return;

    if (prefersReduced) {
      gsap.set(ref.current, { opacity: 1, scale: 1 });
      return;
    }

    gsap.fromTo(
      ref.current,
      { opacity: fromOpacity, scale: fromScale },
      { opacity: 1, scale: 1, duration, delay, ease: 'power3.out' },
    );
  }, { dependencies: [prefersReduced, fromOpacity, fromScale] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
```

### 1.7 `<AnimatedArrow>` — flèche qui slide au hover du parent

`app/(public)/_components/animations/AnimatedArrow.tsx` :

Plus simple, basé sur du CSS pur via une classe utilitaire — pas besoin de GSAP. Crée juste la classe Tailwind dans `app/globals.css` :

```css
/* Ajouter dans app/globals.css */
@layer utilities {
  /* Lien avec fleche qui slide vers la droite au hover */
  .arrow-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    transition: gap 240ms ease-out;
  }
  .arrow-link:hover {
    gap: 0.5em;
  }

  /* Reduced motion : pas d'animation */
  @media (prefers-reduced-motion: reduce) {
    .arrow-link {
      transition: none;
    }
    .arrow-link:hover {
      gap: 0.25em;
    }
  }
}
```

Pas de composant React nécessaire pour celui-ci, juste appliquer `className="arrow-link"` aux liens existants qui contiennent déjà `→`.

---

## Phase 2 — Page labo

### 2.1 Cloner les sections dans `_lab/`

Créer `app/(public)/_sections/_lab/` et y copier les 8 sections de Fertilité avec un suffixe `Lab` :

- `ServiceFertiliteHeroSectionLab.tsx`
- `ServiceFertiliteBioSectionLab.tsx`
- `ServiceFertiliteBenefitsSectionLab.tsx`
- `ServiceFertiliteHommeSectionLab.tsx`
- `ServiceFertiliteCollaborationSectionLab.tsx`
- `ServiceFertiliteTemoignageSectionLab.tsx`
- `ServiceFertiliteInfosSectionLab.tsx`
- `ServiceFertiliteCtaSectionLab.tsx`

**Important** : ne PAS copier-coller le code original tel quel. Pour chaque clone, adapter pour utiliser les wrappers d'animation. Voir Phase 3 pour les modifications par section.

### 2.2 Page labo

Créer `app/(public)/lab/animations/page.tsx` :

```tsx
import type { Metadata } from 'next';
import GsapBootstrap from './GsapBootstrap';
import ServiceFertiliteHeroSectionLab from '../../_sections/_lab/ServiceFertiliteHeroSectionLab';
import ServiceFertiliteBioSectionLab from '../../_sections/_lab/ServiceFertiliteBioSectionLab';
import ServiceFertiliteBenefitsSectionLab from '../../_sections/_lab/ServiceFertiliteBenefitsSectionLab';
import ServiceFertiliteHommeSectionLab from '../../_sections/_lab/ServiceFertiliteHommeSectionLab';
import ServiceFertiliteCollaborationSectionLab from '../../_sections/_lab/ServiceFertiliteCollaborationSectionLab';
import ServiceFertiliteTemoignageSectionLab from '../../_sections/_lab/ServiceFertiliteTemoignageSectionLab';
import ServiceFertiliteInfosSectionLab from '../../_sections/_lab/ServiceFertiliteInfosSectionLab';
import ServiceFertiliteCtaSectionLab from '../../_sections/_lab/ServiceFertiliteCtaSectionLab';

export const metadata: Metadata = {
  title: 'LAB · Animations',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AnimationsLabPage() {
  return (
    <>
      <GsapBootstrap />

      {/* Banniere LAB visible en haut de page */}
      <div className="bg-amber-500 text-white text-center py-2 text-[12px] font-semibold uppercase tracking-[2px]">
        LAB · Page de test animations · Non indexée
      </div>

      <ServiceFertiliteHeroSectionLab />
      <ServiceFertiliteBioSectionLab />
      <ServiceFertiliteBenefitsSectionLab />
      <ServiceFertiliteHommeSectionLab />
      <ServiceFertiliteCollaborationSectionLab />
      <ServiceFertiliteTemoignageSectionLab />
      <ServiceFertiliteInfosSectionLab />
      <ServiceFertiliteCtaSectionLab />
    </>
  );
}
```

### 2.3 GsapBootstrap (registre ScrollTrigger)

`app/(public)/lab/animations/GsapBootstrap.tsx` :

```tsx
'use client';

import { useEffect } from 'react';
import { setupGsap } from '@/lib/animations/setup';

export default function GsapBootstrap() {
  useEffect(() => {
    setupGsap();
  }, []);
  return null;
}
```

---

## Phase 3 — Implémentation par section (Tier 1, 2, 3)

Pour chaque section clonée, voici les animations à appliquer. **Tier 1 (reveal de base) = appliqué partout**. Tiers 2 et 3 = sélectif selon la section.

### 3.1 `ServiceFertiliteHeroSectionLab` — TIER 2 (entrée hero)

Modifications par rapport à l'original :
- Wrapper la **photo** de Judith dans `<HeroEntrance fromOpacity={0.6} fromScale={1.02} duration={1.2}>`. C'est le seul élément qui démarre à 0.6 (effet "elle apparaît dans l'image").
- Wrapper le **kicker** + **titre H1** + **paragraphe** + **bloc CTA** dans des `<HeroEntrance fromOpacity={0} fromScale={1}>` avec délais en cascade : 0s, 0.15s, 0.3s, 0.45s.
- Le mot souligné dans le H1 (`<em>douceur</em>`) est wrappé dans `<DrawUnderline delay={0.6} duration={0.8}>` — l'underline se trace après que le H1 soit apparu.
- **Note importante** : retirer la classe `decoration-public-accent-warm decoration-2 underline-offset-8` du `<em>` puisque l'underline est maintenant dessiné par `<DrawUnderline>`. Sinon il y aura un double underline.

### 3.2 `ServiceFertiliteBioSectionLab` — TIER 1 + TIER 2 (sectionNumber)

- Wrapper le **titre + kicker (SectionHeading)** dans un `<Reveal>`.
- Le **SectionNumber "01"** → wrapper dans un `<Reveal y={8} delay={0.1}>` distinct, avec un translate-X de -8px à la place de translate-Y. Pour faire ça proprement, créer une variante quick : utiliser la prop `y={0}` et passer un translateX inline via un wrapper div avec style. Ou plus simple : créer un autre composant `<RevealFromLeft>` réutilisable. **Choisir cette deuxième option** : créer `app/(public)/_components/animations/RevealFromLeft.tsx` calqué sur `<Reveal>` mais animant `x` au lieu de `y` (de -8px à 0).
- Wrapper les **paragraphes texte** dans un `<Reveal delay={0.2}>` (juste après le titre).
- Wrapper le **badge OAQ** (en bas de section) dans un `<Reveal delay={0.4}>`.

### 3.3 `ServiceFertiliteBenefitsSectionLab` — TIER 1 + TIER 2 (cards stagger + hover)

- Wrapper le **titre/kicker** dans un `<Reveal>`.
- Wrapper le **paragraphe d'intro** dans un `<Reveal delay={0.15}>`.
- Pour le **grid de cards Bénéfices** : wrapper le `<div className="grid ...">` dans un `<StaggerChildren scale={0.96} y={20}>`. Ça anime les 6 cards en cascade avec un léger scale-up (0.96 → 1) qui donne le sentiment "elles se posent".
- Chaque card individuelle dans le grid : wrapper son contenu actuel dans `<HoverLift>`. Ça donne le hover translate-Y -2 + ombre.
- Le **lien "Pour aller plus loin"** en bas → ajouter `className="arrow-link"` au lien existant pour activer l'animation CSS de la flèche.

### 3.4 `ServiceFertiliteHommeSectionLab` — TIER 1

- Wrapper **SectionHeading** dans un `<Reveal>`.
- Wrapper les **3 paragraphes** dans un `<StaggerChildren stagger={0.1}>` (cascade légère pour donner du rythme à la lecture).

### 3.5 `ServiceFertiliteCollaborationSectionLab` — TIER 1

- Wrapper le **SectionHeading** dans un `<Reveal>`.
- Wrapper les **paragraphes** dans un `<Reveal delay={0.2}>`.
- Lien "voir les ressources" si présent → `arrow-link`.

### 3.6 `ServiceFertiliteTemoignageSectionLab` — TIER 1

- Wrapper la **TestimonialCard** dans un `<Reveal y={24} duration={0.8}>` avec un `y` un peu plus prononcé pour donner de l'importance au témoignage.

### 3.7 `ServiceFertiliteInfosSectionLab` — TIER 1 + TIER 2 (cards)

- Wrapper le **SectionHeading** dans un `<Reveal>`.
- Le **grid des 3 InfoCards** : `<StaggerChildren scale={0.96}>`.
- Chaque InfoCard : wrapper dans `<HoverLift>`.

### 3.8 `ServiceFertiliteCtaSectionLab` — TIER 3 (la section "vitrine")

C'est la section où on déploie tout. Modifications par rapport à l'original :

**A. Background gradient shift**

Dans le `<section>` racine, remplacer :
```tsx
className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark ..."
```
par une `div` enfant qui contient le gradient animé via GSAP. Plus simple : ajouter une classe CSS `.cta-bg-shift` dans `globals.css` :

```css
@layer utilities {
  .cta-bg-shift {
    background: linear-gradient(180deg, var(--public-accent-taupe), var(--public-accent-taupe-dark));
    background-size: 200% 200%;
    animation: ctaBgShift 12s ease-in-out infinite;
  }

  @keyframes ctaBgShift {
    0%, 100% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-bg-shift {
      animation: none;
    }
  }
}
```
Puis utiliser `className="cta-bg-shift ..."` à la place du gradient inline.

**B. Botanical SVG floating**

Le composant `CtaBotanicalDeco` — wrapper son contenu (les feuilles SVG) dans `<FloatingDeco amplitude={6} duration={4}>`. Si `CtaBotanicalDeco` contient plusieurs SVG, wrapper chacun avec un `delay` différent (0s, 1s, 2s) pour que les feuilles ne flottent pas en synchro — donne un effet plus naturel.

**Important** : `CtaBotanicalDeco` est utilisé partout sur le site. Pour ne pas casser les autres pages, créer `CtaBotanicalDecoLab.tsx` dans `_components/_lab/` plutôt que modifier l'original. Quand on propagera, on remplacera l'original.

**C. Reveal CTA section avec translateY plus prononcé**

Wrapper le **bloc texte H2 + paragraphe + boutons** dans un `<Reveal y={32} duration={0.8} delay={0.2}>`. Le 32px donne un effet "qui émerge du bas" plus fort que le 16 standard.

**D. Boutons CTA shimmer**

Sur le bouton primary `<CtaButton variant="white">` ajouter une classe `.shimmer-cta` :

```css
@layer utilities {
  .shimmer-cta {
    position: relative;
    overflow: hidden;
  }
  .shimmer-cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmerSweep 8s ease-in-out infinite;
    animation-delay: 4s; /* premier shimmer apres 4s, pas immediatement */
    pointer-events: none;
  }

  @keyframes shimmerSweep {
    0% { left: -100%; }
    15% { left: 200%; }
    100% { left: 200%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-cta::before { animation: none; display: none; }
  }
}
```

Sur le bouton dans la section CTA labo, ajouter `className="shimmer-cta ..."`.

**Note importante** : si le shimmer paraît trop "marketing" lors de l'évaluation visuelle, on peut le retirer en supprimant la classe — c'est un changement isolé et facile à reverser. Le shimmer est explicitement le candidat le plus risqué.

---

## Phase 4 — Validation et tests

### 4.1 Tests automatiques

```bash
# Verifier que la build passe
npm run build

# Verifier qu'il n'y a pas d'erreurs TypeScript
npx tsc --noEmit

# Verifier le lint
npm run lint
```

### 4.2 Tests visuels manuels

Lancer le dev server et naviguer vers `http://localhost:3000/lab/animations` :

- [ ] Page se charge sans erreur (console DevTools propre)
- [ ] Banniere "LAB" jaune visible en haut
- [ ] Hero : photo apparaît avec fade + scale subtil au mount (~1.2s)
- [ ] Hero : titre H1 apparaît, puis underline du mot souligné se trace
- [ ] Au scroll : chaque section apparaît avec fade + translate-Y subtil
- [ ] Bénéfices : les cards apparaissent en cascade (stagger visible mais pas trop lent)
- [ ] Hover sur une card Bénéfices : lift subtil + ombre apparaît
- [ ] CTA bas de page : background gradient shift très lent (visible si on observe ~12s)
- [ ] CTA bas de page : feuilles SVG flottent doucement
- [ ] CTA bas de page : bouton "Prendre rendez-vous" a un shimmer toutes les ~8s
- [ ] Liens "→" ont une flèche qui slide vers la droite au hover

### 4.3 Tests prefers-reduced-motion

Activer `prefers-reduced-motion` dans le système (macOS : Système → Accessibilité → Affichage → Réduire les animations) ou via DevTools Chrome (Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`). Recharger `/lab/animations` :

- [ ] Aucun translate, aucun scale, aucun mouvement répété
- [ ] Le contenu apparaît immédiatement (opacity 1)
- [ ] Le shimmer du bouton CTA est désactivé
- [ ] Les feuilles botaniques ne flottent plus
- [ ] Le background gradient ne shift plus

### 4.4 Tests Lighthouse

```bash
# Build prod en local pour test realiste
npm run build && npm run start
# Puis dans un autre terminal :
npx lighthouse http://localhost:3000/lab/animations --view
```

- [ ] Performance : ≥ 90 (idealement 95+)
- [ ] Accessibility : 100 (pas de regression)
- [ ] Best Practices : 100
- [ ] SEO : ≥ 95 (peut etre legerement bas car noindex sur cette page, c'est attendu)

Si Performance < 90 :
- Verifier que `will-change` n'est pas applique en permanence sur trop d'elements (lourd pour le GPU)
- Verifier que ScrollTrigger.refresh() n'est pas appele en boucle
- Considerer la lazy-load du composant `<HeroEntrance>` pour reduire le JS initial bundle

### 4.5 Tests mobile (3G simulé)

Dans Chrome DevTools : Network → Throttling → Slow 3G + Device toolbar → iPhone SE.

- [ ] Page reste utilisable pendant le chargement (pas de freeze)
- [ ] Animations s'enclenchent correctement même sur connection lente
- [ ] Pas de Cumulative Layout Shift visible (les wrappers d'anim ne reservent pas mal l'espace)

---

## Critères d'acceptation finaux

Avant de présenter à Benoit :

- [ ] Tous les fichiers nouveaux compilent sans erreur TypeScript
- [ ] `npm run build` réussit
- [ ] La page `/lab/animations` est accessible et fonctionne
- [ ] Le `robots noindex` est bien en place dans la metadata
- [ ] Les sections originales `ServiceFertilite*.tsx` n'ont **pas été modifiées** (`git diff app/\(public\)/_sections/ServiceFertilite*.tsx` doit être vide)
- [ ] La page Fertilité originale `/services/fertilite` continue de fonctionner exactement comme avant
- [ ] Lighthouse Performance ≥ 90 sur `/lab/animations`
- [ ] `prefers-reduced-motion` désactive bien toutes les animations de mouvement

---

## Stratégie de propagation (si labo validé)

Cette mission ne couvre PAS la propagation. Une fois le labo validé visuellement par Benoit, voici l'approche pour étendre aux autres pages (à faire dans une mission CC séparée) :

1. Appliquer les wrappers d'animation directement aux sections originales (pas de clonage cette fois). Les sections deviennent des composants client (`'use client'` en top) ou utilisent des wrappers client là où nécessaire.
2. Ordre de propagation suggéré :
   - Pages services : Grossesse, Pédiatrie, Sociale (mêmes patterns que Fertilité)
   - Page Accueil (sections Hero, Piliers, Approche, Témoignages, About, Sociale, CTA Final)
   - Page À propos
   - Page Tarifs
   - Page FAQ
   - Pages Ressources (rendu Firestore — wrapper le `<RessourceLayout>`)
3. Supprimer le dossier `_lab/` et la route `/lab/animations` une fois la propagation terminée.
4. Garder les composants `_components/animations/` (ils sont la base de la stratégie d'animation du site).

---

## Résumé des fichiers

### Créés
- `lib/hooks/useReducedMotion.ts`
- `lib/animations/constants.ts`
- `lib/animations/setup.ts`
- `app/(public)/_components/animations/Reveal.tsx`
- `app/(public)/_components/animations/RevealFromLeft.tsx`
- `app/(public)/_components/animations/StaggerChildren.tsx`
- `app/(public)/_components/animations/HoverLift.tsx`
- `app/(public)/_components/animations/DrawUnderline.tsx`
- `app/(public)/_components/animations/FloatingDeco.tsx`
- `app/(public)/_components/animations/HeroEntrance.tsx`
- `app/(public)/_components/_lab/CtaBotanicalDecoLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteHeroSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteBioSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteBenefitsSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteHommeSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteCollaborationSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteTemoignageSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteInfosSectionLab.tsx`
- `app/(public)/_sections/_lab/ServiceFertiliteCtaSectionLab.tsx`
- `app/(public)/lab/animations/page.tsx`
- `app/(public)/lab/animations/GsapBootstrap.tsx`

### Modifiés
- `package.json` (+ `@gsap/react`)
- `app/globals.css` (+ utilities `arrow-link`, `cta-bg-shift`, `shimmer-cta`)

### Non modifiés (vérifier explicitement)
- Tous les fichiers `app/(public)/_sections/ServiceFertilite*.tsx` (sans `_Lab`)
- `app/(public)/services/fertilite/page.tsx`
- `app/(public)/_components/CtaBotanicalDeco.tsx` (l'original)

---

## Commit

Un seul commit en fin de mission :

```
feat(lab): page laboratoire animations GSAP

- Setup GSAP + ScrollTrigger + @gsap/react
- Hook useReducedMotion (SSR-safe)
- 7 composants animation reutilisables (Reveal, StaggerChildren, HoverLift,
  DrawUnderline, FloatingDeco, HeroEntrance, RevealFromLeft)
- 3 utilities CSS (arrow-link, cta-bg-shift, shimmer-cta)
- Page /lab/animations clonant la structure de Fertilite, instrumentee
  avec Tiers 1 (reveal scroll) + 2 (touches premium) + 3 (CTA vitrine)
- Robots noindex sur la page labo
- Pages publiques originales NON modifiees

Tests :
- Build OK, TypeScript OK
- Lighthouse Performance >= 90 sur la page labo
- prefers-reduced-motion desactive correctement les translate/scale/loops
- Aucun changement visuel ou comportemental sur les pages publiques
```
