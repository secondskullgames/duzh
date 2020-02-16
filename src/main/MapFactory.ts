import { randChoice, randInt } from './utils/RandomUtils';
import SpriteFactory from './SpriteFactory';
import Unit from './classes/Unit';
import MapSupplier, { createMap } from './classes/MapSupplier';
import MapItem from './classes/MapItem';
import ItemFactory from './ItemFactory';
import UnitClasses from './UnitClasses';
import { Tiles } from './types';
import UnitClass from './classes/UnitClass';
import DungeonGenerator from './classes/DungeonGenerator';

const MIN_ROOM_DIMENSION = 6;
const MAX_ROOM_DIMENSION = 9;
const MIN_ROOM_PADDING = 2;

const FIXED_MAPS = [
  () => _mapFromAscii(`
              ###########
              #.........#
              #....U....#               
              #.....................
              #.........#          .
              ###.#######          .
                 .                 .
#############      .                 .
#...........#      .           ######.#####
#...........#      .           #..........#
#....@......#      .           #...U....>.#
#...................           #..........#
#...........#                  #.....U....#
#......U....#                  ############
#############
`, 1),
  () => _mapFromAscii(`
###########################################
#.........................................#
#...............U............U............#
#.........................................#
#...........####################......U...#
#...........#                  #..........#
#...@.......#                  #..........#
#...........#                  #..........#
#...........#                  ############
#############
`, 2)
];

/**
 * @param {!int} level
 * @param {!int} width
 * @param {!int} height
 * @param {!int} numEnemies
 * @param {!int} numItems
 */
function randomMap(level, width, height, numEnemies, numItems): MapSupplier {
  const itemSupplier = ({ x, y }): MapItem => {
    switch (randInt(0, 4)) {
      case 0:
        return {
          x,
          y,
          char: 'S',
          sprite: SpriteFactory.MAP_SWORD(),
          inventoryItem: () => ItemFactory.createSword(6)
        };
      case 1:
        return {
          x,
          y,
          char: 'K',
          sprite: SpriteFactory.MAP_SCROLL(),
          inventoryItem: () => ItemFactory.createScrollOfFloorFire(200)
        };
      default:
        return {
          x,
          y,
          char: 'P',
          sprite: SpriteFactory.MAP_POTION(),
          inventoryItem: () => ItemFactory.createPotion(50)
        };
    }
  };

  const enemyUnitSupplier = ({ x, y }, level) => {
    const candidates = UnitClasses.getEnemyClasses()
      .filter(unitClass => unitClass.minLevel <= level)
      .filter(unitClass => unitClass.maxLevel >= level);

    const unitClass = randChoice(candidates);
    return new Unit(unitClass, unitClass.name, level, { x, y });
  };

  return new DungeonGenerator(MIN_ROOM_DIMENSION, MAX_ROOM_DIMENSION, MIN_ROOM_PADDING).generateDungeon(level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier);
}

/**
 * @param {string} ascii
 * @param {int} level
 * @private
 */
function _mapFromAscii(ascii, level) {
  const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

  const tiles = [];
  /**
   * @type {?Coordinates}
   */
  let playerUnitLocation = null;
  const enemyUnitLocations = [];
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const c = line[x];
      let tile = Object.values(Tiles).filter(t => t.char === c)[0] || null;
      if (!tile) {
        if (c === '@') {
          playerUnitLocation = { x, y };
          tile = Tiles.FLOOR;
        } else if (c === 'U') {
          enemyUnitLocations.push({ x, y });
          tile = Tiles.FLOOR;
        } else {
          tile = Tiles.NONE;
        }
      }
      tiles[y] = tiles[y] || [];
      tiles[y][x] = tile;
    }
  }

  const width = tiles.map(row => row.length).reduce((a, b) => Math.max(a, b)) + 1;
  const height = tiles.length;

  return {
    level,
    width,
    height,
    tiles,
    rooms: [], // TODO
    playerUnitLocation,
    enemyUnitLocations,
    enemyUnitSupplier: ({ x, y }) => new Unit(UnitClasses.ENEMY_HUMAN_BLUE, 'enemy_blue', level, { x, y }),
    itemLocations: [],
    itemSupplier: () => {
      throw 'unsupported';
    }
  };
}

export default { randomMap, FIXED_MAPS };
