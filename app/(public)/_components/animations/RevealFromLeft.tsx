'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface RevealFromLeftProps {
  children: ReactNode;
  x?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function RevealFromLeft({
  children,
  x = -8,
  duration = ANIMATION.duration.medium,
  delay = 0,
  className,
}: RevealFromLeftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReduced) {
        gsap.set(ref.current, { opacity: 1, x: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, x },
        {
          opacity: 1, x: 0, duration, delay, ease: ANIMATION.ease.out,
          scrollTrigger: { trigger: ref.current, start: ANIMATION.trigger.start, once: ANIMATION.trigger.once },
        },
      );
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
