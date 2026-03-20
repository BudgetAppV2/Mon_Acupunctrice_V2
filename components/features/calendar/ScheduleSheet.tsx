'use client';

import { Timestamp } from 'firebase/firestore';
import BottomSheet from '@/components/ui/BottomSheet';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { getCategoryLabel } from '@/lib/utils/categories';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onScheduled: () => void;
}

export default function ScheduleSheet({ isOpen, onClose, selectedDate, onScheduled }: Props) {
  const { data, loading } = useContentItems();
  const { updateItem } = useUpdateContentItem();

  // Tous les items avec video, pas encore planifies/publies
  const schedulable = data.filter(i =>
    i.videoUrl && i.distributionStatus !== 'scheduled' && i.distributionStatus !== 'published' && i.distributionStatus !== 'publishing'
  );

  const readyDraft = schedulable.filter(i => i.workflowState === 'ready');
  const editing = schedulable.filter(i => i.workflowState === 'editing');
  const shot = schedulable.filter(i => i.workflowState === 'shot');

  const handleSelect = async (itemId: string) => {
    if (!selectedDate) return;
    const at = new Date(selectedDate);
    at.setHours(18, 0, 0, 0);
    await updateItem(itemId, { scheduledAt: Timestamp.fromDate(at), distributionStatus: 'scheduled' });
    onScheduled();
  };

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const renderGroup = (title: string, items: ContentItem[], note?: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        {items.map(item => (
          <button key={item.id} onClick={() => handleSelect(item.id)} className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors mb-1">
            <p className="text-sm font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{getCategoryLabel(item.category)}{note ? ` · ${note}` : ''}</p>
          </button>
        ))}
      </div>
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Planifier — ${dateLabel}`}>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
        </div>
      ) : schedulable.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <LightBulbIcon className="w-10 h-10 text-sage/40 mb-2" />
          <p className="text-sm text-gray-400 text-center">Cree du contenu dans l'onglet Idees pour le planifier ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {renderGroup('Pretes a publier', readyDraft)}
          {renderGroup('En montage', editing)}
          {renderGroup('Filmees', shot, 'montage a terminer')}
        </div>
      )}
    </BottomSheet>
  );
}
