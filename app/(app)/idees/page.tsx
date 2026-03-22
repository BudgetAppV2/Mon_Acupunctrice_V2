'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useDeleteContentItem } from '@/lib/hooks/useDeleteContentItem';
import IdeaFilters from '@/components/features/ideas/IdeaFilters';
import IdeaList from '@/components/features/ideas/IdeaList';
import CreateIdeaSheet from '@/components/features/ideas/CreateIdeaSheet';
import IdeaDetailSheet from '@/components/features/ideas/IdeaDetailSheet';
import type { ContentItem, WorkflowState } from '@/lib/types';

export default function IdeesPage() {
  const [selectedStatus, setSelectedStatus] = useState<WorkflowState>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, loading, error } = useContentItems({
    status: selectedStatus,
    categories: selectedCategory ? [selectedCategory] : undefined,
  });
  const { deleteItem } = useDeleteContentItem();

  const handleSelect = (item: ContentItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  // Garder l'item a jour avec les donnees temps reel
  const liveItem = selectedItem ? data.find(i => i.id === selectedItem.id) ?? selectedItem : null;

  return (
    <div className="min-h-screen bg-sand">
      <header className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-sage">Mes idees</h1>
      </header>

      <div className="px-4 py-3">
        <IdeaFilters
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          onStatusChange={setSelectedStatus}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="px-4 pb-24">
        <IdeaList items={data} loading={loading} error={error} onDelete={deleteItem} onSelect={handleSelect} />
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed right-5 w-14 h-14 bg-sage text-white rounded-full shadow-lg flex items-center justify-center hover:bg-sage/90 transition-colors z-40"
        style={{ bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Nouvelle idee"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <CreateIdeaSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
      <IdeaDetailSheet isOpen={detailOpen} onClose={() => setDetailOpen(false)} item={liveItem} />
    </div>
  );
}
