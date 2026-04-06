import { fabric } from "fabric";

function createFabricObject(element) {
  const { type, text, ...options } = element;

  switch (type) {
    case "textbox":
      return new fabric.Textbox(text, options);
    case "rect":
      return new fabric.Rect(options);
    default:
      throw new Error(`Unsupported template element type: ${type}`);
  }
}

export function loadTemplate(canvas, template) {
  const objects = template.elements.map(createFabricObject);

  objects.forEach((object) => canvas.add(object));
  canvas.requestRenderAll();

  return objects;
}
