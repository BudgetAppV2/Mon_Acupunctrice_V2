import type { Metadata } from 'next';
import Link from 'next/link';
import AuthorByline from '../../_components/AuthorByline';
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
  datePublished: '2026-04-15',
  dateModified: '2026-04-29',
  medicalAudience: 'Patient',
  author: {
    '@type': 'Person',
    name: 'Judith Dufour-Savard',
    jobTitle: 'Acupunctrice',
    memberOf: { '@type': 'Organization', name: 'Ordre des acupuncteurs du Québec' },
  },
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

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.acupuncturejudith.ca' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.acupuncturejudith.ca/services' },
    { '@type': 'ListItem', position: 3, name: 'Fertilité', item: 'https://www.acupuncturejudith.ca/services/fertilite' },
  ],
};

export default function ServiceFertilitePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <ServiceFertiliteHeroSection />
      <ServiceFertiliteBioSection />
      <ServiceFertiliteBenefitsSection />
      <ServiceFertiliteHommeSection />
      <ServiceFertiliteCollaborationSection />
      <ServiceFertiliteTemoignageSection />
      <ServiceFertiliteInfosSection />
      <ServiceFertiliteCtaSection />

      <AuthorByline />

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
          <div className="mt-6 pt-6 border-t border-public-border-subtle">
            <p className="text-[12px] uppercase tracking-[1px] font-semibold text-public-text-light mb-2">
              Références
            </p>
            <ul className="space-y-1 text-[13px] text-public-text-light">
              <li>
                <a
                  href="https://o-a-q.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-public-text-dark transition-colors"
                >
                  Ordre des acupuncteurs du Qu&eacute;bec (OAQ)
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-public-text-dark transition-colors"
                >
                  OMS &mdash; M&eacute;decine traditionnelle et compl&eacute;mentaire
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
