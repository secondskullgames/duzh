import { Offsets } from '@lib/geometry/Offsets';

export type Coordinates = Readonly<{
  x: number;
  y: number;
}>;

export namespace Coordinates {
  export const equals = (first: Coordinates, second: Coordinates): boolean =>
    first.x === second.x && first.y === second.y;

  export const plus = ({ x, y }: Coordinates, { dx, dy }: Offsets): Coordinates => ({
    x: x + dx,
    y: y + dy
  });

  export const difference = (first: Coordinates, second: Coordinates): Offsets => ({
    dx: second.x - first.x,
    dy: second.y - first.y
  });
}
