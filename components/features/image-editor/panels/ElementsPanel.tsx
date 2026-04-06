'use client';

import type { Canvas } from 'fabric';
import { Circle, Rect, Triangle, Line, Path } from 'fabric';
import { ELEMENTS, type EditorElement } from '@/lib/data/imageEditorElements';
import { PALETTE } from '@/lib/data/imageEditorTemplates';

interface Props { canvas: Canvas | null }

export default function ElementsPanel({ canvas }: Props) {
  const addElement = (el: EditorElement) => {
    if (!canvas) return;
    const base = { left: 440, top: 840, selectable: true, evented: true };
    let obj;

    switch (el.fabricType) {
      case 'circle':
        obj = new Circle({ ...base, radius: 80, fill: PALETTE.turquoise });
        break;
      case 'rect':
        obj = new Rect({ ...base, width: 200, height: 160, fill: PALETTE.turquoise });
        break;
      case 'triangle':
        obj = new Triangle({ ...base, width: 180, height: 160, fill: PALETTE.turquoise });
        break;
      case 'line':
        obj = new Line([0, 0, 300, 0], { ...base, stroke: PALETTE.charcoal, strokeWidth: 4 });
        break;
      case 'path':
        obj = new Path(el.pathData!, {
          ...base,
          fill: PALETTE.turquoise,
          scaleX: 2, scaleY: 2,
          ...(el.props || {}),
        });
        break;
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const categories = [...new Set(ELEMENTS.map((e) => e.category))];

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} className="mb-4">
          <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">{cat}</h3>
          <div className="grid grid-cols-3 gap-2">
            {ELEMENTS.filter((e) => e.category === cat).map((el) => (
              <button
                key={el.id}
                onClick={() => addElement(el)}
                className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center p-2"
                title={el.name}
              >
                <div
                  className="w-8 h-8 text-white/60"
                  dangerouslySetInnerHTML={{ __html: el.previewSvg }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
