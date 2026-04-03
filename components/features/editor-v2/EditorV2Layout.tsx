'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PlayIcon, PauseIcon, BackwardIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon, FilmIcon, QueueListIcon, MusicalNoteIcon,
  FolderOpenIcon, VideoCameraIcon, ChatBubbleBottomCenterTextIcon, PhotoIcon,
  CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { useEditorV2Persistence } from '@/lib/hooks/useEditorV2Persistence';
import { useEditorV2Upload } from '@/lib/hooks/useEditorV2Upload';
import { getDoc, doc } from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '@/lib/firebase';
import type { ContentItem } from '@/lib/types';
import ExportButtonV2 from './ExportButtonV2';
import PublishSheet from '../publish/PublishSheet';

const SubtitleCanvas = dynamic(() => import('./SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('./ControlPanel'), { ssr: false });
const MiniScrubber = dynamic(() => import('./MiniScrubber'), { ssr: false });
const PresetGallery = dynamic(() => import('./PresetGallery'), { ssr: false });
const FilterPanel = dynamic(() => import('./FilterPanel'), { ssr: false });
const TracksPanel = dynamic(() => import('./TracksPanel'), { ssr: false });
const BottomSheet = dynamic(() => import('./BottomSheet'), { ssr: false });
const AudioSheet = dynamic(() => import('./AudioSheet'), { ssr: false });
const TranscribeButton = dynamic(() => import('./TranscribeButton'), { ssr: false });
const CameraOverlay = dynamic(() => import('./CameraOverlay'), { ssr: false });
const TextPanel = dynamic(() => import('./TextPanel'), { ssr: false });
const CoverPanel = dynamic(() => import('./CoverPanel'), { ssr: false });

type SheetId = 'sub' | 'filter' | 'tracks' | 'audio' | 'text' | 'cover' | null;

const SubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm2 2v8h14V6H3zm2 5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 11zm.75-3.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd"/>
  </svg>
);

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
};

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition ${active ? 'bg-emerald-500/15' : 'active:bg-white/10'}`}>
      <span className={active ? 'text-emerald-400' : 'text-white/50'}>{icon}</span>
      <span className={`text-[8px] font-medium ${active ? 'text-emerald-400' : 'text-white/30'}`}>{label}</span>
    </button>
  );
}

function Toolbar({ activeSheet, onToggleSheet, onOpenCamera }: {
  activeSheet: SheetId; onToggleSheet: (id: SheetId) => void; onOpenCamera: () => void;
}) {
  const { isPlaying, setIsPlaying, setCurrentTime, setVideo, videoUrl } = useEditorV2Store();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  useEffect(() => { setShowImportMenu(false); }, [activeSheet]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setVideo(f);
    setShowImportMenu(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 shrink-0">
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentTime(0)} className="p-2 rounded-full active:bg-white/10">
          <BackwardIcon className="w-5 h-5 text-white/50" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-emerald-500 active:bg-emerald-600">
          {isPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <PlayIcon className="w-5 h-5 text-white" />}
        </button>
      </div>
      <div className="flex items-center gap-1 lg:hidden relative">
        <div className="relative">
          <ToolButton icon={<FilmIcon className="w-5 h-5" />} label={videoUrl ? 'Video' : 'Import'}
            active={showImportMenu} onClick={() => setShowImportMenu(!showImportMenu)} />
          {showImportMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
              <button onClick={() => { fileRef.current?.click(); }} className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10 w-full">
                <FolderOpenIcon className="w-4 h-4" /> Fichier
              </button>
              <button onClick={() => { setShowImportMenu(false); onOpenCamera(); }} className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10 w-full border-t border-white/5">
                <VideoCameraIcon className="w-4 h-4" /> Camera
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 bg-black/30 backdrop-blur-md rounded-full px-1 py-0.5">
          <ToolButton icon={<QueueListIcon className="w-5 h-5" />} label="Tracks" active={activeSheet === 'tracks'} onClick={() => onToggleSheet('tracks')} />
          <ToolButton icon={<MusicalNoteIcon className="w-5 h-5" />} label="Audio" active={activeSheet === 'audio'} onClick={() => onToggleSheet('audio')} />
          <ToolButton icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />} label="Filtres" active={activeSheet === 'filter'} onClick={() => onToggleSheet('filter')} />
          <ToolButton icon={<SubIcon className="w-5 h-5" />} label="Subs" active={activeSheet === 'sub'} onClick={() => onToggleSheet('sub')} />
          <ToolButton icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />} label="Texte" active={activeSheet === 'text'} onClick={() => onToggleSheet('text')} />
          <ToolButton icon={<PhotoIcon className="w-5 h-5" />} label="Cover" active={activeSheet === 'cover'} onClick={() => onToggleSheet('cover')} />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

interface Props { itemId: string }

export default function EditorV2Layout({ itemId }: Props) {
  const [activeSheet, setActiveSheet] = useState<SheetId>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [publishItem, setPublishItem] = useState<ContentItem | null>(null);
  const router = useRouter();
  const { currentTime, duration, videoFile } = useEditorV2Store();
  const { saving, saved } = useEditorV2Persistence(videoFile ? itemId : null);
  useEditorV2Upload(videoFile ? itemId : null);
  const toggleSheet = (id: SheetId) => setActiveSheet(prev => prev === id ? null : id);

  useEffect(() => {
    let cancelled = false;
    useEditorV2Store.getState().setItemId(itemId);
    setLoading(true);

    const loadExisting = async () => {
      // Skip if a video is already loaded (user navigated back and forth)
      if (useEditorV2Store.getState().videoFile) { if (!cancelled) setLoading(false); return; }
      try {
        const auth = getFirebaseAuth();
        console.log('[EDITOR_V2_LOAD] uid:', auth.currentUser?.uid, 'itemId:', itemId);
        const db = getFirebaseFirestore();
        const snap = await getDoc(doc(db, 'contentItems', itemId));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          // Restore V2 editor state
          if (data.editorDataV2 && !cancelled) {
            useEditorV2Store.getState().loadFromFirestore(data.editorDataV2);
          }
          // Re-download video clips from sourceVideoUrl
          const store = useEditorV2Store.getState();
          const videoClips = store.tracks
            .filter(t => t.type === 'video')
            .flatMap(t => t.clips ?? [])
            .filter(c => c.sourceVideoUrl && !c.file);
          // If no clips have sourceVideoUrl, try top-level fallback
          if (videoClips.length === 0) {
            const loadUrl = data.sourceVideoUrl || data.videoUrl;
            if (loadUrl && !store.videoFile) {
              const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(loadUrl)}`);
              if (cancelled) return;
              const blob = await res.blob();
              const file = new File([blob], 'existing.mp4', { type: 'video/mp4' });
              useEditorV2Store.getState().setVideo(file);
            }
          } else {
            // Re-download each clip's source video
            for (const c of videoClips) {
              if (cancelled) return;
              try {
                const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(c.sourceVideoUrl!)}`);
                if (cancelled) return;
                const blob = await res.blob();
                const file = new File([blob], `clip_${c.id}.mp4`, { type: 'video/mp4' });
                const blobUrl = URL.createObjectURL(file);
                // Hydrate the clip with file + blobUrl in place (don't use setVideo — clip already exists)
                useEditorV2Store.setState((s) => ({
                  tracks: s.tracks.map(t => {
                    if (t.type !== 'video' || !t.clips) return t;
                    return { ...t, clips: t.clips.map(cl => cl.id === c.id ? { ...cl, file, blobUrl } : cl) };
                  }),
                  videoFile: file, videoUrl: blobUrl,
                }));
              } catch { /* skip failed clip download */ }
            }
          }
          // Re-download audio clips from audioUrl
          const audioClips = useEditorV2Store.getState().tracks
            .filter(t => t.type === 'audio')
            .flatMap(t => t.audioClips ?? [])
            .filter(a => a.audioUrl && !a.file);
          for (const a of audioClips) {
            if (cancelled) return;
            try {
              const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(a.audioUrl!)}`);
              if (cancelled) return;
              const blob = await res.blob();
              const file = new File([blob], a.name || 'audio.mp3', { type: 'audio/mpeg' });
              const blobUrl = URL.createObjectURL(file);
              useEditorV2Store.setState((s) => ({
                tracks: s.tracks.map(t => {
                  if (t.type !== 'audio' || !t.audioClips) return t;
                  return { ...t, audioClips: t.audioClips.map(ac => ac.id === a.id ? { ...ac, file, blobUrl } : ac) };
                }),
              }));
            } catch { /* skip failed audio download */ }
          }
        }
      } catch (e) { console.error('[EDITOR_V2_LOAD] Error:', e); }
      if (!cancelled) setLoading(false);
    };
    loadExisting();
    return () => { cancelled = true; useEditorV2Store.getState().reset(); };
  }, [itemId]);

  const handleBack = () => {
    useEditorV2Store.getState().reset();
    router.push('/calendrier');
  };

  const handleExportDone = async () => {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, 'contentItems', itemId));
    if (snap.exists()) {
      setPublishItem({ id: snap.id, ...snap.data() } as ContentItem);
      setShowPublish(true);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Hub header */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button onClick={handleBack} className="text-white p-1">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5">
          {fmt(currentTime)} / {fmt(duration)}
          {saving && <CloudArrowUpIcon className="w-3.5 h-3.5 text-gray-500 animate-pulse" />}
          {saved && !saving && <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />}
        </span>
        <ExportButtonV2 onExportDone={handleExportDone} />
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 lg:flex-1">
          <div className="relative z-[45]">
            <Toolbar activeSheet={activeSheet} onToggleSheet={toggleSheet} onOpenCamera={() => setShowCamera(true)} />
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-0 lg:px-4">
            <SubtitleCanvas />
          </div>
          <div className="hidden lg:block"><MiniScrubber /></div>
          <div className="hidden lg:block"><TracksPanel /></div>
        </div>
        <div className="hidden lg:block lg:w-80 border-l border-white/10 overflow-y-auto">
          <TranscribeButton />
          <PresetGallery />
          <ControlPanel />
          <FilterPanel />
          <AudioSheet />
        </div>
      </div>

      {/* MiniScrubber fixed above sheets on mobile */}
      <div className="fixed left-0 right-0 z-[55] transition-all duration-300 lg:hidden"
        style={{ bottom: activeSheet ? '40dvh' : 0 }}>
        <MiniScrubber />
      </div>

      <BottomSheet isOpen={activeSheet === 'tracks'} onClose={() => setActiveSheet(null)}>
        <TracksPanel />
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === 'sub'} onClose={() => setActiveSheet(null)}>
        <TranscribeButton />
        <PresetGallery />
        <ControlPanel />
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === 'filter'} onClose={() => setActiveSheet(null)}>
        <FilterPanel />
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === 'audio'} onClose={() => setActiveSheet(null)}>
        <AudioSheet />
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === 'text'} onClose={() => setActiveSheet(null)}>
        <TextPanel />
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === 'cover'} onClose={() => setActiveSheet(null)}>
        <CoverPanel />
      </BottomSheet>

      {showCamera && <CameraOverlay onClose={() => setShowCamera(false)} />}

      {showPublish && publishItem && (
        <PublishSheet isOpen={showPublish} onClose={() => setShowPublish(false)} item={publishItem} />
      )}
    </main>
  );
}
