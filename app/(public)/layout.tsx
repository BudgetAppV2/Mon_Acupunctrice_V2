import type { Metadata, Viewport } from 'next';
// ReactDOM.preload supprimé — ne fonctionne pas dans Next.js 15 App Router Server Components
import { Cormorant_Garamond, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals-public.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
import LenisProvider from './_components/LenisProvider';

// CSS variables consommées par tailwind.config.ts
// (fontFamily['public-serif'] et fontFamily['public-sans'])
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-public-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Judith Dufour-Savard — Acupunctrice à Montréal',
    template: '%s | Judith Dufour-Savard',
  },
  description:
    'Acupunctrice à Montréal, spécialisée en fertilité, grossesse, pédiatrie et acupuncture sociale. En partenariat avec la clinique La Source en Soi à Rosemont.',
  robots: { index: true, follow: true },
  verification: {
    google: 'yeGvUwc8-62HMRgMLkgEmgkvNCe1oO4tDPRvtPxuQ80',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F5F0E8',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Preload texture papier — <link> direct car ReactDOM.preload() ne fonctionne pas dans Next.js 15 App Router */}
      <link rel="preload" href="/site/textures/paper-japan.avif" as="image" type="image/avif" />
    <div
      className={`${cormorant.variable} ${inter.variable} bg-public-beige-bg text-public-text-dark font-public-sans min-h-screen flex flex-col`}
    >
      <SiteHeader />
      <LenisProvider />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
    {/* Plausible Analytics — site public uniquement */}
    <Script
      async
      src="https://plausible.io/js/pa-aZzfsJ6lLBfrRf7qnpB1w.js"
      strategy="afterInteractive"
    />
    <Script id="plausible-init" strategy="afterInteractive">
      {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
    </Script>
    </>
  );
}
