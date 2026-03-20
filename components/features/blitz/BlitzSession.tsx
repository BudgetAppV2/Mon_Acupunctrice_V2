'use client';

import { useState, useRef } from 'react';
import { CheckCircleIcon, ForwardIcon } from '@heroicons/react/24/solid';
import type { ContentItem } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';

interface Props {
  items: ContentItem[];
  onMarkShot: (id: string) => void;
}

export default function BlitzSession({ items, onMarkShot }: Props) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [shotCount, setShotCount] = useState(0);
  // Capturer le total initial — les items sortent de la liste quand ils sont filmés
  const initialTotalRef = useRef(0);

  if (initialTotalRef.current === 0 && items.length > 0) {
    initialTotalRef.current = items.length;
  }

  const total = initialTotalRef.current || items.length;
  const remaining = items.filter((item) => !skippedIds.has(item.id));
  const current = remaining[0];
  const isDone = remaining.length === 0;
  const progress = total > 0 ? (shotCount / total) * 100 : 0;

  if (items.length === 0 && shotCount === 0) {
    return (
      <div className="text-center py-20 px-6">
        <p className="text-gray-400 text-sm">
          Aucune idée prête à filmer pour le moment.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Changez le statut de vos idées en &laquo;&nbsp;À filmer&nbsp;&raquo; d&apos;abord.
        </p>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="text-center py-20 px-6">
        <CheckCircleIcon className="w-16 h-16 text-sage mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900">Session terminée !</p>
        <p className="text-sm text-gray-500 mt-1">
          {shotCount} / {total} idée{total > 1 ? 's' : ''} filmée{shotCount > 1 ? 's' : ''}.
        </p>
      </div>
    );
  }

  const handleShot = () => {
    if (!current) return;
    onMarkShot(current.id);
    setShotCount((prev) => prev + 1);
  };

  const handleSkip = () => {
    if (!current) return;
    setSkippedIds((prev) => new Set(prev).add(current.id));
  };

  return (
    <div className="flex flex-col items-center px-4">
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{shotCount} filmée{shotCount > 1 ? 's' : ''}</span>
          <span>{total} au total</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sage h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <span className="text-xs text-gray-400">
          {shotCount + skippedIds.size + 1} / {total}
        </span>
        <h2 className="text-xl font-semibold text-gray-900 mt-2">
          {current.title}
        </h2>
        <p className="text-sm text-sage mt-1">
          {CATEGORY_LABELS[current.category as keyof typeof CATEGORY_LABELS] ?? current.category}
        </p>
        {current.notes && (
          <p className="text-sm text-gray-500 mt-3 text-left bg-gray-50 rounded-lg p-3">
            {current.notes}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-8 w-full">
        <button
          onClick={handleSkip}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ForwardIcon className="w-5 h-5" />
          Passer
        </button>
        <button
          onClick={handleShot}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sage text-white text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Filmé !
        </button>
      </div>
    </div>
  );
}
