import EquipmentClass from '../../equipment/EquipmentClass';
import ItemClass from '../../items/ItemClass';
import Coordinates from '../../geometry/Coordinates';
import Tile from '../../tiles/Tile';
import TileSet from '../../tiles/TileSet';
import TileType from '../../tiles/TileType';
import UnitClass from '../../units/UnitClass';
import { average, minBy, sum } from '../../utils/arrays';
import { checkState } from '../../utils/preconditions';
import GeneratedMapBuilder from './GeneratedMapBuilder';
import { hypotenuse, pickUnoccupiedLocations } from '../MapUtils';
import EmptyMap from './EmptyMap';
import GeneratedMapClass from './GeneratedMapClass';

type GenerateMapProps = {
  mapClass: GeneratedMapClass,
  enemyUnitClasses: Map<UnitClass, number>,
  equipmentClasses: Map<EquipmentClass, number>,
  itemClasses: Map<ItemClass, number>
};

abstract class AbstractMapGenerator {
  protected readonly tileSet: TileSet;

  protected constructor(tileSet: TileSet) {
    this.tileSet = tileSet;
  }

  generateMap = ({ mapClass, enemyUnitClasses, equipmentClasses, itemClasses }: GenerateMapProps): GeneratedMapBuilder => {
    const { width, height, levelNumber } = mapClass;
    const map = this._generateEmptyMap(width, height, levelNumber);
    const tileTypes = map.tiles;

    const numEnemies = sum([...enemyUnitClasses.values()]);
    const numItems = sum([...equipmentClasses.values(), ...itemClasses.values()]);

    const [stairsLocation] = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [], 1);
    tileTypes[stairsLocation.y][stairsLocation.x] = 'STAIRS_DOWN';
    const enemyUnitLocations = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [stairsLocation], numEnemies);
    const [playerUnitLocation] = this._pickPlayerLocation(tileTypes, [stairsLocation, ...enemyUnitLocations]);
    const itemLocations = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [stairsLocation, playerUnitLocation, ...enemyUnitLocations], numItems);

    const tiles = tileTypes.map((row: TileType[]) =>
      row.map(tileType => Tile.create(tileType, this.tileSet))
    );

    return new GeneratedMapBuilder({
      level: mapClass.levelNumber,
      width: mapClass.width,
      height: mapClass.height,
      tiles,
      playerUnitLocation,
      enemyUnitLocations,
      enemyUnitClasses,
      itemLocations,
      equipmentClasses,
      itemClasses
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
   * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
   */
  private _pickPlayerLocation = (tiles: TileType[][], blockedTiles: Coordinates[]) => {
    const candidates: [Coordinates, number][] = [];

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (!TileType.isBlocking(tiles[y][x]) && !blockedTiles.some(tile => Coordinates.equals(tile, { x, y }))) {
          const tileDistances = blockedTiles.map(blockedTile => hypotenuse({ x, y }, blockedTile));
          candidates.push([{ x, y }, average(tileDistances)]);
        }
      }
    }

    checkState(candidates.length > 0);
    return minBy(candidates, ([coordinates, averageDistance]) => averageDistance);
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
