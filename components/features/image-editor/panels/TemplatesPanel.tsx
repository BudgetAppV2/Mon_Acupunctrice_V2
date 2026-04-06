'use client';

import type { Canvas } from 'fabric';
import { Rect, Ellipse, Textbox, FabricImage } from 'fabric';
import { getTemplateObjects, LOGO_URL, PALETTE } from '@/lib/data/imageEditorTemplates';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

interface Props { canvas: Canvas | null }

export default function TemplatesPanel({ canvas }: Props) {
  const loadFabric = async () => {
    if (!canvas) return;
    canvas.clear();
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

  const loadJudithSvg = async () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#FFFFFF';
    try {
      const img = await FabricImage.fromURL('/images/template-judith.svg', { crossOrigin: 'anonymous' });
      // Scale SVG to fill the canvas exactly
      const sx = CANVAS_W / (img.width ?? CANVAS_W);
      const sy = CANVAS_H / (img.height ?? CANVAS_H);
      img.set({ left: 0, top: 0, scaleX: sx, scaleY: sy, selectable: false, evented: false });
      canvas.add(img);
    } catch { /* SVG load failed */ }
    // Add editable title textbox on top
    canvas.add(new Textbox('TITRE DU BLOGUE', {
      left: CANVAS_W / 2, top: 780, originX: 'center', originY: 'center',
      fontFamily: 'Antic Slab', fontSize: 80, fill: '#212121',
      textAlign: 'center', width: 860, editable: true, selectable: true,
    }));
    canvas.renderAll();
  };

  const loadBlank = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#FFFFFF';
    canvas.renderAll();
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Templates</h3>
      <div className="grid grid-cols-2 gap-2">
        {/* Judith's Canva template */}
        <button onClick={loadJudithSvg}
          className="aspect-[9/16] rounded-lg border border-white/10 hover:border-teal-400 transition-colors overflow-hidden bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/template-judith.svg" alt="Template Judith" className="w-full h-full object-contain" loading="lazy" />
        </button>
        {/* Fabric-built template */}
        <button onClick={loadFabric}
          className="aspect-[9/16] rounded-lg border border-white/10 hover:border-teal-400 transition-colors overflow-hidden flex flex-col items-center justify-center gap-1"
          style={{ background: `linear-gradient(135deg, ${PALETTE.lightMint}, ${PALETTE.turquoise})` }}>
          <span className="text-[9px] font-medium text-gray-700 px-1 text-center leading-tight">La Source en Soi</span>
        </button>
        {/* Blank */}
        <button onClick={loadBlank}
          className="aspect-[9/16] rounded-lg border border-white/10 hover:border-teal-400 transition-colors overflow-hidden flex flex-col items-center justify-center gap-1"
          style={{ background: 'linear-gradient(135deg, #FFFFFF, #E5E7EB)' }}>
          <span className="text-[9px] font-medium text-gray-700 px-1 text-center leading-tight">Vierge</span>
        </button>
      </div>
    </div>
  );
}
