import Tile from '../../tiles/Tile';
import { TileType } from '@models/TileType';
import Coordinates from '@lib/geometry/Coordinates';
import { shuffle } from '@lib/utils/random';

export const getUnoccupiedLocations = (
  tiles: (Tile | TileType)[][],
  allowedTileTypes: TileType[],
  occupiedLocations: Coordinates[]
): Coordinates[] => {
  const unoccupiedLocations: Coordinates[] = [];

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tileType =
        typeof tiles[y][x] === 'object'
          ? (tiles[y][x] as Tile).getTileType()
          : (tiles[y][x] as TileType);

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
