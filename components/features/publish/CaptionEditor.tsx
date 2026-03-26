'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import type { ContentStyle } from '@/lib/types';

type Platform = 'instagram' | 'facebook' | 'youtube';
type Captions = { instagram: string; facebook: string; youtube: string };

const TABS: { id: Platform; label: string; maxChars: number }[] = [
  { id: 'instagram', label: 'IG', maxChars: 2200 },
  { id: 'facebook', label: 'FB', maxChars: 5000 },
  { id: 'youtube', label: 'YT', maxChars: 5000 },
];

interface Props {
  captions: Captions | null;
  onCaptionsChange: (c: Captions) => void;
  title: string;
  category: string;
  notes?: string;
  contentStyle?: ContentStyle;
  transcript?: string;
}

export default function CaptionEditor({ captions, onCaptionsChange, title, category, notes, contentStyle, transcript }: Props) {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<Platform>('instagram');
  const current = captions?.[activeTab] || '';
  const tab = TABS.find(t => t.id === activeTab)!;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, title, category, contentStyle, notes }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.instagram && data.facebook && data.youtube) {
        onCaptionsChange(data);
        return;
      }
      throw new Error('format invalide');
    } catch {
      // Fallback : generer une seule caption via l'ancienne route
      try {
        const res = await fetch('/api/generate-caption-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, notes, platform: 'instagram', contentStyle }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.caption) onCaptionsChange({ instagram: d.caption, facebook: d.caption, youtube: d.caption });
        }
      } catch { /* garder les captions existantes */ }
    } finally { setGenerating(false); }
  };

  const handleChange = (text: string) => {
    const updated = { ...(captions || { instagram: '', facebook: '', youtube: '' }), [activeTab]: text };
    onCaptionsChange(updated);
  };

  return (
    <div className="space-y-2">
      {/* Tabs IG/FB/YT */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === t.id ? 'bg-sage text-white border-sage' : 'bg-white text-gray-600 border-gray-200'
            }`}>{t.label}</button>
        ))}
      </div>

      <button onClick={handleGenerate} disabled={generating}
        className="w-full py-2 border border-sage/30 bg-sage/5 rounded-lg text-sm text-sage font-medium flex items-center justify-center gap-2 disabled:opacity-50">
        <SparklesIcon className="w-4 h-4" />
        {generating ? 'Generation...' : transcript ? 'Generer (transcription)' : 'Generer avec l\'IA'}
      </button>

      <textarea value={current} onChange={e => handleChange(e.target.value)} rows={6}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 resize-none"
        placeholder={`Caption ${tab.label}...`} />

      <div className="flex justify-between">
        <p className="text-[10px] text-gray-400">{current.length} / {tab.maxChars}</p>
        {transcript && <span className="text-[10px] text-sage">Transcription disponible</span>}
      </div>
    </div>
  );
}
