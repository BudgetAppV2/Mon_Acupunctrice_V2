'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import VideoThumbnail from '@/components/ui/VideoThumbnail';
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

        {/* Preview : coverImageUrl > thumbnailUrl > génération à la volée */}
        {(item.coverImageUrl || item.thumbnailUrl) ? (
          <div className="flex justify-center">
            <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" className="rounded-lg w-24" style={{ aspectRatio: '9/16', objectFit: 'cover' }} />
          </div>
        ) : item.videoUrl ? (
          <div className="flex justify-center">
            <VideoThumbnail videoUrl={item.videoUrl} className="rounded-lg w-24 h-auto" />
          </div>
        ) : null}

        <IdeaCaptionSection item={item} />
        <IdeaActions item={item} onClose={onClose} />
      </div>
    </BottomSheet>
  );
}
