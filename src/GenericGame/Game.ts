import Vec2 from '../GenericModels/Vec2';
import { ICanvas, CanvasKeyEvent, CanvasListener } from './ICanvas';

export interface Runnable {
  run(fps: number): void;
}

export default abstract class Game implements Runnable, CanvasListener {
  abstract onUpdate(): void;
  abstract onRender(canvas: ICanvas): void;

  protected readonly canvas: ICanvas;
  protected fps: number = 60;

  constructor(canvas: ICanvas) {
    this.canvas = canvas;
    this.canvas.setListener(this);
  }

  run(fps: number = 60) {
    this.fps = fps;

    if (fps == 0) {
      this.runOnce();
    } else {
      window.setInterval(() => {
        this.runOnce();
      }, 1000 / fps);
    }
  }

  runOnce() {
    this.onUpdate();
    this.onRender(this.canvas);
  }

  // CanvasListener
  onStartDrag(x: number, y: number, isLeft: boolean): void {}
  onEndDrag(): void {}
  onDrag(x: number, y: number, isLeft: boolean): void {}
  onKeyDown(key: CanvasKeyEvent): void {}
}
