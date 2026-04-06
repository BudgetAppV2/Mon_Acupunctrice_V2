/**
 * Undo/redo history for the Fabric.js canvas.
 * Stores canvas state as JSON snapshots. Max 30 states.
 */

import type { Canvas } from 'fabric';

const MAX = 30;

export class HistoryManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private paused = false;

  push(canvas: Canvas) {
    if (this.paused) return;
    this.undoStack.push(JSON.stringify(canvas.toJSON()));
    if (this.undoStack.length > MAX) this.undoStack.shift();
    this.redoStack = [];
  }

  async undo(canvas: Canvas): Promise<boolean> {
    if (this.undoStack.length <= 1) return false;
    this.redoStack.push(this.undoStack.pop()!);
    return this.load(canvas, this.undoStack[this.undoStack.length - 1]);
  }

  async redo(canvas: Canvas): Promise<boolean> {
    if (this.redoStack.length === 0) return false;
    const s = this.redoStack.pop()!;
    this.undoStack.push(s);
    return this.load(canvas, s);
  }

  get canUndo() { return this.undoStack.length > 1; }
  get canRedo() { return this.redoStack.length > 0; }

  private async load(canvas: Canvas, json: string): Promise<boolean> {
    this.paused = true;
    await canvas.loadFromJSON(json);
    canvas.renderAll();
    this.paused = false;
    return true;
  }
}
