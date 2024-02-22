import { PathfinderImpl } from '../../main/geometry/Pathfinder';
import Coordinates from '../../main/geometry/Coordinates';

describe('Pathfinder', () => {
  test('example scenario', () => {
    const pathfinder = new PathfinderImpl(() => 1);
    const start = { x: 0, y: 0 };
    const goal = { x: 4, y: 4 };
    const tiles: Coordinates[] = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (x === 0 && y === 0) {
          continue;
        }
        if (x === 3 && y === 3) {
          continue;
        }
        tiles.push({ x, y });
      }
    }
    const path = pathfinder.findPath(start, goal, tiles);
    expect(path.length > 0).toBe(true);
  });
});
