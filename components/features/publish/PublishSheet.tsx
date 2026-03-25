'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { usePublish } from '@/lib/hooks/usePublish';
import { useMultiPlatformPublish } from '@/lib/hooks/useMultiPlatformPublish';
import type { ContentItem } from '@/lib/types';
import CaptionEditor from './CaptionEditor';
import SchedulePicker from './SchedulePicker';
import PlatformToggles from './PlatformToggles';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { ArrowLeftIcon, PaperAirplaneIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Props { isOpen: boolean; onClose: () => void; item: ContentItem }

export default function PublishSheet({ isOpen, onClose, item }: Props) {
  const router = useRouter();
  const isSlotItem = !!item.slotId;
  const [step, setStep] = useState<1 | 2>(1);
  const [caption, setCaption] = useState(item.caption || '');
  const [showSchedule, setShowSchedule] = useState(false);
  const [done, setDone] = useState(false);
  const { publish, schedule, publishing, error } = usePublish();
  const uid = useAuthStore((s) => s.user?.uid);
  const { facebookPageId, youtubeChannelId, metaStatus } = useUserProfile();

  // Cover depuis le store editeur (selectionnee dans l'onglet Cover avant l'export)
  const coverDataUrl = useEditorStore((s) => s.coverDataUrl);
  const coverCustomUrl = useEditorStore((s) => s.coverCustomUrl);
  const coverOffset = useEditorStore((s) => s.coverFrameOffset);

  const coverOpt = coverCustomUrl ? 'custom' as const : 'frame' as const;
  const thumbOff = coverCustomUrl ? undefined : coverOffset;

  // Upload la cover frame vers Storage si necessaire
  const uploadCover = async (): Promise<string | undefined> => {
    if (coverCustomUrl) return coverCustomUrl;
    if (!coverDataUrl || !uid) return undefined;
    try {
      const blob = await fetch(coverDataUrl).then(r => r.blob());
      const { ref: sRef, uploadBytes: up, getDownloadURL: dl } = await import('firebase/storage');
      const s = (await import('@/lib/firebase')).getFirebaseStorage();
      await up(sRef(s, `covers/${uid}/${item.id}_frame.jpg`), blob, { contentType: 'image/jpeg' });
      return await dl(sRef(s, `covers/${uid}/${item.id}_frame.jpg`));
    } catch { return undefined; }
  };

  const coverUrl = coverCustomUrl || undefined;
  const {
    handlePublish, fbError, ytError, storyError,
    alsoFacebook, setAlsoFacebook, alsoYoutube, setAlsoYoutube, alsoStory, setAlsoStory,
  } = useMultiPlatformPublish({ item, uid, caption, coverOption: coverOpt, thumbOffset: thumbOff, coverUrl, publish, uploadFrameAsCover: uploadCover, setDone });

  const handleSchedule = async (date: Date) => {
    const finalCoverUrl = await uploadCover();
    if (await schedule(item.id, caption, date, coverOpt, thumbOff, finalCoverUrl)) setDone(true);
  };

  if (done) return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Publication">
      <div className="flex flex-col items-center py-8 gap-3">
        <CheckCircleIcon className="w-12 h-12 text-sage" />
        <p className="text-base font-semibold text-gray-900">
          {isSlotItem ? 'Contenu pret!' : showSchedule ? 'Publication planifiee!' : 'Publie sur Instagram!'}
        </p>
        {isSlotItem && <p className="text-xs text-gray-400">Le Hub publiera automatiquement a 8h</p>}
        {fbError && <p className="text-xs text-red-500">{fbError}</p>}
        {ytError && <p className="text-xs text-red-500">{ytError}</p>}
        {storyError && <p className="text-xs text-red-500">{storyError}</p>}
        <button onClick={() => { onClose(); router.push('/calendrier'); }} className="mt-4 px-6 py-2 bg-sage text-white rounded-xl font-medium">Voir le calendrier</button>
      </div>
    </BottomSheet>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={step === 1 ? 'Caption' : 'Confirmer'}>
      <div className="space-y-4">
        {step === 1 && (
          <>
            <CaptionEditor caption={caption} onChange={setCaption} title={item.title} category={item.category} notes={item.notes} />
            <button onClick={() => setStep(2)} className="w-full py-3 bg-sage text-white rounded-xl font-medium flex items-center justify-center gap-2">
              Continuer <CheckCircleIcon className="w-4 h-4" />
            </button>
          </>
        )}
        {step === 2 && (
          <>
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <PlatformToggles
              facebookPageId={facebookPageId} youtubeChannelId={youtubeChannelId} metaStatus={metaStatus}
              alsoFacebook={alsoFacebook} alsoYoutube={alsoYoutube} alsoStory={alsoStory}
              onToggleFacebook={() => setAlsoFacebook(!alsoFacebook)} onToggleYoutube={() => setAlsoYoutube(!alsoYoutube)} onToggleStory={() => setAlsoStory(!alsoStory)}
            />
            {isSlotItem ? (
              <div className="space-y-2">
                <div className="bg-sage/10 rounded-lg p-3 text-center">
                  <p className="text-sm text-sage font-medium">Publication automatique a 8h</p>
                  <p className="text-xs text-gray-400 mt-0.5">Le Hub publiera sur les plateformes activees</p>
                </div>
                <button onClick={() => setDone(true)} className="w-full py-3 bg-sage text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" /> Confirmer
                </button>
                <button onClick={() => setStep(1)} className="w-full py-2 text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ArrowLeftIcon className="w-3 h-3" /> Modifier la caption
                </button>
              </div>
            ) : showSchedule ? (
              <SchedulePicker onSchedule={handleSchedule} onCancel={() => setShowSchedule(false)} />
            ) : (
              <div className="space-y-2">
                <button onClick={handlePublish} disabled={publishing} className="w-full py-3 bg-sage text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  <PaperAirplaneIcon className="w-5 h-5" /> {publishing ? 'Publication...' : 'Publier maintenant'}
                </button>
                <button onClick={() => setShowSchedule(true)} className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
                  <CalendarIcon className="w-5 h-5" /> Planifier
                </button>
                <button onClick={() => setStep(1)} className="w-full py-2 text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ArrowLeftIcon className="w-3 h-3" /> Modifier la caption
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
