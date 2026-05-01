'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Reveal from '../../_components/animations/Reveal';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import SectionNumber from '../../_components/SectionNumber';
import SectionHeading from '../../_components/SectionHeading';

const BENEFITS = [
  "Régulariser un cycle menstruel irrégulier",
  "Améliorer la circulation sanguine vers l'utérus",
  "Soutenir la qualité de l'endomètre",
  "Atténuer le stress et l'anxiété",
  "Mieux tolérer les traitements hormonaux (FIV, IIU)",
  "Accompagner le SOPK ou l'endométriose",
];

export default function ServiceFertiliteBenefitsSectionLab() {
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('[data-benefit-card]');
      if (!cards.length) return;

      if (prefersReduced) {
        gsap.set(cards, { opacity: 1, clipPath: 'inset(0 0 0 0)' });
        return;
      }

      // Etat initial : clip-path masque la card depuis le bas
      gsap.set(cards, {
        opacity: 1,
        clipPath: 'inset(0 0 100% 0)',
      });

      // Reveal mask en stagger au scroll-trigger
      gsap.to(cards, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <section className="bg-public-beige-warm py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="02" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading kicker="CE QUE L'ACUPUNCTURE FAIT" title="Un soutien concret, pas des promesses." align="left" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 mb-10 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
            L&rsquo;acupuncture peut offrir plusieurs b&eacute;n&eacute;fices mesurables &mdash; physiologiques et &eacute;motionnels.
          </p>
        </Reveal>

        {/* Grid avec reveal mask en stagger sur chaque card */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit}
              data-benefit-card
              className="bg-white/70 backdrop-blur-sm rounded-[12px] p-5 border border-public-border-subtle flex items-start gap-3 transition-shadow hover:shadow-public-md"
              style={{ willChange: 'clip-path' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              <span className="text-[15px] text-public-text-medium leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <a href="/ressources/acupuncture-fertilite-montreal" className="arrow-link text-[14px] font-medium text-public-accent-warm underline underline-offset-4">
            Explorez les &eacute;tudes scientifiques &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
