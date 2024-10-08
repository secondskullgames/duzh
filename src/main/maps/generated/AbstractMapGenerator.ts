import { getUnoccupiedLocations } from './MapGenerationUtils';
import TileFactory from '../../tiles/TileFactory';
import MapInstance from '../MapInstance';
import { TileType } from '@models/TileType';
import { GeneratedMapModel } from '@models/GeneratedMapModel';
import { checkNotNull } from '@lib/utils/preconditions';
import { Feature } from '@main/utils/features';

export abstract class AbstractMapGenerator {
  protected constructor(private readonly tileFactory: TileFactory) {}

  generateMap = async (
    model: GeneratedMapModel,
    tileSetId: string
  ): Promise<MapInstance> => {
    const { tileFactory } = this;
    const { id, width, height, levelNumber } = model;

    const tileTypes = this._generateTiles(width, height, levelNumber);
    const tileSet = await tileFactory.getTileSet(tileSetId);

    const unoccupiedLocations = getUnoccupiedLocations(tileTypes, [TileType.FLOOR], []);
    const stairsLocation = unoccupiedLocations.shift()!;
    tileTypes[stairsLocation.y][stairsLocation.x] = TileType.STAIRS_DOWN;

    const tiles: TileType[][] = [];
    for (let y = 0; y < tileTypes.length; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < tileTypes[y].length; x++) {
        const tileType = tileTypes[y][x];
        row.push(tileType);
      }

      tiles.push(row);
    }

    const candidateLocations = getUnoccupiedLocations(tiles, [TileType.FLOOR], []);
    const startingCoordinates = checkNotNull(candidateLocations.shift());

    if (Feature.isEnabled(Feature.STAIRS_UP)) {
      tiles[startingCoordinates.y][startingCoordinates.x] = TileType.STAIRS_UP;
    }

    const map = new MapInstance({
      id,
      width,
      height,
      levelNumber,
      startingCoordinates,
      music: null,
      fogParams: model.fogOfWar
    });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tileFactory.createTile(
          {
            tileType: tiles[y][x],
            tileSet
          },
          { x, y },
          map
        );
        map.addTile(tile);
      }
    }

    return map;
  };

  protected abstract generateTiles(width: number, height: number): TileType[][];

  private _generateTiles = (
    width: number,
    height: number,
    level: number
  ): TileType[][] => {
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
  private _validateTiles = (tiles: TileType[][]): boolean =>
    this._validateWallPlacement(tiles);

  /**
   * Validate that walls are placed correctly:
   * they can't be at the very top of the map, and they must have a "wall top" tile above them
   */
  private _validateWallPlacement = (tiles: TileType[][]): boolean => {
    const floorTypes = ['FLOOR', 'FLOOR_HALL'];
    const wallTypes = ['WALL', 'WALL_HALL'];
    const width = tiles[0].length;
    const height = tiles.length;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = tiles[y][x];
        if (floorTypes.includes(tileType)) {
          if (y < 2) {
            // can't place a wall at the top of the map because... reasons

            console.warn("Invalid map: can't place a wall at the top of the map");
            return false;
          }
          const oneUp = tiles[y - 1][x];
          const twoUp = tiles[y - 2][x];
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
