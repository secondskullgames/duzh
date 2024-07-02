import { Coordinates } from '@lib/geometry/Coordinates';

export type Rect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export namespace Rect {
  export const containsPoint = (rect: Rect, point: { x: number; y: number }): boolean => {
    return (
      point.x >= rect.left &&
      point.x <= rect.left + rect.width &&
      point.y >= rect.top &&
      point.y <= rect.top + rect.height
    );
  };

  export const getTopLeft = (rect: Rect): Coordinates => ({
    x: rect.left,
    y: rect.top
  });
}
