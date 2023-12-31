import BombBroomerGame from './src/Games/BombBoomer/BombBroomerGame';
import SnakeGame from './src/Games/Snake/SnakeGame';
import SudokuGame from './src/Games/Sudoku/SudokuGame';
import TrianglesGame from './src/Games/UFidget/TrianglesGame';
import { TrianglesPlayerSettings } from './src/Games/UFidget/models/TrianglesPlayerSettings';
import Game from './src/GenericGame/Game';
import HTMLCanvas from './src/GenericGame/HTMLCanvas';
import { ICanvas } from './src/GenericGame/ICanvas';
import Vec2 from './src/GenericModels/Vec2';
import EasingRenderer from './src/Playgrounds/EasingRenderer';

const Games: { [k: string]: (canvas: ICanvas) => Game } = {
  Snake: (canvas) => {
    const gridSize = { rowCount: 18, columnCount: 18 };
    const cellSize = new Vec2(22, 22);
    return new SnakeGame(canvas, gridSize, cellSize);
  },
  BombBroomer: (canvas) => new BombBroomerGame(canvas),
  Sudoku: (canvas) => new SudokuGame(canvas),
  Triangles: (canvas) => {
    return new TrianglesGame(
      canvas,
      new TrianglesPlayerSettings({
        trianglesTag: 'pinkBluePurpleGreen',
        difficulty: 'Medium',
        gridSize: 8,
      })
    );
  },
};

const Playgrounds = {
  Easing: (canvas) => {
    const size = new Vec2(1000, 230);
    canvas.size = size;
    return new EasingRenderer({
      size,
    });
  },
};

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot!);

  const game = Games.Triangles(canvas).run(0);
  // const game = Games.Snake(canvas).run(12);
  // const game = Games.BombBroomer(canvas).run(12);
  // const game = Games.Sudoku(canvas).run(12);

  // const playground = Playgrounds.Easing(canvas);
  // playground.run(canvas);
}
