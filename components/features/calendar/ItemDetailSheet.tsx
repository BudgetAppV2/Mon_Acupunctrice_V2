'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteField, Timestamp, doc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import BottomSheet from '@/components/ui/BottomSheet';
import PublishSheet from '@/components/features/publish/PublishSheet';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { getFirebaseFirestore } from '@/lib/firebase';
import { WORKFLOW_LABELS, type ContentItem } from '@/lib/types';
import { getCategoryLabel } from '@/lib/utils/categories';
import { PencilIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import VideoThumbnail from '@/components/ui/VideoThumbnail';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onUnscheduled: () => void;
}

const PRESET_HOURS = ['08:00', '12:00', '18:00', '20:00'];

export default function ItemDetailSheet({ isOpen, onClose, item, onUnscheduled }: Props) {
  const router = useRouter();
  const { updateItem } = useUpdateContentItem();
  const [showPublish, setShowPublish] = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('18:00');

  if (!item) return null;

  const handleUnschedule = async () => {
    // Remettre le slot à open si lié
    if (item.slotId) {
      const db = getFirebaseFirestore();
      await updateDoc(doc(db, 'calendarSlots', item.slotId), {
        status: 'open',
        contentItemId: deleteField(),
        updatedAt: serverTimestamp(),
      });
    }
    await updateItem(item.id, {
      distributionStatus: 'draft',
      scheduledAt: null,
      slotId: null,
    });
    onUnscheduled();
  };

  const handleEdit = () => { router.push(`/editeur/${item.id}`); onClose(); };

  const openDateEdit = () => {
    setEditDate(true);
    const d = item.scheduledAt?.toDate();
    if (d) {
      setNewDate(d.toISOString().split('T')[0]);
      setNewTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }
  };

  const handleDateChange = async () => {
    if (!newDate) return;
    await updateItem(item.id, { scheduledAt: Timestamp.fromDate(new Date(`${newDate}T${newTime}`)) });
    setEditDate(false);
  };

  const scheduledDate = item.scheduledAt?.toDate();
  const canPublish = item.workflowState === 'ready' && !!item.videoUrl;

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Details">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{getCategoryLabel(item.category)}</span>
              <span className="text-xs text-gray-300">&middot;</span>
              <span className="text-xs text-gray-500">{WORKFLOW_LABELS[item.workflowState]}</span>
            </div>
            {scheduledDate && (
              <p className="text-xs text-sage mt-1">
                Planifie le {scheduledDate.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })} a {scheduledDate.getHours()}h{String(scheduledDate.getMinutes()).padStart(2, '0')}
              </p>
            )}
            {item.caption && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{item.caption}</p>}
          </div>

          {/* Changer la date/heure (si planifie) */}
          {item.distributionStatus === 'scheduled' && (
            editDate ? (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                <div className="flex gap-1">
                  {PRESET_HOURS.map(h => (
                    <button key={h} onClick={() => setNewTime(h)} className={`px-2 py-1 rounded text-xs font-medium ${newTime === h ? 'bg-sage text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {h.split(':')[0]}h
                    </button>
                  ))}
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="flex-1 border border-gray-200 rounded px-1 py-1 text-xs" />
                </div>
                <button onClick={handleDateChange} disabled={!newDate} className="w-full py-2 bg-sage text-white rounded-lg text-sm font-medium disabled:opacity-50">Confirmer</button>
              </div>
            ) : (
              <button onClick={openDateEdit} className="text-xs text-sage font-medium">Changer la date</button>
            )
          )}

          {/* Preview : coverImageUrl > thumbnailUrl > génération à la volée */}
          {(item.coverImageUrl || item.thumbnailUrl) ? (
            <div className="flex justify-center">
              <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" className="rounded-lg w-28" style={{ aspectRatio: '9/16', objectFit: 'cover' }} />
            </div>
          ) : (item.videoUrl || item.sourceVideoUrl) ? (
            <div className="flex justify-center">
              <VideoThumbnail videoUrl={(item.videoUrl || item.sourceVideoUrl)!} className="rounded-lg w-28 h-auto" />
            </div>
          ) : null}

          <div className="space-y-2 pt-2">
            {/* Dans un slot : publication automatique par le cron, pas de bouton publier */}
            {item.slotId && item.distributionStatus === 'scheduled' && (
              <div className="bg-sage/10 rounded-lg p-3 text-center">
                <p className="text-sm text-sage font-medium">Publication automatique le matin</p>
                <p className="text-xs text-gray-400 mt-0.5">Le Hub publie pour toi a 8h</p>
              </div>
            )}
            {/* Hors slot : bouton publier manuellement */}
            {canPublish && !item.slotId && item.distributionStatus !== 'published' && (
              <button onClick={() => setShowPublish(true)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-sage text-white">
                <PaperAirplaneIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Publier sur Instagram</span>
              </button>
            )}
            <button onClick={handleEdit} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <PencilIcon className="w-5 h-5 text-sage" />
              <span className="text-sm font-medium text-gray-900">{(item.videoUrl || item.sourceVideoUrl) ? 'Modifier' : 'Creer le contenu'}</span>
            </button>
            {item.distributionStatus === 'scheduled' && (
              <button onClick={handleUnschedule} className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">{item.slotId ? 'Retirer de cet emplacement' : 'Deprogrammer'}</span>
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
      {showPublish && <PublishSheet isOpen={showPublish} onClose={() => { setShowPublish(false); onClose(); }} item={item} />}
    </>
  );
}
