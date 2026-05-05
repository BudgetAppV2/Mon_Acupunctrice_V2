'use client';

import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

const STEPS = [
  { n: 1, label: 'Accueil', text: "On échange sur comment vous allez, vos symptômes du jour" },
  { n: 2, label: 'Installation', text: "Vous vous installez confortablement, habillé(e) (manches et pantalons retroussés)" },
  { n: 3, label: 'Traitement', text: "J'insère les aiguilles aux points distaux (mains, avant-bras, pieds, jambes, tête, oreilles). Généralement 6 à 12 aiguilles." },
  { n: 4, label: 'Repos', text: "Vous restez 30 minutes avec les aiguilles. Beaucoup de gens s'endorment. C'est normal." },
  { n: 5, label: 'Retrait', text: "Je retire les aiguilles quand vous êtes prêt(e)." },
];

const DIFFERENCES = [
  { label: 'Espace', social: 'Partagé', prive: 'Salle privée' },
  { label: 'Tenue', social: 'Habillé(e)', prive: 'Tenue adaptée' },
  { label: 'Points', social: 'Distaux', prive: 'Tout le corps' },
  { label: 'Durée', social: '60 min', prive: '60 min' },
  { label: 'Tarif', social: '35-60 $', prive: 'Standard' },
];

export default function ServiceSocialeFormatSection() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="LE FORMAT"
          title="Qu&rsquo;est-ce que l&rsquo;acupuncture sociale et comment &ccedil;a fonctionne ?"
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Imaginez un espace lumineux avec plusieurs fauteuils inclinables et une lumi&egrave;re tamis&eacute;e.
            D&rsquo;autres personnes sont l&agrave;, les yeux ferm&eacute;s, en train de recevoir
            leur traitement. Un silence respectueux, un fond sonore doux.
          </p>
        </div>

        <h3 className="font-public-serif text-[22px] font-semibold mt-12 mb-6 text-public-text-dark">
          D&eacute;roulement
        </h3>
        <ol className="space-y-4">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-4 items-start">
              <span className="shrink-0 w-8 h-8 rounded-full bg-public-accent-warm text-white font-public-serif font-semibold flex items-center justify-center text-[14px]">
                {step.n}
              </span>
              <div className="text-[15px] leading-relaxed text-public-text-medium">
                <strong className="text-public-text-dark">{step.label}</strong> &mdash; {step.text}
              </div>
            </li>
          ))}
        </ol>

        <h3 className="font-public-serif text-[22px] font-semibold mt-12 mb-6 text-public-text-dark">
          Les 5 diff&eacute;rences avec le priv&eacute;
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white rounded-[14px] p-6 border border-public-border-subtle">
          {DIFFERENCES.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-2">
                {item.label}
              </div>
              <div className="text-[15px] font-medium text-public-text-dark">{item.social}</div>
              <div className="text-[12px] text-public-text-light mt-1">vs {item.prive} en priv&eacute;</div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-public-beige-warm/40 rounded-[10px] text-[15px] leading-relaxed text-public-text-medium">
          <strong className="text-public-text-dark">Important</strong> : C&rsquo;est{' '}
          <strong className="text-public-text-dark">la m&ecirc;me acupuncture</strong>. M&ecirc;me
          formation (technique de 3 ans reconnue par l&rsquo;OAQ), m&ecirc;mes aiguilles st&eacute;riles &agrave;
          usage unique, m&ecirc;me rigueur. Ce qui change, c&rsquo;est le format de distribution.
        </div>
      </div>
    </section>
  );
}
