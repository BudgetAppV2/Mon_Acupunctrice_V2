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

export default function PublicHomePage() {
  return (
    <>
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
