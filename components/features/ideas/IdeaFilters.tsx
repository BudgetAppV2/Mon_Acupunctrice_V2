'use client';

import { useState } from 'react';
import type { WorkflowState } from '@/lib/types';
import { WORKFLOW_LABELS } from '@/lib/types';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { getAllCategories, getCategoryLabel } from '@/lib/utils/categories';
import { FunnelIcon, TagIcon } from '@heroicons/react/24/outline';
import FilterSheet from './FilterSheet';

const STATUS_OPTIONS = Object.entries(WORKFLOW_LABELS).map(([v, l]) => ({ value: v, label: l }));

interface Props {
  selectedStatus?: WorkflowState;
  selectedCategory?: string;
  onStatusChange: (status?: WorkflowState) => void;
  onCategoryChange: (category?: string) => void;
}

export default function IdeaFilters({ selectedStatus, selectedCategory, onStatusChange, onCategoryChange }: Props) {
  const { customCategories } = useUserProfile();
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const statusLabel = selectedStatus ? WORKFLOW_LABELS[selectedStatus] : 'Tous statuts';
  const catLabel = selectedCategory ? getCategoryLabel(selectedCategory) : 'Toute categorie';

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setStatusOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
            selectedStatus ? 'bg-sage/10 text-sage' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          {selectedStatus && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
          {statusLabel}
        </button>
        <button
          onClick={() => setCategoryOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
            selectedCategory ? 'bg-sage/10 text-sage' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TagIcon className="w-4 h-4" />
          {selectedCategory && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
          {catLabel}
        </button>
      </div>

      <FilterSheet isOpen={statusOpen} onClose={() => setStatusOpen(false)} title="Statut"
        options={STATUS_OPTIONS} selected={selectedStatus}
        onSelect={(v) => onStatusChange(v as WorkflowState | undefined)} />
      <FilterSheet isOpen={categoryOpen} onClose={() => setCategoryOpen(false)} title="Categorie"
        options={getAllCategories(customCategories)} selected={selectedCategory}
        onSelect={onCategoryChange} />
    </>
  );
}
