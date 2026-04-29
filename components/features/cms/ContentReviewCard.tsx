'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import type { PublicationStatus } from '@/lib/types/faq';

export type ContentType = 'blog' | 'faq' | 'ressource';

interface ContentReviewCardProps {
  id: string;
  title: string;
  type: ContentType;
  status: PublicationStatus;
  excerpt?: string;
  updatedAt?: string;
  reviewComment?: string;
  editHref?: string;
}

const TYPE_LABELS: Record<ContentType, { label: string; color: string }> = {
  blog: { label: 'Blog', color: 'bg-blue-100 text-blue-700' },
  faq: { label: 'FAQ', color: 'bg-purple-100 text-purple-700' },
  ressource: { label: 'Ressource', color: 'bg-teal-100 text-teal-700' },
};

export default function ContentReviewCard({
  id,
  title,
  type,
  status,
  excerpt,
  updatedAt,
  reviewComment,
  editHref,
}: ContentReviewCardProps) {
  const typeInfo = TYPE_LABELS[type];
  const href = editHref || (type === 'faq' ? `/contenu/faq/${id}` : type === 'ressource' ? `/contenu/ressources/${id}` : `/blogue`);

  return (
    <Link href={href} className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-sage/40 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <StatusBadge status={status} />
        {updatedAt && (
          <span className="ml-auto text-[11px] text-gray-400">
            {new Date(updatedAt).toLocaleDateString('fr-CA')}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</h3>
      {excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{excerpt}</p>}
      {reviewComment && (
        <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-200">
          Commentaire : {reviewComment}
        </div>
      )}
    </Link>
  );
}
