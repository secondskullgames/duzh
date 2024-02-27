import {
  hypotenuse,
  isAdjacent,
  isInStraightLine,
  manhattanDistance,
  pointAt
} from '@main/geometry/CoordinatesUtils';
import Direction from '@main/geometry/Direction';

describe('CoordinatesUtils', () => {
  test('manhattanDistance', () => {
    const first = { x: 1, y: 1 };
    const second = { x: 4, y: 5 };
    const result = manhattanDistance(first, second);
    expect(result).toBe(7);
  });

  test('hypotenuse', () => {
    const first = { x: 1, y: 1 };
    const second = { x: 4, y: 5 };
    const result = hypotenuse(first, second);
    expect(result).toBe(5);
  });

  describe('isAdjacent', () => {
    test('adjacent in cardinal direction', () => {
      const result = isAdjacent({ x: 1, y: 1 }, { x: 1, y: 2 });
      expect(result).toBe(true);
    });

    test('not adjacent in diagonal direction', () => {
      const result = isAdjacent({ x: 1, y: 1 }, { x: 2, y: 2 });
      expect(result).toBe(false);
    });

    test('not adjacent two tiles away', () => {
      const result = isAdjacent({ x: 3, y: 2 }, { x: 1, y: 2 });
      expect(result).toBe(false);
    });
  });

  describe('isInStraightLine', () => {
    test('horizontal, 1 tile', () => {
      const result = isInStraightLine({ x: 1, y: 1 }, { x: 2, y: 1 });
      expect(result).toBe(true);
    });

    test('vertical, 1 tile', () => {
      const result = isInStraightLine({ x: 1, y: 1 }, { x: 1, y: 2 });
      expect(result).toBe(true);
    });

    test('diagonal, 1 tile', () => {
      const result = isInStraightLine({ x: 1, y: 1 }, { x: 2, y: 2 });
      expect(result).toBe(false);
    });
  });

  describe('pointAt', () => {
    test('horizontal', () => {
      const first = { x: 1, y: 1 };
      const second = { x: 4, y: 1 };
      const direction = pointAt(first, second);
      expect(direction).toEqual(Direction.E);
    });
    test('diagonal', () => {
      const first = { x: 1, y: 1 };
      const second = { x: 4, y: 5 };
      const direction = pointAt(first, second);
      expect(direction).toEqual(Direction.S);
    });
  });
});
