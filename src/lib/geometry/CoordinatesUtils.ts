import { Coordinates } from '@lib/geometry/Coordinates';
import { Direction } from '@lib/geometry/Direction';
import { checkState } from '@lib/utils/preconditions';
import { Offsets } from '@lib/geometry/Offsets';

export const manhattanDistance = (first: Coordinates, second: Coordinates): number =>
  Math.abs(first.x - second.x) + Math.abs(first.y - second.y);

export const hypotenuse = (first: Coordinates, second: Coordinates): number => {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  return (dx * dx + dy * dy) ** 0.5;
};

export const isAdjacent = (first: Coordinates, second: Coordinates): boolean => {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  return (dx === 0 && (dy === -1 || dy === 1)) || (dy === 0 && (dx === -1 || dx === 1));
};

export const isInStraightLine = (first: Coordinates, second: Coordinates): boolean => {
  const dx = Math.abs(first.x - second.x);
  const dy = Math.abs(first.y - second.y);
  return (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
};

/**
 * Returns the *nearest* direction between two points.  The two points
 * need not be exactly in line.
 */
export const pointAt = (first: Coordinates, second: Coordinates): Direction => {
  checkState(!Coordinates.equals(first, second));
  return offsetsToDirection(Coordinates.difference(first, second));
};

export const offsetsToDirection = ({ dx, dy }: Offsets): Direction => {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? Direction.E : Direction.W;
  } else {
    return dy >= 0 ? Direction.S : Direction.N;
  }
};
