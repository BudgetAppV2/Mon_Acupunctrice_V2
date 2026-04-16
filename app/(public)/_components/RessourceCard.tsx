import Link from 'next/link';
import type { Ressource } from '@/lib/types/ressource';

interface RessourceCardProps {
  ressource: Pick<Ressource, 'slug' | 'title' | 'metaDescription' | 'pilier' | 'shortAnswer'>;
}

const PILIER_LABELS: Record<string, string> = {
  fertilite: 'Fertilite',
  grossesse: 'Grossesse',
  pediatrie: 'Pediatrie',
  'acupuncture-sociale': 'Acupuncture sociale',
  transversal: 'Transversal',
};

export default function RessourceCard({ ressource }: RessourceCardProps) {
  return (
    <Link
      href={`/ressources/${ressource.slug}`}
      className="group flex flex-col h-full bg-white border border-public-border-subtle rounded-[14px] p-6 hover:-translate-y-1 hover:shadow-public-md hover:border-public-accent-taupe transition-all"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-3">
        {PILIER_LABELS[ressource.pilier] ?? ressource.pilier}
      </span>
      <h3 className="font-public-serif text-[22px] font-semibold leading-[1.3] text-public-text-dark mb-3 line-clamp-3 group-hover:text-public-accent-warm transition-colors">
        {ressource.title}
      </h3>
      <p className="text-[14px] text-public-text-medium leading-relaxed line-clamp-4 flex-1">
        {ressource.metaDescription}
      </p>
      <span className="mt-4 text-[13px] font-medium text-public-accent-warm">
        Lire le guide complet &rarr;
      </span>
    </Link>
  );
}
