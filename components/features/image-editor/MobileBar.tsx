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
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import BottomSheet from './BottomSheet';
import TemplatesPanel from './panels/TemplatesPanel';
import TextPanel from './panels/TextPanel';
import IconSearchPanel from './panels/IconSearchPanel';
import PhotosPanel from './panels/PhotosPanel';
import ColorPanel from './panels/ColorPanel';
import AnimatePanel from './panels/AnimatePanel';
import LayersPanel from './panels/LayersPanel';

type Tab = 'templates' | 'text' | 'icons' | 'photos' | 'colors' | 'layers' | 'animate';

const TABS: { id: Tab; icon: typeof Squares2X2Icon }[] = [
  { id: 'templates', icon: Squares2X2Icon },
  { id: 'text', icon: DocumentTextIcon },
  { id: 'icons', icon: PuzzlePieceIcon },
  { id: 'photos', icon: PhotoIcon },
  { id: 'colors', icon: SwatchIcon },
  { id: 'layers', icon: ListBulletIcon },
  { id: 'animate', icon: SparklesIcon },
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
      <BottomSheet open={activeTab !== null} onClose={close}>
        {activeTab === 'templates' && <TemplatesPanel canvas={canvas} />}
        {activeTab === 'text' && <TextPanel canvas={canvas} extractedPalette={extractedPalette} />}
        {activeTab === 'icons' && <IconSearchPanel canvas={canvas} />}
        {activeTab === 'photos' && <PhotosPanel canvas={canvas} />}
        {activeTab === 'colors' && <ColorPanel canvas={canvas} />}
        {activeTab === 'layers' && <LayersPanel canvas={canvas} />}
        {activeTab === 'animate' && <AnimatePanel canvas={canvas} selectedType={selectedType} />}
      </BottomSheet>

      {/* Icons-only bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 flex z-30">
        {TABS.map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => toggle(id)}
            className={`flex-1 flex items-center justify-center py-2.5 transition-colors ${
              activeTab === id ? 'text-teal-400' : 'text-white/40'
            }`}>
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </>
  );
}
