'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import VideoPreview from './VideoPreview';
import EditorToolbar from './EditorToolbar';
import Timeline from './timeline/Timeline';
import TrimPanel from './panels/TrimPanel';
import FilterPanel from './panels/FilterPanel';
import TextPanel from './panels/TextPanel';
import ExportButton from './ExportButton';
import ImportModal from './ImportModal';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  itemId: string;
}

export default function EditorLayout({ itemId }: Props) {
  const { videoFile, currentTime, duration, setItemId, reset } = useEditorStore();
  const router = useRouter();

  const handleBack = () => {
    reset?.();
    router.push('/calendrier');
  };
  const [activeTab, setActiveTab] = useState('trim');

  useEffect(() => {
    setItemId(itemId);
    return () => { reset(); };
  }, [itemId, setItemId, reset]);

  if (!videoFile) {
    return <ImportModal />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Header — retour + timecode */}
      <header className="h-11 flex items-center justify-between px-4 bg-gray-900/90 shrink-0 z-10">
        <button onClick={handleBack} className="text-white p-1">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-xs text-gray-300 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="w-7" />
      </header>

      {/* Preview vidéo — prend tout l'espace restant */}
      <div className="flex-1 min-h-0">
        <VideoPreview interactive={activeTab === 'texte'} />
      </div>

      {/* Onglets outils */}
      <EditorToolbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Panneau compact — scroll interne, hauteur calculée */}
      <div className={`bg-gray-900 shrink-0 overflow-y-auto ${
        activeTab === 'filtres' ? 'h-[90px]' : 'h-[120px]'
      }`}>
        {activeTab === 'trim' && <TrimPanel />}
        {activeTab === 'filtres' && <FilterPanel />}
        {activeTab === 'texte' && <TextPanel />}
      </div>

      {/* Timeline multi-track */}
      <Timeline />

      {/* CTA export */}
      <ExportButton />
    </div>
  );
}
