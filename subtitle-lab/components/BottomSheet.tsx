'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
}

type SnapPoint = 'closed' | 'peek' | 'half' | 'full';

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  closed: 0,
  peek: 48,    // just the handle + tab bar
  half: 55,    // 55% of viewport
  full: 88,    // 88% of viewport
};

export default function BottomSheet({ children }: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>('peek');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentHeight = SNAP_HEIGHTS[snap];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start drag from handle area, not from content scroll
    const target = e.target as HTMLElement;
    if (target.closest('[data-sheet-handle]')) {
      setIsDragging(true);
      dragStartRef.current = {
        y: e.touches[0].clientY,
        height: currentHeight,
      };
    }
  }, [currentHeight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dy = dragStartRef.current.y - e.touches[0].clientY;
    const vh = window.innerHeight;
    const deltaPercent = (dy / vh) * 100;
    setDragOffset(deltaPercent);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const finalHeight = currentHeight + dragOffset;

    // Snap to nearest point
    let bestSnap: SnapPoint = 'peek';
    let bestDist = Infinity;
    for (const [key, val] of Object.entries(SNAP_HEIGHTS)) {
      const dist = Math.abs(finalHeight - val);
      if (dist < bestDist) {
        bestDist = dist;
        bestSnap = key as SnapPoint;
      }
    }
    // If dragged down far enough from peek, close
    if (snap === 'peek' && dragOffset < -20) bestSnap = 'closed';
    
    setSnap(bestSnap);
    setDragOffset(0);
    dragStartRef.current = null;
  }, [isDragging, currentHeight, dragOffset, snap]);

  const toggleSheet = () => {
    if (snap === 'closed' || snap === 'peek') {
      setSnap('half');
    } else {
      setSnap('peek');
    }
  };

  const heightPercent = isDragging
    ? Math.max(0, Math.min(92, currentHeight + dragOffset))
    : currentHeight;

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        height: `${heightPercent}dvh`,
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sheet container */}
      <div className="h-full bg-[#1a1a1a] rounded-t-2xl flex flex-col shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        {/* Drag handle */}
        <div
          data-sheet-handle
          className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing shrink-0"
          onClick={toggleSheet}
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Tab bar — always visible at peek */}
        <button
          data-sheet-handle
          onClick={toggleSheet}
          className="mx-3 mb-1 py-2 flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 active:text-emerald-300 shrink-0"
        >
          <span>{snap === 'half' || snap === 'full' ? '▼ Fermer' : '⚙ Style & Presets'}</span>
        </button>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto min-h-0 overscroll-contain"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
