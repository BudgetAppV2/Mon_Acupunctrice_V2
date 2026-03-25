'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { usePublish } from '@/lib/hooks/usePublish';
import { useMultiPlatformPublish } from '@/lib/hooks/useMultiPlatformPublish';
import type { ContentItem } from '@/lib/types';
import CoverPicker from './CoverPicker';
import CaptionEditor from './CaptionEditor';
import SchedulePicker from './SchedulePicker';
import PlatformToggles from './PlatformToggles';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { ArrowRightIcon, ArrowLeftIcon, PaperAirplaneIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Props { isOpen: boolean; onClose: () => void; item: ContentItem }
type CoverSelection = { type: 'frame'; offset: number } | { type: 'custom'; url: string };

export default function PublishSheet({ isOpen, onClose, item }: Props) {
  const router = useRouter();
  const isSlotItem = !!item.slotId;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cover, setCover] = useState<CoverSelection>({ type: 'frame', offset: 0 });
  const [caption, setCaption] = useState(item.caption || '');
  const [showSchedule, setShowSchedule] = useState(false);
  const [done, setDone] = useState(false);
  const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null);
  const { publish, schedule, publishing, error } = usePublish();
  const uid = useAuthStore((s) => s.user?.uid);
  const { facebookPageId, youtubeChannelId, metaStatus } = useUserProfile();
  const editorThumb = useEditorStore((s) => s.thumbnailUrl);

  const coverOpt = cover.type, thumbOff = cover.type === 'frame' ? cover.offset : undefined, coverUrl = cover.type === 'custom' ? cover.url : undefined;

  const uploadFrameAsCover = async (): Promise<string | undefined> => {
    if (cover.type !== 'frame' || !frameDataUrl || !uid) return undefined;
    try {
      const blob = await fetch(frameDataUrl).then(r => r.blob());
      const { ref: sRef, uploadBytes: up, getDownloadURL: dl } = await import('firebase/storage');
      const s = (await import('@/lib/firebase')).getFirebaseStorage();
      await up(sRef(s, `covers/${uid}/${item.id}_frame.jpg`), blob, { contentType: 'image/jpeg' });
      return await dl(sRef(s, `covers/${uid}/${item.id}_frame.jpg`));
    } catch { return undefined; }
  };

  const {
    handlePublish, fbError, ytError, storyError,
    alsoFacebook, setAlsoFacebook, alsoYoutube, setAlsoYoutube, alsoStory, setAlsoStory,
  } = useMultiPlatformPublish({ item, uid, caption, coverOption: coverOpt, thumbOffset: thumbOff, coverUrl, publish, uploadFrameAsCover, setDone });

  const handleSchedule = async (date: Date) => {
    const finalCoverUrl = coverUrl || await uploadFrameAsCover();
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
        <button onClick={() => { onClose(); if (isSlotItem) router.push('/calendrier'); }} className="mt-4 px-6 py-2 bg-sage text-white rounded-xl font-medium">
          {isSlotItem ? 'Voir le calendrier' : 'Fermer'}
        </button>
      </div>
    </BottomSheet>
  );

  const titles: Record<number, string> = { 1: 'Image de couverture', 2: 'Caption', 3: 'Confirmer' };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={titles[step]}>
      <div className="space-y-4">
        {step === 1 && (
          <>
            <CoverPicker videoUrl={item.videoUrl!} value={cover} onChange={setCover} fallbackThumbnail={editorThumb ?? undefined} onFrameCapture={setFrameDataUrl} />
            <button onClick={() => setStep(2)} className="w-full py-3 bg-sage text-white rounded-xl font-medium flex items-center justify-center gap-2">
              Continuer <ArrowRightIcon className="w-4 h-4" />
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <CaptionEditor caption={caption} onChange={setCaption} title={item.title} category={item.category} notes={item.notes} />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 flex items-center justify-center gap-1">
                <ArrowLeftIcon className="w-4 h-4" /> Retour
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-sage text-white rounded-xl font-medium flex items-center justify-center gap-2">
                Continuer <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <PlatformToggles
              facebookPageId={facebookPageId} youtubeChannelId={youtubeChannelId} metaStatus={metaStatus}
              alsoFacebook={alsoFacebook} alsoYoutube={alsoYoutube} alsoStory={alsoStory}
              onToggleFacebook={() => setAlsoFacebook(!alsoFacebook)} onToggleYoutube={() => setAlsoYoutube(!alsoYoutube)} onToggleStory={() => setAlsoStory(!alsoStory)}
            />
            {isSlotItem ? (
              /* Slot : pas de publish/schedule, juste sauvegarder */
              <div className="space-y-2">
                <div className="bg-sage/10 rounded-lg p-3 text-center">
                  <p className="text-sm text-sage font-medium">Publication automatique a 8h</p>
                  <p className="text-xs text-gray-400 mt-0.5">Le Hub publiera sur les plateformes activees</p>
                </div>
                <button onClick={() => setDone(true)} className="w-full py-3 bg-sage text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" /> Confirmer
                </button>
                <button onClick={() => setStep(2)} className="w-full py-2 text-xs text-gray-400 flex items-center justify-center gap-1">
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
                <button onClick={() => setStep(2)} className="w-full py-2 text-xs text-gray-400 flex items-center justify-center gap-1">
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
