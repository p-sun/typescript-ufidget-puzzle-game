import Color from '../../../GenericModels/Color';
import { embedKeyInProperty } from '../utils/adt';

export const Difficulties = ['Easy', 'Medium', 'Hard'] as const;

export type Difficulty = typeof Difficulties[number];

export class TrianglesPlayerSettings {
  public readonly trianglesTag: TrianglesTag;
  public readonly difficulty: Difficulty;
  public readonly gridSize: number;
  public readonly darkenLowerLayers: boolean;
  public readonly showInstructions: boolean;

  constructor(options: {
    trianglesTag: TrianglesTag;
    difficulty: Difficulty;
    gridSize: number;
    darkenLowerLayers?: boolean;
    showInstructions?: boolean;
  }) {
    this.trianglesTag = options.trianglesTag;
    this.difficulty = options.difficulty;
    this.gridSize = options.gridSize;
    this.darkenLowerLayers = options.darkenLowerLayers ?? false;
    this.showInstructions = options.showInstructions ?? false;
  }

  get triangleColors() {
    return TrianglesSets[this.trianglesTag].triangleColors;
  }

  get gameLogicConfig() {
    return {
      difficulty: this.difficulty,
      maxCount: this.triangleColors.length,
      gridSize: this.gridSize,
    };
  }

  get rendererConfig() {
    return {
      darkenLowerLayers: this.darkenLowerLayers,
      showInstructions: this.showInstructions,
    };
  }

  withTag(tag: TrianglesTag) {
    return new TrianglesPlayerSettings({
      ...this,
      trianglesTag: tag,
    });
  }

  withDifficulty(difficulty: Difficulty) {
    return new TrianglesPlayerSettings({
      ...this,
      difficulty,
    });
  }

  withDarkenLowerLayers(darkenLowerLayers: boolean) {
    return new TrianglesPlayerSettings({
      ...this,
      darkenLowerLayers,
    });
  }

  withShowInstructions(showInstructions: boolean) {
    return new TrianglesPlayerSettings({
      ...this,
      showInstructions,
    });
  }
}

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
