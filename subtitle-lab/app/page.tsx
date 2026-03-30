'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PlayIcon, PauseIcon, BackwardIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useSubtitleStore } from '../lib/store';

const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });
const FilterPanel = dynamic(() => import('../components/FilterPanel'), { ssr: false });
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false });

type SheetId = 'sub' | 'filter' | null;

// Subtitle icon — inline SVG (Heroicons doesn't have a subtitle icon)
function SubtitleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm2 2v8h14V6H3zm2 5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 11zm.75-3.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd"/>
    </svg>
  );
}

function Toolbar({ activeSheet, onToggleSheet }: { activeSheet: SheetId; onToggleSheet: (id: SheetId) => void }) {
  const { isPlaying, setIsPlaying, setCurrentTime } = useSubtitleStore();
  return (
    <div className="flex items-center justify-between px-3 py-2 shrink-0">
      {/* Transport */}
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentTime(0)} className="p-2 rounded-full active:bg-white/10">
          <BackwardIcon className="w-5 h-5 text-white/50" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-emerald-500 active:bg-emerald-600">
          {isPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <PlayIcon className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Tool icons — mobile only */}
      <div className="flex items-center gap-0.5 lg:hidden">
        <ToolButton icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />} label="Filtres"
          active={activeSheet === 'filter'} onClick={() => onToggleSheet('filter')} />
        <ToolButton icon={<SubtitleIcon className="w-5 h-5" />} label="Sous-titres"
          active={activeSheet === 'sub'} onClick={() => onToggleSheet('sub')} />
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition ${active ? 'bg-emerald-500/15' : 'active:bg-white/10'}`}>
      <span className={active ? 'text-emerald-400' : 'text-white/50'}>{icon}</span>
      <span className={`text-[8px] font-medium ${active ? 'text-emerald-400' : 'text-white/30'}`}>{label}</span>
    </button>
  );
}

export default function Page() {
  const [activeSheet, setActiveSheet] = useState<SheetId>(null);

  const toggleSheet = (id: SheetId) => {
    setActiveSheet(prev => prev === id ? null : id);
  };

  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      <header className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-[10px] text-white/30 ml-1">prototype</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 lg:flex-1">
          <Toolbar activeSheet={activeSheet} onToggleSheet={toggleSheet} />
          <div className="flex-1 flex items-center justify-center px-3 lg:px-4">
            <SubtitleCanvas />
          </div>
          <div className="hidden lg:block"><Timeline /></div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:w-80 border-l border-white/10 overflow-y-auto">
          <PresetGallery />
          <ControlPanel />
          <FilterPanel />
        </div>
      </div>

      {/* Mobile: Subtitle sheet */}
      <BottomSheet isOpen={activeSheet === 'sub'} onClose={() => setActiveSheet(null)}>
        <div className="sticky top-0 z-10 bg-[#1a1a1a]"><Timeline /></div>
        <PresetGallery />
        <ControlPanel />
      </BottomSheet>

      {/* Mobile: Filter sheet */}
      <BottomSheet isOpen={activeSheet === 'filter'} onClose={() => setActiveSheet(null)}>
        <FilterPanel />
      </BottomSheet>
    </main>
  );
}
