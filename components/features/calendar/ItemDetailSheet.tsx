'use client';

import { useRouter } from 'next/navigation';
import { deleteField } from 'firebase/firestore';
import BottomSheet from '@/components/ui/BottomSheet';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { CATEGORY_LABELS, WORKFLOW_LABELS, type ContentItem } from '@/lib/types';
import { PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onUnscheduled: () => void;
}

export default function ItemDetailSheet({ isOpen, onClose, item, onUnscheduled }: Props) {
  const router = useRouter();
  const { updateItem } = useUpdateContentItem();

  if (!item) return null;

  const handleUnschedule = async () => {
    await updateItem(item.id, {
      distributionStatus: 'draft',
      scheduledAt: deleteField(),
    });
    onUnscheduled();
  };

  const handleEdit = () => {
    router.push(`/editeur/${item.id}`);
    onClose();
  };

  const scheduledDate = item.scheduledAt?.toDate();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Détails">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{CATEGORY_LABELS[item.category]}</span>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-500">{WORKFLOW_LABELS[item.workflowState]}</span>
          </div>
          {scheduledDate && (
            <p className="text-xs text-sage mt-1">
              Planifié le{' '}
              {scheduledDate.toLocaleDateString('fr-CA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          {item.caption && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">
              {item.caption}
            </p>
          )}
        </div>

        {item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
            alt=""
            className="rounded-lg w-full max-h-48 object-cover"
          />
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="w-5 h-5 text-sage" />
            <span className="text-sm font-medium text-gray-900">Modifier</span>
          </button>

          {item.distributionStatus === 'scheduled' && (
            <button
              onClick={handleUnschedule}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Déprogrammer</span>
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
