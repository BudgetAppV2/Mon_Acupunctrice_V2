'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getDurationFeedback } from '@/lib/utils/platformOptimization';
import type { ContentItem } from '@/lib/types';
import VideoPreview from './VideoPreview';
import EditorToolbar from './EditorToolbar';
import ResizeDivider from './ResizeDivider';
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
  const { videoFile, videoUrl, currentTime, duration, editorSplitRatio, setItemId, reset } = useEditorStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trim');
  const [showPublish, setShowPublish] = useState(false);
  const [publishItem, setPublishItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(typeof window !== 'undefined' ? window.innerHeight - 44 : 600);

  const handleBack = () => { reset?.(); router.push('/calendrier'); };

  // Mesurer la hauteur disponible (entre header et safe-area)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerH(e.contentRect.height));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setItemId(itemId);
    setLoading(true);
    const loadExisting = async () => {
      if (useEditorStore.getState().videoFile) { if (!cancelled) setLoading(false); return; }
      try {
        const db = getFirebaseFirestore();
        const snap = await getDoc(doc(db, 'contentItems', itemId));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          if (data.videoUrl && !useEditorStore.getState().videoFile) {
            const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(data.videoUrl)}`);
            if (cancelled) return;
            const blob = await res.blob();
            const file = new File([blob], 'existing.mp4', { type: 'video/mp4' });
            useEditorStore.getState().loadVideo(file, URL.createObjectURL(file));
          }
        }
      } catch { /* ImportModal s'affichera */ }
      if (!cancelled) setLoading(false);
    };
    loadExisting();
    return () => { cancelled = true; reset(); };
  }, [itemId, setItemId, reset]);

  const handlePublish = async () => {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, 'contentItems', itemId));
    if (snap.exists()) { setPublishItem({ id: snap.id, ...snap.data() } as ContentItem); setShowPublish(true); }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!videoFile && !videoUrl) return <ImportModal />;

  const previewH = containerH * editorSplitRatio;
  const bottomH = Math.max(containerH * (1 - editorSplitRatio) - 36, 80);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 bg-gray-900/90 shrink-0 z-10" style={{ height: 'calc(44px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button onClick={handleBack} className="text-white p-1"><ArrowLeftIcon className="w-5 h-5" /></button>
        <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5">
          {formatTime(currentTime)} / {formatTime(duration)}
          {duration > 0 && (() => {
            const fb = getDurationFeedback(Math.floor(duration), 'instagram');
            return fb.ok ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" /> : <ExclamationTriangleIcon className="w-3.5 h-3.5 text-yellow-400" />;
          })()}
        </span>
        <ExportButton onExportDone={handlePublish} />
      </header>

      {/* Zone redimensionnable */}
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col">
        {/* Preview */}
        <div className="flex items-center justify-center bg-black overflow-hidden transition-[height] duration-200 ease-out" style={{ height: previewH }}>
          <div className="relative h-full" style={{ aspectRatio: '9/16', maxWidth: '100%' }}>
            <VideoPreview interactive={activeTab === 'texte'} />
          </div>
        </div>

        {/* Divider */}
        <ResizeDivider containerHeight={containerH} />

        {/* Zone bottom */}
        <div className="flex flex-col overflow-hidden transition-[height] duration-200 ease-out" style={{ height: bottomH, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <EditorToolbar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 min-h-0 bg-gray-900 overflow-y-auto">
            {activeTab === 'trim' && <TrimPanel />}
            {activeTab === 'filtres' && <FilterPanel />}
            {activeTab === 'texte' && <TextPanel />}
            {activeTab === 'subs' && <SubtitlePanel />}
            {activeTab === 'audio' && <AudioPanel />}
          </div>
          <Timeline />
        </div>
      </div>

      {showPublish && publishItem && (
        <PublishSheet isOpen={showPublish} onClose={() => setShowPublish(false)} item={publishItem} />
      )}
    </div>
  );
}
