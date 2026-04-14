'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';
import CtaButton from './CtaButton';
import MobileMenu from './MobileMenu';

const NAV_LINKS = [
  { href: '/a-propos', label: 'A propos' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
] as const;

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-white/[0.92] backdrop-blur-[12px] border-b border-public-border-subtle">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center gap-6 px-5 py-3.5 md:px-8 md:py-[18px]">
        {/* Logo — Q6 : nom serif + ACUPUNCTRICE sans */}
        <Link href="/" className="shrink-0">
          <span className="font-public-serif text-[22px] font-semibold leading-[1.1] text-public-text-dark tracking-tight">
            Judith Dufour-Savard
          </span>
          <small className="block font-public-sans text-[10px] font-medium tracking-[1.5px] uppercase text-public-text-light mt-0.5">
            ACUPUNCTRICE
          </small>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:inline-flex">
          <CtaButton variant="primary" size="md">
            Reserver
          </CtaButton>
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="md:hidden p-2 -mr-2 text-public-text-dark"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
