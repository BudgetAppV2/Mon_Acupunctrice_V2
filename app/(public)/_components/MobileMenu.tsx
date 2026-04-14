import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CtaButton from './CtaButton';

const NAV_LINKS = [
  { href: '/a-propos', label: 'A propos' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
] as const;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-public-border-subtle">
        <span className="font-public-serif text-[22px] font-semibold text-public-text-dark">
          Judith Dufour-Savard
        </span>
        <button
          onClick={onClose}
          aria-label="Fermer le menu"
          className="p-2 -mr-2 text-public-text-dark"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-5 pt-8">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="text-lg font-medium text-public-text-medium py-3 border-b border-public-border-subtle/50 transition-colors hover:text-public-accent-taupe-dark"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 pb-8 pt-4">
        <CtaButton variant="primary" size="lg" className="w-full justify-center">
          Reserver une seance
        </CtaButton>
      </div>
    </div>
  );
}
