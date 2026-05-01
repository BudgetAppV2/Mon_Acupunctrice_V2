'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import GrainOverlay from '../_components/GrainOverlay';
import CtaButton from '../_components/CtaButton';
import MagneticButton from '../_components/animations/MagneticButton';

export default function ServiceGrossesseHeroSection() {
  const photoRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const h1Line1Ref = useRef<HTMLSpanElement>(null);
  const h1Line2Ref = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!photoRef.current) return;
      if (prefersReduced) {
        gsap.set([photoRef.current, kickerRef.current, h1Line1Ref.current, h1Line2Ref.current, paragraphRef.current, ctasRef.current], { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' });
        gsap.set(underlineRef.current, { scaleX: 1 });
        return;
      }
      gsap.set(photoRef.current, { clipPath: 'inset(0 0 100% 0)', scale: 1.08, opacity: 1 });
      gsap.set([kickerRef.current, h1Line1Ref.current, h1Line2Ref.current, paragraphRef.current, ctasRef.current], { opacity: 1, y: 28 });
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(photoRef.current, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.4, ease: 'power2.inOut' }, 0);
      tl.to(kickerRef.current, { y: 0, duration: 0.7 }, 0.3);
      tl.to(h1Line1Ref.current, { y: 0, duration: 0.8 }, 0.45);
      tl.to(h1Line2Ref.current, { y: 0, duration: 0.8 }, 0.7);
      tl.to(underlineRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.1);
      tl.to(paragraphRef.current, { y: 0, duration: 0.7 }, 0.9);
      tl.to(ctasRef.current, { y: 0, duration: 0.7 }, 1.1);
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        <div>
          <span ref={kickerRef} className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4" style={{ willChange: 'transform, opacity', opacity: 1 }}>
            GROSSESSE &amp; P&Eacute;RINATALIT&Eacute; &middot; ROSEMONT &amp; REPENTIGNY
          </span>
          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            <span ref={h1Line1Ref} className="inline-block" style={{ willChange: 'transform, opacity', opacity: 1 }}>
              Votre grossesse, accompagn&eacute;e en{' '}
            </span>
            <span ref={h1Line2Ref} className="inline-block" style={{ willChange: 'transform, opacity', position: 'relative', opacity: 1 }}>
              <em className="italic">douceur</em>
              <span ref={underlineRef} aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: '0.05em', height: 2, backgroundColor: '#B8694A', willChange: 'transform', transform: 'scaleX(0)', transformOrigin: 'left center' }} />
            </span>
            .
          </h1>
          <p ref={paragraphRef} className="text-[18px] leading-relaxed text-public-text-medium mb-8" style={{ willChange: 'transform, opacity', opacity: 1 }}>
            Naus&eacute;es qui durent, douleurs au dos, b&eacute;b&eacute; en si&egrave;ge, stress de l&rsquo;accouchement. &Agrave; chaque trimestre, l&rsquo;acupuncture peut &ecirc;tre un alli&eacute; pr&eacute;cieux &mdash; document&eacute; par la recherche, et pratiqu&eacute; ici avec exp&eacute;rience.
          </p>
          <div ref={ctasRef} className="flex flex-wrap gap-4" style={{ willChange: 'transform, opacity', opacity: 1 }}>
            <MagneticButton range={100} strength={0.35}>
              <CtaButton variant="primary" size="lg" href="/reserver">Prendre rendez-vous</CtaButton>
            </MagneticButton>
            <MagneticButton range={80} strength={0.25}>
              <CtaButton variant="secondary" href="/ressources/acupuncture-grossesse-montreal">Lire le guide complet</CtaButton>
            </MagneticButton>
          </div>
        </div>
        <div ref={photoRef} className="max-w-[420px] mx-auto md:max-w-none" style={{ willChange: 'transform, clip-path', clipPath: 'inset(0 0 100% 0)' }}>
          <picture>
            <source srcSet="/site/judith/judith-portrait-06.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-06.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/site/judith/judith-portrait-06.webp" alt="Judith en consultation grossesse" width={1600} height={2400} loading="eager" fetchPriority="high" className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo" />
          </picture>
        </div>
      </div>
    </GrainOverlay>
  );
}
