import { Heuristic, Pathfinder } from './Pathfinder';
import { Coordinates } from '@duzh/geometry';
import * as PF from 'pathfinding';
import { DiagonalMovement } from 'pathfinding';

export class PathFinder_3rdParty implements Pathfinder {
  private readonly heuristic: (dx: number, dy: number) => number;
  constructor(heuristic: Heuristic) {
    this.heuristic = (() => {
      switch (heuristic) {
        case Heuristic.MANHATTAN:
          return PF.Heuristic.manhattan;
        case Heuristic.EUCLIDEAN:
          return PF.Heuristic.euclidean;
        case Heuristic.CHEBYSHEV:
          return PF.Heuristic.chebyshev;
      }
    })();
  }

  findPath = (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ): Coordinates[] => {
    const grid = this._buildPfGrid([...tiles, start, goal]);
    const finder = new PF.AStarFinder({
      diagonalMovement: DiagonalMovement.Never,
      heuristic: this.heuristic
    });
    const path = finder.findPath(start.x, start.y, goal.x, goal.y, grid);
    return path.map(([x, y]) => ({ x, y }));
  };

  private _buildPfGrid = (tiles: Coordinates[]): PF.Grid => {
    const width = tiles.map(({ x }) => x).reduce((a, b) => Math.max(a, b), 0) + 1;
    const height = tiles.map(({ y }) => y).reduce((a, b) => Math.max(a, b), 0) + 1;
    const grid = new PF.Grid(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.setWalkableAt(x, y, false);
      }
    }
    for (const { x, y } of tiles) {
      grid.setWalkableAt(x, y, true);
    }
    return grid;
  };
}
