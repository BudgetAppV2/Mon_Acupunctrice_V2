'use client';

import Image from 'next/image';
import GrainOverlay from '../_components/GrainOverlay';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

export default function ApprocheSection() {
  return (
    <GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20 overflow-hidden">
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-[72px] items-center relative">
        {/* SVG hands-lotus — fond decoratif centre derriere le texte (matcher v4) */}
        <div
          className="absolute left-[10%] top-[-40px] w-[640px] h-[640px] pointer-events-none z-0 hidden md:block"
          aria-hidden="true"
          style={{ transform: 'rotate(6deg)', transformOrigin: 'center center' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/svg/hands-lotus.svg"
            alt=""
            loading="lazy"
            className="w-full h-full object-contain"
            style={{ opacity: 0.12, mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Texte */}
        <div className="order-2 md:order-1 relative z-10">
          <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
            <SectionNumber number="02" align="left" />
          </Reveal>
          <Reveal>
            <SectionHeading
              kicker="MON APPROCHE"
              title="Un soin qui prend le temps."
              align="left"
            />
          </Reveal>
          <Reveal delay={0.15}>
          <div className="mt-6 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>
              Je crois que chaque personne qui entre dans mon cabinet m&eacute;rite
              toute mon attention. Pas un protocole standard, mais une &eacute;coute
              r&eacute;elle de ce que votre corps et votre parcours demandent.
            </p>
            <p>
              Dans mon cabinet, chaque s&eacute;ance dure{' '}
              <strong className="text-public-text-dark">60 minutes</strong>.
              J&rsquo;&eacute;coute ce que vous venez d&eacute;poser, j&rsquo;&eacute;value,
              je traite, et je prends le temps de vous expliquer ce que je fais et pourquoi.
            </p>
            <p>
              Pas de promesses, pas de recettes. Juste une pratique{' '}
              <strong className="text-public-text-dark">profond&eacute;ment humaine</strong>
              {' '}&mdash; et adapt&eacute;e &agrave; qui vous &ecirc;tes aujourd&rsquo;hui.
            </p>
          </div>
          </Reveal>
        </div>

        {/* Photo */}
        <div className="order-1 md:order-2 max-w-[420px] mx-auto md:max-w-none relative z-10">
          <Image
            src="/site/judith/judith-portrait-05.webp"
            alt="Judith en consultation d'acupuncture"
            width={1600}
            height={1067}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 540px"
            className="w-full h-auto rounded-[14px] shadow-public-photo aspect-[4/5] object-cover"
          />
        </div>
      </div>
    </GrainOverlay>
  );
}
