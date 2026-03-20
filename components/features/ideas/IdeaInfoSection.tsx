'use client';

import { useState, useEffect } from 'react';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { getAllCategories } from '@/lib/utils/categories';
import { WORKFLOW_LABELS, type ContentItem, type WorkflowState } from '@/lib/types';

function getStatusLabel(item: ContentItem): string {
  if (item.distributionStatus === 'published') return 'Publiee';
  if (item.distributionStatus === 'scheduled') return 'Planifiee';
  if (item.distributionStatus === 'publishing') return 'Publication...';
  if (item.distributionStatus === 'failed') return 'Echouee';
  return WORKFLOW_LABELS[item.workflowState];
}

const STATUS_COLORS: Record<WorkflowState, string> = {
  idea: 'bg-status-idea', planned: 'bg-status-planned', ready_to_shoot: 'bg-status-shot',
  shot: 'bg-status-shot', editing: 'bg-status-editing', ready: 'bg-status-ready',
};

export default function IdeaInfoSection({ item }: { item: ContentItem }) {
  const { updateItem } = useUpdateContentItem();
  const { customCategories, updateCustomCategories } = useUserProfile();
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes || '');
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState('');

  useEffect(() => { setTitle(item.title); }, [item.title]);
  useEffect(() => { setNotes(item.notes || ''); }, [item.notes]);

  const saveTitle = () => { if (title.trim() && title.trim() !== item.title) updateItem(item.id, { title: title.trim() }); };
  const saveNotes = () => { if (notes !== (item.notes || '')) updateItem(item.id, { notes }); };

  const handleCategory = async (val: string) => {
    if (val === '__custom__') { setShowCustomCat(true); return; }
    setShowCustomCat(false);
    if (val !== item.category) updateItem(item.id, { category: val });
  };

  const saveCustomCat = async () => {
    if (!customCat.trim()) return;
    if (!customCategories.includes(customCat.trim())) {
      await updateCustomCategories([...customCategories, customCat.trim()]);
    }
    await updateItem(item.id, { category: customCat.trim() });
    setShowCustomCat(false);
    setCustomCat('');
  };

  const categories = getAllCategories(customCategories);
  const created = item.createdAt?.toDate();

  return (
    <div className="space-y-3">
      {/* Badge statut + date */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[item.workflowState]}`}>
          {getStatusLabel(item)}
        </span>
        {created && <span className="text-[10px] text-gray-400">{created.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>

      {/* Titre editable */}
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()}
        className="w-full text-base font-semibold text-gray-900 bg-transparent border-b border-transparent focus:border-sage outline-none py-0.5"
      />

      {/* Categorie dropdown */}
      <select
        value={showCustomCat ? '__custom__' : item.category}
        onChange={e => handleCategory(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
      >
        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        <option value="__custom__">Autre...</option>
      </select>
      {showCustomCat && (
        <div className="flex gap-2">
          <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="Nouvelle categorie"
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={saveCustomCat} disabled={!customCat.trim()} className="px-3 py-1.5 bg-sage text-white text-sm rounded-lg disabled:opacity-50">OK</button>
        </div>
      )}

      {/* Notes editables */}
      <textarea
        value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
        rows={2} placeholder="Notes de tournage, points cles..."
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 resize-none"
      />
    </div>
  );
}
