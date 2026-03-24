'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { useCreateContentItem } from '@/lib/hooks/useCreateContentItem';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { getAllCategories } from '@/lib/utils/categories';
import VoiceRecordButton from './VoiceRecordButton';
import type { ContentStyle } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStyle?: ContentStyle;
}

export default function CreateIdeaSheet({ isOpen, onClose, defaultStyle }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('autre');
  const [customCat, setCustomCat] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { createItem } = useCreateContentItem();
  const { customCategories, updateCustomCategories } = useUserProfile();

  const categories = getAllCategories(customCategories);

  const handleVoiceResult = (result: { title: string; notes: string; category?: string }) => {
    setTitle(result.title);
    setNotes(result.notes);
    if (result.category) {
      const match = categories.find(c => c.value === result.category);
      if (match) setCategory(result.category);
    }
    setVoiceError(null);
  };

  const handleCategoryChange = (val: string) => {
    if (val === '__custom__') {
      setShowCustom(true);
      setCategory('');
    } else {
      setShowCustom(false);
      setCategory(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    const finalCategory = showCustom ? customCat.trim() : category;
    if (!finalCategory) return;

    setSubmitting(true);
    try {
      // Sauvegarder la nouvelle categorie custom si besoin
      if (showCustom && customCat.trim() && !customCategories.includes(customCat.trim())) {
        await updateCustomCategories([...customCategories, customCat.trim()]);
      }

      await createItem({
        title: title.trim(),
        category: finalCategory,
        notes: notes.trim() || undefined,
        contentStyle: defaultStyle,
      });
      setTitle('');
      setCategory('autre');
      setCustomCat('');
      setShowCustom(false);
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Nouvelle idee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {voiceError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{voiceError}</p>}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Titre *</label>
            <VoiceRecordButton onResult={handleVoiceResult} onError={setVoiceError} disabled={submitting} />
          </div>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: L'acupuncture et la fertilite"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
          <select
            value={showCustom ? '__custom__' : category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none bg-white"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            <option value="__custom__">Autre...</option>
          </select>
          {showCustom && (
            <input
              type="text" value={customCat} onChange={(e) => setCustomCat(e.target.value)}
              placeholder="Nom de la nouvelle categorie"
              className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes de tournage, points cles..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage focus:border-sage outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting || (showCustom && !customCat.trim())}
          className="w-full bg-sage text-white rounded-lg py-2.5 text-sm font-medium hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creation...' : "Creer l'idee"}
        </button>
      </form>
    </BottomSheet>
  );
}
