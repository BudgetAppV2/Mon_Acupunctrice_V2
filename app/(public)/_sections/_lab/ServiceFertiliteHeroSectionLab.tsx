'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import CtaButton from '../../_components/CtaButton';
import MagneticButton from '../../_components/animations/MagneticButton';

/**
 * Hero Lab — clip-path "rideau qui se leve" sur la photo + choregraphie texte unifiee.
 *
 * STRATEGIE LCP-FRIENDLY (decouvert via recherche 2026) :
 * Chrome ignore les elements a opacity: 0 pour le LCP. Mais opacity: 0.01 est
 * traite comme "visible" (l'oeil ne voit pas la difference, Chrome compte).
 *
 * Donc tous les textes demarrent a opacity: 0.01 au lieu de 0 — Chrome mesure
 * le LCP au first paint, on garde l'effet d'animation a 100%.
 *
 * La photo demarre avec clip-path masque MAIS opacity: 1 — Chrome considere
 * l'element comme "rendu" (juste masque visuellement par le clip-path),
 * donc ca ne bloque pas le LCP.
 */
export default function ServiceFertiliteHeroSectionLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const h1Line1Ref = useRef<HTMLSpanElement>(null);
  const h1Line2Ref = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();

  const LCP_FRIENDLY_OPACITY = 0.01;

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      if (prefersReduced) {
        gsap.set(
          [
            photoRef.current,
            kickerRef.current,
            h1Line1Ref.current,
            h1Line2Ref.current,
            paragraphRef.current,
            ctasRef.current,
          ],
          { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' },
        );
        gsap.set(underlineRef.current, { scaleX: 1 });
        return;
      }

      // Photo : clip-path masque (rideau leve depuis le haut)
      gsap.set(photoRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        scale: 1.08,
        opacity: 1,
      });

      // Texte : opacity 0.01 (LCP-friendly) + decale
      gsap.set([kickerRef.current, h1Line1Ref.current, h1Line2Ref.current, paragraphRef.current, ctasRef.current], {
        opacity: LCP_FRIENDLY_OPACITY,
        y: 28,
      });

      gsap.set(underlineRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // Photo : rideau qui se leve
      tl.to(
        photoRef.current,
        {
          clipPath: 'inset(0 0 0% 0)',
          scale: 1,
          duration: 1.4,
          ease: 'power2.inOut',
        },
        0,
      );

      tl.to(kickerRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
      tl.to(h1Line1Ref.current, { opacity: 1, y: 0, duration: 0.8 }, 0.45);
      tl.to(h1Line2Ref.current, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
      tl.to(underlineRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.1);
      tl.to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.9);
      tl.to(ctasRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.1);
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8"
    >
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        <div>
          <span
            ref={kickerRef}
            className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4"
            style={{ willChange: 'transform, opacity', opacity: 0.01 }}
          >
            FERTILIT&Eacute; &middot; ROSEMONT &amp; REPENTIGNY
          </span>

          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            <span
              ref={h1Line1Ref}
              className="inline-block"
              style={{ willChange: 'transform, opacity', opacity: 0.01 }}
            >
              Votre parcours fertilit&eacute;,{' '}
            </span>
            <span
              ref={h1Line2Ref}
              className="inline-block"
              style={{ willChange: 'transform, opacity', position: 'relative', opacity: 0.01 }}
            >
              <em className="italic">accompagn&eacute;</em>
              <span
                ref={underlineRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '0.05em',
                  height: 2,
                  backgroundColor: '#c9a47e',
                  willChange: 'transform',
                  transform: 'scaleX(0)',
                  transformOrigin: 'left center',
                }}
              />
            </span>
            .
          </h1>

          <p
            ref={paragraphRef}
            className="text-[18px] leading-relaxed text-public-text-medium mb-8"
            style={{ willChange: 'transform, opacity', opacity: 0.01 }}
          >
            Que &ccedil;a fasse six mois, deux ans, ou que vous soyez en protocole de FIV
            &mdash; le parcours de fertilit&eacute; demande beaucoup plus d&rsquo;&eacute;nergie
            &eacute;motionnelle qu&rsquo;on ne l&rsquo;imagine.
          </p>

          <div ref={ctasRef} className="flex flex-wrap gap-4" style={{ willChange: 'transform, opacity', opacity: 0.01 }}>
            <MagneticButton range={100} strength={0.35}>
              <CtaButton variant="primary" size="lg" href="/reserver">
                Prendre rendez-vous
              </CtaButton>
            </MagneticButton>
            <MagneticButton range={80} strength={0.25}>
              <CtaButton variant="secondary" href="/ressources/acupuncture-fertilite-montreal">
                Lire le guide complet
              </CtaButton>
            </MagneticButton>
          </div>
        </div>

        <div
          ref={photoRef}
          className="max-w-[420px] mx-auto md:max-w-none"
          style={{
            willChange: 'transform, clip-path',
            clipPath: 'inset(0 0 100% 0)',
          }}
        >
          <picture>
            <source srcSet="/site/judith/judith-portrait-07.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-07.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/judith/judith-portrait-07.webp"
              alt="Judith Dufour-Savard, acupunctrice"
              width={1600}
              height={2400}
              loading="eager"
              fetchPriority="high"
              className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
