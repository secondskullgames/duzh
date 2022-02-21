import EquipmentModel from '../../equipment/EquipmentModel';
import ItemModel from '../../items/ItemModel';
import Coordinates from '../../geometry/Coordinates';
import Tile from '../../tiles/Tile';
import TileSet from '../../tiles/TileSet';
import TileType from '../../tiles/TileType';
import UnitClass from '../../units/UnitClass';
import { average, minBy } from '../../utils/arrays';
import Pathfinder from '../../geometry/Pathfinder';
import { checkState } from '../../utils/preconditions';
import GeneratedMapBuilder from './GeneratedMapBuilder';
import { hypotenuse, pickUnoccupiedLocations } from '../MapUtils';
import EmptyMap from './EmptyMap';
import TileEligibilityChecker from './TileEligibilityChecker';

abstract class AbstractMapGenerator {
  protected readonly tileSet: TileSet;

  protected constructor(tileSet: TileSet) {
    this.tileSet = tileSet;
  }

  generateMap = (
    level: number,
    width: number,
    height: number,
    numEnemies: number,
    numItems: number,
    enemyUnitClasses: UnitClass[],
    equipmentClasses: EquipmentModel[],
    itemClasses: ItemModel[]
  ): GeneratedMapBuilder => {
    const map = this._generateEmptyMap(width, height, level);
    const tileTypes = map.tiles;

    const [stairsLocation] = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [], 1);
    tileTypes[stairsLocation.y][stairsLocation.x] = 'STAIRS_DOWN';
    const enemyUnitLocations = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [stairsLocation], numEnemies);
    const [playerUnitLocation] = this._pickPlayerLocation(tileTypes, [stairsLocation, ...enemyUnitLocations]);
    const itemLocations = pickUnoccupiedLocations(tileTypes, ['FLOOR'], [stairsLocation, playerUnitLocation, ...enemyUnitLocations], numItems);

    const tiles = tileTypes.map((row: TileType[]) =>
      row.map(tileType => Tile.create(tileType, this.tileSet))
    );

    return new GeneratedMapBuilder({
      level,
      width,
      height,
      tiles,
      rooms: map.rooms,
      playerUnitLocation,
      enemyUnitLocations,
      enemyUnitClasses,
      itemLocations,
      equipmentClasses,
      itemClasses
    });
  };

  protected abstract generateTiles(width: number, height: number): EmptyMap;

  private _generateEmptyMap = (width: number, height: number, level: number): EmptyMap => {
    const iterations = 100;
    for (let iteration = 1; iteration <= iterations; iteration++) {
      const t1 = new Date().getTime();
      const map = this.generateTiles(width, height);
      const isValid = this._validateTiles(map);
      const t2 = new Date().getTime();
      console.debug(`Generated map tiles for level ${level} in ${t2 - t1} ms`);
      if (isValid) {
        return map;
      } else {
        //console.error(`Generated invalid tiles for level ${level}, regenerating`);
        console.error(`Generated invalid tiles for level ${level}, won't regenerate`);
        return map;
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
   * - all rooms can be connected
   * - wall placement is correct
   *
   * Frankly, this is a hack and it would be far better to have an algorithm which is mathematically provable
   * to generate the characteristics we want on a consistent basis.  But this is easier and should prevent regressions
   */
  private _validateTiles = (map: EmptyMap): boolean =>
    this._validateRoomConnectivity(map) && this._validateWallPlacement(map);

  /**
   * verify that every room is reachable from every other room
   */
  private _validateRoomConnectivity = (section: EmptyMap): boolean => {
    const { rooms } = section;
    const roomCenters: Coordinates[] = rooms.map(room => ({
      x: Math.round(room.left + room.width) / 2,
      y: Math.round(room.top + room.height) / 2
    }));
    const tileChecker = new TileEligibilityChecker();
    const unblockedTiles: Coordinates[] = [];
    for (let y = 0; y < section.height; y++) {
      for (let x = 0; x < section.width; x++) {
        if (!tileChecker.isBlocked({ x, y }, section, [])) {
          unblockedTiles.push({ x, y });
        }
      }
    }

    // check that every room is reachable from every other room
    const pathfinder: Pathfinder = new Pathfinder(() => 1);
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const path = pathfinder.findPath(roomCenters[i], roomCenters[j], unblockedTiles);
        if (path.length === 0) {
          console.warn('Invalid map: inaccessible room');
          return false;
        }
      }
    }
    return true;
  };

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
            if (twoUp !== 'WALL_TOP') {
              console.warn('can\'t show a wall without a tile for its top');
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
