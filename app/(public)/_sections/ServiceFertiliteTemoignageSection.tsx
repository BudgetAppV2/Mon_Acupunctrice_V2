'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export default function ServiceFertiliteTemoignageSection() {
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
      gsap.set(quoteMarkRef.current, { opacity: 0, scale: 0.4 });
      gsap.set(quoteTextRef.current, { opacity: 0, y: 24 });
      gsap.set(signatureRef.current, { opacity: 0, x: -16 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%', once: true },
        defaults: { ease: 'power3.out' },
      });
      tl.to(quoteMarkRef.current, { opacity: 0.6, scale: 1, duration: 1.0 });
      tl.to(quoteTextRef.current, { opacity: 1, y: 0, duration: 0.9 }, '-=0.5');
      tl.to(signatureRef.current, { opacity: 1, x: 0, duration: 0.7 }, '-=0.3');
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div ref={containerRef} className="max-w-[780px] mx-auto relative">
        <span ref={quoteMarkRef} aria-hidden="true" className="font-public-serif text-public-accent-warm leading-none block mb-2" style={{ fontSize: 'clamp(96px, 14vw, 180px)', willChange: 'transform, opacity', transformOrigin: 'left center' }}>
          &ldquo;
        </span>
        <blockquote className="ml-2 md:ml-6">
          <p ref={quoteTextRef} className="font-public-serif text-[22px] md:text-[28px] leading-[1.5] text-public-text-dark italic" style={{ willChange: 'transform, opacity' }}>
            Juste un petit mot pour te dire que j&rsquo;ai eu un beau &laquo;&nbsp;positif&nbsp;&raquo;. Je suis enceinte. Le dernier traitement que tu m&rsquo;as fait m&rsquo;a beaucoup aid&eacute;e, car le stress n&rsquo;est pas revenu apr&egrave;s.
          </p>
          <div ref={signatureRef} className="mt-6 flex items-center gap-3" style={{ willChange: 'transform, opacity' }}>
            <span className="block w-10 h-px bg-public-accent-warm" aria-hidden="true" />
            <div>
              <cite className="not-italic font-medium text-public-text-dark text-[15px]">Cliente, 41 ans</cite>
              <span className="block text-[12px] text-public-text-light mt-0.5">T&eacute;moignage partag&eacute; avec son accord</span>
            </div>
          </div>
        </blockquote>
      </div>
    </section>
  );
}
