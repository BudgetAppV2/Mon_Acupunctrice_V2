'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp, deleteField, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import { useDeleteContentItem } from '@/lib/hooks/useDeleteContentItem';
import type { ContentItem } from '@/lib/types';
import { PencilIcon, TrashIcon, XCircleIcon, CalendarIcon, ArrowTopRightOnSquareIcon, VideoCameraSlashIcon } from '@heroicons/react/24/outline';

interface Props {
  item: ContentItem;
  onClose: () => void;
}

export default function IdeaActions({ item, onClose }: Props) {
  const router = useRouter();
  const { updateItem } = useUpdateContentItem();
  const { deleteItem } = useDeleteContentItem();
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('18:00');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ws = item.workflowState;
  const ds = item.distributionStatus;

  const goEditor = () => { router.push(`/editeur-v2/${item.id}`); onClose(); };
  const goCalendar = () => { router.push('/calendrier'); onClose(); };
  const goStats = () => { router.push('/profil'); onClose(); };

  const handleSchedule = () => {
    if (!schedDate) return;
    const d = new Date(`${schedDate}T${schedTime}`);
    if (d > new Date()) {
      updateItem(item.id, { distributionStatus: 'scheduled', scheduledAt: Timestamp.fromDate(d) });
      onClose();
    }
  };

  const handleDelete = async () => {
    await deleteItem(item.id);
    onClose();
  };

  const handleUnschedule = async () => {
    // Remettre le slot a open si lie
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
      workflowState: item.videoUrl ? 'ready' : 'idea',
      scheduledAt: null,
      slotId: null,
    });
  };

  // Bouton principal selon l'etat
  const hasVideo = !!(item.videoUrl || item.sourceVideoUrl);
  let primaryLabel = '';
  let primaryAction = goEditor;
  if (!hasVideo) { primaryLabel = 'Creer le contenu'; }
  else if (ws === 'shot') { primaryLabel = 'Monter la video'; }
  else if (ws === 'editing') { primaryLabel = 'Continuer le montage'; }
  else if (ws === 'ready' && ds === 'draft') { primaryLabel = 'Planifier la publication'; primaryAction = () => setShowSchedule(true); }
  else if (ws === 'ready' && ds === 'scheduled') { primaryLabel = 'Voir le calendrier'; primaryAction = goCalendar; }
  else if (ws === 'ready' && ds === 'published') { primaryLabel = 'Voir le profil'; primaryAction = goStats; }
  else { primaryLabel = 'Ouvrir l\'editeur'; }

  return (
    <div className="space-y-2 border-t border-gray-100 pt-3">
      {/* Planification inline */}
      {showSchedule && (
        <div className="flex gap-2 mb-2">
          <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={handleSchedule} disabled={!schedDate} className="px-3 py-1.5 bg-sage text-white text-sm rounded-lg disabled:opacity-50">
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Principal */}
      <button onClick={primaryAction} className="w-full py-2.5 bg-sage text-white rounded-lg text-sm font-medium">
        {primaryLabel}
      </button>

      {/* Secondaires */}
      <div className="flex flex-wrap gap-2">
        {(item.videoUrl || item.sourceVideoUrl) && ds !== 'published' && (
          <button onClick={goEditor} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700">
            <PencilIcon className="w-3.5 h-3.5" /> Editeur
          </button>
        )}
        {item.videoUrl && ds !== 'published' && (
          <button
            onClick={() => updateItem(item.id, {
              videoUrl: null, thumbnailUrl: null, coverImageUrl: null,
              workflowState: 'idea', exportedAt: null, editorTouchedAt: null,
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 rounded-lg text-xs text-orange-600"
          >
            <VideoCameraSlashIcon className="w-3.5 h-3.5" /> Retirer la video
          </button>
        )}
        {ds === 'scheduled' && (
          <button onClick={handleUnschedule} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700">
            <XCircleIcon className="w-3.5 h-3.5" /> Deprogrammer
          </button>
        )}
        {ds === 'published' && item.instagramPostId && (
          <a href={`https://www.instagram.com/reel/${item.instagramPostId}/`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700">
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> Instagram
          </a>
        )}
        {confirmDelete ? (
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 bg-red-50 rounded-lg text-xs text-red-600 font-medium">
            <TrashIcon className="w-3.5 h-3.5" /> Confirmer
          </button>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-500">
            <TrashIcon className="w-3.5 h-3.5" /> Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
