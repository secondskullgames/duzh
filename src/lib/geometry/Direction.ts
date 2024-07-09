import { Offsets } from '@lib/geometry/Offsets';
import { Coordinates } from '@lib/geometry/Coordinates';

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

  export const fromOffsets = ({ dx, dy }: Offsets): Direction => {
    if (dx === 0 && dy === -1) {
      return Direction.N;
    } else if (dx === 1 && dy === 0) {
      return Direction.E;
    } else if (dx === 0 && dy === 1) {
      return Direction.S;
    } else if (dx === -1 && dy === 0) {
      return Direction.W;
    } else {
      throw new Error(`Invalid offsets: ${dx}, ${dy}`);
    }
  };

  export const fromOffsetsOptional = ({ dx, dy }: Offsets): Direction | null => {
    if (dx === 0 && dy === -1) {
      return Direction.N;
    } else if (dx === 1 && dy === 0) {
      return Direction.E;
    } else if (dx === 0 && dy === 1) {
      return Direction.S;
    } else if (dx === -1 && dy === 0) {
      return Direction.W;
    } else {
      return null;
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

  export const between = (first: Coordinates, second: Coordinates): Direction => {
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    if (dx === 0 && dy === -1) {
      return Direction.N;
    } else if (dx === 1 && dy === 0) {
      return Direction.E;
    } else if (dx === 0 && dy === 1) {
      return Direction.S;
    } else if (dx === -1 && dy === 0) {
      return Direction.W;
    } else {
      throw new Error(`Invalid direction: ${dx}, ${dy}`);
    }
  };
}
