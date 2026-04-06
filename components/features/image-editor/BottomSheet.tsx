'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const [mini, setMini] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMini(false);
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    startYRef.current = e.clientY;
    currentYRef.current = 0;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startYRef.current;
      if (dy > 0) { currentYRef.current = dy; sheet.style.transform = `translateY(${dy}px)`; }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      sheet.style.transform = '';
      if (currentYRef.current > 100) { setMini(true); }
      else if (currentYRef.current > 40 && mini) onClose();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [onClose, mini]);

  const toggleMini = () => setMini((m) => !m);

  return (
    <>
      {open && !mini && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-800 rounded-t-2xl transition-transform duration-300 ease-out ${
          open ? (mini ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0') : 'translate-y-full'
        }`}
        style={{ height: '40dvh' }}
      >
        <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onDragStart} onDoubleClick={toggleMini}>
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="overflow-y-auto overscroll-contain px-3 pb-4" style={{ height: 'calc(40dvh - 24px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
