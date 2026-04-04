'use client';

import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { PRESETS } from '@/lib/editor-v2/presets';

export default function PresetGallery() {
  const { globalPreset, selectedBlockId, blocks, setGlobalPreset, updateBlock } = useEditorV2Store();

  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  const handlePresetClick = (preset: typeof PRESETS[number]) => {
    if (selectedBlockId) {
      // Apply all style fields as overrides + store the preset id for active indicator
      const { id, name, position, ...styleOverrides } = preset;
      updateBlock(selectedBlockId, { ...styleOverrides, id: preset.id } as Record<string, unknown>);
    } else {
      setGlobalPreset(preset);
    }
  };

  return (
    <div className="px-3 py-2 border-b border-white/10">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
        {selectedBlock ? 'Preset du bloc' : 'Presets'}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {PRESETS.map((preset) => {
          // When a block is selected, check its overrides for the active preset
          const isActive = selectedBlock
            ? ((selectedBlock.overrides as Record<string, unknown>)?.id === preset.id
              || (!(selectedBlock.overrides as Record<string, unknown>)?.id && globalPreset.id === preset.id))
            : globalPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap
                ${isActive
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 text-white/50 active:border-white/30 active:text-white/80'
                }
              `}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
