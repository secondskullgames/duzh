import { TileType } from 'src/gen-schema/tile-type.schema';
import Coordinates from '../geometry/Coordinates';
import Rect from '../geometry/Rect';
import Tile from '../tiles/Tile';
import { shuffle } from '../utils/random';

export const getUnoccupiedLocations = (
  tiles: (Tile | TileType)[][],
  allowedTileTypes: TileType[],
  occupiedLocations: Coordinates[]
): Coordinates[] => {
  const unoccupiedLocations: Coordinates[] = [];

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tileType = tiles[y][x].hasOwnProperty('type')
        ? (tiles[y][x] as Tile).type
        : tiles[y][x] as TileType;
      if (allowedTileTypes.includes(tileType)) {
        if (!occupiedLocations.find(loc => Coordinates.equals(loc, { x, y }))) {
          unoccupiedLocations.push({ x, y });
        }
      }
    }
  }

  shuffle(unoccupiedLocations);
  return unoccupiedLocations;
};

export const contains = (rect: Rect, coordinates: Coordinates): boolean =>
  coordinates.x >= rect.left
  && coordinates.x < (rect.left + rect.width)
  && coordinates.y >= rect.top
  && coordinates.y < (rect.top + rect.height);

export const manhattanDistance = (first: Coordinates, second: Coordinates): number =>
  Math.abs(first.x - second.x) + Math.abs(first.y - second.y);

export const hypotenuse = (first: Coordinates, second: Coordinates): number => {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  return ((dx * dx) + (dy * dy)) ** 0.5;
};

export const civDistance = (first: Coordinates, second: Coordinates): number => {
  const dx = Math.abs(first.x - second.x);
  const dy = Math.abs(first.y - second.y);
  return Math.max(dx, dy) + Math.min(dx, dy) / 2;
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

export const areAdjacent = (first: Rect, second: Rect, minBorderLength: number): boolean => {
  // right-left
  if (first.left + first.width === second.left) {
    const top = Math.max(first.top, second.top);
    const bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
    return (bottom - top) >= minBorderLength;
  }
  // bottom-top
  if (first.top + first.height === second.top) {
    const left = Math.max(first.left, second.left);
    const right = Math.min(first.left + first.width, second.left + second.width); // exclusive
    return (right - left) >= minBorderLength;
  }
  // left-right
  if (first.left === second.left + second.width) {
    const top = Math.max(first.top, second.top);
    const bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
    return (bottom - top) >= minBorderLength;
  }
  // top-bottom
  if (first.top === second.top + second.height) {
    const left = Math.max(first.left, second.left);
    const right = Math.min(first.left + first.width, second.left + second.width); // exclusive
    return (right - left) >= minBorderLength;
  }

  return false;
};
