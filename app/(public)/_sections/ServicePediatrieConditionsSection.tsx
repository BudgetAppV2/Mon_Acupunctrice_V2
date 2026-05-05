'use client';

import Link from 'next/link';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

const AGE_GROUPS: { title: string; range: string; items: string[]; note?: string }[] = [
  {
    title: 'Bébés',
    range: '0-12 MOIS',
    items: [
      'Coliques (étude Landgren 2017 : réduction significative des pleurs)',
      'Reflux, régurgitations',
      'Troubles du sommeil',
      'Eczéma',
      'Poussées dentaires',
    ],
  },
  {
    title: 'Enfants',
    range: '1-12 ANS',
    items: [
      'Allergies saisonnières, asthme',
      'Anxiété, troubles du sommeil',
      'Énurésie nocturne',
      'Maux de ventre récurrents',
      'TDAH (en complément — revue 2025 : 25 études)',
      'Douleurs de croissance',
    ],
  },
  {
    title: 'Adolescents',
    range: '12+',
    items: [
      "Anxiété et stress scolaire",
      'Douleurs menstruelles',
      'Acné, maux de tête',
      'Troubles du sommeil',
    ],
    note: 'Un adolescent de 14 ans et plus n’a pas besoin du consentement de ses parents pour recevoir un traitement.',
  },
];

export default function ServicePediatrieConditionsSection() {
  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="02" align="left" />
        </Reveal>
        <SectionHeading
          kicker="LES MOTIFS LES PLUS FR&Eacute;QUENTS"
          title="&Agrave; quel &acirc;ge un enfant peut-il recevoir de l&rsquo;acupuncture ?"
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {AGE_GROUPS.map((group) => (
            <div
              key={group.title}
              className="bg-white rounded-[14px] p-8 border border-public-border-subtle flex flex-col"
            >
              <h3 className="font-public-serif text-[22px] font-semibold mb-2 text-public-text-dark">
                {group.title}
              </h3>
              <p className="text-[11px] uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-4">
                {group.range}
              </p>
              <ul className="space-y-2 text-[14px] text-public-text-medium leading-relaxed flex-1">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-public-accent-warm mt-2" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {group.note && (
                <p className="mt-4 pt-4 border-t border-public-border-subtle text-[12px] italic text-public-text-light leading-relaxed">
                  {group.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/ressources/acupuncture-pediatrique-enfants-bebes"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
          >
            &Eacute;tudes scientifiques et m&eacute;canismes d&eacute;taill&eacute;s &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
