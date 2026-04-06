'use client';

import { useState } from 'react';
import type { Canvas } from 'fabric';
import { Textbox } from 'fabric';
import { PALETTE } from '@/lib/data/imageEditorTemplates';

interface Props {
  canvas: Canvas | null;
  extractedPalette: string[];
}

const TEXT_STYLES = [
  { label: 'Titre', fontFamily: 'Antic Slab', fontSize: 80, fontWeight: '400' },
  { label: 'Sous-titre', fontFamily: 'Mulish', fontSize: 48, fontWeight: '700' },
  { label: 'Corps', fontFamily: 'Mulish', fontSize: 32, fontWeight: '400' },
];

const FONTS = ['Antic Slab', 'Mulish', 'Georgia', 'Arial', 'Times New Roman', 'Courier New'];
const COLORS = Object.entries(PALETTE).filter(([k]) => k !== 'white');

export default function TextPanel({ canvas, extractedPalette }: Props) {
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);

  const addText = (style: (typeof TEXT_STYLES)[number]) => {
    if (!canvas) return;
    const text = new Textbox(style.label, {
      left: 540, top: 960, originX: 'center', originY: 'center',
      fontFamily: selectedFont, fontSize: style.fontSize, fontWeight: style.fontWeight,
      fill: PALETTE.charcoal, textAlign: 'center', width: 800,
      editable: true, selectable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const changeColor = (color: string) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { obj.set('fill', color); canvas.renderAll(); }
  };

  const changeFont = (font: string) => {
    setSelectedFont(font);
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { obj.set('fontFamily', font); canvas.renderAll(); }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Ajouter du texte</h3>
      <div className="space-y-2 mb-4">
        {TEXT_STYLES.map((s) => (
          <button key={s.label} onClick={() => addText(s)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-white/80" style={{ fontFamily: s.fontFamily, fontSize: Math.min(s.fontSize / 4, 18) }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Police</h3>
      <select value={selectedFont} onChange={(e) => changeFont(e.target.value)}
        className="w-full mb-4 px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400">
        {FONTS.map((f) => <option key={f} value={f} className="bg-gray-800">{f}</option>)}
      </select>

      {/* Extracted palette from images (Color Thief) */}
      {extractedPalette.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Palette image</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {extractedPalette.map((color, i) => (
              <button key={i} onClick={() => changeColor(color)}
                className="w-7 h-7 rounded-full border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }} title={color} />
            ))}
          </div>
        </>
      )}

      <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Couleur</h3>
      <div className="flex flex-wrap gap-2">
        {COLORS.map(([name, color]) => (
          <button key={name} onClick={() => changeColor(color)}
            className="w-7 h-7 rounded-full border border-white/20 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }} title={name} />
        ))}
      </div>
    </div>
  );
}
