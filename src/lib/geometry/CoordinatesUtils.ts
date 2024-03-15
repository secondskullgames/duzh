import Coordinates from '@lib/geometry/Coordinates';
import Direction from '@lib/geometry/Direction';
import { checkState } from '@lib/utils/preconditions';

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

export const pointAt = (first: Coordinates, second: Coordinates): Direction => {
  checkState(!Coordinates.equals(first, second));
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { dx: Math.sign(dx), dy: 0 } as Direction;
  } else {
    return { dx: 0, dy: Math.sign(dy) } as Direction;
  }
};
