import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';
import {
  ICanvas,
  TextAttributes,
  RectOptions,
  EllipseOptions,
  LineOptions,
  TextOptions,
  PolygonOptions,
  CanvasListener,
} from './ICanvas';

export default class HTMLCanvas implements ICanvas {
  #context: CanvasRenderingContext2D;
  #size: Vec2;
  #canvas: HTMLCanvasElement;
  #listener: CanvasListener | undefined;

  constructor(canvasElement: HTMLCanvasElement, size: Vec2) {
    this.#canvas = canvasElement;
    this.#context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    this.#size = size;
    this.setupListeners();
  }

  get size(): Vec2 {
    return this.#size;
  }

  set size(newSize: Vec2) {
    this.#size = newSize;

    this.#canvas.style.width = newSize.x + 'px';
    this.#canvas.style.height = newSize.y + 'px';

    const scale = window.devicePixelRatio;
    this.#canvas.width = newSize.x * scale;
    this.#canvas.height = newSize.y * scale;

    this.#context.scale(scale, scale);
  }

  static createInRootElement(rootElement: Element, size: Vec2 = Vec2.zero): HTMLCanvas {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    rootElement.appendChild(canvasElement);

    return new HTMLCanvas(canvasElement, size);
  }

  get midpoint(): Vec2 {
    return this.fromNormalizedCoordinate(new Vec2(0.5, 0.5));
  }

  setListener(listener: CanvasListener): void {
    this.#listener = listener;
  }

  unsetListener(): void {
    this.#listener = undefined;
  }

  fromNormalizedCoordinate(coord: Vec2): Vec2 {
    return this.size.componentMul(coord);
  }

  toNormalizedCoordinate(pos: Vec2): Vec2 {
    return pos.componentDiv(this.size);
  }

  clear(color: Color) {
    this.drawRect({ origin: Vec2.zero, size: this.size, color });
  }

