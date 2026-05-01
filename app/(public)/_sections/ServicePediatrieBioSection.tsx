'use client';

import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

export default function ServicePediatrieBioSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      {/* SVG sleeping-baby en filigrane droite */}
      <div
        className="absolute -right-[60px] top-[40px] w-[320px] h-[400px] pointer-events-none z-0 hidden lg:block"
        aria-hidden="true"
        style={{ transform: 'rotate(12deg)', opacity: 0.16, mixBlendMode: 'multiply' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/site/svg/sleeping-baby.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div className="max-w-[780px] mx-auto relative z-10">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="01" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading
            kicker="QUI VOUS ACCOMPAGNE"
            title="Une approche qui rassure autant que les parents."
            align="left"
          />
        </Reveal>

        <Reveal delay={0.15}>
        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Je suis m&egrave;re de trois enfants. Je sais comment parler &agrave; un b&eacute;b&eacute;
            de 3 mois, &agrave; un enfant de 4 ans qui a peur, &agrave; un ado de 12 ans qui ne veut
            pas &ecirc;tre l&agrave;. Je sais que rien ne se passe bien sous la contrainte.
          </p>
          <p>
            Dans mon cabinet, je ne force jamais. Si votre enfant ne veut pas d&rsquo;aiguilles
            aujourd&rsquo;hui, on fait autrement &mdash; acupression, shino shin, aimants, tuina
            p&eacute;diatrique (massage chinois). L&rsquo;important, c&rsquo;est que l&rsquo;enfant
            se sente en s&eacute;curit&eacute; et que le soin lui fasse du bien.
          </p>
          <p>
            Votre anxi&eacute;t&eacute; de parent se transmet &agrave; votre enfant. Alors on prend
            le temps.
          </p>
        </div>
        </Reveal>

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
