'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface StaggerChildrenProps {
  children: ReactNode;
  childSelector?: string;
  stagger?: number;
  y?: number;
  scale?: number;
  duration?: number;
  className?: string;
}

export default function StaggerChildren({
  children,
  childSelector = ':scope > *',
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
      // Selector valide en CSS standard. Si l'utilisateur passe '> *' par habitude,
      // on le corrige automatiquement en ':scope > *'.
      const safeSelector = childSelector.trim().startsWith('>')
        ? `:scope ${childSelector.trim()}`
        : childSelector;
      const targets = ref.current.querySelectorAll(safeSelector);
      if (!targets.length) return;
      if (prefersReduced) {
        gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
        return;
      }
      gsap.fromTo(
        targets,
        { opacity: 0, y, scale },
        {
          opacity: 1, y: 0, scale: 1, duration, stagger, ease: ANIMATION.ease.out,
          scrollTrigger: { trigger: ref.current, start: ANIMATION.trigger.start, once: ANIMATION.trigger.once },
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
