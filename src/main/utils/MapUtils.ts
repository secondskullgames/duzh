import { Coordinates, Rect, Tile } from '../types';
import { sortBy } from './ArrayUtils';

/**
 * @return `numToChoose` random points from `tiles`, whose tile is in `allowedTileTypes`,
 *         which do not collide with `occupiedLocations`
 */
function pickUnoccupiedLocations(
  tiles: Tile[][],
  allowedTileTypes: Tile[],
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

export {
  pickUnoccupiedLocations,
  civDistance,
  manhattanDistance,
  hypotenuse,
  contains,
  coordinatesEquals,
  isAdjacent,
  isTileRevealed
};
