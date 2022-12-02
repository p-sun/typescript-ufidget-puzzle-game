import {
  Direction,
  OppositeDirection,
  Vec2ForDirection,
} from '../GenericModels/Direction';
import {
  GridPosition,
  GridPositionEqual,
  GridSize,
} from '../GenericModels/Grid';
import { randomIntInRange } from '../Utils';

export default class Snake {
  private constructor(
    public readonly positions: GridPosition[],
    public readonly moveDirection: Direction,
    public readonly segmentsToAdd: number
  ) {}

  static createRandom(gridSize: GridSize): Snake {
    const { columnCount, rowCount } = gridSize;

    // Choose a random location in the grid
    const column = randomIntInRange(2, columnCount - 2);
    const row = randomIntInRange(2, rowCount - 2);

    // Figure out which edges we closest to
    const dColumn =
      column > (columnCount - 1) / 2 ? column - columnCount : column + 1;
    const dRow = row > (rowCount - 1) / 2 ? row - rowCount : row + 1;

    // Create the move direction that moves away from the closest edge
    const moveDirection =
      Math.abs(dColumn) < Math.abs(dRow)
        ? dColumn > 0
          ? `right`
          : `left`
        : dRow > 0
        ? `down`
        : `up`;

    const p = { row, column };

    return new Snake(
      [p, Snake.#moveGridPosition(p, OppositeDirection(moveDirection))],
      moveDirection,
      0
    );
  }

  static #moveGridPosition(
    gridPos: GridPosition,
    direction: Direction
  ): GridPosition {
    const d = Vec2ForDirection(direction);
    return { row: gridPos.row + d.y, column: gridPos.column + d.x };
  }

  get headPosition(): GridPosition {
    return this.positions[0];
  }

  get length(): number {
    return this.positions.length;
  }

  extend(): Snake {
    return new Snake(
      this.positions,
      this.moveDirection,
      this.segmentsToAdd + 1
    );
  }

  tick(): Snake {
    const newPositions = this.positions.slice();
    newPositions.unshift(
      Snake.#moveGridPosition(this.headPosition, this.moveDirection)
    );
    if (this.segmentsToAdd === 0) {
      newPositions.pop();
    }

    return new Snake(
      newPositions,
      this.moveDirection,
      Math.max(0, this.segmentsToAdd - 1)
    );
  }

  changeDirection(direction: Direction): Snake {
    if (direction === OppositeDirection(direction)) {
      // Ignore an immediate death
      return this;
    }

    return new Snake(this.positions, direction, this.segmentsToAdd);
  }

  hasWallCollision(gridSize: GridSize): boolean {
    const { headPosition } = this;
    const { rowCount, columnCount } = gridSize;

    // Check if the head went off the grid
    if (
      headPosition.column < 0 ||
      headPosition.row < 0 ||
      headPosition.column >= columnCount ||
      headPosition.row >= rowCount
    ) {
      return true;
    }

    return this.containsPosition(headPosition, { skipHead: true });
  }

  containsPosition(
    pos: GridPosition,
    options?: { skipHead: boolean }
  ): boolean {
    const positionsToCheck = options?.skipHead
      ? this.positions.slice(1)
      : this.positions;

    return positionsToCheck.some((p) => GridPositionEqual(p, pos));
  }
}
