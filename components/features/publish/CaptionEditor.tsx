'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Props {
  caption: string;
  onChange: (v: string) => void;
  title: string;
  category: string;
  notes?: string;
}

/** Textarea + bouton de generation IA pour la caption Instagram */
export default function CaptionEditor({ caption, onChange, title, category, notes }: Props) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
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
      // Garder la caption existante si la generation echoue
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
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
        placeholder="Ta caption Instagram..."
      />
      <p className="text-[10px] text-gray-400">{caption.length} caracteres</p>
    </div>
  );
}
