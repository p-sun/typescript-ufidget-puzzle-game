import {
  CanvasListener,
  EllipseOptions,
  ICanvas,
  LineOptions,
  PolygonOptions,
  RectOptions,
  TextAttributes,
  TextOptions,
} from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';

export class CanvasStub implements ICanvas {
  get size(): Vec2 {
    return Vec2.zero;
  }
  set size(newSize: Vec2) {}
  get midpoint(): Vec2 {
    return Vec2.zero;
  }

  toNormalizedCoordinate(pos: unknown): Vec2 {
    return Vec2.zero;
  }
  fromNormalizedCoordinate(coord: Vec2): Vec2 {
    return Vec2.zero;
  }
  measureText(contents: string, attributes: TextAttributes): { size: Vec2; baselineOffsetFromBottom: number } {
    return { size: Vec2.zero, baselineOffsetFromBottom: 9 };
  }
  clear(color: Color): void {}
  drawRect(options: RectOptions): void {}
  drawLine(options: LineOptions): void {}
  drawEllipse(options: EllipseOptions): void {}
  drawText(options: TextOptions): void {}
  drawPolygon(options: PolygonOptions): void {}
  drawTextAtPosition(
    contents: string,
    position: Vec2,
    attributes: TextAttributes,
    normalizedAnchorOffset?:
      | { normalizedOffsetX?: number | undefined; normalizedOffsetY?: number | 'baseline' | undefined }
      | undefined,
    background?: { color: Color; alpha?: number | undefined; padding?: number | undefined } | undefined
  ): void {}
  setListener(listener: CanvasListener): void {}
  unsetListener(): void {}
}
