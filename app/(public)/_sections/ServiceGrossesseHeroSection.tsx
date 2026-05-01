'use client';

import GrainOverlay from '../_components/GrainOverlay';
import CtaButton from '../_components/CtaButton';
import Reveal from '../_components/animations/Reveal';

export default function ServiceGrossesseHeroSection() {
  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        {/* Contenu gauche */}
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            GROSSESSE &amp; P&Eacute;RINATALIT&Eacute; &middot; ROSEMONT &amp; REPENTIGNY
          </span>
          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            Votre grossesse, accompagn&eacute;e en{' '}
            <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
              douceur
            </em>
            .
          </h1>
          <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
            Naus&eacute;es qui durent, douleurs au dos, b&eacute;b&eacute; en si&egrave;ge,
            stress de l&rsquo;accouchement. &Agrave; chaque trimestre, l&rsquo;acupuncture
            peut &ecirc;tre un alli&eacute; pr&eacute;cieux &mdash; document&eacute; par la
            recherche, et pratiqu&eacute; ici avec exp&eacute;rience.
          </p>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" size="lg" href="/reserver">
              Prendre rendez-vous
            </CtaButton>
            <CtaButton variant="secondary" href="/ressources/acupuncture-grossesse-montreal">
              Lire le guide complet
            </CtaButton>
          </div>
        </div>

        {/* Photo hero : portrait-06 — featured grossesse MW-C1 */}
        <div className="max-w-[420px] mx-auto md:max-w-none">
          <picture>
            <source srcSet="/site/judith/judith-portrait-06.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-06.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/judith/judith-portrait-06.webp"
              alt="Judith en consultation avec une femme enceinte, dans son cabinet a La Source en Soi"
              width={1600}
              height={2400}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo"
            />
          </picture>
        </div>
      </div>
    </GrainOverlay>
  );
}
