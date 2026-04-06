'use client';

import { useState } from 'react';
import type { Canvas } from 'fabric';
import {
  Squares2X2Icon,
  DocumentTextIcon,
  SparklesIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import TemplatesPanel from './panels/TemplatesPanel';
import TextPanel from './panels/TextPanel';
import ElementsPanel from './panels/ElementsPanel';
import PhotosPanel from './panels/PhotosPanel';

type Tab = 'templates' | 'text' | 'elements' | 'photos';

const TABS: { id: Tab; icon: typeof Squares2X2Icon; label: string }[] = [
  { id: 'templates', icon: Squares2X2Icon, label: 'Templates' },
  { id: 'text', icon: DocumentTextIcon, label: 'Texte' },
  { id: 'elements', icon: SparklesIcon, label: 'Elements' },
  { id: 'photos', icon: PhotoIcon, label: 'Photos' },
];

interface Props {
  canvas: Canvas | null;
}

export default function Sidebar({ canvas }: Props) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  return (
    <div className="flex shrink-0">
      {/* Tab icons */}
      <div className="flex flex-col bg-gray-800 border-r border-white/10 w-16">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(activeTab === id ? null : id)}
            className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] transition-colors ${
              activeTab === id ? 'text-teal-400 bg-gray-700' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
      {/* Active panel */}
      {activeTab && (
        <div className="w-64 bg-gray-800 border-r border-white/10 overflow-y-auto p-3">
          {activeTab === 'templates' && <TemplatesPanel canvas={canvas} />}
          {activeTab === 'text' && <TextPanel canvas={canvas} />}
          {activeTab === 'elements' && <ElementsPanel canvas={canvas} />}
          {activeTab === 'photos' && <PhotosPanel canvas={canvas} />}
        </div>
      )}
    </div>
  );
}
