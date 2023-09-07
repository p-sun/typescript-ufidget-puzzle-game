import Game from '../../GenericGame/Game';
import { CanvasKeyEvent, ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';
import { TriangleGameInputs } from './utils/TriangleGameInputs';
import { embedKeyInProperty } from './utils/adt';
import { printPatternDescription } from './utils/patternDescription';

export const Difficulties = ['Easy', 'Medium', 'Hard'] as const;
export type Difficulty = typeof Difficulties[number];
export type TrianglesGameSettings = {
  trianglesTag: TrianglesTag;
  difficulty: Difficulty;
  gridSize: number;
  darkenLowerLayers: boolean;
};

type TriangleSetInfo = {
  tag: string;
  triangleColors: Color[];
  displayName: string;
};

export const TrianglesSets = embedKeyInProperty<TriangleSetInfo>()('tag', {
  pinkBluePurpleGreen: {
    displayName: 'Pink-Blue-Purple-Green',
    triangleColors: ([] as Color[])
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))) // blue
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xad59de))) // purple
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))), // green
  },
  bluePinkGreenPurple: {
    displayName: 'Purple-Green-Pink-Blue',
    triangleColors: ([] as Color[])
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xad59de))) // purple
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))) // green
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))), // blue
  },
});

export type TrianglesTag = keyof typeof TrianglesSets;

export default class TrianglesGame extends Game {
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;
  #settings: TrianglesGameSettings;

  constructor(canvas: ICanvas, settings: TrianglesGameSettings) {
    super(canvas);
    this.#settings = settings;
    const { gridSize } = settings;

    this.#renderer = new TrianglesGameRenderer(canvas, {
      rowCount: gridSize,
      columnCount: gridSize,
    });

    this.#logic = new TrianglesGameLogic();
    this.updateSettings(settings);

    const resizeCanvas = () => {
      const actualSize = canvasSize();
      canvas.size = actualSize;
      this.#renderer.setTotalSize(actualSize);
      this.#renderer.render(canvas, this.#logic);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private updateSettings(s: TrianglesGameSettings) {
    const didChangeTriangleColors = this.#settings.trianglesTag !== s.trianglesTag;
    this.#settings = s;
    this.#renderer.colors = TrianglesSets[this.#settings.trianglesTag].triangleColors;
    this.#renderer.darkenLowerLayers = s.darkenLowerLayers;

    const didChange = this.#logic.setConfig({
      difficulty: s.difficulty,
      maxCount: this.#renderer.colors.length,
      gridSize: s.gridSize,
    });
    if (didChange) {
      this.generatePattern();
    } else if (didChangeTriangleColors) {
      this.logPattern();
    }
    this.#renderer.render(this.canvas, this.#logic);

    this.createInputButtons();
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

  private createInputButtons() {
    const inputDiv = document.getElementById('inputDiv') as HTMLCanvasElement;
    const inputElements = TriangleGameInputs({
      settings: this.#settings,
      generateNewPattern: () => {
        if (this.#renderer.showInstructions) {
          this.#renderer.toggleInstructions();
        }
        this.generatePattern();
      },
      toggleInstructions: () => {
        this.#renderer.toggleInstructions();
        this.#renderer.render(this.canvas, this.#logic);
      },
      onChange: (newSettings) => {
        this.updateSettings(newSettings);
      },
    });
    inputDiv.innerHTML = '';
    inputDiv.append(...inputElements);
  }

  private generatePattern() {
    this.#logic.generatePattern();
    this.#renderer.render(this.canvas, this.#logic);
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
