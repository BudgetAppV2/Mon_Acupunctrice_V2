import Link from 'next/link';
import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

const TRIMESTRES = [
  {
    num: '1er',
    title: 'Survivre aux nausées',
    desc: "Points PC6 et ST36 spécifiques, documentés. Plusieurs patientes voient une amélioration dès la 1ère ou 2e séance. Fréquence : 1-2x/semaine pendant 2-3 semaines, puis espacement.",
  },
  {
    num: '2e',
    title: 'Le confort retrouvé',
    desc: "Douleurs lombaires, sciatique, crampes, sommeil. Fréquence : 1 séance toutes les 2-3 semaines.",
  },
  {
    num: '3e',
    title: 'Préparer la rencontre',
    desc: "Version du siège (moxibustion 33-36 sem), maturation du col (à partir de 36-37 sem), détente pré-accouchement. Fréquence : 1x/semaine à partir de 36 semaines.",
  },
];

const OTHER_BENEFITS = [
  "Troubles digestifs (brûlements, reflux)",
  "Contrôle glycémie (diabète gestationnel)",
  "Constipation et hémorroïdes",
  "Enflure, oedème, varices (activation circulation)",
  "Maux de tête, migraines",
  "Sciatique, douleurs ligamentaires, tunnel carpien",
];

export default function ServiceGrossesseBenefitsSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="TRIMESTRE PAR TRIMESTRE"
          title="Un soutien qui s'adapte &agrave; chaque &eacute;tape."
          align="left"
        />

        <p className="mt-6 mb-12 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
          L&rsquo;acupuncture pendant la grossesse est l&rsquo;un des domaines les mieux
          document&eacute;s de la m&eacute;decine compl&eacute;mentaire. Une m&eacute;ta-analyse
          2024 (22 &eacute;tudes) confirme son efficacit&eacute; pour les naus&eacute;es. La
          Cochrane 2025 montre que la moxibustion aide &agrave; tourner les b&eacute;b&eacute;s
          en si&egrave;ge (RR 1,39).
        </p>

        {/* 3 cards trimestres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TRIMESTRES.map((trim) => (
            <div
              key={trim.num}
              className="bg-white rounded-[14px] p-8 border border-public-border-subtle"
            >
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

        {/* Liste autres bienfaits */}
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

        <div className="mt-10">
          <Link
            href="/ressources/acupuncture-grossesse-montreal"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
          >
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
