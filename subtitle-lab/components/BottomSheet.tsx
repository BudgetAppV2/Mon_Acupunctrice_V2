'use client';

import { useState } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
}

export default function BottomSheet({ children }: BottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle button — always visible at bottom */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden
                     bg-emerald-500 active:bg-emerald-600 text-white
                     rounded-full px-5 py-3 text-sm font-semibold
                     shadow-lg shadow-emerald-500/30"
        >
          ⚙ Style & Presets
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet panel */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '70dvh' }}
      >
        <div className="bg-[#1a1a1a] rounded-t-2xl flex flex-col shadow-[0_-4px_30px_rgba(0,0,0,0.5)]"
             style={{ maxHeight: '70dvh' }}>

          {/* Header with close */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 py-3 shrink-0
                       border-b border-white/10"
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mb-1" />
          </button>
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <span className="text-sm font-semibold text-white/60">Style & Presets</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-400 active:text-emerald-300 font-medium py-1 px-2"
            >
              Fermer ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain pb-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
