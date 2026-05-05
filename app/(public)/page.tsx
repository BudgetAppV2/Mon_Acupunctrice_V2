import type { Metadata } from 'next';
import HeroSection from './_sections/HeroSection';
import PiliersSection from './_sections/PiliersSection';
import ApprocheSection from './_sections/ApprocheSection';
import TemoignagesSection from './_sections/TemoignagesSection';
import AboutSection from './_sections/AboutSection';
import BlogPreviewSection from './_sections/BlogPreviewSection';
import SocialSection from './_sections/SocialSection';
import CtaFinalSection from './_sections/CtaFinalSection';

export const metadata: Metadata = {
  title: {
    absolute: 'Acupuncture Montreal | Judith Dufour-Savard, Ac. — Rosemont & Repentigny',
  },
  description:
    'Acupunctrice a Montreal, specialisee en fertilite, grossesse et acupuncture sociale. Clinique La Source en Soi a Rosemont. 4,9/5 sur Google.',
};

export const revalidate = 3600;

const SCHEMA_ORG = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Judith Dufour-Savard',
    jobTitle: 'Acupunctrice',
    image: '/site/judith/judith-portrait-01.webp',
    url: 'https://acupuncturejudith.ca',
    dateModified: '2026-04-29',
    worksFor: {
      '@type': 'MedicalClinic',
      name: 'La Source en Soi',
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
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Judith Dufour-Savard — Acupunctrice',
    url: 'https://acupuncturejudith.ca',
    logo: 'https://acupuncturejudith.ca/site/judith/judith-portrait-01.webp',
    description:
      "Acupunctrice membre de l'OAQ spécialisée en fertilité, grossesse, pédiatrie et acupuncture sociale à Montréal (Rosemont) et Repentigny.",
    datePublished: '2026-04-15',
    dateModified: '2026-04-29',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '2554 Rue Beaubien E',
        addressLocality: 'Montréal',
        addressRegion: 'QC',
        postalCode: 'H1Y 1G3',
        addressCountry: 'CA',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '121 Boul. Industriel #225',
        addressLocality: 'Repentigny',
        addressRegion: 'QC',
        addressCountry: 'CA',
      },
    ],
    sameAs: [
      'https://www.wikidata.org/wiki/Q139677208',
      'https://www.instagram.com/judith.acupuncture/',
      'https://www.facebook.com/profile.php?id=61562614934143',
      'https://www.linkedin.com/in/judith-dufour-savard-acu/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-514-750-3735',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
  },
];

export default function PublicHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <HeroSection />
      <PiliersSection />
      <ApprocheSection />
      <TemoignagesSection />
      <AboutSection />
      <BlogPreviewSection />
      <SocialSection />
      <CtaFinalSection />
    </>
  );
}
