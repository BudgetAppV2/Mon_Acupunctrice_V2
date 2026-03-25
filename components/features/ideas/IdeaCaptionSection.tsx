'use client';

import { useState, useEffect } from 'react';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import type { ContentItem } from '@/lib/types';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function IdeaCaptionSection({ item }: { item: ContentItem }) {
  const { updateItem } = useUpdateContentItem();
  const [draft, setDraft] = useState(item.captionDraft || '');
  const [caption, setCaption] = useState(item.caption || '');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { setDraft(item.captionDraft || ''); }, [item.captionDraft]);
  useEffect(() => { setCaption(item.caption || ''); }, [item.caption]);

  const saveDraft = () => {
    if (draft !== (item.captionDraft || '')) updateItem(item.id, { captionDraft: draft });
  };

  const handleOptimize = async () => {
    setGenerating(true);
    try {
      const body: Record<string, string> = {
        title: item.title,
        category: item.category,
        platform: 'instagram',
        contentStyle: item.contentStyle || 'enseigner',
      };
      if (draft.trim()) body.captionDraft = draft;
      if (item.notes) body.notes = item.notes;

      const res = await fetch('/api/generate-caption-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
        updateItem(item.id, { caption: data.caption });
      }
    } catch { /* garder la caption existante */ } finally { setGenerating(false); }
  };

  const handleRestore = () => {
    setCaption(draft);
    updateItem(item.id, { caption: draft });
  };

  const showRestore = caption && draft && caption !== draft;

  return (
    <div className="space-y-2 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Caption</p>

      {/* Brouillon de Judith */}
      <textarea
        value={draft} onChange={e => setDraft(e.target.value)} onBlur={saveDraft}
        rows={2} placeholder="Ton texte pour accompagner le Reel..."
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 resize-none"
      />

      <div className="flex gap-2">
        <button
          onClick={handleOptimize} disabled={generating}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-sage/30 bg-sage/5 rounded-lg text-sm text-sage font-medium disabled:opacity-50"
        >
          <SparklesIcon className="w-4 h-4" />
          {generating ? 'Optimisation...' : 'Optimiser'}
        </button>
        {showRestore && (
          <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
          >
            <ArrowPathIcon className="w-4 h-4" /> Mon texte
          </button>
        )}
      </div>

      {/* Caption enrichie (lecture seule, affichee si differente du draft) */}
      {caption && caption !== draft && (
        <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-700 whitespace-pre-wrap relative">
          {caption}
          <button
            onClick={() => { setCaption(''); updateItem(item.id, { caption: '' }); }}
            className="absolute top-1 right-1 text-[10px] text-gray-400 hover:text-red-400 px-1.5 py-0.5 rounded"
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}
