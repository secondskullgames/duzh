import EquipmentClass from '../../items/equipment/EquipmentClass';
import ItemClass from '../../items/ItemClass';
import Coordinates from '../../types/Coordinates';
import Tile from '../../types/Tile';
import TileSet from '../../types/TileSet';
import TileType from '../../types/TileType';
import { MapSection } from '../../types/types';
import UnitClass from '../../units/UnitClass';
import { average } from '../../utils/arrays';
import Pathfinder from '../../utils/Pathfinder';
import GeneratedMapBuilder from './GeneratedMapBuilder';
import { hypotenuse, pickUnoccupiedLocations } from '../MapUtils';
import TileEligibilityChecker from './TileEligibilityChecker';

abstract class DungeonGenerator {
  protected readonly tileSet: TileSet;

  protected constructor(tileSet: TileSet) {
    this.tileSet = tileSet;
  }

  generateDungeon = (
    level: number,
    width: number,
    height: number,
    numEnemies: number,
    numItems: number,
    enemyUnitClasses: UnitClass[],
    equipmentClasses: EquipmentClass[],
    itemClasses: ItemClass[]
  ): GeneratedMapBuilder => {
    let section;
    let isValid = false;
    let iterations = 0;
    do {
      const t1 = new Date().getTime();
      section = this.generateTiles(width, height);
      isValid = this._validateSection(section);
      const t2 = new Date().getTime();
      console.log(`Generated dungeon tiles for level ${level} in ${t2 - t1} ms`);
      if (!isValid) {
        console.error(`Generated invalid tiles for level ${level}, regenerating`);
      }
      iterations++;
    } while (!isValid && (iterations < 100));

    const tileTypes = section.tiles;

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
      rooms: section.rooms,
      playerUnitLocation,
      enemyUnitLocations,
      enemyUnitClasses,
      itemLocations,
      equipmentClasses,
      itemClasses
    });
  };

  protected abstract generateTiles(width: number, height: number): MapSection;

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

    console.assert(candidates.length > 0);
    return candidates.sort((a, b) => (b[1] - a[1]))[0];
  };

  /**
   * Verify that:
   * - all rooms can be connected
   * - wall placement is correct
   *   (all floor tiles have either another floor tile, or a wall + wall top directly above them)
   *
   * Frankly, this is a hack and it would be far better to have an algorithm which is mathematically provable
   * to generate the characteristics we want on a consistent basis.  But this is easier and should prevent regressions
   *
   * @return true if the provided `section` is valid
   */
  private _validateSection = (section: MapSection): boolean =>
    this._validateRoomConnectivity(section) && this._validateWallPlacement(section);

  private _validateRoomConnectivity = (section: MapSection): boolean => {
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

    const pathfinder: Pathfinder = new Pathfinder(() => 1);
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const path = pathfinder.findPath(roomCenters[i], roomCenters[j], unblockedTiles);
        if (path.length === 0) {
          return false;
        }
      }
    }
    return true;
  };

  private _validateWallPlacement = (section: MapSection) => {
    const floorTypes = ['FLOOR', 'FLOOR_HALL'];
    const wallTypes = ['WALL', 'WALL_HALL'];
    for (let y = 0; y < section.height; y++) {
      for (let x = 0; x < section.width; x++) {
        const tileType = section.tiles[y][x];
        if (floorTypes.indexOf(tileType) > -1) {
          if (y < 2) {
            return false;
          }
          const oneUp = section.tiles[y - 1][x];
          const twoUp = section.tiles[y - 2][x];
          if (floorTypes.indexOf(oneUp) > -1) {
            // continue
          } else if (wallTypes.indexOf(oneUp) > -1) {
            if (twoUp !== 'WALL_TOP') {
              return false;
            }
          }
        }
      }
    }
    return true;
  };
}

export default DungeonGenerator;
