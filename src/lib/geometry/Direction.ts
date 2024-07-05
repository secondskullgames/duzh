import { Offsets } from '@lib/geometry/Offsets';

export enum Direction {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W'
}

export namespace Direction {
  export const values = (): Direction[] => [
    Direction.N,
    Direction.E,
    Direction.S,
    Direction.W
  ];

  export const getOffsets = (direction: Direction): Offsets => {
    switch (direction) {
      case Direction.N:
        return { dx: 0, dy: -1 };
      case Direction.E:
        return { dx: 1, dy: 0 };
      case Direction.S:
        return { dx: 0, dy: 1 };
      case Direction.W:
        return { dx: -1, dy: 0 };
    }
  };

  const _legacyDirectionLookup: Record<Direction, string> = {
    [Direction.N]: 'NW',
    [Direction.E]: 'NE',
    [Direction.S]: 'SE',
    [Direction.W]: 'SW'
  };

  export const toLegacyDirection = (direction: Direction): string => {
    return _legacyDirectionLookup[direction];
  };

  export const getDefaultUnitDirection = (): Direction => Direction.S;

  export const rotateClockwise = (direction: Direction): Direction => {
    switch (direction) {
      case Direction.N:
        return Direction.E;
      case Direction.E:
        return Direction.S;
      case Direction.S:
        return Direction.W;
      case Direction.W:
        return Direction.N;
    }
  };

  export const rotateCounterClockwise = (direction: Direction): Direction => {
    switch (direction) {
      case Direction.N:
        return Direction.W;
      case Direction.W:
        return Direction.S;
      case Direction.S:
        return Direction.E;
      case Direction.E:
        return Direction.N;
    }
  };
}
