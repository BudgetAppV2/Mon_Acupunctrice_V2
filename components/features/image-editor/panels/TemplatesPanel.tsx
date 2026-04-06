'use client';

import type { Canvas } from 'fabric';
import { Rect, Ellipse, Textbox, FabricImage } from 'fabric';
import { getTemplateObjects, LOGO_URL, PALETTE } from '@/lib/data/imageEditorTemplates';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

interface Props { canvas: Canvas | null }

const TEMPLATES = [
  { id: 'source', name: 'La Source en Soi', bg: PALETTE.lightMint, accent: PALETTE.turquoise },
  { id: 'blank', name: 'Vierge', bg: '#FFFFFF', accent: '#E5E7EB' },
];

export default function TemplatesPanel({ canvas }: Props) {
  const load = async (id: string) => {
    if (!canvas) return;
    canvas.clear();

    if (id === 'blank') {
      canvas.backgroundColor = '#FFFFFF';
      canvas.renderAll();
      return;
    }

    canvas.backgroundColor = PALETTE.lightMint;
    for (const obj of getTemplateObjects()) {
      const { type, text, ...opts } = obj;
      let fo;
      if (type === 'rect') fo = new Rect(opts);
      else if (type === 'ellipse') fo = new Ellipse(opts);
      else if (type === 'textbox') fo = new Textbox((text as string) ?? '', opts);
      if (fo) canvas.add(fo);
    }

    try {
      const img = await FabricImage.fromURL(LOGO_URL, { crossOrigin: 'anonymous' });
      img.scaleToWidth(220);
      img.set({ left: CANVAS_W - 280, top: CANVAS_H - 280, selectable: true, evented: true });
      canvas.add(img);
    } catch { /* logo unavailable */ }

    canvas.renderAll();
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Templates</h3>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => load(t.id)}
            className="aspect-[9/16] rounded-lg border border-white/10 hover:border-teal-400 transition-colors overflow-hidden flex flex-col items-center justify-center gap-1"
            style={{ background: `linear-gradient(135deg, ${t.bg}, ${t.accent})` }}
          >
            <span className="text-[9px] font-medium text-gray-700 px-1 text-center leading-tight">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
