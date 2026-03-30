'use client';

import dynamic from 'next/dynamic';

const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false });

export default function Page() {
  return (
    <main className="h-[100dvh] bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-[10px] text-white/30 ml-1">prototype</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Canvas + Timeline — takes full space on mobile */}
        <div className="flex-1 flex flex-col min-h-0 lg:flex-1">
          <div className="flex-1 flex items-center justify-center p-3 lg:p-4">
            <SubtitleCanvas />
          </div>
          <Timeline />
        </div>

        {/* DESKTOP: sidebar (hidden on mobile) */}
        <div className="hidden lg:block lg:w-80 border-l border-white/10 overflow-y-auto">
          <PresetGallery />
          <ControlPanel />
        </div>
      </div>

      {/* MOBILE: bottom sheet (hidden on desktop) */}
      <BottomSheet>
        <PresetGallery />
        <ControlPanel />
      </BottomSheet>
    </main>
  );
}
