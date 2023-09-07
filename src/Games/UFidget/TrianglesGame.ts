import Game from '../../GenericGame/Game';
import { CanvasKeyEvent, ICanvas } from '../../GenericGame/ICanvas';
import Vec2 from '../../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import { Difficulty, TrianglesPlayerSettings, TrianglesTag } from './models/TrianglesPlayerSettings';
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
    this.#logic = new TrianglesGameLogic();
    this.#renderer = new TrianglesGameRenderer(canvas, {
      rowCount: settings.gridSize,
      columnCount: settings.gridSize,
    });
    this.#renderer.colors = settings.triangleColors;

    this.updateSettings(settings);
    this.generateAndLogPattern();

    const resizeCanvas = () => {
      const actualSize = canvasSize();
      canvas.size = actualSize;
      this.#renderer.setTotalSize(actualSize);
      this.renderAll();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
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

  private updateSettings(newSettings: TrianglesPlayerSettings) {
    this.#settings = newSettings;
    this.#logic.setConfig(this.#settings.gameLogicConfig);
    this.renderAll();
    this.createSettingsButtons();
  }

  private renderAll() {
    this.#renderer.render(this.canvas, this.#logic, this.#settings.rendererConfig);
  }

  /* ------------------------------ User Features ----------------------------- */

  private generateAndLogPattern() {
    if (this.#settings.showInstructions) {
      this.toggleInstructions();
    }
    this.#logic.generatePattern();
    this.logPattern();
    this.renderAll();
  }

  private changeDifficulty(difficulty: Difficulty) {
    this.updateSettings(this.#settings.withDifficulty(difficulty));
    this.generateAndLogPattern();
  }

  private changeTrianglesTag(tag: TrianglesTag) {
    this.updateSettings(this.#settings.withTag(tag));

    this.#renderer.colors = this.#settings.triangleColors;
    this.logPattern();
    this.renderAll();
  }

  private toggleDarkenLowerLayers() {
    this.updateSettings(this.#settings.withDarkenLowerLayers(!this.#settings.darkenLowerLayers));
  }

  private toggleInstructions() {
    this.updateSettings(this.#settings.withShowInstructions(!this.#settings.showInstructions));
  }

  /* ----------------------------- Visual Updates ----------------------------- */

  private logPattern() {
    const { folds, startClockwise, layersCount } = this.#logic.pattern;
    printPatternDescription(folds, startClockwise, layersCount, this.#settings.triangleColors);
  }

  private createSettingsButtons() {
    const inputDiv = document.getElementById('inputDiv') as HTMLCanvasElement;
    const inputElements = TriangleGameInputs({
      settings: this.#settings,
      generateNewPattern: () => this.generateAndLogPattern(),
      toggleInstructions: () => this.toggleInstructions(),
      toggleDarkenLowerLayers: () => this.toggleDarkenLowerLayers(),
      changeTrianglesTag: (tag) => this.changeTrianglesTag(tag),
      changeDifficulty: (difficulty) => this.changeDifficulty(difficulty),
    });
    inputDiv.innerHTML = '';
    inputDiv.append(...inputElements);
  }
}

function canvasSize() {
  const container = document.getElementById('root')!;
  const size = Math.min(container.clientWidth, 680);
  return new Vec2(size, size);
}
