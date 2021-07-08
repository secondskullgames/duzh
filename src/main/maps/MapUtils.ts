import TileSet from '../types/TileSet';
import { Coordinates, Rect, Tile } from '../types/types';
import { sortBy } from '../utils/ArrayUtils';
import { TileType } from '../types/types';
import { randChoice } from '../utils/random';

/**
 * @return `numToChoose` random points from `tiles`, whose tile is in `allowedTileTypes`,
 *         which do not collide with `occupiedLocations`
 */
function pickUnoccupiedLocations(
  tiles: TileType[][],
  allowedTileTypes: TileType[],
  occupiedLocations: Coordinates[],
  numToChoose: number
): Coordinates[] {
  const unoccupiedLocations: Coordinates[] = [];
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (allowedTileTypes.indexOf(tiles[y][x]) !== -1) {
        if (occupiedLocations.filter(loc => coordinatesEquals(loc, { x, y })).length === 0) {
          unoccupiedLocations.push({ x, y });
        }
      }
    }
  }

  const chosenLocations: Coordinates[] = [];
  for (let i = 0; i < numToChoose; i++) {
    if (unoccupiedLocations.length > 0) {
      sortBy(unoccupiedLocations, ({ x, y }) => -1 * Math.min(...chosenLocations.map(loc => hypotenuse(loc, { x, y }))));
      const index = 0;
      const { x, y } = unoccupiedLocations[index];
      chosenLocations.push({ x, y });
      occupiedLocations.push({ x, y });
      unoccupiedLocations.splice(index, 1);
    }
  }
  return chosenLocations;
}

function coordinatesEquals(first: Coordinates, second: Coordinates): boolean {
  return (first.x === second.x && first.y === second.y);
}

function contains(rect: Rect, coordinates: Coordinates): boolean {
  return coordinates.x >= rect.left
    && coordinates.x < (rect.left + rect.width)
    && coordinates.y >= rect.top
    && coordinates.y < (rect.top + rect.height);
}

function manhattanDistance(first: Coordinates, second: Coordinates): number {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

function hypotenuse(first: Coordinates, second: Coordinates): number {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  return ((dx * dx) + (dy * dy)) ** 0.5;
}

function civDistance(first: Coordinates, second: Coordinates): number {
  const dx = Math.abs(first.x - second.x);
  const dy = Math.abs(first.y - second.y);
  return Math.max(dx, dy) + Math.min(dx, dy)/2;
}

function isAdjacent(first: Coordinates, second: Coordinates): boolean {
  const dx = Math.abs(first.x - second.x);
  const dy = Math.abs(first.y - second.y);
  return (dx === 0 && (dy === -1 || dy === 1)) || (dy === 0 && (dx === -1 || dx === 1));
}

function isTileRevealed({ x, y }: Coordinates) {
  if (jwb.DEBUG) {
    return true;
  }

  return jwb.state.getMap().revealedTiles.some(tile => coordinatesEquals({ x, y }, tile));
}

function isBlocking(tileType: TileType) {
  switch (tileType) {
    case TileType.FLOOR:
    case TileType.FLOOR_HALL:
    case TileType.STAIRS_DOWN:
      return false;
    default:
      return true;
  }
}

function createTile(type: TileType, tileSet: TileSet): Tile {
  return {
    type,
    sprite: randChoice(tileSet[type]!!),
    isBlocking: isBlocking(type)
  }
}

function areAdjacent(first: Rect, second: Rect, minBorderLength: number): boolean {
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
}

export {
  areAdjacent,
  civDistance,
  contains,
  coordinatesEquals,
  createTile,
  hypotenuse,
  isAdjacent,
  isBlocking,
  isTileRevealed,
  manhattanDistance,
  pickUnoccupiedLocations
};
