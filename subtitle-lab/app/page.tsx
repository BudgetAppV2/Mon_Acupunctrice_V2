'use client';

import dynamic from 'next/dynamic';

const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });

export default function Page() {
  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-[10px] text-white/30 ml-1">prototype</span>
      </header>

      {/* MOBILE: vertical stack — preview sticky, controls scroll */}
      {/* DESKTOP: side-by-side */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left column: Canvas + Timeline (sticky on mobile) */}
        <div className="shrink-0 lg:flex-1 lg:flex lg:flex-col">
          {/* Canvas wrapper — compact on mobile */}
          <div className="flex items-center justify-center p-3 lg:flex-1 lg:p-4">
            <SubtitleCanvas />
          </div>
          <Timeline />
        </div>

        {/* Right column: Controls (scrollable) */}
        <div className="flex-1 lg:w-80 lg:flex-none border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto min-h-0">
          <PresetGallery />
          <ControlPanel />
        </div>
      </div>
    </main>
  );
}
