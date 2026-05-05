import type { Metadata } from 'next';
import Link from 'next/link';
import AuthorByline from '../../_components/AuthorByline';
import ServicePediatrieHeroSection from '../../_sections/ServicePediatrieHeroSection';
import ServicePediatrieBioSection from '../../_sections/ServicePediatrieBioSection';
import ServicePediatrieConditionsSection from '../../_sections/ServicePediatrieConditionsSection';
import ServicePediatrieApprocheSection from '../../_sections/ServicePediatrieApprocheSection';
import ServicePediatrieTemoignageSection from '../../_sections/ServicePediatrieTemoignageSection';
import ServicePediatrieInfosSection from '../../_sections/ServicePediatrieInfosSection';
import ServicePediatrieCtaSection from '../../_sections/ServicePediatrieCtaSection';

export const metadata: Metadata = {
  title: 'Acupuncture pediatrique',
  description:
    'Acupunctrice a Rosemont specialisee en pediatrie : coliques bebe, sommeil, allergies, anxiete enfant, TDAH. Aiguilles ultra-fines, shino shin, aimants. 90 $, La Source en Soi.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Acupuncture pediatrique a Montreal',
  description:
    'Acupuncture pour bebes, enfants et adolescents a Rosemont. Coliques, sommeil, allergies, anxiete, TDAH. Techniques douces adaptees a chaque age.',
  datePublished: '2026-04-15',
  dateModified: '2026-04-29',
  medicalAudience: ['Patient', 'ParentAudience'],
  author: {
    '@type': 'Person',
    name: 'Judith Dufour-Savard',
    jobTitle: 'Acupunctrice',
    memberOf: { '@type': 'Organization', name: 'Ordre des acupuncteurs du Québec' },
  },
  about: {
    '@type': 'MedicalCondition',
    name: 'Pediatric conditions',
  },
  mainEntity: {
    '@type': 'MedicalTherapy',
    name: 'Acupuncture pediatrique',
    relevantSpecialty: 'Pediatrics',
  },
};

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://acupuncturejudith.ca/services' },
    { '@type': 'ListItem', position: 3, name: 'Pédiatrie', item: 'https://acupuncturejudith.ca/services/pediatrie' },
  ],
};

export default function ServicePediatriePage() {
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
      <ServicePediatrieHeroSection />
      <ServicePediatrieBioSection />
      <ServicePediatrieConditionsSection />
      <ServicePediatrieApprocheSection />
      <ServicePediatrieTemoignageSection />
      <ServicePediatrieInfosSection />
      <ServicePediatrieCtaSection />

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
                href="/ressources/acupuncture-pediatrique-enfants-bebes"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Le guide complet : &eacute;tudes scientifiques et m&eacute;canismes &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/grossesse"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Acupuncture pendant la grossesse &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/acupuncture-sociale"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Acupuncture sociale (35-60 $) pour les familles &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/blog?category=pediatrie"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Le carnet : articles sur la p&eacute;diatrie &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
