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

const TRIMESTRES = [
  {
    num: '1er',
    title: 'Survivre aux naus\u00e9es',
    desc: "Plusieurs patientes voient une am\u00e9lioration d\u00e8s la 1\u00e8re ou 2e s\u00e9ance. Fr\u00e9quence : 2x/semaine pendant 2 semaines.",
  },
  {
    num: '2e',
    title: 'Le confort retrouv\u00e9',
    desc: "Douleurs lombaires, sciatique, crampes, sommeil. Fr\u00e9quence : 2 \u00e0 3 s\u00e9ances par semaine.",
  },
  {
    num: '3e',
    title: 'Pr\u00e9parer la rencontre',
    desc: "Version du b\u00e9b\u00e9 en si\u00e8ge (moxibustion 33-36 sem), maturation du col (\u00e0 partir de 36-37 sem), d\u00e9tente pr\u00e9-accouchement. Fr\u00e9quence : 1x/semaine \u00e0 partir de 36 semaines.",
  },
];

const OTHER_BENEFITS = [
  "Troubles digestifs (br\u00fblements, reflux)",
  "Contr\u00f4le glyc\u00e9mie (diab\u00e8te gestationnel)",
  "Constipation et h\u00e9morro\u00efdes",
  "Enflure, oed\u00e8me, varices (activation circulation)",
  "Maux de t\u00eate, migraines",
  "Sciatique, douleurs ligamentaires, tunnel carpien",
];

export default function ServiceGrossesseBenefitsSection() {
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
          <SectionHeading kicker="TRIMESTRE PAR TRIMESTRE" title="Un soutien qui s'adapte &agrave; chaque &eacute;tape." align="left" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 mb-12 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
            L&rsquo;acupuncture pendant la grossesse est l&rsquo;un des domaines les mieux
            document&eacute;s de la m&eacute;decine compl&eacute;mentaire. Une m&eacute;ta-analyse
            2024 (22 &eacute;tudes) confirme son efficacit&eacute; pour les naus&eacute;es. La
            Cochrane 2025 montre que la moxibustion aide &agrave; tourner les b&eacute;b&eacute;s
            en si&egrave;ge (RR 1,39).
          </p>
        </Reveal>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TRIMESTRES.map((trim) => (
            <div key={trim.num} data-benefit-card className="bg-white rounded-[14px] p-8 border border-public-border-subtle">
              <div className="text-[11px] font-semibold uppercase tracking-[2px] text-public-accent-taupe-dark mb-2">
                {trim.num} TRIMESTRE
              </div>
              <h3 className="font-public-serif text-[22px] font-semibold mb-3 text-public-text-dark leading-tight">
                {trim.title}
              </h3>
              <p className="text-[14px] text-public-text-medium leading-relaxed">{trim.desc}</p>
            </div>
          ))}
        </div>

        <Reveal>
          <h3 className="font-public-serif text-[22px] font-semibold mb-6 text-public-text-dark">
            Autres bienfaits
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {OTHER_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed">
                <CheckIcon />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-10">
          <Link href="/ressources/acupuncture-grossesse-montreal" className="arrow-link text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
            Explorez les &eacute;tudes compl&egrave;tes par trimestre &rarr;
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
