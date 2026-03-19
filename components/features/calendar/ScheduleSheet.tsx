'use client';

import { Timestamp } from 'firebase/firestore';
import BottomSheet from '@/components/ui/BottomSheet';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { CATEGORY_LABELS } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onScheduled: () => void;
}

export default function ScheduleSheet({ isOpen, onClose, selectedDate, onScheduled }: Props) {
  const { data, loading } = useContentItems({ status: 'ready' });
  const { updateItem } = useUpdateContentItem();

  // Exclure les items déjà planifiés
  const available = data.filter((item) => item.distributionStatus === 'draft');

  const handleSelect = async (itemId: string) => {
    if (!selectedDate) return;
    const at = new Date(selectedDate);
    at.setHours(18, 0, 0, 0); // Heure de publication par défaut

    await updateItem(itemId, {
      scheduledAt: Timestamp.fromDate(at),
      distributionStatus: 'scheduled',
    });
    onScheduled();
  };

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Planifier — ${dateLabel}`}>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
        </div>
      ) : available.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Aucun contenu prêt à planifier.
        </p>
      ) : (
        <div className="space-y-2">
          {available.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{CATEGORY_LABELS[item.category]}</p>
            </button>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
