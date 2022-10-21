import Offsets from './Offsets';


interface Coordinates {
  x: number,
  y: number
}

namespace Coordinates {
  export const equals = (first: Coordinates, second: Coordinates) =>
    first.x === second.x && first.y === second.y;

  export const plus = ({ x, y }: Coordinates, { dx, dy }: Offsets) => ({
    x: x + dx,
    y: y + dy
  });

  export const difference = (first: Coordinates, second: Coordinates): Offsets => ({
    dx: second.x - first.x,
    dy: second.y - first.y
  });
}

export default Coordinates;
