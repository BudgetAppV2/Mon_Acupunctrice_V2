'use client';

import type { ContentCategory, WorkflowState } from '@/lib/types';
import { CATEGORY_LABELS, WORKFLOW_LABELS } from '@/lib/types';

const STATUSES = Object.entries(WORKFLOW_LABELS) as [WorkflowState, string][];
const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ContentCategory, string][];

interface Props {
  selectedStatus?: WorkflowState;
  selectedCategories: ContentCategory[];
  onStatusChange: (status?: WorkflowState) => void;
  onCategoriesChange: (categories: ContentCategory[]) => void;
}

export default function IdeaFilters({
  selectedStatus,
  selectedCategories,
  onStatusChange,
  onCategoriesChange,
}: Props) {
  const toggleCategory = (cat: ContentCategory) => {
    if (selectedCategories.includes(cat)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== cat));
    } else {
      onCategoriesChange([...selectedCategories, cat]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onStatusChange(undefined)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !selectedStatus ? 'bg-sage text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Tous
        </button>
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => onStatusChange(value === selectedStatus ? undefined : value)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedStatus === value ? 'bg-sage text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => toggleCategory(value)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategories.includes(value)
                ? 'bg-sage/20 text-sage ring-1 ring-sage'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
