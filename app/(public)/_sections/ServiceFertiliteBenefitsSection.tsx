'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Link from 'next/link';
import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

const BENEFITS = [
  "R\u00e9gulariser un cycle menstruel irr\u00e9gulier ou une ovulation absente",
  "Am\u00e9liorer la circulation sanguine vers l\u2019ut\u00e9rus et les ovaires",
  "Soutenir la qualit\u00e9 de l\u2019endom\u00e8tre et la r\u00e9ceptivit\u00e9 embryonnaire",
  "Att\u00e9nuer le stress et l\u2019anxi\u00e9t\u00e9 qui affectent votre axe hormonal",
  "Mieux tol\u00e9rer les effets secondaires des traitements hormonaux (FIV, IIU)",
  "Accompagner les conditions comme le SOPK ou l\u2019endom\u00e9triose",
];

export default function ServiceFertiliteBenefitsSection() {
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
      gsap.set(cards, { opacity: 1, clipPath: 'inset(0 0 100% 0)' });
      gsap.to(cards, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
      });
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="02" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading kicker="CE QUE L'ACUPUNCTURE FAIT" title="Comment l&rsquo;acupuncture soutient-elle le parcours de fertilit&eacute; ?" align="left" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 mb-10 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
            L&rsquo;acupuncture peut offrir plusieurs b&eacute;n&eacute;fices mesurables dans votre parcours &mdash; physiologiques et &eacute;motionnels. Une m&eacute;ta-analyse portant sur 49 essais contr&ocirc;l&eacute;s et 4&nbsp;579 participantes montre qu&rsquo;elle am&eacute;liore significativement les r&eacute;sultats de fertilit&eacute;.
          </p>
        </Reveal>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {BENEFITS.map((benefit) => (
            <div key={benefit} data-benefit-card className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed transition-shadow hover:shadow-public-md p-3 rounded-lg">
              <CheckIcon />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-10 text-[16px] leading-relaxed text-public-text-medium max-w-[720px]">
            Chaque s&eacute;ance dure 60 minutes et s&rsquo;adapte &agrave; votre r&eacute;alit&eacute; :
            conception naturelle, ins&eacute;mination, FIV.
          </p>
        </Reveal>

        <div className="mt-8">
          <Link href="/ressources/acupuncture-fertilite-montreal" className="arrow-link text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
            Explorez les &eacute;tudes scientifiques r&eacute;centes &rarr;
          </Link>
        </div>
      </div>
    </PaperTexture>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
