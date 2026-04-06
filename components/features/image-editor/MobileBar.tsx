'use client';

import { useState } from 'react';
import type { Canvas } from 'fabric';
import {
  Squares2X2Icon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import BottomSheet from './BottomSheet';
import TemplatesPanel from './panels/TemplatesPanel';
import TextPanel from './panels/TextPanel';
import IconSearchPanel from './panels/IconSearchPanel';
import PhotosPanel from './panels/PhotosPanel';
import ColorPanel from './panels/ColorPanel';
import AnimatePanel from './panels/AnimatePanel';

type Tab = 'templates' | 'text' | 'icons' | 'photos' | 'colors' | 'animate';

const TABS: { id: Tab; icon: typeof Squares2X2Icon; label: string }[] = [
  { id: 'templates', icon: Squares2X2Icon, label: 'Templates' },
  { id: 'text', icon: DocumentTextIcon, label: 'Texte' },
  { id: 'icons', icon: PuzzlePieceIcon, label: 'Icones' },
  { id: 'photos', icon: PhotoIcon, label: 'Photos' },
  { id: 'colors', icon: SwatchIcon, label: 'Couleurs' },
  { id: 'animate', icon: SparklesIcon, label: 'Animer' },
];

interface Props {
  canvas: Canvas | null;
  selectedType: string | null;
  extractedPalette: string[];
}

export default function MobileBar({ canvas, selectedType, extractedPalette }: Props) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const toggle = (id: Tab) => setActiveTab(activeTab === id ? null : id);
  const close = () => setActiveTab(null);

  return (
    <>
      {/* Bottom sheet with active panel */}
      <BottomSheet open={activeTab !== null} onClose={close}>
        {activeTab === 'templates' && <TemplatesPanel canvas={canvas} />}
        {activeTab === 'text' && <TextPanel canvas={canvas} extractedPalette={extractedPalette} />}
        {activeTab === 'icons' && <IconSearchPanel canvas={canvas} />}
        {activeTab === 'photos' && <PhotosPanel canvas={canvas} />}
        {activeTab === 'colors' && <ColorPanel canvas={canvas} />}
        {activeTab === 'animate' && <AnimatePanel canvas={canvas} selectedType={selectedType} />}
      </BottomSheet>

      {/* Fixed bottom tab bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 flex z-30 safe-area-pb">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => toggle(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] transition-colors ${
              activeTab === id ? 'text-teal-400' : 'text-white/40'
            }`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
