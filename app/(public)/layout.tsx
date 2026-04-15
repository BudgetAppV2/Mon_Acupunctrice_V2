import type { Metadata, Viewport } from 'next';
import ReactDOM from 'react-dom';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals-public.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';

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
  // Preload texture papier japonais pour eviter le retard LCP
  // (decouverte CSS background-image trop tardive sans preload)
  ReactDOM.preload('/site/textures/paper-japan.avif', {
    as: 'image',
    type: 'image/avif',
    fetchPriority: 'high',
  });

  return (
    <div
      className={`${cormorant.variable} ${inter.variable} bg-public-beige-bg text-public-text-dark font-public-sans min-h-screen flex flex-col`}
    >
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
