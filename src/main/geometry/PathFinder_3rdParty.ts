import Coordinates from './Coordinates';
import { Pathfinder } from './Pathfinder';
import * as PF from 'pathfinding';
import { DiagonalMovement } from 'pathfinding';

export class PathFinder_3rdParty implements Pathfinder {
  findPath = (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ): Coordinates[] => {
    const grid = this._buildPfGrid(tiles);
    const finder = new PF.AStarFinder({
      diagonalMovement: DiagonalMovement.Never,
      heuristic: PF.Heuristic.manhattan
    });
    const path = finder.findPath(start.x, start.y, goal.x, goal.y, grid);
    if (path.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Pathfinder_3rdParty: No path from ${JSON.stringify(start)} to ${JSON.stringify(
          goal
        )}`
      );
    }
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
