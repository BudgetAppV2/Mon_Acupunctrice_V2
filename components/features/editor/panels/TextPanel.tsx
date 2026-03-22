'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { PlusIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import TextEditView from './TextEditView';

export default function TextPanel() {
  const { overlays, selectedOverlayId, addOverlay, selectOverlay, duration } = useEditorStore();
  const selected = overlays.find(o => o.id === selectedOverlayId);

  // Vue édition — un overlay sélectionné
  if (selected) return <TextEditView overlay={selected} />;

  // Narration : 5 blocs vides répartis sur la durée
  const handleNarration = () => {
    if (duration <= 0) return;
    const n = 5;
    const blockDur = Math.round((duration / n) * 10) / 10;
    const store = useEditorStore.getState();
    const newOverlays = Array.from({ length: n }, (_, i) => ({
      id: `txt_${Date.now()}_${i}`,
      text: `Texte ${i + 1}`,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#ffffff',
      x: 0.5,
      y: 0.5,
      startTime: i * blockDur,
      endTime: Math.min((i + 1) * blockDur, duration),
      style: 'classic' as const,
      animation: 'fade' as const,
    }));
    useEditorStore.setState({
      overlays: [...store.overlays, ...newOverlays],
      selectedOverlayId: newOverlays[0].id,
    });
  };

  // Vue liste
  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Textes ({overlays.length})</span>
        <div className="flex items-center gap-2">
          <button onClick={handleNarration} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
            <Bars3BottomLeftIcon className="w-3.5 h-3.5" /> Narration
          </button>
          <button onClick={() => addOverlay()} className="flex items-center gap-1 text-xs bg-sage text-white px-3 py-1 rounded-full">
            <PlusIcon className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </div>
      {overlays.length > 0 ? (
        <div className="space-y-1">
          {[...overlays]
            .sort((a, b) => a.startTime - b.startTime)
            .map(o => (
              <button
                key={o.id}
                onClick={() => selectOverlay(o.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                  o.id === selectedOverlayId ? 'bg-sage/20 border border-sage/40' : 'bg-gray-800'
                }`}
              >
                <span className="text-[10px] text-gray-500 w-10 shrink-0">{o.startTime.toFixed(1)}s</span>
                <span className="text-xs text-gray-300 truncate flex-1">{o.text || '(vide)'}</span>
              </button>
            ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">Aucun texte ajoute</p>
      )}
    </div>
  );
}
