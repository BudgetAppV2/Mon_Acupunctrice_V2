'use client';

import { LightBulbIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '@/lib/types';
import ContentCard from './ContentCard';

interface Props {
  items: ContentItem[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
}

export default function IdeaList({ items, loading, error, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <LightBulbIcon className="w-12 h-12 text-sage/40 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">
          Votre prochaine idée brillante commence ici.
        </p>
        <p className="text-gray-400 text-sm">
          Appuyez sur + pour la capturer !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
