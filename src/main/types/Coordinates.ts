interface Coordinates {
  x: number,
  y: number
}

namespace Coordinates {
  export const equals = (first: Coordinates, second: Coordinates) =>
    first.x === second.x && first.y === second.y;
}

export default Coordinates;
