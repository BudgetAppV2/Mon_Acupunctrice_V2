import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceGrossesseHeroSection from '../../_sections/ServiceGrossesseHeroSection';
import ServiceGrossesseBioSection from '../../_sections/ServiceGrossesseBioSection';
import ServiceGrossesseBenefitsSection from '../../_sections/ServiceGrossesseBenefitsSection';
import ServiceGrossesseCollaborationSection from '../../_sections/ServiceGrossesseCollaborationSection';
import ServiceGrossesseTemoignageSection from '../../_sections/ServiceGrossesseTemoignageSection';
import ServiceGrossesseInfosSection from '../../_sections/ServiceGrossesseInfosSection';
import ServiceGrossesseCtaSection from '../../_sections/ServiceGrossesseCtaSection';

export const metadata: Metadata = {
  title: 'Acupuncture grossesse',
  description:
    'Acupunctrice a Rosemont specialisee en grossesse : nausees, douleurs, version du siege (moxibustion), preparation accouchement. 60 min, 100 $. La Source en Soi.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Acupuncture grossesse a Montreal',
  description: 'Acupuncture pour accompagner la grossesse a Rosemont. Nausees, douleurs, version du siege, preparation accouchement.',
  datePublished: '2026-04-15',
  dateModified: '2026-04-29',
  medicalAudience: 'Patient',
  about: {
    '@type': 'MedicalCondition',
    name: 'Pregnancy',
  },
  mainEntity: {
    '@type': 'MedicalTherapy',
    name: 'Acupuncture pour la grossesse',
    relevantSpecialty: 'Obstetrics',
  },
};

export default function ServiceGrossessePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <ServiceGrossesseHeroSection />
      <ServiceGrossesseBioSection />
      <ServiceGrossesseBenefitsSection />
      <ServiceGrossesseCollaborationSection />
      <ServiceGrossesseTemoignageSection />
      <ServiceGrossesseInfosSection />
      <ServiceGrossesseCtaSection />

      {/* Pour aller plus loin — cross-linking SEO */}
      <section className="bg-public-beige-warm py-12 px-5 md:px-8 border-t border-public-border-subtle">
        <div className="max-w-[780px] mx-auto">
          <h3 className="font-public-serif text-[18px] font-semibold mb-4 text-public-text-dark">
            Pour aller plus loin
          </h3>
          <ul className="space-y-2 text-[14px]">
            <li>
              <Link
                href="/ressources/acupuncture-grossesse-montreal"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                L&rsquo;accompagnement trimestre par trimestre : &eacute;tudes et protocoles &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/fertilite"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Envie de pr&eacute;parer votre fertilit&eacute; en amont ? &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/pediatrie"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Acupuncture pour b&eacute;b&eacute; (coliques, sommeil, pouss&eacute;es dentaires) &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/blog?category=grossesse"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Le carnet : articles sur la grossesse &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
