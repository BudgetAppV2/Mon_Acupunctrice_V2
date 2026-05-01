'use client';

import Reveal from '../_components/animations/Reveal';
import RevealWords from '../_components/animations/RevealWords';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteBioSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      <div className="absolute -right-[80px] top-[40px] w-[460px] h-[560px] hidden md:block pointer-events-none z-0" aria-hidden="true" style={{ transform: 'rotate(-8deg)', opacity: 0.14, mixBlendMode: 'multiply' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/site/svg/reproductive-flowers.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>

      <div className="max-w-[780px] mx-auto relative z-10">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="01" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading kicker="QUI VOUS ACCOMPAGNE" title="Une approche n&eacute;e du terrain." align="left" />
        </Reveal>

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            <RevealWords
              text="Je suis Judith Dufour-Savard, acupunctrice à La Source en Soi, sur Beaubien Est à Rosemont. J'ai travaillé à la Maison de naissance Côte-des-Neiges avant ma pratique, et je suis mère de trois enfants. Quand je vous écoute me parler de votre parcours de fertilité, je ne le fais pas juste comme professionnelle — je le fais aussi comme femme qui comprend l'attente, l'espoir, et la fatigue émotionnelle qui viennent avec."
              stagger={0.03}
              duration={0.6}
              y={20}
            />
          </p>
          <p>
            <RevealWords
              text="Ma pratique combine la rigueur de la médecine traditionnelle chinoise, les études scientifiques récentes, et une bonne dose d'humanité."
              stagger={0.04}
              duration={0.6}
              y={20}
            />
          </p>
        </div>

        <Reveal delay={0.4}>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-public-beige-light px-5 py-2.5 text-[13px] font-medium text-public-text-medium border border-public-border-subtle">
            <ShieldCheckIcon />
            Membre de l&rsquo;Ordre des acupuncteurs du Qu&eacute;bec (OAQ)
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-public-accent-taupe">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}
