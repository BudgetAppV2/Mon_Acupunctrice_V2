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
      {/* Backdrop — very subtle to keep preview visible */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel — compact 35% height */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ height: '40dvh' }}
      >
        <div className="h-full bg-[#1a1a1a]/95 backdrop-blur-sm rounded-t-2xl flex flex-col
                        shadow-[0_-2px_20px_rgba(0,0,0,0.4)] border-t border-white/5">
          {/* Compact header */}
          <div className="flex items-center justify-between px-4 py-1.5 shrink-0">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Style</span>
            <button onClick={onClose} className="p-1 rounded-full active:bg-white/10">
              <XMarkIcon className="w-4 h-4 text-white/40" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain pb-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
