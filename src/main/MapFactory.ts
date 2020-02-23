import Unit from './classes/Unit';
import MapSupplier from './classes/MapSupplier';
import ItemFactory from './ItemFactory';
import UnitClasses from './UnitClasses';
import Tiles from './types/Tiles';
import { Coordinates } from './types';
import DungeonGenerator from './classes/DungeonGenerator';
import UnitFactory from './UnitFactory';
import Tile from './types/Tile';

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

function createRandomMap(level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier {
  const dungeonGenerator = new DungeonGenerator(
    MIN_ROOM_DIMENSION,
    MAX_ROOM_DIMENSION,
    MIN_ROOM_PADDING
  );
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

function _mapFromAscii(ascii: string, level: number): MapSupplier {
  const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

  const tiles: Tile[][] = [];
  let playerUnitLocation: (Coordinates | null) = null;
  const enemyUnitLocations: Coordinates[] = [];
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

  if (!playerUnitLocation) {
    throw 'No player unit location';
  }

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

export default { randomMap: createRandomMap, FIXED_MAPS };
