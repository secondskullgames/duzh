import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { checkState } from './preconditions';
import Unit from '../units/Unit';

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

export const areStrictlyAdjacent = (first: Unit, second: Unit) => {
  const { dx, dy } = Coordinates.difference(first.getCoordinates(), second.getCoordinates());
  return ([-1,0,1].includes(dx))
    && ([-1,0,1].includes(dy))
    && !(dx === 0 && dy === 0);
};
