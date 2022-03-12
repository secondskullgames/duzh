interface Direction {
  dx: -1 | 0 | 1,
  dy: -1 | 0 | 1
}

type DirectionName = 'N' | 'E' | 'S' | 'W';

namespace Direction {
  export const N: Direction = { dx: 0, dy: -1 };
  export const E: Direction = { dx: 1, dy: 0 };
  export const S: Direction = { dx: 0, dy: 1 };
  export const W: Direction = { dx: -1, dy: 0 };

  const _map = new Map<DirectionName, Direction>([
    ['N', N],
    ['E', E],
    ['S', S],
    ['W', W]
  ]);

  export const values = (): Direction[] => [N, E, S, W];

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
    throw new Error(`Invalid direction ${JSON.stringify(direction)}`);
  };

  export const toLegacyDirection = (direction: Direction): string => {
    const lookup = new Map<DirectionName, string>([
      ['N', 'NW'],
      ['E', 'NE'],
      ['S', 'SE'],
      ['W', 'SW']
    ]);
    return [...lookup.entries()]
      .filter(([from, to]) => equals(direction, _map.get(from)!!))
      .map(([from, to]) => to)
      [0];
  };
}

export default Direction;
