import { Coordinates } from '@main/geometry';
import { PathFinder_3rdParty } from '@main/geometry/PathFinder_3rdParty';

describe('Pathfinder', () => {
  describe('example scenario', () => {
    const start = { x: 2, y: 4 };
    const goal = { x: 1, y: 0 };
    const tiles: Coordinates[] = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (x === 2 && y === 4) {
          continue;
        }
        if (x === 3 && y === 3) {
          continue;
        }
        tiles.push({ x, y });
      }
    }

    test('new implementation', () => {
      const pathfinder = new PathFinder_3rdParty();
      const path = pathfinder.findPath(start, goal, tiles);
      expect(path.length >= 2).toBe(true);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });
  });
});
