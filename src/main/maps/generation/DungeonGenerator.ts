import Unit from '../../units/Unit';
import MapSupplier from '../MapSupplier';
import MapItem from '../../items/MapItem';
import { Coordinates, MapSection, TileSet, TileType } from '../../types/types';
import { coordinatesEquals, createTile, hypotenuse, isBlocking, pickUnoccupiedLocations } from '../MapUtils';
import { average } from '../../utils/ArrayUtils';

abstract class DungeonGenerator {
  protected readonly _tileSet: TileSet;

  protected constructor(tileSet: TileSet) {
    this._tileSet = tileSet;
  }

  generateDungeon(
    level: number,
    width: number,
    height: number,
    numEnemies: number,
    enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Unit,
    numItems: number,
    itemSupplier: ({ x, y }: Coordinates, level: number) => MapItem
  ): MapSupplier {
    const t1 = new Date().getTime();
    const section = this.generateTiles(width, height);
    const t2 = new Date().getTime();

    const tileTypes = section.tiles;

    const [stairsLocation] = pickUnoccupiedLocations(tileTypes, [TileType.FLOOR], [], 1);
    tileTypes[stairsLocation.y][stairsLocation.x] = TileType.STAIRS_DOWN;
    const enemyUnitLocations = pickUnoccupiedLocations(tileTypes, [TileType.FLOOR], [stairsLocation], numEnemies);
    const [playerUnitLocation] = this._pickPlayerLocation(tileTypes, [stairsLocation, ...enemyUnitLocations]);
    const itemLocations = pickUnoccupiedLocations(tileTypes, [TileType.FLOOR], [stairsLocation, playerUnitLocation, ...enemyUnitLocations], numItems);

    const tiles = tileTypes.map((row: TileType[]) => {
      return row.map(tileType => createTile(tileType, this._tileSet));
    });

    const t3 = new Date().getTime();
    console.log(`Generated dungeon ${level} in ${t3 - t1} (${t2 - t1}, ${t3 - t2}) ms`);
    return {
      level,
      width,
      height,
      tiles,
      rooms: section.rooms,
      playerUnitLocation,
      enemyUnitLocations,
      enemyUnitSupplier,
      itemLocations,
      itemSupplier
    };
  }

  protected abstract generateTiles(width: number, height: number): MapSection;

  /**
   * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
   */
  private _pickPlayerLocation(tiles: TileType[][], blockedTiles: Coordinates[]) {
    const candidates: [Coordinates, number][] = [];

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (!isBlocking(tiles[y][x]) && !blockedTiles.some(tile => coordinatesEquals(tile, { x, y }))) {
          const tileDistances = blockedTiles.map(blockedTile => hypotenuse({ x, y }, blockedTile));
          candidates.push([{ x, y }, average(tileDistances)]);
        }
      }
    }

    console.assert(candidates.length > 0);
    return candidates.sort((a, b) => (b[1] - a[1]))[0];
  }
}

export default DungeonGenerator;
