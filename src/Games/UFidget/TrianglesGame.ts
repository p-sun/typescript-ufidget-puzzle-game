import Game from '../../GenericGame/Game';
import { CanvasKeyEvent, ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';
import { printPatternDescription } from './utils/patternDescription';

export default class TrianglesGame extends Game {
  #triangleColors: Color[];
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;

  constructor(config: { canvas: ICanvas; cellSize: Vec2; gridSize: number; triangleColors: Color[] }) {
    const { canvas, cellSize, gridSize, triangleColors } = config;
    super(canvas);

    this.#triangleColors = triangleColors;
    this.#logic = new TrianglesGameLogic({
      maxTriangles: triangleColors.length,
      gridSize,
    });

    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize,
      triangleColors
    );

    const resizeCanvas = () => {
      const actualSize = canvasSize();
      canvas.size = actualSize;
      this.#renderer.setTotalSize(actualSize);
      this.#renderer.render(canvas, this.#logic);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    this.generatePattern();
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {}

  onKeyDown(event: CanvasKeyEvent): void {
    if (event.key === 'space') {
      this.generatePattern();
    } else if (event.key === 'letter' && event.letter === 'H') {
      this.#renderer.darkenLowerLayers = !this.#renderer.darkenLowerLayers;
      this.#renderer.render(this.canvas, this.#logic);
    } else if (event.key === 'letter' && event.letter === 'I') {
      this.#renderer.toggleInstructions();
      this.#renderer.render(this.canvas, this.#logic);
    }
  }

  onStartDrag(x: number, y: number, isLeft: boolean): void {
    this.generatePattern();
  }

  private generatePattern() {
    this.#logic.generatePattern();
    this.#renderer.render(this.canvas, this.#logic);

    const { folds, startClockwise, layersCount } = this.#logic.pattern;
    printPatternDescription(folds, startClockwise, layersCount, this.#triangleColors);
  }
}

function canvasSize() {
  const container = document.getElementById('root')!;
  const size = Math.min(container.clientWidth, 1000);
  return new Vec2(size, size);
}
