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

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Judith Dufour-Savard',
  jobTitle: 'Acupunctrice',
  image: '/site/judith/judith-portrait-01.webp',
  url: 'https://acupuncturejudith.ca',
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
};

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
