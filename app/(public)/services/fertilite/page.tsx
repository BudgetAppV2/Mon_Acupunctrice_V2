import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceFertiliteHeroSection from '../../_sections/ServiceFertiliteHeroSection';
import ServiceFertiliteBioSection from '../../_sections/ServiceFertiliteBioSection';
import ServiceFertiliteBenefitsSection from '../../_sections/ServiceFertiliteBenefitsSection';
import ServiceFertiliteHommeSection from '../../_sections/ServiceFertiliteHommeSection';
import ServiceFertiliteCollaborationSection from '../../_sections/ServiceFertiliteCollaborationSection';
import ServiceFertiliteTemoignageSection from '../../_sections/ServiceFertiliteTemoignageSection';
import ServiceFertiliteInfosSection from '../../_sections/ServiceFertiliteInfosSection';
import ServiceFertiliteCtaSection from '../../_sections/ServiceFertiliteCtaSection';

export const metadata: Metadata = {
  title: 'Acupuncture fertilite',
  description:
    'Acupunctrice a Rosemont specialisee en fertilite : conception naturelle, FIV, insemination, SOPK, endometriose. Approche douce, 60 min par seance, 100 $, assurances. La Source en Soi.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Acupuncture fertilite a Montreal',
  description: 'Acupuncture pour soutenir le parcours de fertilite a Rosemont. Conception naturelle, FIV, IIU.',
  medicalAudience: 'Patient',
  about: {
    '@type': 'MedicalCondition',
    name: 'Infertility',
  },
  mainEntity: {
    '@type': 'MedicalTherapy',
    name: 'Acupuncture pour la fertilite',
    relevantSpecialty: 'Reproductive Medicine',
  },
};

export default function ServiceFertilitePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <ServiceFertiliteHeroSection />
      <ServiceFertiliteBioSection />
      <ServiceFertiliteBenefitsSection />
      <ServiceFertiliteHommeSection />
      <ServiceFertiliteCollaborationSection />
      <ServiceFertiliteTemoignageSection />
      <ServiceFertiliteInfosSection />
      <ServiceFertiliteCtaSection />

      {/* Pour aller plus loin — cross-linking SEO */}
      <section className="bg-public-beige-warm py-12 px-5 md:px-8 border-t border-public-border-subtle">
        <div className="max-w-[780px] mx-auto">
          <h3 className="font-public-serif text-[18px] font-semibold mb-4 text-public-text-dark">
            Pour aller plus loin
          </h3>
          <ul className="space-y-2 text-[14px]">
            <li>
              <Link
                href="/ressources/acupuncture-fertilite-montreal"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Ce que dit la science en 2025 sur l&rsquo;acupuncture et la fertilit&eacute; &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/acupuncture-sociale"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                L&rsquo;acupuncture sociale : soins accessibles &agrave; tarif r&eacute;duit &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/blog?category=fertilite"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Le carnet : articles sur la fertilit&eacute; &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
