'use client';

import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import TestimonialCard from '../_components/TestimonialCard';
import StaggerChildren from '../_components/animations/StaggerChildren';
import HoverLift from '../_components/animations/HoverLift';
import Reveal from '../_components/animations/Reveal';

export default function TemoignagesSection() {
  return (
    <PaperTexture variant="real" className="bg-public-beige-warm py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1280px] mx-auto relative">
        {/* SVG zen-stones — filigrane decoratif droite, plus gros + plus transparent + leger angle (matcher v4) */}
        <div
          className="absolute right-[-160px] top-[-40px] w-[460px] h-[600px] pointer-events-none z-0 hidden lg:block"
          aria-hidden="true"
          style={{ transform: 'rotate(8deg)', transformOrigin: 'center center' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/svg/zen-stones.svg"
            alt=""
            loading="lazy"
            className="w-full h-full object-contain"
            style={{ opacity: 0.14, mixBlendMode: 'multiply' }}
          />
        </div>

        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="03" />
        </Reveal>
        <Reveal>
          <SectionHeading
            kicker="CE QU'ELLES EN DISENT"
            title="Des parcours r&eacute;els"
            subtitle="Avis Google publics de la clinique La Source en Soi, o&ugrave; Judith pratique. 4,9/5 sur 1 215 avis."
          />
        </Reveal>

        <StaggerChildren scale={0.92} y={28} stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <TestimonialCard
            featured
            quote="Judith a su tout de suite me mettre &agrave; l'aise et &eacute;tant autiste, c'&eacute;tait pas gagn&eacute; d'avance, mais la douceur de cette petite f&eacute;e de l'acupuncture m'a ensorcel&eacute; de par sa gentillesse et son savoir faire."
            name="Alexandra P."
            detail="Avis Google &middot; La Source en Soi"
          />

          <TestimonialCard
            quote="Mon enfant de 6 ans ne voulait pas des aiguilles, elle a trouv&eacute; d'autres fa&ccedil;ons de le traiter avec des aimants. Il a beaucoup appr&eacute;ci&eacute; la s&eacute;ance."
            name="Parent d'un enfant de 6 ans"
            detail="Avis Google &middot; La Source en Soi"
          />
        </StaggerChildren>
      </div>
    </PaperTexture>
  );
}
