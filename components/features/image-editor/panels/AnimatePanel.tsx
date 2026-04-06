'use client';

import { useRef, useEffect } from 'react';
import type { Canvas, FabricObject } from 'fabric';
import {
  TEXT_PRESETS,
  GENERAL_PRESETS,
  CONTINUOUS_PRESETS,
  type AnimPreset,
} from '@/lib/image-editor/animationPresets';
import { previewSingleObject, type PlaybackHandle } from '@/lib/image-editor/animationEngine';

interface Props {
  canvas: Canvas | null;
  selectedType: string | null;
}

function getAnimationId(obj: FabricObject | undefined): string | undefined {
  if (!obj) return undefined;
  const data = (obj as unknown as Record<string, unknown>).data as Record<string, unknown> | undefined;
  return data?.animationId as string | undefined;
}

export default function AnimatePanel({ canvas, selectedType }: Props) {
  const active = canvas?.getActiveObject();
  const currentAnimId = getAnimationId(active);
  const isText = selectedType === 'textbox' || selectedType === 'i-text';
  const previewRef = useRef<PlaybackHandle | null>(null);

  // Stop any running preview when panel unmounts or selection changes
  useEffect(() => {
    return () => { previewRef.current?.stop(); previewRef.current = null; };
  }, [active]);

  const assign = (preset: AnimPreset) => {
    if (!canvas || !active) return;
    // Stop previous preview
    previewRef.current?.stop();
    previewRef.current = null;

    // Assign animation ID
    const existing = ((active as unknown as Record<string, unknown>).data as Record<string, unknown>) ?? {};
    (active as unknown as Record<string, unknown>).data = { ...existing, animationId: preset.id };
    canvas.renderAll();

    // Immediately preview this animation on the selected object
    previewRef.current = previewSingleObject(canvas, active, preset.id);
  };

  const remove = () => {
    if (!canvas || !active) return;
    previewRef.current?.stop();
    previewRef.current = null;
    const existing = ((active as unknown as Record<string, unknown>).data as Record<string, unknown>) ?? {};
    delete existing.animationId;
    (active as unknown as Record<string, unknown>).data = { ...existing };
    canvas.renderAll();
  };

  if (!active) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Animer</h3>
        <p className="text-xs text-white/40">Selectionnez un element sur le canvas pour lui assigner une animation.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Animer</h3>

      {currentAnimId && (
        <button onClick={remove}
          className="w-full mb-3 px-2 py-1.5 text-[10px] text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors">
          Supprimer l&apos;animation
        </button>
      )}

      {isText && <Section title="Textes" presets={TEXT_PRESETS} currentId={currentAnimId} onPick={assign} />}
      <Section title="General" presets={GENERAL_PRESETS} currentId={currentAnimId} onPick={assign} />
      <Section title="Effets continus" presets={CONTINUOUS_PRESETS} currentId={currentAnimId} onPick={assign} />
    </div>
  );
}

function Section({ title, presets, currentId, onPick }: {
  title: string; presets: AnimPreset[]; currentId: string | undefined; onPick: (p: AnimPreset) => void;
}) {
  return (
    <div className="mb-4">
      <h4 className="text-[10px] font-semibold text-white/50 uppercase mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button key={p.id} onClick={() => onPick(p)}
            className={`px-2 py-1.5 rounded-lg text-[10px] text-left transition-colors ${
              currentId === p.id ? 'bg-teal-500/30 text-teal-300 ring-1 ring-teal-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
