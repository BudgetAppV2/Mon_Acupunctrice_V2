'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useEditorPersistence } from '@/lib/hooks/useEditorPersistence';
import { getFirebaseFirestore } from '@/lib/firebase';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, CloudArrowUpIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';
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
import CoverPanel from './panels/CoverPanel';
import ThemePanel from './panels/ThemePanel';
import LutPanel from './panels/LutPanel';
import ExportButton from './ExportButton';
import ImportModal from './ImportModal';
import PublishSheet from '../publish/PublishSheet';
import { useUndoRedo } from '@/lib/store/useUndoRedo';

const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

interface Props { itemId: string }

export default function EditorLayout({ itemId }: Props) {
  const { videoFile, videoUrl, currentTime, duration, editorSplitRatio, setItemId, reset } = useEditorStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('style');
  const [showPublish, setShowPublish] = useState(false);
  const [publishItem, setPublishItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  // Gate: n'activer la persistance qu'après que le restore Firestore soit terminé
  // pour éviter que les setters intermédiaires (setActiveTheme → setSubtitles) ne
  // déclenchent un debounce qui écraserait les données Firestore avant la fin du restore.
  const [restoreReady, setRestoreReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(typeof window !== 'undefined' ? window.innerHeight - 44 : 600);
  const { saving, saved, saveError } = useEditorPersistence((restoreReady && videoFile) ? itemId : null);

  const handleBack = () => { reset?.(); router.push('/calendrier'); };

  useEffect(() => { const el = containerRef.current; if (!el) return; const obs = new ResizeObserver(([e]) => setContainerH(e.contentRect.height)); obs.observe(el); return () => obs.disconnect(); }, []);
  useEffect(() => { const p = (e: TouchEvent) => { if ((e.target as HTMLElement)?.closest('[data-timeline]')) e.preventDefault(); }; document.addEventListener('touchmove', p, { passive: false }); return () => document.removeEventListener('touchmove', p); }, []);

  useEffect(() => {
    let cancelled = false;
    setItemId(itemId);
    setLoading(true);
    setRestoreReady(false);
    const loadExisting = async () => {
      if (useEditorStore.getState().videoFile) { if (!cancelled) { setRestoreReady(true); setLoading(false); } return; }
      try {
        const db = getFirebaseFirestore();
        const snap = await getDoc(doc(db, 'contentItems', itemId));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          // Prioriser sourceVideoUrl (video source pre-export) sur videoUrl (video exportee)
          const loadUrl = data.sourceVideoUrl || data.videoUrl;
          if (loadUrl && !useEditorStore.getState().videoFile) {
            const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(loadUrl)}`);
            if (cancelled) return;
            const blob = await res.blob();
            const file = new File([blob], 'existing.mp4', { type: 'video/mp4' });
            useEditorStore.getState().loadVideo(file, URL.createObjectURL(file));
          }
          // Restaurer les donnees editables sauvegardees
          console.log('[restore] editorData:', data.editorData ? `subtitles:${data.editorData.subtitles?.length ?? 0} filter:${data.editorData.filter} theme:${data.editorData.activeThemeId}` : 'absent');
          if (data.editorData && !cancelled) {
            const ed = data.editorData;
            const s = useEditorStore.getState();
            // Restaurer les metadonnees du premier clip (trim via les clips serialises)
            // Thème en premier — définit les valeurs par défaut (filter, subtitleStyle)
            if (ed.activeThemeId) s.setActiveTheme(ed.activeThemeId);
            // Puis les valeurs personnalisées écrasent les defaults du thème
            if (ed.clips?.[0]?.trimStart != null) s.setTrim(ed.clips[0].trimStart, ed.clips[0].trimEnd);
            else if (ed.trimStart != null && ed.trimEnd != null) s.setTrim(ed.trimStart, ed.trimEnd);
            if (ed.overlays?.length) s.setOverlays(ed.overlays);
            if (ed.subtitles?.length) s.setSubtitles(ed.subtitles);
            if (ed.subtitleStyle) s.setSubtitleStyle(ed.subtitleStyle);
            if (ed.subtitleFamily) s.setSubtitleFamily(ed.subtitleFamily);
            if (ed.subtitlePosition) s.setSubtitlePosition(ed.subtitlePosition);
            if (ed.subtitleAnimation) s.setSubtitleAnimation(ed.subtitleAnimation);
            if (ed.subtitleAccentColor) s.setSubtitleAccentColor(ed.subtitleAccentColor);
            if (ed.subtitleFontFamily) s.setSubtitleFontFamily(ed.subtitleFontFamily);
            if (ed.subtitleOverrides && Object.keys(ed.subtitleOverrides).length) {
              Object.entries(ed.subtitleOverrides).forEach(([id, ov]) => s.setSubtitleOverride(id, ov as Parameters<typeof s.setSubtitleOverride>[1]));
            }
            if (ed.subtitlePresetId) s.setSubtitlePreset(ed.subtitlePresetId);
            if (ed.filter && ed.filter !== 'normal') s.setFilter(ed.filter);
            if (ed.activeLutId) s.setLut(ed.activeLutId);
            if (ed.audioUrl) s.setAudioTrack(ed.audioUrl, ed.audioName || '');
            if (ed.voiceVolume != null) s.setVoiceVolume(ed.voiceVolume);
            if (ed.audioVolume != null) s.setAudioVolume(ed.audioVolume);
            if (ed.audioFadeIn != null || ed.audioFadeOut != null) s.setAudioFade(ed.audioFadeIn || 0, ed.audioFadeOut || 0);
            if (ed.audioDucking) s.setAudioDucking(true);
            if (ed.coverFrameOffset) s.setCoverFrame(ed.coverFrameOffset, '');
            if (ed.coverCustomUrl) s.setCoverCustom(ed.coverCustomUrl);
          }
        }
      } catch { /* ImportModal s'affichera */ }
      if (!cancelled) { setRestoreReady(true); setLoading(false); }
    };
    loadExisting();
    return () => { cancelled = true; setRestoreReady(false); reset(); };
  }, [itemId, setItemId, reset]);

  const handlePublish = async () => { const db = getFirebaseFirestore(); const snap = await getDoc(doc(db, 'contentItems', itemId)); if (snap.exists()) { setPublishItem({ id: snap.id, ...snap.data() } as ContentItem); setShowPublish(true); } };

  if (loading) return (<div className="fixed inset-0 flex items-center justify-center bg-gray-950"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>);
  if (!videoFile && !videoUrl) return <ImportModal />;
  const previewH = containerH * editorSplitRatio, bottomH = Math.max(containerH * (1 - editorSplitRatio) - 36, 80);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950 overscroll-none" style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
      <header className="flex items-center justify-between px-4 bg-gray-900/90 shrink-0 z-10" style={{ height: 'calc(44px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center gap-1">
          <button onClick={handleBack} className="text-white p-1"><ArrowLeftIcon className="w-5 h-5" /></button>
          <button onClick={useUndoRedo.getState().undo} disabled={!useUndoRedo.getState().canUndo} className="text-white p-1 disabled:opacity-30"><ArrowUturnLeftIcon className="w-4 h-4" /></button>
          <button onClick={useUndoRedo.getState().redo} disabled={!useUndoRedo.getState().canRedo} className="text-white p-1 disabled:opacity-30"><ArrowUturnRightIcon className="w-4 h-4" /></button>
        </div>
        <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5">
          {fmt(currentTime)} / {fmt(duration)}
          {duration > 0 && (() => {
            const fb = getDurationFeedback(Math.floor(duration), 'instagram');
            return fb.ok ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" /> : <ExclamationTriangleIcon className="w-3.5 h-3.5 text-yellow-400" />;
          })()}
          {saving && <CloudArrowUpIcon className="w-3.5 h-3.5 text-gray-500 animate-pulse" />}
          {saved && !saving && <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />}
          {saveError && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" title={saveError ?? ''} />}
        </span>
        <ExportButton onExportDone={handlePublish} onSwitchTab={setActiveTab} />
      </header>

      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-center bg-black overflow-hidden transition-[height] duration-200 ease-out" style={{ height: previewH }}>
          <div className="relative h-full" style={{ aspectRatio: '9/16', maxWidth: '100%' }}>
            <VideoPreview interactive={activeTab === 'texte'} subtitleInteractive={activeTab === 'subs'} />
          </div>
        </div>
        <ResizeDivider containerHeight={containerH} />
        <div className="flex flex-col overflow-hidden transition-[height] duration-200 ease-out" style={{ height: bottomH, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <EditorToolbar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 min-h-0 bg-gray-900 overflow-y-auto">
            {activeTab === 'style' && <ThemePanel />}
            {activeTab === 'trim' && <TrimPanel />}
            {activeTab === 'filtres' && <><FilterPanel /><LutPanel /></>}
            {activeTab === 'texte' && <TextPanel />}
            {activeTab === 'subs' && <SubtitlePanel />}
            {activeTab === 'audio' && <AudioPanel />}
            {activeTab === 'cover' && <CoverPanel />}
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
