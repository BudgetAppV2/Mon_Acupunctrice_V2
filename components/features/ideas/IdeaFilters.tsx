'use client';

import { useState } from 'react';
import type { WorkflowState, ContentStyle } from '@/lib/types';
import { WORKFLOW_LABELS } from '@/lib/types';
import { FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import FilterSheet from './FilterSheet';

const STATUS_OPTIONS = Object.entries(WORKFLOW_LABELS).map(([v, l]) => ({ value: v, label: l }));

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'enseigner', label: 'Enseigner' },
  { value: 'connecter', label: 'Connecter' },
  { value: 'aider', label: 'Aider' },
  { value: 'inspirer', label: 'Inspirer' },
];

interface Props {
  selectedStatus?: WorkflowState;
  selectedStyle?: ContentStyle;
  onStatusChange: (status?: WorkflowState) => void;
  onStyleChange: (style?: ContentStyle) => void;
}

export default function IdeaFilters({ selectedStatus, selectedStyle, onStatusChange, onStyleChange }: Props) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  const statusLabel = selectedStatus ? WORKFLOW_LABELS[selectedStatus] : 'Tous statuts';
  const styleLabel = selectedStyle ? STYLE_OPTIONS.find(s => s.value === selectedStyle)?.label : 'Tous styles';

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setStatusOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
            selectedStatus ? 'bg-sage/10 text-sage' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          {selectedStatus && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
          {statusLabel}
        </button>
        <button
          onClick={() => setStyleOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
            selectedStyle ? 'bg-sage/10 text-sage' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          {selectedStyle && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
          {styleLabel}
        </button>
      </div>

      <FilterSheet isOpen={statusOpen} onClose={() => setStatusOpen(false)} title="Statut"
        options={STATUS_OPTIONS} selected={selectedStatus}
        onSelect={(v) => onStatusChange(v as WorkflowState | undefined)} />
      <FilterSheet isOpen={styleOpen} onClose={() => setStyleOpen(false)} title="Style"
        options={STYLE_OPTIONS} selected={selectedStyle}
        onSelect={(v) => onStyleChange(v as ContentStyle | undefined)} />
    </>
  );
}
