'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import type { TextStylePreset, TextAnimation } from '@/lib/types';
import FontSelector from '../text/FontSelector';
import StyleSelector from '../text/StyleSelector';
import AnimationSelector from '../text/AnimationSelector';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TextPanel() {
  const { overlays, selectedOverlayId, addOverlay, updateOverlay, removeOverlay, selectOverlay, duration } = useEditorStore();
  const selected = overlays.find(o => o.id === selectedOverlayId);

  // Vue liste — aucun overlay sélectionné
  if (!selected) {
    return (
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Textes ({overlays.length})</span>
          <button onClick={() => addOverlay()} className="flex items-center gap-1 text-xs bg-sage text-white px-3 py-1 rounded-full">
            <PlusIcon className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {overlays.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {overlays.map(o => (
              <button key={o.id} onClick={() => selectOverlay(o.id)} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 truncate max-w-[120px]">
                {o.text}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-2">Aucun texte ajouté</p>
        )}
      </div>
    );
  }

  // Vue édition — un overlay sélectionné
  const update = (changes: Partial<typeof selected>) => updateOverlay(selected.id, changes);

  return (
    <div className="px-3 py-2 space-y-2 max-h-52 overflow-y-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => selectOverlay(null)} className="flex items-center gap-1 text-xs text-gray-400">
          <ArrowLeftIcon className="w-3 h-3" /> Retour
        </button>
        <button onClick={() => removeOverlay(selected.id)} className="flex items-center gap-1 text-xs text-red-400">
          <TrashIcon className="w-3 h-3" /> Supprimer
        </button>
      </div>

      <input
        value={selected.text}
        onChange={e => update({ text: e.target.value })}
        className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5"
        placeholder="Ton texte..."
      />

      <FontSelector value={selected.fontFamily} onChange={v => update({ fontFamily: v })} />

      <div>
        <label className="text-xs text-gray-500">Taille : {selected.fontSize}px</label>
        <input type="range" min={12} max={72} value={selected.fontSize} onChange={e => update({ fontSize: +e.target.value })} className="w-full accent-sage" />
      </div>

      <StyleSelector value={selected.style} onChange={(id, props) => update({ style: id as TextStylePreset, ...props })} />
      <AnimationSelector value={selected.animation} onChange={v => update({ animation: v as TextAnimation })} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Début : {selected.startTime.toFixed(1)}s</label>
          <input type="range" min={0} max={duration} step={0.1} value={selected.startTime} onChange={e => update({ startTime: +e.target.value })} className="w-full accent-sage" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Fin : {selected.endTime.toFixed(1)}s</label>
          <input type="range" min={0} max={duration} step={0.1} value={selected.endTime} onChange={e => update({ endTime: +e.target.value })} className="w-full accent-sage" />
        </div>
      </div>
    </div>
  );
}
