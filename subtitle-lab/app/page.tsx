'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PlayIcon, PauseIcon, BackwardIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useSubtitleStore } from '../lib/store';

const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false });

function Toolbar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { isPlaying, setIsPlaying, setCurrentTime } = useSubtitleStore();

  return (
    <div className="flex items-center justify-between px-3 py-2 shrink-0">
      {/* Left: transport */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentTime(0)}
          className="p-2 rounded-full active:bg-white/10"
        >
          <BackwardIcon className="w-5 h-5 text-white/50" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-full bg-emerald-500 active:bg-emerald-600"
        >
          {isPlaying
            ? <PauseIcon className="w-5 h-5 text-white" />
            : <PlayIcon className="w-5 h-5 text-white" />
          }
        </button>
      </div>

      {/* Right: settings (mobile only) */}
      <button
        onClick={onOpenSettings}
        className="p-2 rounded-full active:bg-white/10 lg:hidden"
      >
        <Cog6ToothIcon className="w-5 h-5 text-white/50" />
      </button>
    </div>
  );
}

export default function Page() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-[10px] text-white/30 ml-1">prototype</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left: toolbar + canvas + timeline */}
        <div className="flex-1 flex flex-col min-h-0 lg:flex-1">
          <Toolbar onOpenSettings={() => setSettingsOpen(true)} />
          <div className="flex-1 flex items-center justify-center px-3 lg:px-4">
            <SubtitleCanvas />
          </div>
          <Timeline />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:w-80 border-l border-white/10 overflow-y-auto">
          <PresetGallery />
          <ControlPanel />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <PresetGallery />
        <ControlPanel />
      </BottomSheet>
    </main>
  );
}
