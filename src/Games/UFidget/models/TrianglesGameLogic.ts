import { Difficulty } from '../TrianglesGame';
import { PatternPos, Pattern, PatternAPI } from './Pattern';

export type Triangle = {
  rotation: TriangleRotation;
  clockwise: boolean; // Whether next rotation is clockwise, if fold is -1 or 1.
  index: number;
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft

export type FoldDirection = -1 | 0 | 1;

export type FoldResult = { pos: PatternPos; triangle: Triangle; fold: FoldDirection };

type GameLogicConfig = { maxCount: number; gridSize: number; difficulty: Difficulty };

export class TrianglesGameLogic {
  #config: GameLogicConfig = { maxCount: 0, gridSize: 0, difficulty: 'Medium' };
  #pattern: Pattern = new Pattern(0);

  get maxCount(): number {
    return this.#config.maxCount;
  }

  get pattern(): PatternAPI {
    return this.#pattern;
  }

  setConfig(c: GameLogicConfig) {
    const didChange =
      this.#config.maxCount != c.maxCount ||
      this.#config.gridSize != c.gridSize ||
      this.#config.difficulty != c.difficulty;

    if (didChange) {
      this.#config = c;

      const newGridSize = c.gridSize <= 0 ? Math.ceil(this.maxCount / 2) * 2 + 1 : c.gridSize;
      this.#pattern = new Pattern(newGridSize);
    }
    return didChange;
  }

  getCell(pos: PatternPos) {
    return this.#pattern.getCell(pos);
  }

  /* -------------------------------------------------------------------------- */
  /*                              Generate Pattern                              */
  /* -------------------------------------------------------------------------- */

  generatePattern() {
    do {
      this.startNewPattern();
      this.foldPatternUntilDone();
    } while (this.#pattern.length !== this.maxCount || !this.#pattern.isValid(this.#config.difficulty));
  }

  private startNewPattern() {
    const mid = Math.floor(this.#pattern.gridSize / 2);

    this.#pattern.reset();
    this.#pattern.addFoldResult({
      pos: { layer: 0, row: mid, column: mid },
      triangle: { rotation: 1, clockwise: Math.random() < 0.5, index: 0 },
      fold: 0,
    });
  }

  private foldPatternUntilDone() {
    const allFolds: FoldDirection[] = [-1, 0, 1];
    while (this.#pattern.length < this.maxCount) {
      const i = Math.floor(Math.random() * 3);
      if (
        !this.tryApplyFold(allFolds[i]) &&
        !this.tryApplyFold(allFolds[(i + 1) % 3]) &&
        !this.tryApplyFold(allFolds[(i + 2) % 3])
      ) {
        return;
      }
    }
  }

  private tryApplyFold(fold: FoldDirection): boolean {
    if (this.#pattern.length === this.maxCount) {
      return false;
    }

    let prevResult = this.#pattern.prevResult;
    let result = nextFoldResult(prevResult, fold, this.#pattern.length);
    if (this.#pattern.canAddFoldResult(result, this.#config.difficulty)) {
      this.#pattern.addFoldResult(result);
      return true;
    }
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Triangle Folding Math                           */
/* -------------------------------------------------------------------------- */

function nextFoldResult(prevResult: FoldResult, fold: FoldDirection, index: number): FoldResult {
  const {
    pos: { layer, row, column },
    triangle,
  } = prevResult;
  const { rotation, clockwise } = triangle;

  if (fold === 0) {
    const toAdd = gridDirectionWithFlatFold(triangle);
    return {
      pos: { layer, row: row + toAdd[0], column: column + toAdd[1] },
      triangle: {
        rotation: oppositeRotation(rotation),
        clockwise: !clockwise,
        index,
      },
      fold,
    };
  } else {
    return {
      pos: { layer: layer + fold, row, column },
      triangle: {
        rotation: adjacentRotation(triangle),
        clockwise: clockwise,
        index,
      },
      fold,
    };
  }
}

function gridDirectionWithFlatFold(triangle: Triangle) {
  const { rotation, clockwise } = triangle;

  const up = [-1, 0] as [number, number];
  const down = [1, 0] as [number, number];
  const left = [0, -1] as [number, number];
  const right = [0, 1] as [number, number];

  switch (rotation) {
    case 1:
      return clockwise ? right : up;
    case 2:
      return clockwise ? down : right;
    case 3:
      return clockwise ? left : down;
    case 4:
      return clockwise ? up : left;
  }
}

export function oppositeRotation(rot: TriangleRotation) {
  // 1<-->3  2<-->4
  const val = (rot + 2) % 4;
  return val === 0 ? 4 : (val as TriangleRotation);
}

function adjacentRotation(triangle: Triangle) {
  const { rotation, clockwise: clockwise } = triangle;
  const val = (rotation + (clockwise ? 1 : 3)) % 4;
  return val === 0 ? 4 : (val as TriangleRotation);
}
