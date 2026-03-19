'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { useCreateContentItem } from '@/lib/hooks/useCreateContentItem';
import { CATEGORY_LABELS, type ContentCategory } from '@/lib/types';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ContentCategory, string][];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIdeaSheet({ isOpen, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ContentCategory>('autre');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createItem } = useCreateContentItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createItem({
        title: title.trim(),
        category,
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setCategory('autre');
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Nouvelle idée">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: L'acupuncture et la fertilité"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ContentCategory)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none bg-white"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes de tournage, points clés..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="w-full bg-sage text-white rounded-lg py-2.5 text-sm font-medium hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Création...' : "Créer l'idée"}
        </button>
      </form>
    </BottomSheet>
  );
}
