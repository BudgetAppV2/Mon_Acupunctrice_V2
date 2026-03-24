'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { CONTENT_STYLES, getStyleColor } from '@/lib/utils/contentStyles';
import { TEMPLATES } from '@/lib/data/templates';
import TemplateList from '@/components/features/inspiration/TemplateList';
import type { ContentStyle } from '@/lib/types';

type FilterValue = ContentStyle | 'all';

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Tous' },
  ...CONTENT_STYLES.map(s => ({ value: s.value, label: s.label })),
];

function InspirationContent() {
  const searchParams = useSearchParams();
  const styleParam = searchParams.get('style') as ContentStyle | null;
  const [selected, setSelected] = useState<FilterValue>(
    styleParam && CONTENT_STYLES.some(s => s.value === styleParam) ? styleParam : 'all'
  );

  // Sync if the URL param changes (e.g. navigation from FillSlotSheet)
  useEffect(() => {
    if (styleParam && CONTENT_STYLES.some(s => s.value === styleParam)) {
      setSelected(styleParam);
    }
  }, [styleParam]);

  return (
    <div className="min-h-screen bg-sand pb-6">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-sage" />
        <h1 className="text-xl font-bold text-gray-800">Inspiration</h1>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(tab => {
          const active = selected === tab.value;
          const color = tab.value === 'all' ? undefined : getStyleColor(tab.value as ContentStyle);
          return (
            <button
              key={tab.value}
              onClick={() => setSelected(tab.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
              style={active ? { backgroundColor: color ?? '#6B7280' } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Template list */}
      <TemplateList templates={TEMPLATES} selectedStyle={selected} />
    </div>
  );
}

export default function InspirationPage() {
  return (
    <Suspense>
      <InspirationContent />
    </Suspense>
  );
}
