import Tile from '../../tiles/Tile';
import { getUnoccupiedLocations } from '../MapUtils';
import EmptyMap from './EmptyMap';
import GeneratedMapBuilder from './GeneratedMapBuilder';
import GeneratedMapModel from '../../schemas/GeneratedMapModel';
import TileFactory from '../../tiles/TileFactory';
import ImageFactory from '../../graphics/images/ImageFactory';

type Context = Readonly<{
  imageFactory: ImageFactory
}>;

abstract class AbstractMapGenerator {
  protected constructor() {}

  generateMap = async (
    mapModel: GeneratedMapModel,
    tileSetId: string,
    { imageFactory }: Context
  ): Promise<GeneratedMapBuilder> => {
    const { width, height, levelNumber } = mapModel;

    const map = this._generateEmptyMap(width, height, levelNumber);
    const tileTypes = map.tiles;
    const tileSet = await TileFactory.getTileSet(
      tileSetId,
      { imageFactory }
    );

    const unoccupiedLocations = getUnoccupiedLocations(tileTypes, ['FLOOR'], []);
    const stairsLocation = unoccupiedLocations.shift()!;
    tileTypes[stairsLocation.y][stairsLocation.x] = 'STAIRS_DOWN';

    const tiles: Tile[][] = [];
    for (let y = 0; y < tileTypes.length; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < tileTypes[y].length; x++) {
        const coordinates = { x, y };
        const tileType = tileTypes[y][x];
        const tile = TileFactory.createTile({
          tileType,
          tileSet,
          coordinates
        });
        row.push(tile);
      }

      tiles.push(row);
    }

    return new GeneratedMapBuilder({
      level: mapModel.levelNumber,
      width: mapModel.width,
      height: mapModel.height,
      tiles,
      pointAllocation: mapModel.pointAllocation
    });
  };

  protected abstract generateEmptyMap(width: number, height: number): EmptyMap;

  private _generateEmptyMap = (width: number, height: number, level: number): EmptyMap => {
    const iterations = 10;
    for (let iteration = 1; iteration <= iterations; iteration++) {
      const t1 = new Date().getTime();
      let map;
      try {
        map = this.generateEmptyMap(width, height);
      } catch (e) {
        continue;
      }
      const isValid = this._validateTiles(map);
      const t2 = new Date().getTime();
      console.debug(`Generated map tiles for level ${level} in ${t2 - t1} ms`);
      if (isValid) {
        return map;
      } else {
        console.error(`Generated invalid tiles for level ${level}, regenerating (iteration=${iteration})`);
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
  private _validateTiles = (map: EmptyMap): boolean =>
    this._validateWallPlacement(map);

  /**
   * Validate that walls are placed correctly:
   * they can't be at the very top of the map, and they must have a "wall top" tile above them
   */
  private _validateWallPlacement = (map: EmptyMap): boolean => {
    const floorTypes = ['FLOOR', 'FLOOR_HALL'];
    const wallTypes = ['WALL', 'WALL_HALL'];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tileType = map.tiles[y][x];
        if (floorTypes.includes(tileType)) {
          if (y < 2) {
            // can't place a wall at the top of the map because... reasons
            console.warn('Invalid map: can\'t place a wall at the top of the map');
            return false;
          }
          const oneUp = map.tiles[y - 1][x];
          const twoUp = map.tiles[y - 2][x];
          if (floorTypes.includes(oneUp)) {
            // continue, can't place a wall directly below a floor
            // (because we have to show the top of the wall above it)
          } else if (wallTypes.includes(oneUp)) {
            if (twoUp !== 'WALL_TOP' && twoUp !== 'NONE') {
              console.warn('Invalid map: can\'t show a wall without a tile for its top');
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
