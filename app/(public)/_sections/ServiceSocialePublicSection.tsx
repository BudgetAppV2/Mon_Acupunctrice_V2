import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

const PUBLICS = [
  "Les personnes sans assurance privée",
  "Les étudiant(e)s",
  "Les travailleur(se)s autonomes et artistes",
  "Les personnes à faible revenu",
  "Les aîné(e)s",
  "Les personnes en recherche d'emploi",
  "Les nouvelles arrivantes",
  "Les personnes vivant avec un handicap ou une condition chronique",
  "Toute personne qui veut essayer l'acupuncture sans engagement financier d'une séance privée",
];

const CONDITIONS = [
  "Stress et anxiété (le #1 des motifs en acupuncture sociale)",
  "Insomnie et troubles du sommeil",
  "Douleurs chroniques (dos, cou, épaules, migraines)",
  "Fatigue et épuisement",
  "Soutien au bien-être général",
  "Arrêt du tabac et dépendances (protocole NADA)",
];

export default function ServiceSocialePublicSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="03" align="left" />
        <SectionHeading
          kicker="POUR QUI"
          title="Pour tout le monde &mdash; mais particuli&egrave;rement pour..."
          align="left"
        />

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          {PUBLICS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed">
              <Bullet />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <h3 className="font-public-serif text-[22px] font-semibold mt-12 mb-6 text-public-text-dark">
          Raisons de consultation courantes
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          {CONDITIONS.map((c) => (
            <li key={c} className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed">
              <Bullet />
              <span>{c}</span>
            </li>
          ))}
        </ul>


      </div>
    </section>
  );
}

function Bullet() {
  return (
    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-public-accent-warm mt-2.5" aria-hidden="true" />
  );
}
