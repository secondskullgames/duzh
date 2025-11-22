import Tile from '../../tiles/Tile';
import { TileType } from '@models/TileType';
import { Coordinates } from '@lib/geometry/Coordinates';
import { shuffle } from '@lib/utils/random';
import Grid from '@lib/geometry/Grid';

export const getUnoccupiedLocations = (
  tiles: Grid<Tile> | Grid<TileType>,
  allowedTileTypes: TileType[],
  occupiedLocations: Coordinates[]
): Coordinates[] => {
  const unoccupiedLocations: Coordinates[] = [];

  const { width, height } = tiles;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles.get({ x, y });
      if (tile) {
        const tileType =
          typeof tile === 'object' ? (tile as Tile).getTileType() : (tile as TileType);

        if (allowedTileTypes.includes(tileType)) {
          if (
            !occupiedLocations.find(coordinates =>
              Coordinates.equals(coordinates, { x, y })
            )
          ) {
            unoccupiedLocations.push({ x, y });
          }
        }
      }
    }
  }

  shuffle(unoccupiedLocations);
  return unoccupiedLocations;
};
