'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
}

export default function HoverLift({ children, className, lift = 2 }: HoverLiftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;
    const el = ref.current;
    const onEnter = () => gsap.to(el, { y: -lift, boxShadow: '0 8px 24px -8px rgba(60,50,40,0.15)', duration: 0.3, ease: 'power2.out' });
    const onLeave = () => gsap.to(el, { y: 0, boxShadow: '0 0 0 0 rgba(60,50,40,0)', duration: 0.3, ease: 'power2.out' });
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); };
  }, { dependencies: [prefersReduced, lift] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
