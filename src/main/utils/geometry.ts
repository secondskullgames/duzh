import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { checkState } from './preconditions';

const pointAt = (first: Coordinates, second: Coordinates): Direction => {
  checkState(!Coordinates.equals(first, second));
  const dx = Math.sign(second.x - first.x);
  const dy = Math.sign(second.y - first.y);
  if (dx !== 0) {
    return { dx, dy: 0 } as Direction;
  } else {
    return { dx: 0, dy } as Direction;
  }
};

export {
  pointAt
};
