'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';
import CtaButton from './CtaButton';
import MobileMenu from './MobileMenu';

const SERVICE_LINKS = [
  { href: '/services/fertilite', label: 'Fertilité' },
  { href: '/services/grossesse', label: 'Grossesse' },
  { href: '/services/pediatrie', label: 'Pédiatrie' },
  { href: '/services/acupuncture-sociale', label: 'Acupuncture sociale' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-white/[0.92] backdrop-blur-[12px] border-b border-public-border-subtle">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center gap-6 px-5 py-3.5 md:px-8 md:py-[18px]">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="font-public-serif text-[22px] font-semibold leading-[1.1] text-public-text-dark tracking-tight">
            Judith Dufour Savard
          </span>
          <small className="block font-public-sans text-[10px] font-medium tracking-[1.5px] uppercase text-public-text-light mt-0.5">
            ACUPUNCTRICE · ROSEMONT
          </small>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <Link href="/a-propos" className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors">
            À propos
          </Link>

          {/* Services dropdown */}
          <div className="relative group">
            <Link
              href="/services"
              className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors flex items-center gap-1"
            >
              Services
              <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
                <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            {/* Dropdown panel */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-public-border-subtle py-2 min-w-[220px]">
                {SERVICE_LINKS.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-5 py-2.5 text-[14px] text-public-text-medium hover:text-public-accent-taupe-dark hover:bg-public-beige-bg/60 transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/blog" className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors">
            Blog
          </Link>
          <Link href="/tarifs" className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors">
            Tarifs
          </Link>
          <Link href="/contact" className="text-public-text-medium hover:text-public-accent-taupe-dark transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:inline-flex">
          <CtaButton variant="primary" size="md">
            Réserver
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
