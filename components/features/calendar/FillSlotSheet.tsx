'use client';

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import BottomSheet from '@/components/ui/BottomSheet';
import CreateIdeaSheet from '@/components/features/ideas/CreateIdeaSheet';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { getFirebaseFirestore } from '@/lib/firebase';
import { getStyleLabel, getStyleBg } from '@/lib/utils/contentStyles';
import { LightBulbIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { CalendarSlot, ContentItem } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slot: CalendarSlot | null;
  onFilled: () => void;
}

export default function FillSlotSheet({ isOpen, onClose, slot, onFilled }: Props) {
  const { data, loading } = useContentItems();
  const [showCreate, setShowCreate] = useState(false);

  if (!slot) return null;

  // Items non planifiés ni publiés : style correspondant en tête de liste
  const schedulable = data.filter(
    (i) => i.distributionStatus !== 'scheduled' &&
           i.distributionStatus !== 'published' &&
           i.distributionStatus !== 'publishing',
  );
  const matching = schedulable.filter((i) => i.contentStyle === slot.contentStyle);
  const others = schedulable.filter((i) => i.contentStyle !== slot.contentStyle);
  const ordered = [...matching, ...others];

  const handleSelect = async (item: ContentItem) => {
    const db = getFirebaseFirestore();
    await Promise.all([
      updateDoc(doc(db, 'calendarSlots', slot.id), {
        status: 'filled',
        contentItemId: item.id,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(doc(db, 'contentItems', item.id), {
        scheduledAt: slot.scheduledDate,
        slotId: slot.id,
        distributionStatus: 'scheduled',
        updatedAt: serverTimestamp(),
      }),
    ]);
    onFilled();
  };

  const handleSkip = async () => {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'calendarSlots', slot.id), {
      status: 'skipped',
      updatedAt: serverTimestamp(),
    });
    onFilled();
  };

  const styleBg = getStyleBg(slot.contentStyle);
  const styleLabel = getStyleLabel(slot.contentStyle);
  const formatLabel = slot.format === 'reel' ? 'Reel' : slot.format === 'story' ? 'Story' : 'Post';

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Remplir cet emplacement">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styleBg}`}>{styleLabel}</span>
            <span className="text-xs text-gray-500">{formatLabel}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
            </div>
          ) : ordered.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <LightBulbIcon className="w-10 h-10 text-sage/40 mb-2" />
              <p className="text-sm text-gray-400 text-center">Aucune idee disponible pour ce style</p>
            </div>
          ) : (
            <div className="space-y-1">
              {ordered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.contentStyle && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStyleBg(item.contentStyle)}`}>
                      {getStyleLabel(item.contentStyle)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-sage py-2 border border-sage/30 rounded-lg hover:bg-sage/5 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Creer une idee
          </button>

          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-400 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Passer ce slot
          </button>
        </div>
      </BottomSheet>

      <CreateIdeaSheet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        defaultStyle={slot.contentStyle}
      />
    </>
  );
}
