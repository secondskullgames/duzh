import { Rect } from './Rect.js';
import { Coordinates } from './Coordinates.js';

export const areAdjacent = (
  first: Rect,
  second: Rect,
  minBorderLength: number
): boolean => {
  // right-left
  if (first.left + first.width === second.left) {
    const top = Math.max(first.top, second.top);
    const bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
    return bottom - top >= minBorderLength;
  }
  // bottom-top
  if (first.top + first.height === second.top) {
    const left = Math.max(first.left, second.left);
    const right = Math.min(first.left + first.width, second.left + second.width); // exclusive
    return right - left >= minBorderLength;
  }
  // left-right
  if (first.left === second.left + second.width) {
    const top = Math.max(first.top, second.top);
    const bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
    return bottom - top >= minBorderLength;
  }
  // top-bottom
  if (first.top === second.top + second.height) {
    const left = Math.max(first.left, second.left);
    const right = Math.min(first.left + first.width, second.left + second.width); // exclusive
    return right - left >= minBorderLength;
  }

  return false;
};

export const contains = (rect: Rect, coordinates: Coordinates): boolean =>
  coordinates.x >= rect.left &&
  coordinates.x < rect.left + rect.width &&
  coordinates.y >= rect.top &&
  coordinates.y < rect.top + rect.height;
