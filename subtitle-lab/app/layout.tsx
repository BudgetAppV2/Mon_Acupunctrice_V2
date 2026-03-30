import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Subtitle Lab — Prototype',
  description: 'Animated subtitle editor prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Archivo+Black&family=Poppins:wght@600;700&family=Space+Grotesk:wght@500;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Libre+Baskerville:wght@400;700&family=Manrope:wght@500;600;700&family=DM+Sans:wght@400;500;700&family=Oswald:wght@600;700&family=Caveat:wght@600;700&family=Kalam:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
