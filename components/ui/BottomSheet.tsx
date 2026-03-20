'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: Props) {
  // Bloquer le scroll du body quand le sheet est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-8" />
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1" aria-label="Fermer">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-4" style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
