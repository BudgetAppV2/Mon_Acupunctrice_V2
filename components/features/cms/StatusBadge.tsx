'use client';

import type { PublicationStatus } from '@/lib/types/faq';

const STYLES: Record<PublicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const LABELS: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  published: 'Publie',
  rejected: 'Rejete',
};

export default function StatusBadge({ status }: { status: PublicationStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
