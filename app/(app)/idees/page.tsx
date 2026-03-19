'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useDeleteContentItem } from '@/lib/hooks/useDeleteContentItem';
import IdeaFilters from '@/components/features/ideas/IdeaFilters';
import IdeaList from '@/components/features/ideas/IdeaList';
import CreateIdeaSheet from '@/components/features/ideas/CreateIdeaSheet';
import type { ContentCategory, WorkflowState } from '@/lib/types';

export default function IdeesPage() {
  const [selectedStatus, setSelectedStatus] = useState<WorkflowState>();
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, loading, error } = useContentItems({
    status: selectedStatus,
    categories: selectedCategories,
  });
  const { deleteItem } = useDeleteContentItem();

  return (
    <div className="min-h-screen bg-sand">
      <header className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-sage">Mes idées</h1>
      </header>

      <div className="px-4 py-3">
        <IdeaFilters
          selectedStatus={selectedStatus}
          selectedCategories={selectedCategories}
          onStatusChange={setSelectedStatus}
          onCategoriesChange={setSelectedCategories}
        />
      </div>

      <div className="px-4 pb-24">
        <IdeaList items={data} loading={loading} error={error} onDelete={deleteItem} />
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sage text-white rounded-full shadow-lg flex items-center justify-center hover:bg-sage/90 transition-colors z-40"
        aria-label="Nouvelle idée"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <CreateIdeaSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
