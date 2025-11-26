import { TileType } from '@duzh/models';
import { Coordinates, Grid } from '@duzh/geometry';
import { shuffle } from '@duzh/utils/random';

export const getUnoccupiedLocations = (
  tiles: Grid<TileType>,
  allowedTileTypes: TileType[],
  occupiedLocations: Coordinates[]
): Coordinates[] => {
  const unoccupiedLocations: Coordinates[] = [];

  const { width, height } = tiles;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileType = tiles.get({ x, y });
      if (tileType) {
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
