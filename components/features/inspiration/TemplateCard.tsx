'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getStyleColor, getStyleLabel } from '@/lib/utils/contentStyles';
import type { HookTemplate } from '@/lib/data/templates';

interface Props {
  template: HookTemplate;
}

export default function TemplateCard({ template }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(template.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const color = getStyleColor(template.style);
  const label = getStyleLabel(template.style);

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
      <span
        className="mt-0.5 shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <p className="flex-1 text-sm text-gray-700 leading-snug">{template.text}</p>
      <button
        onClick={handleCopy}
        aria-label="Copier"
        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
      >
        {copied
          ? <CheckIcon className="w-4 h-4 text-sage" />
          : <DocumentDuplicateIcon className="w-4 h-4" />
        }
      </button>
    </div>
  );
}
