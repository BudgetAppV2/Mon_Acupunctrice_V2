'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownFieldProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownField({ value, onChange, label, placeholder, rows = 8 }: MarkdownFieldProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-[10px] font-medium text-sage bg-sage/10 px-2 py-0.5 rounded"
          >
            {preview ? 'Editer' : 'Apercu'}
          </button>
        </div>
      )}
      {preview ? (
        <div className="prose prose-sm max-w-none bg-white border border-gray-200 rounded-xl p-3 min-h-[120px] text-sm">
          <ReactMarkdown>{value || '*Aucun contenu*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-sage resize-y"
        />
      )}
    </div>
  );
}
