type Direction = Readonly<{
  dx: -1 | 0 | 1,
  dy: -1 | 0 | 1
}>;

type DirectionName = 'N' | 'E' | 'S' | 'W';

namespace Direction {
  export const N: Direction = { dx: 0, dy: -1 };
  export const E: Direction = { dx: 1, dy: 0 };
  export const S: Direction = { dx: 0, dy: 1 };
  export const W: Direction = { dx: -1, dy: 0 };
  const _nameToDirection: Record<DirectionName, Direction> = { N, E, S, W };

  const _getName = (direction: Direction): DirectionName => {
    for (const [name, dir] of Object.entries(_nameToDirection)) {
      if (Direction.equals(dir, direction)) {
        return name as DirectionName;
      }
    }
    throw new Error(`Invalid direction ${JSON.stringify(direction)}`);
  };

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
    const lookup: Record<DirectionName, string> = {
      'N': 'NW',
      'E': 'NE',
      'S': 'SE',
      'W': 'SW'
    };
    return lookup[_getName(direction)];
  };

  export const rotateClockwise = (direction: Direction): Direction => {
    const directionName = _getName(direction);
    const rotated: DirectionName = (() => {
      switch (directionName) {
        case 'N': return 'E';
        case 'E': return 'S';
        case 'S': return 'W';
        case 'W': return 'N';
        default:  throw new Error(`Unknown direction ${directionName}`);
      }
    })();
    return _nameToDirection[rotated];
  };

  export const rotateCounterClockwise = (direction: Direction): Direction => {
    const directionName = _getName(direction);
    const rotated: DirectionName = (() => {
      switch (directionName) {
        case 'N': return 'W';
        case 'E': return 'N';
        case 'S': return 'E';
        case 'W': return 'S';
        default:  throw new Error(`Unknown direction ${directionName}`);
      }
    })();
    return _nameToDirection[rotated];
  };
}

export default Direction;
