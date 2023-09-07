import Game from '../../GenericGame/Game';
import { CanvasKeyEvent, ICanvas } from '../../GenericGame/ICanvas';
import Vec2 from '../../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import { TrianglesPlayerSettings } from './models/TrianglesPlayerSettings';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';
import { printPatternDescription } from './utils/patternDescription';
import { TriangleGameInputs } from './views/TriangleGameInputs';

export default class TrianglesGame extends Game {
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;
  #settings: TrianglesPlayerSettings;

  constructor(canvas: ICanvas, settings: TrianglesPlayerSettings) {
    super(canvas);
    this.#settings = settings;

    this.#renderer = new TrianglesGameRenderer(canvas, {
      rowCount: settings.gridSize,
      columnCount: settings.gridSize,
    });

    this.#logic = new TrianglesGameLogic();
    this.updateSettings(settings);

    const resizeCanvas = () => {
      const actualSize = canvasSize();
      canvas.size = actualSize;
      this.#renderer.setTotalSize(actualSize);

      this.renderAll();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private updateSettings(s: TrianglesPlayerSettings) {
    const didChangeTriangleColors = this.#settings.trianglesTag !== s.trianglesTag;
    this.#settings = s;
    this.#renderer.colors = s.triangleColors;

    const didChange = this.#logic.setConfig(s.gameLogicConfig);
    if (didChange) {
      this.generateAndLogPattern();
    } else if (didChangeTriangleColors) {
      this.logPattern();
    }
    this.renderAll();
    this.createInputButtons();
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {}

  onKeyDown(event: CanvasKeyEvent): void {
    if (event.key === 'space') {
      this.generateAndLogPattern();
    } else if (event.key === 'letter' && event.letter === 'H') {
      this.toggleDarkenLowerLayers();
    } else if (event.key === 'letter' && event.letter === 'I') {
      this.toggleInstructions();
    }
  }

  private renderAll() {
    this.#renderer.render(this.canvas, this.#logic, this.#settings.rendererConfig);
  }

  private createInputButtons() {
    const inputDiv = document.getElementById('inputDiv') as HTMLCanvasElement;
    const inputElements = TriangleGameInputs({
      settings: this.#settings,
      generateNewPattern: () => this.generateAndLogPattern(),
      onChange: (newSettings) => this.updateSettings(newSettings),
    });
    inputDiv.innerHTML = '';
    inputDiv.append(...inputElements);
  }

  private toggleDarkenLowerLayers() {
    this.#settings = this.#settings.withDarkenLowerLayers(!this.#settings.darkenLowerLayers);
    this.renderAll();
  }

  private toggleInstructions() {
    this.#settings = this.#settings.withShowInstructions(!this.#settings.showInstructions);
    this.renderAll();
  }

  private generateAndLogPattern() {
    this.#settings = this.#settings.withShowInstructions(false);
    this.#logic.generatePattern();
    this.renderAll();
    this.logPattern();
  }

  private logPattern() {
    const { folds, startClockwise, layersCount } = this.#logic.pattern;
    printPatternDescription(folds, startClockwise, layersCount, this.#renderer.colors);
  }
}

function canvasSize() {
  const container = document.getElementById('root')!;
  const size = Math.min(container.clientWidth, 680);
  return new Vec2(size, size);
}
