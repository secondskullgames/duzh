/**
 * Declaration merging wizardry below!
 */

interface Direction {
  dx: number,
  dy: number
}

namespace Direction {
  export const N: Direction = { dx: 0, dy: -1 };
  export const E: Direction = { dx: 1, dy: 0 };
  export const S: Direction = { dx: 0, dy: 1 };
  export const W: Direction = { dx: -1, dy: 0 };

  export const values = () => [N, E, S, W];

  export const equals = (first: Direction, second: Direction) => first.dx === second.dx && first.dy === second.dy;

  export const toString = (direction: Direction) => {
    if (equals(direction, Direction.N)) {
      return 'N';
    } else if (equals(direction, Direction.E)) {
      return 'E';
    } else if (equals(direction, Direction.S)) {
      return 'S';
    } else if (equals(direction, Direction.W)) {
      return 'W';
    }
    throw `Invalid direction ${direction}`;
  };

  export const toLegacyDirection = (direction: Direction): string => {
    const lookup = {
      'N': 'NW',
      'E': 'NE',
      'S': 'SE',
      'W': 'SW'
    }
    return Object.entries(lookup)
      // @ts-ignore
      .filter(([from, to]) => _equals(direction, Direction[from]))
      .map(([from, to]) => to)
      [0];
  };
}

export default Direction;