  measureText(contents: string, attributes: TextAttributes): { size: Vec2; baselineOffsetFromBottom: number } {
    return this.#performCanvasTextOperation(attributes, () => {
      return this.#measureTextWithContextReady(contents);
    });
  }

  drawRect(options: RectOptions) {
    const { color, origin, size, alpha } = options;
    this.#context.fillStyle = color.asHexString();

    const globalAlpga = this.#context.globalAlpha;
    if (alpha !== undefined) {
      this.#context.globalAlpha = alpha;
    }
    this.#context.fillRect(origin.x, origin.y, size.x, size.y);
    this.#context.globalAlpha = globalAlpga;
  }

  drawEllipse(options: EllipseOptions) {
    const { color, origin, rx, ry, rotationAngle } = options;
    this.#context.fillStyle = color.asHexString();
    this.#context.beginPath();
    this.#context.ellipse(origin.x, origin.y, rx, ry, rotationAngle ?? 0, 2 * Math.PI, 0);
    this.#context.fill();
  }

  drawLine(options: LineOptions) {
    this.#context.strokeStyle = options.color.asHexString();
    this.#context.lineWidth = options.thickness ?? 1;
    this.#context.setLineDash(options.lineDash ?? []);

    this.#context.beginPath();
    this.#context.moveTo(options.start.x, options.start.y);
    this.#context.lineTo(options.end.x, options.end.y);
    this.#context.stroke();
  }

  drawPolygon(options: PolygonOptions) {
    const { points, stroke, fillColor } = options;

    this.#context.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) {
        this.#context.moveTo(point.x, point.y);
      } else {
        this.#context.lineTo(point.x, point.y);
      }
    }
    this.#context.closePath();

    if (fillColor) {
      this.#context.fillStyle = fillColor.asHexString();
      this.#context.fill();
    }

    if (stroke) {
      this.#context.strokeStyle = stroke.color.asHexString();
      this.#context.lineWidth = stroke.thickness ?? 1;
      this.#context.setLineDash(stroke.lineDash ?? []);
      this.#context.stroke();
    }
  }

  drawText(options: TextOptions) {
    this.#performCanvasTextOperation(options.attributes, () => {
      let { x, y } = options.position;
      if (options.normalizedAnchorOffset) {
        const offsetX = options.normalizedAnchorOffset?.offsetX ?? 0;
        const offsetY = options.normalizedAnchorOffset?.offsetY ?? 'baseline';
        const measure = this.#measureTextWithContextReady(options.text);
        x += (-measure.size.x / 2) * (1 + offsetX);

        if (offsetY === 'baseline') {
          y -= measure.baselineOffsetFromBottom;
        } else {
          y += (measure.size.y / 2) * (1 - offsetY) - measure.baselineOffsetFromBottom;
        }
      }

      let { background } = options;
      if (background) {
        this.#context.save();

        if (background.alpha !== undefined) {
          this.#context.globalAlpha = background.alpha;
        }

        const measure = this.#measureTextWithContextReady(options.text);
        let p = new Vec2(x, y).mapY((y) => y - measure.size.y);
        let s = measure.size;

        if (background.padding) {
          const offset = new Vec2(background.padding);
          p = p.sub(offset);
          s = s.add(offset.mul(2));
        }

        this.drawRect({ origin: p, size: s, color: background.color });
        this.#context.restore();
      }

      this.#context.fillText(options.text, x, y);
    });
  }

  drawTextAtPosition(
    contents: string,
    position: Vec2,
    attributes: TextAttributes,
    normalizedAnchorOffset: {
      normalizedOffsetX?: number;
      normalizedOffsetY?: number | 'baseline';
    } = { normalizedOffsetX: 0, normalizedOffsetY: 0 },
    background?: { color: Color; alpha?: number; padding?: number }
  ) {
    this.#performCanvasTextOperation(attributes, () => {
      let { x, y } = position;

      const measure = this.#measureTextWithContextReady(contents);

      if (normalizedAnchorOffset) {
        if (normalizedAnchorOffset.normalizedOffsetX !== undefined) {
          x += (-measure.size.x / 2) * (1 + normalizedAnchorOffset.normalizedOffsetX);
        }

        if (normalizedAnchorOffset.normalizedOffsetY !== undefined) {
          if (normalizedAnchorOffset.normalizedOffsetY === 'baseline') {
            y += measure.baselineOffsetFromBottom;
          } else {
            y += (measure.size.y / 2) * (1 - normalizedAnchorOffset.normalizedOffsetY);
          }
        }
      }

      if (background) {
        this.#context.save();

        if (background.alpha !== undefined) {
          this.#context.globalAlpha = background.alpha;
        }

        let p = new Vec2(x, y).mapY((y) => y - measure.size.y);
        let s = measure.size;

        if (background.padding) {
          const offset = new Vec2(background.padding);
          p = p.sub(offset);
          s = s.add(offset.mul(2));
        }

        this.drawRect({ origin: p, size: s, color: background.color });

        this.#context.restore();
      }

      this.#context.fillText(contents, x, y);
    });
  }

  #performCanvasTextOperation<T = undefined>(attributes: TextAttributes, op: () => T) {
    this.#context.save();
    this.#context.font = `${attributes.fontSize}px Monoco`;
    this.#context.fillStyle = attributes.color.asHexString();
    const res = op();
    this.#context.restore();

    return res;
  }

  #measureTextWithContextReady(contents: string): {
    size: Vec2;
    baselineOffsetFromBottom: number;
  } {
    const metrics = this.#context.measureText(contents);
    return {
      size: new Vec2(metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent),
      baselineOffsetFromBottom: metrics.actualBoundingBoxDescent,
    };
  }

  private setupListeners() {
    const getPos = (clientX: number, clientY: number) => {
      const rect = this.#canvas.getBoundingClientRect();
      return { x: clientX - rect.x, y: clientY - rect.y };
    };

    document.addEventListener('keydown', (event) => {
      const { key, code } = event;
      if (key === 'ArrowUp') {
        this.#listener?.onKeyDown({ key: 'arrow', direction: `up` });
      } else if (key === 'ArrowDown') {
        this.#listener?.onKeyDown({ key: 'arrow', direction: `down` });
      } else if (key === 'ArrowLeft') {
        this.#listener?.onKeyDown({ key: 'arrow', direction: `left` });
      } else if (key === 'ArrowRight') {
        this.#listener?.onKeyDown({ key: 'arrow', direction: `right` });
      } else if (key === ' ') {
        this.#listener?.onKeyDown({ key: 'space' });
      } else if (code === 'KeyE') {
        this.#listener?.onKeyDown({ key: 'letter', letter: 'E' });
      } else if (code === 'KeyM') {
        this.#listener?.onKeyDown({ key: 'letter', letter: 'M' });
      } else if (code === 'KeyH') {
        this.#listener?.onKeyDown({ key: 'letter', letter: 'H' });
      } else if (code === 'KeyI') {
        this.#listener?.onKeyDown({ key: 'letter', letter: 'I' });
      } else if (code === 'Backspace') {
        this.#listener?.onKeyDown({ key: 'backspace' });
      } else if (code.startsWith('Digit')) {
        const digit = Number(event.code.slice('Digit'.length));
        this.#listener?.onKeyDown({ key: 'digit', digit: digit });
      }
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    });

    this.#canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getPos(e.clientX, e.clientY);
      this.#listener?.onStartDrag(x, y, e.buttons === 1);
    });

    this.#canvas.addEventListener('mouseup', (e) => {
      this.#listener?.onEndDrag();
    });

    this.#canvas.addEventListener('mousemove', (e) => {
      const { x, y } = getPos(e.clientX, e.clientY);
      this.#listener?.onDrag(x, y, e.buttons === 1);
    });

    this.#canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const { x, y } = getPos(e.touches[0].clientX, e.touches[0].clientY);
      this.#listener?.onStartDrag(x, y, e.touches.length === 1);
    });

    this.#canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const { x, y } = getPos(e.touches[0].clientX, e.touches[0].clientY);
        this.#listener?.onDrag(x, y, e.touches.length === 1);
      },
      { passive: false }
    );

    this.#canvas.addEventListener('touchend', (e) => {
      this.#listener?.onEndDrag();
    });
  }
}
