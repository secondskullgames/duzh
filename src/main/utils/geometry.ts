import { checkState } from './preconditions';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import MapInstance from '../maps/MapInstance';
import { isBlocked } from '../maps/MapUtils';

export const pointAt = (first: Coordinates, second: Coordinates): Direction => {
  checkState(!Coordinates.equals(first, second));
  const dx = Math.sign(second.x - first.x);
  const dy = Math.sign(second.y - first.y);
  if (dx !== 0) {
    return { dx, dy: 0 } as Direction;
  } else {
    return { dx: 0, dy } as Direction;
  }
};

export const hasUnblockedStraightLineBetween = (
  startCoordinates: Coordinates,
  targetCoordinates: Coordinates,
  map: MapInstance
): boolean => {
  let { x, y } = startCoordinates;
  const { x: targetX, y: targetY } = targetCoordinates;
  const dx = Math.sign(targetX - x);
  const dy = Math.sign(targetY - y);
  x += dx;
  y += dy;

  while (x !== targetX || y !== targetY) {
    if (isBlocked(map, { x, y })) {
      return false;
    }
    x += dx;
    y += dy;
  }
  return true;
};
