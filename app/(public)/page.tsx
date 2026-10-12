import type { Metadata } from 'next';
import HeroSection from './_sections/HeroSection';
import PiliersSection from './_sections/PiliersSection';
import ApprocheSection from './_sections/ApprocheSection';
import AboutSection from './_sections/AboutSection';
import BlogPreviewSection from './_sections/BlogPreviewSection';
import SocialSection from './_sections/SocialSection';
import CtaFinalSection from './_sections/CtaFinalSection';

export const metadata: Metadata = {
  title: {
    absolute: 'Acupuncture Montreal | Judith Dufour-Savard, Ac. — Rosemont & Repentigny',
  },
  description:
    'Acupunctrice a Montreal, specialisee en fertilite, grossesse et acupuncture sociale. Chez Les Vagues, communautes therapeutiques, a Rosemont, et a Repentigny.',
};

export const revalidate = 3600;

export default function PublicHomePage() {
  return (
    <>
      <HeroSection />
      <PiliersSection />
      <ApprocheSection />
      <AboutSection />
      <BlogPreviewSection />
      <SocialSection />
      <CtaFinalSection />
    </>
  );
}
