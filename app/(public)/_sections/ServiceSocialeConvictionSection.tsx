'use client';

import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

export default function ServiceSocialeConvictionSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      {/* SVG yoga3 en filigrane gauche */}
      <div
        className="absolute -left-[140px] top-[0px] w-[400px] h-[560px] pointer-events-none z-0 hidden lg:block"
        aria-hidden="true"
        style={{ transform: 'rotate(-6deg)', opacity: 0.14, mixBlendMode: 'multiply' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/site/svg/yoga3.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div className="max-w-[780px] mx-auto relative z-10">
        <SectionNumber number="01" align="left" />
        <SectionHeading
          kicker="POURQUOI J'OFFRE CE SERVICE"
          title="Je suis devenue acupunctrice pour aider les gens."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Je suis devenue acupunctrice pour aider les gens &mdash; pas seulement ceux qui
            peuvent se le payer. Quand j&rsquo;ai d&eacute;couvert le mod&egrave;le d&rsquo;acupuncture
            sociale (n&eacute; aux &Eacute;tats-Unis dans les ann&eacute;es 2000, puis import&eacute;
            au Qu&eacute;bec par la Clinique d&rsquo;acupuncture sociale d&rsquo;Hochelaga), j&rsquo;ai su que &ccedil;a devait
            faire partie de ma pratique.
          </p>
          <p>
            Je suis une des rares acupunctrices &agrave; Rosemont &agrave; offrir ce service.
            C&rsquo;est un quartier en pleine transformation, avec des familles, des
            &eacute;tudiant&middot;es, des travailleur&middot;ses autonomes, des a&icirc;n&eacute;&middot;es
            &mdash; tout le monde m&eacute;rite d&rsquo;avoir acc&egrave;s &agrave; des soins.
          </p>
        </div>

        <div className="mt-10 p-6 bg-public-beige-light rounded-[14px] border-l-4 border-public-accent-warm">
          <p className="text-[15px] leading-relaxed text-public-text-dark">
            <strong>Principe du tarif libre</strong> : Vous choisissez le montant que vous pouvez
            payer dans une fourchette donn&eacute;e. Pas de justification. Pas de formulaire &agrave;
            remplir pour &laquo;&nbsp;prouver&nbsp;&raquo; votre situation. Pas de jugement.
          </p>
        </div>
      </div>
    </section>
  );
}
