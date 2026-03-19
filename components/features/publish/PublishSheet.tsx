'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { usePublish } from '@/lib/hooks/usePublish';
import type { ContentItem } from '@/lib/types';
import CoverPicker from './CoverPicker';
import CaptionEditor from './CaptionEditor';
import SchedulePicker from './SchedulePicker';
import { ArrowRightIcon, ArrowLeftIcon, PaperAirplaneIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
}

type CoverSelection = { type: 'frame'; offset: number } | { type: 'custom'; url: string };

export default function PublishSheet({ isOpen, onClose, item }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cover, setCover] = useState<CoverSelection>({ type: 'frame', offset: 0 });
  const [caption, setCaption] = useState(item.caption || '');
  const [showSchedule, setShowSchedule] = useState(false);
  const [done, setDone] = useState(false);
  const { publish, schedule, publishing, error } = usePublish();

  const coverOpt = cover.type;
  const thumbOff = cover.type === 'frame' ? cover.offset : undefined;
  const coverUrl = cover.type === 'custom' ? cover.url : undefined;

  const handlePublish = async () => {
    if (!item.videoUrl) return;
    const ok = await publish({ videoUrl: item.videoUrl, caption, itemId: item.id, coverOption: coverOpt, thumbOffset: thumbOff, coverUrl });
    if (ok) setDone(true);
  };

  const handleSchedule = async (date: Date) => {
    const ok = await schedule(item.id, caption, date, coverOpt, thumbOff, coverUrl);
    if (ok) setDone(true);
  };

  // Ecran de succes
  if (done) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Publication">
        <div className="flex flex-col items-center py-8 gap-3">
          <CheckCircleIcon className="w-12 h-12 text-sage" />
          <p className="text-base font-semibold text-gray-900">
            {showSchedule ? 'Publication planifiee!' : 'Publie sur Instagram!'}
          </p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-sage text-white rounded-xl font-medium">Fermer</button>
        </div>
      </BottomSheet>
    );
  }

  const titles: Record<number, string> = { 1: 'Image de couverture', 2: 'Caption', 3: 'Confirmer' };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={titles[step]}>
      <div className="space-y-4">
        {step === 1 && (
          <>
            <CoverPicker videoUrl={item.videoUrl!} value={cover} onChange={setCover} />
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
            {showSchedule ? (
              <SchedulePicker onSchedule={handleSchedule} onCancel={() => setShowSchedule(false)} />
            ) : (
              <div className="space-y-2">
                <button onClick={handlePublish} disabled={publishing} className="w-full py-3 bg-sage text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {publishing ? 'Publication...' : 'Publier maintenant'}
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
