'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface RevealProps {
  children: ReactNode;
  y?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  className?: string;
  as?: 'div' | 'span' | 'section';
}

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
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1, y: 0, duration, delay, ease,
          scrollTrigger: { trigger: ref.current, start: ANIMATION.trigger.start, once: ANIMATION.trigger.once },
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
