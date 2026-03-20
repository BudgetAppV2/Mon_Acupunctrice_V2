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

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Details">
      <div className="space-y-4">
        <IdeaInfoSection item={item} />

        {/* Thumbnail video (si elle existe) */}
        {item.videoUrl && (
          item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="rounded-lg w-full max-h-36 object-cover" />
          ) : (
            <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <VideoCameraIcon className="w-8 h-8 text-gray-300" />
            </div>
          )
        )}

        <IdeaCaptionSection item={item} />
        <IdeaActions item={item} onClose={onClose} />
      </div>
    </BottomSheet>
  );
}
