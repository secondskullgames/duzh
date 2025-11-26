import { GeneratedMapModel, TileType, UnitModel } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Feature } from '@duzh/features';
import { Grid, MultiGrid } from '@duzh/geometry';
import { MapTemplate } from './MapTemplate.js';
import { getUnoccupiedLocations } from './utils.js';
import { ObjectTemplate } from './ObjectTemplate.js';

/**
 * TODO - OOP is a mess here but we'll fix it later
 */
export abstract class AbstractMapGenerator {
  protected constructor() {}

  generateMap = async (model: GeneratedMapModel): Promise<MapTemplate> => {
    const { width, height, levelNumber } = model;

    const tiles = this._generateTiles(width, height, levelNumber);

    const unoccupiedLocations = getUnoccupiedLocations(tiles, [TileType.FLOOR], []);
    const stairsLocation = unoccupiedLocations.shift()!;
    tiles.put(stairsLocation, TileType.STAIRS_DOWN);

    const candidateLocations = getUnoccupiedLocations(tiles, [TileType.FLOOR], []);
    const startingCoordinates = checkNotNull(candidateLocations.shift());

    if (Feature.isEnabled(Feature.STAIRS_UP)) {
      tiles.put(startingCoordinates, TileType.STAIRS_UP);
    }

    return {
      id: model.id,
      width,
      height,
      levelNumber,
      tiles,
      tileSet: model.tileSet,
      units: new Grid<UnitModel>({ width, height }),
      objects: new MultiGrid<ObjectTemplate>({ width, height }),
      startingCoordinates,
      fogParams: model.fogOfWar,
      music: null
    };
  };

  protected abstract generateTiles(width: number, height: number): Grid<TileType>;

  private _generateTiles = (
    width: number,
    height: number,
    level: number
  ): Grid<TileType> => {
    const iterations = 100;
    for (let iteration = 1; iteration <= iterations; iteration++) {
      let tiles;
      try {
        tiles = this.generateTiles(width, height);
      } catch {
        continue;
      }
      const isValid = this._validateTiles(tiles);
      if (isValid) {
        return tiles;
      } else {
        console.error(
          `Generated invalid tiles for level ${level}, regenerating (iteration=${iteration})`
        );
        //console.error(`Generated invalid tiles for level ${level}, won't regenerate`);
        //return map;
      }
    }
    throw new Error(`Failed to generate map in ${iterations} iterations`);
  };

  /**
   * Verify that:
   * - wall placement is correct
   *
   * Frankly, this is a hack and it would be far better to have an algorithm which is mathematically provable
   * to generate the characteristics we want on a consistent basis.  But this is easier and should prevent regressions
   *
   * TODO: This used to include a check that all rooms were connected, but that relied on setting `rooms` explicitly
   * which we are no longer doing.
   */
  private _validateTiles = (tiles: Grid<TileType>): boolean =>
    this._validateWallPlacement(tiles);

  /**
   * Validate that walls are placed correctly:
   * they can't be at the very top of the map, and they must have a "wall top" tile above them
   */
  private _validateWallPlacement = (tiles: Grid<TileType>): boolean => {
    const floorTypes = ['FLOOR', 'FLOOR_HALL'];
    const wallTypes = ['WALL', 'WALL_HALL'];
    const { width, height } = tiles;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = checkNotNull(tiles.get({ x, y }));
        if (floorTypes.includes(tileType)) {
          if (y < 2) {
            // can't place a wall at the top of the map because... reasons

            console.warn("Invalid map: can't place a wall at the top of the map");
            return false;
          }
          const oneUp = checkNotNull(tiles.get({ x, y: y - 1 }));
          const twoUp = checkNotNull(tiles.get({ x, y: y - 2 }));

          if (floorTypes.includes(oneUp)) {
            // continue, can't place a wall directly below a floor
            // (because we have to show the top of the wall above it)
          } else if (wallTypes.includes(oneUp)) {
            if (twoUp !== TileType.WALL_TOP && twoUp !== TileType.NONE) {
              console.warn("Invalid map: can't show a wall without a tile for its top");
              return false;
            }
          }
        }
      }
    }
    return true;
  };
}
