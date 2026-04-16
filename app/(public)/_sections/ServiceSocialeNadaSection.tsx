import Link from 'next/link';
import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

const STUDIES = [
  {
    pmid: '28621706',
    text: "Une \u00e9tude contr\u00f4l\u00e9e randomis\u00e9e de 2017 (Carter et al., Behavioral Sciences) portant sur 100 patients en traitement de d\u00e9pendance montre que le NADA ajout\u00e9 au traitement conventionnel am\u00e9liore significativement la qualit\u00e9 de vie, r\u00e9duit l'anxi\u00e9t\u00e9 et la d\u00e9pression, et est associ\u00e9 \u00e0 une diminution de la consommation d'alcool \u00e0 3 et 6 mois, ainsi qu'\u00e0 une diminution du tabagisme \u00e0 6 mois.",
  },
  {
    pmid: '27994492',
    text: "Une revue de 2016 (Stuyt & Voyles, Substance Abuse and Rehabilitation) confirme que le NADA est un outil adjuvant efficace pour les personnes vivant avec des probl\u00e8mes de sant\u00e9 mentale et de d\u00e9pendances.",
  },
  {
    pmid: '36287403',
    text: "Une m\u00e9ta-analyse en r\u00e9seau de 2022 (Prado et al., Revista Latino-Americana de Enfermagem) portant sur 15 \u00e9tudes montre que l'auriculoth\u00e9rapie (dont les points NADA font partie) est efficace pour r\u00e9duire l'anxi\u00e9t\u00e9 et le stress chez les professionnels de sant\u00e9.",
  },
];

const NADA_USES = [
  "Gestion du stress et de l'anxi\u00e9t\u00e9",
  "Soutien aux personnes vivant avec des d\u00e9pendances (alcool, tabac, drogues)",
  "Accompagnement du stress post-traumatique (TSPT)",
  "Arr\u00eat du tabac",
  "D\u00e9tente g\u00e9n\u00e9rale et bien-\u00eatre",
];

export default function ServiceSocialeNadaSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="04" align="left" />
        <SectionHeading
          kicker="UN PROTOCOLE COMMUNAUTAIRE &Eacute;TUDI&Eacute;"
          title="5 aiguilles dans chaque oreille."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Un protocole est particuli&egrave;rement adapt&eacute; au format social : le{' '}
            <strong className="text-public-text-dark">protocole NADA</strong> (National Acupuncture
            Detoxification Association). D&eacute;velopp&eacute; dans les ann&eacute;es 1970 au
            Lincoln Hospital du Bronx &agrave; New York pour accompagner les personnes
            d&eacute;pendantes, il est aujourd&rsquo;hui utilis&eacute; mondialement.
          </p>
          <p>
            <strong className="text-public-text-dark">Le principe</strong> : 5 aiguilles dans
            chaque oreille, ins&eacute;r&eacute;es dans des points auriculaires sp&eacute;cifiques
            (Shen Men, Sympathique, Rein, Foie, Poumon). Simple, rapide, efficace, et parfaitement
            adapt&eacute; au format de groupe (aucun d&eacute;shabillage n&eacute;cessaire).
          </p>
        </div>

        {/* TODO Judith : confirmer certification NADA officielle ? Le corpus d'etudes est solide meme sans certification, mais la mention "certifiee NADA" renforcerait le credit. */}

        <h3 className="font-public-serif text-[22px] font-semibold mt-12 mb-6 text-public-text-dark">
          Ce que la recherche montre
        </h3>
        <ul className="space-y-5">
          {STUDIES.map((s) => (
            <li
              key={s.pmid}
              className="bg-white/70 backdrop-blur-sm p-5 rounded-[10px] border border-public-border-subtle text-[15px] leading-relaxed text-public-text-medium"
            >
              {s.text}{' '}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-public-accent-warm underline underline-offset-2 hover:text-public-accent-warm-soft transition-colors"
              >
                Source : PMID {s.pmid}
              </a>
              .
            </li>
          ))}
        </ul>

        <h3 className="font-public-serif text-[22px] font-semibold mt-12 mb-6 text-public-text-dark">
          Le NADA est particuli&egrave;rement utilis&eacute; pour
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          {NADA_USES.map((u) => (
            <li key={u} className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-public-accent-warm mt-2.5" aria-hidden="true" />
              <span>{u}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/ressources/acupuncture-sociale-montreal"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
          >
            Explorez les protocoles de l&rsquo;acupuncture sociale en d&eacute;tail &rarr;
          </Link>
        </div>
      </div>
    </PaperTexture>
  );
}
