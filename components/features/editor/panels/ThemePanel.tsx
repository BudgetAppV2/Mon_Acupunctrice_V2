'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { VIDEO_THEMES, getThemePalette } from '@/lib/data/videoThemes';
import { loadFont } from '@/lib/utils/fontLoader';
import TemplatePicker from './TemplatePicker';
import TemplateCustomizer from './TemplateCustomizer';

export default function ThemePanel() {
  const { activeThemeId, setActiveTheme } = useEditorStore();

  useEffect(() => {
    VIDEO_THEMES.forEach(t => { loadFont(t.fontTitle); loadFont(t.fontSubtitle); });
  }, []);

  const handleSelect = (themeId: string) => {
    const theme = VIDEO_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    loadFont(theme.fontTitle);
    loadFont(theme.fontSubtitle);
    setActiveTheme(themeId);
  };

  return (
    <div className="px-3 py-2 space-y-3">
      <span className="text-xs text-gray-400">Themes</span>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {VIDEO_THEMES.map(theme => {
          const palette = getThemePalette(theme);
          const isActive = activeThemeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 p-2 rounded-lg transition ${
                isActive ? 'bg-sage/20 ring-1 ring-sage' : 'bg-gray-800'
              }`}
              style={{ width: 80 }}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.accent }} />
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.text }} />
                <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: palette.stroke }} />
              </div>
              <span className="text-[10px] text-gray-300 truncate w-full text-center"
                style={{ fontFamily: `"${theme.fontTitle}", sans-serif` }}>
                {theme.fontTitle.split(' ')[0]}
              </span>
              <span className={`text-[9px] font-medium truncate w-full text-center ${isActive ? 'text-sage' : 'text-gray-500'}`}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
      <TemplatePicker />
      <TemplateCustomizer />
    </div>
  );
}
