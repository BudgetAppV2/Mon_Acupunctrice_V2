'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '@/lib/types';
import VideoPreview from './VideoPreview';
import EditorToolbar from './EditorToolbar';
import Timeline from './timeline/Timeline';
import TrimPanel from './panels/TrimPanel';
import FilterPanel from './panels/FilterPanel';
import TextPanel from './panels/TextPanel';
import SubtitlePanel from './panels/SubtitlePanel';
import AudioPanel from './panels/AudioPanel';
import ExportButton from './ExportButton';
import ImportModal from './ImportModal';
import PublishSheet from '../publish/PublishSheet';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

interface Props { itemId: string }

export default function EditorLayout({ itemId }: Props) {
  const { videoFile, currentTime, duration, setItemId, reset } = useEditorStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trim');
  const [showPublish, setShowPublish] = useState(false);
  const [publishItem, setPublishItem] = useState<ContentItem | null>(null);

  const handleBack = () => { reset?.(); router.push('/calendrier'); };

  useEffect(() => {
    setItemId(itemId);
    return () => { reset(); };
  }, [itemId, setItemId, reset]);

  // Ouvrir le flux de publication apres export
  const handlePublish = async () => {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, 'contentItems', itemId));
    if (snap.exists()) {
      setPublishItem({ id: snap.id, ...snap.data() } as ContentItem);
      setShowPublish(true);
    }
  };

  if (!videoFile) return <ImportModal />;

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950">
      {/* Header */}
      <header className="h-11 flex items-center justify-between px-4 bg-gray-900/90 shrink-0 z-10 relative">
        <button onClick={handleBack} className="text-white p-1">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-xs text-gray-300 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <ExportButton onExportDone={handlePublish} />
      </header>

      <div className="flex-1 min-h-0">
        <VideoPreview interactive={activeTab === 'texte'} />
      </div>

      <div className="shrink-0 flex flex-col" style={{ maxHeight: '55vh' }}>
        <EditorToolbar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className={`bg-gray-900 overflow-y-auto ${
          activeTab === 'filtres' ? 'h-[90px]' : activeTab === 'subs' || activeTab === 'audio' ? 'h-[120px]' : 'h-[100px]'
        }`}>
          {activeTab === 'trim' && <TrimPanel />}
          {activeTab === 'filtres' && <FilterPanel />}
          {activeTab === 'texte' && <TextPanel />}
          {activeTab === 'subs' && <SubtitlePanel />}
          {activeTab === 'audio' && <AudioPanel />}
        </div>
        <Timeline />
      </div>

      {/* Flux publication — 3 etapes (couverture, caption, publier/planifier) */}
      {showPublish && publishItem && (
        <PublishSheet isOpen={showPublish} onClose={() => setShowPublish(false)} item={publishItem} />
      )}
    </div>
  );
}
