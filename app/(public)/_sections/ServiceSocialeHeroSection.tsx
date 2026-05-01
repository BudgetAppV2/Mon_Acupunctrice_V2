'use client';

import GrainOverlay from '../_components/GrainOverlay';
import CtaButton from '../_components/CtaButton';
import Reveal from '../_components/animations/Reveal';

export default function ServiceSocialeHeroSection() {
  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        {/* Contenu gauche */}
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            ACUPUNCTURE SOCIALE &middot; ROSEMONT
          </span>
          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            La sant&eacute; est un{' '}
            <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
              droit
            </em>
            , pas un privil&egrave;ge.
          </h1>
          <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
            Des s&eacute;ances d&rsquo;acupuncture en petit groupe, &agrave; tarif r&eacute;duit,
            pour que personne ne soit exclu pour des raisons financi&egrave;res. C&rsquo;est la
            m&ecirc;me rigueur, la m&ecirc;me formation, la m&ecirc;me qualit&eacute; de soin
            &mdash; juste sans la barri&egrave;re du co&ucirc;t.
          </p>
          {/* TODO Judith : confirmer si lien GRV separe existe pour seances sociales. Par defaut on utilise le meme que le prive. */}
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708">
              Prendre rendez-vous
            </CtaButton>
            <CtaButton variant="secondary" href="/ressources/acupuncture-sociale-montreal">
              Lire le guide complet
            </CtaButton>
          </div>
        </div>

        {/* Photo hero : portrait-03 (Instagram card homepage reutilisee) */}
        <div className="max-w-[420px] mx-auto md:max-w-none">
          <picture>
            <source srcSet="/site/judith/judith-portrait-03.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-03.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/judith/judith-portrait-03.webp"
              alt="Judith dans un espace de soin doux et accessible, evoquant l'acupuncture sociale"
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
