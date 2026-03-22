'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import type { ContentItem } from '@/lib/types';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import IdeaInfoSection from './IdeaInfoSection';
import IdeaCaptionSection from './IdeaCaptionSection';
import IdeaActions from './IdeaActions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export default function IdeaDetailSheet({ isOpen, onClose, item }: Props) {
  if (!item) return null;
  // eslint-disable-next-line no-console
  if (isOpen) console.log('[DETAIL] idea item:', { id: item.id, videoUrl: !!item.videoUrl, thumbnailUrl: !!item.thumbnailUrl, coverImageUrl: !!item.coverImageUrl, workflowState: item.workflowState });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Details">
      <div className="space-y-4">
        <IdeaInfoSection item={item} />

        {/* Preview vidéo : coverImageUrl > thumbnailUrl > placeholder */}
        {(item.coverImageUrl || item.thumbnailUrl) ? (
          <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" className="rounded-lg w-full max-h-36 object-cover" />
        ) : item.videoUrl ? (
          <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
            <VideoCameraIcon className="w-6 h-6 text-sage" />
            <span className="text-sm text-gray-500">Video prete</span>
          </div>
        ) : null}

        <IdeaCaptionSection item={item} />
        <IdeaActions item={item} onClose={onClose} />
      </div>
    </BottomSheet>
  );
}
