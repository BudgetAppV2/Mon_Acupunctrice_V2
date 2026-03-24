'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import type { ContentStyle } from '@/lib/types';
import type { PublishPlatform } from '@/lib/utils/platformOptimization';

interface Props {
  caption: string;
  onChange: (v: string) => void;
  title: string;
  category: string;
  notes?: string;
  contentStyle?: ContentStyle;
}

const PLATFORMS: { id: PublishPlatform; label: string }[] = [
  { id: 'instagram', label: 'IG' },
  { id: 'facebook', label: 'FB' },
  { id: 'youtube', label: 'YT' },
];

/** Textarea + bouton IA avec selecteur de plateforme (v2) et fallback v1 */
export default function CaptionEditor({ caption, onChange, title, category, notes, contentStyle }: Props) {
  const [generating, setGenerating] = useState(false);
  const [platform, setPlatform] = useState<PublishPlatform>('instagram');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Tentative v2 : plateforme + style de contenu
      const res = await fetch('/api/generate-caption-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, notes, platform, contentStyle }),
      });
      if (!res.ok) throw new Error('v2 failed');
      const data = await res.json();
      if (data.caption) { onChange(data.caption); return; }
      throw new Error('no caption');
    } catch {
      // Fallback vers v1 si v2 echoue
      try {
        const res = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, notes }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.caption) onChange(data.caption);
      } catch {
        // Garder la caption existante si les deux APIs echouent
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selecteur de plateforme */}
      <div className="flex gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              platform === p.id
                ? 'bg-sage text-white border-sage'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-2 border border-sage/30 bg-sage/5 rounded-lg text-sm text-sage font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <SparklesIcon className="w-4 h-4" />
        {generating ? 'Generation...' : 'Generer avec l\'IA'}
      </button>

      <textarea
        value={caption}
        onChange={e => onChange(e.target.value)}
        rows={6}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 resize-none"
        placeholder="Ta caption..."
      />
      <p className="text-[10px] text-gray-400">{caption.length} caracteres</p>
    </div>
  );
}
