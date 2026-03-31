'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PlayIcon, PauseIcon, BackwardIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon, FilmIcon, QueueListIcon, MusicalNoteIcon,
  FolderOpenIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useSubtitleStore } from '../lib/store';

const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const MiniScrubber = dynamic(() => import('../components/MiniScrubber'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });
const FilterPanel = dynamic(() => import('../components/FilterPanel'), { ssr: false });
const TracksPanel = dynamic(() => import('../components/TracksPanel'), { ssr: false });
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false });
const AudioSheet = dynamic(() => import('../components/AudioSheet'), { ssr: false });
const TranscribeButton = dynamic(() => import('../components/TranscribeButton'), { ssr: false });
const CameraOverlay = dynamic(() => import('../components/CameraOverlay'), { ssr: false });

type SheetId = 'sub' | 'filter' | 'tracks' | 'audio' | null;

function SubtitleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm2 2v8h14V6H3zm2 5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 11zm.75-3.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd"/>
    </svg>
  );
}

function Toolbar({ activeSheet, onToggleSheet, onOpenCamera }: {
  activeSheet: SheetId; onToggleSheet: (id: SheetId) => void; onOpenCamera: () => void;
}) {
  const { isPlaying, setIsPlaying, setCurrentTime, setVideo, videoUrl } = useSubtitleStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);

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
      <div className="flex items-center gap-0.5 lg:hidden relative">
        {/* A5: Import menu (File or Camera) */}
        <div className="relative">
          <ToolButton icon={<FilmIcon className="w-5 h-5" />} label={videoUrl ? 'Video' : 'Import'}
            active={showImportMenu} onClick={() => setShowImportMenu(!showImportMenu)} />
          {showImportMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
              <button onClick={() => { fileRef.current?.click(); }}
                className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10 w-full">
                <FolderOpenIcon className="w-4 h-4" /> Fichier
              </button>
              <button onClick={() => { setShowImportMenu(false); onOpenCamera(); }}
                className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10 w-full border-t border-white/5">
                <VideoCameraIcon className="w-4 h-4" /> Camera
              </button>
            </div>
          )}
        </div>
        <ToolButton icon={<QueueListIcon className="w-5 h-5" />} label="Tracks" active={activeSheet === 'tracks'} onClick={() => onToggleSheet('tracks')} />
        <ToolButton icon={<MusicalNoteIcon className="w-5 h-5" />} label="Audio" active={activeSheet === 'audio'} onClick={() => onToggleSheet('audio')} />
        <ToolButton icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />} label="Filtres" active={activeSheet === 'filter'} onClick={() => onToggleSheet('filter')} />
        <ToolButton icon={<SubtitleIcon className="w-5 h-5" />} label="Sous-titres" active={activeSheet === 'sub'} onClick={() => onToggleSheet('sub')} />
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition ${active ? 'bg-emerald-500/15' : 'active:bg-white/10'}`}>
      <span className={active ? 'text-emerald-400' : 'text-white/50'}>{icon}</span>
      <span className={`text-[8px] font-medium ${active ? 'text-emerald-400' : 'text-white/30'}`}>{label}</span>
    </button>
  );
}

export default function Page() {
  const [activeSheet, setActiveSheet] = useState<SheetId>(null);
  const [showCamera, setShowCamera] = useState(false);
  const toggleSheet = (id: SheetId) => setActiveSheet(prev => prev === id ? null : id);

  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      <header className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-[10px] text-white/30 ml-1">prototype</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 lg:flex-1">
          <Toolbar activeSheet={activeSheet} onToggleSheet={toggleSheet} onOpenCamera={() => setShowCamera(true)} />
          <div className="flex-1 flex items-center justify-center px-3 lg:px-4">
            <SubtitleCanvas />
          </div>
          <MiniScrubber />
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

      {/* A5: Camera overlay */}
      {showCamera && <CameraOverlay onClose={() => setShowCamera(false)} />}
    </main>
  );
}
