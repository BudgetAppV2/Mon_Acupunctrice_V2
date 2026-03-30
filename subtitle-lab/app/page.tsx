'use client';

import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with canvas/requestAnimationFrame
const SubtitleCanvas = dynamic(() => import('../components/SubtitleCanvas'), { ssr: false });
const ControlPanel = dynamic(() => import('../components/ControlPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const PresetGallery = dynamic(() => import('../components/PresetGallery'), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-medium text-white/80 tracking-wide">Subtitle Lab</span>
        <span className="text-xs text-white/30 ml-1">prototype</span>
      </header>

      {/* Main layout: canvas + panel side by side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Canvas + Timeline */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
            <SubtitleCanvas />
          </div>
          <Timeline />
        </div>

        {/* Right: Controls */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto">
          <PresetGallery />
          <ControlPanel />
        </div>
      </div>
    </main>
  );
}
