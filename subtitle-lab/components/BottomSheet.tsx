'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
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
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <span className="text-sm font-semibold text-white/70">Style & Presets</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 active:bg-white/20"
            >
              <XMarkIcon className="w-4 h-4 text-white/60" />
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
