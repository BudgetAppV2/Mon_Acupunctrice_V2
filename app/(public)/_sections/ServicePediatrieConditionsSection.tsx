import Link from 'next/link';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

const AGE_GROUPS = [
  {
    title: 'B\u00e9b\u00e9s',
    range: '0-12 MOIS',
    items: [
      'Coliques (\u00e9tude Landgren 2017 : r\u00e9duction significative des pleurs)',
      'Reflux, r\u00e9gurgitations',
      'Troubles du sommeil',
      'Ecz\u00e9ma',
      'Pouss\u00e9es dentaires',
    ],
  },
  {
    title: 'Enfants',
    range: '1-12 ANS',
    items: [
      'Allergies saisonni\u00e8res, asthme',
      'Anxi\u00e9t\u00e9, troubles du sommeil',
      '\u00c9nur\u00e9sie nocturne',
      'Maux de ventre r\u00e9currents',
      'TDAH (en compl\u00e9ment \u2014 revue 2025 : 25 \u00e9tudes)',
      'Douleurs de croissance',
    ],
  },
  {
    title: 'Adolescents',
    range: '12+',
    items: [
      "Anxi\u00e9t\u00e9 et stress scolaire",
      'Douleurs menstruelles',
      'Acn\u00e9, maux de t\u00eate',
      'Troubles du sommeil',
    ],
  },
];

export default function ServicePediatrieConditionsSection() {
  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="LES MOTIFS LES PLUS FR&Eacute;QUENTS"
          title="Adapt&eacute; &agrave; chaque &acirc;ge."
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {AGE_GROUPS.map((group) => (
            <div
              key={group.title}
              className="bg-white rounded-[14px] p-8 border border-public-border-subtle"
            >
              <h3 className="font-public-serif text-[22px] font-semibold mb-2 text-public-text-dark">
                {group.title}
              </h3>
              <p className="text-[11px] uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-4">
                {group.range}
              </p>
              <ul className="space-y-2 text-[14px] text-public-text-medium leading-relaxed">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-public-accent-warm mt-2" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
