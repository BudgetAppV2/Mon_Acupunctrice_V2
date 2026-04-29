import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceSocialeHeroSection from '../../_sections/ServiceSocialeHeroSection';
import ServiceSocialeConvictionSection from '../../_sections/ServiceSocialeConvictionSection';
import ServiceSocialeFormatSection from '../../_sections/ServiceSocialeFormatSection';
import ServiceSocialePublicSection from '../../_sections/ServiceSocialePublicSection';
import ServiceSocialeNadaSection from '../../_sections/ServiceSocialeNadaSection';
import ServiceSocialeInfosSection from '../../_sections/ServiceSocialeInfosSection';
import ServiceSocialeCtaSection from '../../_sections/ServiceSocialeCtaSection';

export const metadata: Metadata = {
  title: 'Acupuncture sociale',
  description:
    'Acupuncture a tarif reduit en format communautaire a Rosemont. Sliding scale 35-60 $, accessible a tous. La Source en Soi.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Acupuncture sociale a Rosemont',
  description: 'Acupuncture a tarif reduit en format communautaire a Rosemont. Sliding scale, protocole NADA, accessible a tous.',
  medicalAudience: 'Patient',
  mainEntity: {
    '@type': 'MedicalTherapy',
    name: 'Acupuncture sociale (community acupuncture, protocole NADA)',
    relevantSpecialty: 'Integrative Medicine',
  },
};

export default function ServiceAcupunctureSocialePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <ServiceSocialeHeroSection />
      <ServiceSocialeConvictionSection />
      <ServiceSocialeFormatSection />
      <ServiceSocialePublicSection />
      <ServiceSocialeNadaSection />
      <ServiceSocialeInfosSection />
      <ServiceSocialeCtaSection />

      {/* Pour aller plus loin — cross-linking SEO */}
      <section className="bg-public-beige-warm py-12 px-5 md:px-8 border-t border-public-border-subtle">
        <div className="max-w-[780px] mx-auto">
          <h3 className="font-public-serif text-[18px] font-semibold mb-4 text-public-text-dark">
            Pour aller plus loin
          </h3>
          <ul className="space-y-2 text-[14px]">
            <li>
              <Link
                href="/ressources/acupuncture-sociale-montreal"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                L&rsquo;histoire du mouvement d&rsquo;acupuncture sociale et le protocole NADA &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/fertilite"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Pour un accompagnement personnalis&eacute; en s&eacute;ance priv&eacute;e &mdash; fertilit&eacute; &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/grossesse"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                S&eacute;ance priv&eacute;e &mdash; grossesse &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/services/pediatrie"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                S&eacute;ance priv&eacute;e &mdash; p&eacute;diatrie &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                Le carnet : articles sur l&rsquo;accessibilit&eacute; aux soins &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
