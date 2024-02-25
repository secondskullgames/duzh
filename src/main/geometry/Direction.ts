type Direction = Readonly<{
  dx: -1 | 0 | 1;
  dy: -1 | 0 | 1;
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

  export const equals = (first: Direction, second: Direction): boolean =>
    first.dx === second.dx && first.dy === second.dy;

  export const toString = (direction: Direction): string => {
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

  const _legacyDirectionLookup: Record<DirectionName, string> = {
    N: 'NW',
    E: 'NE',
    S: 'SE',
    W: 'SW'
  };
  export const toLegacyDirection = (direction: Direction): string => {
    return _legacyDirectionLookup[_getName(direction)];
  };

  export const getDefaultUnitDirection = (): Direction => Direction.S;

  export const rotateClockwise = (direction: Direction): Direction => {
    if (equals(direction, N)) {
      return E;
    } else if (equals(direction, E)) {
      return S;
    } else if (equals(direction, S)) {
      return W;
    } else if (equals(direction, W)) {
      return N;
    }
    throw new Error(`Invalid direction ${JSON.stringify(direction)}`);
  };

  export const rotateCounterClockwise = (direction: Direction): Direction => {
    if (equals(direction, N)) {
      return W;
    } else if (equals(direction, W)) {
      return S;
    } else if (equals(direction, S)) {
      return E;
    } else if (equals(direction, E)) {
      return N;
    }
    throw new Error(`Invalid direction ${JSON.stringify(direction)}`);
  };
}

export default Direction;
