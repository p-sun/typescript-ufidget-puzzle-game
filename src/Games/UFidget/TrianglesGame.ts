import Game from '../../GenericGame/Game';
import { CanvasKeyEvent, ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';
import { TriangleGameInputs } from './utils/TriangleGameSettings';
import { printPatternDescription } from './utils/patternDescription';

export const Difficulties = ['Easy', 'Hard'] as const;
export type Difficulty = typeof Difficulties[number];
export type TrianglesGameSettings = {
  trianglesTag: TrianglesTag;
  difficulty: Difficulty;
  gridSize: number;
};

export const TrianglesSets = {
  pinkBluePurpleGreen: {
    tag: 'pinkBluePurpleGreen',
    displayName: 'Pink-Blue-Purple-Green',
    triangleColors: ([] as Color[])
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))) // blue
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xad59de))) // purple
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))), // green
  },
  bluePinkGreenPurple: {
    tag: 'bluePinkGreenPurple',
    displayName: 'Purple-Green-Pink-Blue',
    triangleColors: ([] as Color[])
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xad59de))) // purple
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))) // green
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))), // blue
  },
} satisfies {
  [key: string]: {
    tag: string;
    triangleColors: Color[];
    displayName: string;
  };
};

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
    this.generatePattern();

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
    this.#settings = s;
    this.#renderer.colors = TrianglesSets[this.#settings.trianglesTag].triangleColors;
    this.#logic.config = {
      difficulty: s.difficulty,
      maxCount: this.#renderer.colors.length,
      gridSize: s.gridSize,
    };
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
        this.generatePattern();
      },
    });
    inputDiv.innerHTML = '';
    inputDiv.append(...inputElements);
  }

  private generatePattern() {
    this.#logic.generatePattern();
    this.#renderer.render(this.canvas, this.#logic);

    const { folds, startClockwise, layersCount } = this.#logic.pattern;
    printPatternDescription(folds, startClockwise, layersCount, this.#renderer.colors);
  }
}

function canvasSize() {
  const container = document.getElementById('root')!;
  if (container.clientWidth <= window.innerHeight - 280) {
    return new Vec2(container.clientWidth, container.clientWidth);
  } else {
    return new Vec2(window.innerHeight - 280, window.innerHeight - 280);
  }
}
