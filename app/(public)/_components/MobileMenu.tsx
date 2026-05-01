'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import CtaButton from './CtaButton';

const SERVICE_LINKS = [
  { href: '/services/fertilite', label: 'Fertilité' },
  { href: '/services/grossesse', label: 'Grossesse' },
  { href: '/services/pediatrie', label: 'Pédiatrie' },
  { href: '/services/acupuncture-sociale', label: 'Acupuncture sociale' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [servicesOpen, setServicesOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-white"
      style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}
    >
      {/* Header bar */}
      <div className="shrink-0 flex justify-between items-center px-5 py-3.5 border-b border-public-border-subtle">
        <span className="font-public-serif text-[22px] font-semibold text-public-text-dark">
          Judith Dufour Savard
        </span>
        <button
          onClick={onClose}
          aria-label="Fermer le menu"
          className="p-2 -mr-2 text-public-text-dark"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation — grow to fill, scrollable */}
      <div className="grow overflow-y-auto px-5 pt-8 pb-4">
        <nav className="flex flex-col gap-1">
          <Link
            href="/a-propos"
            onClick={onClose}
            className="text-lg font-medium text-public-text-medium py-3 border-b border-public-border-subtle/50 transition-colors hover:text-public-accent-taupe-dark"
          >
            À propos
          </Link>

          {/* Services avec sous-menu dépliable */}
          <div className="border-b border-public-border-subtle/50">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="w-full text-left text-lg font-medium text-public-text-medium py-3 transition-colors hover:text-public-accent-taupe-dark flex items-center justify-between"
            >
              Services
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {servicesOpen && (
              <div className="pb-3 pl-4 flex flex-col gap-1">
                <Link
                  href="/services"
                  onClick={onClose}
                  className="text-[15px] text-public-accent-warm font-medium py-2"
                >
                  Tous les services
                </Link>
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="text-[15px] text-public-text-medium py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/blog"
            onClick={onClose}
            className="text-lg font-medium text-public-text-medium py-3 border-b border-public-border-subtle/50"
          >
            Blog
          </Link>
          <Link
            href="/tarifs"
            onClick={onClose}
            className="text-lg font-medium text-public-text-medium py-3 border-b border-public-border-subtle/50"
          >
            Tarifs
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className="text-lg font-medium text-public-text-medium py-3 border-b border-public-border-subtle/50"
          >
            Contact
          </Link>
        </nav>
      </div>

      {/* CTA fixé en bas */}
      <div className="shrink-0 px-5 pb-8 pt-4 border-t border-public-border-subtle/30">
        <CtaButton variant="primary" size="lg" className="w-full justify-center">
          Réserver une séance
        </CtaButton>
      </div>
    </div>
  );
}
