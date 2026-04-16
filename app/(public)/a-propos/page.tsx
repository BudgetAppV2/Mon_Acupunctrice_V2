import type { Metadata } from 'next';
import Link from 'next/link';
import AboutHeroSection from '../_sections/AboutHeroSection';
import AboutParcoursSection from '../_sections/AboutParcoursSection';
import AboutPratiqueSection from '../_sections/AboutPratiqueSection';
import AboutCliniqueSection from '../_sections/AboutCliniqueSection';
import AboutSpecialitesSection from '../_sections/AboutSpecialitesSection';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';

export const metadata: Metadata = {
  title: 'A propos',
  description:
    'Judith Dufour-Savard, acupunctrice a Montreal. Parcours : regie et eclairage, maison de naissance, DEP en acupuncture au College de Rosemont. Membre OAQ. La Source en Soi, Rosemont.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Person',
    name: 'Judith Dufour-Savard',
    jobTitle: 'Acupunctrice',
    image: '/site/judith/judith-portrait-08.webp',
    url: 'https://acupuncturejudith.ca/a-propos',
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'College de Rosemont',
    },
    memberOf: {
      '@type': 'Organization',
      name: 'Ordre des acupuncteurs du Quebec',
    },
    worksFor: {
      '@type': 'MedicalClinic',
      name: 'La Source en Soi',
      url: 'https://lasourceensoi.com/',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2554 rue Beaubien Est',
        addressLocality: 'Montreal',
        addressRegion: 'QC',
        addressCountry: 'CA',
      },
      telephone: '514-750-3735',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1215',
      },
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <AboutHeroSection />
      <AboutParcoursSection />
      <AboutPratiqueSection />
      <AboutCliniqueSection />
      <AboutSpecialitesSection />

      {/* Badges credentials */}
      <section className="bg-public-beige-light py-12 px-5 md:px-8">
        <div className="max-w-[780px] mx-auto flex flex-wrap justify-center gap-4">
          {['Membre OAQ', 'La Source en Soi', 'M\u00e8re de 3 enfants'].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-public-text-medium shadow-public-sm border border-public-border-subtle"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Pour aller plus loin \u2014 cross-linking SEO */}
      <section className="bg-public-beige-warm py-12 px-5 md:px-8 border-t border-public-border-subtle">
        <div className="max-w-[780px] mx-auto">
          <h3 className="font-public-serif text-[18px] font-semibold mb-4 text-public-text-dark">
            Pour aller plus loin
          </h3>
          <ul className="space-y-2 text-[14px]">
            <li>
              <Link href="/services" className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
                D&eacute;couvrir mes services &rarr;
              </Link>
            </li>
            <li>
              <Link href="/ressources/acupuncture-sante-mentale-anxiete" className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
                Acupuncture et sant&eacute; mentale : les &eacute;tudes r&eacute;centes &rarr;
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
                Questions fr&eacute;quentes &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[620px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
            Envie d&rsquo;en parler?
          </h2>
          <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
            Prenez rendez-vous pour une premi&egrave;re s&eacute;ance de 60 minutes.
            On prend le temps de se conna&icirc;tre.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <CtaButton
              variant="white"
              size="lg"
              href="https://www.gorendezvous.com/lasourceensoi?companyId=104074"
            >
              Prendre rendez-vous en ligne
            </CtaButton>
            <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
              Ou &eacute;crivez-moi
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
