'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import type { ContentItem } from '@/lib/types';
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

        {/* Preview vidéo : coverImageUrl > thumbnailUrl > video > placeholder */}
        {(item.coverImageUrl || item.thumbnailUrl) ? (
          <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" className="rounded-lg w-full max-h-36 object-cover" />
        ) : item.videoUrl ? (
          <video
            src={item.videoUrl}
            className="rounded-lg w-full max-h-36 object-cover"
            playsInline
            muted
            preload="metadata"
          />
        ) : null}

        <IdeaCaptionSection item={item} />
        <IdeaActions item={item} onClose={onClose} />
      </div>
    </BottomSheet>
  );
}
