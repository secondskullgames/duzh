import { getUnoccupiedLocations } from './MapGenerationUtils';
import GeneratedMapModel from '../../schemas/GeneratedMapModel';
import TileFactory from '../../tiles/TileFactory';
import TileType from '../../schemas/TileType';
import MapInstance from '../MapInstance';
import { checkNotNull } from '@main/utils/preconditions';
import { Feature } from '@main/utils/features';

abstract class AbstractMapGenerator {
  protected constructor(private readonly tileFactory: TileFactory) {}

  generateMap = async (
    mapModel: GeneratedMapModel,
    tileSetId: string
  ): Promise<MapInstance> => {
    const { tileFactory } = this;
    const { width, height, levelNumber } = mapModel;

    const tileTypes = this._generateTiles(width, height, levelNumber);
    const tileSet = await tileFactory.getTileSet(tileSetId);

    const unoccupiedLocations = getUnoccupiedLocations(tileTypes, ['FLOOR'], []);
    const stairsLocation = unoccupiedLocations.shift()!;
    tileTypes[stairsLocation.y][stairsLocation.x] = 'STAIRS_DOWN';

    const tiles: TileType[][] = [];
    for (let y = 0; y < tileTypes.length; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < tileTypes[y].length; x++) {
        const tileType = tileTypes[y][x];
        row.push(tileType);
      }

      tiles.push(row);
    }

    const candidateLocations = getUnoccupiedLocations(tiles, ['FLOOR'], []);
    const startingCoordinates = checkNotNull(candidateLocations.shift());

    if (Feature.isEnabled(Feature.STAIRS_UP)) {
      tiles[startingCoordinates.y][startingCoordinates.x] = 'STAIRS_UP';
    }

    const map = new MapInstance({
      width,
      height,
      levelNumber,
      startingCoordinates,
      music: null,
      fogParams: mapModel.fogOfWar
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
    const iterations = 10;
    for (let iteration = 1; iteration <= iterations; iteration++) {
      let tiles;
      try {
        tiles = this.generateTiles(width, height);
      } catch (e) {
        continue;
      }
      const isValid = this._validateTiles(tiles);
      if (isValid) {
        return tiles;
      } else {
        // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
            console.warn("Invalid map: can't place a wall at the top of the map");
            return false;
          }
          const oneUp = tiles[y - 1][x];
          const twoUp = tiles[y - 2][x];
          if (floorTypes.includes(oneUp)) {
            // continue, can't place a wall directly below a floor
            // (because we have to show the top of the wall above it)
          } else if (wallTypes.includes(oneUp)) {
            if (twoUp !== 'WALL_TOP' && twoUp !== 'NONE') {
              // eslint-disable-next-line no-console
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

export default AbstractMapGenerator;
