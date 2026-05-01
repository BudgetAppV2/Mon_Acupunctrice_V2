'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

/**
 * Version Lab du temoignage avec :
 * - Grand guillemet decoratif qui se trace + scale au scroll
 * - Quote text qui apparait en fade + translate-Y apres
 * - Signature en bas qui glisse depuis la gauche
 *
 * Tout orchestre dans une seule timeline GSAP scroll-triggered.
 */
export default function ServiceFertiliteTemoignageSectionLab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteMarkRef = useRef<HTMLSpanElement>(null);
  const quoteTextRef = useRef<HTMLParagraphElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      if (prefersReduced) {
        gsap.set([quoteMarkRef.current, quoteTextRef.current, signatureRef.current], { opacity: 1, scale: 1, x: 0, y: 0 });
        return;
      }

      // Etats initiaux
      gsap.set(quoteMarkRef.current, { opacity: 0, scale: 0.4 });
      gsap.set(quoteTextRef.current, { opacity: 0, y: 24 });
      gsap.set(signatureRef.current, { opacity: 0, x: -16 });

      // Timeline scroll-triggered
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      });

      // 1. Le grand guillemet apparait en grandissant
      tl.to(quoteMarkRef.current, {
        opacity: 0.6,
        scale: 1,
        duration: 1.0,
      });

      // 2. Le texte de la citation arrive
      tl.to(
        quoteTextRef.current,
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.5', // chevauche avec la fin du guillemet
      );

      // 3. La signature glisse depuis la gauche
      tl.to(
        signatureRef.current,
        { opacity: 1, x: 0, duration: 0.7 },
        '-=0.3',
      );
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div ref={containerRef} className="max-w-[780px] mx-auto relative">
        {/* Grand guillemet decoratif */}
        <span
          ref={quoteMarkRef}
          aria-hidden="true"
          className="font-public-serif text-public-accent-warm leading-none block mb-2"
          style={{
            fontSize: 'clamp(96px, 14vw, 180px)',
            willChange: 'transform, opacity',
            transformOrigin: 'left center',
          }}
        >
          &ldquo;
        </span>

        {/* Citation */}
        <blockquote className="ml-2 md:ml-6">
          <p
            ref={quoteTextRef}
            className="font-public-serif text-[22px] md:text-[28px] leading-[1.5] text-public-text-dark italic"
            style={{ willChange: 'transform, opacity' }}
          >
            Juste un petit mot pour te dire que j&rsquo;ai eu un beau &laquo;&nbsp;positif&nbsp;&raquo;.
            Le dernier traitement m&rsquo;a beaucoup aid&eacute;e.
          </p>

          {/* Signature */}
          <div
            ref={signatureRef}
            className="mt-6 flex items-center gap-3"
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="block w-10 h-px bg-public-accent-warm" aria-hidden="true" />
            <div>
              <cite className="not-italic font-medium text-public-text-dark text-[15px]">Cliente, 41 ans</cite>
              <span className="block text-[12px] text-public-text-light mt-0.5">
                T&eacute;moignage partag&eacute; avec son accord
              </span>
            </div>
          </div>
        </blockquote>
      </div>
    </section>
  );
}
