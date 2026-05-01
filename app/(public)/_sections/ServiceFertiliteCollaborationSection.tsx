'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteCollaborationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (prefersReduced) {
        gsap.set([lineRef.current, headingRef.current, textRef.current], { opacity: 1, scaleX: 1, y: 0 });
        return;
      }
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set([headingRef.current, textRef.current], { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        defaults: { ease: 'power3.out' },
      });
      tl.to(lineRef.current, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' });
      tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.6');
      tl.to(textRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <section ref={sectionRef} className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[780px] mx-auto">
        <SectionNumber number="03" align="left" />
        <span ref={lineRef} aria-hidden="true" className="block mb-8 h-[2px] w-full" style={{ backgroundColor: '#B8694A', willChange: 'transform' }} />
        <div ref={headingRef} style={{ willChange: 'transform, opacity' }}>
          <SectionHeading kicker="COMPL&Eacute;MENT, JAMAIS OPPOSITION" title="J&rsquo;accompagne votre suivi m&eacute;dical." align="left" />
        </div>
        <div ref={textRef} className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium" style={{ willChange: 'transform, opacity' }}>
          <p>
            J&rsquo;accompagne r&eacute;guli&egrave;rement des femmes suivies dans les cliniques
            de fertilit&eacute; de Montr&eacute;al. Mon r&ocirc;le est compl&eacute;mentaire &agrave;
            votre suivi m&eacute;dical, jamais en opposition.
          </p>
          <p>
            Si vous avez des r&eacute;sultats d&rsquo;examens (bilan hormonal, hyst&eacute;rosalpingographie,
            bilan de fertilit&eacute;), apportez-les. On pourra en discuter ensemble.
          </p>
        </div>
      </div>
    </section>
  );
}
