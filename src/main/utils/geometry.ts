import MapInstance from '../maps/MapInstance';
import { Coordinates } from '@main/geometry';
import { isBlocked } from '@main/maps/MapUtils';

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
